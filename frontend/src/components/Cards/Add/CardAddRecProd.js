import React, { useState, useEffect } from "react";
import SummaryApi from '../../../api/common';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import uploadFile from '../../../helpers/uploadFile';
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import DisplayImage from "helpers/DisplayImage";
import SuggestionsModal from "../SuggestionsModal";
import { useSelector } from "react-redux";

export default function CardAddRec() {
    const [ComplaintType, setComplaintType] = useState("0");
    const { id } = useParams();
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState("");
    const [SubjectsReclamation, setSujetsReclamation] = useState([]);
    const [nouveauSujet, setNouveauSujet] = useState("");
    const [showAutreInput, setShowAutreInput] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [transcription, setTranscription] = useState("");
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [data, setData] = useState({
        Name: "",
        TargetType: "Product",
        Subject: "",
        ComplaintType: "0",
        AttachedFile: [],
        Content: "",
        VoiceNote: null,
    });
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false); // Nouvel état pour le modal

    const openSuggestionsModal = () => {
        setIsSuggestionsModalOpen(true);
    };

    const closeSuggestionsModal = () => {
        setIsSuggestionsModalOpen(false);
    };

    const handleContentChange = (e) => {
        const newContent = e.target.value;
        setData((prev) => ({ ...prev, Content: newContent }));

        // Only fetch suggestions if content is meaningful
        if (newContent.length > 10) {
            const debounceTimer = setTimeout(() => {
                fetchSuggestions(newContent);
            }, 1000);

            return () => clearTimeout(debounceTimer);
        } else {
            setSuggestions([]);
        }
    };
    const fetchSuggestions = async (content) => {
        if (!content || content.trim().length < 5) {
            setSuggestions([]);
            return;
        }

        setIsLoadingSuggestions(true);
        try {
            const response = await fetch(SummaryApi.suggestions.url, {
                method: SummaryApi.suggestions.method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            const result = await response.json();
            if (result.success && result.suggestions?.length > 0) {
                setSuggestions(result.suggestions);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            toast.error("Failed to load suggestions");
        } finally {
            setIsLoadingSuggestions(false);
        }
    };


    // Fetch current user details
    const currentUser = useSelector(state => state?.user?.user)


    // Fetch product details
    const fetchProductDetails = async () => {
        try {
            const response = await fetch(`${SummaryApi.productDetails.url}/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error("Erreur lors de la récupération des données");
            const dataResponse = await response.json();
            if (dataResponse?.product) {
                setData((prev) => ({ ...prev, TargetType: "Product", Name: dataResponse.product.Name }));
            } else {
                toast.error("Aucune donnée trouvée pour ce produit.");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des données :", error);
            toast.error("Impossible de charger les détails du produit.");
        }
    };

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    // Handle reclamation type change
    const handleReclamationTypeChange = (event) => {
        const selectedType = event.target.value;
        setComplaintType(selectedType);
        setData((prev) => ({ ...prev, ComplaintType: selectedType }));
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            recorder.start();
            setIsRecording(true);
            const audioChunks = [];
            recorder.ondataavailable = (event) => audioChunks.push(event.data);
            recorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: "audio/mpeg" });
                setAudioBlob(blob);
                setData((prev) => ({ ...prev, VoiceNote: blob }));
                // Automatically transcribe when recording stops
                transcribeAudio(blob);
            };
        } catch (error) {
            console.error("Erreur lors du démarrage de l'enregistrement :", error);
            toast.error("Impossible d'accéder au micro.");
        }
    };

    const stopRecording = () => mediaRecorder && mediaRecorder.stop();

    const transcribeAudio = async (blob) => {
        if (!blob) {
            toast.error("Aucun enregistrement audio à transcrire");
            return;
        }
        setIsTranscribing(true);
        try {
            const formData = new FormData();
            const audioFile = new File([blob], "recording.mp3", { type: "audio/mpeg" });
            formData.append("audio", audioFile);
            const response = await fetch(SummaryApi.speechToText.url, {
                method: SummaryApi.speechToText.method,
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                setData((prev) => ({ ...prev, Content: result.transcription }));
                toast.success("Transcription réussie !");
                fetchSuggestions(result.transcription);

            } else {
                toast.error(result.message || "Échec de la transcription");
            }
        } catch (error) {
            console.error("Erreur lors de la transcription:", error);
            toast.error("Erreur lors de la transcription vocale");
        } finally {
            setIsTranscribing(false);
        }
    };

    // Handle file upload
    const handleUploadFile = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            toast.error("No file selected.");
            return;
        }

        setData((prev) => ({ ...prev, AttachedFile: [...prev.AttachedFile, file] }));
        toast.success("File selected successfully!");
    };

    // Delete uploaded file
    const handleDeleteImage = (index) => {
        const newFiles = [...data.AttachedFile];
        newFiles.splice(index, 1);
        setData((prev) => ({ ...prev, AttachedFile: newFiles }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset errors
        const newErrors = {};

        // Validate Subject
        if (!data.Subject.trim()) {
            newErrors.Subject = "Le sujet est requis.";
        }

        // Validate Content (for text-based complaints)
        if (ComplaintType === "0" && (!data.Content.trim() || data.Content.length < 10 || data.Content.length > 1000)) {
            newErrors.Content = "La description doit contenir entre 10 et 1000 caractères.";
        }

        // If there are errors, stop submission
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const formData = {
                Name: data.Name,
                TargetType: data.TargetType,
                Subject: data.Subject,
                ComplaintType: data.ComplaintType,
                Content: data.Content,
                VoiceNote: null,
                AttachedFile: "",
                ProductId: id,
            };

            // Handle VoiceNote upload if present
            if (audioBlob) {
                const audioFile = new File([audioBlob], "recording.mp3", { type: "audio/mpeg" });
                const audioUploadResponse = await uploadFile(audioFile);
                formData.VoiceNote = audioUploadResponse.url;
            }

            // Handle AttachedFile uploads if present
            if (data.AttachedFile.length > 0) {
                const fileUrls = [];
                for (const file of data.AttachedFile) {
                    const fileUploadResponse = await uploadFile(file);
                    fileUrls.push(fileUploadResponse.url);
                }
                formData.AttachedFile = fileUrls.join(",");
            }

            // Determine API URL and method based on user role
            const apiUrl = currentUser?.Role === 0
                ? SummaryApi.addRecToVendor.url
                : SummaryApi.addRecToAdmin.url;
            const apiMethod = currentUser?.Role === 0
                ? SummaryApi.addRecToVendor.method
                : SummaryApi.addRecToAdmin.method;

            // Submit the form data
            const response = await fetch(apiUrl, {
                method: apiMethod,
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) {
                if (result.errors) {
                    result.errors.forEach(err => toast.error(`${err.message}`));
                } else {
                    toast.error(result.message || "Erreur lors de la soumission de la réclamation.");
                }
            } else {
                toast.success(result.message);
                setIsSubmitted(true);

                // Reset form data and errors
                setData({
                    Name: "",
                    TargetType: "Product",
                    Subject: "",
                    ComplaintType: "0",
                    AttachedFile: [],
                    Content: "",
                    VoiceNote: null,
                });
                setNouveauSujet("");
                setShowAutreInput(false);
                setComplaintType("0");
                setAudioBlob(null);
                setErrors({});

                // Log activity
                const activityDescription = `Envoi une réclamation pour ${data.TargetType} ${data.Name}`;
                await fetch(SummaryApi.addHistorique.url, {
                    method: SummaryApi.addHistorique.method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        UserId: currentUser.No_,
                        Activity: activityDescription,
                    }),
                });
            }
        } catch (error) {
            console.error("Error during reclamation submission:", error);
            toast.error("An error occurred while submitting the reclamation.");
        }
    };

    // Handle subject selection or custom input
    const handleSujetChange = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === "Autre") {
            setShowAutreInput(true);
            setData((prev) => ({ ...prev, Subject: "" }));
        } else {
            setShowAutreInput(false);
            setData((prev) => ({ ...prev, Subject: selectedValue }));
        }
    };

    // Add custom subject
    const ajouterNouveauSujet = () => {
        if (nouveauSujet.trim() === "") {
            toast.error("Veuillez saisir un sujet valide.");
            return;
        }
        if (!SubjectsReclamation.includes(nouveauSujet)) {
            setSujetsReclamation((prev) => [...prev, nouveauSujet]);
            setData((prev) => ({ ...prev, Subject: nouveauSujet }));
            setNouveauSujet("");
            setShowAutreInput(false);
            toast.success("Nouveau sujet ajouté avec succès !");
        } else {
            toast.error("Ce sujet existe déjà dans la liste.");
        }
    };

    // Set predefined subjects based on product name
    useEffect(() => {
        const predefinedProducts = [
            "Microsoft Dynamics 365 Business Central",
            "Microsoft Power Platform",
            "Développement Spécifique"
        ];
        if (predefinedProducts.includes(data.Name)) {
            if (data.Name === "Microsoft Dynamics 365 Business Central") {
                setSujetsReclamation([
                    "Problèmes de configuration",
                    "Erreurs de migration des données",
                    "Manque de formation",
                    "Délais de déploiement non respectés",
                    "Compatibilité matérielle/logicielle",
                    "Problèmes de performance",
                    "Manque de support technique",
                    "Facturation excessive",
                    "Problèmes de personnalisation",
                    "Autre",
                ]);
                setShowAutreInput(false);
            } else if (data.Name === "Microsoft Power Platform") {
                setSujetsReclamation([
                    "Problèmes de configuration",
                    "Manque de fonctionnalités",
                    "Problèmes de performance",
                    "Manque de support technique",
                    "Facturation excessive",
                    "Autre",
                ]);
                setShowAutreInput(false);
            } else if (data.Name === "Développement Spécifique") {
                setSujetsReclamation([
                    "Bugs ou erreurs dans le développement",
                    "Délais de livraison non respectés",
                    "Manque de documentation",
                    "Problèmes de compatibilité",
                    "Manque de tests",
                    "Facturation excessive",
                    "Autre",
                ]);
                setShowAutreInput(false);
            }
        } else {
            setSujetsReclamation([]);
            setShowAutreInput(true);
        }
    }, [data.Name]);

    return (
        <>
            <ToastContainer position='top-center' />
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
                <div className="rounded-t bg-white mb-0 px-6 py-6 mt-4 flex justify-center">
                    <div className="text-center flex justify-between">
                        <h6 className="text-blueGray-700 text-xl font-bold">
                            Saisir votre Réclamation pour le {data.TargetType}
                            <span className="text-orange-dys font-semibold"> {data.Name}</span>
                        </h6>
                    </div>
                </div>
                <div className="flex-auto px-4 lg:px-10 py-10 mt-2">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-wrap">
                            {/* Subject Field */}
                            <div className="w-full lg:w-6/12 px-4">
                                <div className="relative w-full mb-3">
                                    {/* Helper Text */}

                                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Subject">
                                        Sujet
                                    </label>
                                    <p className="text-xs text-gray-600 mb-1">
                                        Sélectionnez ou saisissez un sujet pertinent.
                                    </p>
                                    {SubjectsReclamation.length > 0 && !showAutreInput ? (
                                        <select
                                            id="Subject"
                                            name="Subject"
                                            onChange={handleSujetChange}
                                            value={data.Subject}
                                            className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.Subject ? "border-red-500" : ""
                                                }`}
                                        >
                                            <option value="">Sélectionnez un sujet</option>
                                            {SubjectsReclamation.map((sujet, index) => (
                                                <option key={index} value={sujet}>
                                                    {sujet}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                value={showAutreInput ? data.Subject : nouveauSujet}
                                                onChange={(e) => {
                                                    if (showAutreInput) {
                                                        setData((prev) => ({ ...prev, Subject: e.target.value }));
                                                    } else {
                                                        setNouveauSujet(e.target.value);
                                                    }
                                                }}
                                                placeholder="Saisir un sujet personnalisé"
                                                className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.Subject ? "border-red-500" : ""
                                                    }`}
                                            />
                                            {!showAutreInput && (
                                                <button
                                                    type="button"
                                                    onClick={ajouterNouveauSujet}
                                                    className="bg-orange-dys text-white px-4 py-2 rounded mt-2"
                                                >
                                                    Ajouter
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {errors.Subject && (
                                        <p className="text-red-500 text-xs mt-1">{errors.Subject}</p>
                                    )}
                                </div>
                            </div>

                            {/* Complaint Type Field */}
                            <div className="w-full lg:w-6/12 px-4">
                                <div className="relative w-full mb-3">
                                    {/* Helper Text */}

                                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                                        Type de Réclamation
                                    </label>
                                    <p className="text-xs text-gray-600 mb-1">
                                        Choisissez entre une réclamation textuelle ou vocale.
                                    </p>
                                    <select
                                        value={ComplaintType}
                                        onChange={handleReclamationTypeChange}
                                        className={`border-0 px-3 py-3 text-blueGray-600 bg-white rounded text-sm shadow w-full ${errors.ComplaintType ? "border-red-500" : ""
                                            }`}
                                    >
                                        <option value="0">Textuelle</option>
                                        <option value="1">Vocal</option>
                                    </select>
                                    {errors.ComplaintType && (
                                        <p className="text-red-500 text-xs mt-1">{errors.ComplaintType}</p>
                                    )}
                                </div>
                            </div>

                            {/* Document Upload Field */}
                            <div className="w-full lg:w-12/12 px-4">
                                <div className="relative w-full mb-3">
                                    {/* Helper Text */}

                                    <label htmlFor='uploadImageInput' className='mt-3'>Document :</label>
                                    <label htmlFor='uploadImageInput'>
                                        <div className='p-2 bg-slate-100 border rounded h-32 w-full flex justify-center items-center cursor-pointer'>
                                            <div className='text-slate-500 flex justify-center items-center flex-col gap-2'>
                                                <span className='text-4xl'><FaCloudUploadAlt /></span>
                                                <p className='text-sm'>Importer votre fichier</p>
                                                <input
                                                    type='file'
                                                    id='uploadImageInput'
                                                    accept="image/*"  // Seulement les images de tous types
                                                    className='hidden'
                                                    onChange={handleUploadFile}
                                                />
                                            </div>
                                        </div>
                                    </label>
                                    <p className="text-xs text-gray-600 mb-1">
                                        Importez un fichier pertinent (JPEG, PNG).
                                    </p>
                                    {errors.AttachedFile && (
                                        <p className="text-red-500 text-xs mt-1">{errors.AttachedFile}</p>
                                    )}
                                </div>
                                <div>
                                    {data.AttachedFile.length > 0 ? (
                                        <div className='flex items-center gap-2'>
                                            {data.AttachedFile.map((el, index) => {

                                                return (
                                                    <div className='relative group' key={index}>
                                                        <img
                                                            src={URL.createObjectURL(el)}
                                                            alt={el.name}
                                                            width={80}
                                                            height={80}
                                                            className='bg-slate-100 border cursor-pointer'
                                                            onClick={() => {
                                                                setOpenFullScreenImage(true);
                                                                setFullScreenImage(URL.createObjectURL(el));
                                                            }}
                                                        />
                                                        <p>{el.name}</p>
                                                        <div className='absolute bottom-0 right-0 p-1 text-white bg-pink-600 rounded-full hidden group-hover:block cursor-pointer' onClick={() => handleDeleteImage(index)}>
                                                            <MdDelete />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className='text-pink-600 text-xs'>*Importer votre fichier</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr className="mt-6 border-b-1 border-blueGray-300 mb-6" />

                        {/* Description or Voice Recording */}
                        <div className="flex flex-wrap">
                            {ComplaintType === "0" ? (
                                <div className="w-full lg:w-12/12 px-4">
                                    <div className="relative w-full mb-3">
                                        {/* Helper Text */}

                                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="description">
                                            Description
                                        </label>
                                        <p className="text-xs text-gray-600 mb-1">
                                            Décrivez votre problème en détail (entre 10 et 1000 caractères).
                                        </p>
                                        <textarea
                                            id="Content"
                                            value={data.Content}
                                            name="Content"
                                            className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.Content ? "border-red-500" : ""
                                                }`}
                                            onChange={handleContentChange}
                                            placeholder="Je me permets de vous contacter pour exprimer mon mécontentement concernant..."
                                            rows="4"
                                        ></textarea>
                                        {showSuggestions && suggestions.length > 0 && !isLoadingSuggestions && (
                                            <div className="mt-2">
                                                <div className="flex items-center mb-1">
                                                    <span className="text-xs font-semibold text-gray-600">Suggestions:</span>
                                                    <button
                                                        type="button"
                                                        onClick={openSuggestionsModal} // Ouvrir le modal
                                                        className="ml-2 text-xs text-black hover:text-gray-700"
                                                    >
                                                        Voir toutes les suggestions
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Modal de suggestions */}
                                        <SuggestionsModal
                                            isOpen={isSuggestionsModalOpen}
                                            onClose={closeSuggestionsModal}
                                            suggestions={suggestions}

                                        />
                                        {errors.Content && (
                                            <p className="text-red-500 text-xs mt-1">{errors.Content}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full lg:w-12/12 px-4 flex flex-col items-center">
                                    <div className="relative w-full mb-3 text-center">
                                        {/* Helper Text */}
                                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                                            Enregistrement Vocal
                                        </label>
                                        <p className="text-xs text-gray-600 mb-1">
                                            Appuyez sur le bouton pour enregistrer votre message vocal.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`text-black font-bold px-6 py-3 rounded-full shadow-lg transition-all ${isRecording ? "bg-red-600" : "bg-orange-dys"} hover:opacity-80`}
                                        >
                                            <i className={`fas fa-microphone text-white text-lg ${isRecording ? "animate-pulse" : ""}`}></i>
                                        </button>
                                        {audioBlob && (
                                            <div className="mt-4 w-full">
                                                <audio controls src={URL.createObjectURL(audioBlob)} className="w-full max-w-xs mx-auto" />
                                                {isTranscribing && (
                                                    <p className="text-sm text-gray-600 mt-2">Transcription en cours...</p>
                                                )}
                                                {data.Content && (
                                                    <>
                                                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2 mt-4">
                                                            Transcription
                                                        </label>
                                                        <div className="border-0 px-3 py-3 text-blueGray-600 bg-white rounded text-sm shadow w-full">
                                                            {data.Content}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        {!isSubmitted && (
                            <div className="rounded-t bg-white mb-0 px-6 py-6">
                                <div className="text-center flex justify-end">
                                    <button
                                        className="bg-orange-dys text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                                        type="submit"
                                    >
                                        <i className="fas fa-paper-plane mr-2"></i>
                                        Envoyer
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Full-Screen Image Display */}
                    {openFullScreenImage && (
                        <DisplayImage onClose={() => setOpenFullScreenImage(false)} imgUrl={fullScreenImage} />
                    )}
                </div>
            </div>
        </>
    );
}