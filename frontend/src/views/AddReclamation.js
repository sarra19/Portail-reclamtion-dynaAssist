import React from "react";

import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import HeaderAuth from "components/Header/HeaderAuth";
import CardAddRec from "components/Cards/Add/CardAddRec";

export default function AddReclamation() {
  return (
    <>
      <HeaderAuth fixed />

      <IndexNavbar />
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
          <div className="container relative mx-auto">
            <div className="items-center flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                <div className="pr-12">
                  <h1 className="text-white font-semibold text-5xl">
                    Réclamation.
                  </h1>
                  <p className="mt-4 text-lg text-blueGray-200">
                    Envoyer Votre Reclamations.
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

              <CardAddRec />
            
            </div>
            
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
