import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths";
import {
  FaHome,
  FaClipboardList,
  FaTruck,
  FaBoxOpen,
  FaChartLine,
  FaBoxes,
  FaListAlt,
  FaArchive,
} from "react-icons/fa";

export const AccountantNavLink = [
  {
    nameKey: "sidebar.dashboard",
    link: appRoutes.comptaMatiereDashboard,
    icon: FaHome,
  },

  {
    nameKey: "sidebar.emitNeed",
    link: appRoutes.comptaMatiereEmitNeed,
    icon: FaClipboardList,
  },

  {
    nameKey: "sidebar.registerDelivery",
    link: appRoutes.comptaMatiereRegisterDelivery,
    icon: FaTruck,
  },

  {
    nameKey: "sidebar.registerOutput",
    link: appRoutes.comptaMatiereRegisterOutput,
    icon: FaBoxOpen,
  },

  {
    nameKey: "sidebar.inventoryArchives",
    link: appRoutes.comptaMatiereInventoryArchives,
    icon: FaArchive,
  },

  {
    nameKey: "sidebar.reports",
    link: appRoutes.comptaMatiereReports,
    icon: FaChartLine,
  },

  {
    nameKey: "sidebar.materialList",
    link: appRoutes.comptaMatiereMaterialList,
    icon: FaBoxes,
  },

  {
    nameKey: "sidebar.outputsList",
    link: appRoutes.comptaMatiereOutputList,
    icon: FaListAlt,
  },
];
