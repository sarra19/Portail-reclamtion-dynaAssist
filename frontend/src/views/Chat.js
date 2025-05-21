import React from "react";

import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import HeaderAuth from "components/Header/HeaderAuth";
import CardChatMessage from "./Chat/Chat";

export default function Chat() {
  return (
    <>
      <HeaderAuth fixed />

      <IndexNavbar fixed />

      <div className="w-full pb-32 flex  content-center items-center justify-center">
        <div className="container mx-auto px-4 w-full ">

            <CardChatMessage />
        </div>
      </div>
      <Footer />
    </>
  );
}
