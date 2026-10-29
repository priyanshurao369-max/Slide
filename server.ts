import http from "http";
import os from "os";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import {
  createRoom,
  joinRoom,
  startRoom,
  leaveSocket,
  getRoomState,
  getRoomBySocket,
} from "./lib/net/rooms";
import type { InputState } from "./lib/game/controls";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("host:create", (callback) => {
      const room = createRoom(socket.id);
      socket.join(room.code);
      const lanIp = getLocalIp();
      callback?.({ ok: true, code: room.code, lanIp, port });
      io.to(room.code).emit("room:state", getRoomState(room));
    });

    socket.on("controller:join", ({ code }, callback) => {
      const res = joinRoom(code, socket.id);
      if (!res.ok || !res.room || !res.player) {
        callback?.({ ok: false, error: res.error });
        return;
      }
      socket.join(res.room.code);
      callback?.({
        ok: true,
        player: res.player,
        room: getRoomState(res.room),
      });

      // Notify the room (especially host screen)
      io.to(res.room.code).emit("room:state", getRoomState(res.room));
      if (res.room.started) {
        socket.emit("room:started");
      }
    });

    socket.on("host:start", () => {
      const room = startRoom(socket.id);
      if (room) {
        io.to(room.code).emit("room:started");
        io.to(room.code).emit("room:state", getRoomState(room));
      }
    });

    socket.on("controller:input", (input: InputState) => {
      const mapping = getRoomBySocket(socket.id);
      if (mapping && !mapping.isHost) {
        io.to(mapping.room.hostSocketId).emit("controller:input", {
          playerId: socket.id,
          input,
        });
      }
    });

    socket.on("disconnect", () => {
      const { room, removedPlayer, isHost } = leaveSocket(socket.id);
      if (!room) return;

      if (isHost) {
        io.to(room.code).emit("room:ended");
      } else {
        io.to(room.code).emit("room:state", getRoomState(room));
        if (removedPlayer) {
          io.to(room.hostSocketId).emit("controller:left", {
            playerId: removedPlayer.id,
            slot: removedPlayer.slot,
          });
        }
      }
    });
  });

  server.listen(port, hostname, () => {
    const lanIp = getLocalIp();
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Network: http://${lanIp}:${port}`);
  });
});
