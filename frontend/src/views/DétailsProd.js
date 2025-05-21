import React from "react";

import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import HeaderAuth from "components/Header/HeaderAuth";
import CardDétailsProduitFront from "components/Cards/Détails/CardDétailsProduitFront";

export default function DétailsProd() {
  return (
    <>
            <HeaderAuth fixed />
    
      <IndexNavbar  />
      <main className="profile-page">
        <div className="relative  pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75">
          <img
            alt="..."
            className="absolute top-0 w-full h-full bg-center bg-cover"
            src={require("assets/img/rec.jpg")}
          />
          {/* <div className="absolute top-0 right-0">
            <img
              alt="..."
              src={require("assets/img/breadcrumb-shape2.png")}
            />
          </div> */}



          <span
            id="blackOverlay"
            className="w-full h-full absolute opacity-75 "
          ></span>
          <div className="container relative mx-auto animate-fade-down animate-once animate-duration-[2000ms]  animate-ease-in-out animate-fill-forwards">
            <div className="items-center flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
              <h1 className="text-white font-semibold text-5xl">
                    Détails Produit.
                  </h1>
                  <p className="mt-4 text-lg text-blueGray-200">
                    Consulter les détails de produit.
                  </p>
              </div>
            </div>
          </div>

          <div
            className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
            style={{ transform: "translateZ(0)" }}
          >
            <svg
              className="absolute bottom-0 overflow-hidden"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
             <polygon 
    className="text-orange-dys fill-current" 
    points="2560 0 2560 100 0 100" 
    stroke="currentColor" 
    stroke-width="4">
</polygon>

            </svg>
          </div>
        </div>
        <section className="relative py-16 bg-blueGray-200">
          <div className="container mx-auto px-4">
              <div className="px-6">

              <CardDétailsProduitFront/>
              </div>
               <a href={`/produits`}>
        <button
          className=" mt-2 ml-2 bg-gray-500 text-white active:bg-gray-500 font-bold uppercase text-xs px-2 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
          type="button"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Retour
        </button>
      </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
