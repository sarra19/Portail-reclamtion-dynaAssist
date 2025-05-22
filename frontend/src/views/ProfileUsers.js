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

export default function ProfileUsers() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { id } = useParams();
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Address: '',
    City: '',
    PostalCode: '',
    Phone: '',
    Biography: '',
    ProfileImage: '',
    OccupationUser: '',
    CompagnyUser: '',

  });
  const history = useHistory();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    validateField(name, value);
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) {
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
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image (JPEG, PNG, GIF, PDF, DOC, DOCX).");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size exceeds the limit of 5MB.");
      return;
    }

    setSelectedFile(file);
    setFormData((prev) => ({
      ...prev,
      ProfileImage: file,
    }));

    toast.success("File selected successfully!");
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'Email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Format email invalide.';
        }
        break;
      case 'FirstName':
        if (value.length < 3) {
          error = 'Prénom doit contenir au moins 3 caractères.';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Prénom ne doit contenir que des lettres et des espaces.';
        }
        break;
      case 'LastName':
        if (value.length < 3) {
          error = 'Nom doit contenir au moins 3 caractères.';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Nom ne doit contenir que des lettres et des espaces.';
        }
        break;
      case 'Password':
        const passwordError = validatePassword(value);
        if (passwordError) {
          error = passwordError;
        }
        break;
      case 'confirmPassword':
        if (value !== formData.Password) {
          error = 'Les mots de passe ne correspondent pas.';
        }
        break;
      default:
        break;
    }
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validatePassword = (password) => {
    const lengthValid = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!lengthValid) return 'Le mot de passe doit contenir au moins 8 caractères.';
    if (!hasUpperCase) return 'Le mot de passe doit contenir au moins une majuscule.';
    if (!hasLowerCase) return 'Le mot de passe doit contenir au moins une minuscule.';
    if (!hasNumber) return 'Le mot de passe doit contenir au moins un chiffre.';
    if (!hasSpecialChar) return 'Le mot de passe doit contenir au moins un caractère spécial.';

    return null;
  };
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
        console.log("user details profil:", dataResponse?.data)
        setUser(dataResponse?.data);
        setFormData(dataResponse?.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
      }
    };

    fetchUserDetails();

  }, [id]);
   const currentUser = useSelector(state => state?.user?.user)


  const handleCreateChat = async () => {
    try {
      console.log("Creating chat with receiverId:", user?.No_);
      console.log("Sender ID (current user):", currentUser?.No_);

      const response = await fetch(SummaryApi.createChatMessagerie.url, {
        method: SummaryApi.createChatMessagerie.method,
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ senderId: currentUser?.No_, receiverId: user?.No_ }),
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
      <HeaderAuth fixed />
      <IndexNavbar fixed />
      <main className="profile-page">
        <section className="relative block h-500-px">
          <div
            className="absolute top-0 w-full h-full bg-center bg-cover"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80')",
            }}
          >
            <span
              id="blackOverlay"
              className="w-full h-full absolute opacity-50 bg-black"
            ></span>
          </div>
          <div
            className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
            style={{ transform: "translateZ(0)" }}
          >
            <svg
              className="absolute bottom-0 overflow-hidden"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
             <polygon 
    className="text-orange-dys fill-current" 
    points="2560 0 2560 100 0 100" 
    stroke="currentColor" 
    stroke-width="4">
</polygon>

            </svg>
          </div>
        </section>
        <section className="relative py-16 bg-blueGray-200">
          <div className="container mx-auto px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64">
              <div className="px-6">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
                    <div className="relative">
                      <img
                        alt="..."
                        src={user?.ProfileImage}
                        className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                    <div className="py-6 px-3 mt-32 sm:mt-0">
                      <div className="flex items-center space-x-2">

                        <button
                          className="bg-orange-dys active:bg-orange-dys uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none ease-linear transition-all duration-150"
                          type="button"
                          onClick={handleCreateChat}  // Pas besoin de passer l'ID ici
                        >
                          Envoyer un message
                        </button>
                       
                      </div>
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-1">
                    <div className="w-full px-4 text-center mt-20">
                      <div className="flex justify-center py-4 lg:pt-4 pt-8">
                      {user?.City && ( <div className="lg:mr-4 p-3 text-center">
                          <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                            {user?.City}
                          </span>
                          <span className="text-sm text-blueGray-400">City</span>
                        </div>
                      )}
                      {user?.PostalCode && ( 
                        <div className="lg:mr-4 p-3 text-center">
                          <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                            {user?.PostalCode}
                          </span>
                          <span className="text-sm text-blueGray-400">Code Postal</span>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              
                  <div className="text-center mt-12">
                    <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                      {user?.FirstName} {user?.LastName}
                    </h3>
                    {user?.Address && (
                      <div className="text-sm leading-normal mt-0 mb-2 text-blueGray-400 font-bold uppercase">
                        <i className="fas fa-map-marker-alt mr-2 text-lg text-blueGray-400"></i>
                        {user.Address}
                      </div>
                    )}

                    {user?.OccupationUser && (
                      <div className="mb-2 text-blueGray-600 mt-10">
                        <i className="fas fa-briefcase mr-2 text-lg text-blueGray-400"></i>
                        {user.OccupationUser}
                      </div>
                    )}

                    {user?.CompagnyUser && (
                      <div className="mb-2 text-blueGray-600">
                        <i className="fas fa-building mr-2 text-lg text-blueGray-400"></i>
                        {user.CompagnyUser}
                      </div>
                    )}

                    {user?.Phone && (
                      <div className="mb-2 text-blueGray-600">
                        <i className="fas fa-phone mr-2 text-lg text-blueGray-400"></i>
                        {user.Phone}
                      </div>
                    )}

                    <div className="mt-10 py-10 border-t border-blueGray-200 text-center">
                      <div className="flex flex-wrap justify-center">
                        <div className="w-full lg:w-9/12 px-4">
                          <p className="mb-4 text-lg leading-relaxed text-blueGray-700">
                            {user?.Biography}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}