import React, { useState, useEffect } from "react";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import HeaderAuth from "components/Header/HeaderAuth";
import SummaryApi from "api/common";

import uploadFile from "helpers/uploadFile";
import loginIcons from 'assets/img/signup.gif';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tempImage, setTempImage] = useState(null);

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
    Gender: ''
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

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'FirstName':
        if (value.length < 3) {
          error = 'First name must be at least 3 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'First name can only contain letters and spaces';
        }
        break;
      case 'LastName':
        if (value.length < 3) {
          error = 'Last name must be at least 3 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Last name can only contain letters and spaces';
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

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image (JPEG, PNG, GIF).");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size exceeds the limit of 5MB.");
      return;
    }

    setSelectedFile(file);
    setTempImage(URL.createObjectURL(file));
    toast.success("Profile image selected successfully!");
  };

  const uploadProfileImage = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const uploadResponse = await uploadFile(selectedFile);
      if (uploadResponse.url) {
        setFormData(prev => ({
          ...prev,
          ProfileImage: uploadResponse.url
        }));
        toast.success("Profile image uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("Failed to upload profile image");
    } finally {
      setIsUploading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setCurrentUser(result.data);
        setFormData(result.data);
        setTempImage(result.data.ProfileImage);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details.");
    }
  };

  const handleLogout = async () => {
    try {
      const fetchData = await fetch(SummaryApi.logout_user.url, {
        method: SummaryApi.logout_user.method,
        credentials: 'include',
      });

      const data = await fetchData.json();
      if (data.success) {
        toast.success(data.message);
        history.push('/auth/login');
      } else if (data.error) {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An error occurred while logging out. Please try again.");
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedFile && isUploading) {
        toast.info("Please wait for the profile image to finish uploading");
        return;
      }

      const response = await fetch(SummaryApi.updateUser.url, {
        method: SummaryApi.updateUser.method,
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setCurrentUser(result.data);
        setIsEditing(false);
        setSelectedFile(null);
        fetchCurrentUser(); // Refresh data
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      toast.error("Failed to update user details.");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      uploadProfileImage();
    }
  }, [selectedFile]);

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
                      {isEditing ? (
                        <div className="relative group">
                          <img
                            alt="Profile"
                            src={tempImage || loginIcons}
                            className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                          />
                          <label
                            htmlFor="profileImageUpload"
                            className="absolute bottom-0 right-0 bg-blueGray-700 text-white p-2 rounded-full cursor-pointer hover:bg-blueGray-800"
                          >
                            <FaCloudUploadAlt />
                            <input
                              type="file"
                              id="profileImageUpload"
                              className="hidden"
                              onChange={handleUploadFile}
                              accept="image/*"
                            />
                          </label>
                          {(selectedFile || formData.ProfileImage) && (
                            <button
                              onClick={() => {
                                setSelectedFile(null);
                                setTempImage(null);
                                setFormData(prev => ({ ...prev, ProfileImage: '' }));
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full cursor-pointer hover:bg-red-600"
                            >
                              <MdDelete size={16} />
                            </button>
                          )}
                          {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                              <span className="text-white">Uploading...</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <img
                          alt="Profile"
                          src={currentUser?.ProfileImage || loginIcons}
                          className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                        />
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                    <div className="py-6 px-3 mt-32 sm:mt-0">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleEditClick}
                          className={`ml-2 ${isEditing ? 'bg-orange-dys2' : 'bg-orange-500'} text-white font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150`}
                          type="button"
                          disabled={isEditing}
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="ml-2 bg-red-500 text-white font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                          type="button"
                        >
                          <i className="fas fa-sign-out-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-1">
                    <div className="w-full px-4 text-center mt-20">
                      <div className="flex justify-center py-4 lg:pt-4 pt-8">
                        <div className="lg:mr-4 p-3 text-center">
                          {currentUser?.City && (
                            <div className="lg:mr-4 p-3 text-center">
                              <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                                {currentUser.City}
                              </span>
                              <span className="text-sm text-blueGray-400">City</span>
                            </div>
                          )}
                        </div>
                        {currentUser?.PostalCode && (<div className="lg:mr-4 p-3 text-center">
                          <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                            {currentUser?.PostalCode || 'N/A'}
                          </span>
                          <span className="text-sm text-blueGray-400">Postal Code</span>
                        </div>)}
                      </div>
                    </div>
                  </div>
                </div>
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <h6 className="text-blueGray-400 text-sm mt-6 mb-6 font-bold uppercase">
                      Informations d'utilisateur
                    </h6>
                    <div className="flex flex-wrap">
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                            Prénom
                          </label>
                          <input
                            type="text"
                            name="FirstName"
                            value={formData.FirstName}
                            onChange={handleInputChange}
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholder="Enter your first name"
                            required
                          />
                          {errors.FirstName && <p className="text-red-500 text-sm">{errors.FirstName}</p>}
                        </div>
                      </div>
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                            Nom
                          </label>
                          <input
                            type="text"
                            name="LastName"
                            value={formData.LastName}
                            onChange={handleInputChange}
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholder="Enter your last name"
                            required
                          />
                          {errors.LastName && <p className="text-red-500 text-sm">{errors.LastName}</p>}
                        </div>
                      </div>

                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            name="Phone"
                            value={formData.Phone}
                            onChange={handleInputChange}
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                            Genre                          </label>
                          <select
                            name="Gender"
                            value={formData.Gender}
                            onChange={handleInputChange}
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          >
                            <option value="">Sélectionnez votre genre</option>
                            <option value="male">Homme</option>
                            <option value="female">Femme</option>
                            <option value="other">Autre</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <hr className="mt-6 border-b-1 border-blueGray-300" />

                    <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                      Coordonnées
                    </h6>
                    <div className="flex flex-wrap">
                      <div className="w-full lg:w-12/12 px-4">
                        <div className="relative w-full mb-3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                            Addresse
                          </label>
                          <input
                            type="text"
                            name="Address"
                            value={formData.Address}
                            onChange={handleInputChange}
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholder="Enter your address"
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-4/12 px-4">
                        <div className="relative w-full mb-3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                            Ville
                          </label>
                          <input
                            type="text"
                            name="City"
                            value={formData.City}
                            onChange={handleInputChange}
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholder="Enter your city"
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-4/12 px-4">
                        <div className="relative w-full mb-3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                            Code Postal
                          </label>
                          <input
                            type="text"
                            name="PostalCode"
                            value={formData.PostalCode}
                            onChange={handleInputChange}
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholder="Enter your postal code"
                          />
                        </div>
                      </div>
                    </div>

                    <hr className="mt-6 border-b-1 border-blueGray-300" />

                    <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                      À propos
                    </h6>
                    <div className="flex flex-wrap">
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                            Occupation
                          </label>
                          <input
                            type="text"
                            name="OccupationUser"
                            value={formData.OccupationUser}
                            onChange={handleInputChange}
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholder="Enter your occupation"
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                            Entreprise
                          </label>
                          <input
                            type="text"
                            name="CompagnyUser"
                            value={formData.CompagnyUser}
                            onChange={handleInputChange}
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholder="Enter your company name"
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-12/12 px-4">
                        <div className="relative w-full mb-3">
                          <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                            Biographie
                          </label>
                          <textarea
                            name="Biography"
                            value={formData.Biography}
                            onChange={handleInputChange}
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            rows="4"
                            placeholder="A few words about you..."
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-t bg-white mb-0 px-6 py-6">
                      <div className="text-center flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setSelectedFile(null);
                            setTempImage(currentUser?.ProfileImage || null);
                            fetchCurrentUser();
                          }}
                          className="bg-orange-dys2 text-white active:bg-gray-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-2 ease-linear transition-all duration-150"
                        >
                          Annuler
                        </button>
                        <button
                          className="bg-orange-dys text-white active:bg-orange-dys font-bold uppercase text-xs px-6 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                          type="submit"
                          disabled={isUploading}
                        >
                          {isUploading ? 'Téléchargement...' : 'Mettre à jour le profil'}                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="text-center mt-12">
                    <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                      {currentUser?.FirstName} {currentUser?.LastName}
                    </h3>
                    {currentUser?.Address && (
                      <div className="text-sm leading-normal mt-0 mb-2 text-blueGray-400 font-bold uppercase">
                        <i className="fas fa-map-marker-alt mr-2 text-lg text-blueGray-400"></i>
                        {currentUser.Address}
                      </div>
                    )}

                    {currentUser?.OccupationUser && (
                      <div className="mb-2 text-blueGray-600 mt-10">
                        <i className="fas fa-briefcase mr-2 text-lg text-blueGray-400"></i>
                        {currentUser.OccupationUser}
                      </div>
                    )}

                    {currentUser?.CompagnyUser && (
                      <div className="mb-2 text-blueGray-600">
                        <i className="fas fa-building mr-2 text-lg text-blueGray-400"></i>
                        {currentUser.CompagnyUser}
                      </div>
                    )}

                    {currentUser?.Phone && (
                      <div className="mb-2 text-blueGray-600">
                        <i className="fas fa-phone mr-2 text-lg text-blueGray-400"></i>
                        {currentUser.Phone}
                      </div>
                    )}

                    <div className="mt-10 py-10 border-t border-blueGray-200 text-center">
                      <div className="flex flex-wrap justify-center">
                        <div className="w-full lg:w-9/12 px-4">
                          <p className="mb-4 text-lg leading-relaxed text-blueGray-700">
                            {currentUser?.Biography || "No biography added yet."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}