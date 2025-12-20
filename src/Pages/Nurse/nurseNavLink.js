import { FaQuestionCircle } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";
import { Calendar, Users } from "lucide-react";

export const nurseNavLink = [
    {
        name: 'Salle d\'attente',
        icon: Users,
        link: appRoutes.nurseWaitingRoomPage,
    },
    {
        name: 'Rendez-vous',
        icon: Calendar,
        link: appRoutes.nurseAppointmentsPage,
    },
    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
];