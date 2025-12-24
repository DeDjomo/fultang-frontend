import { FaQuestionCircle } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../../Router/appRouterPaths.js";
import { ClipboardList, History, FileText, ShoppingCart } from "lucide-react";

export const pharmacyNavLink = [
    {
        name: 'Pending Prescriptions',
        icon: ClipboardList,
        link: '/pharmacy',
    },
    {
        name: 'All Prescriptions',
        icon: History,
        link: '/pharmacy/history',
    },
    {
        name: 'Reports',
        icon: FileText,
        link: '/pharmacy/reports',
    },
    {
        name: 'Needs',
        icon: ShoppingCart,
        link: '/pharmacy/needs',
    },
    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
];
