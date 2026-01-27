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
        nameKey: "sidebar.dashboard",
        icon: MdDashboard,
        link: appRoutes.accountantHome,
    },
    {
        nameKey: "sidebar.toValidate",
        icon: FaCheckCircle,
        link: '/accountant/quittances/a-valider',
    },
    {
        nameKey: "sidebar.validatedReceipts",
        icon: FaCheckDouble,
        link: '/accountant/quittances/validees',
    },
    {
        nameKey: "sidebar.accountingEntries",
        icon: FaFileAlt,
        link: '/accountant/ecritures',
    },
    {
        nameKey: "sidebar.balance",
        icon: FaBalanceScale,
        link: '/accountant/balance',
    },
    {
        nameKey: "sidebar.chartOfAccounts",
        icon: FaBookOpen,
        link: '/accountant/plan-comptable',
    },
    {
        nameKey: "sidebar.reports",
        icon: HiOutlineDocumentReport,
        link: '/accountant/rapports',
    },
    {
        nameKey: "sidebar.help",
        icon: MdHelpOutline,
        link: appRoutes.helpCenterPage,
    }
];
