import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useHistory } from 'react-router-dom';
import SummaryApi from '../../api/common';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IndexDropdown from "components/Dropdowns/IndexDropdown";
import UserDropdown from "components/Dropdowns/UserDropdown";
import { useSelector } from "react-redux";

export default function Navbar(props) {
  const history = useHistory();
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  const [allUsers, setAllUsers] = useState([]); // État pour stocker tous les utilisateurs
  const [searchTerm, setSearchTerm] = useState(""); // État pour stocker la valeur de recherche
  const [showUserList, setShowUserList] = useState(false); // État pour afficher/masquer la liste des utilisateurs

  // Récupérer l'utilisateur actuel
  const currentUser = useSelector(state => state?.user?.user)


  // Récupérer tous les utilisateurs
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(SummaryApi.allUser.url, {
        method: SummaryApi.allUser.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const dataResponse = await response.json();
      if (Array.isArray(dataResponse) && dataResponse.length > 0) {
        setAllUsers(dataResponse);
      } else {
        console.error("Aucune donnée de User disponible dans la réponse de l'API.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des Users:", error);
    }
  };

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      const fetchData = await fetch(SummaryApi.logout_user.url, {
        method: SummaryApi.logout_user.method,
        credentials: 'include',
      });

      const data = await fetchData.json();

      if (data.success) {
        toast.success(data.message);
        const activityDescription = `Déconnexion du Compte `;
        await fetch(SummaryApi.addHistorique.url, {
          method: SummaryApi.addHistorique.method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            UserId: currentUser.No_,
            Activity: activityDescription,
          }),
        });
      } else if (data.error) {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An error occurred while logging out. Please try again.");
    }
  };

  // Filtrer les utilisateurs en fonction de la recherche
  const filteredUsers = allUsers
    .filter(user => user.No_ !== currentUser?.No_) // Exclure le profil de l'utilisateur actuel
    .filter(user =>
      `${user.FirstName} ${user.LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  const displayedUsers = filteredUsers.slice(0, 4);

  useEffect(() => {
    fetchAllUsers(); // Récupérer tous les utilisateurs au chargement du composant
  }, []);

  return (
    <>
      <nav id="navbar" className="z-50 w-full flex flex-wrap items-center mt-23 justify-between px-2 py-3 navbar-expand-lg bg-white shadow">
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <a href="/">
              <img
                src={require("assets/img/dyn1.jpg")}
                className="h-16"
                alt="Logo Dynamix"
              />
            </a>
            <button
              className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
          <div
            className={
              "lg:flex flex-grow items-center bg-white lg:bg-opacity-0 lg:shadow-none" +
              (navbarOpen ? " block" : " hidden")
            }
            id="example-navbar-warning"
          >
            <ul className="flex flex-col lg:flex-row list-none mr-auto">
              <li className="flex items-center">
                <a
                  className="hover:y text-black px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                  href="/"
                >
                  <i className="text-black text-lg leading-lg mr-2" />{" "}
                  Accueil
                </a>
              </li>
              {currentUser?.Role !== 2  && (
                <li className="flex items-center">
                  <a
                    className="hover:text-black text-black px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                    href="/services"
                  >
                    <i className="text-black text-lg leading-lg mr-2" />{" "}
                    Services
                  </a>
                </li>
              )}
              {currentUser?.Role !== 2 && (
                <li className="flex items-center">
                  <a
                    className="hover:text-black text-black px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                    href="/produits"
                  >
                    <i className="text-black text-lg leading-lg mr-2" />{" "}
                    Produits
                  </a>
                </li>
              )}
              {currentUser && (
                <li className="flex items-center">
                  <a
                    className="hover:text-black text-black px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                    href="/mes-réclamations"
                  >
                    <i className="text-black text-lg leading-lg mr-2" />{" "}
                    Mes Réclamations
                  </a>
                </li>
              )}
            </ul>

            <ul className="flex flex-col lg:flex-row list-none lg:ml-auto">
              {currentUser && (
              <li className="flex items-center">
                <form className="mt-2 mb-2 flex flex-row flex-wrap items-center lg:ml-0">
                  <div className="relative flex w-full flex-wrap items-stretch">
                    <span className="z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
                      <i className="fas fa-search text-blueGray-700"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="Rechercher un profil..."
                      className="border-0 px-3 py-3 placeholder-blueGray-700 text-blueGray-700 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setShowUserList(true)}
                      onBlur={() => setTimeout(() => setShowUserList(false), 200)} // Retarder la fermeture pour permettre le clic
                    />
                    {showUserList && (
                      <div className="absolute top-full mt-12 left-0 w-full bg-white border border-gray-200 rounded shadow-lg mt-1 z-50">
                        <ul className="p-2">
                          {displayedUsers.length > 0 ? (
                            displayedUsers.map((user) => (
                              <li
                                key={user.No_}
                                className="py-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                                onMouseDown={() => {
                                  // Rediriger vers le profil de l'utilisateur
                                  history.push(`/ProfileUsers/${user.No_}`);
                                }}
                              >
                                <div className="flex items-center">
                                  <img
                                    className="w-8 h-8 rounded-full"
                                    src={user.ProfileImage}
                                    alt={user.FirstName}
                                  />
                                  <span className="ml-2">
                                    {user.FirstName} {user.LastName}
                                  </span>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="py-2 text-gray-500">Aucun utilisateur trouvé</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </form>
              </li>
              )}
              {currentUser?.Role === 0 && (
                <li className="flex items-center">
                  <a
                    className="hover:text-black text-black px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                    href="/admin/dashboard"
                  >
                    <i className="text-black text-lg leading-lg mr-2" />{" "}
                    Administration
                  </a>
                </li>
              )}
              <li className="flex items-center">
                {currentUser ? (
                  <a
                    href="/auth/login"
                    className="hover:text-black text-black px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                    onClick={handleLogout}
                  >
                    <i className="text-black fas fa-sign-out-alt text-lg leading-lg" />
                    <span className="lg:hidden inline-block ml-2">Déconnexion</span>
                  </a>
                ) : (
                  <a href="/auth/login">
                    <button className="bg-orange-dys text-white px-4 py-2 rounded-md text-xs uppercase font-bold hover:bg-gray-800">
                      Se connecter
                    </button>
                  </a>
                )}
              </li>

              <li className="flex items-center">
                {currentUser && (
                  <>
                    <IndexDropdown />
                    <span className="lg:hidden inline-block ml-2 hover:text-black text-black text-xs uppercase font-bold">
                      Notifications
                    </span>
                  </>
                )}
              </li>


              <li className="flex items-center">
              {currentUser && (

                <a
                  className="hover:text-black text-black px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                  href="/chat"
                >
                  <i className="text-black fas fa-comments text-lg leading-lg " />
                  <span className="lg:hidden inline-block ml-2">Chat</span>
                </a>
                 )}
              </li>
              <li className="flex items-center">
              {currentUser && (

                <UserDropdown />
              )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}