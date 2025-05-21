import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SummaryApi from "api/common";

import { toast, ToastContainer } from "react-toastify";
import ChangeRemb from "../Modify/ChangeRemb";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
export default function CardTableRemb({ color }) {
  const [allRemb, setAllRemb] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rembPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("bénéficiaire");
  const [filteredRembs, setFilteredRembs] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRemb, setSelectedRemb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("DatePrevu"); // Default sort by date
  const [order, setOrder] = useState("ASC"); // Default order

  // Fetch all remboursements on component mount or when sort changes
  useEffect(() => {
    fetchAllRemboursements();
  }, [sortBy, order]);

  // Fetch all remboursements from the API
  const fetchAllRemboursements = async () => {
    try {
      const response = await fetch(
        `${SummaryApi.sortRemboursements.url}?sortBy=${sortBy}&order=${order}`,
        {
          method: SummaryApi.sortRemboursements.method,
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const dataResponse = await response.json();
      setAllRemb(dataResponse.data);
      setFilteredRembs(dataResponse.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des remboursements:", error);
      setError("Erreur lors de la récupération des remboursements.");
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
      } else if (searchType === "date" && searchTerm) {
        const formattedDate = new Date(searchTerm).toISOString().split("T")[0];
        queryParams.append("date", formattedDate);
      }

      const response = await fetch(
        `${SummaryApi.findRemboursements.url}?${queryParams.toString()}`,
        {
          method: SummaryApi.findRemboursements.method,
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const dataResponse = await response.json();
      setFilteredRembs(dataResponse);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error.message);
      toast.error(`Erreur lors de la recherche : ${error.message}`);
    }
  };

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredRembs(allRemb);
    } else {
      handleSearch();
    }
  }, [searchTerm, searchType]);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${SummaryApi.deleteRemboursement.url}/${id}`, {
        method: SummaryApi.deleteRemboursement.method,
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      toast.success("Remboursement supprimée avec succès");
      fetchAllRemboursements();
    } catch (error) {
      console.error("Erreur lors de la suppression.", error);
      toast.error("Erreur lors de la suppression.");
    }
  };

  // Handle edit
  const handleEdit = (remboursement) => {
    setSelectedRemb(remboursement);
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
      // 1. Create main PDF container
      const pdfContainer = document.createElement("div");
      pdfContainer.style.position = "absolute";
      pdfContainer.style.left = "-9999px";
      pdfContainer.style.width = "900px";
      pdfContainer.style.fontFamily = "Arial, sans-serif";
      document.body.appendChild(pdfContainer);

      // 2. Add main title
      const title = document.createElement("h1");
      title.textContent = "LISTE DES REMBOURSEMENTS";
      title.style.textAlign = "center";
      title.style.fontSize = "24px";
      title.style.margin = "10px 0 20px 0";
      title.style.fontWeight = "bold";
      title.style.color = "#2c3e50";
      title.style.borderBottom = "2px solid #e67e22";
      title.style.paddingBottom = "10px";
      pdfContainer.appendChild(title);

      // 3. Add generation info
      const subtitle = document.createElement("div");
      subtitle.textContent = `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
      subtitle.style.textAlign = "center";
      subtitle.style.fontSize = "14px";
      subtitle.style.marginBottom = "20px";
      subtitle.style.color = "#7f8c8d";
      pdfContainer.appendChild(subtitle);

      // 4. Create table structure
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.marginBottom = "20px";
      table.style.fontSize = "12px";

      // 5. Create table headers
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");

      const headers = [
        { text: "DATE PRÉVUE", width: "20%" },
        { text: "BÉNÉFICIAIRE", width: "20%" },
        { text: "SUJET DE RÉCLAMATION", width: "40%" },
        { text: "MONTANT", width: "20%" }
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
        th.style.textAlign = "center";
        th.style.border = "1px solid #ddd";
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // 6. Add table body with all remboursements
      const tbody = document.createElement("tbody");

      filteredRembs.forEach((remboursement, index) => {
        const row = document.createElement("tr");

        // Date cell
        const dateCell = document.createElement("td");
        dateCell.textContent = new Date(remboursement.DatePrevu).toLocaleDateString('fr-FR');
        dateCell.style.padding = "6px 8px";
        dateCell.style.border = "1px solid #ddd";
        dateCell.style.textAlign = "center";
        dateCell.style.verticalAlign = "top";

        // Beneficiary cell
        const beneficiaryCell = document.createElement("td");
        beneficiaryCell.textContent = remboursement.Beneficiaire || "N/A";
        beneficiaryCell.style.padding = "6px 8px";
        beneficiaryCell.style.border = "1px solid #ddd";
        beneficiaryCell.style.textAlign = "center";
        beneficiaryCell.style.verticalAlign = "top";

        // Subject cell
        const subjectCell = document.createElement("td");
        subjectCell.textContent = remboursement.SujetReclamation || "N/A";
        subjectCell.style.padding = "6px 8px";
        subjectCell.style.border = "1px solid #ddd";
        subjectCell.style.textAlign = "left";
        subjectCell.style.verticalAlign = "top";
        subjectCell.style.wordBreak = "break-word";
        subjectCell.style.maxWidth = "400px";

        // Amount cell
        const amountCell = document.createElement("td");
        amountCell.textContent = remboursement.Montant || "N/A";
        amountCell.style.padding = "6px 8px";
        amountCell.style.border = "1px solid #ddd";
        amountCell.style.textAlign = "center";
        amountCell.style.verticalAlign = "top";

        // Alternate row colors
        row.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";

        row.appendChild(dateCell);
        row.appendChild(beneficiaryCell);
        row.appendChild(subjectCell);
        row.appendChild(amountCell);
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      pdfContainer.appendChild(table);

      // 7. Add total count
      const countDiv = document.createElement("div");
      countDiv.textContent = `Total: ${filteredRembs.length} remboursements`;
      countDiv.style.textAlign = "right";
      countDiv.style.fontSize = "12px";
      countDiv.style.margin = "10px 0";
      countDiv.style.color = "#7f8c8d";
      pdfContainer.appendChild(countDiv);

      // 8. Generate PDF with portrait orientation
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // html2canvas options
      const canvas = await html2canvas(pdfContainer, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190; // Width in mm (A4 with margins)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Pagination calculation
      const pageHeight = pdf.internal.pageSize.getHeight() - 20;
      let heightLeft = imgHeight;
      let position = 10;
      let pageNumber = 1;

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        pageNumber++;
      }

      // Add page numbers
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          `Page ${i} sur ${totalPages}`,
          pdf.internal.pageSize.getWidth() - 30,
          pdf.internal.pageSize.getHeight() - 10
        );
      }

      pdf.save(`liste-remboursements-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF généré avec succès!");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };
  // Pagination logic
  const indexOfLastRec = currentPage * rembPerPage;
  const indexOfFirstRec = indexOfLastRec - rembPerPage;
  const CurrentRembs = filteredRembs.slice(indexOfFirstRec, indexOfLastRec);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredRembs.length / rembPerPage); i++) {
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
                Liste des Remboursements
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
          <table className="items-center w-full bg-transparent border-collapse" id="Remb-table">
            <thead>
              <tr>
                <th>
                  <button className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                    }`} onClick={() => handleSort("DatePrevu")}>
                    Date {sortBy === "DatePrevu" && (order === "ASC" ? "↑" : "↓")}
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
                    }`} onClick={() => handleSort("Montant")}>
                    Montant {sortBy === "Montant" && (order === "ASC" ? "↑" : "↓")}
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
              ) : CurrentRembs.length > 0 ? (
                CurrentRembs.map((remboursement, index) => (
                  <tr key={index} className="border-t">
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {new Date(remboursement.DatePrevu).toLocaleDateString()}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {remboursement.Beneficiaire || "N/A"}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {remboursement.SujetReclamation || "N/A"}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {remboursement.Montant}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4 hide-for-pdf ">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleEdit(remboursement)}
                          className="bg-orange-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(remboursement.No_)}
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
                    Aucun remboursement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {showModal && selectedRemb && (
            <ChangeRemb
              onClose={() => setShowModal(false)}
              RembId={selectedRemb.No_}
              datePrevu={selectedRemb.DatePrevu}
              Montant={selectedRemb.Montant}
              callFunc={fetchAllRemboursements}
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

CardTableRemb.defaultProps = { color: "light" };
CardTableRemb.propTypes = { color: PropTypes.oneOf(["light", "dark"]) };