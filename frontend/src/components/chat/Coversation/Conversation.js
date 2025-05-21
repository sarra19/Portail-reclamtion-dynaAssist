import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify"; // Pour afficher des messages d'erreur
import SummaryApi from "api/common";
 // Assurez-vous que le chemin est correct

const Conversation = ({ data, currentUser, online, onDelete }) => {
  const [userData, setUserData] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // Ensure `data.members` is an array
    const members = Array.isArray(data.members) ? data.members : data.members.split(',');

    // Find the other user's ID in the conversation
    const userId = members.find((id) => id !== currentUser);
    console.log("Extracted userId:", userId);

    if (!userId) {
      console.error("No valid user ID found in conversation members");
      return;
    }

    // Fetch user data
    const getUserData = async () => {
      try {
        const url = `${SummaryApi.getUser.url}/${userId}`;
        console.log("Fetching user data from:", url);

        const response = await fetch(url, {
          method: SummaryApi.getUser.method,
          credentials: "include",
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("User data response:", result);

        if (result.success) {
          setUserData(result.data);
          dispatch({ type: "SAVE_USER", data: result.data });
        } else {
          console.log(result.message);
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to fetch user data");
      }
    };

    getUserData();
  }, [data, currentUser, dispatch]);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(data.No_); // Appeler la fonction de suppression avec l'ID de la conversation
    }
  };

  return (
    <>
      <div className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <div className="relative">
          {online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
          <img
            src={userData?.ProfileImage}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
        <div className="ml-3 flex-1">
          <div className="text-sm font-medium">
            {userData?.FirstName} {userData?.LastName}
          </div>
          <div className={`text-xs ${online ? "text-green-500" : "text-orange-dys"}`}>
            {online ? "Online" : "Offline"}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 ml-2 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-trash"
            viewBox="0 0 16 16"
          >
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
            <path
              fillRule="evenodd"
              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
            />
          </svg>
        </button>
      </div>
      <hr className="my-2 border-t border-gray-200 w-11/12 mx-auto" />
    </>
  );
};

export default Conversation;