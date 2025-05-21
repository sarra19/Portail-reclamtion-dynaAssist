import { Buffer } from 'buffer';
import process from 'process';
import React, { useEffect, useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store';

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";

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
          <Route path="/admin" component={Admin} />

          <Route path="/auth" component={Auth} />
          <Route path="/services" exact component={Service} />
          <Route path="/mes-réclamations" exact component={MesReclamation} />
          <Route path="/réponse-réclamations/:id" exact component={RépReclamation} />
          <Route path="/détails-réclamations/:id" exact component={DétailsReclamtion} />
          <Route path="/Envoyer-réclamation/:id" exact component={AddReclamation} />
          <Route path="/Envoyer-réclamation-produit/:id" exact component={AddReclamationProd} />
          <Route path="/produits" exact component={Produits} />
          <Route path="/détails-produit/:id" exact component={DétailsProd} />
          <Route path="/détails-service/:id" exact component={DétailsService} />
          <Route path="/chat" exact component={Chat} />
          <Route path="/profile" exact component={Profile} />
          <Route path="/ProfileUsers/:id" exact component={ProfileUsers} />
          <Route path="/" exact component={Index} />
          <Route path="/calendrierFournisseur" exact component={CalendrierFront} />
          <Route path="/calendrierAdmin" exact component={CalendrierFrontAdmin} />
          <Route path="/calendrierClient" exact component={CalendrierFrontClient} />


          <Route path="/video-call-whiteboard" exact component={WhiteBoardVideoRoom} />
          <Route path="/video-call-ppt-viewer" exact component={VideoRoomPPT} />
          <Route path="/whiteboard/:roomId" exact component={Whiteboard} />
          <Route path="/mic" exact component={AudioRoom} />
          <Route path="/ppt/:roomId" exact component={<PptViewer />} />
          <Route path='/whiteboardvideo/:roomId' exact component={WhiteBoardVideoRoom} />
          <Route path='/audio' exact component={Audio} />
          <Route path='/video' exact component={VideoRoom} />

          <Redirect from="*" to="/" />
        </Switch>
      </BrowserRouter>
    </Context.Provider>
  );
};


global.Buffer = Buffer;
global.process = process;
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
