import { FaHome, FaClipboardList, FaShoppingCart, FaBoxes, FaFileAlt, FaPills, FaPrescriptionBottleAlt } from "react-icons/fa";

export const PharmacistNavLink = [
    {
        nameKey: "sidebar.dashboard",
        link: "/pharmacist/dashboard",
        icon: FaHome
    },
    {
        nameKey: "sidebar.prescriptions",
        link: "/pharmacist/prescriptions",
        icon: FaPrescriptionBottleAlt
    },
    {
        nameKey: "sidebar.medicationList",
        link: "/pharmacist/medication-list",
        icon: FaPills
    },
    {
        nameKey: "sidebar.emitNeed",
        link: "/pharmacist/emit-need",
        icon: FaClipboardList
    },
    {
        nameKey: "sidebar.dailySales",
        link: "/pharmacist/daily-sales",
        icon: FaShoppingCart
    },
    {
        nameKey: "sidebar.inventory",
        link: "/pharmacist/inventory",
        icon: FaBoxes
    },
    {
        nameKey: "sidebar.reports",
        link: "/pharmacist/reports",
        icon: FaFileAlt
    }
];
