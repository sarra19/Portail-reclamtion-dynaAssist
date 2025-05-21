import React, { useState } from "react";

export default function CardAddRecAdmin() {
  const [typeReclamation, setTypeReclamation] = useState("textuelle");

  const handleReclamationTypeChange = (event) => {
    setTypeReclamation(event.target.value);
  };

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-blueGray-700 text-xl font-bold">Saisir votre Réclamation</h6>
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form>
            <div className="flex flex-wrap">
              
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="nom-cible"
                  >
                    Type de Cible
                  </label>
                  <select
                    id="nom-cible"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  >
                    <option value="Produit">Produit</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="nom-cible"
                  >
                    Nom de Cible
                  </label>
                  <select
                    id="nom-cible"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  >
                    <option value="cible1">cible1</option>
                    <option value="cible2">cible2</option>
                  </select>
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="sujet"
                  >
                    Sujet
                  </label>
                  <input
                    type="text"
                    id="sujet"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue="Mauvaise qualité..."
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="type-reclamation"
                  >
                    Type de Réclamation
                  </label>
                  <select
                    id="type-reclamation"
                    value={typeReclamation}
                    onChange={handleReclamationTypeChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  >
                    <option value="textuelle">textuelle</option>
                    <option value="vocal">Vocal</option>
                  </select>
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="document"
                  >
                    Envoyer un document
                  </label>
                  <input
                    type="file"
                    id="document"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>
            </div>

            <hr className="mt-6 border-b-1 border-blueGray-300 mb-6" />

            <div className="flex flex-wrap">
              {typeReclamation === "textuelle" ? (
                <div className="w-full lg:w-12/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      defaultValue="Je me permets de vous contacter pour exprimer mon mécontentement concernant..."
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-center text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="enregistrement-vocal"
                  >
                    Enregistrement Vocal
                  </label>
                  <button
                    id="enregistrement-vocal"
                    className="flex justify-center items-center bg-orange-dys text-white active:bg-lightBlue-600 font-bold uppercase text-lg px-12 py-4 rounded-full shadow hover:shadow-md outline-none focus:outline-none mx-auto ease-linear transition-all duration-150"
                  >
                    <i className="fas fa-microphone"></i>
                  </button>
                </div>
              </div>
              
              )}
            </div>

          </form>

          <div className="rounded-t bg-white mb-0 px-6 py-6">
            <div className="text-center flex justify-end">
              <button
                className="bg-orange-dys text-white active:bg-orange-dys font-bold uppercase text-xs px-6 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                type="button"
              >
                                                <i className="fas fa-paper-plane mr-2"></i>

                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
