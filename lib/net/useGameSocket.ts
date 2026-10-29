"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { InputState } from "../game/controls";
import {
  type PlayerState,
  type RoomState,
  type ControllerInputPayload,
} from "./protocol";

export type UseGameSocketOptions = {
  onControllerInput?: (payload: ControllerInputPayload) => void;
  onControllerLeft?: (payload: { playerId: string; slot: number }) => void;
  onRoomEnded?: () => void;
};

export function useGameSocket(options: UseGameSocketOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socketRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [myPlayer, setMyPlayer] = useState<PlayerState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lanUrl, setLanUrl] = useState<string>("");

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const getSocket = useCallback(async () => {
    if (socketRef.current) return socketRef.current;
    const { io } = await import("socket.io-client");
    const socket = io(window.location.origin, { path: "/socket.io" });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("room:state", (state: RoomState) => setRoomState(state));
    socket.on("room:ended", () => {
      setConnected(false);
      optionsRef.current.onRoomEnded?.();
    });
    socket.on("room:started", () => {
      setRoomState((prev) => (prev ? { ...prev, started: true } : prev));
    });
    socket.on(
      "controller:input",
      (payload: ControllerInputPayload) => {
        optionsRef.current.onControllerInput?.(payload);
      },
    );
    socket.on(
      "controller:left",
      (payload: { playerId: string; slot: number }) => {
        optionsRef.current.onControllerLeft?.(payload);
      },
    );

    return socket;
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const createRoom = useCallback(async () => {
    if (typeof window === "undefined") return;
    setError(null);
    const socket = await getSocket();
    socket.emit(
      "host:create",
      (res: { ok: boolean; code: string; lanIp: string; port: number }) => {
        if (!res.ok) {
          setError("Failed to create room");
          return;
        }
        setIsHost(true);
        const joinUrl = `http://${res.lanIp}:${res.port}/join`;
        setLanUrl(joinUrl);
      },
    );
  }, [getSocket]);

  const joinRoom = useCallback(
    async (code: string): Promise<boolean> => {
      if (typeof window === "undefined") return false;
      setError(null);

      const normCode = code.trim().toUpperCase();
      if (normCode.length !== 4) {
        setError("Please enter a valid 4-letter code");
        return false;
      }

      return new Promise<boolean>(async (resolve) => {
        const socket = await getSocket();

        const timeout = setTimeout(() => {
          setError("Connection timed out. Check the 4-letter code.");
          resolve(false);
        }, 8000);

        socket.emit(
          "controller:join",
          { code: normCode },
          (res: {
            ok: boolean;
            error?: string;
            player?: PlayerState;
            room?: RoomState;
          }) => {
            clearTimeout(timeout);
            if (!res.ok) {
              setError(res.error || "Failed to join room");
              resolve(false);
              return;
            }
            if (res.player) setMyPlayer(res.player);
            if (res.room) setRoomState(res.room);
            resolve(true);
          },
        );
      });
    },
    [getSocket],
  );

  const startGame = useCallback(async () => {
    if (!isHost) return;
    const socket = await getSocket();
    socket.emit("host:start");
  }, [isHost, getSocket]);

  const sendInput = useCallback(
    async (input: InputState) => {
      const socket = await getSocket();
      socket.emit("controller:input", input);
    },
    [getSocket],
  );

  return {
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
