import { io, type Socket } from "socket.io-client"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1"
// The WebSocket gateway lives at the API's origin, not under the /api/v1 REST prefix.
const socketOrigin = new URL(apiBaseUrl).origin

let socket: Socket | null = null

/** Lazily-created singleton so every hook/component shares one connection. */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(socketOrigin, {
      withCredentials: true,
      autoConnect: false,
    })
  }
  return socket
}
