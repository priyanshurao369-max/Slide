import type { InputState } from "../game/controls";

export const MAX_PLAYERS = 4;

export const SLOT_COLORS = [
  "#2563eb", // Player 1: Royal Blue
  "#dc2626", // Player 2: Crimson Red
  "#16a34a", // Player 3: Emerald Green
  "#d97706", // Player 4: Amber Gold
] as const;

export const SLOT_NAMES = [
  "Blue",
  "Red",
  "Green",
  "Yellow",
] as const;

export type PlayerSlot = 0 | 1 | 2 | 3;

export type PlayerState = {
  id: string; // Socket ID
  slot: PlayerSlot;
  color: string;
  name: string;
  connected: boolean;
};

export type RoomState = {
  code: string;
  started: boolean;
  players: PlayerState[];
};

export type JoinResponse = {
  ok: boolean;
  error?: string;
  player?: PlayerState;
  room?: RoomState;
};

export type CreateResponse = {
  ok: boolean;
  code: string;
  lanIp: string;
  port: number;
};

export type ControllerInputPayload = {
  playerId: string;
  input: InputState;
};
