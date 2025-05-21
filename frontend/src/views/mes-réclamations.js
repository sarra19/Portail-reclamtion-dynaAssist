import React, { useEffect, useState } from "react";

import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import CardReclamation from "components/Cards/CardReclamtion";
import HeaderAuth from "components/Header/HeaderAuth";
import CardReclamationAdmin from "components/Cards/CardReclamtionAdmin";
import { toast, ToastContainer } from "react-toastify";
import CardReclamtionFournisseur from "components/Cards/CardReclamtionFournisseur";
import SummaryApi from "api/common";
import { useSelector } from "react-redux";



export default function MesReclamation() {
   const currentUser = useSelector(state => state?.user?.user)

  return (
    <>
      <HeaderAuth fixed />

      <IndexNavbar />
      <main className="profile-page">
        <ToastContainer position='top-center' />

        <div className="relative  pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75">
        <img
  alt="Background"
  className="absolute top-0 w-full h-[50vh] object-cover bg-center"
  src={require("assets/img/rec.jpg")}
/>
         



          <span
            id="blackOverlay"
            className="w-full h-50 absolute opacity-75 "
          ></span>
          <div className="container relative mx-auto animate-fade-down animate-once animate-duration-[2000ms]  animate-ease-in-out animate-fill-forwards">
            <div className="items-center flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                <div className="pr-12">
                  <h1 className="text-white font-semibold text-5xl">
                    Mes Réclamations.
                  </h1>
                  <p className="mt-4 text-lg text-blueGray-200">
                    Suivez Votre Reclamations.
                  </p>
                </div>
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
              {currentUser?.Role === 1 ? ( 
                <CardReclamation />
              ) : currentUser?.Role === 2 ? ( 
                <CardReclamtionFournisseur />
              ) : ( 
                <CardReclamationAdmin />
              )}
            </div>
          </div>

        </section>
      </main>
      <Footer />
    </>
  );
}
