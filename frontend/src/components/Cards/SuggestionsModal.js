import React from "react";
import { IoMdClose } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";

const SuggestionsModal = ({ isOpen, onClose, suggestions }) => {
  if (!isOpen) return null;

  return (
<div className="fixed top-0  transform bg-slate-200 bg-opacity-50 w-30 h-full flex justify-center items-center">
      <div className="mx-auto bg-white border border-orange-dys shadow-xl rounded-lg p-8 w-96 max-w-md">
      <div className="flex justify-between items-center mb-4">
      <ToastContainer position="top-center" />
      <h2 className="text-xl font-bold text-orange-dys">Suggestions</h2>

        {/* Close Button */}
        <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoMdClose size={24} />
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="p-3 bg-gray-50 rounded-md border border-gray-200"
                >
                  <p className="text-gray-800">{suggestion}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">Aucune suggestion disponible</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestionsModal;