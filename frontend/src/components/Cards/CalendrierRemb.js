import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import SummaryApi from "api/common";

import { toast } from "react-toastify";
import RembDetailsModal from "./Détails/RembDetailsModal";

const CalendrierRemb = () => {
  const [events, setEvents] = useState([]);
  const [selectedRemb, setSelectedRemb] = useState(null); // Stocke les détails du remboursement sélectionné
  const [beneficiaryDetails, setBeneficiaryDetails] = useState(null); // Stocke les détails du bénéficiaire
  const [showModal, setShowModal] = useState(false); // Gère l'affichage de la modale

  // Récupérer tous les remboursements pour le calendrier
  const fetchRemboursements = async () => {
    try {
      const response = await fetch(SummaryApi.getAllRemboursement.url, {
        method: SummaryApi.getAllRemboursement.method,
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Formater les données pour FullCalendar
      const formattedEvents = data.map((remboursement) => ({
        title: `${remboursement.SujetReclamation} - ${remboursement.Montant} dt`,
        start: remboursement.DatePrevu,
        id: remboursement.No_, // ID unique pour chaque événement
        details: remboursement, // Ajouter les détails complets du remboursement
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Erreur lors de la récupération des remboursements:", error);
      toast.error("Erreur lors du chargement des remboursements.");
    }
  };

  // Récupérer les détails du bénéficiaire par ID de remboursement
  const fetchUserDetails = async (rembId) => {
    try {
      const response = await fetch(`${SummaryApi.getUserDetailsByRembId.url}/${rembId}`, {
        method: SummaryApi.getUserDetailsByRembId.method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const data = await response.json();
      setBeneficiaryDetails(data.data); // Mettre à jour les détails du bénéficiaire
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du bénéficiaire:", error);
      toast.error("Erreur lors de la récupération des détails du bénéficiaire.");
    }
  };

  // Charger les remboursements au montage du composant
  useEffect(() => {
    fetchRemboursements();
  }, []);

  // Gestionnaire de clic sur un événement
  const handleEventClick = async (info) => {
    const eventDetails = info.event.extendedProps.details; // Récupérer les détails complets
    setSelectedRemb(eventDetails); // Mettre à jour l'état avec les détails du remboursement
    await fetchUserDetails(eventDetails.No_); // Récupérer les détails du bénéficiaire
    setShowModal(true); // Ouvrir la modale
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Calendrier des Remboursements</h2>
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
      {showModal && selectedRemb && (
        <RembDetailsModal
          selectedRemb={selectedRemb}
          beneficiaryDetails={beneficiaryDetails}
          setShowModal={setShowModal}
        />
      )}
    </div>
  );
};

export default CalendrierRemb;