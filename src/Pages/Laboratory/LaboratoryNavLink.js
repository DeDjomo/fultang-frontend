import { FaBell, FaHistory, FaHome, FaQuestionCircle } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";
import { FiList } from "react-icons/fi";
import { UserPlus } from "lucide-react";

export const laboratoryNavLink = [
    {
        nameKey: "sidebar.dashboard",
        link: appRoutes.laboratoryAssistantPage,
        icon: FaHome,
    },
    {
        nameKey: "sidebar.patientList",
        link: appRoutes.laboratoryPatientList,
        icon: UserPlus,
    },
    {
        icon: FiList,
        nameKey: "sidebar.examsList",
        link: appRoutes.laboratoryExamenList
    },
    {
        icon: FaHistory,
        nameKey: "sidebar.examHistory",
        link: appRoutes.laboratoryExamenHistories
    },
    {
        icon: FaBell,
        nameKey: "sidebar.notifications",
        link: appRoutes.laboratoryNotification
    },
    {
        nameKey: "sidebar.help",
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    },
];