import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SummaryApi from "api/common";

import ChangeUserRole from "../Modify/ChangeUserRole";
import { toast, ToastContainer } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CardTableUser({ color }) {
  const [allUser, setAllUser] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("keywords");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sortBy, setSortBy] = useState("FirstName");
  const [order, setOrder] = useState("ASC");
  const [selectedRole, setSelectedRole] = useState("Tous");

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUser();
  }, [sortBy, order]);

  // Fetch all users from the API
  const fetchAllUser = async () => {
    try {
      const response = await fetch(`${SummaryApi.sortUsers.url}?sortBy=${sortBy}&order=${order}`, {
        method: SummaryApi.sortUsers.method,
        headers: { 'Content-Type': 'application/json' },
      });

      const dataResponse = await response.json();

      if (Array.isArray(dataResponse.data) && dataResponse.data.length > 0) {
        setAllUser(dataResponse.data);
        setFilteredUsers(dataResponse.data);
      } else {
        console.error("No user data available in the API response.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const handleVerify = async (userId) => {
    try {
      const response = await fetch(`${SummaryApi.verifyAdmin.url}/${userId}`, {
  method: SummaryApi.verifyAdmin.method,
  headers: {
    'Content-Type': 'application/json',
  },
});

const contentType = response.headers.get("content-type");

if (!response.ok) {
  const text = await response.text(); // pour voir le HTML en erreur
  console.error("Erreur brute :", text);
  toast("Échec de la vérification. Détails dans la console.");
  return;
}

if (contentType && contentType.includes("application/json")) {
  const result = await response.json();
  toast(result.message || "Utilisateur vérifié !");
  fetchAllUser();
} else {
  const text = await response.text();
  console.error("Réponse inattendue :", text);
  toast("La réponse du serveur n'est pas au format JSON.");
}

    } catch (error) {
      console.error("Erreur lors de la vérification :", error);
      toast("Erreur serveur.");
    }
  };

  // Handle search
  const handleSearch = async () => {
    try {
      const queryParams = new URLSearchParams();

      if (searchType === "keywords") {
        if (searchTerm) queryParams.append('FirstName', searchTerm);
      } else if (searchType === "nom") {
        if (searchTerm) queryParams.append('LastName', searchTerm);
      } else if (searchType === "email") {
        if (searchTerm) queryParams.append('Email', searchTerm);
      } else if (searchType === "ville") {
        if (searchTerm) queryParams.append('City', searchTerm);
      }

      const response = await fetch(`${SummaryApi.findUsers.url}?${queryParams.toString()}`, {
        method: SummaryApi.findUsers.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const dataResponse = await response.json();
      console.log("Search results:", dataResponse);

      if (Array.isArray(dataResponse) && dataResponse.length > 0) {
        setFilteredUsers(dataResponse);
      } else {
        setFilteredUsers([]); // No results found
      }
    } catch (error) {
      console.error("Error during search:", error);
      toast.error("Error during search.");
    }
  };

  // Handle reset
  const handleReset = () => {
    setSearchTerm("");
    setFilteredUsers(allUser);
    setCurrentPage(1);
  };

  // Automatically reset when searchTerm is empty
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(allUser);
    }
  }, [searchTerm, allUser]);

  // Handle sorting
  const handleSort = async (column) => {
    const newOrder = sortBy === column && order === "ASC" ? "DESC" : "ASC";
    setSortBy(column);
    setOrder(newOrder);

    try {
      const response = await fetch(`${SummaryApi.sortUsers.url}?sortBy=${column}&order=${newOrder}`, {
        method: SummaryApi.sortUsers.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const dataResponse = await response.json();
      console.log("Sorted users:", dataResponse);

      if (Array.isArray(dataResponse.data) && dataResponse.data.length > 0) {
        setFilteredUsers(dataResponse.data);
      } else {
        setFilteredUsers([]); // No results found
      }
    } catch (error) {
      console.error("Error during sorting:", error);
      toast.error("Error during sorting.");
    }
  };

  // Handle role filter
  const handleRoleFilter = (role) => {
    setSelectedRole(role);
  };

  // Filter users based on selected role
  const filteredByRole = filteredUsers.filter((user) => {
    if (selectedRole === "Tous") return true;
    if (selectedRole === "Admin") return user.Role === 0;
    if (selectedRole === "Fournisseur") return user.Role === 2;
    if (selectedRole === "Client") return user.Role === 1;
    return true;
  });

  // Handle edit
  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await fetch(SummaryApi.deleteUser.url, {
        method: SummaryApi.deleteUser.method,
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ No_: id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const dataResponse = await response.json();
      toast.success("User deleted successfully");

      fetchAllUser();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
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
      title.textContent = "LISTE DES UTILISATEURS";
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
        { text: "PHOTO", width: "10%" },
        { text: "PRÉNOM", width: "15%" },
        { text: "NOM", width: "15%" },
        { text: "EMAIL", width: "25%" },
        { text: "ROLE", width: "15%" },
        { text: "STATUT", width: "20%" }
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

      // 6. Corps du tableau avec tous les utilisateurs
      const tbody = document.createElement("tbody");

      filteredByRole.forEach((user, index) => {
        const row = document.createElement("tr");

        // Cellule Photo
        const photoCell = document.createElement("td");
        photoCell.style.padding = "6px 8px";
        photoCell.style.border = "1px solid #ddd";
        photoCell.style.textAlign = "center";
        photoCell.style.verticalAlign = "middle";

        const imgWrapper = document.createElement("div");
        imgWrapper.style.display = "flex";
        imgWrapper.style.justifyContent = "center";

        const img = document.createElement("img");
        img.src = user.ProfileImage || "https://via.placeholder.com/50";
        img.style.width = "40px";
        img.style.height = "40px";
        img.style.borderRadius = "50%";
        img.style.objectFit = "cover";
        img.style.border = "1px solid #ddd";
        imgWrapper.appendChild(img);
        photoCell.appendChild(imgWrapper);

        // Cellule Prénom
        const firstNameCell = document.createElement("td");
        firstNameCell.textContent = user.FirstName || "-";
        firstNameCell.style.padding = "6px 8px";
        firstNameCell.style.border = "1px solid #ddd";
        firstNameCell.style.textAlign = "center";
        firstNameCell.style.verticalAlign = "top";

        // Cellule Nom
        const lastNameCell = document.createElement("td");
        lastNameCell.textContent = user.LastName || "-";
        lastNameCell.style.padding = "6px 8px";
        lastNameCell.style.border = "1px solid #ddd";
        lastNameCell.style.textAlign = "center";
        lastNameCell.style.verticalAlign = "top";

        // Cellule Email
        const emailCell = document.createElement("td");
        emailCell.textContent = user.Email || "-";
        emailCell.style.padding = "6px 8px";
        emailCell.style.border = "1px solid #ddd";
        emailCell.style.textAlign = "center";
        emailCell.style.verticalAlign = "top";
        emailCell.style.wordBreak = "break-word";

        // Cellule Rôle
        const roleCell = document.createElement("td");
        roleCell.textContent =
          user.Role === 0 ? "Admin" :
            user.Role === 1 ? "Client" :
              user.Role === 2 ? "Fournisseur" : "Inconnu";
        roleCell.style.padding = "6px 8px";
        roleCell.style.border = "1px solid #ddd";
        roleCell.style.textAlign = "center";
        roleCell.style.verticalAlign = "top";
        roleCell.style.color =
          user.Role === 0 ? "#e74c3c" :
            user.Role === 2 ? "#2ecc71" : "#3498db";

        // Cellule Statut (0 = Non vérifié, 1 = Vérifié)
        const statusCell = document.createElement("td");
        statusCell.textContent = user.Verified === 1 ? "Vérifié" : "Non vérifié";
        statusCell.style.padding = "6px 8px";
        statusCell.style.border = "1px solid #ddd";
        statusCell.style.textAlign = "center";
        statusCell.style.verticalAlign = "top";
        statusCell.style.color = user.Verified === 1 ? "#2ecc71" : "#e74c3c"; // Vert si vérifié, Rouge si non vérifié
        statusCell.style.fontWeight = "bold";

        // Alternance des couleurs de ligne
        row.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";

        row.appendChild(photoCell);
        row.appendChild(firstNameCell);
        row.appendChild(lastNameCell);
        row.appendChild(emailCell);
        row.appendChild(roleCell);
        row.appendChild(statusCell);
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      pdfContainer.appendChild(table);

      // 7. Compteur total
      const countDiv = document.createElement("div");
      countDiv.textContent = `Total: ${filteredByRole.length} utilisateurs (${filteredByRole.filter(u => u.status === 1).length} vérifiés)`;
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
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190; // Largeur en mm (A4 avec marges)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Calcul de la pagination
      const pageHeight = pdf.internal.pageSize.getHeight() - 20; // Hauteur utile avec marges
      let heightLeft = imgHeight;
      let position = 10; // Position Y initiale
      let pageNumber = 1;

      // Ajouter la première page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Ajouter des pages supplémentaires seulement si nécessaire
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
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

      pdf.save(`liste-utilisateurs-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF généré avec succès!");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredByRole.slice(indexOfFirstUser, indexOfLastUser);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredByRole.length / usersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <div className={`animate-fade-down animate-once animate-duration-[2000ms] animate-ease-in-out animate-fill-forwards relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded ${color === "light" ? "bg-white" : "bg-lightBlue-900 text-white"}`}>
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <ToastContainer position='top-center' />
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className={`font-semibold text-lg ${color === "light" ? "text-blueGray-700" : "text-white"}`}>List des utilisateurs</h3>
            </div>
            <a href="/admin/add-users">
              <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                <button className="bg-vert-dys text-white active:bg-vert-dys text-xs font-bold uppercase px-3 py-2 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </a>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => handleRoleFilter("Tous")}
            className={`px-4 py-2 rounded-lg ${selectedRole === "Tous" ? "bg-orange-dys text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Tous
          </button>
          <button
            onClick={() => handleRoleFilter("Admin")}
            className={`px-4 py-2 rounded-lg ${selectedRole === "Admin" ? "bg-orange-dys text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Admin
          </button>
          <button
            onClick={() => handleRoleFilter("Fournisseur")}
            className={`px-4 py-2 rounded-lg ${selectedRole === "Fournisseur" ? "bg-orange-dys text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Fournisseur
          </button>
          <button
            onClick={() => handleRoleFilter("Client")}
            className={`px-4 py-2 rounded-lg ${selectedRole === "Client" ? "bg-orange-dys text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Client
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
                <option value="keywords">First Name</option>
                <option value="nom">Last Name</option>
                <option value="email">Email</option>
                <option value="ville">City</option>
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
                  // Search field for "First Name"
                  <div className="relative flex w-full flex-wrap items-stretch mb-2">
                    <span className="mt-1 z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
                      <i className="fas fa-search text-blueGray-400"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="Search by first name..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (e.target.value === "") {
                          handleReset(); // Reset if the field is empty
                        } else {
                          handleSearch(); // Search while typing
                        }
                      }}
                      className="border-0 px-3 py-2 mt-2 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
                    />
                  </div>
                ) : (
                  // Search field for "Tags"
                  <div className="relative flex w-full flex-wrap items-stretch mb-2">
                    <span className="mt-1 z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
                      <i className="fas fa-search text-blueGray-400"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (e.target.value === "") {
                          handleReset(); // Reset if the field is empty
                        } else {
                          handleSearch(); // Search while typing
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

        {/* Users Table */}
        <div className="block w-full overflow-x-auto" id="user-table">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className={`px-6 text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                  ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                  : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                  }`}  ></th>
                <th >
                  <button className={`px-6 text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                    ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                    : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                    }`} onClick={() => handleSort("FirstName")}>
                    First Name {sortBy === "FirstName" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th >
                  <button className={`px-6 text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                    ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                    : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                    }`} onClick={() => handleSort("LastName")}>
                    Last Name {sortBy === "LastName" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th >
                  <button className={`px-6 text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                    ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                    : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                    }`} onClick={() => handleSort("Email")}>
                    Email {sortBy === "Email" && (order === "ASC" ? "↑" : "↓")}
                  </button>
                </th>
                <th className={`px-6 text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ${color === "light"
                  ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                  : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                  }`}  >Role</th>
                <th className={`px-6 text-center border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left hide-for-pdf ${color === "light"
                  ? "bg-blueGray-50 text-blueGray-500 border-blueGray-100"
                  : "bg-lightBlue-800 text-lightBlue-300 border-lightBlue-700"
                  }`} >Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={index} className="border-t">
                    <td className="border-t-0 px-6 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                      <img src={user.ProfileImage} className="h-12 w-12 bg-white rounded-full border" alt="..." />
                    </td>
                    <td className="border-t-0 px-6 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">{user.FirstName}</td>
                    <td className="border-t-0 px-6 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">{user.LastName}</td>
                    <td className="border-t-0 px-6 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">{user.Email}</td>
                    <td className="border-t-0 px-6 font-bold align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <span className={user.Role === 0 ? 'text-red-500' : user.Role === 2 ? 'text-green-500' : ''}>
                        {user.Role === 0 ? 'Admin' : user.Role === 1 ? 'Client' : user.Role === 2 ? 'Fournisseur' : 'Unknown'}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 text-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4 hide-for-pdf">
                      <div className="flex justify-center">
                        <button onClick={() => handleEdit(user)} className="bg-orange-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">
                          <i className="fas fa-pen"></i>
                        </button>
                        <button onClick={() => handleDelete(user.No_)} className="bg-blueGray-dys-2 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">
                          <i className="fas fa-trash"></i>
                        </button>
                        <a href={`/admin/details-users/${user.No_}`}>
                          <button className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">
                            <i className="fas fa-eye"></i>
                          </button>
                        </a>
                        {user.Verified === 0 && (
                         <button
                        onClick={() => handleVerify(user.No_)}
                        className="bg-green-500 text-white active:bg-green-600 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                      >
                        <i className="fas fa-check"></i>
                      </button>)}
                      </div>
                     

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">No users found.</td>
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
                  <i className="fas fa-chevron-right -ml-px"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>

      </div>

      {showModal && (
        <ChangeUserRole
          name={selectedUser?.FirstName + " " + selectedUser?.LastName}
          email={selectedUser?.Email}
          role={selectedUser?.Role}
          userId={selectedUser?.No_}
          onClose={() => setShowModal(false)} // Fonction pour fermer le modal
          callFunc={fetchAllUser} // Rafraîchir les données après modification
        />
      )}
    </>
  );
}

CardTableUser.defaultProps = {
  color: "light",
};

CardTableUser.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
};