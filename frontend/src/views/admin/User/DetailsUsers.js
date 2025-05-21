import CardUserDetailsAdmin from "components/Cards/Détails/CardUserDetailsAdmin";
import React from "react";

// components


export default function DetailsUsers() {
  return (
    <>
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
            <CardUserDetailsAdmin/>
        </div>
      </div>
    </>
  );
}
