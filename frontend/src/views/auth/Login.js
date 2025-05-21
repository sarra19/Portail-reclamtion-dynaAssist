import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SummaryApi from '../../api/common';
import Context from '../../context';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'face'
  const { fetchUserDetails, setEmail, setOTP } = useContext(Context);
  const history = useHistory();

  const [data, setData] = useState({
    Email: "",
    Password: "",
    descriptor: ""
  });

  const [descriptors, setDescriptors] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const webcamRef = useRef(null);
  const [errors, setErrors] = useState({});

  const navigateToOtp = async () => {
    if (data.Email) {
      const OTP = Math.floor(Math.random() * 9000 + 1000);
      setOTP(OTP);
      setEmail(data.Email);

      try {
        const response = await fetch(SummaryApi.sendRecoveryEmail.url, {
          method: SummaryApi.sendRecoveryEmail.method,
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            OTP,
            recipient_email: data.Email,
          }),
        });

        if (response.ok) {
          history.push('/auth/otp');
        } else {
          toast.error("Échec de l'envoi du code OTP.");
        }
      } catch (error) {
        toast.error("Erreur lors de l'envoi du code OTP.");
      }
    } else {
      toast.error("Veuillez entrer votre email");
    }
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

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

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'Email':
        if (!value) {
          error = 'L’email est requis.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Format d’e-mail invalide.';
        }
        break;
      case 'Password':
        if (!value) {
          error = 'Le mot de passe est requis.';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!data.Email) newErrors.Email = 'L’email est requis.';
    if (!data.Password) newErrors.Password = 'Le mot de passe est requis.';

    setErrors(newErrors);

    if (Object.values(newErrors).some(err => err)) {
      toast.error("Veuillez remplir tous les champs requis.");
      return;
    }

    try {
      const response = await fetch(SummaryApi.signIn.url, {
        method: SummaryApi.signIn.method,
        credentials: 'include',
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          Email: data.Email,
          Password: data.Password
        })
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success(responseData.message);
          await fetch(SummaryApi.addHistorique.url, {
          method: SummaryApi.addHistorique.method,
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            UserId: responseData.userId,
            Activity: 'Connexion à l\'application avec email',
          })
        });
        history.push('/');
        fetchUserDetails();
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de la connexion.');
    }
  };

  const handleFaceLogin = async (e) => {
    e.preventDefault();

    if (descriptors.length === 0) {
      toast.error("Veuillez capturer votre visage.");
      return;
    }

    try {
      const response = await fetch(SummaryApi.signInFace.url, {
        method: SummaryApi.signInFace.method,
        credentials: 'include',
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          Email: data.Email,
          descriptors: Array.from(descriptors)
        })
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success(responseData.message);

        await fetch(SummaryApi.addHistorique.url, {
          method: SummaryApi.addHistorique.method,
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            UserId: responseData.userId,
            Activity: 'Connexion à l\'application avec reconnaissance faciale',
          })
        });

        history.push('/');
        fetchUserDetails();
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      toast.error('Erreur lors de la connexion par reconnaissance faciale.');
    }
  };

  const handleSubmit = loginMethod === 'email' ? handleEmailLogin : handleFaceLogin;

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
      <ToastContainer position='top-center' />
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-start h-full">
          <div className="w-full lg:w-5/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
              <div className="rounded-t mb-0 px-6 py-6">
                <div className="text-center mb-3">
                  <div className="flex justify-center mb-3">
                    <img
                      src={require("assets/img/dyn1.png")}
                      className="h-16"
                      alt="Logo"
                    />
                  </div>
                  <h6 className="text-blueGray-500 text-sm font-bold">
                    Connectez-vous avec
                  </h6>
                </div>
                <div className="btn-wrapper text-center flex justify-center space-x-2">
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
              </div>

              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="text-blueGray-400 text-center mb-3 font-bold">
                  <small>Ou connectez-vous avec vos identifiants</small>
                </div>

                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => setLoginMethod('email')}
                    className={`px-4 py-2 mr-2 rounded ${loginMethod === 'email' ? 'bg-orange-dys text-white' : 'bg-gray-200'}`}
                  >
                    Email/Mot de passe
                  </button>
                  <button
                    onClick={() => setLoginMethod('face')}
                    className={`px-4 py-2 rounded ${loginMethod === 'face' ? 'bg-orange-dys text-white' : 'bg-gray-200'}`}
                  >
                    Reconnaissance Faciale
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {loginMethod === 'email' ? (
                    <>
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Email</label>
                        <input
                          type='email'
                          placeholder='Entrez votre email'
                          name='Email'
                          value={data.Email}
                          onChange={handleOnChange}
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                        {errors.Email && <p className="text-red-500 text-sm mt-1">{errors.Email}</p>}
                      </div>

                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Mot de passe</label>
                        <div className="flex">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Entrez votre mot de passe"
                            value={data.Password}
                            name='Password'
                            onChange={handleOnChange}
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          />
                          <div className='ml-2 mt-3 cursor-pointer text-xl' onClick={() => setShowPassword(prev => !prev)}>
                            <span>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
                          </div>
                        </div>
                        {errors.Password && <p className="text-red-500 text-sm mt-1">{errors.Password}</p>}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Email</label>
                        <input
                          type='email'
                          placeholder='Entrez votre email'
                          name='Email'
                          value={data.Email}
                          onChange={handleOnChange}
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                                                {errors.Email && <p className="text-red-500 text-sm mt-1">{errors.Email}</p>}

                      </div>

                      <div style={{ display: 'flex', flexDirection: "column" }}>
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
                                   className="w-full  mt-4 bg-white text-blue-600 hover:bg-gray-100 font-medium py-2 px-6 rounded-full flex items-center justify-center shadow-lg transition-all"
                                   onClick={detectFaces}
                                 >
                                   <FaCamera className="mr-2" />
                                   Capturer mon visage
                                 </button>
                      </div>
                      <img
                        id="myImg"
                        className='img mx-auto mt-2'
                        src={imageSrc}
                        style={{
                          display: `${imageSrc ? 'block' : 'none'}`,
                          maxWidth: '300px',
                          maxHeight: '300px'
                        }}
                        alt="Visage capturé"
                      />
                    </>
                  )}

                  <div className="text-center mt-6">
                    <button
                      className="bg-orange-dys text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                      type="submit"
                      disabled={loginMethod === 'face' && descriptors.length === 0}
                    >
                      {loginMethod === 'email'
                        ? 'Se connecter'
                        : descriptors.length === 0
                          ? 'Capturez votre visage d’abord'
                          : 'Connexion par visage'}
                    </button>

                  </div>
                </form>

                <div className="flex flex-wrap mt-6 relative">
                  <div className="w-1/2">
                    <button onClick={navigateToOtp} className="text-blueGray-600">
                      <small>Mot de passe oublié ?</small>
                    </button>
                  </div>
                  <div className="w-1/2 text-right">
                    <Link to="/auth/register" className="text-blueGray-600">
                      <small>Créer un compte</small>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}