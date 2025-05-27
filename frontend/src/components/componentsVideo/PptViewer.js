import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useHistory } from 'react-router-dom';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { FaUpload, FaArrowLeft, FaArrowRight, FaQuestionCircle, FaDownload } from 'react-icons/fa';
import { motion } from 'framer-motion';


// Set the worker source
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.216/pdf.worker.min.js`;

function PresentationViewer({ roomId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const history = useHistory();

  useEffect(() => {
    socketRef.current =io("ws://localhost:8800");
        socketRef.current.emit('joinRoom', roomId);

    socketRef.current.on('pptUploaded', (pptData) => {
      setImageUrls(pptData.slides || []);
      setCurrentIndex(0);
    });

    socketRef.current.on('slideUpdated', (newIndex) => {
      setCurrentIndex(newIndex);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation du fichier
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('roomId', roomId);

      const [pptResponse] = await Promise.all([
        axios.post('https://claimflow.onrender.com/uploadPpt', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      ]);

      const pptData = pptResponse.data;
      setImageUrls(pptData.slides || []);
      setCurrentIndex(0);

      socketRef.current.emit('uploadPpt', { roomId, pptFileData: pptData });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload presentation');
    } finally {
      setLoading(false);
    }
  };


const resetPresentation = () => {
  setSelectedFile(null);
  setImageUrls([]);
  setCurrentIndex(0);
  setError(null);
};

  const nextSlide = () => {
    if (currentIndex < imageUrls.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      socketRef.current.emit('slideChanged', { roomId, currentIndex: newIndex });
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      socketRef.current.emit('slideChanged', { roomId, currentIndex: newIndex });
    }
  };
  const handleDownload = () => {
    if (!selectedFile) return;
    
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(selectedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name || 'presentation.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="min-h-screen bg-blueGray-100 flex items-center justify-center p-4">
      {!imageUrls.length ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <div className="mx-auto bg-orange-dys-1 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <FaUpload className="text-orange-dys text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-blueGray-800 mb-2">
              Téléchargez votre présentation            </h2>
            <p className="text-blueGray-600">
              Partagez vos diapositives PDF avec les participants de la salle
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className={`block w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                  error ? 'border-red-500' : 'border-blueGray-300 hover:border-orange-dys'
                }`}
              >
                {selectedFile ? (
                  <span className="text-blueGray-800 font-medium">{selectedFile.name}</span>
                ) : (
                  <span className="text-blueGray-500">Choisissez un fichier PDF ou faites-le glisser ici</span>
                )}
              </label>
              {error && (
                <p className="mt-2 text-red-500 text-sm">{error}</p>
              )}
            </div>

            <button
              onClick={handleFileUpload}
              disabled={loading || !selectedFile}
              className={`w-full py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center ${
                loading || !selectedFile
                  ? 'bg-blueGray-300 cursor-not-allowed'
                  : 'bg-orange-dys hover:bg-orange-dys-2 text-white'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  Télécharger la présentation                </>
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-50 max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden">
  {/* Header responsive */}
  <div className="bg-blueGray-800 text-white p-3 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-2">
    <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
      Présentation: <span className="text-orange-dys">Slide {currentIndex + 1} of {imageUrls.length}</span>
    </h2>
    <button
      onClick={handleDownload}
      className="mb-2 flex items-center gap-1 bg-orange-dys hover:bg-orange-dys-2 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
    >
      <FaDownload className="text-xs sm:text-sm"/>
      <span className="hidden xs:inline">Télécharger PDF</span>
      <span className="xs:hidden">PDF</span>
    </button>
    <button
  onClick={resetPresentation}
  className="mt-2 sm:mt-0 sm:ml-2 flex items-center gap-1 bg-blueGray-600 hover:bg-blueGray-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
>
  <FaUpload className="text-xs sm:text-sm" />
  <span className="hidden xs:inline">Changer de présentation</span>
  <span className="xs:hidden">Changer</span>
</button>

  </div>

  <div className="p-2 sm:p-6">
    <div className="relative bg-blueGray-50 rounded-lg overflow-hidden shadow-md mb-4 sm:mb-6">
      <div className="flex items-center justify-between min-h-[50vh] sm:min-h-[60vh]">
        {/* Bouton précédent */}
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className={`ml-2 sm:ml-4 p-2 sm:p-3 rounded-full shadow-lg ${
            currentIndex === 0 ? 'bg-orange-dys' : 'bg-orange-dys hover:bg-orange-dys-2'
          } text-white transition-colors`}
        >
          <FaArrowLeft className="text-sm sm:text-base"/>
        </button>

        {/* Slide */}
        <div className="flex-grow flex items-center justify-center h-full">
          <img
            src={imageUrls[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className="max-w-full max-h-[50vh] sm:max-h-[70vh] object-contain p-2 sm:p-4"
          />
        </div>

        {/* Bouton suivant */}
        <button
          onClick={nextSlide}
          disabled={currentIndex === imageUrls.length - 1}
          className={`mr-2 sm:mr-4 p-2 sm:p-3 rounded-full shadow-lg ${
            currentIndex === imageUrls.length - 1 ? 'bg-orange-dys' : 'bg-orange-dys hover:bg-orange-dys-2'
          } text-white transition-colors`}
        >
          <FaArrowRight className="text-sm sm:text-base"/>
        </button>
      </div>
    </div>
  </div>
</div>
        </motion.div>
      )}
    </div>
  );
}

export default PresentationViewer;