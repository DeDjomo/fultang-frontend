import { Calendar, Users, BedDouble } from "lucide-react";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";
import { FaQuestionCircle } from "react-icons/fa";

export const receptionistNavLink = [
    {
        nameKey: "sidebar.patientList",
        icon: Users,
        link: appRoutes.receptionistPage,
    },
    {
        nameKey: "sidebar.hospitalized",
        icon: BedDouble,
        link: appRoutes.hospitalizedPatientsPage,
    },
    {
        nameKey: "sidebar.appointments",
        icon: Calendar,
        link: appRoutes.appointmentsPage,
    },
    {
        nameKey: "sidebar.help",
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
];