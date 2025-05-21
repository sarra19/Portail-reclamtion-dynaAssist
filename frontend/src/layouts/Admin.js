import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views

import Dashboard from "views/admin/Dashboard.js";
import Maps from "views/admin/Maps.js";
import Settings from "views/admin/Settings.js";
import Tables from "views/admin/Tables.js";


import AddUsers from "views/admin/User/AddUser";
import Users from "views/admin/User/Users";
import DetailsUsers from "views/admin/User/DetailsUsers";
import ModifytUsers from "views/admin/User/ModifyUsers";
import Produits from "views/admin/Produits/Produits";
import Services from "views/admin/Service/Services";
import Interventions from "views/admin/Intervention/Interventions";
import Remboursements from "views/admin/Remboursement/Remboursements";
import Historique from "views/admin/Historique/Historique";
import Réclamations from "views/admin/Réclamation/Réclamations";
import AddReclamationAdmin from "views/admin/Réclamation/AddReclamationAdmin";
import AddProduit from "views/admin/Produits/AddProduit";
import AddService from "views/admin/Service/AddService";
import ModifyProduit from "views/admin/Produits/ModifyProduit";
import ModifyService from "views/admin/Service/ModifyService";
import ModifyRép from "views/admin/Réponse/ModifyReponse";
import DétailsService from "views/admin/Service/DétailsService";
import ModifyRemb from "views/admin/Remboursement/ModifyRemb";
import DétailsRemb from "views/admin/Remboursement/DétailsRemb";
import DétailsInterv from "views/admin/Intervention/DétailsInterv";
import DétailsHistorique from "views/admin/Historique/DétailsHistorique";
import DetailsProd from "views/admin/Produits/DetailsProd";
import DetailsRéc from "views/admin/Réclamation/DetailsRéc";
import CalendrierInterv from "views/admin/Intervention/CalendrierInterv";
import RemboursementCalendrier from "views/admin/Remboursement/RemboursementCalendrier";

export default function Admin() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <Switch>
            <Route path="/admin/dashboard" exact component={Dashboard} />

            <Route path="/admin/users" exact component={Users} />
            <Route path="/admin/add-users" exact component={AddUsers} />
            <Route path="/admin/users/modify-users/:id" exact component={ModifytUsers} />
            <Route path="/admin/delete-users" exact component={AddUsers} />
            <Route path="/admin/details-users/:id" exact component={DetailsUsers} />


            <Route path="/admin/réclamation" exact component={Réclamations} />
            <Route path="/admin/add-réclamation" exact component={AddReclamationAdmin} />
            <Route path="/admin/delete-réclamation" exact component={AddUsers} />
            <Route path="/admin/details-réclamation/:id" exact component={DetailsRéc} />

            <Route path="/admin/produit" exact component={Produits} />
            <Route path="/admin/add-produit" exact component={AddProduit} />
            <Route path="/admin/modify-produit/:id" exact component={ModifyProduit} />
            <Route path="/admin/détails-produit/:id" exact component={DetailsProd} />

            <Route path="/admin/service" exact component={Services} />
            <Route path="/admin/add-service" exact component={AddService} />
            <Route path="/admin/modify-service/:id" exact component={ModifyService} />
            <Route path="/admin/détails-service/:id" exact component={DétailsService} />

            <Route path="/admin/intervention" exact component={Interventions} />
            <Route path="/admin/détails-intervention/:id" exact component={DétailsInterv} />
            <Route path="/admin/calendrier" exact component={CalendrierInterv} />
            <Route path="/admin/remb-calendrier" exact component={RemboursementCalendrier} />

            <Route path="/admin/remboursement" exact component={Remboursements} />
            <Route path="/admin/modify-remboursement" exact component={ModifyRemb} />
            <Route path="/admin/détails-remboursement/:id" exact component={DétailsRemb} />

            <Route path="/admin/historique" exact component={Historique} />
            <Route path="/admin/details-history/:id" exact component={DétailsHistorique} />

            <Route path="/admin/modify-réponse" exact component={ModifyRép} />



            <Route path="/admin/maps" exact component={Maps} />
            <Route path="/admin/settings" exact component={Settings} />
            <Route path="/admin/tables" exact component={Tables} />
            <Redirect from="/admin" to="/admin/dashboard" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
