import React from "react";
import { createPopper } from "@popperjs/core";
import SummaryApi from "api/common";

import { toast } from "react-toastify";

const NotificationDropdown = ({id}) => {
  // dropdown props
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();
  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "left-start",
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  const deleteComment = async () => {

    try {
      const response = await fetch(`${SummaryApi.deleteComment.url}/${id}`, {
        method: SummaryApi.deleteComment.method,
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
       toast.info("delete succesful")
      } else {
                toast.error(result.message);
        
      }
    } catch (error) {
      console.error("Error fetching like status:", error);
    }
  };
  return (
    <>
      <a
        className="text-blueGray-500 py-1 px-3"
        href="#pablo"
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <i className="fas fa-ellipsis-v"></i>
      </a>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? "block " : "hidden ") +
          "bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48"
        }
      >
        <a
          href="#pablo"
          className={
            "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
          }
          onClick={(e) => e.preventDefault()}
        >
          Modifier
        </a>
        <a
          href="#pablo"
          className={
            "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
          }
          onClick={(e) => {
            e.preventDefault();
            deleteComment(); 
          }}
        >
          Supprimer
        </a>
       
      </div>
    </>
  );
};

export default NotificationDropdown;
