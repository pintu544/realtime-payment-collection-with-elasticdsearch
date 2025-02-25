import { createContext, useEffect, useState } from "react";
import { api, socket } from "../utils/api";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    // Connect socket when component mounts
    if (!socket.connected) {
      socket.connect();
    }

    // Fetch initial notifications
    fetchNotifications();

    // Listen for new notifications
    socket.on("notification", (newNotification) => {
      setNotifications((prev) => [...prev, newNotification]);
    });

    // Cleanup on unmount
    return () => {
      socket.off("notification");
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
