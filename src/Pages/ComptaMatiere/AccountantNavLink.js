import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths";
import {
  FaHome,
  FaClipboardList,
  FaTruck,
  FaBoxOpen,
  FaChartLine,
  FaBoxes,
  FaListAlt,
} from "react-icons/fa";

export const AccountantNavLink = [
  {
    name: "Tableau de bord",
    link: appRoutes.accountantPage,
    icon: FaHome,
    description: "Vue d'ensemble des activités"
  },

  {
    name: "Émettre un besoin",
    link: appRoutes.accountantEmitNeed,
    icon: FaClipboardList,
    description: "Créer une demande de matériel"
  },

  {
    name: "Enregistrer une livraison",
    link: appRoutes.accountantRegisterDelivery,
    icon: FaTruck,
    description: "Enregistrer la réception de matériel"
  },

  {
    name: "Enregistrer une sortie",
    link: appRoutes.accountantRegisterOutput,
    icon: FaBoxOpen,
    description: "Enregistrer la sortie de matériel"
  },

  {
    name: "Rapports",
    link: appRoutes.accountantReports,
    icon: FaChartLine,
    description: "Consulter les rapports financiers"
  },

  {
    name: "Liste du matériel",
    link: appRoutes.accountantMaterialList,
    icon: FaBoxes,
    description: "Inventaire du matériel disponible"
  },

  {
    name: "Liste des sorties",
    link: appRoutes.accountantOutputList,
    icon: FaListAlt,
    description: "Historique des sorties de matériel"
  },
];
