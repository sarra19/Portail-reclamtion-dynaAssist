import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";
import SummaryApi from "api/common";

// Format date to YYYY-MM-DD
const formatDate = (date) => date ? new Date(date).toISOString().split("T")[0] : "";

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
  const [subject] = useState(initialSubject);
  const [content, setContent] = useState(initialContent);
  const [serviceSup, setServiceSup] = useState(initialServiceSup);
  const [remboursement, setRemboursement] = useState({
    montant: initialRemboursement?.montant || "",
    datePrevu: formatDate(initialRemboursement?.datePrevu),
  });
  const [intervention, setIntervention] = useState({
    datePrevuInterv: formatDate(initialIntervention?.datePrevuInterv),
    technicienResponsable: initialIntervention?.technicienResponsable || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if ([1, 3].includes(serviceSup) && (!remboursement.montant || !remboursement.datePrevu)) {
      toast.error("Veuillez remplir les détails du remboursement.");
      return false;
    }
    if ([2, 3].includes(serviceSup) && (!intervention.datePrevuInterv || !intervention.technicienResponsable)) {
      toast.error("Veuillez remplir les détails de l'intervention.");
      return false;
    }
    return true;
  };

  const updateResponseDetails = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${SummaryApi.updateReponse.url}`, {
        method: SummaryApi.updateReponse.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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
        (result.errors || [{ message: result.message }]).forEach((err) => {
          toast.error(`${err.field ? `${err.field}: ` : ""}${err.message}`);
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed top-0 mt-20  p-4  inset-0 z-50 flex items-center justify-center  bg-opacity-50 backdrop-blur-sm">
      <ToastContainer position="top-center" />
      <div className="relative border border-orange-dys  w-full max-w-2xl rounded-2xl bg-white p-7  shadow-lg">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-600">
          <IoMdClose size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-orange-600 mb-4 mt-2 text-center">Modifier la Réponse</h2>
            <div className=" rounded-md p-4 bg-gray-50">

        {/* Content */}
        <div className="space-y-5">
          {/* Contenu */}
          <div>
            <label className="text-sm font-medium text-gray-700 block">Contenu</label>
            <textarea
              rows="4"
              className="w-full mt-1 rounded-md border px-3 py-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Modifier le contenu de la réponse..."
            />
          </div>

          {/* Type de service */}
          <div>
            <label className="text-sm font-medium text-gray-700 block">Type de service</label>
            <select
              className="w-full mt-1 rounded-md border px-3 py-2"
              value={serviceSup}
              onChange={(e) => setServiceSup(parseInt(e.target.value))}
            >
              <option value={0}>Aucun</option>
              <option value={1}>Remboursement</option>
              <option value={2}>Intervention</option>
              <option value={3}>Remboursement + Intervention</option>
            </select>
          </div>
</div>
          {/* Remboursement */}
          {(serviceSup === 1 || serviceSup === 3) && (
            <div className=" rounded-md p-4 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Détails de remboursement</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  className="rounded-md border px-3 py-2"
                  placeholder="Montant"
                  value={remboursement.montant}
                  onChange={(e) => setRemboursement({ ...remboursement, montant: e.target.value })}
                />
                <input
                  type="date"
                  className="rounded-md border px-3 py-2"
                  value={remboursement.datePrevu}
                  onChange={(e) => setRemboursement({ ...remboursement, datePrevu: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Intervention */}
          {(serviceSup === 2 || serviceSup === 3) && (
            <div className=" rounded-md p-4 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Détails d'intervention</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  className="rounded-md border px-3 py-2"
                  value={intervention.datePrevuInterv}
                  onChange={(e) => setIntervention({ ...intervention, datePrevuInterv: e.target.value })}
                />
                <input
                  type="text"
                  className="rounded-md border px-3 py-2"
                  placeholder="Technicien responsable"
                  value={intervention.technicienResponsable}
                  onChange={(e) => setIntervention({ ...intervention, technicienResponsable: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-2 mb-2 mr-2 flex justify-end">
          <button
            onClick={updateResponseDetails}
            disabled={isSubmitting}
            className={`px-6 py-2 text-white font-semibold transition ${
              isSubmitting ? "bg-orange-dys cursor-not-allowed" : "bg-orange-dys hover:bg-orange-dys"
            }`}
          >
            {isSubmitting ? "Mise à jour..." : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeResponse;
