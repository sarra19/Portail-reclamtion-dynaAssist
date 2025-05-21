import React, { useState, useEffect } from "react";
import SummaryApi from '../api/common';
import Footer from "components/Footers/Footer.js";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import HeaderAuth from "components/Header/HeaderAuth";
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { motion } from "framer-motion"; // Importer motion

export default function Produits() {
  const [allProduit, setAllProduit] = useState([]);
  const [filteredProduit, setFilteredProduit] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [prodPerPage] = useState(4); // Nombre de produits par page
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [searchType, setSearchType] = useState("keywords"); // Recherche par défaut : mots-clés

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

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setCurrentUser(result.data);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de l'utilisateur :", error);
      toast.error("Échec de la récupération des détails de l'utilisateur.");
    }
  };

  const fetchAllProduit = async () => {
    try {
      const response = await fetch(SummaryApi.allProduit.url, {
        method: SummaryApi.allProduit.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const dataResponse = await response.json();
      if (Array.isArray(dataResponse) && dataResponse.length > 0) {
        setAllProduit(dataResponse);
        setFilteredProduit(dataResponse);
      } else {
        console.error("Aucune donnée de produit disponible dans la réponse de l'API.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des produits :", error);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilteredProduit(allProduit);
    setCurrentPage(1);
  };

  const handleSearch = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchType === "keywords") {
        if (searchTerm) queryParams.append('Name', searchTerm);
      } else if (searchType === "price") {
        if (priceRange.min) queryParams.append('PriceMin', priceRange.min);
        if (priceRange.max) queryParams.append('PriceMax', priceRange.max);
      }
      const response = await fetch(`${SummaryApi.searchProducts.url}?${queryParams.toString()}`, {
        method: SummaryApi.searchProducts.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const dataResponse = await response.json();
      if (Array.isArray(dataResponse) && dataResponse.length > 0) {
        setFilteredProduit(dataResponse);
      } else {
        setFilteredProduit([]); // Aucun résultat trouvé
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de produits :", error);
      toast.error("Erreur lors de la recherche de produits.");
    }
  };

  const handleReclamerClick = async (produitNo, e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Veuillez vous connecter...!");
      return;
    }
    console.log("Utilisateur connecté, redirection...");
    window.location.href = `/Envoyer-réclamation-produit/${produitNo}`;
  };

  useEffect(() => {
    fetchAllProduit();
    fetchCurrentUser();
  }, []);

  const indexOfLastUser = currentPage * prodPerPage;
  const indexOfFirstUser = indexOfLastUser - prodPerPage;
  const CurrentProds = filteredProduit.slice(indexOfFirstUser, indexOfLastUser);
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProduit.length / prodPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <HeaderAuth fixed />
      <IndexNavbar fixed />

      <main>
          <ToastContainer position='top-center' />

        {/* Section Hero */}
        <motion.div
          className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <img
            alt="..."
            className="absolute top-0 w-full h-full bg-center bg-cover"
            src={require("assets/img/service.png")}
          />

          <span id="blackOverlay" className="w-full h-full absolute opacity-75"></span>
          <div className="container relative mx-auto">
            <div className="items-center flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                <div className="pr-12">
                  <motion.h1
                    className="text-white font-semibold text-5xl"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    Nos Produits.
                  </motion.h1>
                  <motion.p
                    className="mt-4 text-lg text-blueGray-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    Votre succès est notre intégration.
                  </motion.p>
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
        </motion.div>

        {/* Section Liste des Produits */}
        <section className="pb-20 pt-12 bg-blueGray-200">

          <div className="container mx-auto px-4">

            <div className="flex flex-wrap justify-center text-center mb-10">
              <div className="w-full lg:w-6/12 px-4">
                <h2 className="text-4xl text-black font-semibold">Découvrez nos solutions produits innovantes</h2>
                <p className="text-lg leading-relaxed m-4 text-black">
                  Notre catalogue de produits est le fruit de 15 ans d'expertise en développement et intégration.
                  Chaque solution a été conçue pour répondre aux besoins spécifiques des entreprises modernes,
                  combinant performance, fiabilité et facilité d'utilisation. Que vous cherchiez à automatiser vos processus,
                  optimiser votre gestion ou accélérer votre croissance, nos produits offrent des fonctionnalités clés
                  pour transformer vos opérations quotidiennes.
                </p>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 mt-6 ">
            {/* Formulaire de recherche - reste identique... */}
            <div className="w-full mx-auto items-center flex justify-center mb-4 md:flex-nowrap flex-wrap md:px-10 px-4">
              {/* Search Container */}
              <div className="flex items-center rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                {/* Search Type Selector (Dropdown) */}
                <div className="shrink-0 relative">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="border-0 mr-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                  >
                    <option value="keywords">Nom de Produit</option>
                    <option value="price">Fourchette de prix</option>
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
                      // Champ de recherche pour "Prix"
                      <div className="relative flex w-full flex-wrap items-stretch mb-2">

                        <div className="flex items-center w-full pl-2">
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            value={priceRange.max}
                            onChange={(e) => {
                              setPriceRange({ ...priceRange, max: e.target.value });
                              handleSearch(); // Rechercher lors de la modification
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="ml-4 text-sm text-gray-700 font-medium mr-2">Max ({priceRange.max}TND)</span>
                          <button
                            type="button"
                            onClick={handleReset}
                            className="px-3 py-1 mt-2 bg-bleuwhite-500 hover:bg-gray-400 text-white text-sm font-semibold rounded"
                          >
                            Réinitialiser
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
            {/* Cartes de produits avec animation */}
            <motion.div
              className="flex flex-wrap -mx-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {CurrentProds.length > 0 ? (
                CurrentProds.map((produit, index) => (
                  <motion.div
                    key={index}
                    className="w-full sm:w-6/12 md:w-4/12 lg:w-3/12 px-4 mb-8 flex"
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative flex flex-col bg-white w-full h-full shadow-lg rounded-lg overflow-hidden transition-transform duration-150 ease-in-out">
                      {/* Conteneur image avec hauteur fixe */}
                      <div className="w-full h-48 overflow-hidden bg-gray-100">
                        <img
                          alt={produit.Name}
                          src={produit.ImageProduct}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Non+Disponible';
                          }}
                        />
                      </div>

                      {/* Contenu texte avec flex et min-height */}
                      <div className="p-4 flex flex-col" style={{ minHeight: '180px' }}>
                        {/* Titre */}
                        <a href={`/détails-produit/${produit.No_}`} className="flex-shrink-0">
                          <h4 className="text-lg font-bold text-gray-800 cursor-pointer line-clamp-2 hover:text-blue-600 transition-colors">
                            {produit.Name}
                          </h4>
                        </a>

                        {/* Espace flexible qui pousse le reste vers le bas */}
                        <div className="flex-grow"></div>

                        {/* Prix et lien Voir plus */}
                        <div className="flex items-center justify-between mt-2 flex-shrink-0">
                          <span className="font-bold text-orange-500">
                            {produit.Price || "0"} TND
                          </span>
                          <a
                            href={`/détails-produit/${produit.No_}`}
                            className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
                          >
                            Voir plus <i className="fa fa-angle-double-right ml-1"></i>
                          </a>
                        </div>

                        {/* Bouton toujours en bas */}
                        <div className="mt-4 flex-shrink-0">
                          <button
                            className="w-full px-4 py-2 rounded-md font-medium text-white transition-colors bg-orange-dys hover:bg-orange-600"
                            onClick={(e) => handleReclamerClick(produit.No_, e)}
                          >
                            {currentUser?.Role !== 0 ? "Réclamer le produit" : "Réclamer le fournisseur"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="w-full text-center py-10">
                  <p className="text-gray-500 text-lg">Aucun produit disponible.</p>
                </div>
              )}
            </motion.div>
            {/* Pagination animée */}
            <motion.div
              className="py-2 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <nav className="block">
                <ul className="flex pl-0 rounded list-none flex-wrap">
                  <li>
                    <a
                      href="#pablo"
                      onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                      className="first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-orange-dys bg-white text-orange-dys"
                    >
                      <i className="fas fa-chevron-left -ml-px"></i>
                    </a>
                  </li>
                  {pageNumbers.map(number => (
                    <li key={number}>
                      <a
                        href="#pablo"
                        onClick={() => setCurrentPage(number)}
                        className={`first:ml-0 text-xs font-semibold ml-1 flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative ${currentPage === number ? "bg-orange-dys text-white" : "bg-white text-orange-dys"
                          } border border-solid border-orange-dys`}
                      >
                        {number}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href="#pablo"
                      onClick={() => setCurrentPage(currentPage < pageNumbers.length ? currentPage + 1 : pageNumbers.length)}
                      className="text-xs font-semibold ml-1 flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-orange-dys bg-white text-orange-dys"
                    >
                      <i className="fas fa-chevron-right -ml-px"></i>
                    </a>
                  </li>
                </ul>
              </nav>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}