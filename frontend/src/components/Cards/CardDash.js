import React from "react";

// components

export default function CardDash() {
  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg mt-16">
        <div className="px-6">
          <div className="text-center mt-12">
            <h3 className="text-xl font-semibold leading-normal mb-4 text-blueGray-700">
              Tableau de Bord Gestion des Réclamations Clients et Fournisseurs
            </h3>
            <h4 className="text-lg font-semibold text-blueGray-700 mb-2">
              Suivi et Résolution Efficace
            </h4>
            <div className="w-full px-4 flex justify-center ">
              <div className="relative mt-6 mb-6 ">
                <img
                  alt="..."
                  src={require("assets/img/dash1.jpg")}
                  className="shadow-xl rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
