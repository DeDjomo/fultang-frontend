import { FaQuestionCircle } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";
import { Calendar, Users } from "lucide-react";

export const nurseNavLink = [
    {
        nameKey: "sidebar.waitingRoom",
        icon: Users,
        link: appRoutes.nurseWaitingRoomPage,
    },
    {
        nameKey: "sidebar.appointments",
        icon: Calendar,
        link: appRoutes.nurseAppointmentsPage,
    },
    {
        nameKey: "sidebar.help",
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
];