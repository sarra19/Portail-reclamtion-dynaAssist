import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import SummaryApi from "api/common";

import moment from "moment";
import "moment/locale/fr"; // Localisation en français
import InputEmoji from "react-input-emoji";
import { FaPaperclip, FaSmile, FaTimes } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import uploadFile from "../../../helpers/uploadFile";

const ChatBox = ({ chat, currentUser, setSendMessage, receivedMessage }) => {
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]); // State to hold attached files
  const [previews, setPreviews] = useState([]); // State to hold file previews
  const [editingMessage, setEditingMessage] = useState(null); // State for editing a message
  const scroll = useRef();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
useEffect(() => {
  if (receivedMessage) {
    // Vérifiez si le message reçu appartient au chat actuel
    if (receivedMessage.chatId === chat?.No_) {
      setMessages(prev => [...prev, receivedMessage]);
    }
  }
}, [receivedMessage, chat?.No_]);
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (chat && currentUser) {
        const members = Array.isArray(chat.members) ? chat.members : chat.members.split(",");
        const userId = members.find((id) => id !== currentUser);
        if (!userId) return;

        try {
          const response = await fetch(`${SummaryApi.getUser.url}/${userId}`, {
            method: SummaryApi.getUser.method,
            credentials: "include",
          });

          if (!response.ok) throw new Error(`Failed to fetch user data: ${response.statusText}`);
          const result = await response.json();
          if (result.success) setUserData(result.data);
        } catch (error) {
          toast.error("Failed to fetch user data");
        }
      }
    };
    fetchUserData();
  }, [chat, currentUser]);

  // Fetch messages
  const fetchMessages = async () => {
    if (chat?.No_) {
      setLoading(true);
      try {
        const url = `${SummaryApi.getMessages.url}/${chat.No_}`;
        const response = await fetch(url, {
          method: SummaryApi.getMessages.method,
          credentials: "include",
        });

        if (!response.ok) throw new Error(`Failed to fetch messages: ${response.statusText}`);
        const result = await response.json();
        if (Array.isArray(result)) setMessages(result);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [chat]);

  // Handle file selection
  const handleFileChange = (e, isEditing = false) => {
    const files = Array.from(e.target.files);
    if (!files.length) {
      toast.error("No file selected.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX files
    ];
    const maxSize = 5 * 1024 * 1024;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload an image (JPEG, PNG, GIF, PDF, DOC, DOCX).");
        return;
      }
      if (file.size > maxSize) {
        toast.error("File size exceeds the limit of 5MB.");
        return;
      }
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    if (isEditing) {
      setAttachedFiles(files);
      setPreviews(newPreviews);
    } else {
      setAttachedFiles(files);
      setPreviews(newPreviews);
    }
    toast.success("Files selected successfully!");
  };

  // Handle sending a message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && attachedFiles.length === 0) {
      toast.error("Message or file cannot be empty");
      return;
    }

    const message = {
      senderId: currentUser,
      text: newMessage.trim(),
      chatId: chat.No_,
      AttachedFile: [],
    };

    if (attachedFiles.length > 0) {
      const fileUrls = [];
      for (const file of attachedFiles) {
        const fileUploadResponse = await uploadFile(file);
        fileUrls.push(fileUploadResponse.url);
      }
      message.AttachedFile = fileUrls.join(",");
    } else {
      message.AttachedFile = "";
    }

    const receiverId = chat.members.find((id) => id !== currentUser);
    setSendMessage({ ...message, receiverId });

    try {
      const response = await fetch(SummaryApi.addMessage.url, {
        method: SummaryApi.addMessage.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(message),
      });

      if (!response.ok) throw new Error("Failed to send message");
      const result = await response.json();
      if (result.success) {
        setMessages([...messages, result.data]);
        setNewMessage("");
        setAttachedFiles([]);
        setPreviews([]);
        previews.forEach((preview) => URL.revokeObjectURL(preview)); // Cleanup previews
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }

    fetchMessages();
  };

  // Handle deleting a message
  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${SummaryApi.deleteMessage.url}/${messageId}`, {
        method: SummaryApi.deleteMessage.method,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete message");
      const result = await response.json();
      if (result.message === "Message deleted successfully") {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.No_ !== messageId));
        toast.success("Message supprimé avec succès !");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Échec de la suppression du message.");
    }
  };

  // Handle editing a message
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.text);

    // Initialize file previews for the existing attached files
    if (message.AttachedFile && message.AttachedFile.trim() !== "") {
      const fileUrls = message.AttachedFile.split(",");
      setPreviews(fileUrls);
    } else {
      setPreviews([]);
    }
  };

  // Handle updating a message
  const handleUpdateMessage = async () => {
    if (!editingMessage) return;

    const updatedMessage = {
      text: newMessage.trim(),
      AttachedFile: editingMessage.AttachedFile || "",
    };

    // Handle new file uploads
    if (attachedFiles.length > 0) {
      const fileUrls = [];
      for (const file of attachedFiles) {
        const fileUploadResponse = await uploadFile(file);
        fileUrls.push(fileUploadResponse.url);
      }
      updatedMessage.AttachedFile = fileUrls.join(","); // Replace existing files with new ones
    }

    try {
      const response = await fetch(`${SummaryApi.updateMessage.url}/${editingMessage.No_}`, {
        method: SummaryApi.updateMessage.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedMessage),
      });

      if (!response.ok) throw new Error("Failed to update message");
      const result = await response.json();
      if (result.message === "Message updated successfully") {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.No_ === editingMessage.No_
              ? { ...msg, text: updatedMessage.text, AttachedFile: updatedMessage.AttachedFile }
              : msg
          )
        );
        setEditingMessage(null);
        setNewMessage("");
        setAttachedFiles([]);
        setPreviews([]);
        previews.forEach((preview) => URL.revokeObjectURL(preview)); // Cleanup previews
        toast.success("Message modifié avec succès !");
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Échec de la modification du message.");
    }
  };

  return (
    <div className="ChatBox-container">
      {chat ? (
        <>
          {/* Chat Header */}
          <div className="chat-header">
            <div className="follower">
              <div className="py-2 px-3 bg-white flex flex-row justify-between items-center">
                <div className="flex items-center">
                  <div>
                    <img
                      src={
                        userData?.ProfileImage
                          ? userData.ProfileImage
                          : process.env.REACT_APP_PUBLIC_FOLDER + "defaultProfile.png"
                      }
                      alt="Profile"
                      className="followerImage"
                      style={{ width: "50px", height: "50px" }}
                    />
                  </div>
                  <div className="ml-2 ml-4">
                    <p className="text-grey-darkest">
                      <span>
                        {userData?.FirstName} {userData?.LastName}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <hr style={{ width: "95%", border: "0.1px solid #ececec", marginTop: "20px" }} />
          </div>

          {/* Chat Body */}
          <div className="chat-body">
            {loading ? (
              <p>Loading messages...</p>
            ) : (
              messages.map((message) => {
                const timeAgo = moment.utc(message.CreatedAt).local().fromNow();
                const isOwnMessage = message.senderId === currentUser;
                return (
                  <div
                    key={message.No_}
                    className={`relative flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    ref={scroll}
                  >
                    {isOwnMessage && (
                      <div className="relative flex items-start">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMessages(
                              messages.map((msg) =>
                                msg.No_ === message.No_
                                  ? { ...msg, showActions: !msg.showActions }
                                  : { ...msg, showActions: false }
                              )
                            );
                          }}
                          className="text-orange-dys hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors ml-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {message.showActions && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-48 origin-top-right rounded text-orange-dys font-semibold bg-orange-dys4 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMessage(message);
                                setMessages(messages.map((msg) => ({ ...msg, showActions: false })));
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Modifier
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMessage(message.No_);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className={isOwnMessage ? "message own" : "message"}>
                      <span>{message.text}</span>
                      {message?.AttachedFile && message?.AttachedFile.trim() !== "" && (
                        <img
                          src={message.AttachedFile}
                          alt="Attached File"
                          width={80}
                          height={80}
                          className="bg-slate-100 border cursor-pointer"
                        />
                      )}
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* File Previews */}
          <div className="bg-white px-4 py-4 flex items-center space-x-4 rounded-lg shadow-sm">
            {previews.map((preview, index) => (
              <div key={index} className="relative mr-2 mb-2">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-10 h-10 object-cover rounded border border-gray-300"
                />
                <button
                  onClick={() => {
                    const updatedFiles = attachedFiles.filter((_, i) => i !== index);
                    const updatedPreviews = previews.filter((_, i) => i !== index);
                    setAttachedFiles(updatedFiles);
                    setPreviews(updatedPreviews);
                    URL.revokeObjectURL(preview);
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            ))}

          {/* Chat Sender */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <FaSmile className="w-5 h-5 text-orange-dys" />
                <span className="sr-only">Add emoji</span>
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 right-4 bg-white p-2 rounded-md shadow-lg z-50 w-64">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-semibold">Choisir un emoji</span>
                    <button onClick={() => setShowEmojiPicker(false)} className="text-red-500 hover:text-red-700 transition-colors duration-200">
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>
                  <EmojiPicker width={300} height={400} onEmojiClick={(emoji) => setNewMessage(newMessage + emoji.emoji)} />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                id="edit-file-upload"
                className="hidden"
                multiple
                onChange={(e) => handleFileChange(e, true)} // Indicate that this is an edit
              />
              <label
                htmlFor="edit-file-upload"
                className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <FaPaperclip className="mr-2 w-5 h-5 text-orange-dys" />
                <span className="sr-only">Upload file</span>
              </label>
            </div>
            <div className="flex-1">
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-dys focus:ring-1 focus:ring-orange-dys transition-colors duration-200"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={editingMessage ? "Modifier le message..." : "Envoyer un message..."}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    editingMessage ? handleUpdateMessage() : handleSend(e);
                  }
                }}
              />
            </div>
            <div>
              {editingMessage ? (
                <button
                  className="ml-2 bg-green-500 text-white font-bold uppercase text-sm px-6 py-2 rounded-lg shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200"
                  onClick={handleUpdateMessage}
                >
                  Mettre à jour
                </button>
              ) : (
                <button
                  className="ml-2 bg-orange-dys text-white font-bold uppercase text-sm px-6 py-2 rounded-lg shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-dys focus:ring-opacity-50 transition-all duration-200"
                  type="submit"
                  onClick={handleSend}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <span className="chatbox-empty-message">Tap on a chat to start conversation...</span>
      )}
    </div>
  );
};

export default ChatBox;