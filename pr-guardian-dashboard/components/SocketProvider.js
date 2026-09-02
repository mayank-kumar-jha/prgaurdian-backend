"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

/**
 * SocketProvider — Manages the Socket.IO connection lifecycle.
 * Connects once on mount, tears down on unmount.
 * Wraps dashboard routes so all children can call useSocket().
 */
export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const s = io(url, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * useSocket — Returns the active Socket.IO socket instance, or null before connection.
 */
export function useSocket() {
  return useContext(SocketContext);
}
