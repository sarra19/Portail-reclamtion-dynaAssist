import { useEffect, useState } from "react";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:8800"; // Match the backend server URL

const useSocket = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        // Listen for new notifications
        socket.on("new-notification", (notification) => {
            setNotifications((prevNotifications) => [notification, ...prevNotifications]);
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    return notifications;
};

export default useSocket;