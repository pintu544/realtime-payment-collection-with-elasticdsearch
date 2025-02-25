import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    socket.on("notification", (data) => {
      setNotifications((prev) => [...prev, data]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications yet</p>
      ) : (
        <ul>
          {notifications.map((note, index) => (
            <li key={index}>{note.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
