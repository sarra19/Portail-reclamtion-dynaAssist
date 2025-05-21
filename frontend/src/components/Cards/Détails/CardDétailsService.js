import React, { useState, useEffect } from "react";
import SummaryApi from '../../../api/common';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from "framer-motion";
import { FaTags } from "react-icons/fa";

export default function CardDétailsService() {
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [data, setData] = useState({
    Image: "",
    Name: "",
    Description: "",
    Tags: ""
  });

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${SummaryApi.serviceDetails.url}/${id}`);
        const dataResponse = await response.json();

        if (dataResponse.success && dataResponse.service) {
          const { Image, Name, Description, Tags } = dataResponse.service;
          setData({
            Image: Image || "",
            Name: Name || "",
            Description: Description || "",
            Tags: Tags || "",
          });
        } else {
          toast.error("Erreur: Service non trouvé ou format invalide");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        toast.error("Erreur lors du chargement des données du service.");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br mt-12 from-blue-50 to-gray-100 flex items-start justify-center px-4 sm:px-6 lg:px-8">
        {/* Suppression de min-h-screen et ajustement des marges */}
        <ToastContainer position='top-center' />
        
        <motion.div 
          className="bg-bleu-dys p-4 rounded-xl shadow-2xl max-w-6xl w-full mt-2 " // Réduction des marges et du padding
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <motion.div 
              className="flex flex-col lg:flex-row items-center gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Image Section with hover effect */}
              <motion.div 
                className="w-full lg:w-1/2 flex justify-center"
                variants={itemVariants}
              >
                {data.Image && (
                  <motion.img
                    alt={data.Name}
                    src={data.Image}
                    className="w-50 h-auto object-cover rounded-xl shadow-lg border-8 border-white transform hover:scale-105 transition-transform duration-300"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  />
                )}
              </motion.div>
            
              {/* Text Section */}
              <motion.div 
                className="w-full lg:w-1/2 text-white"
                variants={itemVariants}
              >
                <motion.h2 
                  className="text-4xl font-bold mb-6 text-white"
                  variants={itemVariants}
                >
                  {data.Name}
                </motion.h2>
                
                <motion.p 
                  className="text-lg mb-8 leading-relaxed"
                  variants={itemVariants}
                >
                  {data.Description}
                </motion.p>
                
                <motion.div 
                  className="flex items-center mb-4"
                  variants={itemVariants}
                >
                  <FaTags className="text-white mr-2 text-xl" />
                  <span className="font-semibold text-gray-700">Tags :</span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-wrap gap-3"
                  variants={containerVariants}
                >
                  {data.Tags &&
                    data.Tags.split(",").map((tag, index) => (
                      <motion.span
                        key={index}
                        className="bg-white mb-1 text-bleu-dys ml-1 px-4 py-2 rounded-full text-sm font-semibold shadow-md"
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, backgroundColor: "#c4cbea" }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        #{tag.trim()}
                      </motion.span>
                    ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <a href={`/admin/service`}>
        <button
          className=" mt-2 ml-2 bg-gray-500 text-white active:bg-gray-500 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
          type="button"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Retour
        </button>
      </a>
    </>
  );
}