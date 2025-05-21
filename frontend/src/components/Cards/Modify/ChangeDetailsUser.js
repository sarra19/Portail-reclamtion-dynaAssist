import React, { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { FaUser, FaEnvelope, FaLock, FaCity, FaMapMarkerAlt, FaVenusMars, FaPhone, FaBriefcase, FaBuilding, FaGlobe, FaHome, FaPen } from "react-icons/fa";
import { toast } from 'react-toastify';
import SummaryApi from 'common';
import uploadFile from 'helpers/uploadFile';

const ROLE = {
  ADMIN: 0,
  CLIENT: 1,
  FOURNISSEUR: 2,
};

const ChangeDetailsUser = ({
  user,
  onClose,
  callFunc,
}) => {
  const [formData, setFormData] = useState({
    No_: user.No_,
    FirstName: user.FirstName,
    LastName: user.LastName,
    Email: user.Email,
    Password: user.Password,
    ProfileImage: user.ProfileImage,
    City: user.City,
    PostalCode: user.PostalCode,
    Biography: user.Biography,
    Gender: user.Gender,
    Phone: user.Phone,
    Role: user.Role,
    Verified: user.Verified,
    Country: user.Country,
    Address: user.Address,
    OccupationUser: user.OccupationUser,
    CompagnyUser: user.CompagnyUser,
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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

  const updateUser = async () => {
    try {
      let profileImageUrl = formData.ProfileImage;
      if (selectedFile) {
        const uploadResponse = await uploadFile(selectedFile);
        profileImageUrl = uploadResponse.url;
      }

      const dataToSend = {
        ...formData,
        ProfileImage: profileImageUrl,
      };

      const fetchResponse = await fetch(SummaryApi.updateUserRole.url, {
        method: SummaryApi.updateUserRole.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await fetchResponse.json();

      if (responseData.success) {
        toast.success(responseData.message);
        onClose();
        callFunc();
      } else {
        toast.error(responseData.error || "Erreur lors de la mise à jour de l'utilisateur.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour de l'utilisateur.");
    }
  };

  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 w-full h-50 w-32 flex justify-between items-center bg-slate-200 bg-opacity-50'>
       <div className='mx-auto  bg-white border border-orange-dys  shadow-md p-4 w-32 max-w-sm'>
        <button className="block ml-auto text-gray-600 hover:text-gray-800" onClick={onClose}>
          <IoMdClose size={24} />
        </button>

        <h1 className="pb-4 text-2xl text-orange-dys font-semibold text-center">Modifier les détails de l'utilisateur</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prénom */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaUser className="inline-block mr-2" /> Prénom
            </label>
            <input
              type="text"
              name="FirstName"
              value={formData.FirstName}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              placeholder="Prénom"
            />
          </div>

          {/* Nom */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaUser className="inline-block mr-2" /> Nom
            </label>
            <input
              type="text"
              name="LastName"
              value={formData.LastName}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              placeholder="Nom"
            />
          </div>

          {/* Email */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaEnvelope className="inline-block mr-2" /> Email
            </label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              placeholder="Email"
            />
          </div>

          {/* Mot de passe */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaLock className="inline-block mr-2" /> Mot de passe
            </label>
            <input
              type="password"
              name="Password"
              value={formData.Password}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              placeholder="Mot de passe"
            />
          </div>

          {/* Ville */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaCity className="inline-block mr-2" /> Ville
            </label>
            <input
              type="text"
              name="City"
              value={formData.City}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              placeholder="Ville"
            />
          </div>

          {/* Code Postal */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaMapMarkerAlt className="inline-block mr-2" /> Code Postal
            </label>
            <input
              type="text"
              name="PostalCode"
              value={formData.PostalCode}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              placeholder="Code Postal"
            />
          </div>

          {/* Genre */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaVenusMars className="inline-block mr-2" /> Genre
            </label>
            <select
              name="Gender"
              value={formData.Gender}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            >
              <option value="">Sélectionnez votre genre</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>

          {/* Téléphone */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaPhone className="inline-block mr-2" /> Téléphone
            </label>
            <input
              type="tel"
              name="Phone"
              value={formData.Phone}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              placeholder="Téléphone"
            />
          </div>

          {/* Rôle */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaPen className="inline-block mr-2" /> Rôle
            </label>
            <select
              name="Role"
              value={formData.Role}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            >
              {Object.entries(ROLE).map(([key, value]) => (
                <option value={value} key={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Pays */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaGlobe className="inline-block mr-2" /> Pays
            </label>
            <input
              type="text"
              name="Country"
              value={formData.Country}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              placeholder="Pays"
            />
          </div>

          {/* Adresse */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaHome className="inline-block mr-2" /> Adresse
            </label>
            <input
              type="text"
              name="Address"
              value={formData.Address}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              placeholder="Adresse"
            />
          </div>

          {/* Profession */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaBriefcase className="inline-block mr-2" /> Profession
            </label>
            <input
              type="text"
              name="OccupationUser"
              value={formData.OccupationUser}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              placeholder="Profession"
            />
          </div>

          {/* Entreprise */}
          <div className="relative w-full">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaBuilding className="inline-block mr-2" /> Entreprise
            </label>
            <input
              type="text"
              name="CompagnyUser"
              value={formData.CompagnyUser}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              placeholder="Entreprise"
            />
          </div>

          {/* Biographie */}
          <div className="relative w-full col-span-2">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaPen className="inline-block mr-2" /> Biographie
            </label>
            <textarea
              name="Biography"
              value={formData.Biography}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              rows="4"
              placeholder="Biographie"
            ></textarea>
          </div>

          {/* Image de profil */}
          <div className="relative w-full col-span-2">
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
              <FaPen className="inline-block mr-2" /> Image de profil
            </label>
            <input
              type="file"
              onChange={handleUploadFile}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="bg-orange-dys text-white active:bg-orange-dys font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
            onClick={updateUser}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeDetailsUser;