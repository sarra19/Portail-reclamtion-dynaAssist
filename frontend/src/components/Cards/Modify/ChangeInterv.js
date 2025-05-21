import React, { useState, useEffect } from 'react';
import { IoMdClose } from "react-icons/io";
import { toast, ToastContainer } from 'react-toastify';
import SummaryApi from 'api/common';

const ChangeInterv = ({
  interventionId,
  onClose,
  callFunc,
}) => {
  // États pour les champs du formulaire
  const [interventionDate, setInterventionDate] = useState('');
  const [responsibleTechnician, setResponsibleTechnician] = useState('');

  // État pour les erreurs
  const [errors, setErrors] = useState({});

  // Récupérer les données depuis l'API
  useEffect(() => {
    const getInterventionDetails = async () => {
      try {
        const response = await fetch(`${SummaryApi.getIntervention.url}/${interventionId}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();

       if (data && data.data && data.data.No_) {
  const formattedDate = new Date(data.data.DatePrevuInterv).toISOString().split('T')[0];
  setInterventionDate(formattedDate);
  setResponsibleTechnician(data.data.TechnicienResponsable || '');
} else {
  toast.error('Intervention non trouvée');
}

      } catch (error) {
        console.error("Erreur lors de la récupération des détails:", error);
        toast.error("Impossible de charger les informations de l'intervention.");
      }
    };

    getInterventionDetails();
  }, [interventionId]);

  // Gestion des changements dans les champs
  const handleDateChange = (e) => {
    setInterventionDate(e.target.value);
  };

  const handleTechnicianChange = (e) => {
    setResponsibleTechnician(e.target.value);
  };

  // Validation côté frontend
  const validateForm = () => {
    const newErrors = {};

    if (!interventionDate) {
      newErrors.interventionDate = "La date prévue est requise.";
    }

    if (!responsibleTechnician) {
      newErrors.responsibleTechnician = "Le nom du technicien est requis.";
    } else if (responsibleTechnician.length < 3) {
      newErrors.responsibleTechnician = "Le nom du technicien doit contenir au moins 3 caractères.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envoi vers le serveur
  const updateInterventionDetails = async () => {
    if (!validateForm()) {
      return; // Arrête si les validations échouent
    }

    try {
      const fetchResponse = await fetch(SummaryApi.updateIntervention.url, {
        method: SummaryApi.updateIntervention.method,
        credentials: 'include',
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          interventionId,
          datePrevuInterv: interventionDate,
          technicienResponsable: responsibleTechnician,
        })
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
          toast.error(responseData.message || "Erreur lors de la mise à jour de l'intervention");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'intervention :", error);
      toast.error("Une erreur s'est produite lors de la mise à jour de l'intervention.");
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />

      <div className='fixed top-0 bottom-0 left-0 right-0 w-full h-full z-10 flex justify-center items-center bg-slate-200 bg-opacity-50'>
        <div className='mx-auto bg-white border border-orange-dys shadow-xl rounded-lg p-8 w-96 max-w-md'>
          <button 
            className='absolute top-4 right-4 text-gray-600 hover:text-gray-800' 
            onClick={onClose}
          >
            <IoMdClose size={24} />
          </button>
          
          <h1 className='pb-6 text-xl text-orange-dys font-semibold text-center'>Changer les détails de l'intervention</h1>
          
          <div className="flex justify-between space-x-4 mb-6">
            {/* Champ Date Prévue */}
            <div className="w-full">
              <label className='block mb-2 text-gray-600 font-medium'>Date Prévue :</label>
              <input 
                type="date"
                className={`w-full px-4 py-3 border ${
                  errors.interventionDate ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                value={interventionDate || ''}
                onChange={handleDateChange}
              />
              {errors.interventionDate && (
                <p className="text-red-500 text-xs mt-1">{errors.interventionDate}</p>
              )}
            </div>

            {/* Champ Technicien Responsable */}
            <div className="ml-2 w-full">
              <label className='block mb-2 text-gray-600 font-medium'>Technicien Responsable :</label>
              <input 
                type="text"
                className={`w-full px-4 py-3 border ${
                  errors.responsibleTechnician ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                value={responsibleTechnician}
                onChange={handleTechnicianChange}
                placeholder="Nom du technicien"
              />
              {errors.responsibleTechnician && (
                <p className="text-red-500 text-xs mt-1">{errors.responsibleTechnician}</p>
              )}
            </div>
          </div>

          <button 
            className='w-full py-3 px-6 bg-orange-dys text-white font-semibold hover:bg-orange-600 focus:outline-none transition-all duration-200'
            onClick={updateInterventionDetails}
          >
            Mettre à jour l'Intervention
          </button>
        </div>
      </div>
    </>
  );
};

export default ChangeInterv;