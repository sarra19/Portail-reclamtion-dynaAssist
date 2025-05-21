/*eslint-disable*/
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

import NotificationDropdown from "components/Dropdowns/NotificationDropdown.js";
import UserDropdown from "components/Dropdowns/UserDropdown.js";
import { toast } from "react-toastify";
import SummaryApi from "api/common";


export default function Sidebar() {
  const [collapseShow, setCollapseShow] = React.useState("hidden");
  const [currentUser, setCurrentUser] = useState(null);

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
  useEffect(() => {
    fetchCurrentUser();

  }, []);

  const handleLogout = async () => {
    try {
      const fetchData = await fetch(SummaryApi.logout_user.url, {
        method: SummaryApi.logout_user.method,
        credentials: 'include',
      });

      const data = await fetchData.json();

      if (data.success) {
        toast.success(data.message);
        // dispatch(setUserDetails(null));
        // window.location.href = "https://portail-reclamtion-mern-erp.onrender.com/auth/login";
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
  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          <button
            className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>
          <img
            src={require("assets/img/dyn1.jpg")}
            className="w-50 mx-auto hidden md:block" // Masqué sur les petits écrans, affiché sur les écrans moyens et plus grands
            alt="Logo"
          />

          <ul className="md:hidden items-center flex flex-wrap list-none">

            <li className="inline-block relative">
              <UserDropdown />
            </li>
          </ul>
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            <div className="md:flex-col md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-blueGray-200">
              <div className="flex flex-wrap">
                {/* Logo pour les petits écrans */}
                <div className="w-full flex justify-center mb-4">
                  <Link to="/auth/login">
                    <img
                      src={require("assets/img/logo-dynamix-full.png")}
                      className="h-8"
                      alt="Dynamix Logo"
                    />
                  </Link>

                </div>
                <div className="w-6/12">
                  <Link
                    className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
                    to="/admin/dashboard"
                  >
                    Dynamix Services
                  </Link>
                </div>
                <div className="w-6/12 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                    onClick={() => setCollapseShow("hidden")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>


            {/* Heading */}
            <h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
              Pages d'administration
            </h6>

            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-bold block " +
                    (window.location.href.indexOf("/admin/dashboard") !== -1
                      ? "text-blueGray-700 hover:text-blueGray-500"
                      : "text-blueGray-700 hover:text-blueGray-500")
                  }
                  to="/admin/dashboard"
                >
                  <i
                    className={
                      "fas fa-chart-bar mr-3 text-sm " +
                      (window.location.href.indexOf("/admin/dashboard") !== -1
                        ? "opacity-75"
                        : "text-blueGray-300")
                    }
                  ></i>{" "}
                  Statistiques
                </Link>
              </li>
              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-bold block " +
                    (window.location.href.indexOf("/admin/users") !== -1
                      ? "text-blueGray-700 hover:text-blueGray-500"
                      : "text-blueGray-700 hover:text-blueGray-500")
                  }
                  to="/admin/users"
                >
                  <i
                    className={
                      "fas fa-users mr-2 text-sm " +
                      (window.location.href.indexOf("/admin/users") !== -1
                        ? "opacity-75"
                        : "text-blueGray-300")
                    }
                  ></i>{" "}
                  Gestion des utilisateurs
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-bold block " +
                    (window.location.href.indexOf("/admin/réclamation") !== -1
                      ? "text-blueGray-700 hover:text-blueGray-500"
                      : "text-blueGray-700 hover:text-blueGray-500")
                  }
                  to="/admin/réclamation"
                >
                  <i
                    className={
                      "fas fa-exclamation-triangle mr-2 text-sm " +
                      (window.location.href.indexOf("/admin/réclamation") !== -1
                        ? "opacity-75"
                        : "text-blueGray-300")
                    }
                  ></i>{" "}
                  Réclamations
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-bold block " +
                    (window.location.href.indexOf("/admin/produit") !== -1
                      ? "text-blueGray-700 hover:text-blueGray-500"
                      : "text-blueGray-700 hover:text-blueGray-500")
                  }
                  to="/admin/produit"
                >
                  <i
                    className={
                      "fab fa-product-hunt mr-2 text-sm " +
                      (window.location.href.indexOf("/admin/produit") !== -1
                        ? "opacity-75"
                        : "text-blueGray-300")
                    }
                  ></i>{" "}
                  Produits
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-bold block " +
                    (window.location.href.indexOf("/admin/service") !== -1
                      ? "text-blueGray-700 hover:text-blueGray-500"
                      : "text-blueGray-700 hover:text-blueGray-500")
                  }
                  to="/admin/service"
                >
                  <i
                    className={
                      "fas fa-handshake mr-2 text-sm " +
                      (window.location.href.indexOf("/admin/service") !== -1
                        ? "opacity-75"
                        : "text-blueGray-300")
                    }
                  ></i>{" "}
                  Services
                </Link>
              </li>
              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-bold block " +
                    (window.location.href.indexOf("/admin/remboursement") !== -1
                      ? "text-blueGray-700 hover:text-blueGray-500"
                      : "text-blueGray-700 hover:text-blueGray-500")
                  }
                  to="/admin/remboursement"
                >
                  <i
                    className={
                      "fas fa-money-bill mr-2 text-sm " +
                      (window.location.href.indexOf("/admin/remboursement") !== -1
                        ? "opacity-75"
                        : "text-blueGray-300")
                    }
                  ></i>{" "}
                  Remboursements
                </Link>
              </li>
              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-bold block " +
                    (window.location.href.indexOf("/admin/intervention") !== -1
                      ? "text-blueGray-700 hover:text-blueGray-500"
                      : "text-blueGray-700 hover:text-blueGray-500")
                  }
                  to="/admin/intervention"
                >
                  <i
                    className={
                      "fas fa-tools mr-2 text-sm " +
                      (window.location.href.indexOf("/admin/intervention") !== -1
                        ? "opacity-75"
                        : "text-blueGray-300")
                    }
                  ></i>{" "}
                  Interventions
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className={`text-xs uppercase py-3 font-bold block ${window.location.pathname === "/admin/historique"
                    ? "text-blueGray-700 opacity-75"
                    : "text-blueGray-500 hover:text-blueGray-700"
                    }`}
                  to="/admin/historique"
                >
                  <i
                    className={`fas fa-history mr-2 text-sm ${window.location.pathname === "/admin/historique"
                      ? "opacity-75"
                      : "text-blueGray-300"
                      }`}
                  ></i>{" "}
                  Historique d'Activités
                </Link>
              </li>
              <li className="items-center">
                <Link
                  className={`text-xs uppercase py-3 font-bold block ${window.location.pathname === "/"
                    ? "text-blueGray-700 opacity-75"
                    : "text-blueGray-500 hover:text-blueGray-700"
                    }`}
                  to="/"
                >
                  <i
                    className={`fas fa-home mr-2 text-sm ${window.location.pathname === "/"
                      ? "opacity-75"
                      : "text-blueGray-300"
                      }`}
                  ></i>{" "}
                  Page d'accueil
                </Link>
              </li>

            </ul>

            <hr className="my-4 md:min-w-full" />

            <ul className="md:flex-col md:min-w-full flex flex-col list-none md:mb-4">
              <li className="items-center">
                <Link
                  className="text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
                  to="/auth/login"
                  onClick={handleLogout} // Add the onClick handler here
                >
                  <i className="fas fa-arrow-left text-blueGray-400 mr-2 text-sm"></i>{" "}
                  Déconnexion
                </Link>
              </li>


            </ul>


          </div>
        </div>
      </nav>
    </>
  );
}
