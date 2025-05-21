/*eslint-disable*/
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";

import HeaderAuth from "components/Header/HeaderAuth";
import { useSelector } from 'react-redux'
import SummaryApi from "api/common";

export default function Index() {
  const user = useSelector(state => state?.user?.user)


  useEffect(() => {

    console.log(user)

  }, [user])
  return (
    <>

      <HeaderAuth fixed />

      <IndexNavbar />
      <section className="header relative pt-16 items-center element-back flex h-screen max-h-860-px 
animate-fade-right animate-once animate-duration-[2000ms]  animate-ease-in-out animate-fill-forwards">
        <div className="container mx-auto flex items-center flex-wrap">
          <div className="w-full md:w-8/12 lg:w-6/12 xl:w-6/12 px-4">
            <div className="pt-32 sm:pt-0">
              <h2 className="font-semibold text-4xl text-white">
                Service Réclamation DynaAssist - Dynamix Services
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white">
                Plateforme dédiée à la gestion efficace des réclamations clients et fournisseurs,
                intégrée aux solutions Microsoft ERP pour un suivi optimal.
              </p>
              <div className="mt-12">
                <a
                  href={user?.Role === 2 ? "/mes-réclamations" : "/services"}
                  className="bg-orange-dys text-white active:bg-lightBlue-600 font-bold uppercase px-6 py-4 mt-4 shadow hover:shadow-md outline-none focus:outline-none mr-1 inline-flex items-center animate-ease-in-out animate-fill-forwards hover:animate-jump hover:animate-once hover:animate-duration-[2000ms] hover:animate-delay-0"
                >
                  Commencer
                  <i className="fas fa-arrow-right text-white ml-2"></i>
                </a>
              </div>


            </div>
          </div>
        </div>

        <img
          className="absolute top-2 b-auto right-0 mr-4 pt-16 sm:w-6/12 -mt-48 sm:mt-0 w-6/12 max-h-50px animate-fade-right animate-once animate-duration-[2000ms] animate-ease-in-out animate-fill-forwards "
          src={require("assets/img/landing2.jpg")}
          alt="..."
        />
      </section>

      <section className="mt-48 md:mt-40 pb-40 relative bg-blueGray-100">
        <div
          className="-mt-20 top-0 bottom-auto left-0 right-0 w-full absolute h-20"
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
              className="text-blueGray-100 fill-current"
              points="2560 0 2560 100 0 100"
            ></polygon>
          </svg>
        </div>

        {/* *** */}
        <div className="container mx-auto px-4 pb-32">
          <div className="items-center flex flex-wrap">
            <div className="w-full md:w-5/12 ml-auto px-12 md:px-4">
              <div className="md:pr-12">

                <h6 className="text-orange-dys font-semibold">~ À Propos de nous ~               </h6>
                <h3 className="text-3xl text-black font-semibold">
                  Votre succès est notre intégration                </h3>
                <p className="mt-4 text-lg leading-relaxed text-blueGray-700">
                  Depuis plus de 15 ans, nous avons aidé de nombreuses entreprises à déployer et à optimiser leurs systèmes ERP. Notre expertise couvre toutes les étapes de l'intégration, de l'analyse des besoins à la mise en œuvre et au support continu. Nous nous engageons à fournir des solutions qui améliorent l'efficacité opérationnelle et favorisent la croissance.
                </p>
                <div className="text-center flex justify-end ">
                  <a href="/services">
                    <button
                      className="bg-orange-dys text-white active:bg-orange-dys font-bold uppercase text-xs px-6 py-2 mt-4 shadow hover:shadow-md outline-none focus:outline-none mr-1 animate-ease-in-out animate-fill-forwards hover:animate-jump hover:animate-once hover:animate-duration-[2000ms] hover:animate-delay-0"
                      type="button"
                    >
                      En savoir plus
                    </button>
                  </a>
                </div>
              </div>
            </div>

            <div className="w-full md:w-6/12 mr-auto px-4 pt-24 md:pt-0">
              <img
                alt="..."
                className="max-w-full rounded-lg shadow-xl img-jump"
                style={{
                  transform:
                    "scale(1) perspective(1040px) rotateY(-11deg) rotateX(2deg) rotate(2deg)",
                }}
                src={require("assets/img/About3.png")}
              />

            </div>

          </div>




          <div className="justify-center text-center flex flex-wrap mt-24">
            <div className="w-full md:w-6/12 px-12 md:px-4">
              <h2 className="font-semibold text-orange-dys text-4xl">Nos secteurs d'activité​</h2>

            </div>
          </div>
        </div>
        <section className="block relative z-1 bg-blueGray-600">
          <div className="container mx-auto">
            <div className="justify-center flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4 -mt-24">
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-4/12 px-4">
                    <h5 className="text-xl font-semibold pb-4 text-center">
                      Industrie
                    </h5>
                    <div className="hover:-mt-4 relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg ease-linear transition-all duration-150">
                      <img
                        alt="..."
                        className="align-middle border-none w-[80%] h-auto mx-auto rounded-lg"
                        src={require("assets/img/industrie.jpeg")}
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-4/12 px-4">
                    <h5 className="text-xl font-semibold pb-4 text-center">
                      Distribution
                    </h5>
                    <Link to="/profile">
                      <div className="hover:-mt-4 relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg ease-linear transition-all duration-150">
                        <img
                          alt="..."
                          className="align-middle border-none w-[80%] h-auto mx-auto rounded-lg"
                          src={require("assets/img/distribution.jpg")}
                        />
                      </div>
                    </Link>
                  </div>

                  <div className="w-full lg:w-4/12 px-4">
                    <h5 className="text-xl font-semibold pb-4 text-center">
                      Services
                    </h5>
                    <Link to="/landing">
                      <div className="hover:-mt-4 relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg ease-linear transition-all duration-150">
                        <img
                          alt="..."
                          className="align-middle border-none w-[80%] h-auto mx-auto rounded-lg"
                          src={require("assets/img/Serv.jpg")}
                        />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* /** */}
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center">



          </div>
        </div>
        {/* **** */}


      </section>




      <Footer />
    </>
  );
}
