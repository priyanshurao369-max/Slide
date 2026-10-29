import {
  MAX_PLAYERS,
  SLOT_COLORS,
  SLOT_NAMES,
  type PlayerSlot,
  type PlayerState,
  type RoomState,
} from "./protocol";

export type Room = {
  code: string;
  hostSocketId: string;
  started: boolean;
  slots: (PlayerState | null)[];
};

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const rooms = new Map<string, Room>();
const socketToRoom = new Map<string, { code: string; isHost: boolean }>();

function generateCode(): string {
  let attempts = 0;
  while (attempts < 1000) {
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
    if (!rooms.has(code)) return code;
    attempts++;
  }
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

export function createRoom(hostSocketId: string): Room {
  // If host already had a room, clean it up
  const existing = socketToRoom.get(hostSocketId);
  if (existing) {
    destroyRoom(existing.code);
  }

  const code = generateCode();
  const room: Room = {
    code,
    hostSocketId,
    started: false,
    slots: [null, null, null, null],
  };

  rooms.set(code, room);
  socketToRoom.set(hostSocketId, { code, isHost: true });
  return room;
}

export function joinRoom(
  code: string,
  controllerSocketId: string,
): { ok: boolean; error?: string; player?: PlayerState; room?: Room } {
  const normCode = code.trim().toUpperCase();
  const room = rooms.get(normCode);

  if (!room) {
    return { ok: false, error: "Room not found. Check the 4-letter code." };
  }

  // Find first available slot
  let freeSlotIndex = -1;
  for (let i = 0; i < MAX_PLAYERS; i++) {
    if (room.slots[i] === null) {
      freeSlotIndex = i;
      break;
    }
  }

  if (freeSlotIndex === -1) {
    return { ok: false, error: "Room is full (max 4 players)." };
  }

  const slot = freeSlotIndex as PlayerSlot;
  const player: PlayerState = {
    id: controllerSocketId,
    slot,
    color: SLOT_COLORS[slot],
    name: SLOT_NAMES[slot],
    connected: true,
  };

  room.slots[slot] = player;
  socketToRoom.set(controllerSocketId, { code: normCode, isHost: false });

  return { ok: true, player, room };
}

export function startRoom(hostSocketId: string): Room | null {
  const mapping = socketToRoom.get(hostSocketId);
  if (!mapping || !mapping.isHost) return null;

  const room = rooms.get(mapping.code);
  if (!room) return null;

  room.started = true;
  return room;
}

export function leaveSocket(socketId: string): {
  room: Room | null;
  removedPlayer: PlayerState | null;
  isHost: boolean;
} {
  const mapping = socketToRoom.get(socketId);
  if (!mapping) return { room: null, removedPlayer: null, isHost: false };

  socketToRoom.delete(socketId);
  const room = rooms.get(mapping.code);

  if (!room) return { room: null, removedPlayer: null, isHost: mapping.isHost };

  if (mapping.isHost) {
    // If the host screen disconnects, destroy the room
    destroyRoom(mapping.code);
    return { room, removedPlayer: null, isHost: true };
  }

  // Controller disconnected: vacate slot
  let removed: PlayerState | null = null;
  for (let i = 0; i < MAX_PLAYERS; i++) {
    if (room.slots[i]?.id === socketId) {
      removed = room.slots[i];
      room.slots[i] = null;
      break;
    }
  }

  return { room, removedPlayer: removed, isHost: false };
}

export function destroyRoom(code: string) {
  const room = rooms.get(code);
  if (!room) return;

  socketToRoom.delete(room.hostSocketId);
  for (const slot of room.slots) {
    if (slot) {
      socketToRoom.delete(slot.id);
    }
  }
  rooms.delete(code);
}

export function getRoom(code: string): Room | null {
  return rooms.get(code.trim().toUpperCase()) ?? null;
}

export function getRoomBySocket(socketId: string): { room: Room; isHost: boolean } | null {
  const mapping = socketToRoom.get(socketId);
  if (!mapping) return null;
  const room = rooms.get(mapping.code);
  if (!room) return null;
  return { room, isHost: mapping.isHost };
}

export function getRoomState(room: Room): RoomState {
  const players = room.slots.filter((s): s is PlayerState => s !== null);
  return {
    code: room.code,
    started: room.started,
    players,
  };
}
