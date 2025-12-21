import { FaQuestionCircle } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../../Router/appRouterPaths.js";
import { Calendar, Users } from "lucide-react";

export const doctorNavLink = [
    {
        name: 'Waiting Room',
        icon: Users,
        link: '/doctor/waiting-room',
    },
    {
        name: 'Appointments',
        icon: Calendar,
        link: appRoutes.doctorAppointment,
    },
    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
];