import { FaHome, FaUserMd, FaUsers, FaPlus, FaListAlt, FaPills } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";
import { BedDouble } from "lucide-react";
import { MdMedicalServices } from "react-icons/md";

export const adminNavLink = [
    {
        nameKey: "sidebar.dashboard",
        link: appRoutes.adminHomePage,
        icon: FaHome,
    },
    {
        nameKey: "sidebar.patientList",
        icon: FaUsers,
        link: appRoutes.adminPatientListPage,
    },
    {
        nameKey: "sidebar.medicalStaffs",
        icon: FaUserMd,
        subLinks: [
            {
                icon: FaUsers,
                nameKey: "sidebar.medicalStaffList",
                link: appRoutes.adminMedicalStaffListPage
            },
            {
                icon: FaPlus,
                nameKey: "sidebar.addMedicalStaff",
                link: appRoutes.addMedicalStaff
            }
        ]
    },
    {
        nameKey: "sidebar.exams",
        icon: MdMedicalServices,
        subLinks: [
            {
                icon: FaListAlt,
                nameKey: "sidebar.examsList",
                link: appRoutes.adminExamsListPage,
            },
            {
                icon: FaPlus,
                nameKey: "sidebar.addExam",
                link: appRoutes.addExam
            }
        ]

    },
    {
        nameKey: "sidebar.drugs",
        icon: FaPills,
        subLinks: [
            {
                icon: FaListAlt,
                nameKey: "sidebar.drugsList",
                link: appRoutes.adminDrugsListPage,
            },
            {
                icon: FaPlus,
                nameKey: "sidebar.addDrug",
                link: appRoutes.addDrug
            }
        ]

    },
    {
        nameKey: "sidebar.hospitalRooms",
        icon: BedDouble,
        link: appRoutes.adminHospitalRoomPage
    },
];