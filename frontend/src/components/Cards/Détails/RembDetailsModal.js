import React, { useEffect, useState } from "react";
import SummaryApi from "api/common";
import { useSelector } from "react-redux";

const RembDetailsModal = ({ selectedRemb, beneficiaryDetails, setShowModal }) => {
  const currentUser = useSelector(state => state?.user?.user)


  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 w-full h-full z-10 flex justify-center items-center bg-slate-200 bg-opacity-50">
      <div className="mx-auto bg-white border border-orange-dys shadow-xl rounded-lg p-8 w-96 max-w-md">
        <button className="block ml-auto" onClick={handleClose}>
          <i className="fas fa-times text-xl"></i>
        </button>

        <h1 className="pb-4 text-lg text-orange-dys font-semibold">
          Détails du Remboursement
        </h1>

        <div className="space-y-2">
          <p>
            <i className="fas fa-file-alt mr-2"></i>
            <strong>Nom de Cible :</strong> le{" "}
            {selectedRemb?.TypeCible || selectedRemb?.details?.TypeCible}{" "}
            {selectedRemb?.NomCible || selectedRemb?.details?.NomCible}
          </p>
          <p>
            <i className="fas fa-file-alt mr-2"></i>
            <strong>Sujet :</strong> {selectedRemb.SujetReclamation}
          </p>
          <p>
            <i className="fas fa-money-bill-wave mr-2"></i>
            <strong>Montant :</strong> {selectedRemb.MontantPayback} DT
          </p>
          <p>
            <i className="fas fa-calendar-alt mr-2"></i>
            <strong>Date Prévue :</strong>{" "}
            {new Date(selectedRemb.DatePrevue).toLocaleDateString()}
          </p>
          <p>
            <i className="fas fa-user mr-2"></i>
            <strong>Bénéficiaire :</strong> {selectedRemb.Beneficiaire}
          </p>

          {/* Détails du bénéficiaire selon utilisateur courant */}
          {currentUser && selectedRemb && currentUser.No_ !== selectedRemb.ReclamationUserId ? (
            beneficiaryDetails ? (
              <div className="mt-4 space-y-2">
                <h2 className="font-semibold mb-2">Détails du Bénéficiaire</h2>
                <p>
                  <i className="fas fa-user mr-2"></i>
                  <strong>Nom :</strong> {beneficiaryDetails.FirstName || "Non renseigné"}{" "}
                  {beneficiaryDetails.LastName || ""}
                </p>
                <p>
                  <i className="fas fa-envelope mr-2"></i>
                  <strong>Email :</strong> {beneficiaryDetails.Email}
                </p>
                <p>
                  <i className="fas fa-phone mr-2"></i>
                  <strong>Téléphone :</strong> {beneficiaryDetails.Phone}
                </p>
                <p>
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  <strong>Ville :</strong> {beneficiaryDetails.City}, {beneficiaryDetails.Country}
                </p>
              </div>
            ) : (
              <p>Chargement des détails du bénéficiaire...</p>
            )
          ) : (
            <p className="italic text-gray-500">Vous êtes le bénéficiaire de ce remboursement.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RembDetailsModal;
