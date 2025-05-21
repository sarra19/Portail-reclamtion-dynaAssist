import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import frLocale from "@fullcalendar/core/locales/fr";
import SummaryApi from "api/common";
import { toast } from "react-toastify";
import RembDetailsModal from "./Détails/RembDetailsModal";
import InterventionDetailsModal from "./Détails/InterventionDetailsModal";

const CardCalendrierFrontFournisseur = () => {
  const [eventsRemboursements, setEventsRemboursements] = useState([]);
  const [eventsInterventions, setEventsInterventions] = useState([]);
  const [selectedRemb, setSelectedRemb] = useState(null);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("remboursements");
  const [beneficiaryDetails, setBeneficiaryDetails] = useState(null);

  const fetchUserDetails = async (rembId) => {
    try {
      const response = await fetch(`${SummaryApi.getUserDetailsByRembId.url}/${rembId}`, {
        method: SummaryApi.getUserDetailsByRembId.method,
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

  // Remboursements pour l'onglet Remboursements
  const getRemboursementsByCurrentUser = async () => {
    try {
      const response = await fetch(SummaryApi.getRemboursementsByCurrentUser.url, {
        method: SummaryApi.getRemboursementsByCurrentUser.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Format de données incorrect");

      const formatted = data.map((remb) => ({
        id: remb.id,
        title: remb.title || remb.details.SujetReclamation,
        start: remb.start || remb.details.DatePrevue,
        details: remb.details,
        type: "remboursement",
        color: "#2ECC71", // vert clair
      }));

      setEventsRemboursements(formatted); // Mettre à jour les remboursements seulement
    } catch (error) {
      console.error("Erreur lors de la récupération des remboursements :", error);
      toast.error("Erreur lors du chargement des remboursements.");
    }
  };

  // Interventions pour l'onglet Interventions
  const getInterventionsByCurrentUser = async () => {
    try {
      const response = await fetch(`${SummaryApi.getInterventionsByCurrentUser.url}`, {
        method: SummaryApi.getInterventionsByCurrentUser.method,
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
    getRemboursementsByCurrentUser();
    getInterventionsByCurrentUser();
  }, []);

  const handleEventClick = (info) => {
    const eventDetails = info.event.extendedProps;
    if (!eventDetails || !eventDetails.details) {
      toast.error("Détails de l'événement manquants.");
      return;
    }

    if (eventDetails.type === "remboursement") {
      const PaybackNo = eventDetails.details.PaybackNo;
      fetchUserDetails(PaybackNo);
      setSelectedRemb(eventDetails.details);
      setSelectedIntervention(null);
    } else if (eventDetails.type === "intervention") {
      const InterventionNo = eventDetails.details.InterventionNo;
      fetchUserDetails(InterventionNo);
      setSelectedIntervention(eventDetails.details);
      setSelectedRemb(null);
    }

    setShowModal(true);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Calendrier Fournisseur</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === "remboursements" ? "bg-orange-dys2 text-white" : "bg-white"}`}
          onClick={() => setActiveTab("remboursements")}
        >
          Remboursements
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "interventions" ? "bg-orange-dys2 text-white" : "bg-white"}`}
          onClick={() => setActiveTab("interventions")}
        >
          Interventions
        </button>
      </div>

      {/* Calendar */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={activeTab === "remboursements" ? eventsRemboursements : eventsInterventions}
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
      {showModal && selectedRemb && (
        <RembDetailsModal
          selectedRemb={selectedRemb}
          setShowModal={setShowModal}
          beneficiaryDetails={beneficiaryDetails}
        />
      )}
    </div>
  );
};

export default CardCalendrierFrontFournisseur;