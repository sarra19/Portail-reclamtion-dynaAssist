import React from "react";

// components

export default function CardModifytUser() {
  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">

<div className="flex-auto px-4 lg:px-10 py-10 pt-0">
<h6 className="text-blueGray-700 text-xl mt-12 font-bold flex justify-center">Modifier un utilisateur</h6>

  <form>
    <h6 className="text-blueGray-400 text-sm mt-6 mb-6 font-bold uppercase">
      Information d'utilisateur
    </h6>
    <div className="flex flex-wrap">
      <div className="w-full lg:w-6/12 px-4">
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Username
          </label>
          <input
            type="text"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            defaultValue="lucky.jesse"
          />
        </div>
      </div>
      <div className="w-full lg:w-6/12 px-4">
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Adresse Email
          </label>
          <input
            type="email"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            defaultValue="jesse@example.com"
          />
        </div>
      </div>
      <div className="w-full lg:w-6/12 px-4">
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Prénom
          </label>
          <input
            type="text"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            defaultValue="Lucky"
          />
        </div>
      </div>
      <div className="w-full lg:w-6/12 px-4">
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Nom
          </label>
          <input
            type="text"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            defaultValue="Jesse"
          />
        </div>
      </div>
      <div className="w-full lg:w-6/12 px-4">
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Téléphone
          </label>
          <input
            type="tel"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            placeholder="Enter your phone number"
            pattern="[0-9]{8}"
            defaultValue="xx xxx xxx"
          />

        </div>
      </div>
      <div className="w-full lg:w-6/12 px-4">
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Genre
          </label>

          <select
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
          >
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
          </select>

        </div>
      </div>
    </div>

    <hr className="mt-6 border-b-1 border-blueGray-300" />

    <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
      Information de Contact
    </h6>
    <div className="flex flex-wrap">
      <div className="w-full lg:w-12/12 px-4">
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Adresse
          </label>
          <input
            type="text"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            defaultValue="Adresse"
          />
        </div>
      </div>
      <div className="w-full lg:w-4/12 px-4">
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            pays
          </label>
          <input
            type="email"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            defaultValue="Pays"
          />
        </div>
      </div>
      <div className="w-full lg:w-4/12 px-4">
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            ville
          </label>
          <input
            type="text"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            defaultValue="Ville"
          />
        </div>
      </div>
      <div className="w-full lg:w-4/12 px-4">
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Code Postal
          </label>
          <input
            type="text"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            defaultValue="Code Postal"
          />
        </div>
      </div>
    </div>

    <hr className="mt-6 border-b-1 border-blueGray-300" />

    <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
      à propos
    </h6>
    <div className="flex flex-wrap">
      <div className="w-full lg:w-12/12 px-4">
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            biographie
          </label>
          <textarea
            type="text"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            defaultValue="Biographie"
            rows="4"
          ></textarea>
        </div>
      </div>
    </div>
    <div className="rounded-t bg-white mb-0 px-6 py-6">
      <div className="text-center flex justify-end ">
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
