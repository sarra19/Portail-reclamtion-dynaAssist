import React, { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import ChatBox from "components/chat/ChatBox/ChatBox";
import Conversation from "components/chat/Coversation/Conversation";
import { toast, ToastContainer } from "react-toastify";
import SummaryApi from "api/common";

import HeaderAuth from "components/Header/HeaderAuth";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer";
import { Link } from "react-router-dom";

export default function CardChatMessage() {
  const socket = useRef();
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [sendMessage, setSendMessage] = useState(null);
  const [receivedMessage, setReceivedMessage] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserList, setShowUserList] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setCurrentUser(result.data);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details.");
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(SummaryApi.allUser.url, {
        method: SummaryApi.allUser.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const dataResponse = await response.json();

      if (Array.isArray(dataResponse) && dataResponse.length > 0) {
        setAllUsers(dataResponse);
      } else {
        console.error("Aucune donnée de User disponible dans la réponse de l'API.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des Users:", error);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const response = await fetch(`${SummaryApi.deleteChat.url}/${chatId}`, {
        method: SummaryApi.deleteChat.method,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      const result = await response.json();

      if (result.success) {
        setChats((prevChats) => prevChats.filter((chat) => chat.No_ !== chatId));
        toast.success("Chat deleted successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (currentUser?.No_) {
      const getChats = async () => {
        try {
          const response = await fetch(`${SummaryApi.getchats.url}/${currentUser.No_}`, {
            method: SummaryApi.getchats.method,
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Failed to fetch chats");
          }

          const result = await response.json();

          if (result.success) {
            setChats(result.data);
          } else {
            console.log(result.message);
            toast.error(result.message);
          }
        } catch (error) {
          console.error("Error fetching chats:", error);
          toast.error("Failed to fetch chats");
        }
      };

      getChats();
    }
  }, [currentUser]);


  const handleCreateChat = async (receiverId) => {
    try {
      console.log("Creating chat with receiverId:", receiverId);
      console.log("Sender ID (current user):", currentUser.No_);

      const response = await fetch(SummaryApi.createChatMessagerie.url, {
        method: SummaryApi.createChatMessagerie.method,
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ senderId: currentUser.No_, receiverId }),
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response data:", result);

      if (result.success) {
        if (result.message === "Chat already exists") {
          setChats((prevChats) => {
            const chatExists = prevChats.some((chat) => chat.No_ === result.data.chatId);
            if (!chatExists) {
              return [...prevChats, { No_: result.data.chatId, members: result.data.members }];
            }
            return prevChats;
          });
          setCurrentChat({ No_: result.data.chatId, members: result.data.members });
          toast.success("Chat already exists, redirecting to existing chat");
        } else {
          setChats((prevChats) => [...prevChats, result.data]);
          setCurrentChat(result.data);
          toast.success("Chat created successfully");
        }
      } else {
        toast.error(result.message || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  };
// Socket initialization and event setup
useEffect(() => {
  if (currentUser) {
    socket.current = io("ws://localhost:8800");
    socket.current.emit("new-user-add", currentUser.No_);
    
    const getUsersHandler = (users) => {
      setOnlineUsers(users);
    };
    
    const receiveMessageHandler = (data) => {
      setReceivedMessage(data);
    };
    
    socket.current.on("get-users", getUsersHandler);
    socket.current.on("receive-message", receiveMessageHandler); // Fixed spelling

    return () => {
      if (socket.current) {
        socket.current.off("get-users", getUsersHandler);
        socket.current.off("receive-message", receiveMessageHandler); // Fixed spelling
        socket.current.disconnect();
      }
    };
  }
}, [currentUser]);

// Message sending effect
useEffect(() => {
  if (sendMessage !== null && socket.current) {
    socket.current.emit("send-message", sendMessage);
  }
}, [sendMessage]);





  const checkOnlineStatus = (chat) => {
    if (!currentUser) return false;
    const chatMember = chat.members.find((member) => member !== currentUser.No_);
    if (!chatMember) return false;
    const isOnline = onlineUsers.some((user) => String(user.userId) === String(chatMember));
    return isOnline;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFocus = () => {
    setShowUserList(true);
  };

  const handleSearchBlur = () => {
    setShowUserList(false);
  };

  const filteredUsers = allUsers
    .filter(user => user.No_ !== currentUser?.No_) // Exclure le profil de l'utilisateur actuel
    .filter(user =>
      `${user.FirstName} ${user.LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  const displayedUsers = filteredUsers.slice(0, 4);

  return (
    <>
      <HeaderAuth fixed />
      <IndexNavbar fixed />
      <ToastContainer position='top-center' />
      <div className="bg-orangelight-dys2 flex justify-center items-center">

        <div className="mb-4 w-50 mt-12 max-w-6xl text-center ">
          <h1 className="text-5xl text-blueGray-800 font-bold mb-4">Espace de travail collaboratif</h1>
          <p className="text-xl text-blueGray-700 mb-6 mt-4">
          Choisissez votre méthode préférée pour commencer
          </p>
        </div>
      </div>
        <div className="bg-orangelight-dys2 text-center ">
            <h1 className="text-4xl text-blueGray-800 font-bold">Lancer une Conversation</h1>
           
          </div>
      <div className="w-full h-screen  p-4 bg-orangelight-dys2 flex justify-center items-center">
       
        <div className="container mx-auto margin-top-chat">

          <div className="py-6 flex justify-center items-center">
            <div className="flex border border-orange rounded shadow-lg w-full">

              {/* Left Side - Chat List */}
              <div className="w-2/3 border flex flex-col">
                <div className="py-2 px-3 bg-white flex flex-row justify-between items-center">
                  <div>
                    <img className="w-10 h-10 rounded-full" alt="team" src={currentUser?.ProfileImage} />
                  </div>
                  <div className="ml-2 ml-4">
                    <p className="text-grey-darkest">
                      <span>
                        {currentUser?.FirstName} {currentUser?.LastName}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Search Input and User List Container */}
                <div className="relative py-2 px-2 bg-white flex flex-col">
                  <input
                    type="text"
                    className="w-full px-2 py-2 text-sm"
                    placeholder="Search or start new chat"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                  />

                  {/* User List */}
                  {showUserList && (
                    <div className="mt-2 w-full bg-white border border-gray-200 rounded shadow-lg">
                      <div className="p-4">
                        <h3 className="font-bold mb-2">Les Utilisateurs</h3>
                        <ul>
                          <ul>
                            {displayedUsers.length > 0 ? (
                              displayedUsers.map((user) => (
                                <li
                                  key={user.No_}
                                  className="py-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                                  onMouseDown={() => handleCreateChat(user.No_)} // Remplacez onClick par onMouseDown
                                >
                                  <div className="flex items-center">
                                    <img className="w-8 h-8 rounded-full" src={user.ProfileImage} alt={user.name} />
                                    <span className="ml-2">{user.FirstName} {user.LastName}</span>
                                  </div>
                                </li>
                              ))
                            ) : (
                              <li className="py-2 text-gray-500">Aucun utilisateur trouvé</li>
                            )}
                          </ul>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat List */}
                <div className="bg-white flex-1 overflow-auto">
                  {chats.map((chat) => (
                    <div
                      key={chat.No_}
                      onClick={() => {
                        setCurrentChat(chat);
                      }}
                    >
                      <Conversation
                        data={chat}
                        currentUser={currentUser?.No_}
                        online={checkOnlineStatus(chat)}
                        onDelete={deleteChat}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Chat Box */}
              <div className="w-full border flex flex-col">
                {currentChat ? (
                  <>
                    <div className="flex-1 overflow-auto bg-white1-chat">
                      <div className="py-2 px-3">
                        <ChatBox
                          chat={currentChat}
                          currentUser={currentUser?.No_}
                          setSendMessage={setSendMessage}
                          receivedMessage={receivedMessage}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex justify-center items-center bg-white1-chat">
                    <span className="text-gray-500">Sélectionnez une discussion pour commencer à envoyer des messages</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
      <div className="bg-orangelight-dys2 flex justify-center items-center">

        <div className="w-30 max-w-6xl text-center">
          <div className="text-center ">
            <h1 className="text-4xl text-blueGray-800 font-bold">Ou bien Lancez un Appel Vidéo</h1>
            <p className="text-xl text-blueGray-700 mb-6 mt-4">
            Choisissez votre session préférée pour commencer            </p>
          </div>

          <div className="container py-20 flex flex-col md:flex-row justify-center gap-6 mb-12">
            {/* Card 1 */}
            <div className="flex-1 max-w-md">
              <Link
                to="/video-call-whiteboard"
                className="h-full flex flex-col bg-white bg-opacity-90 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden"
              >
                <div className="bg-orange-dys h-3 w-full"></div>
                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex items-center mb-6">
                    <div className="bg-orange-dys-1 p-4 rounded-xl mr-4">
                      <i className="fas fa-video fa-lg text-orange-dys"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-blueGray-800">Appel Vidéo + Whiteboard</h2>
                  </div>
                  <p className="text-blueGray-600 text-lg mb-8 flex-grow">
                  Collaborez en toute transparence grâce aux outils d'appel vidéo et de dessin                  </p>
                  <div className="text-orange-dys font-semibold flex items-center">
                  Démarrer la session                    <i className="fas fa-chevron-right ml-2"></i>
                  </div>
                </div>
              </Link>
            </div>

            {/* Card 2 */}
            <div className="flex-1 max-w-md">
              <Link
                to="/video-call-ppt-viewer"
                className="h-full flex flex-col bg-white bg-opacity-90 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden"
              >
                <div className="bg-blueGray-dys-1 h-3 w-full"></div>
                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex items-center mb-6">
                    <div className="bg-bleu-dys-2 p-4 rounded-xl mr-4">
                      <i className="fas fa-tv fa-lg  fa-lg text-bleu-dys"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-blueGray-800">Appel vidéo + visionneuse PPT</h2>
                  </div>
                  <p className="text-blueGray-600 text-lg mb-8 flex-grow">
                  Présentez et partagez des diapositives avec une interaction en temps réel                  </p>
                  <div className="text-bleu-dys font-semibold flex items-center">
                  Démarrer la session                    <i className="fas fa-chevron-right ml-2"></i>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}