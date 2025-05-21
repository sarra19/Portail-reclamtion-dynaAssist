import SummaryApi from "api/common";

import Context from "context";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

export default function ModifierPassword() {

const { Email,fetchUserDetails } = useContext(Context); 

const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const history = useHistory();
async function handleSubmit(event) {
  event.preventDefault();


  try {
    // Réinitialisation du mot de passe
    const response = await fetch(SummaryApi.resetPassword.url, {
      method: SummaryApi.resetPassword.method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: Email,
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error("Échec de la réinitialisation du mot de passe.");
    }

    // Connexion de l'utilisateur après réinitialisation du mot de passe
    const dataResponse = await fetch(SummaryApi.signIn.url, {
      method: SummaryApi.signIn.method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: Email,
        Password: password,
      }),
    });

    const dataApi = await dataResponse.json();

    if (dataApi.success) {
      // Redirection vers la page d'accueil et récupération des détails de l'utilisateur
      history.push('/');
      fetchUserDetails(); // Assurez-vous que cette fonction est bien définie dans le contexte ou ailleurs
    } else {
      toast.error("La connexion a échoué après la réinitialisation.");
    }
  } catch (error) {
    toast.error(error.message || "Une erreur est survenue.");
  }
}

useEffect(() => {
  if (Email) {
  }
}, [Email]); 
  return (
    
    <div className="container mx-auto px-4 h-full">
            <ToastContainer position='top-center' />

        <div className="flex content-center items-center justify-start h-full">
        <div className="w-full lg:w-4/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
            <div className="rounded-t mb-0 px-6 py-6 text-center">
            <h6 className="text-blueGray-500 text-sm font-bold">
            Changer votre Mot de Passe
            </h6>
            <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={handleSubmit} >
              <div>
                <label
                  htmlFor="password"
                  className="block  uppercase text-blueGray-600 text-xs font-bold mb-2"
                  >
                  Nopuveau Mot de Passe
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-pink-50 border border-pink-500 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-pink-600 block w-full p-2.5 dark:bg-gray-700 dark:border-pink-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-pink-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mt-2 block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  >
                  Confirmer votre Mot de Passe
                </label>
                <input
                  type="password"
                  name="confirm-password"
                  id="confirm-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-50 border border-pink-500 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-pink-600 block w-full p-2.5 dark:bg-pink-700 dark:border-pink-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-pink-500"
                  required
                />
              </div>
              <div className="text-center mt-6 ">

              <button
                      className="bg-orange-dys text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                      type="submit"
                    >
                      Réinitialiser
                    </button>
                 </div>
            </form>
         
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
