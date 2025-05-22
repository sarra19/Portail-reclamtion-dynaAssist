import React, { useEffect, useState } from "react";
import SummaryApi from "api/common";

import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useHistory } from "react-router-dom"; // Import useHistory for programmatic navigation
import ChangeResponse from "../Modify/ChangeResponse";
import { useSelector } from "react-redux";
import DisplayImage from "helpers/DisplayImage";

export default function CardDétailsReclamtion() {
  const { id } = useParams();
  const history = useHistory(); // For programmatic navigation
  const [showResponseModal, setShowResponseModal] = useState(false); // Controls the visibility of the response modal
  const [selectedResponse, setSelectedResponse] = useState(null); // Stores the selected response data
  const [fullScreenImage, setFullScreenImage] = useState("");
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);

  const [data, setData] = useState({
    TargetType: "",
    Name: "",
    Subject: "",
    ComplaintType: "",
    Content: "",
    AttachedFile: [],
    VoiceNote: "",
    Status: "",
    UserId: "",
    ServiceId: "",
    ProductId: "",
    CreatedAt: "",
  });
  const [formatData, setFormatData] = useState({
    responseId: "",
    subject: "",
    attachedFile: [],
    content: "",
    userId: "",
    serviceSup: "",
    Sender: "",
    reclamationId: "",
    remboursement: null,
    intervention: null,
  });
  const [showResponse, setShowResponse] = useState(false);
  const [translatedData, setTranslatedData] = useState({});
  const [targetLanguage, setTargetLanguage] = useState("fr"); // Default language (French)
  const handleEditResponse = (response) => {
    setSelectedResponse(response); // Store the selected response data
    setShowResponseModal(true); // Show the modal
  };
  const currentUser = useSelector(state => state?.user?.user)

  // Function to translate text using MyMemory API with caching
  const translateTextWithCache = async (text, lang) => {
    if (lang === "fr") return text;

    const cacheKey = `${text}_${lang}`;
    const cachedTranslation = localStorage.getItem(cacheKey);

    if (cachedTranslation) {
      return cachedTranslation;
    }

    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|${lang}`;
    try {
      const response = await fetch(apiUrl);
      const result = await response.json();
      const translatedText = result.responseData.translatedText || text;
      localStorage.setItem(cacheKey, translatedText); // Cache the translation
      return translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  // Batch translate multiple texts
  const translateTextBatch = async (texts, lang) => {
    if (lang === "fr") return texts;

    const combinedText = texts.join("|||"); // Use a unique delimiter
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(combinedText)}&langpair=fr|${lang}`;

    try {
      const response = await fetch(apiUrl);
      const result = await response.json();
      const translatedTexts = result.responseData.translatedText.split("|||");
      return translatedTexts;
    } catch (error) {
      console.error("Translation error:", error);
      return texts; // Fallback to original texts
    }
  };

  // Translate static UI text
  const translateStaticText = async (lang) => {
    if (lang === "fr") {
      return {
        "Détails de Réclamation": "Détails de Réclamation",
        Envoyeur: "Envoyeur",
        Cible: "Cible",
        Description: "Description",
        Statut: "Statut",
        "En cours": "En cours",
        Traité: "Traité",
        Résolu: "Résolu",
        "Fichier joint": "Fichier joint",
        "Envoyé le": "Envoyé le",
        "et prévu le": "et prévu le", // Explicitly included
        "Masquer réponse": "Masquer réponse",
        "Voir réponse": "Voir réponse",
        Réponse: "Réponse",
        "Services supplémentaires": "Services supplémentaires",
        Remboursement: "Remboursement",
        "Intervention prévue le": "Intervention prévue le",
        par: "par",
      };
    }

    const staticTexts = [
      "Détails de Réclamation",
      "Envoyeur",
      "Cible",
      "Description",
      "Statut",
      "En cours",
      "Traité",
      "Résolu",
      "Fichier joint",
      "Envoyé le",
      "et prévu le",
      "Masquer réponse",
      "Voir réponse",
      "Réponse",
      "Services supplémentaires",
      "Remboursement",
      "Intervention prévue le",
      "par",
    ];

    const translatedTexts = await translateTextBatch(staticTexts, lang);
    const translatedStaticTexts = {};
    staticTexts.forEach((text, index) => {
      translatedStaticTexts[text] = translatedTexts[index] || text; // Fallback to original text
    });
    console.log("Translated static texts for language", lang, ":", translatedStaticTexts); // Debug log
    return translatedStaticTexts;
  };

  // Fetch complaint and response details
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch complaint details
        const recResponse = await fetch(`${SummaryApi.detailsReclamation.url}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const recData = await recResponse.json();
        setData(recData?.data);

        // Fetch response details
        const respResponse = await fetch(`${SummaryApi.getResponsesByReclamation.url}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const respData = await respResponse.json();

        if (respData.success) {
          setFormatData(respData.data);
        }

        // Translate complaint and response details
        const [translatedSubject, translatedContent] = await Promise.all([
          translateTextWithCache(recData?.data.Subject, targetLanguage),
          translateTextWithCache(recData?.data.Content, targetLanguage),
        ]);

        const translatedResponseDetails = respData.success
          ? await Promise.all([
            translateTextWithCache(respData.data.subject, targetLanguage),
            translateTextWithCache(respData.data.content, targetLanguage),
          ])
          : [null, null];

        setTranslatedData((prev) => ({
          ...prev,
          Subject: translatedSubject,
          Content: translatedContent,
          responseSubject: translatedResponseDetails[0],
          responseContent: translatedResponseDetails[1],
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id, targetLanguage]);



  // Translate static UI text when language changes
  useEffect(() => {
    const translateUI = async () => {
      const translatedStaticTexts = await translateStaticText(targetLanguage);
      setTranslatedData((prev) => ({
        ...prev,
        ...translatedStaticTexts,
      }));
    };

    translateUI();
  }, [targetLanguage]);
  const updateStatus = async (reclamationId) => {
    try {
      if (currentUser?.Role !== 1) {
        const response = await fetch(`${SummaryApi.updateStatus.url}/${reclamationId}`, {
          method: SummaryApi.updateStatus.method,
          credentials: "include",
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Statut de la réclamation mis à jour avec succès.");
        } else {
          toast.error(result.message || "Échec de la mise à jour du statut.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleDeleteReponse = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réponse ?")) {
      try {
        const response = await fetch(`${SummaryApi.deleteReponse.url}`, {
          method: SummaryApi.deleteReponse.method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ responseId: formatData.responseId }),
          credentials: "include",
        });

        const result = await response.json();

        if (result.success) {
          await updateStatus(id);
          alert("Réponse supprimée avec succès!");
          window.location.reload(); // Rafraîchit la page entière
        } else {
          console.error("Erreur lors de la suppression :", result.message);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la réponse :", error);
      }
    }
  };

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg w-11/12 md:w-10/12 lg:w-9/12 px-4 md:px-6 mr-auto ml-auto -mt-32">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <ToastContainer position="top-center" />
          <div className="flex flex-wrap items-center justify-between">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-2xl text-blueGray-700">
                {translatedData["Détails de Réclamation"] || "Complaint Details"}
              </h3>
            </div>

          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 p-4">
          {/* Left Block: Complaint Details */}
          <div className="flex-1">
            <div className="mt-8 relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg bg-bleu-dys ease-linear transition-all duration-150 hover:shadow-2xl">
              <blockquote className="relative p-6">
                <svg
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 583 95"
                  className="absolute left-0 w-full block h-95-px -top-94-px"
                >
                  <polygon
                    points="-30,95 583,95 583,65"
                    className="text-orange-dys fill-current"
                  ></polygon>
                </svg>
                <h4 className="text-xl mt-4 font-bold text-white text-center mb-4">
                  {translatedData.Subject || data.Subject}
                </h4>
                <p className="text-md font-light text-white text-center mb-4">
                  {translatedData.TargetType || data.TargetType}
                </p>
                {data.UserId !== currentUser?.No_ && (
                  <div className="space-y-2 m-4">
                    <h4 className="font-bold text-white">
                      {translatedData.Envoyeur || "Sender"}:
                    </h4>
                    <p className="text-md font-light text-white">{data.Sender}</p>
                  </div>
                )}
                {data.Name && (
                  <div className="space-y-2 m-4">
                    <h4 className="font-bold text-white">
                      {translatedData.Cible || "Target"}:
                    </h4>
                    <p className="text-md font-light text-white">{data.Name}</p>
                  </div>
                )}
                {data.Content && (
                  <div className="space-y-2 m-4">
                    <h4 className="font-bold text-white">
                      {translatedData.Description || "Description"}:
                    </h4>
                    <p className="text-md font-light text-white">
                      {translatedData.Content || data.Content}
                    </p>
                  </div>
                )}
                {data.VoiceNote !== "vide" && (
                  <div className="space-y-2 m-4">
                    <h4 className="font-bold text-white">Note vocale:</h4>
                    <audio controls src={data.VoiceNote} className="mx-auto center mt-3 w-50" />
                  </div>
                )}
                <div className="space-y-2 m-4 mt-4">
                  <h4 className="font-bold text-white">
                    {translatedData.Statut || "Status"}:{" "}
                    <span
                      className={`font-normal ${data.Status === 0
                        ? "text-yellow-300"
                        : data.Status === 1
                          ? "text-green-300"
                          : "text-blue-300"
                        }`}
                    >
                      {data.Status === 0
                        ? translatedData["En cours"] || "In Progress"
                        : data.Status === 1
                          ? translatedData.Traité || "Processed"
                          : translatedData.Résolu || "Resolved"}
                    </span>
                  </h4>
                </div>
                {data.AttachedFile !== "vide" && (
                  <>
                    <h4 className="font-bold text-white m-4">
                      {translatedData["Fichier joint"] || "Attached File"}:
                    </h4>
                    <div className="flex justify-center mt-4 mb-4">
                      <img
                        alt="Fichier joint"
                        src={data.AttachedFile}
                        className="w-20 h-48 object-cover rounded-lg shadow-md"
                        onClick={() => {
                          setOpenFullScreenImage(true);
                          setFullScreenImage(data.AttachedFile);
                        }}
                      />
                    </div>
                  </>
                )}
                <p className="text-sm font-light text-white text-right m-4">
                  {translatedData["Envoyé le"] || "Sent on"}: {data.CreatedAt}
                </p>
                <div className="flex justify-end mt-6 space-x-4 m-4">
                  {formatData.responseId && (
                    <button
                      className="bg-orange-dys text-white active:bg-blue-600 font-bold uppercase text-xs px-4 py-2 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none transition-all duration-150 ease-in-out"
                      type="button"
                      onClick={() => setShowResponse(!showResponse)}
                    >
                      <i className="fas fa-paper-plane mr-2"></i>
                      {showResponse
                        ? translatedData["Masquer réponse"] || "Hide Response"
                        : translatedData["Voir réponse"] || "View Response"}
                    </button>
                  )}
                  {currentUser?.Role !== 1 && data.Status !== 2 && data.UserId !== currentUser?.No_ && (
                    <button
                      className="bg-orange-dys text-white active:bg-blue-600 font-bold uppercase text-xs px-4 py-2 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none transition-all duration-150 ease-in-out"
                      type="button"
                      onClick={() => history.push(`/réponse-réclamations/${id}`)} // Redirection
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Ajouter une réponse
                    </button>
                  )}



                </div>

              </blockquote>
            </div>

          </div>

          {/* Right Block: Response */}
          {showResponse && (
            <div className="flex-1 m-4 mt-6 md:mt-0">
              <div className="mt-8 relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg bg-orange-dys ease-linear transition-all duration-150 hover:shadow-2xl">
                <blockquote className="relative p-6">
                  <h4 className="text-xl font-bold text-white text-center m-4">
                    {translatedData.Réponse || "Response"}
                  </h4>
                  <h6 className="text-xl font-bold text-white text-center m-4">
                    {translatedData.responseSubject || formatData.subject}
                  </h6>
                  <p className="text-md font-light text-white text-center m-4">
                    {translatedData.responseContent || formatData.content}
                  </p>
                  {formatData.attachedFile !== "vide" && (
                    <>
                      <h4 className="font-bold text-white m-4">
                        {translatedData["Fichier joint"] || "Attached File"}:
                      </h4>
                      <div className="flex justify-center mt-4 mb-4">
                        <img
                          alt="Fichier joint"
                          src={formatData.attachedFile}
                          className="w-20 h-48 object-cover rounded-lg shadow-md"
                        />
                      </div>
                    </>
                  )}
                  <h5 className="font-bold text-white m-4">
                    {formatData.serviceSup !== 0 && (
                      <>
                        {translatedData["Services supplémentaires"] || "Additional Services"}:
                      </>
                    )}
                  </h5>

                  <ul className="list-disc list-inside text-white m-4">
                    {(formatData.serviceSup === 1 || formatData.serviceSup === 3) && (
                      <li>
                        {translatedData.Remboursement || "Refund"}:{" "}
                        {formatData.remboursement?.montant} TND{" "}
                        {translatedData["et prévu le"] || "and scheduled for"}{" "}
                        {new Date(formatData.remboursement?.datePrevu).toLocaleDateString()}
                      </li>
                    )}
                    {(formatData.serviceSup === 2 || formatData.serviceSup === 3) && (
                      <li>
                        {translatedData["Intervention prévue le"] || "Intervention scheduled for"}{" "}
                        {new Date(formatData.intervention?.datePrevuInterv).toLocaleDateString()}{" "}
                        {translatedData.par || "by"} {formatData.intervention?.technicienResponsable}
                      </li>
                    )}
                  </ul>
                  <div className="flex justify-end m-2">

                    {currentUser?.Role !== 1 && data.Status === 2 && (
                      <button
                        className="ml-2 bg-bleu-dys text-white active:bg-blue-600 font-bold uppercase text-xs px-4 py-2 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none transition-all duration-150 ease-in-out"
                        type="button"
                        onClick={() => handleEditResponse(formatData)} // Open the modal with response data
                      >
                        <i className="fas fa-pen"></i>
                      </button>
                    )}
                    <div className="flex justify-end m-2">
                      {currentUser?.Role !== 1 && data.Status === 2 && (
                        <button
                          className="ml-2 bg-red-500 text-white active:bg-red-600 font-bold uppercase text-xs px-4 py-2 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none transition-all duration-150 ease-in-out"
                          type="button"
                          onClick={handleDeleteReponse}
                        >
                          <i className="fas fa-trash"></i> Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </blockquote>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center ">
          <div className="relative inline-block  w-20  mb-4">
            {/* Icône de langue à gauche */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-orange-dys">
              <i className="fas fa-language mt-2 text-lg"></i>
            </div>

            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 pl-10 pr-10 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-dys focus:border-orange-dys transition-all duration-300 ease-in-out"
            >
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
              <option value="es">🇪🇸 Español</option>
              <option value="de">🇩🇪 Deutsch</option>
            </select>



          </div>
        </div>
        {showResponseModal && selectedResponse && (
          <ChangeResponse
            onClose={() => {
              setShowResponseModal(false); // Close the modal
              setSelectedResponse(null); // Reset the selected response
            }}
            responseId={selectedResponse.responseId} // Pass the response ID
            subject={selectedResponse.subject} // Pass the current subject
            content={selectedResponse.content} // Pass the current content
            serviceSup={selectedResponse.serviceSup} // Pass the current service type
            remboursement={selectedResponse.remboursement} // Pass refund details
            intervention={selectedResponse.intervention} // Pass intervention details
            callFunc={() => {
              // Refetch response data after update
              fetch(`${SummaryApi.getResponsesByReclamation.url}/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              })
                .then((resp) => resp.json())
                .then((respData) => {
                  if (respData.success) {
                    setFormatData(respData.data);
                  }
                });
            }}
          />
        )}
      </div>
      {openFullScreenImage && (
        <DisplayImage onClose={() => setOpenFullScreenImage(false)} imgUrl={fullScreenImage} />
      )}
    </>
  );
}