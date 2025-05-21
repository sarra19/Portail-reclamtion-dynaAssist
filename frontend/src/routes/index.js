import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Admin from '../layouts/Admin'; // Assuming Admin is a layout component
import Auth from '../layouts/Auth'; // Assuming Auth is a layout component
import Service from '../views/Service';
import MesReclamation from '../views/mes-réclamations';
import RépReclamation from '../views/reponse-réclamations';
import DétailsReclamtion from '../views/détails-réclamations';
import AddReclamation from '../views/AddReclamation';
import Produits from '../views/Produits';
import DétailsProd from '../views/DétailsProd';
import DétailsService from '../views/DétailsService';
import Chat from '../views/Chat';
import Profile from '../views/Profile';
import Index from '../views/Index';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Index />,
      },
      {
        path: '/admin',
        element: <Admin />,
        children: [
        ],
      },
      {
        path: '/auth',
        element: <Auth />, 
        children: [
        ],
      },
      {
        path: '/services',
        element: <Service />,
      },
      {
        path: '/mes-réclamations',
        element: <MesReclamation />,
      },
      {
        path: '/réponse-réclamations',
        element: <RépReclamation />,
      },
      {
        path: '/détails-réclamations',
        element: <DétailsReclamtion />,
      },
      {
        path: '/Envoyer-réclamation/:id',
        element: <AddReclamation />,
      },
      {
        path: '/produits',
        element: <Produits />,
      },
      {
        path: '/détails-produit',
        element: <DétailsProd />,
      },
      {
        path: '/détails-service/:id',
        element: <DétailsService />,
      },
      {
        path: '/chat',
        element: <Chat />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      
    ],
  },
]);

export default router;