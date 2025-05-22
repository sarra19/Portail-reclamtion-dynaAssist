import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import frLocale from "@fullcalendar/core/locales/fr";
import SummaryApi from "api/common";
import { toast } from "react-toastify";
import InterventionDetailsModal from "./Détails/InterventionDetailsModal";

const Calendrier = () => {
  const [eventsInterventions, setEventsInterventions] = useState([]);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [beneficiaryDetails, setBeneficiaryDetails] = useState(null);

  const fetchUserDetails = async (intervId) => {
    try {
      const response = await fetch(`${SummaryApi.getUserDetailsByInterventionId.url}/${intervId}`, {
        method: SummaryApi.getUserDetailsByInterventionId.method,
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      setBeneficiaryDetails(data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du bénéficiaire:", error);
      toast.error("Erreur lors de la récupération des détails du bénéficiaire.");
    }
  };

  // Interventions pour l'onglet Interventions
  const allInterventions= async () => {
    try {
      const response = await fetch(`${SummaryApi.allInterventions.url}`, {
        method: SummaryApi.allInterventions.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      
      if (!Array.isArray(data)) throw new Error("Format de données incorrect");

      const formatted = data.map((interv) => ({
        id: interv.id,
        title: interv.title || interv.details.SujetReclamation,
        start: interv.start || interv.details.DatePrevueInterv,
        details: interv.details,
        type: "intervention",
        color: "#2980B9", // bleu foncé
      }));
      setEventsInterventions(formatted); // Mettre à jour les interventions seulement
    } catch (error) {
      console.error("Erreur fetchInterventionsSender ou vide ");
      toast.error("Erreur lors du chargement des interventions.");
    }
  };

  useEffect(() => {
    allInterventions();
  }, []);

  const handleEventClick = (info) => {
    const eventDetails = info.event.extendedProps;
    if (!eventDetails || !eventDetails.details) {
      toast.error("Détails de l'événement manquants.");
      return;
    }

  
      const InterventionNo = eventDetails.details.InterventionNo;
      fetchUserDetails(InterventionNo);
      setSelectedIntervention(eventDetails.details);


    setShowModal(true);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Calendrier Admin</h2>

      {/* Tabs */}
    

      {/* Calendar */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={eventsInterventions}
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="auto"
        locale={frLocale}
        buttonText={{
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
        }}
      />

      {/* Modals */}
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