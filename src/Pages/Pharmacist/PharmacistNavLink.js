import { FaHome, FaClipboardList, FaShoppingCart, FaBoxes, FaFileAlt } from "react-icons/fa";

export const PharmacistNavLink = [
    {
        name: "Tableau de bord",
        link: "/pharmacist/dashboard",
        icon: FaHome
    },
    {
        name: "Émettre un besoin",
        link: "/pharmacist/emit-need",
        icon: FaClipboardList
    },
    {
        name: "Ventes du jour",
        link: "/pharmacist/daily-sales",
        icon: FaShoppingCart
    },
    {
        name: "Inventaire",
        link: "/pharmacist/inventory",
        icon: FaBoxes
    },
    {
        name: "Rapports",
        link: "/pharmacist/reports",
        icon: FaFileAlt
    }
];
