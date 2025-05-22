import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import frLocale from "@fullcalendar/core/locales/fr";
import SummaryApi from "api/common";
import { toast } from "react-toastify";
import RembDetailsModal from "./Détails/RembDetailsModal";

const CalendrierRemb = () => {
  const [eventsRemboursements, setEventsRemboursements] = useState([]);
  const [selectedRemb, setSelectedRemb] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
  const getAllRemboursement = async () => {
    try {
      const response = await fetch(SummaryApi.getAllRemboursement.url, {
        method: SummaryApi.getAllRemboursement.method,
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



  useEffect(() => {
    getAllRemboursement();
  }, []);

  const handleEventClick = (info) => {
    const eventDetails = info.event.extendedProps;
    if (!eventDetails || !eventDetails.details) {
      toast.error("Détails de l'événement manquants.");
      return;
    }

      const PaybackNo = eventDetails.details.PaybackNo;
      fetchUserDetails(PaybackNo);
      setSelectedRemb(eventDetails.details);
   

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
        events={ eventsRemboursements}
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

export default CalendrierRemb;