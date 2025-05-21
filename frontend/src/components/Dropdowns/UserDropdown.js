import React, { useEffect, useState } from "react";
import { createPopper } from "@popperjs/core";
import SummaryApi from "api/common";

import {useHistory } from "react-router-dom";
import { toast } from "react-toastify";

const UserDropdown = () => {
  // dropdown props
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setCurrentUser(result.data);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };
  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start",
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(SummaryApi.deleteUser.url, {
        method: SummaryApi.deleteUser.method, // DELETE is the correct method for deletion
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          No_: id  // Pass the correct user identifier (e.g., No_)
        })
      });
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
  
      const dataResponse = await response.json();
      toast.success("Utilisateur supprimé avec succès");
      
history.push("/auth/login")  
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

  }, []);
  return (
    <>
      <a
        className="text-blueGray-500 block"
        href="#pablo"
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        {currentUser && (
        <div className="items-center flex">
          <span className=" ml-2 w-12 h-12 text-sm text-white bg-blueGray-200 inline-flex items-center justify-center rounded-full">
           <img
              alt="..."
              className="w-full rounded-full align-middle border-none shadow-lg"
              src={currentUser.ProfileImage}
            />
       
          </span>
        </div>
           )
          }
      </a>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? "block " : "hidden ") +
          "bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48"
        }
      >
        <a
          href="/profile"
          className={
            "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
          }
        >
          Profile
        </a>
      
        <a
          href="#pablo"
          className={
            "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-red-500"
          }
         onClick={() => {
  if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) {
    handleDelete(currentUser.No_);
  }
}}

        >
          Supprimer mon compte
        </a>
      
       
      </div>
    </>
  );
};

export default UserDropdown;
