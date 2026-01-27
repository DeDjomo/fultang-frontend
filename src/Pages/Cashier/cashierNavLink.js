import { MdPending, MdHelpOutline } from "react-icons/md";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";
import { FaHistory } from "react-icons/fa";

export const cashierNavLink = [
    {
        nameKey: "sidebar.patientList",
        icon: MdPending,
        link: appRoutes.cashierPage,
    },
    {
        nameKey: "sidebar.financialHistory",
        icon: FaHistory,
        link: appRoutes.financialHistory,
    },
    {
        nameKey: "sidebar.financialReport",
        icon: HiOutlineDocumentReport,
        link: appRoutes.financialReport,
    },
    {
        nameKey: "sidebar.help",
        icon: MdHelpOutline,
        link: appRoutes.helpCenterPage,
    }
];