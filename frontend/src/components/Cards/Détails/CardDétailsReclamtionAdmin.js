import React, { useEffect, useState } from "react";
import SummaryApi from "api/common";

import { useParams } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";

export default function CardDétailsReclamtion() {
  const { id } = useParams();

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
    Sender:"",
    reclamationId: "",
    remboursement: null,
    intervention: null,
  });

  const [showResponse, setShowResponse] = useState(false); 

  // Récupérer l'utilisateur actuel
    const currentUser = useSelector(state => state?.user?.user)

  useEffect(() => {
    const fetchRecDetails = async () => {
      try {
        const response = await fetch(`${SummaryApi.detailsReclamation.url}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const dataResponse = await response.json();
        setData(dataResponse?.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données de la réclamation :", error);
      }
    };

    const fetchRespDetails = async () => {
      try {
        const response = await fetch(`${SummaryApi.getResponsesByReclamation.url}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const dataResponse = await response.json();
        if (dataResponse.success) {
          setFormatData(dataResponse.data);
        } else {
          console.error("Aucune réponse trouvée pour cette réclamation.");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données de la réponse :", error);
      }
    };

    fetchRecDetails();
    fetchRespDetails();
  }, [id]);

  return (
    <>

      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg w-11/12 md:w-10/12 lg:w-9/12 px-4 md:px-6 mr-auto ml-auto -mt-32">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
        <ToastContainer position="top-center" />

          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-2xl text-blueGray-700">
                Détails de Réclamation
              </h3>
            </div>
          </div>
        </div>

        {/* Conteneur flex pour les deux blocs */}
        <div className="flex flex-col md:flex-row gap-6 p-4">
          {/* Bloc de gauche : Détails de la réclamation */}
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
                <h4 className="text-xl font-bold text-white text-center mb-4">
                  {data.Subject}
                </h4>
                <p className="text-md font-light text-white text-center mb-4">
                  {data.TargetType}
                </p>
                {data.UserId!== currentUser?.No_ && (
                <div className="space-y-2 m-4">
                  <h4 className="font-bold text-white">
                  Envoyeur : 
                  </h4>
                  <p className="text-md font-light text-white">
                    {data.Sender}
                  </p>
                </div>
              )}
              {data.Name && (
                <div className="space-y-2 m-4">
                  <h4 className="font-bold text-white">
                  Cible : 
                  </h4>
                  <p className="text-md font-light text-white">
                    {data.Name}
                  </p>
                </div>
              )}
                {data.Content && (
                <div className="space-y-2 m-4">
                  <h4 className="font-bold text-white">
                  Description : 
                  </h4>
                  <p className="text-md font-light text-white">
                    {data.Content}
                  </p>
                </div>
              )}
                {data.VoiceNote && (
                  <div className="space-y-2 m-4">
                    <h4 className="font-bold text-white">Note vocale:</h4>
                    <audio controls src={data.VoiceNote} className="mx-auto center mt-3 w-50" />
                  </div>
                )}
                <div className="space-y-2 m-4 mt-4">
                  <h4 className="font-bold text-white">
                    Statut :{" "}
                    <span className={`font-normal ${
                      data.Status === 0
                        ? "text-yellow-300"
                        : data.Status === 1
                        ? "text-green-300"
                        : "text-blue-300"
                    }`}>
                      {data.Status === 0 ? "En cours" : data.Status === 1 ? "Traité" : "Résolu"}
                    </span>
                  </h4>
                </div>
                {data.AttachedFile && (
                  <>
                    <h4 className="font-bold text-white m-4">
                      Fichier joint :
                    </h4>
                    <div className="flex justify-center mt-4 mb-4">
                      <img
                        alt="Fichier joint"
                        src={data.AttachedFile}
                        className="w-20 h-48 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  </>
                )}
                <p className="text-sm font-light text-white text-right m-4">
                  Envoyé le : {data.CreatedAt}
                </p>

                <div className="flex justify-end mt-6 space-x-4 m-4">
  {formatData.responseId && ( 
    <button
      className="bg-orange-dys text-white active:bg-blue-600 font-bold uppercase text-xs px-4 py-2 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none transition-all duration-150 ease-in-out"
      type="button"
      onClick={() => setShowResponse(!showResponse)}
    >
      <i className="fas fa-paper-plane mr-2"></i>
      {showResponse ? "Masquer réponse" : "Voir réponse"}
    </button>
  )}
</div>
              </blockquote>
            </div>
          </div>

          {/* Bloc de droite : Réponse */}
          {showResponse && (
            <div className="flex-1 m-4 mt-6 md:mt-0">
              <div className="mt-8 relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg bg-orange-dys ease-linear transition-all duration-150 hover:shadow-2xl">
                <blockquote className="relative p-6">
                  <h4 className="text-xl font-bold text-white text-center m-4">
                    Réponse
                  </h4>
                  <h6 className="text-xl font-bold text-white text-center m-4">
                    {formatData.subject}
                  </h6>
                  <p className="text-md font-light text-white text-center m-4">
                    {formatData.content}
                  </p>
                  {formatData.attachedFile!=="vide" && (
                  <>
                    <h4 className="font-bold text-white m-4">
                      Fichier joint :
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
                    Services supplémentaires :
                  </h5>
                  <ul className="list-disc list-inside text-white m-4">
                    {(formatData.serviceSup === 1 || formatData.serviceSup === 3) && (
                      <li>
                        Remboursement : {formatData.remboursement.montant} TND prévu le {new Date(formatData.remboursement.datePrevu).toLocaleDateString()}
                      </li>
                    )}
                    {(formatData.serviceSup === 2 || formatData.serviceSup === 3) && (
                      <li>
                        Intervention prévue le {new Date(formatData.intervention.datePrevuInterv).toLocaleDateString()} par {formatData.intervention.technicienResponsable}
                      </li>
                    )}
                  </ul>
                </blockquote>
              </div>
            </div>
          )}
        </div>
      </div>
      <a href={`/admin/réclamation`}>
        <button
          className=" mt-2 ml-2 bg-gray-500 text-white active:bg-gray-500 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
          type="button"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Retour
        </button>
      </a>

    </>
  );
}