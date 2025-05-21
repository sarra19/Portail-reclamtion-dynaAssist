import React, { useState, useEffect } from "react";
import SummaryApi from '../api/common';
import Footer from "components/Footers/Footer.js";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import CardStats from "components/Cards/CardStats";
import HeaderAuth from "components/Header/HeaderAuth";
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion"; // Importer motion

export default function Service() {
  const [allService, setAllService] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("keywords"); // "keywords" or "price"
  const user = useSelector(state => state?.user?.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [servicePerPage] = useState(4); // Number of services per page

  // Variants pour les animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Délai entre chaque enfant
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  useEffect(() => {
    console.log(user);
  }, [user]);

  const fetchAllService = async () => {
    try {
      const response = await fetch(SummaryApi.allService.url, {
        method: SummaryApi.allService.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const dataResponse = await response.json();
      if (Array.isArray(dataResponse) && dataResponse.length > 0) {
        setAllService(dataResponse);
        setFilteredServices(dataResponse);
      } else {
        console.error("Aucune donnée de service disponible dans la réponse de l'API.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des services:", error);
    }
  };

  useEffect(() => {
    fetchAllService();
  }, []);

  const handleReset = () => {
    setSearchTerm("");
    setFilteredServices(allService);
    setCurrentPage(1);
  };

  const handleSearch = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchType === "keywords") {
        if (searchTerm) queryParams.append('Name', searchTerm);
      } else if (searchType === "Tags") {
        if (searchTerm) queryParams.append('Tags', searchTerm);
      }
      const response = await fetch(`${SummaryApi.searchServices.url}?${queryParams.toString()}`, {
        method: SummaryApi.searchProducts.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const dataResponse = await response.json();
      if (Array.isArray(dataResponse) && dataResponse.length > 0) {
        setFilteredServices(dataResponse);
      } else {
        setFilteredServices([]); // No results found
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de produits:", error);
      toast.error("Erreur lors de la recherche de produits.");
    }
  };

  const indexOfLastUser = currentPage * servicePerPage;
  const indexOfFirstUser = indexOfLastUser - servicePerPage;
  const CurrentServices = filteredServices.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <>
      <HeaderAuth fixed />
      <IndexNavbar fixed />
                <ToastContainer position='top-center' />
      
      <main>
        {/* Section Hero */}
        <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75">
          <img
            alt="..."
            className="absolute top-0 w-full h-full bg-center bg-cover"
            src={require("assets/img/service.png")}
          />
          <span id="blackOverlay" className="w-full h-full absolute opacity-75"></span>
          <div className="container relative mx-auto animate-fade-down animate-once animate-duration-[2000ms] animate-ease-in-out animate-fill-forwards">
            <div className="items-center flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                <div className="pr-12">
                  <h1 className="text-white font-semibold text-5xl">Nos Services.</h1>
                  <p className="mt-4 text-lg text-blueGray-200">Votre succès est notre intégration.</p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
            style={{ transform: "translateZ(0)" }}
          >
            <svg
              className="absolute bottom-0 overflow-hidden"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
<polygon 
    className="text-orange-dys fill-current" 
    points="2560 0 2560 100 0 100" 
    stroke="currentColor" 
    stroke-width="4">
</polygon>
            </svg>
          </div>
        </div>

        <section className="pt-20 pb-20 bg-blueGray-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center text-center mb-10">
              <div className="w-full lg:w-6/12 px-4">
                <h2 className="text-4xl text-black font-semibold">Transformez votre entreprise avec l'ERP intelligent</h2>
                <p className="text-lg leading-relaxed m-4 text-black">
                  Depuis plus de 15 ans, nous avons aidé de nombreuses entreprises à déployer et à optimiser leurs systèmes ERP.
                  Notre expertise couvre toutes les étapes de l'intégration, de l'analyse des besoins à la mise en œuvre et au support continu.
                  Nous nous engageons à fournir des solutions qui améliorent l'efficacité opérationnelle et favorisent la croissance.                </p>
              </div>
            </div>
          </div>
          <div className="w-full mx-auto items-center flex justify-center mb-4 md:flex-nowrap flex-wrap md:px-10 px-4">

            <div className="flex items-center rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              {/* Search Type Selector (Dropdown) */}
              <div className="shrink-0 relative">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="border-0 mr-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                >
                  <option value="keywords">Nom de Service</option>
                  <option value="Tags">Tags de Service</option>
                </select>
                {/* Dropdown Icon */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Formulaire de recherche */}
              <form className="ml-2 mt-2 mb-2 flex flex-row flex-wrap items-center lg:ml-0">
                <div className="flex-1 relative">
                  {searchType === "keywords" ? (
                    // Champ de recherche pour "Nom"
                    <div className="relative flex w-full flex-wrap items-stretch mb-2">
                      <span className="mt-1 z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
                        <i className="fas fa-search text-blueGray-400"></i>
                      </span>
                      <input
                        type="text"
                        placeholder="Rechercher par nom..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          if (e.target.value === "") {
                            handleReset(); // Réinitialiser si le champ est vide
                          } else {
                            handleSearch(); // Rechercher lors de la saisie
                          }
                        }}
                        className="border-0 px-3 py-2 mt-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
                      />
                    </div>
                  ) : (
                    // Champ de recherche pour "Tags"
                    <div className="relative flex w-full flex-wrap items-stretch mb-2">
                      <span className="mt-1 z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
                        <i className="fas fa-search text-blueGray-400"></i>
                      </span>
                      <input
                        type="text"
                        placeholder="Rechercher par tags..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          if (e.target.value === "") {
                            handleReset(); // Réinitialiser si le champ est vide
                          } else {
                            handleSearch(); // Rechercher lors de la saisie
                          }
                        }}
                        className="border-0 px-3 py-2 mt-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
                      />
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
          {/* Section Cartes de Services avec animation */}
          <motion.div
            className="flex flex-wrap p-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {CurrentServices.length > 0 ? (
              CurrentServices.map((service, index) => (
                <motion.div
                  key={index}
                  className="w-full lg:w-6/12 xl:w-3/12 px-4"
                  variants={itemVariants}
                >
                  <CardStats
                    statTitle={service.Name}
                    statDescripiron={service.Description}
                    statImage={service.Image}
                    id={service.No_}
                  />
                </motion.div>
              ))
            ) : (
              <p className="text-center w-full">Aucun service trouvé.</p>
            )}
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}