import SummaryApi from "api/common";

import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";

const ChangeReclamation = ({
  reclamationId,
  subject: initialSubject,
  content: initialContent,
  onClose,
  callFunc,
}) => {
  const [subject, setSubject] = useState(initialSubject); // State for subject
  const [content, setContent] = useState(initialContent); // State for content

  // Handle changes in subject
  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
  };

  // Handle changes in content
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // Update reclamation details
  const updateReclamationDetails = async () => {
    try {
      const response = await fetch(`${SummaryApi.updateReclamation.url}/${reclamationId}`, {
        method: SummaryApi.updateReclamation.method, // Ensure it's PUT or PATCH
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject,
          content: content,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Réclamation mise à jour avec succès.");
        onClose(); // Close the modal
        callFunc(); // Refresh the list of reclamations
      } else {
        // Handle detailed validation errors
        if (result.errors) {
          result.errors.forEach((err) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          // Display a general error message
          toast.error(result.message || "Erreur lors de la mise à jour de la réclamation.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réclamation:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour de la réclamation.");
    }
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 w-full h-full z-10 flex justify-center items-center bg-slate-200 bg-opacity-50">
      <div className="mx-auto bg-white border border-orange-dys shadow-xl rounded-lg p-8 w-96 max-w-md">
        <ToastContainer position="top-center" />

        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          <IoMdClose size={24} />
        </button>

        {/* Title */}
        <h1 className="pb-6 text-xl text-orange-dys font-semibold text-center">
          Modifier les détails de la Réclamation
        </h1>

        {/* Form Fields */}
        <div className="space-y-4">
       

          <div>
            <label className="block mb-2 text-gray-600 font-medium">Contenu :</label>
            <textarea
              value={content}
              onChange={handleContentChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="w-full py-3 px-6 bg-orange-dys text-white font-semibold hover:bg-orange-600 focus:outline-none transition-all duration-200 mt-6"
          onClick={updateReclamationDetails}
        >
          Mettre à jour la Réclamation
        </button>
      </div>
    </div>
  );
};

export default ChangeReclamation;