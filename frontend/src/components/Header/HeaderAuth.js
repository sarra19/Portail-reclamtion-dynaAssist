import React from "react";

export default function HeaderAuth(props) {
  return (
    <>
            <header className="bg-orange-dys text-white py-4">

        <div className="container mx-auto px-2">
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-4/12 px-4">
              <div className="text-sm text-blueGray-500 font-semibold py-1 text-center md:text-left">
             {/* <div className="flex">
              <img
              src={require("assets/img/dynablack.png")}
              className="h-12 mr-2"
            ></img> */}
                <a
                  href="https://www.creative-tim.com?ref=nr-footer-small"
                  className="text-white hover:text-blueGray-300 text-sm font-semibold py-1"
                >
                  Bienvenue à Service Reclamation DynaAssist-Dynamix services!                </a>
              </div>
            </div>
            {/* </div> */}
            <div className="w-full md:w-8/12 px-4">
              <ul className="flex flex-wrap items-center list-none md:justify-end justify-center">
                <li className="flex items-center mr-4">
                  <i className="fas fa-phone-alt mr-2 text-white"></i>
                  <a
                    href="tel:+21698134844"
                    className="text-white hover:text-blueGray-300 text-sm font-semibold block"
                  >
                    +216 98 134 844 - 70 293 711
                  </a>
                </li>

                <li className="hidden md:block text-white font-semibold mx-2">
                  |
                </li>

                <li className="flex items-center mr-4">
                  <i className="fas fa-envelope mr-2 ml-2 text-white"></i>
                  <a
                    href="mailto:info@dynamix-services.com"
                    className="text-white hover:text-blueGray-300 text-sm font-semibold block"
                  >
                    info@dynamix-services.com
                  </a>
                </li>

                <li className="hidden md:block text-white font-semibold mx-2">
                  |
                </li>

                <li className="flex items-center space-x-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white ml-2 hover:text-blueGray-300 text-lg"
                  >
                    <i className="fab fa-facebook"></i>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white ml-2 hover:text-blueGray-300 text-lg"
                  >
                    <i className="fab fa-linkedin"></i>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white ml-2 hover:text-blueGray-300 text-lg"
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        </header>
    </>
  );
}
