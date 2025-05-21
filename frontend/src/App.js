

import { Provider, useDispatch } from 'react-redux';
import React, { useEffect, useCallback, useState } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import Admin from "layouts/Admin.js";
import Auth from "layouts/Auth.js";

import Profile from "views/Profile.js";
import Index from "views/Index.js";
import Produits from "views/Produits";
import MesReclamation from "views/mes-réclamations";
import DétailsReclamtion from "views/détails-réclamations";
import AddReclamation from "views/AddReclamation";
import Service from "views/Service";
import RépReclamation from "views/reponse-réclamations";
import DétailsProd from "views/DétailsProd";
import DétailsService from "views/DétailsService";
import SummaryApi from './api/common';
import { setUserDetails } from './store/userSlice';
import Context from './context';
import AddReclamationProd from 'views/AddReclamationProd';
import Chat from 'views/Chat/Chat';
import ProfileUsers from 'views/ProfileUsers';
import WhiteBoardVideoRoom from 'components/componentsVideo/WhiteboardVideoRoom';
import VideoRoomPPT from 'components/componentsVideo/VideoRoomPPT';
import VideoRoom from 'components/componentsVideo/VideoRoom';
import Whiteboard from 'components/componentsVideo/Whiteboard';
import AudioRoom from 'components/componentsVideo/Mic';
import PptViewer from 'components/componentsVideo/PptViewer';
import Audio from 'components/componentsVideo/Audio';
import CalendrierFront from 'views/CalendrierFront';
import CalendrierFrontClient from 'views/CalendrierFrontClient';
import CalendrierFrontAdmin from 'views/CalendrierFrontAdmin';
import ProtectedRouteConnect from 'helpers/ProtectedRouteConnect';
import ProtectedAdminRoute from 'helpers/ProtectedRoute';
const App = () => {
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    const msg = args.join(' ');
    if (!msg.includes('User-Initiated Abort')) {
      originalConsoleLog(...args);
    }
  };
  const dispatch = useDispatch();
  const [Email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const fetchUserDetails = useCallback(async () => {
    try {

      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: 'include'
      });


      const dataApi = await response.json();

      if (dataApi.success) {
        dispatch(setUserDetails(dataApi.data));
      } else {
        console.error("API returned an error:", dataApi.message);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, [dispatch]);



  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]); // ✅ Now stable across renders

  return (
    <Context.Provider value={{ fetchUserDetails, otp, setOTP, setEmail, Email }}>
      <BrowserRouter>
        <Switch>
          <ProtectedAdminRoute path="/admin" component={Admin} />

          <Route path="/auth" component={Auth} />
          <Route path="/services" exact component={Service} />
          <ProtectedRouteConnect path="/mes-réclamations" exact component={MesReclamation} />
          <ProtectedRouteConnect path="/réponse-réclamations/:id" exact component={RépReclamation} />
          <ProtectedRouteConnect path="/détails-réclamations/:id" exact component={DétailsReclamtion} />
          <ProtectedRouteConnect path="/Envoyer-réclamation/:id" exact component={AddReclamation} />
          <ProtectedRouteConnect path="/Envoyer-réclamation-produit/:id" exact component={AddReclamationProd} />
          <Route path="/produits" exact component={Produits} />
          <Route path="/détails-produit/:id" exact component={DétailsProd} />
          <Route path="/détails-service/:id" exact component={DétailsService} />
          <ProtectedRouteConnect path="/chat" exact component={Chat} />
          <ProtectedRouteConnect path="/profile" exact component={Profile} />
          <ProtectedRouteConnect path="/ProfileUsers/:id" exact component={ProfileUsers} />
          <Route path="/" exact component={Index} />
          <ProtectedRouteConnect path="/calendrierFournisseur" exact component={CalendrierFront} />
          <ProtectedRouteConnect path="/calendrierAdmin" exact component={CalendrierFrontAdmin} />
          <ProtectedRouteConnect path="/calendrierClient" exact component={CalendrierFrontClient} />


          <ProtectedRouteConnect path="/video-call-whiteboard" exact component={WhiteBoardVideoRoom} />
          <ProtectedRouteConnect path="/video-call-ppt-viewer" exact component={VideoRoomPPT} />
          <ProtectedRouteConnect path="/whiteboard/:roomId" exact component={Whiteboard} />
          <ProtectedRouteConnect path="/mic" exact component={AudioRoom} />
          <ProtectedRouteConnect path="/ppt/:roomId" exact component={<PptViewer />} />
          <ProtectedRouteConnect path='/whiteboardvideo/:roomId' exact component={WhiteBoardVideoRoom} />
          <ProtectedRouteConnect path='/audio' exact component={Audio} />
          <ProtectedRouteConnect path='/video' exact component={VideoRoom} />

          <Redirect from="*" to="/" />
        </Switch>
      </BrowserRouter>
    </Context.Provider>
  );
};
export default App;
