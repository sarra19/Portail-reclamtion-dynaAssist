import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SummaryApi from "../../../api/common";
import uploadFile from "../../../helpers/uploadFile";
import loginIcons from '../../../assets/img/signup.gif';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { useHistory } from 'react-router-dom';

export default function CardAddUser() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [descriptors, setDescriptors] = useState([]);
  const history = useHistory();
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    Email: "",
    Password: "",
    confirmPassword: "",
    FirstName: "",
    LastName: "",
    ProfileImage: "",
    Verified: 0,
    City: "",
    PostalCode: "",
    Biography: "",
    Phone: "",
    Gender: "",
    Country: "",
    Address: "",
    OccupationUser: "",
    CompagnyUser: "",
  });

  // Load face-api models
  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    } catch (e) {
      console.log('Erreur lors du chargement des modèles : ', e);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Aucun fichier sélectionné.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Type de fichier invalide. Veuillez télécharger une image (JPEG, PNG, GIF), PDF, DOC ou DOCX.");
      return;
    }
    if (file.size > maxSize) {
      toast.error("La taille du fichier dépasse la limite de 5 Mo.");
      return;
    }

    setSelectedFile(file);
    setFormData((prev) => ({
      ...prev,
      ProfileImage: file,
    }));
    toast.success("Fichier sélectionné avec succès !");
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'FirstName':
        if (value.trim().length < 3) {
          error = 'Le prénom doit comporter au moins 3 caractères.';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Le prénom ne peut contenir que des lettres et des espaces.';
        }
        break;
      case 'LastName':
        if (value.trim().length < 3) {
          error = 'Le nom doit comporter au moins 3 caractères.';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Le nom ne peut contenir que des lettres et des espaces.';
        }
        break;
      case 'Email':
        if (!value.trim()) error = 'L’e-mail est requis.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Format d’e-mail invalide.';
        break;
      case 'Password':
        if (!value.trim()) error = 'Le mot de passe est requis.';
        else {
          const lengthValid = value.length >= 8;
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumber = /[0-9]/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
          if (!lengthValid) error = 'Le mot de passe doit faire au moins 8 caractères.';
          else if (!hasUpperCase) error = 'Le mot de passe doit contenir au moins une majuscule.';
          else if (!hasLowerCase) error = 'Le mot de passe doit contenir au moins une minuscule.';
          else if (!hasNumber) error = 'Le mot de passe doit contenir au moins un chiffre.';
          else if (!hasSpecialChar) error = 'Le mot de passe doit contenir au moins un caractère spécial.';
        }
        break;
      case 'confirmPassword':
        if (!value.trim()) error = 'Veuillez confirmer le mot de passe.';
        else if (value !== formData.Password) error = 'Les mots de passe ne correspondent pas.';
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateAllFields = () => {
    const requiredFields = ['FirstName', 'LastName', 'Email', 'Password', 'confirmPassword'];
    let isValid = true;

    requiredFields.forEach(field => {
      validateField(field, formData[field]);
      if (!formData[field]) isValid = false;
    });

    if (formData.Password !== formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Les mots de passe ne correspondent pas.'
      }));
      isValid = false;
    }

    return isValid;
  };

  const detectFaces = async () => {
    try {
      const image = webcamRef.current.getScreenshot();
      setImageSrc(image);

      const input = document.createElement('img');
      input.src = image;
      input.id = 'myImgTemp';
      document.body.appendChild(input);

      await new Promise(resolve => input.onload = resolve); // Wait for image to load

      const detections = await faceapi.detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      document.body.removeChild(input);

      if (!detections) {
        toast.error("Aucun visage détecté. Veuillez réessayer.");
        setImageSrc(null);
        setDescriptors([]);
        return;
      }

      setDescriptors(detections.descriptor);
      toast.success("Visage capturé avec succès !");
    } catch (error) {
      console.error("Error detecting face:", error);
      toast.error("Une erreur est survenue lors de la détection du visage.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllFields()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    if (descriptors.length === 0) {
      toast.error("Veuillez capturer votre visage.");
      return;
    }

    try {
      let profileImageUrl = '';
      if (formData.ProfileImage && selectedFile) {
        const uploadResponse = await uploadFile(formData.ProfileImage);
        profileImageUrl = uploadResponse.url;
      }

      const dataToSend = {
        ...formData,
        ProfileImage: profileImageUrl,
        descriptor: Object.values(descriptors),
      };

      const response = await fetch(SummaryApi.signUP.url, {
        method: SummaryApi.signUP.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const dataResponse = await response.json();

      if (dataResponse.success) {
        toast.success(dataResponse.message);
        setFormData({
          Email: "",
          Password: "",
          confirmPassword: "",
          FirstName: "",
          LastName: "",
          ProfileImage: "",
          Verified: 0,
          City: "",
          PostalCode: "",
          Biography: "",
          Phone: "",
          Gender: "",
          Country: "",
          Address: "",
          OccupationUser: "",
          CompagnyUser: "",
        });
        setSelectedFile(null);
        setDescriptors([]);
        setImageSrc(null);
        history.push("/admin/users");
      } else {
        if (dataResponse.errors) {
          dataResponse.errors.forEach((err) => {
            toast.error(`${err.message}`);
          });
        } else {
          toast.error(dataResponse.message || "Erreur lors de l’ajout de l’utilisateur.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de l’ajout de l’utilisateur :", error);
      toast.error("Une erreur s’est produite lors de l’ajout de l’utilisateur.");
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <h6 className="text-orange-dys mb-4 text-xl mt-12 font-bold flex justify-center">
            Ajouter un utilisateur
          </h6>
          <form onSubmit={handleSubmit}>
            {/* Face Capture */}
        
            <div className="w-full px-4">
              <div className="relative w-full mb-6">
                <div className="w-16 h-16 text-center mx-auto relative overflow-hidden rounded-full">
                  <div>
                    <img
                      src={selectedFile ? URL.createObjectURL(selectedFile) : loginIcons}
                      alt='profile'
                      className='object-cover w-full h-full'
                    />
                  </div>
                  <label>
                    <div className="text-xs bg-opacity-80 bg-slate-200 pb-4 pt-2 cursor-pointer text-center absolute bottom-0 w-full"></div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadFile} />
                  </label>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={300}
                height={300}
                className='webcam mx-auto'
              />
                <button
                      type="button"
                      style={{
                        width: "100%",
                        backgroundColor: "white",
                        color: "blue",
                        marginTop: '10px',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                      onClick={detectFaces}
                    >
                      Capturer le visage
                    </button>
              {imageSrc && (
                <img
                  id="myImg"
                  src={imageSrc}
                  alt="Captured face"
                  className="mx-auto mt-2"
                  style={{ maxWidth: '300px', maxHeight: '300px' }}
                />
              )}
            </div>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Prénom</label>
                  <input
                    type="text"
                    name="FirstName"
                    value={formData.FirstName}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Entrez votre prénom"
                  />
                  {errors.FirstName && <p className="text-red-500 text-xs mt-1">{errors.FirstName}</p>}
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Nom</label>
                  <input
                    type="text"
                    name="LastName"
                    value={formData.LastName}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Entrez votre nom"
                  />
                  {errors.LastName && <p className="text-red-500 text-xs mt-1">{errors.LastName}</p>}
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Email</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Entrez votre email"
                  />
                  {errors.Email && <p className="text-red-500 text-xs mt-1">{errors.Email}</p>}
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Mot de passe</label>
                  <div className="flex">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="Password"
                      value={formData.Password}
                      onChange={handleInputChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Entrez votre mot de passe"
                    />
                    <div className="ml-2 mt-3 cursor-pointer text-xl" onClick={() => setShowPassword((prev) => !prev)}>
                      <span>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
                    </div>
                  </div>
                  {errors.Password && <p className="text-red-500 text-xs mt-1">{errors.Password}</p>}
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Confirmer le mot de passe</label>
                  <div className="flex">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Confirmez votre mot de passe"
                    />
                    <div className="ml-2 mt-3 cursor-pointer text-xl" onClick={() => setShowConfirmPassword((prev) => !prev)}>
                      <span>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</span>
                    </div>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="Phone"
                    value={formData.Phone}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Entrez votre numéro de téléphone"
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Genre</label>
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
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Rôle</label>
                  <select
                    name="Role"
                    value={formData.Role}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  >
                    <option value="1">Client</option>
                    <option value="2">Fournisseur</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="mt-6 border-b-1 border-blueGray-300" />

            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              Informations de contact
            </h6>

            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Adresse</label>
                  <input
                    type="text"
                    name="Address"
                    value={formData.Address}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Entrez votre adresse"
                  />
                </div>
              </div>
              <div className="w-full lg:w-4/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Pays</label>
                  <input
                    type="text"
                    name="Country"
                    value={formData.Country}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Entrez votre pays"
                  />
                </div>
              </div>
              <div className="w-full lg:w-4/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Ville</label>
                  <input
                    type="text"
                    name="City"
                    value={formData.City}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Entrez votre ville"
                  />
                </div>
              </div>
              <div className="w-full lg:w-4/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Code Postal</label>
                  <input
                    type="text"
                    name="PostalCode"
                    value={formData.PostalCode}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Entrez votre code postal"
                  />
                </div>
              </div>
            </div>

            <hr className="mt-6 border-b-1 border-blueGray-300" />

            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              À propos
            </h6>

            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Biographie</label>
                  <textarea
                    name="Biography"
                    value={formData.Biography}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    rows="4"
                    placeholder="Entrez une courte biographie"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="rounded-t bg-white mb-0 px-6 py-6">
              <div className="text-center flex justify-end">
              <div className="text-center mt-6">
                    <button
                      className="bg-orange-dys text-white active:bg-orange-dys text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                      type="submit"
                      disabled={descriptors.length === 0}
                    >
                      {descriptors.length === 0 ? 'Capturez votre visage d’abord' : 'Créer un compte'}
                    </button>
                  </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}