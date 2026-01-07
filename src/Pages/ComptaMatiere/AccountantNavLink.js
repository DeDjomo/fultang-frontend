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
    name: "Dashboard",
    link: appRoutes.comptaMatiereDashboard,
    icon: FaHome,
    description: "Overview of activities"
  },

  {
    name: "Emit Need",
    link: appRoutes.comptaMatiereEmitNeed,
    icon: FaClipboardList,
    description: "Create a material request"
  },

  {
    name: "Register Delivery",
    link: appRoutes.comptaMatiereRegisterDelivery,
    icon: FaTruck,
    description: "Record material reception"
  },

  {
    name: "Register Output",
    link: appRoutes.comptaMatiereRegisterOutput,
    icon: FaBoxOpen,
    description: "Record material output"
  },

  {
    name: "Reports",
    link: appRoutes.comptaMatiereReports,
    icon: FaChartLine,
    description: "View reports"
  },

  {
    name: "Material List",
    link: appRoutes.comptaMatiereMaterialList,
    icon: FaBoxes,
    description: "Available material inventory"
  },

  {
    name: "Output List",
    link: appRoutes.comptaMatiereOutputList,
    icon: FaListAlt,
    description: "Material output history"
  },
];
