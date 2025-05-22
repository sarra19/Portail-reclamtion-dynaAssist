import React, { useEffect, useRef, useState } from "react";
import { FaCamera, FaEye, FaEyeSlash } from 'react-icons/fa';
import loginIcons from '../../assets/img/signup.gif';
import SummaryApi from '../../api/common';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import uploadFile from '../../helpers/uploadFile';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Link } from 'react-router-dom';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [descriptors, setDescriptors] = useState([]);
  const [data, setData] = useState({
    Email: '',
    FirstName: '',
    LastName: '',
    Password: '',
    confirmPassword: '',
    ProfileImage: '',
  });
  const [errors, setErrors] = useState({});

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
const detectFaces = async () => {
  setError(null);

  // Capture webcam
  const imageSrc = webcamRef.current.getScreenshot();
  setImageSrc(imageSrc);

  // Création de l'élément img dynamique
  const img = new Image();
  img.src = imageSrc;

  // Attendre que l'image soit chargée
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error("Erreur lors du chargement de l'image"));
  });

  // Utiliser l'image chargée dans face-api
  const detections = await faceapi
    .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (detections.length === 0) {
    toast.error("Aucun visage détecté. Veuillez réessayer.");
    setDescriptors([]);
  } else {
    setDescriptors(detections[0].descriptor);
    toast.success("Visage capturé avec succès !");
  }
};

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
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

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Type de fichier invalide. Veuillez télécharger une image (JPEG, PNG, GIF).");
      return;
    }

    if (file.size > maxSize) {
      toast.error("La taille du fichier dépasse la limite de 5 Mo.");
      return;
    }

    setData((prev) => ({
      ...prev,
      ProfileImage: file,
    }));
    setSelectedFile(file);
    toast.success("Image de profil sélectionnée avec succès !");
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'Email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Format d’e-mail invalide.';
        }
        break;

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

      case 'Password':
        const motdePasseError = validateMotdePasse(value);
        if (motdePasseError) {
          error = motdePasseError;
        }
        break;

      case 'confirmPassword':
        if (value !== data.Password) {
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

  const validateMotdePasse = (password) => {
    const lengthValid = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!lengthValid) return 'Le mot de passe doit faire au moins 8 caractères.';
    if (!hasUpperCase) return 'Le mot de passe doit contenir au moins une majuscule.';
    if (!hasLowerCase) return 'Le mot de passe doit contenir au moins une minuscule.';
    if (!hasNumber) return 'Le mot de passe doit contenir au moins un chiffre.';
    if (!hasSpecialChar) return 'Le mot de passe doit contenir au moins un caractère spécial.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['Email', 'FirstName', 'LastName', 'Password', 'confirmPassword'];
    let newErrors = {};

    requiredFields.forEach(field => {
      if (!data[field] || data[field].trim() === '') {
        newErrors[field] = `${field} est requis.`;
      } else {
        validateField(field, data[field]);
      }
    });

    if (data.Password && data.confirmPassword && data.Password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    if (descriptors.length === 0) {
      toast.error("Veuillez capturer votre visage.");
      return;
    }

    try {
      let profileImageUrl = '';
      if (selectedFile) {
        const fileUploadResponse = await uploadFile(selectedFile);
        profileImageUrl = fileUploadResponse.url;
      }

      const userData = {
        ...data,
        ProfileImage: profileImageUrl,
        descriptor: Object.values(descriptors),
      };

      const dataResponse = await fetch(SummaryApi.signUP.url, {
        method: SummaryApi.signUP.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const dataApi = await dataResponse.json();

      if (dataApi.success) {
        toast.success(dataApi.message);
        setData({
          Email: '',
          FirstName: '',
          LastName: '',
          Password: '',
          confirmPassword: '',
          ProfileImage: '',
        });
        setDescriptors([]);
            setSelectedFile('');

        setImageSrc(null);
      } else if (dataApi.error) {
        toast.error(dataApi.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      toast.error("Une erreur s’est produite lors de l’inscription.");
    }
  };
    const googleAuth = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
  };

  const facebookAuth = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/facebook`;
  };

  const githubAuth = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/github`;
  };


return (
    <>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        <div className="container mx-auto px-4 h-full">
        <div className="flex  flex-col lg:flex-row content-center items-center justify-start h-full relative   min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
          {/* Left Column - Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            <div className="text-center mb-8">
          <img
            src={require("assets/img/dyn1.png")}
            className="h-16 mx-auto mb-4"
            alt="Logo"
          />
          <h1 className="text-3xl font-bold text-gray-800">Créer un compte</h1>
          <p className="text-gray-600 mt-2">Rejoignez notre communauté dès aujourd'hui</p>
        </div>

        {/* Social Buttons */}
        <div className="btn-wrapper text-center flex justify-center space-x-2 mb-6">
         <button onClick={githubAuth} type="button" className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150">
                    <img alt="Github" className="w-5 mr-1" src={require("assets/img/github.svg").default} />Github
                  </button>
                  <button onClick={googleAuth} type="button" className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150">
                    <img alt="Google" className="w-5 mr-1" src={require("assets/img/google.svg").default} />Google
                  </button>
                  <button onClick={facebookAuth} type="button" className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150">
                    <img alt="Facebook" className="w-5 mr-1" src={require("assets/img/facebook.svg").default} />Facebook
                  </button>
        </div>

        <hr className="mt-6 border-b-1 border-blueGray-300" />

        <div className="text-blueGray-400 text-center mb-3 font-bold">
          <small>Ou saisissez vos informations</small>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image Upload */}
         <div className="w-16 h-16 mx-auto relative overflow-hidden rounded-full mb-4">
  <label className="absolute inset-0 cursor-pointer z-10">
    <img
      src={selectedFile ? URL.createObjectURL(selectedFile) : loginIcons}
      alt="profile"
      className="object-cover w-full h-full pointer-events-none"
    />
    <input
      type="file"
      className="hidden"
      onChange={handleUploadFile}
      accept="image/*"
    />
  </label>
</div>


          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2 mt-1 ">Prénom *</label>
              <input
                type="text"
                name="FirstName"
                value={data.FirstName}
                onChange={handleOnChange}
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                placeholder="Votre prénom"
              />
              {errors.FirstName && (
                <p className="mt-1 text-sm text-red-500">{errors.FirstName}</p>
              )}
            </div>
            <div>
              <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2 mt-1 ">Nom *</label>
              <input
                type="text"
                name="LastName"
                value={data.LastName}
                onChange={handleOnChange}
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                placeholder="Votre nom"
              />
              {errors.LastName && (
                <p className="mt-1 text-sm text-red-500">{errors.LastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2 mt-1 ">Email *</label>
            <input
              type="email"
              name="Email"
              value={data.Email}
              onChange={handleOnChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              placeholder="email@exemple.com"
            />
            {errors.Email && (
              <p className="mt-1 text-sm text-red-500">{errors.Email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2 mt-1 ">Mot de passe *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="Password"
                value={data.Password}
                onChange={handleOnChange}
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-gray-500  mt-4 ml-2 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.Password && (
              <p className="mt-1 text-sm text-red-500">{errors.Password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2 mt-1 ">Confirmer le mot de passe *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleOnChange}
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-gray-500  mt-4 ml-2 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>


          {/* Submit Button */}
          <div className="text-center mt-6">
            <button
              className="bg-orange-dys text-white active:bg-orange-dys text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none w-full ease-linear transition-all duration-150"
              type="submit"
              disabled={descriptors.length === 0}
            >
              {descriptors.length === 0 ? 'Capturez votre visage d’abord' : 'Créer un compte'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte?{" "}
            <Link to="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
          </div>

          {/* Right Column - Face Capture */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 lg:p-12 flex flex-col items-center justify-center text-gray-800">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Reconnaissance faciale</h2>
              <p className="opacity-90">
                Pour votre sécurité, nous vérifions votre identité
              </p>
            </div>

            <div className="w-full max-w-xs bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                height="auto"
                className="rounded-lg border-2 border-white border-opacity-30"
              />
            </div>

            <button
            type="button"
            className="w-full  mt-4 bg-white text-blue-600 hover:bg-gray-100 font-medium py-2 px-6 rounded-full flex items-center justify-center shadow-lg transition-all"
            onClick={detectFaces}
          >
            <FaCamera className="mr-2" />
            Capturer mon visage
          </button>
            {imageSrc && (
              <div className="mt-6 text-center">
                <p className="font-medium mb-2">Visage capturé</p>
                <img
                  id="myImg"
                  src={imageSrc}
                  className="w-32 h-32 object-cover rounded-lg border-2 border-white border-opacity-50 mx-auto"
                  alt="Captured face"
                />
              </div>
            )}

            <div className="mt-8 text-sm text-gray-800 text-opacity-80 max-w-md">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-medium mb-2">Conseils pour une bonne capture :</h3>
                <ul className="space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Placez-vous dans un endroit bien éclairé</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Regardez directement la caméra</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Enlevez vos lunettes si nécessaire</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Assurez-vous que votre visage est bien visible</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}