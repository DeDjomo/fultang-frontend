import { FaQuestionCircle } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../../Router/appRouterPaths.js";
import { Calendar, Users } from "lucide-react";

export const doctorNavLink = [
    {
        nameKey: "sidebar.waitingRoom",
        icon: Users,
        link: '/doctor/waiting-room',
    },
    {
        nameKey: "sidebar.appointments",
        icon: Calendar,
        link: appRoutes.doctorAppointment,
    },
    {
        nameKey: "sidebar.help",
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
];