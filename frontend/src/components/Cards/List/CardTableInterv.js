import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SummaryApi from "api/common";

import { toast, ToastContainer } from "react-toastify";
import ChangeInterv from "../Modify/ChangeInterv";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
export default function CardTableInterv({ color }) {
  const [allInterv, setAllInterv] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [intervPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("bénéficiaire");
  const [filteredInterv, setFilteredInterv] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedInterv, setSelectedInterv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("DatePrevuInterv"); // Default sort by date
  const [order, setOrder] = useState("ASC"); // Default order

  // Fetch all interventions on component mount or when sort changes
  useEffect(() => {
    fetchAllInterventions();
  }, [sortBy, order]);

  // Fetch all interventions from the API
  const fetchAllInterventions = async () => {
    try {
      const response = await fetch(
        `${SummaryApi.sortIntervention.url}?sortBy=${sortBy}&order=${order}`,
        {
          method: SummaryApi.sortIntervention.method,
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const dataResponse = await response.json();
      setAllInterv(dataResponse.data);
      setFilteredInterv(dataResponse.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des interventions:", error);
      setError("Erreur lors de la récupération des interventions.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchType === "bénéficiaire" && searchTerm) {
        queryParams.append("beneficiaire", searchTerm);
      } else if (searchType === "sujet" && searchTerm) {
        queryParams.append("sujet", searchTerm);
      } else if (searchType === "technicienResponsable" && searchTerm) {
        queryParams.append("technicienResponsable", searchTerm);
      } else if (searchType === "date" && searchTerm) {
        const formattedDate = new Date(searchTerm).toISOString().split("T")[0];
        queryParams.append("date", formattedDate);
      }

      const url = `${SummaryApi.findIntervention.url}?${queryParams.toString()}`;
      console.log("URL de la recherche:", url); // Debugging

      const response = await fetch(url, {
        method: SummaryApi.findIntervention.method,
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const dataResponse = await response.json();
      setFilteredInterv(dataResponse);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error.message);
      toast.error(`Erreur lors de la recherche : ${error.message}`);
    }
  };

  // Trigger search when searchTerm or searchType changes
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredInterv(allInterv);
    } else {
      handleSearch();
    }
  }, [searchTerm, searchType]);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${SummaryApi.deleteInterv.url}/${id}`, {
        method: SummaryApi.deleteInterv.method,
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      toast.success("Intervention supprimée avec succès");
      fetchAllInterventions(); // Refresh the list
    } catch (error) {
      console.error("Erreur lors de la suppression de l'intervention:", error);
      toast.error("Erreur lors de la suppression de l'intervention.");
    }
  };

  // Handle edit
  const handleEdit = (intervention) => {
    setSelectedInterv(intervention);
    setShowModal(true);
  };

  // Handle sorting
  const handleSort = (column) => {
    const newOrder = sortBy === column && order === "ASC" ? "DESC" : "ASC";
    setSortBy(column);
    setOrder(newOrder);
  };
  const handleDownloadPDF = async () => {
    try {
      // 1. Créer un conteneur principal pour le PDF
      const pdfContainer = document.createElement("div");
      pdfContainer.style.position = "absolute";
      pdfContainer.style.left = "-9999px";
      pdfContainer.style.width = "900px";
      pdfContainer.style.fontFamily = "Arial, sans-serif";
      document.body.appendChild(pdfContainer);

      // 2. Ajouter le titre principal
      const title = document.createElement("h1");
      title.textContent = "LISTE DES INTERVENTIONS";
      title.style.textAlign = "center";
      title.style.fontSize = "24px";
      title.style.margin = "10px 0 20px 0";
      title.style.fontWeight = "bold";
      title.style.color = "#2c3e50";
      title.style.borderBottom = "2px solid #e67e22";
      title.style.paddingBottom = "10px";
      pdfContainer.appendChild(title);

      // 3. Informations de génération
      const subtitle = document.createElement("div");
      subtitle.textContent = `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
      subtitle.style.textAlign = "center";
      subtitle.style.fontSize = "14px";
      subtitle.style.marginBottom = "20px";
      subtitle.style.color = "#7f8c8d";
      pdfContainer.appendChild(subtitle);

      // 4. Création du tableau
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.marginBottom = "20px";
      table.style.fontSize = "12px";

      // 5. En-têtes du tableau
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");

      const headers = [
        { text: "DATE", width: "15%", align: "center" },
        { text: "BÉNÉFICIAIRE", width: "20%", align: "center" },
        { text: "SUJET", width: "30%", align: "left" },
        { text: "TECHNICIEN", width: "20%", align: "center" },
      ];

      headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header.text;
        th.style.width = header.width;
        th.style.backgroundColor = "#2c3e50";
        th.style.color = "white";
        th.style.fontWeight = "bold";
        th.style.fontSize = "14px";
        th.style.padding = "8px";
        th.style.textAlign = header.align;
        th.style.border = "1px solid #ddd";
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // 6. Corps du tableau avec toutes les interventions
      const tbody = document.createElement("tbody");

      filteredInterv.forEach((intervention, index) => {
        const row = document.createElement("tr");

        // Cellule Date
        const dateCell = document.createElement("td");
        dateCell.textContent = new Date(intervention.DatePrevuInterv).toLocaleDateString('fr-FR');
        dateCell.style.padding = "6px 8px";
        dateCell.style.border = "1px solid #ddd";
        dateCell.style.textAlign = "center";
        dateCell.style.verticalAlign = "top";

        // Cellule Bénéficiaire
        const beneficiaryCell = document.createElement("td");
        beneficiaryCell.textContent = intervention.Beneficiaire || "N/A";
        beneficiaryCell.style.padding = "6px 8px";
        beneficiaryCell.style.border = "1px solid #ddd";
        beneficiaryCell.style.textAlign = "center";
        beneficiaryCell.style.verticalAlign = "top";

        // Cellule Sujet
        const subjectCell = document.createElement("td");
        subjectCell.textContent = intervention.SujetReclamation || "N/A";
        subjectCell.style.padding = "6px 8px";
        subjectCell.style.border = "1px solid #ddd";
        subjectCell.style.textAlign = "left";
        subjectCell.style.verticalAlign = "top";
        subjectCell.style.wordBreak = "break-word";
        subjectCell.style.maxWidth = "350px";

        // Cellule Technicien
        const technicianCell = document.createElement("td");
        technicianCell.textContent = intervention.TechnicienResponsable || "N/A";
        technicianCell.style.padding = "6px 8px";
        technicianCell.style.border = "1px solid #ddd";
        technicianCell.style.textAlign = "center";
        technicianCell.style.verticalAlign = "top";




        // Alternance des couleurs de ligne
        row.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";

        row.appendChild(dateCell);
        row.appendChild(beneficiaryCell);
        row.appendChild(subjectCell);
        row.appendChild(technicianCell);
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      pdfContainer.appendChild(table);

      // 7. Compteur total
      const countDiv = document.createElement("div");
      countDiv.textContent = `Total: ${filteredInterv.length} interventions`;
      countDiv.style.textAlign = "right";
      countDiv.style.fontSize = "12px";
      countDiv.style.margin = "10px 0";
      countDiv.style.color = "#7f8c8d";
      pdfContainer.appendChild(countDiv);

      // 8. Génération du PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Options html2canvas
      const canvas = await html2canvas(pdfContainer, {
        scale: 1.8,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        letterRendering: true
      });

      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Gestion de la pagination
      const pageHeight = pdf.internal.pageSize.getHeight() - 20;
      let heightLeft = imgHeight;
      let position = 10;
      let pageNumber = 1;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        pageNumber++;
      }

      // Numérotation des pages
      for (let i = 1; i <= pdf.internal.getNumberOfPages(); i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          `Page ${i}/${pdf.internal.getNumberOfPages()}`,
          pdf.internal.pageSize.getWidth() - 30,
          pdf.internal.pageSize.getHeight() - 10
        );
      }

      pdf.save(`interventions-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF généré avec succès !");
    } catch (error) {
      console.error("Erreur de génération PDF :", error);
      toast.error("Échec de la génération du PDF");
    }
  };
  // Pagination logic
  const indexOfLastRec = currentPage * intervPerPage;
  const indexOfFirstRec = indexOfLastRec - intervPerPage;
  const CurrentIntervs = filteredInterv.slice(indexOfFirstRec, indexOfLastRec);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredInterv.length / intervPerPage); i++) {
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
                Liste des Interventions
              </h3>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full mx-auto items-center flex justify-between mb-4 md:flex-nowrap flex-wrap md:px-10 px-4">
          <div className="flex items-center rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="border-0 mr-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
            >
              <option value="bénéficiaire">Bénéficiaire</option>
              <option value="sujet">Sujet de réclamation</option>
              <option value="date">Date prévue</option>
              <option value="technicienResponsable">Technicien Responsable</option>
            </select>
            <div className="relative flex w-full flex-wrap items-stretch mb-2">
              {searchType !== "date" && (
                <span className="mt-1 z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
                  <i className="fas fa-search text-blueGray-400"></i>
                </span>
              )}
              <input
                type={searchType === "date" ? "date" : "text"}
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 px-3 py-2 mt-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
              />
            </div>
          </div>
          {/* PDF Download Button */}
          <div className="ml-4">
            <a href={`/admin/remb-calendrier`}>

              <button
                className="bg-lightBlue-500 text-white active:bg-orange-dys font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              >
                <i className="fas fa-calendar mr-2"></i> Calendrier
              </button>
            </a>
            <button
              onClick={handleDownloadPDF}
              className="bg-orange-dys text-white active:bg-orange-dys font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            >
              <i className="fas fa-download"></i>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse" id="table-intervention">
            <thead>
              <tr>
                <th>
                  <button className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                    }`} onClick={() => handleSort("DatePrevuInterv")}>
                    Date {sortBy === "DatePrevuInterv" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th>
                  <button className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                    }`} onClick={() => handleSort("Beneficiaire")}>
                    Bénéficiaire {sortBy === "Beneficiaire" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th>
                  <button className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                    }`} onClick={() => handleSort("SujetReclamation")}>
                    Sujet de Réclamation {sortBy === "SujetReclamation" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th>
                  <button className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                    }`} onClick={() => handleSort("TechnicienResponsable")}>
                    Technicien Responsable {sortBy === "TechnicienResponsable" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left hide-for-pdf ${color === "light"
                    ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                    : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                  }`} >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Chargement en cours...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : CurrentIntervs.length > 0 ? (
                CurrentIntervs.map((intervention, index) => (
                  <tr key={index} className="border-t">
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {new Date(intervention.DatePrevuInterv).toLocaleDateString()}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {intervention.Beneficiaire || "N/A"}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {intervention.SujetReclamation || "N/A"}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {intervention.TechnicienResponsable || "N/A"}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4 hide-for-pdf">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleEdit(intervention)}
                          className="bg-orange-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(intervention.No_)}
                          className="bg-blueGray-dys-2 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                        >
                          <i className="fas fa-trash"></i>
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Aucune intervention trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {showModal && selectedInterv && (
            <ChangeInterv
              onClose={() => setShowModal(false)}
              interventionId={selectedInterv.No_}
              datePrevuInterv={selectedInterv.DatePrevuInterv}
              technicienResponsable={selectedInterv.TechnicienResponsable}
              callFunc={fetchAllInterventions}
            />
          )}
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
                    className={`first:ml-0 text-xs font-semibold ml-1 flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative ${currentPage === number
                        ? "bg-orange-dys text-white"
                        : "bg-white text-orange-dys"
                      } border border-solid border-orange-dys`}
                  >
                    {number}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#pablo"
                  onClick={() =>
                    setCurrentPage(
                      currentPage < pageNumbers.length
                        ? currentPage + 1
                        : pageNumbers.length
                    )
                  }
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

CardTableInterv.defaultProps = { color: "light" };
CardTableInterv.propTypes = { color: PropTypes.oneOf(["light", "dark"]) };