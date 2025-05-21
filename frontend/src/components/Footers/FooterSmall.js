import React from "react";

export default function FooterSmall(props) {
  return (
    <>
      <footer
        className={
          (props.absolute
            ? "absolute w-full bottom-0 bg-orange-dys border-login"
            : "relative") + " pb-6"
        }
      >
       <div className="relative bg-orange-dys pt-8 pb-6">
            <div className="flex flex-wrap  items-center md:justify-between justify-center">
              <div className="w-full md:w-4/12 px-4 mx-auto text-center">
                <div className="text-sm text-white font-semibold py-1">
                  Copyright © {new Date().getFullYear()} Dynamix Services. Tous droits réservés.

                </div>
              </div>
            </div>
          </div>
      </footer>
    </>
  );
}
