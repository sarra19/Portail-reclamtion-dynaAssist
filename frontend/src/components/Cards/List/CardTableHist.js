import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SummaryApi from "api/common";

import { toast, ToastContainer } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
export default function CardTableHist({ color }) {
  const [allHistory, setAllHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [users, setUsers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hisPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("actionneur");
  const [sortBy, setSortBy] = useState("ActivityDate"); // Default sort by date
  const [order, setOrder] = useState("ASC"); // Default order

  // Fetch all history data with sorting
  const fetchAllHistory = async () => {
    try {
      const response = await fetch(
        `${SummaryApi.sortHistory.url}?sortBy=${sortBy}&order=${order}`,
        {
          method: SummaryApi.sortHistory.method,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const dataResponse = await response.json();
      console.log("History data:", dataResponse);

      if (Array.isArray(dataResponse.data) && dataResponse.data.length > 0) {
        setAllHistory(dataResponse.data);
        setFilteredHistory(dataResponse.data);
        dataResponse.data.forEach((history) => {
          fetchUserData(history.UserId);
        });
      } else {
        console.error("Aucune donnée de History disponible dans la réponse de l'API.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des Historys:", error);
    }
  };

  // Fetch user data for each history entry
  const fetchUserData = async (userId) => {
    try {
      const url = `${SummaryApi.getUser.url}/${userId}`;
      const response = await fetch(url, {
        method: SummaryApi.getUser.method,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setUsers((prevUsers) => ({
          ...prevUsers,
          [userId]: result.data,
        }));
      } else {
        console.log(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to fetch user data");
    }
  };

  // Handle delete history
  const handleDelete = async (id) => {
    try {
      const response = await fetch(SummaryApi.deleteHistorique.url, {
        method: SummaryApi.deleteHistorique.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          No_: id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const dataResponse = await response.json();
      toast.success("Historique supprimée avec succès");
      console.log("Historique data:", dataResponse);

      fetchAllHistory(); // Refresh the list
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    }
  };

   const handleDeleteAll = async (id) => {
    try {
      const response = await fetch(SummaryApi.deleteAllHistorique.url, {
        method: SummaryApi.deleteAllHistorique.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
       
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const dataResponse = await response.json();
      toast.success("Historiques supprimées avec succès");
      console.log("Historique data:", dataResponse);

      fetchAllHistory(); // Refresh the list
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    }
  };
  // Handle search
  const handleSearch = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchType === "actionneur" && searchTerm) {
        const [firstName, lastName] = searchTerm.split(" ");
        queryParams.append("FirstName", firstName);
        if (lastName) {
          queryParams.append("LastName", lastName);
        }
      } else if (searchType === "activité" && searchTerm) {
        queryParams.append("Activity", searchTerm);
      } else if (searchType === "date" && searchTerm) {
        const formattedDate = new Date(searchTerm).toISOString().split("T")[0];
        queryParams.append("ActivityDate", formattedDate);
      }

      const url = `${SummaryApi.findHistory.url}?${queryParams.toString()}`;
      console.log("URL de la recherche:", url);

      const response = await fetch(url, {
        method: SummaryApi.findHistory.method,
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const dataResponse = await response.json();
      setFilteredHistory(dataResponse);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error.message);
      toast.error(`Erreur lors de la recherche : ${error.message}`);
    }
  };

  // Handle sorting
  const handleSort = (column) => {
    const newOrder = sortBy === column && order === "ASC" ? "DESC" : "ASC";
    setSortBy(column);
    setOrder(newOrder);
  };

  // Trigger search when searchTerm or searchType changes
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredHistory(allHistory);
    } else {
      handleSearch();
    }
  }, [searchTerm, searchType]);

  // Fetch data on component mount or when sorting changes
  useEffect(() => {
    fetchAllHistory();
  }, [sortBy, order]);

  const handleDownloadPDF = async () => {
    try {
      // 1. Créer un conteneur principal pour le PDF
      const pdfContainer = document.createElement("div");
      pdfContainer.style.position = "absolute";
      pdfContainer.style.left = "-9999px";
      pdfContainer.style.width = "900px"; // Largeur réduite pour A4
      pdfContainer.style.fontFamily = "Arial, sans-serif";
      document.body.appendChild(pdfContainer);

      // 2. Ajouter le titre principal
      const title = document.createElement("h1");
      title.textContent = "HISTORIQUE DES ACTIVITÉS";
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
        { text: "DATE ET HEURE", width: "20%" },
        { text: "ACTIONNEUR", width: "20%" },
        { text: "ACTIVITÉ", width: "60%" }
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

      // 6. Corps du tableau avec tous les historiques
      const tbody = document.createElement("tbody");

      filteredHistory.forEach((history, index) => {
        const row = document.createElement("tr");

        // Cellule Date
        const dateCell = document.createElement("td");
        dateCell.textContent = new Date(history.ActivityDate).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        dateCell.style.padding = "6px 8px";
        dateCell.style.border = "1px solid #ddd";
        dateCell.style.textAlign = "center";
        dateCell.style.verticalAlign = "top";

        // Cellule Actionneur
        const userCell = document.createElement("td");
        const user = users[history.UserId];
        userCell.textContent = user ? `${user.FirstName} ${user.LastName}` : "Inconnu";
        userCell.style.padding = "6px 8px";
        userCell.style.border = "1px solid #ddd";
        userCell.style.textAlign = "center";
        userCell.style.verticalAlign = "top";

        // Cellule Activité avec gestion du texte long
        const activityCell = document.createElement("td");
        activityCell.textContent = history.Activity;
        activityCell.style.padding = "6px 8px";
        activityCell.style.border = "1px solid #ddd";
        activityCell.style.textAlign = "left";
        activityCell.style.verticalAlign = "top";
        activityCell.style.wordBreak = "break-word"; // Permet le retour à la ligne
        activityCell.style.maxWidth = "400px"; // Limite la largeur

        // Alternance des couleurs
        row.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";

        row.appendChild(dateCell);
        row.appendChild(userCell);
        row.appendChild(activityCell);
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      pdfContainer.appendChild(table);

      // 7. Compteur total
      const countDiv = document.createElement("div");
      countDiv.textContent = `Total: ${filteredHistory.length} activités enregistrées`;
      countDiv.style.textAlign = "right";
      countDiv.style.fontSize = "12px";
      countDiv.style.margin = "10px 0";
      countDiv.style.color = "#7f8c8d";
      pdfContainer.appendChild(countDiv);

      // 5. Génération du PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Options html2canvas avec échelle réduite
      const canvas = await html2canvas(pdfContainer, {
        scale: 1.5, // Échelle réduite pour mieux gérer la taille
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190; // Largeur de l'image en mm (A4 - marges)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Calculer combien de pages nous aurons besoin
      const pageHeight = pdf.internal.pageSize.getHeight() - 20; // Hauteur utile avec marges
      let heightLeft = imgHeight;
      let position = 10; // Position Y initiale
      let pageNumber = 1;

      // Ajouter la première page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Ajouter des pages supplémentaires seulement si nécessaire
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight; // Ajuster la position
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        pageNumber++;
      }

      // Ajouter les numéros de page
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

      pdf.save(`historique-complet-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF généré avec succès!");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };
  // Pagination logic
  const indexOfLastUser = currentPage * hisPerPage;
  const indexOfFirstUser = indexOfLastUser - hisPerPage;
  const CurrentHistory = filteredHistory.slice(indexOfFirstUser, indexOfLastUser);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredHistory.length / hisPerPage); i++) {
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
                className={
                  "font-semibold text-lg " +
                  (color === "light" ? "text-blueGray-700" : "text-white")
                }
              >
                Liste des historiques
              </h3>
            </div>
          </div>
          <div className="w-full mx-auto items-center flex justify-between mb-4 md:flex-nowrap flex-wrap md:px-10 px-4">
            <div className="flex items-center rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="border-0 mr-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
              >
                <option value="actionneur">Actionneur</option>
                <option value="activité">Activité</option>
                <option value="date">Date</option>
              </select>
              <div className="relative flex w-full flex-wrap items-stretch mb-2">
                {searchType !== "date" && (
                  <span className="mt-1 z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
                    <i className="fas fa-search text-blueGray-400"></i>
                  </span>
                )}
                <input
                  type={searchType === "date" ? "date" : "text"}
                  placeholder={"Rechercher..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 px-3 py-2 mt-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
                />
              </div>
            </div>
            {/* PDF Download Button */}
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleDownloadPDF}
                className="bg-orange-dys text-white active:bg-orange-dys font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
              >
                <i className="fas fa-download mr-2"></i> Télécharger la liste
              </button>

              <button
                onClick={handleDeleteAll}
                className="ml-1 bg-red-500 text-white active:bg-red-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
              >
                <i className="fas fa-trash mr-2"></i> Supprimer tous
              </button>
            </div>


          </div>

        </div>
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse" id="table-history">
            <thead>
              <tr>
                <th

                >
                  <button className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                    }`} onClick={() => handleSort("ActivityDate")}>
                    Date {sortBy === "ActivityDate" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th>
                  <button className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                    }`} onClick={() => handleSort("FirstName")}>
                    Actionneur {sortBy === "FirstName" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th>
                  <button className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                    }`} onClick={() => handleSort("Activity")}>
                    Activité {sortBy === "Activity" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th
                  className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left hide-for-pdf ${color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                    }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {CurrentHistory.length > 0 ? (
                CurrentHistory.map((history, index) => (
                  <tr key={index} className="border-t">
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {new Date(history.ActivityDate).toUTCString()
}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {users[history.UserId]
                        ? `${users[history.UserId].FirstName} ${users[history.UserId].LastName}`
                        : "Loading..."}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {history.Activity}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4 hide-for-pdf ">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(history.No_)}
                          className="bg-blueGray-dys-2 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                          <a href={`/admin/details-users/${history.UserId}`}>
                          <button className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">
                            <i className="fas fa-user"></i>
                          </button>
                        </a>
                      </div>
                     
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Aucune history trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {/* Pagination */}
        <div className="py-2 flex justify-center">
          <nav className="block">
            <ul className="flex pl-0 rounded list-none flex-wrap items-center">
              {/* Bouton "Précédent" */}
              <li>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-orange-dys ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "bg-white text-orange-dys cursor-pointer"
                    }`}
                >
                  <i className="fas fa-chevron-left -ml-px"></i>
                </button>
              </li>

              {/* Affichage des pages */}
              {pageNumbers.length > 5 ? (
                <>
                  {/* Première page */}
                  <li>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className={`text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-orange-dys ${currentPage === 1 ? "bg-orange-dys text-white" : "bg-white text-orange-dys"
                        }`}
                    >
                      1
                    </button>
                  </li>

                  {/* Points de suspension avant */}
                  {currentPage > 3 && (
                    <li className="text-xs font-semibold flex items-center justify-center mx-1">...</li>
                  )}

                  {/* Page précédente si nécessaire */}
                  {currentPage > 2 && currentPage < pageNumbers.length - 1 && (
                    <li>
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-orange-dys bg-white text-orange-dys"
                      >
                        {currentPage - 1}
                      </button>
                    </li>
                  )}

                  {/* Page actuelle si dans la plage centrale */}
                  {currentPage > 1 && currentPage < pageNumbers.length && (
                    <li>
                      <button
                        className="text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative bg-orange-dys text-white border border-solid border-orange-dys"
                      >
                        {currentPage}
                      </button>
                    </li>
                  )}

                  {/* Page suivante si nécessaire */}
                  {currentPage < pageNumbers.length - 1 && currentPage > 2 && (
                    <li>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-orange-dys bg-white text-orange-dys"
                      >
                        {currentPage + 1}
                      </button>
                    </li>
                  )}

                  {/* Points de suspension après */}
                  {currentPage < pageNumbers.length - 2 && (
                    <li className="text-xs font-semibold flex items-center justify-center mx-1">...</li>
                  )}

                  {/* Dernière page */}
                  <li>
                    <button
                      onClick={() => setCurrentPage(pageNumbers.length)}
                      className={`text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-orange-dys ${currentPage === pageNumbers.length ? "bg-orange-dys text-white" : "bg-white text-orange-dys"
                        }`}
                    >
                      {pageNumbers.length}
                    </button>
                  </li>
                </>
              ) : (
                // Affichage simple si moins de 5 pages
                pageNumbers.map((number) => (
                  <li key={number}>
                    <button
                      onClick={() => setCurrentPage(number)}
                      className={`text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-orange-dys ${currentPage === number ? "bg-orange-dys text-white" : "bg-white text-orange-dys"
                        }`}
                    >
                      {number}
                    </button>
                  </li>
                ))
              )}

              {/* Bouton "Suivant" */}
              <li>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageNumbers.length))}
                  disabled={currentPage === pageNumbers.length}
                  className={`text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-orange-dys ${currentPage === pageNumbers.length ? "opacity-50 cursor-not-allowed" : "bg-white text-orange-dys cursor-pointer"
                    }`}
                >
                  <i className="fas fa-chevron-right -ml-px"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

CardTableHist.defaultProps = {
  color: "light",
};

CardTableHist.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
};