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

export const ComptaMatiereNavLink = [
    {
        name: "Tableau de bord",
        link: appRoutes.comptaMatiereDashboard,
        icon: FaHome,
        description: "Vue d'ensemble des activités"
    },

    {
        name: "Émettre un besoin",
        link: appRoutes.comptaMatiereEmitNeed,
        icon: FaClipboardList,
        description: "Créer une demande de matériel"
    },

    {
        name: "Enregistrer une livraison",
        link: appRoutes.comptaMatiereRegisterDelivery,
        icon: FaTruck,
        description: "Enregistrer la réception de matériel"
    },

    {
        name: "Enregistrer une sortie",
        link: appRoutes.comptaMatiereRegisterOutput,
        icon: FaBoxOpen,
        description: "Enregistrer la sortie de matériel"
    },

    {
        name: "Rapports",
        link: appRoutes.comptaMatiereReports,
        icon: FaChartLine,
        description: "Consulter les rapports financiers"
    },

    {
        name: "Liste du matériel",
        link: appRoutes.comptaMatiereMaterialList,
        icon: FaBoxes,
        description: "Inventaire du matériel disponible"
    },

    {
        name: "Liste des sorties",
        link: appRoutes.comptaMatiereOutputList,
        icon: FaListAlt,
        description: "Historique des sorties de matériel"
    },
];
