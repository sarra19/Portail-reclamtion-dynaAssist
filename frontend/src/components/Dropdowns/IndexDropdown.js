import React, { useEffect, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { createPopper } from "@popperjs/core";
import { toast } from "react-toastify";
import io from "socket.io-client";
import SummaryApi from "api/common";
import { useSelector } from "react-redux";


const IndexDropdown = () => {
  const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
  const btnDropdownRef = useRef();
  const popoverDropdownRef = useRef();
  const [notifications, setNotifications] = useState([]);
  const history = useHistory();

  const socket = useRef(null);

   const currentUser = useSelector(state => state?.user?.user)


  // Fetch notifications for user
  const fetchNotifications = async (userId) => {
    try {
      const response = await fetch(`${SummaryApi.getNotifications.url}?receiver=${userId}`, {
        method: SummaryApi.getNotifications.method,
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };


  useEffect(() => {
    if (currentUser?.No_) {
      fetchNotifications(currentUser.No_);

      // Connect to Socket.IO server on port 8800
      // Remplacez "http://localhost:8800" par l'URL de votre backend si nécessaire
      socket.current = io("http://localhost:8800", {
        transports: ["websocket"], // Force WebSocket pour éviter les problèmes de connexion
      });
      // Join room based on user ID
      socket.current.emit("joinRoom", `user_${currentUser.No_}`);

      // Listen for new notification
      socket.current.on("new_notification", (notification) => {
        toast.info("🔔 Nouvelle notification !");
        setNotifications((prev) => [notification, ...prev]);
      });
      socket.current.on("reclamation_traitée", (notif) => {
        toast.info("🔧 Réclamation traitée !");
        setNotifications((prev) => [notif, ...prev]);
      });
      // Résolues
      socket.current.on("reclamation_resolved", (notification) => {
        toast.success("✅ Réclamation résolue !");
        setNotifications((prev) => [notification, ...prev]);
      });

      return () => {
        socket.current.disconnect();
      };
    }
  }, [currentUser]);

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${SummaryApi.deleteNotification.url}/${notificationId}`, {
        method: SummaryApi.deleteNotification.method,
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setNotifications((prev) =>
          prev.filter((n) => n.No_ !== notificationId)
        );
      }
    } catch (err) {
      console.error("Erreur suppression", err);
    }
  };

  // Update status
  const updateStatus = async (reclamationId) => {
    try {
      await fetch(`${SummaryApi.updateStatus.url}/${reclamationId}`, {
        method: SummaryApi.updateStatus.method,
        credentials: "include",
      });
    } catch (err) {
      console.error("Erreur statut", err);
    }
  };

  // Handle click
  const handleNotificationClick = async (notification) => {
    closeDropdownPopover();
    if (currentUser?.Role !== 1) {
      await updateStatus(notification.ReclamationId);
    }
    await deleteNotification(notification.No_);
    history.push(`/détails-réclamations/${notification.ReclamationId}`);
  };

  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start",
    });
    setDropdownPopoverShow(true);
  };

  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  return (
    <>
      <a
        className="hover:text-blueGray-500 text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold transition-colors duration-200 ease-in-out relative"
        href="#pablo"
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <i className="fas fa-bell text-lg text-black leading-lg"></i>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
            {notifications.length}
          </span>
        )}
      </a>

      <div
        ref={popoverDropdownRef}
        className={`bg-white text-base z-50 float-left py-2 list-none text-left rounded-lg shadow-xl min-w-48 transform transition-all duration-300 ease-in-out ${dropdownPopoverShow ? "block" : "hidden"
          }`}
        style={{ maxHeight: '300px', overflowY: 'auto' }}
      >
        <span className="text-sm pt-2 pb-2 px-4 font-bold block w-full whitespace-nowrap bg-transparent text-blueGray-700 border-b border-blueGray-200">
          Notifications
        </span>

        {notifications.map((notif) => (
          <div
            key={notif.No_}
            className="text-sm py-3 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700 hover:bg-blueGray-50 transition-colors duration-200 ease-in-out flex items-center cursor-pointer"
            onClick={() => handleNotificationClick(notif)}
          >
            <i
              className={`fas fa-bell mr-2 ${notif.Urgent === 1 ? "text-red-500" : "text-blueGray-400"
                }`}
            ></i>
            <p>
              {notif.StatusRec === "nouvelle" ? (
                <>
                  Une nouvelle réclamation sur{" "}
                  <strong>{notif.TargetTypeRec}</strong> "{notif.NameTarget}"
                </>
              ) : (
                <>
                  Votre réclamation sur{" "}
                  <strong>{notif.TargetTypeRec}</strong> "{notif.NameTarget}" est{" "}
                  <span
                    className={
                      notif.StatusRec === "Résolu"
                        ? "text-red-500 font-bold"
                        : "font-bold"
                    }
                  >
                    {notif.StatusRec}
                  </span>
                </>
              )}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default IndexDropdown;