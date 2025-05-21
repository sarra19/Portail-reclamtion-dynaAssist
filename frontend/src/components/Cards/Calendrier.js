import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import SummaryApi from "api/common";

import { toast } from "react-toastify";
import InterventionDetailsModal from "./Détails/InterventionDetailsModal";

const Calendrier = () => {
  const [events, setEvents] = useState([]);
  const [selectedIntervention, setSelectedIntervention] = useState(null); // Stocke les détails de l'intervention sélectionnée
  const [showModal, setShowModal] = useState(false); // Gère l'affichage de la modale
  const [beneficiaryDetails, setBeneficiaryDetails] = useState(null); // Stocke les détails du bénéficiaire

  // Récupérer toutes les interventions pour le calendrier
  const fetchInterventions = async () => {
    try {
      const response = await fetch(SummaryApi.allInterventions.url, {
        method: SummaryApi.allInterventions.method,
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Formater les données pour FullCalendar
      const formattedEvents = data.map((intervention) => ({
        title: `${intervention.SujetReclamation} - ${intervention.TechnicienResponsable}`,
        start: intervention.DatePrevuInterv, // Date de l'intervention
        id: intervention.No_, // ID unique pour chaque événement
        details: intervention, // Ajouter les détails complets de l'intervention
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Erreur lors de la récupération des interventions:", error);
      toast.error("Erreur lors du chargement des interventions.");
    }
  };



  // Charger les interventions au montage du composant
  useEffect(() => {
    fetchInterventions();
  }, []);
 const fetchInterventionDetails = async (interventionId) => {
    try {
      console.log("Fetching intervention ID:", interventionId); // Debug
      const response = await fetch(`${SummaryApi.getIntervention.url}/${interventionId}`, {
        method: SummaryApi.getIntervention.method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const data = await response.json();
      console.log("Intervention details response:", data); // Debug
      setSelectedIntervention(data);
    } catch (error) {
      console.error("Erreur:", error);
    }
};

const fetchUserDetails = async (interv) => {
    try {
      console.log("Fetching user details for intervention ID:", interv); // Debug
      const response = await fetch(`${SummaryApi.getUserDetailsByInterventionId.url}/${interv}`, {
        method: SummaryApi.getUserDetailsByInterventionId.method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const data = await response.json();
      console.log("User details response:", data); // Debug
      setBeneficiaryDetails(data.data); 
    } catch (error) {
      console.error("Erreur:", error);
    }
};

  // Gestionnaire de clic sur un événement
  const handleEventClick = async (info) => {
    const eventDetails = info.event.extendedProps.details; // Récupérer les détails complets
    await fetchInterventionDetails(eventDetails.No_); // Récupérer les détails de l'intervention
    await fetchUserDetails(eventDetails.No_); // Récupérer les détails du bénéficiaire

    setShowModal(true); // Ouvrir la modale
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Calendrier des Interventions</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick} // Gérer le clic sur un événement
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="auto"
      />

      {/* Afficher la modale si showModal est vrai */}
      {showModal && selectedIntervention && (
        <InterventionDetailsModal
          selectedIntervention={selectedIntervention}
          beneficiaryDetails={beneficiaryDetails}
          setShowModal={setShowModal}
        />
      )}
    </div>
  );
};

export default Calendrier;