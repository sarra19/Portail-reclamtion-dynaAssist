import SummaryApi from "api/common";
import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";

// Utility function to format date to YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0]; // Converts to YYYY-MM-DD
};

const ChangeResponse = ({
  responseId,
  subject: initialSubject,
  content: initialContent,
  serviceSup: initialServiceSup,
  remboursement: initialRemboursement,
  intervention: initialIntervention,
  onClose,
  callFunc,
}) => {
  // State management
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState(initialContent);
  const [serviceSup, setServiceSup] = useState(initialServiceSup);
  const [remboursement, setRemboursement] = useState({
    montant: initialRemboursement?.montant || "",
    datePrevu: initialRemboursement?.datePrevu ? formatDate(initialRemboursement.datePrevu) : "",
  });
  const [intervention, setIntervention] = useState({
    datePrevuInterv: initialIntervention?.datePrevuInterv ? formatDate(initialIntervention.datePrevuInterv) : "",
    technicienResponsable: initialIntervention?.technicienResponsable || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle changes in content
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // Handle changes in service type
  const handleServiceSupChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setServiceSup(value);
    if (![1, 3].includes(value)) {
      setRemboursement({ montant: "", datePrevu: "" });
    }
    if (![2, 3].includes(value)) {
      setIntervention({ datePrevuInterv: "", technicienResponsable: "" });
    }
  };

  // Handle changes in refund details
  const handleRemboursementChange = (e, field) => {
    setRemboursement((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Handle changes in intervention details
  const handleInterventionChange = (e, field) => {
    setIntervention((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Validate form inputs
  const validateForm = () => {
    if ([1, 3].includes(serviceSup) && (!remboursement.montant || !remboursement.datePrevu)) {
      toast.error("Veuillez remplir tous les détails du remboursement.");
      return false;
    }
    if ([2, 3].includes(serviceSup) && (!intervention.datePrevuInterv || !intervention.technicienResponsable)) {
      toast.error("Veuillez remplir tous les détails de l'intervention.");
      return false;
    }
    return true;
  };

  // Update response details
  const updateResponseDetails = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${SummaryApi.updateReponse.url}`, {
        method: SummaryApi.updateReponse.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responseId,
          Subject: subject,
          content,
          ServiceSup: serviceSup,
          Montant: remboursement.montant,
          DatePrevu: remboursement.datePrevu,
          DatePrevuInterv: intervention.datePrevuInterv,
          TechnicienResponsable: intervention.technicienResponsable,
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Réponse mise à jour avec succès.");
        onClose();
        callFunc();
      } else {
        if (result.errors) {
          result.errors.forEach((err) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(result.message || "Erreur lors de la mise à jour de la réponse.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réponse:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour de la réponse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 top-0 z-50 flex items-center justify-center bg-slate-200 bg-opacity-50 p-4">
      <div className="mx-auto w-full max-w-4xl rounded-lg bg-white p-8 shadow-xl">
        <ToastContainer position="top-center" />
        {/* Close Button */}
        <button
          className="absolute right-6 top-6 text-gray-600 hover:text-gray-800"
          onClick={onClose}
          aria-label="Fermer le modal"
        >
          <IoMdClose size={24} />
        </button>
        {/* Title */}
        <h1 className="pb-6 text-center text-xl font-semibold text-orange-dys">
          Modifier les détails de la Réponse
        </h1>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column - Content & Service Type */}
          <div className="space-y-5">
            <div>
              <label htmlFor="content" className="mb-1 block font-medium text-gray-600">
                Contenu :
              </label>
              <textarea
                id="content"
                value={content}
                onChange={handleContentChange}
                rows="6"
                className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              ></textarea>
            </div>

            <div>
              <label htmlFor="serviceSup" className="mb-1 block font-medium text-gray-600">
                Type de service :
              </label>
              <select
                id="serviceSup"
                value={serviceSup}
                onChange={handleServiceSupChange}
                className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="0">Aucun</option>
                <option value="1">Remboursement</option>
                <option value="2">Intervention</option>
                <option value="3">Remboursement et Intervention</option>
              </select>
            </div>
          </div>

          {/* Right Column - Conditional Fields */}
          <div className="space-y-5">
            {/* Refund Details */}
            {(serviceSup === 1 || serviceSup === 3) && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 text-lg font-medium text-gray-700">Détails du remboursement :</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="montant" className="mb-1 block text-sm text-gray-600">
                      Montant :
                    </label>
                    <input
                      id="montant"
                      type="number"
                      value={remboursement.montant}
                      onChange={(e) => handleRemboursementChange(e, "montant")}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="datePrevu" className="mb-1 block text-sm text-gray-600">
                      Date prévue :
                    </label>
                    <input
                      id="datePrevu"
                      type="date"
                      value={remboursement.datePrevu}
                      onChange={(e) => handleRemboursementChange(e, "datePrevu")}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Intervention Details */}
            {(serviceSup === 2 || serviceSup === 3) && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 text-lg font-medium text-gray-700">Détails de l'intervention :</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="datePrevuInterv" className="mb-1 block text-sm text-gray-600">
                      Date prévue :
                    </label>
                    <input
                      id="datePrevuInterv"
                      type="date"
                      value={intervention.datePrevuInterv}
                      onChange={(e) => handleInterventionChange(e, "datePrevuInterv")}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="technicienResponsable" className="mb-1 block text-sm text-gray-600">
                      Technicien responsable :
                    </label>
                    <input
                      id="technicienResponsable"
                      type="text"
                      value={intervention.technicienResponsable}
                      onChange={(e) => handleInterventionChange(e, "technicienResponsable")}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            className={`rounded-lg px-6 py-3 font-semibold transition-all duration-200 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-dys hover:bg-orange-600 text-white"
            }`}
            onClick={updateResponseDetails}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Mise à jour en cours..." : "Mettre à jour la Réponse"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeResponse;