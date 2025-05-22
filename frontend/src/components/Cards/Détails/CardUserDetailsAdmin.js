import React, { useState, useEffect } from "react";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import HeaderAuth from "components/Header/HeaderAuth";
import SummaryApi from "api/common";

import uploadFile from "helpers/uploadFile";
import loginIcons from 'assets/img/signup.gif';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useSelector } from "react-redux";

export default function CardUserDetailsAdmin() {
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { id } = useParams();
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const [data, setData] = useState({
    FirstName: '',
    LastName: '',
    Address: '',
    Email: '',
    City: '',
    PostalCode: '',
    Phone: '',
    Biography: '',
    ProfileImage: '',
    OccupationUser: '',
    CompagnyUser: '',

  });

  const history = useHistory();

  const currentUser = useSelector(state => state?.user?.user)


  useEffect(() => {


    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${SummaryApi.getUser.url}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const dataResponse = await response.json();
        setData(dataResponse?.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
      }
    };

    fetchUserDetails();

  }, [id]);
  const handleDelete = async (id) => {
    try {
      const response = await fetch(SummaryApi.deleteUser.url, {
        method: SummaryApi.deleteUser.method,
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ No_: id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const dataResponse = await response.json();
      toast.success("User deleted successfully");
      history.push('/admin/users');
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleCreateChatAdmin = async () => {
    try {
      console.log("Creating chat with receiverId:", data?.No_);
      console.log("Sender ID (current user):", currentUser?.No_);

      const response = await fetch(SummaryApi.createChatMessagerie.url, {
        method: SummaryApi.createChatMessagerie.method,
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ senderId: currentUser?.No_, receiverId: data?.No_ }),
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
          toast.success("Le chat existe déjà, redirection vers le chat existant");

          // Navigate to the chat page
          history.push('/chat');
        } else {
          setChats((prevChats) => [...prevChats, result.data]);
          setCurrentChat(result.data);
          toast.success("Chat créé avec succès");

          // Navigate to the chat page
          history.push('/chat');
        }
      } else {
        toast.error(result.message || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  };

  return (
    <>


       <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg w-11/12 md:w-10/12 lg:w-9/12 px-4 md:px-6 mr-auto ml-auto mt-6">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="px-6">
            <div className="flex flex-wrap justify-center">
              <div className="w-full  lg:w-3/12 px-4 lg:order-2 flex justify-center">
                <div className="relative">
                  <img
                    alt="..."
                    src={data.ProfileImage}
                    className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                  />
                </div>
              </div>
              <div className="w-full  lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                <div className="py-6 px-5 mt-32 md:mt-30 mt-2 sm:mt-0">
                  <div className="flex items-center space-x-2">
                    <a href="/chat">
                      <button
                        className="bg-orange-dys active:bg-orange-dys uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none ease-linear transition-all duration-150"
                        type="button"
                        onClick={handleCreateChatAdmin}  // Pas besoin de passer l'ID ici

                      >
                        Envoyer un message
                      </button>
                    </a>

                    <button
                      className=" ml-2 bg-blueGray-dys-2 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => handleDelete(data.No_)}                       >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-4/12 px-4 lg:order-1">
                <div className="w-full px-4 text-center mt-20">
                  <div className="flex justify-center py-4 lg:pt-4 pt-8">
                    <div className="lg:mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                        {data.City}
                      </span>
                      <span className="text-sm text-blueGray-400">City</span>
                    </div>
                    <div className="lg:mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                        {data.PostalCode}
                      </span>
                      <span className="text-sm text-blueGray-400">Code Postal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                {data.FirstName} {data.LastName}
              </h3>

              {data?.Address && (
                <div className="text-sm leading-normal mt-0 mb-2 text-blueGray-400 font-bold uppercase">
                  <i className="fas fa-map-marker-alt mr-2 text-lg text-blueGray-400"></i>
                  {data.Address}
                </div>
              )}

              {data?.OccupationUser && (
                <div className="mb-2 text-blueGray-600 mt-10">
                  <i className="fas fa-briefcase mr-2 text-lg text-blueGray-400"></i>
                  {data.OccupationUser}
                </div>
              )}

              {data?.CompagnyUser && (
                <div className="mb-2 text-blueGray-600">
                  <i className="fas fa-building mr-2 text-lg text-blueGray-400"></i>
                  {data.CompagnyUser}
                </div>
              )}

              {data?.Phone && (
                <div className="mb-2 text-blueGray-600">
                  <i className="fas fa-phone mr-2 text-lg text-blueGray-400"></i>
                  {data.Phone}
                </div>
              )}

              <div className="mt-10 py-10 border-t border-blueGray-200 text-center">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-9/12 px-4">
                    <p className="mb-4 text-lg leading-relaxed text-blueGray-700">
                      {data?.Biography}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <button
  onClick={() => window.history.back()}
  className="mt-2 ml-2 bg-gray-500 text-white active:bg-gray-500 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
  type="button"
>
  <i className="fas fa-arrow-left mr-2"></i>
  Retour
</button>


    </>
  );
}