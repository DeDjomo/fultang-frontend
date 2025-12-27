/**
 * Navigation Links for Accountant Module
 * Following the same pattern as Cashier navLinks
 */
import { MdDashboard, MdHelpOutline } from "react-icons/md";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FaBookOpen, FaCheckCircle, FaCheckDouble, FaFileAlt, FaBalanceScale } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";

export const accountantNavLink = [
    {
        name: 'Dashboard',
        icon: MdDashboard,
        link: appRoutes.accountantHome,
    },
    {
        name: 'À Valider',
        icon: FaCheckCircle,
        link: '/accountant/quittances/a-valider',
    },
    {
        name: 'Quittances Validées',
        icon: FaCheckDouble,
        link: '/accountant/quittances/validees',
    },
    {
        name: 'Écritures Comptables',
        icon: FaFileAlt,
        link: '/accountant/ecritures',
    },
    {
        name: 'Balance',
        icon: FaBalanceScale,
        link: '/accountant/balance',
    },
    {
        name: 'Plan Comptable',
        icon: FaBookOpen,
        link: '/accountant/plan-comptable',
    },
    {
        name: 'Rapports',
        icon: HiOutlineDocumentReport,
        link: '/accountant/rapports',
    },
    {
        name: 'Help Center',
        icon: MdHelpOutline,
        link: appRoutes.helpCenterPage,
    }
];
