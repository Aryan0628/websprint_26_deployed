import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setStatus] = useState("Connecting...");
  const { user, isLoading } = useAuth0();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    // 1. Wait for User to be fully loaded
    if (isLoading || !user?.sub) return;

    // --- CRITICAL FIX: ENCODE THE ID ---
    // Auth0 IDs look like "google-oauth2|123". The "|" breaks URLs if not encoded.
    const rawUserId = user.sub;
    const safeUserId = encodeURIComponent(rawUserId);

    console.log(`[SSE] Initializing connection for: ${rawUserId}`);

    // 2. Fetch History (from DB)
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/notifications/${safeUserId}`);
        setNotifications(res.data);
      } catch (err) {
        console.error("[SSE] Failed to fetch history:", err);
      }
    };
    fetchHistory();

    // 3. Connect SSE (Live Stream)
    const eventSource = new EventSource(`${API_URL}/notifications/${safeUserId}`);

    eventSource.onopen = () => {
        console.log("[SSE] Connection Open");
        setStatus("Connected");
    };

    eventSource.onmessage = (event) => {
      try {
        console.log("[SSE] Message Received:", event.data); // Debug Log
        const data = JSON.parse(event.data);
        
        // Ignore system messages
        if (["heartbeat", "connection_ack"].includes(data.type)) return;

        setNotifications((prev) => {
          // Prevent duplicates if the live message matches one we just fetched from DB
          if (prev.find((n) => n.id === data.id)) return prev;
          return [data, ...prev];
        });
        
        setUnreadCount((prev) => prev + 1);
        
      } catch (err) {
        console.error("[SSE] Parse Error:", err);
      }
    };

    eventSource.onerror = (err) => {
        // Note: Don't panic on error, EventSource retries automatically.
        // Just update UI to show we are trying.
        console.warn("[SSE] Connection lost, retrying...", err);
        setStatus("Reconnecting...");
    };

    // Cleanup: Close connection when user logs out or component unmounts
    return () => {
        console.log("[SSE] Closing connection");
        eventSource.close();
    };

  // Only re-run if the User ID actually changes
  }, [user?.sub, isLoading, API_URL]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, setUnreadCount, connectionStatus }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);