import React from "react";

export default function Footer() {
  return (
    <footer className="relative bg-dark pt-8 pb-6 w-full">
      <div
        className="bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20 h-20"
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
            className="text-blueGray-200 fill-current"
            points="2560 0 2560 100 0 100"
          ></polygon>
        </svg>
      </div>
      <div className="w-full px-4 mx-auto">
        <div className="flex flex-wrap justify-center text-center">
          <div className="w-full lg:w-6/12 pb-4">
            <h4 className="text-3xl font-semibold">Prenez contact avec nous!</h4>
            <h5 className="text-lg mt-0 mb-2 text-blueGray-600">
              Veuillez nous contacter par :
            </h5>
            <div className="mt-6 lg:mb-0 mb-6 flex justify-center">
              <button
                className="bg-white text-lightBlue-400 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                type="button"
              >
                <i className="fab fa-linkedin"></i>
              </button>
              <button
                className="bg-white text-lightBlue-600 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                type="button"
              >
                <i className="fab fa-facebook-square"></i>
              </button>
              <button
                className="bg-white text-pink-400 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                type="button"
              >
                <i className="fas fa-globe"></i>
              </button>
            </div>
          </div>
          <div className="w-full lg:w-6/12 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-full">
                <ul className="list-unstyled text-center">
                  <li>
                    <a
                      href="#location"
                      className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                    >
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      Pôle Industriel EL Azib Bizerte-Tunisie
                    </a>
                  </li>
                </ul>
              </div>
              <div className="w-full mt-4">
                <ul className="list-unstyled text-center">
                  <li>
                    <a
                      href="tel:+21698134844"
                      className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                    >
                      <i className="fas fa-phone-alt mr-2"></i>
                      +216 98 134 844 - 70 293 711
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:info@dynamix-services.com"
                      className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                    >
                      <i className="fas fa-envelope mr-2"></i>
                      info@dynamix-services.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="relative bg-orange-dys pt-8 pb-6 w-full">
          <div className="flex flex-wrap items-center justify-center">
            <div className="w-full mx-auto text-center">
              <div className="text-sm text-white font-semibold py-1">
                Copyright © {new Date().getFullYear()} Dynamix Services. Tous
                droits réservés.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}