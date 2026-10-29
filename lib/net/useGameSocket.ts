"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { InputState } from "../game/controls";
import {
  SLOT_COLORS,
  SLOT_NAMES,
  type PlayerSlot,
  type PlayerState,
  type RoomState,
  type ControllerInputPayload,
} from "./protocol";

export type UseGameSocketOptions = {
  onControllerInput?: (payload: ControllerInputPayload) => void;
  onControllerLeft?: (payload: { playerId: string; slot: number }) => void;
  onRoomEnded?: () => void;
};

const HOST_PEER_PREFIX = "slide-room-v1-";
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
}

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  },
};

export function useGameSocket(options: UseGameSocketOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const peerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connectionsRef = useRef<Map<string, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controllerConnRef = useRef<any>(null);

  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [myPlayer, setMyPlayer] = useState<PlayerState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lanUrl, setLanUrl] = useState<string>("");

  const slotsRef = useRef<(PlayerState | null)[]>([null, null, null, null]);
  const roomStateRef = useRef<RoomState | null>(null);
  roomStateRef.current = roomState;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    return () => {
      // Cleanup all connections and peer instance on unmount
      for (const conn of connectionsRef.current.values()) {
        try {
          conn.close();
        } catch {
          // ignore
        }
      }
      connectionsRef.current.clear();

      if (controllerConnRef.current) {
        try {
          controllerConnRef.current.close();
        } catch {
          // ignore
        }
        controllerConnRef.current = null;
      }

      if (peerRef.current) {
        try {
          peerRef.current.destroy();
        } catch {
          // ignore
        }
        peerRef.current = null;
      }
    };
  }, []);

  const broadcastRoomState = useCallback((state: RoomState) => {
    setRoomState(state);
    for (const conn of connectionsRef.current.values()) {
      try {
        conn.send({ type: "room:state", room: state });
      } catch {
        // ignore
      }
    }
  }, []);

  const createRoom = useCallback(async () => {
    if (typeof window === "undefined") return;
    setError(null);

    try {
      const { default: Peer } = await import("peerjs");

      const attemptCreate = (retries = 3) => {
        const code = generateCode();
        const peerId = `${HOST_PEER_PREFIX}${code}`;

        const peer = new Peer(peerId, PEER_CONFIG);
        peerRef.current = peer;

        peer.on("open", () => {
          setIsHost(true);
          setConnected(true);
          const initialRoom: RoomState = {
            code,
            started: false,
            players: [],
          };
          setRoomState(initialRoom);

          const joinUrl = `${window.location.origin}/join`;
          setLanUrl(joinUrl);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        peer.on("connection", (conn: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          conn.on("data", (data: any) => {
            if (data?.type === "join") {
              const currentSlots = slotsRef.current;
              let freeSlotIndex = -1;
              for (let i = 0; i < 4; i++) {
                if (currentSlots[i] === null) {
                  freeSlotIndex = i;
                  break;
                }
              }

              if (freeSlotIndex === -1) {
                conn.send({
                  type: "error",
                  message: "Room is full (max 4 players).",
                });
                setTimeout(() => conn.close(), 100);
                return;
              }

              const slot = freeSlotIndex as PlayerSlot;
              const player: PlayerState = {
                id: conn.peer,
                slot,
                color: SLOT_COLORS[slot],
                name: SLOT_NAMES[slot],
                connected: true,
              };

              currentSlots[slot] = player;
              connectionsRef.current.set(conn.peer, conn);

              const activePlayers = currentSlots.filter(
                (p): p is PlayerState => p !== null,
              );
              const nextState: RoomState = {
                code,
                started: roomStateRef.current?.started ?? false,
                players: activePlayers,
              };

              conn.send({ type: "assign", player, room: nextState });
              broadcastRoomState(nextState);

              if (nextState.started) {
                conn.send({ type: "room:started" });
              }
            } else if (data?.type === "input") {
              optionsRef.current.onControllerInput?.({
                playerId: conn.peer,
                input: data.input,
              });
            }
          });

          const handleDisconnect = () => {
            connectionsRef.current.delete(conn.peer);
            const currentSlots = slotsRef.current;
            let removedSlot: number | null = null;

            for (let i = 0; i < 4; i++) {
              if (currentSlots[i]?.id === conn.peer) {
                removedSlot = currentSlots[i]?.slot ?? null;
                currentSlots[i] = null;
                break;
              }
            }

            if (removedSlot !== null) {
              optionsRef.current.onControllerLeft?.({
                playerId: conn.peer,
                slot: removedSlot,
              });

              const activePlayers = currentSlots.filter(
                (p): p is PlayerState => p !== null,
              );
              const nextState: RoomState = {
                code,
                started: roomStateRef.current?.started ?? false,
                players: activePlayers,
              };
              broadcastRoomState(nextState);
            }
          };

          conn.on("close", handleDisconnect);
          conn.on("error", handleDisconnect);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        peer.on("error", (err: any) => {
          if (err?.type === "unavailable-id" && retries > 0) {
            try {
              peer.destroy();
            } catch {
              // ignore
            }
            attemptCreate(retries - 1);
          } else {
            setError(err?.message || "Failed to initialize host room");
            setConnected(false);
          }
        });
      };

      attemptCreate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "WebRTC not supported");
    }
  }, [broadcastRoomState]);

  const joinRoom = useCallback(async (code: string): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    setError(null);

    const normCode = code.trim().toUpperCase();
    if (normCode.length !== 4) {
      setError("Please enter a valid 4-letter code");
      return false;
    }

    try {
      const { default: Peer } = await import("peerjs");

      return new Promise<boolean>((resolve) => {
        const peer = new Peer(PEER_CONFIG);
        peerRef.current = peer;

        let hasResolved = false;

        const timeout = setTimeout(() => {
          if (!hasResolved) {
            hasResolved = true;
            setError("Connection timed out. Check the 4-letter code.");
            resolve(false);
          }
        }, 8000);

        peer.on("open", () => {
          const targetHostId = `${HOST_PEER_PREFIX}${normCode}`;
          const conn = peer.connect(targetHostId, { reliable: true });
          controllerConnRef.current = conn;

          conn.on("open", () => {
            setConnected(true);
            conn.send({ type: "join" });
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          conn.on("data", (data: any) => {
            if (data?.type === "assign") {
              setMyPlayer(data.player);
              if (data.room) {
                setRoomState(data.room);
              }
              clearTimeout(timeout);
              if (!hasResolved) {
                hasResolved = true;
                resolve(true);
              }
            } else if (data?.type === "room:state") {
              setRoomState(data.room);
            } else if (data?.type === "room:started") {
              setRoomState((prev) =>
                prev ? { ...prev, started: true } : prev,
              );
            } else if (data?.type === "error") {
              setError(data.message || "Failed to join room");
              clearTimeout(timeout);
              if (!hasResolved) {
                hasResolved = true;
                resolve(false);
              }
            }
          });

          conn.on("close", () => {
            setConnected(false);
            optionsRef.current.onRoomEnded?.();
          });

          conn.on("error", (err) => {
            setError(err?.message || "Connection error");
            clearTimeout(timeout);
            if (!hasResolved) {
              hasResolved = true;
              resolve(false);
            }
          });
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        peer.on("error", (err: any) => {
          setError(
            err?.type === "peer-unavailable"
              ? "Room not found. Check the code."
              : err?.message || "Network error",
          );
          clearTimeout(timeout);
          if (!hasResolved) {
            hasResolved = true;
            resolve(false);
          }
        });
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "WebRTC not supported");
      return false;
    }
  }, []);

  const startGame = useCallback(() => {
    if (!isHost) return;
    const currentState = roomStateRef.current;
    if (currentState) {
      const nextState = { ...currentState, started: true };
      broadcastRoomState(nextState);
      for (const conn of connectionsRef.current.values()) {
        try {
          conn.send({ type: "room:started" });
        } catch {
          // ignore
        }
      }
    }
  }, [isHost, broadcastRoomState]);

  const sendInput = useCallback((input: InputState) => {
    const conn = controllerConnRef.current;
    if (conn && conn.open) {
      try {
        conn.send({ type: "input", input });
      } catch {
        // ignore
      }
    }
  }, []);

  return {
    socket: null,
    connected,
    roomState,
    myPlayer,
    isHost,
    error,
    lanUrl,
    createRoom,
    joinRoom,
    startGame,
    sendInput,
  };
}
