import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SummaryApi from "api/common";

import { toast, ToastContainer } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
export default function CardTableRec({ color }) {
  const [allUser, setAllUser] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reclamationsusersPerPage] = useState(5); // Nombre de réclamations par page
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("Name"); // "Name", "Subject", "Sender", ou "Receiver"
  const [filteredReclamations, setFilteredReclamations] = useState([]);
  const [sortBy, setSortBy] = useState("CreatedAt"); // Par défaut, tri par date d'envoi
  const [order, setOrder] = useState("ASC"); // Par défaut, ordre ascendant
  const [selectedStatus, setSelectedStatus] = useState("Tous"); // Par défaut, afficher toutes les réclamations

  // Fetch all reclamations on component mount
  useEffect(() => {
    fetchAllReclamation();
  }, [sortBy, order]); // Déclencher une nouvelle récupération lorsque le tri change

  // Fetch all reclamations from the API
  const fetchAllReclamation = async () => {
    try {
      const response = await fetch(`${SummaryApi.sortReclamation.url}?sortBy=${sortBy}&order=${order}`, {
        method: SummaryApi.sortReclamation.method,
        headers: { 'Content-Type': 'application/json' },
      });

      const dataResponse = await response.json();
      console.log("Reclamation data:", dataResponse);

      if (Array.isArray(dataResponse.data) && dataResponse.data.length > 0) {
        setAllUser(dataResponse.data);
        setFilteredReclamations(dataResponse.data); // Initialiser les réclamations filtrées
      } else {
        console.error("Aucune donnée de réclamation disponible dans la réponse de l'API.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des réclamations:", error);
    }
  };

  // Handle search
  const handleSearch = async () => {
    try {
      const queryParams = new URLSearchParams();

      if (searchType === "Name" && searchTerm) {
        queryParams.append('Name', searchTerm);
      } else if (searchType === "Subject" && searchTerm) {
        queryParams.append('Subject', searchTerm);
      } else if (searchType === "Sender" && searchTerm) {
        queryParams.append('Sender', searchTerm);
      } else if (searchType === "Receiver" && searchTerm) {
        queryParams.append('Receiver', searchTerm);
      }

      const response = await fetch(`${SummaryApi.findReclamation.url}?${queryParams.toString()}`, {
        method: SummaryApi.findReclamation.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const dataResponse = await response.json();
      console.log("Search results:", dataResponse);

      if (Array.isArray(dataResponse) && dataResponse.length > 0) {
        setFilteredReclamations(dataResponse); // Mettre à jour les réclamations filtrées
      } else {
        setFilteredReclamations([]); // Aucun résultat trouvé
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast.error("Erreur lors de la recherche.");
    }
  };


  // Automatically reset when searchTerm is empty
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredReclamations(allUser);
    } else {
      handleSearch(); // Lancer la recherche si un terme est saisi
    }
  }, [searchTerm, searchType]);

  // Handle delete reclamation
  const handleDelete = async (id) => {
    try {
      const response = await fetch(SummaryApi.deleteReclamation.url, {
        method: SummaryApi.deleteReclamation.method,
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ No_: id })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const dataResponse = await response.json();
      toast.success("Réclamation supprimée avec succès");
      console.log("Réclamation data:", dataResponse);

      // Rafraîchir la liste après la suppression
      fetchAllReclamation();
    } catch (error) {
      console.error("Erreur lors de la suppression de la réclamation:", error);
    }
  };

  // Handle sorting
  const handleSort = async (column) => {
    const newOrder = sortBy === column && order === "ASC" ? "DESC" : "ASC";
    setSortBy(column);
    setOrder(newOrder);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  // Filter reclamations based on selected status
  const filteredByStatus = filteredReclamations.filter((reclamation) => {
    if (selectedStatus === "Tous") return true;
    if (selectedStatus === "En cours") return reclamation.Status === 0;
    if (selectedStatus === "Traitée") return reclamation.Status === 1;
    if (selectedStatus === "Résolue") return reclamation.Status === 2;
    return true;
  });

 
  const handleDownloadPDF = async () => {
    try {
      const pdfContainer = document.createElement("div");
      Object.assign(pdfContainer.style, {
        position: "absolute",
        left: "-9999px",
        width: "900px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#ffffff",
        padding: "20px"
      });
      document.body.appendChild(pdfContainer);

      // Helper function to safely format dates
      const formatDate = (dateInput) => {
        if (!dateInput) return "-";
        try {
          // Try ISO format first
          if (dateInput.includes('T')) {
            return new Date(dateInput).toLocaleDateString('fr-FR');
          }
          // Try adding time component if missing
          if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return new Date(dateInput + 'T00:00:00').toLocaleDateString('fr-FR');
          }
          // Fallback to original if can't parse
          return dateInput;
        } catch (e) {
          return dateInput;
        }
      };

      // Add title
      const title = document.createElement("h1");
      title.textContent = "LISTE DES RÉCLAMATIONS";
      Object.assign(title.style, {
        textAlign: "center",
        fontSize: "24px",
        margin: "10px 0 20px 0",
        fontWeight: "bold",
        color: "#2c3e50",
        borderBottom: "2px solid #e67e22",
        paddingBottom: "10px"
      });
      pdfContainer.appendChild(title);

      // Add generation info
      const subtitle = document.createElement("div");
      subtitle.textContent = `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
      Object.assign(subtitle.style, {
        textAlign: "center",
        fontSize: "14px",
        marginBottom: "20px",
        color: "#7f8c8d"
      });
      pdfContainer.appendChild(subtitle);

      // Create table
      const table = document.createElement("table");
      Object.assign(table.style, {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "20px",
        fontSize: "12px"
      });

      // Table headers
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      
      const headers = [
        { text: "DATE D'ENVOI", width: "20%" },
        { text: "SUJET", width: "30%" },
        { text: "CIBLE", width: "20%" },
        { text: "STATUT", width: "20%" }
      ];
      
      headers.forEach(header => {
        const th = document.createElement("th");
        Object.assign(th.style, {
          width: header.width,
          backgroundColor: "#2c3e50",
          color: "white",
          fontWeight: "bold",
          fontSize: "14px",
          padding: "8px",
          textAlign: "center",
          border: "1px solid #ddd"
        });
        th.textContent = header.text;
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Table body
      const tbody = document.createElement("tbody");
      
      filteredByStatus.forEach((reclamation, index) => {
        const row = document.createElement("tr");
        Object.assign(row.style, {
          backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa"
        });

        // Date cell with safe formatting
        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(reclamation.CreatedAt);
        Object.assign(dateCell.style, {
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "center",
          verticalAlign: "top"
        });
        
        // Subject cell
        const subjectCell = document.createElement("td");
        subjectCell.textContent = reclamation.Subject || "-";
        Object.assign(subjectCell.style, {
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "left",
          verticalAlign: "top",
          wordBreak: "break-word"
        });
        
        // Target cell
        const targetCell = document.createElement("td");
        targetCell.textContent = reclamation.Name || "-";
        Object.assign(targetCell.style, {
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "center",
          verticalAlign: "top"
        });
        
        // Status cell with color coding
        const statusCell = document.createElement("td");
        let statusText = "";
        let statusColor = "";
        
        switch(reclamation.Status) {
          case 0:
            statusText = "En cours";
            statusColor = "#000000";
            break;
          case 1:
            statusText = "Traitée";
            statusColor = "#e67e22";
            break;
          case 2:
            statusText = "Résolue";
            statusColor = "#2ecc71";
            break;
          default:
            statusText = "-";
        }
        
        statusCell.textContent = statusText;
        Object.assign(statusCell.style, {
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "center",
          verticalAlign: "top",
          fontWeight: "bold",
          color: statusColor
        });
        
        row.appendChild(dateCell);
        row.appendChild(subjectCell);
        row.appendChild(targetCell);
        row.appendChild(statusCell);
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      pdfContainer.appendChild(table);

      // Total count
      const countDiv = document.createElement("div");
      countDiv.textContent = `Total: ${filteredByStatus.length} réclamations`;
      Object.assign(countDiv.style, {
        textAlign: "right",
        fontSize: "12px",
        margin: "10px 0",
        color: "#7f8c8d"
      });
      pdfContainer.appendChild(countDiv);

      // Generate PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Pagination
      const pageHeight = pdf.internal.pageSize.getHeight() - 20;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Page numbers
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          `Page ${i}/${totalPages}`,
          pdf.internal.pageSize.getWidth() - 30,
          pdf.internal.pageSize.getHeight() - 10
        );
      }

      pdf.save(`reclamations-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF généré avec succès !");
    } catch (error) {
      console.error("Erreur de génération PDF :", error);
      toast.error("Échec de la génération du PDF");
    }
  };
  // Pagination logic
  const indexOfLastRec = currentPage * reclamationsusersPerPage;
  const indexOfFirstRec = indexOfLastRec - reclamationsusersPerPage;
  const currentReclamations = filteredByStatus.slice(indexOfFirstRec, indexOfLastRec);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredByStatus.length / reclamationsusersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
        <div className={`animate-fade-down animate-once animate-duration-[2000ms] animate-ease-in-out animate-fill-forwards relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded ${color === "light" ? "bg-white" : "bg-lightBlue-900 text-white"}`}>
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <ToastContainer position="top-center" />
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3
                className={`font-semibold text-lg ${color === "light" ? "text-blueGray-700" : "text-white"
                  }`}
              >
                Liste des Réclamations
              </h3>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => handleStatusFilter("Tous")}
            className={`px-4 py-2 rounded-lg ${selectedStatus === "Tous" ? "bg-orange-dys text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Tous
          </button>
          <button
            onClick={() => handleStatusFilter("En cours")}
            className={`px-4 py-2 rounded-lg ${selectedStatus === "En cours" ? "bg-orange-dys text-white" : "bg-gray-200 text-gray-700"}`}
          >
            En cours
          </button>
          <button
            onClick={() => handleStatusFilter("Traitée")}
            className={`px-4 py-2 rounded-lg ${selectedStatus === "Traitée" ? "bg-orange-dys text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Traitée
          </button>
          <button
            onClick={() => handleStatusFilter("Résolue")}
            className={`px-4 py-2 rounded-lg ${selectedStatus === "Résolue" ? "bg-orange-dys text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Résolue
          </button>
        </div>

        {/* Search Container */}
        <div className="w-full mx-auto items-center flex justify-between mb-4 md:flex-nowrap flex-wrap md:px-10 px-4">
        <div className="flex items-center rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
            {/* Search Type Selector (Dropdown) */}
            <div className="shrink-0 relative">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="border-0 mr-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
              >
                <option value="Name">Nom de Cible</option>
                <option value="Subject">Sujet</option>
                <option value="Sender">Envoyeur</option>
                <option value="Receiver">Récepteur</option>
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

            {/* Search Input */}
            <form className="ml-2 mt-2 mb-2 flex flex-row flex-wrap items-center lg:ml-0">
              <div className="flex-1 relative">
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
                </div>
              </div>
            </form>
          </div>
          {/* PDF Download Button */}
    <div className="ml-4">
      <button
        onClick={handleDownloadPDF}
        className="bg-orange-dys text-white active:bg-orange-dys font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
      >
        <i className="fas fa-download mr-2"></i> Télécharger la liste
      </button>
    </div>
        </div>

        {/* Reclamations Table */}
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse" id="rec-table">
            <thead>
              <tr>
                <th >
                  <button   className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${
                    color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                  }`} onClick={() => handleSort("CreatedAt")}>
                    Date d'Envoi {sortBy === "CreatedAt" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th >
                  <button   className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${
                    color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                  }`} onClick={() => handleSort("Subject")}>
                    Sujet de Réclamation {sortBy === "Subject" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th >
                  <button   className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${
                    color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                  }`} onClick={() => handleSort("Name")}>
                    Cible {sortBy === "Name" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${
                    color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                  }`} >
                  Statut
                </th>
                <th className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left hide-for-pdf ${
                    color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                  }`}  >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentReclamations.length > 0 ? (
                currentReclamations.map((reclamation, index) => (
                  <tr key={index} className="border-t">
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {new Date(reclamation.CreatedAt).toLocaleString('fr-FR', {
  timeZone: 'UTC', // important !
  dateStyle: 'full',
  timeStyle: 'medium'
})
}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {reclamation.Subject}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {reclamation.Name}
                    </td>
                    <td className="font-bold border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <span
                        className={
                          reclamation.Status === 1
                            ? "text-orange-dys"
                            : reclamation.Status === 2
                              ? "text-green-500"
                              : ""
                        }
                      >
                        {reclamation.Status === 0
                          ? "En cours"
                          : reclamation.Status === 1
                            ? "Traitée"
                            : "Résolue"}
                      </span>
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4 hide-for-pdf">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(reclamation.No_)}
                          className="bg-blueGray-dys-2 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                        <a href={`/admin/details-réclamation/${reclamation.No_}`}>
                          <button
                            className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                            type="button"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Aucune réclamation trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="py-2 flex justify-center">
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
              {pageNumbers.map((number) => (
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
        </div>
      </div>
    </>
  );
}

CardTableRec.defaultProps = {
  color: "light",
};

CardTableRec.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
};