import { FaHome, FaClipboardList, FaShoppingCart, FaBoxes, FaFileAlt, FaPills } from "react-icons/fa";
// Navigation links for Pharmacist - Updated 2025-12-26

export const PharmacistNavLink = [
    {
        name: "Tableau de bord",
        link: "/pharmacist/dashboard",
        icon: FaHome
    },
    {
        name: "Liste des médicaments",
        link: "/pharmacist/medication-list",
        icon: FaPills
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
