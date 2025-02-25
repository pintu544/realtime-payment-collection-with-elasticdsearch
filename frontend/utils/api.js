import axios from "axios";
import { io } from "socket.io-client";

const API_BASE_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  path: "/socket.io",
});

// Add connection status logging
socket.on("connect", () => {
  console.log("Socket connected");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});
