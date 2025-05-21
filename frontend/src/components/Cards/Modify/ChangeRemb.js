import React, { useState, useEffect } from 'react';
import { IoMdClose } from "react-icons/io";
import { toast, ToastContainer } from 'react-toastify';
import SummaryApi from 'api/common';

const ChangeRemb = ({
  RembId,
  onClose,
  callFunc,
}) => {
  // État pour stocker les valeurs du formulaire
  const [rembDate, setInterventionDate] = useState('');
  const [Montant, setMontant] = useState('');

  // État pour les erreurs de validation
  const [errors, setErrors] = useState({});

  // Récupérer les détails du remboursement à partir de l'API
  useEffect(() => {
    const getRembDetails = async () => {
      try {
        const response = await fetch(`${SummaryApi.getRemboursement.url}/${RembId}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();

        if (data && data.data && data.data.No_) {
          const formattedDate = new Date(data.data.DatePrevu).toISOString().split('T')[0];
          setInterventionDate(formattedDate);
          setMontant(data.data.Montant.toString());
        } else {
          toast.error('Remboursement non trouvé');
        }

      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
        toast.error('Une erreur s\'est produite');
      }
    };

    getRembDetails();
  }, [RembId]);

  // Gestion des changements dans le champ date
  const handleDateChange = (e) => {
    setInterventionDate(e.target.value);
  };

  // Gestion des changements dans le montant
  const handleMontantChange = (e) => {
    setMontant(e.target.value);
  };

  // Validation côté frontend
  const validateForm = () => {
    const newErrors = {};

    // Valider la date
    if (!rembDate) {
      newErrors.rembDate = "La date prévue est requise.";
    }

    // Valider le montant
    if (!Montant) {
      newErrors.Montant = "Le montant est requis.";
    } else if (isNaN(Montant)) {
      newErrors.Montant = "Le montant doit être un nombre.";
    } else if (parseFloat(Montant) <= 0) {
      newErrors.Montant = "Le montant doit être supérieur à zéro.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mise à jour des informations sur le serveur
  const updateRemboursementDetails = async () => {
    if (!validateForm()) {
      return; // Arrêter si les validations échouent
    }

    try {
      const fetchResponse = await fetch(SummaryApi.updateRemboursement.url, {
        method: SummaryApi.updateRemboursement.method,
        credentials: 'include',
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          RembId: RembId,
          datePrevu: rembDate,
          Montant: parseFloat(Montant),
        }),
      });

      const responseData = await fetchResponse.json();

      if (responseData.success) {
        toast.success(responseData.message);
        onClose();
        callFunc(); // Rafraîchir les données après mise à jour
      } else {
        if (responseData.errors) {
          responseData.errors.forEach((err) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(responseData.message || "Erreur lors de la mise à jour");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Impossible de mettre à jour le remboursement.");
    }
  };

  return (
    <>
      <ToastContainer position='top-center' />

      <div className='fixed top-0 bottom-0 left-0 right-0 w-full h-full z-10 flex justify-center items-center bg-slate-200 bg-opacity-50'>
        <div className='mx-auto bg-white border border-orange-dys shadow-xl rounded-lg p-8 w-96 max-w-md'>
          <button
            className='absolute top-4 right-4 text-gray-600 hover:text-gray-800'
            onClick={onClose}
          >
            <IoMdClose size={24} />
          </button>

          <h1 className='pb-6 text-xl text-orange-dys font-semibold text-center'>Changer les détails du remboursement</h1>

          <div className="flex justify-between space-x-4 mb-6">
            {/* Champ Date */}
            <div className="w-full">
              <label className='block mb-2 text-gray-600 font-medium'>Date Prévue :</label>
              <input
                type="date"
                className={`w-full px-4 py-3 border ${errors.rembDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                value={rembDate || ''}
                onChange={handleDateChange}
              />
              {errors.rembDate && <p className="text-red-500 text-xs mt-1">{errors.rembDate}</p>}
            </div>

            {/* Champ Montant */}
            <div className="ml-2 w-full">
              <label className='block mb-2 text-gray-600 font-medium'>Montant :</label>
              <input
                type="text"
                className={`w-full px-4 py-3 border ${errors.Montant ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                value={Montant}
                onChange={handleMontantChange}
              />
              {errors.Montant && <p className="text-red-500 text-xs mt-1">{errors.Montant}</p>}
            </div>
          </div>

          <button
            className='w-full py-3 px-6 bg-orange-dys text-white font-semibold hover:bg-orange-600 focus:outline-none transition-all duration-200'
            onClick={updateRemboursementDetails}
          >
            Mettre à jour le Remboursement
          </button>
        </div>
      </div>
    </>
  );
};

export default ChangeRemb;