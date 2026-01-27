import { FaHome } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";
import { Building2, Users, Stethoscope } from "lucide-react";

/**
 * Configuration de la navigation pour le dashboard administrateur.
 * Definit les liens de la sidebar avec leurs icones et routes.
 */
export const newAdminNavLink = [
    {
        nameKey: "sidebar.dashboard",
        link: appRoutes.adminHomePage,
        icon: FaHome,
    },
    {
        nameKey: "sidebar.services",
        icon: Building2,
        link: appRoutes.adminServicesPage,
    },
    {
        nameKey: "sidebar.staff",
        icon: Users,
        link: appRoutes.adminPersonnelPage,
    },
    {
        nameKey: "sidebar.rooms",
        icon: Stethoscope,
        link: appRoutes.adminChambresPage,
    },
];
