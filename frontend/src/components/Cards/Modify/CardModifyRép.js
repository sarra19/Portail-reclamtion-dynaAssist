import React, { useState } from "react";

export default function CardModifyReponse() {
  const [services, setServices] = useState({
    intervention: false,
    remboursement: false,
  });

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setServices((prev) => ({
      ...prev,
      [value]: checked,
    }));
  };

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <h6 className="text-blueGray-700 text-xl mt-12 font-bold flex justify-center">
          <i className="fas fa-paper-plane mr-2"></i>
            Répondre au réclamation
          </h6>

          <form>
            <h6 className="text-blueGray-400 text-sm mt-6 mb-6 font-bold uppercase">
              Modifier votre réponse
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    Sujet de réclamation
                  </label>
                  <input
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue="sujet de réclamation"
                  />
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    Insérer une pièce jointe
                  </label>
                  <input
                    type="file"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    Réponse
                  </label>
                  <textarea
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue="Contenu de réponse..."
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="services-supplimentaires"
                >
                  Services Supplémentaires
                </label>

                <div
                  id="services-supplimentaires"
                  className="flex flex-col space-y-2"
                >
                  
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value="remboursement"
                      onChange={handleCheckboxChange}
                      className="form-checkbox border-0 text-blueGray-600 bg-white rounded shadow focus:ring ease-linear transition-all duration-150"
                    />
                    <span className="ml-2 text-blueGray-600 text-sm">
                      Remboursement
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value="intervention"
                      onChange={handleCheckboxChange}
                      className="form-checkbox border-0 text-blueGray-600 bg-white rounded shadow focus:ring ease-linear transition-all duration-150"
                    />
                    <span className="ml-2 text-blueGray-600 text-sm">
                      Intervention
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {services.remboursement && (
              <>
                <hr className="mt-6 border-b-1 border-blueGray-300 mb-6" />
                <h6 className="text-blueGray-400 text-sm mt-6 mb-6 font-bold uppercase">
                  Envoyer un remboursement
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Montant
                      </label>
                      <input
                        type="number"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      />
                    </div>
                  </div>

                  {/* reclamation.user */}
                  {/* <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Bénéficiaire
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        defaultValue="Nom de client"
                      />
                    </div>
                  </div> */}
                </div>
              </>
            )}

            {services.intervention && (
              <>
                <hr className="mt-6 border-b-1 border-blueGray-300 mb-6" />
                <h6 className="text-blueGray-400 text-sm mt-6 mb-6 font-bold uppercase">
                  Ajouter une intervention
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Date prévu
                      </label>
                      <input
                        type="date"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Technicien responsable
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        defaultValue="Nom de technicien"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="rounded-t bg-white mb-0 px-6 py-6">
              <div className="text-center flex justify-end">
                <button
                  className="bg-orange-dys text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-6 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                  type="button"
                >
                  Modifier
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
