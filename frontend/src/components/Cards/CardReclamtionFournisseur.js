import React, { useState, useEffect } from "react";
import SummaryApi from "../../api/common";
import { toast, ToastContainer } from "react-toastify";

export default function CardReclamationFournisseur() {
  const [allReclamation, setAllReclamation] = useState([]);
  const [mainTab, setMainTab] = useState("Boîte de réception");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [récPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("Name");
  const [filteredReclamations, setFilteredReclamations] = useState([]);
  const [sortBy, setSortBy] = useState("CreatedAt"); // Default sort by date
  const [order, setOrder] = useState("DESC"); // Default order: most recent first

  // Fetch current user details
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
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details.");
    }
  };

  // Fetch all reclamations with sorting
  const fetchAllReclamation = async () => {
    try {
      const response = await fetch(
        `${SummaryApi.RecievedRec.url}?sortBy=${sortBy}&order=${order}`,
        {
          method: SummaryApi.RecievedRec.method,
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const dataResponse = await response.json();
      console.log("Reclamation data:", dataResponse);

      if (dataResponse.success && Array.isArray(dataResponse.data)) {
        setAllReclamation(dataResponse.data);
        setFilteredReclamations(dataResponse.data); // Initialize filtered reclamations
      } else {
        console.error("Aucune donnée de Réclamation disponible.");
        setAllReclamation([]);
        setFilteredReclamations([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des Réclamations:", error);
      toast.error("Erreur lors de la récupération des Réclamations.");
    }
  };

  // Update reclamation status
  const updateStatus = async (reclamationId) => {
    try {
      if (currentUser?.Role !== 1) {
        const response = await fetch(`${SummaryApi.updateStatus.url}/${reclamationId}`, {
          method: SummaryApi.updateStatus.method,
          credentials: "include",
        });
        const result = await response.json();

        if (result.success) {
          toast.success("Statut de la réclamation mis à jour avec succès.");
          fetchAllReclamation(); // Re-fetch with current sorting
        } else {
          toast.error(result.message || "Échec de la mise à jour du statut.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  };

  // Archive reclamation
  const ArchiveRec = async (reclamationId) => {
    try {
      if (currentUser?.Role !== 1) {
        const response = await fetch(`${SummaryApi.ArchiveRec.url}/${reclamationId}`, {
          method: SummaryApi.ArchiveRec.method,
          credentials: "include",
        });
        const result = await response.json();

        if (result.success) {
          toast.success("Réclamation Archivée.");
          fetchAllReclamation(); // Re-fetch with current sorting
        } else {
          toast.error(result.message || "Échec dans l'Archivage.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'Archivage:", error);
      toast.error("Erreur lors de l'Archivage.");
    }
  };

  // Unarchive reclamation
  const desArchiveRec = async (reclamationId) => {
    try {
      if (currentUser?.Role !== 1) {
        const response = await fetch(`${SummaryApi.desArchiveRec.url}/${reclamationId}`, {
          method: SummaryApi.desArchiveRec.method,
          credentials: "include",
        });
        const result = await response.json();

        if (result.success) {
          toast.success("Réclamation désarchivée.");
          fetchAllReclamation(); // Re-fetch with current sorting
        } else {
          toast.error(result.message || "Échec dans le désarchivage.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de le désarchivage:", error);
      toast.error("Erreur lors de le désarchivage.");
    }
  };

  // Handle search with sorting
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredReclamations(allReclamation);
      return;
    }

    try {
      const queryParams = new URLSearchParams({ [searchType]: searchTerm, sortBy, order });
      const response = await fetch(
        `${SummaryApi.findReclamation.url}?${queryParams.toString()}`,
        {
          method: SummaryApi.findReclamation.method,
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const dataResponse = await response.json();

      if (Array.isArray(dataResponse)) {
        setFilteredReclamations(dataResponse);
      } else {
        setFilteredReclamations([]);
        toast.info("Aucune réclamation trouvée pour votre recherche.");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast.error("Erreur lors de la recherche.");
      setFilteredReclamations([]);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setFilteredReclamations(allReclamation);
  };

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setOrder("ASC");
    }
  };

  // Fetch data on mount and when sortBy or order changes
  useEffect(() => {
    fetchCurrentUser();
    fetchAllReclamation();
  }, [sortBy, order]);

  // Handle search when term changes
  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setFilteredReclamations(allReclamation);
    }
  }, [searchTerm, searchType, sortBy, order]);

  // Filter reclamations based on tab and status
  const finalFilteredReclamations = filteredReclamations.filter((reclamation) => {
    if (mainTab === "Archive") {
      return reclamation.Archived === 1;
    } else if (mainTab === "Boîte de réception") {
      if (statusFilter === "all") {
        return reclamation.Archived === 0;
      } else {
        return reclamation.Status === parseInt(statusFilter) && reclamation.Archived === 0;
      }
    }
    return false;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * récPerPage;
  const indexOfFirstUser = indexOfLastUser - récPerPage;
  const CurrentReclamation = finalFilteredReclamations.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(finalFilteredReclamations.length / récPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg animate-fade-down animate-once animate-duration-[4000ms] animate-ease-in-out animate-fill-forwards">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center justify-between">
            <div className="relative px-4 flex-grow flex-1">
              <h3 className="font-semibold text-lg text-blueGray-700">
                <i className="fas fa-exclamation-circle mr-2"></i>
                Mes Réclamations
              </h3>
            </div>
            <div className="flex justify-end">
              <a href={`/calendrierFournisseur`}>
                <button className="bg-bleu-dys hover:bg-blue-600 text-white font-bold uppercase text-xs px-4 py-2 rounded-full shadow hover:shadow-md outline-none focus:outline-none mr-2 ease-linear transition-all duration-150">
                  <i className="fas fa-calendar-alt mr-2"></i> Calendrier
                </button>
              </a>
            </div>
          </div>
          {/* Search Form */}
          <form
            className="ml-2 mt-2 mb-2 flex flex-row flex-wrap items-center lg:ml-0"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="flex items-center rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              {/* Search Type Selector */}
              <div className="shrink-0 relative">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="border-0 mr-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                >
                  <option value="Name">Nom de Cible</option>
                  <option value="Subject">Sujet</option>
                  <option value="Sender">Expéditeur</option>
                  <option value="Receiver">Destinataire</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Search Input */}
              <div className="ml-2 flex-1 relative">
                <div className="relative flex w-full flex-wrap items-stretch mb-2">
                  <span className="mt-1 z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
                    <i className="fas fa-search text-blueGray-400"></i>
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 px-3 py-2 mt-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Onglets principaux */}
        <div className="flex space-x-4 px-4 py-2 border-b">
          {["Boîte de réception", "Archive"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-t-lg text-sm font-bold uppercase transition-all duration-300 ${
                mainTab === tab
                  ? "bg-orange-dys text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => {
                setMainTab(tab);
                setStatusFilter("all");
                setCurrentPage(1); // Reset to first page
              }}
            >
              {tab === "Boîte de réception" ? (
                <i className="fas fa-inbox mr-2"></i>
              ) : (
                <i className="fas fa-archive mr-2"></i>
              )}
              {tab}
            </button>
          ))}
        </div>

        {/* Filtres de statut */}
        {mainTab === "Boîte de réception" && (
          <div className="flex justify-center space-x-4 px-4 py-3 bg-gray-50">
            {[
              { value: "all", label: "Tous", icon: "filter", className: "mr-1 bg-transparent text-bleu-dys hover:bg-gray-300", activeClassName: "bg-bleu-dys text-white" },
              { value: "0", label: "En cours", icon: "clock", className: "mr-1 ml-1 bg-transparent text-yellow-500 hover:bg-yellow-600", activeClassName: "bg-yellow-500 text-white" },
              { value: "1", label: "Traitée", icon: "check-circle", className: "mr-1 bg-transparent text-orange-dys hover:bg-orange-dys", activeClassName: "bg-orange-dys text-white" },
              { value: "2", label: "Résolue", icon: "check-double", className: "bg-transparent text-green-500 hover:bg-green-600", activeClassName: "bg-green-500 text-white" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setCurrentPage(1); // Reset to first page
                }}
                className={`flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase shadow hover:shadow-md transition-all duration-200 ${
                  statusFilter === filter.value ? filter.activeClassName : filter.className
                }`}
              >
                <i className={`fas fa-${filter.icon} mr-2`}></i>
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {/* Tableau des réclamations */}
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead className="thead-light">
              <tr>
                <th
                  className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer"
                  onClick={() => handleSort("CreatedAt")}
                >
                  <i className="fas fa-clock mr-2"></i>
                  Date d'Envoi
                  {sortBy === "CreatedAt" && (
                    <i className={`fas fa-caret-${order === "ASC" ? "up" : "down"} ml-2`}></i>
                  )}
                </th>
                <th
                  className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer"
                  onClick={() => handleSort("Subject")}
                >
                  <i className="fas fa-tag mr-2"></i>
                  Sujet
                  {sortBy === "Subject" && (
                    <i className={`fas fa-caret-${order === "ASC" ? "up" : "down"} ml-2`}></i>
                  )}
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  <i className="fas fa-info-circle mr-2"></i>
                  Statut
                </th>
                <th
                  className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left cursor-pointer"
                  onClick={() => handleSort("Name")}
                >
                  <i className="fas fa-user mr-2"></i>
                  Nom de Cible
                  {sortBy === "Name" && (
                    <i className={`fas fa-caret-${order === "ASC" ? "up" : "down"} ml-2`}></i>
                  )}
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  <i className="fas fa-cog mr-2"></i>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {CurrentReclamation.length > 0 ? (
                CurrentReclamation.map((reclamation, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm whitespace-nowrap p-4">
                      {reclamation.CreatedAt}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm whitespace-nowrap p-4">
                      <i className="fas fa-file-alt text-gray-400 mr-2"></i>
                      {reclamation.Subject}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <button
                        className={`rounded-full py-1 px-3 text-xs font-bold uppercase ${
                          reclamation.Status === 0
                            ? "bg-yellow-500 text-white"
                            : reclamation.Status === 1
                            ? "bg-orange-dys text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        <i
                          className={`fas ${
                            reclamation.Status === 0
                              ? "fa-clock"
                              : reclamation.Status === 1
                              ? "fa-check-circle"
                              : "fa-check-double"
                          } mr-1`}
                        ></i>
                        {reclamation.Status === 0
                          ? "En cours"
                          : reclamation.Status === 1
                          ? "Traitée"
                          : "Résolue"}
                      </button>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm whitespace-nowrap p-4">
                      <i className="fas fa-user-tag text-gray-400 mr-2"></i>
                      {reclamation.Name}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm whitespace-nowrap p-4 space-x-2">
                      {currentUser?.Role !== 1 && (
                        <>
                          {reclamation.Status !== 2 ? (
                            <a href={`/réponse-réclamations/${reclamation.No_}`}>
                              <button
                                className="bg-transparent border border-solid hover:text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                              >
                                <i className="fas fa-reply mr-1"></i> Répondre
                              </button>
                            </a>
                          ) : (
                            <button
                              className={`${
                                reclamation.Archived === 1
                                  ? "bg-transparent hover:bg-transparent"
                                  : "bg-transparent hover:bg-transparent"
                              } mr-2 border border-solid active:bg-transparent font-bold uppercase text-xs px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150`}
                              type="button"
                              onClick={() =>
                                reclamation.Archived === 1
                                  ? desArchiveRec(reclamation.No_)
                                  : ArchiveRec(reclamation.No_)
                              }
                            >
                              <i
                                className={`fas ${
                                  reclamation.Archived === 1 ? "fa-folder-open" : "fa-folder"
                                } mr-1`}
                              ></i>
                              {reclamation.Archived === 1 ? "Désarchiver" : "Archiver"}
                            </button>
                          )}
                          <a href={`/détails-réclamations/${reclamation.No_}`}>
                            <button
                              className="bg-bleu-dys hover:bg-blue-600 text-white font-bold uppercase text-xs px-4 py-2 rounded-full shadow hover:shadow-md outline-none focus:outline-none mr-2 ease-linear transition-all duration-150"
                              type="button"
                              onClick={() => reclamation.Status !== 2 && updateStatus(reclamation.No_)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </a>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    <i className="fas fa-inbox text-3xl mb-2 block"></i>
                    {searchTerm
                      ? "Aucun résultat trouvé pour votre recherche."
                      : "Aucune réclamation trouvée."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="py-4 flex justify-center bg-gray-50 rounded-b-lg">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-blue-500 border border-blue-300 shadow hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  currentPage === number
                    ? "bg-orange-dys text-white shadow-md"
                    : "bg-white text-blue-500 border border-blue-300 hover:bg-blue-50"
                }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage(currentPage < pageNumbers.length ? currentPage + 1 : pageNumbers.length)
              }
              disabled={currentPage === pageNumbers.length}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-blue-500 border border-blue-300 shadow hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}