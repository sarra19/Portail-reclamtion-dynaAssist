import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SummaryApi from "api/common";

import { toast } from "react-toastify";
import { createPopper } from "@popperjs/core";
import { FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBuilding } from "react-icons/fa";

export default function CardDétailsHist() {
  const { id } = useParams();
  const [historique, setHistorique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popoverShow, setPopoverShow] = useState(false);
  const btnRef = React.createRef();
  const popoverRef = React.createRef();

  useEffect(() => {
    fetchHistDetails();
  }, [id]);

  const fetchHistDetails = async () => {
    try {
      const response = await fetch(`${SummaryApi.getHistorique.url}/${id}`, {
        method: SummaryApi.getHistorique.method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const data = await response.json();
      setHistorique(data);
    } catch (error) {
      toast.error("Erreur lors de la récupération des détails de historique.");
    } finally {
      setLoading(false);
    }
  };

 

  const openPopover = () => {
    createPopper(btnRef.current, popoverRef.current, { placement: "right" });
    setPopoverShow(true);
  };

  const closePopover = () => {
    setPopoverShow(false);
  };

  if (loading) {
    return <div className="text-center py-4">Chargement en cours...</div>;
  }

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg w-10/12 md:w-8/12 lg:w-6/12 px-6 md:px-4 mr-auto ml-auto -mt-32">
      <div className="rounded-t mb-0 px-4 py-3 border-0">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-2xl text-blueGray-700">
              Détails d'Activité
            </h3>
          </div>
        </div>
      </div>
      <div className="block w-full overflow-x-auto">
        <div className="hover:-mt-4 relative flex flex-col min-w-0 break-words  bg-orange-dys w-full mb-6 shadow-lg rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 ease-linear transition-all duration-150">
          <img
            alt="Intervention"
            src={require("assets/img/interv.jpg")}
            className="w-full align-middle rounded-t-lg"
          />
          <div className="p-8">
            <h4 className="text-xl font-bold text-white text-center mb-4">
              Nom d'activité : {historique?.Activity}
            </h4>
            <div className="space-y-4">
              
              <div className="flex items-center text-white">
                <FaCalendarAlt className="mr-2" />
                <span>Date: {new Date(historique?.ActivityDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-white">
                <span>Actionneur :</span>
                <span
                  ref={btnRef}
                  onMouseEnter={openPopover}
                  onMouseLeave={closePopover}
                  className="text-blue-200 cursor-pointer underline ml-2"
                >
                  {historique?.FirstName} {historique?.LastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popover affichant les détails de l'utilisateur */}
      <div
        ref={popoverRef}
        className={
          (popoverShow ? "" : "hidden ") +
          "bg-white border border-gray-300 shadow-lg p-4 rounded-lg absolute z-50 w-64"
        }
      >
        {historique ? (
          <div className="space-y-2">
            <h5 className="font-bold text-lg">{historique.FirstName} {historique.LastName}</h5>
            <div className="flex items-center text-sm text-gray-700">
              <FaBuilding className="mr-2" />
              <span>{historique.OccupationUser} à {historique.CompagnyUser}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <FaEnvelope className="mr-2" />
              <span>{historique.Email}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <FaPhone className="mr-2" />
              <span>{historique.Phone}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <FaMapMarkerAlt className="mr-2" />
              <span>{historique.City}, {historique.Country}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700">Chargement...</p>
        )}
      </div>
    </div>
  );
}