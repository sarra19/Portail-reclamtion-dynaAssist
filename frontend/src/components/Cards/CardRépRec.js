import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import SummaryApi from "api/common";

import uploadFile from "helpers/uploadFile";
import { FaCloudUploadAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

export default function CardRépRec() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [services, setServices] = useState({
    intervention: false,
    remboursement: false,
  });
  const [errors, setErrors] = useState({});
  const { id } = useParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [data, setData] = useState({
    Subject: "",
    AttachedFile: [],
    Content: "",
    ReclamationId: "",
    UserId: "",
    Montant: "",
    DatePrevu: "",
    DatePrevuInterv: "",
    TechnicienResponsable: "",
  });
  const [reclamationDetails, setReclamationDetails] = useState(null);
  const [fomatdata, setformatData] = useState({
    FirstName: "",
    LastName: "",
  });

  // Fetch current user details
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setCurrentUser(result.data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details.");
    }
  };

  // Fetch reclamation details
  const fetchReclamationDetails = async () => {
    try {
      const response = await fetch(`${SummaryApi.getReclamation.url}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (result.success && result.data) {
        setReclamationDetails(result.data);
        setData((prev) => ({ ...prev, Subject: result.data.Subject || "" }));
      }
    } catch (error) {
      console.error("Error fetching reclamation details:", error);
      toast.error("Failed to load reclamation details.");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchReclamationDetails();
  }, [id]);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setServices((prev) => ({ ...prev, [value]: checked }));
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

      // Validation de Contenu
      if (!data.Content || data.Content.length < 10 || data.Content.length > 1000) {
        newErrors.Content =
          "Le contenu est requis et doit contenir entre 10 et 1000 caractères.";
      }

    // Validate Montant (if remboursement is checked)
    if (services.remboursement && (!data.Montant || parseFloat(data.Montant) <= 0)) {
      newErrors.Montant = "Le montant doit être supérieur à 0.";
    }

    // Validate DatePrevu (if remboursement is checked)
    if (
      services.remboursement &&
      (!data.DatePrevu || new Date(data.DatePrevu) <= new Date())
    ) {
      newErrors.DatePrevu = "La date prévue de remboursement doit être après aujourd'hui.";
    }

    // Validate DatePrevuInterv (if intervention is checked)
    if (
      services.intervention &&
      (!data.DatePrevuInterv || new Date(data.DatePrevuInterv) <= new Date())
    ) {
      newErrors.DatePrevuInterv = "La date prévue d'intervention doit être après aujourd'hui.";
    }

    // Validate TechnicienResponsable (if intervention is checked)
    if (
      services.intervention &&
      (!data.TechnicienResponsable || data.TechnicienResponsable.length < 3)
    ) {
      newErrors.TechnicienResponsable =
        "Le nom du technicien doit contenir au minimum 3 caractères.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
    setData((prev) => ({
      ...prev,
      AttachedFile: [...prev.AttachedFile, file],
    }));
    toast.success("File selected successfully!");
  };
  const generateResponseSuggestionCohere = async () => {
  console.log("Content: ", reclamationDetails.Content);
  setIsGeneratingResponse(true);
  try {
    // Préparer les données d'entrée pour le modèle
    const inputs = `Vous êtes un assistant qui aide à générer des réponses professionnelles aux réclamations clients selon le sujet de la réclamation.
Sujet de la réclamation donner moi seulement la réponse en français: ${data.Subject || "Pas de sujet"}
Contenu de la réclamation : ${reclamationDetails?.Content || "Pas de contenu"}
Suggérez une réponse appropriée , précis avec solution :`;

    // Appeler l'API Cohere avec un modèle gratuit
    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "command", // Modèle recommandé pour générer du texte
        prompt: inputs,
        max_tokens: 100, // Limite la longueur de la réponse générée
        temperature: 0.7, // Contrôle la créativité (0.7 est un bon équilibre)
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    // Vérifier si la réponse générée est valide
    if (result && result.generations && result.generations.length > 0) {
      const generatedText = result.generations[0].text.trim();
      setData((prev) => ({
        ...prev,
        Content: generatedText,
      }));
      toast.success("Suggestion générée avec succès !");
    } else {
      console.error("Réponse de l'API invalide :", result);
      toast.error("La réponse générée est vide ou mal formatée.");
    }
  } catch (error) {
    console.error("Erreur lors de la génération de la suggestion :", error);
    toast.error("Une erreur est survenue lors de la génération de la suggestion.");
  } finally {
    setIsGeneratingResponse(false);
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    const formData = {
      Subject: data.Subject,
      AttachedFile: "",
      Content: data.Content,
      UserId: currentUser?.No_,
      ReclamationId: id,
      ServiceSup: services.remboursement && services.intervention ? 3 :
        services.remboursement ? 1 :
          services.intervention ? 2 : 0,
      Montant: services.remboursement ? data.Montant : null,
      DatePrevu: services.remboursement ? data.DatePrevu : null,
      DatePrevuInterv: services.intervention ? data.DatePrevuInterv : null,
      TechnicienResponsable: services.intervention ? data.TechnicienResponsable : null,
    };

    if (data.AttachedFile.length > 0) {
      const fileUrls = [];
      for (const file of data.AttachedFile) {
        try {
          const fileUploadResponse = await uploadFile(file);
          fileUrls.push(fileUploadResponse.url);
        } catch (uploadError) {
          console.error("Erreur lors du téléchargement du fichier :", uploadError);
          toast.error("Échec de l'upload de l'image. Veuillez réessayer.");
          return;
        }
      }
      formData.AttachedFile = fileUrls.join(",");
    }

    try {
      const response = await fetch(SummaryApi.addReponse.url, {
        method: SummaryApi.addReponse.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        setIsSubmitted(true);
        setData({
          Subject: "",
          AttachedFile: [],
          Content: "",
          ReclamationId: "",
          UserId: "",
          Montant: "",
          DatePrevu: "",
          DatePrevuInterv: "",
          TechnicienResponsable: "",
        });
        setServices({ intervention: false, remboursement: false });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse :", error);
      toast.error("Une erreur s'est produite lors de l'envoi.");
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <h6 className="text-blueGray-700 text-xl mt-12 font-bold flex justify-center">
            Répondre à la réclamation de{" "}
            <span className="text-orange-dys ml-1">{fomatdata.FirstName}</span>{" "}
            <span className="text-orange-dys ml-1">{fomatdata.LastName}</span>
          </h6>
          <h6 className="block mt-4 uppercase text-orange-dys text-xs font-bold mb-2 flex justify-center">
            {data.Subject || reclamationDetails?.Subject || ""}
          </h6>
          <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="w-full lg:w-12/12 px-4">
    <div className="relative w-full mb-3">
      {/* Texte d'aide */}
      
      <label
        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
        htmlFor="grid-password"
      >
        Réponse
      </label>
      <p className="text-xs text-gray-600">
        Veuillez saisir votre réponse entre 10 et 1000 caractères.
      </p>
      <textarea
        type="text"
        name="Content"
        value={data.Content}
        onChange={handleOnChange}
        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
          errors.Content ? "border-red-500" : ""
        }`}
        placeholder="Contenu de réponse..."
        rows="4"
      ></textarea>
      {/* Message d'erreur */}
      {errors.Content && (
        <p className="text-red-500 text-xs mt-1">{errors.Content}</p>
      )}
    </div>
  </div>
                <div className="text-center flex justify-end">
              <button
                className="bg-blue-500 text-black active:bg-blue-600 font-bold uppercase text-xs px-6 py-2 mt-4 shadow hover:shadow-md outline-none focus:outline-none mr-1"
                onClick={generateResponseSuggestionCohere}
                disabled={isGeneratingResponse}
              >
                {isGeneratingResponse ? "Génération en cours..." : "Suggérer une réponse"}
              </button>
            </div>
            <div className="w-full lg:w-12/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Insérer une pièce jointe
                </label>
                <label htmlFor='uploadImageInput'>
                  <div className='p-2 bg-slate-100 border rounded h-32 w-full flex justify-center items-center cursor-pointer'>
                    <div className='text-slate-500 flex justify-center items-center flex-col gap-2'>
                      <span className='text-4xl'><FaCloudUploadAlt /></span>
                      <p className='text-sm'>Importer votre fichier</p>
                      <input type='file' id='uploadImageInput' className='hidden' onChange={handleUploadFile} />
                    </div>
                  </div>
                </label>
                <div>
                  {data.AttachedFile.length > 0 ? (
                    <div className='flex items-center gap-2'>
                      {data.AttachedFile.map((el, index) => (
                        <div className='relative group' key={index}>
                          <img
                            src={URL.createObjectURL(el)}
                            alt={el.name}
                            width={80}
                            height={80}
                            className='bg-slate-100 border cursor-pointer'
                          />
                          <p>{el.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-pink-600 text-xs'>*Importer voter fichier</p>
                  )}
                </div>
              </div>
            </div>
            {/* Services */}
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="services-supplimentaires"
                >
                  Services Supplémentaires
                </label>
                <div
                  id="services-supplimentaires"
                  className="flex flex-col space-y-2"
                >
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value="remboursement"
                      onChange={handleCheckboxChange}
                      className="form-checkbox border-0 text-blueGray-600 bg-white rounded shadow focus:ring ease-linear transition-all duration-150"
                    />
                    <span className="ml-2 text-blueGray-600 text-sm">
                      Remboursement
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value="intervention"
                      onChange={handleCheckboxChange}
                      className="form-checkbox border-0 text-blueGray-600 bg-white rounded shadow focus:ring ease-linear transition-all duration-150"
                    />
                    <span className="ml-2 text-blueGray-600 text-sm">
                      Intervention
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Remboursement Fields */}
            {services.remboursement && (
              <>
                <hr className="mt-6 border-b-1 border-blueGray-300 mb-6" />
                <h6 className="text-blueGray-400 text-sm mt-6 mb-6 font-bold uppercase">
                  Envoyer un remboursement
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Montant
                      </label>
                      <p className="text-xs text-gray-600">
                        Veillez saisir le montant.
                      </p>
                      <input
                        type="number"
                        name="Montant"
                        value={data.Montant}
                        onChange={handleOnChange}
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          errors.Montant ? "border-red-500" : ""
                        }`}
                      />
                      {errors.Montant && (
                        <p className="text-red-500 text-xs mt-1">{errors.Montant}</p>
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Date prévu de Remboursement
                      </label>
                      <p className="text-xs text-gray-600">
                       Veuillez saisir La date prévue de remboursement.
                      </p>
                      <input
                        type="date"
                        name="DatePrevu"
                        value={data.DatePrevu}
                        onChange={handleOnChange}
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          errors.DatePrevu ? "border-red-500" : ""
                        }`}
                      />
                      {errors.DatePrevu && (
                        <p className="text-red-500 text-xs mt-1">{errors.DatePrevu}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Intervention Fields */}
            {services.intervention && (
              <>
                <hr className="mt-6 border-b-1 border-blueGray-300 mb-6" />
                <h6 className="text-blueGray-400 text-sm mt-6 mb-6 font-bold uppercase">
                  Ajouter une intervention
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Date prévu d'Intervention
                      </label>
                      <p className="text-xs text-gray-600">
                        Veillez choisir La date prévue de l'intervention.
                      </p>
                      <input
                        type="date"
                        name="DatePrevuInterv"
                        value={data.DatePrevuInterv}
                        onChange={handleOnChange}
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          errors.DatePrevuInterv ? "border-red-500" : ""
                        }`}
                      />
                      {errors.DatePrevuInterv && (
                        <p className="text-red-500 text-xs mt-1">{errors.DatePrevuInterv}</p>
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Technicien responsable
                      </label>
                      <p className="text-xs text-gray-600">
                        Veillez saisir un nom du technicien au minimum avec 3 caractères.
                      </p>
                      <input
                        type="text"
                        name="TechnicienResponsable"
                        value={data.TechnicienResponsable}
                        onChange={handleOnChange}
                        className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                          errors.TechnicienResponsable ? "border-red-500" : ""
                        }`}
                        placeholder="Nom de technicien"
                      />
                      {errors.TechnicienResponsable && (
                        <p className="text-red-500 text-xs mt-1">{errors.TechnicienResponsable}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            {!isSubmitted && (
              <div className="text-center flex justify-end">
                <button
                  className="bg-orange-dys text-white active:bg-orange-dys font-bold uppercase text-xs px-6 py-2 mt-4 shadow hover:shadow-md outline-none focus:outline-none mr-1 animate-ease-in-out animate-fill-forwards hover:animate-jump hover:animate-once hover:animate-duration-[2000ms]"
                  type="submit"
                >
                  Envoyer la réponse
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}