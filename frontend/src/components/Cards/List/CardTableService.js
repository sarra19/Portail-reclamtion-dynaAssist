import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SummaryApi from "api/common";

import { toast, ToastContainer } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
export default function CardTableService({ color }) {
  const [allService, setAllService] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage] = useState(5);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("keywords"); // "keywords" or "Tags"
  const [sortBy, setSortBy] = useState("Name"); // Default sorting column
  const [order, setOrder] = useState("ASC"); // Default sorting order

  // Fetch all services
  const fetchAllService = async () => {
    try {
      const response = await fetch(SummaryApi.allService.url, {
        method: SummaryApi.allService.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const dataResponse = await response.json();
      console.log("Service data:", dataResponse);

      if (Array.isArray(dataResponse) && dataResponse.length > 0) {
        setAllService(dataResponse);
        setFilteredServices(dataResponse); // Initialize filtered services
      } else {
        console.error("Aucune donnée de Service disponible dans la réponse de l'API.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des Services:", error);
    }
  };

  // Handle sorting
  const handleSort = (column) => {
    const newOrder = sortBy === column && order === "ASC" ? "DESC" : "ASC";
    setSortBy(column);
    setOrder(newOrder);
  };

  // Sort services locally
  useEffect(() => {
    const sortedServices = [...filteredServices].sort((a, b) => {
      if (order === "ASC") {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });
    setFilteredServices(sortedServices);
  }, [sortBy, order, allService]);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await fetch(SummaryApi.deleteService.url, {
        method: SummaryApi.deleteService.method,
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          No_: id
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const dataResponse = await response.json();
      toast.success("Service supprimé avec succès");
      console.log("service data:", dataResponse);

      fetchAllService();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    }
  };

  // Handle search
  const handleSearch = async () => {
    try {
      const queryParams = new URLSearchParams();

      if (searchType === "keywords") {
        if (searchTerm) queryParams.append('Name', searchTerm);
      } else if (searchType === "Tags") {
        if (searchTerm) queryParams.append('Tags', searchTerm);
      }

      const response = await fetch(`${SummaryApi.searchServices.url}?${queryParams.toString()}`, {
        method: SummaryApi.searchServices.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const dataResponse = await response.json();
      console.log("Search results:", dataResponse);

      if (Array.isArray(dataResponse) && dataResponse.length > 0) {
        setFilteredServices(dataResponse);
      } else {
        setFilteredServices([]); // No results found
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de services:", error);
      toast.error("Erreur lors de la recherche de services.");
    }
  };

  // Handle reset
  const handleReset = () => {
    setSearchTerm("");
    setFilteredServices(allService);
    setCurrentPage(1);
  };

  // Automatically reset when searchTerm is empty
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredServices(allService);
    }
  }, [searchTerm, allService]);

  // Fetch all services on component mount
  useEffect(() => {
    fetchAllService();
  }, []);

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
       title.textContent = "LISTE DES SERVICES";
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
         { text: "IMAGE", width: "15%", align: "center" },
         { text: "NOM", width: "25%", align: "center" },
         { text: "TAGS", width: "25%", align: "center" },
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
   
       // 6. Corps du tableau avec tous les services
       const tbody = document.createElement("tbody");
       
       filteredServices.forEach((service, index) => {
         const row = document.createElement("tr");
         
         // Cellule Image
         const imageCell = document.createElement("td");
         imageCell.style.padding = "6px 8px";
         imageCell.style.border = "1px solid #ddd";
         imageCell.style.textAlign = "center";
         imageCell.style.verticalAlign = "middle";
         
         const imgWrapper = document.createElement("div");
         imgWrapper.style.display = "flex";
         imgWrapper.style.justifyContent = "center";
         
         const img = document.createElement("img");
         img.src = service.Image ;
         img.style.width = "50px";
         img.style.height = "50px";
         img.style.objectFit = "contain";
         img.style.border = "1px solid #ddd";
         imgWrapper.appendChild(img);
         imageCell.appendChild(imgWrapper);
         
         // Cellule Nom
         const nameCell = document.createElement("td");
         nameCell.textContent = service.Name || "-";
         nameCell.style.padding = "6px 8px";
         nameCell.style.border = "1px solid #ddd";
         nameCell.style.textAlign = "center";
         nameCell.style.verticalAlign = "top";
         nameCell.style.wordBreak = "break-word";
      
         
         // Cellule Fournisseur
         const tagsCell = document.createElement("td");
         tagsCell.textContent = service.Tags || "-";
         tagsCell.style.padding = "6px 8px";
         tagsCell.style.border = "1px solid #ddd";
         tagsCell.style.textAlign = "center";
         tagsCell.style.verticalAlign = "top";
         
         
         
         // Alternance des couleurs de ligne
         row.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";
         
         row.appendChild(imageCell);
         row.appendChild(nameCell);
         row.appendChild(tagsCell);
         tbody.appendChild(row);
       });
       
       table.appendChild(tbody);
       pdfContainer.appendChild(table);
   
       // 7. Compteur total
       const countDiv = document.createElement("div");
       countDiv.textContent = `Total: ${filteredServices.length} services`;
       countDiv.style.textAlign = "right";
       countDiv.style.fontSize = "12px";
       countDiv.style.margin = "10px 0";
       countDiv.style.color = "#7f8c8d";
       pdfContainer.appendChild(countDiv);
   
       // 8. Génération du PDF
       const pdf = new jsPDF({
         orientation: 'landscape',
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
       const imgWidth = 277; // Largeur A4 paysage avec marges
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
   
       pdf.save(`services-${new Date().toISOString().slice(0, 10)}.pdf`);
       toast.success("PDF généré avec succès !");
     } catch (error) {
       console.error("Erreur de génération PDF :", error);
       toast.error("Échec de la génération du PDF");
     }
   };
  // Pagination logic
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredServices.length / servicesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
        <div className={`animate-fade-down animate-once animate-duration-[2000ms] animate-ease-in-out animate-fill-forwards relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded ${color === "light" ? "bg-white" : "bg-lightBlue-900 text-white"}`}>
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <ToastContainer position='top-center' />
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3
                className={
                  "font-semibold text-lg " +
                  (color === "light" ? "text-blueGray-700" : "text-white")
                }
              >
                Liste des Services
              </h3>
            </div>
            <a href="/admin/add-service">
              <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                <button
                  className="bg-vert-dys text-white active:bg-vert-dys text-xs font-bold uppercase px-3 py-2 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </a>
          </div>
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

            {/* Search Input */}
            <form className="ml-2 mt-2 mb-2 flex flex-row flex-wrap items-center lg:ml-0">
              <div className="flex-1 relative">
                {searchType === "keywords" ? (
                  // Keyword search
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
                          handleReset();
                        } else {
                          handleSearch();
                        }
                      }}
                      className="border-0 px-3 py-2 mt-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
                    />
                  </div>
                ) : (
                  // Tags search
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
                          handleReset();
                        } else {
                          handleSearch();
                        }
                      }}
                      className="border-0 px-3 py-2 mt-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
                    />
                  </div>
                )}
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

        {/* Services Table */}
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse" id="service-table">
            <thead>
              <tr>
              <th
                  className={
                    "text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                    (color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700")
                  }
                >
                </th>
                <th>
                  <button   className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${
                    color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                  }`} onClick={() => handleSort("Name")}>
                    Nom {sortBy === "Name" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th>
                  <button   className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${
                    color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                  }`} onClick={() => handleSort("Tags")}>
                    Tags {sortBy === "Tags" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th className={`text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left hide-for-pdf ${
                    color === "light"
                      ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                      : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                  }`} >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentServices.length > 0 ? (
                currentServices.map((service, index) => (
                  <tr key={index} className="border-t">
                    <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                      <img
                        src={service.Image}
                        className=" h-12 w-12 bg-white rounded-full border"
                        alt="..."
                      />
                    </th>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {service.Name}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {service.Tags}
                    </td>
                    <td className="border-t-0 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4 hide-for-pdf">
                      <div className="flex justify-center ">
                        <a href={`/admin/modify-service/${service.No_}`}>
                          <button className="bg-orange-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">
                            <i className="fas fa-pen"></i>
                          </button>
                        </a>
                        <button
                          onClick={() => handleDelete(service.No_)}
                          className="bg-blueGray-dys-2 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                        <a href={`/admin/détails-service/${service.No_}`}>
                          <button className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">
                            <i className="fas fa-eye"></i>
                          </button>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    Aucun service trouvé.
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
              {pageNumbers.map(number => (
                <li key={number}>
                  <a
                    href="#pablo"
                    onClick={() => setCurrentPage(number)}
                    className={`first:ml-0 text-xs ml-1 font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative ${currentPage === number ? "bg-orange-dys text-white" : "bg-white text-orange-dys"} border border-solid border-orange-dys`}
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

CardTableService.defaultProps = {
  color: "light",
};

CardTableService.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
};