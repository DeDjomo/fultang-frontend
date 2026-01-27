import { FaSignOutAlt, FaBell } from "react-icons/fa";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { useAuthentication } from "../../Utils/Provider.jsx";
import userIcon from "../../assets/userIcon.png";
import { AppRoutesPaths } from "../../Router/appRouterPaths.js";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "../../GlobalComponents/LanguageSwitcher.jsx";

export function LaboratoryNavBar() {
    const { logout, userData } = useAuthentication();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Fonction pour obtenir le nom complet de l'utilisateur
    const getUserDisplayName = () => {
        if (userData?.nom || userData?.prenom) {
            return `${userData.prenom || ''} ${userData.nom || ''}`.trim();
        }
        if (userData?.username) {
            return userData.username;
        }
        if (userData?.email) {
            return userData.email.split('@')[0];
        }
        return t('navbar.laboratory');
    };

    const applyNavLinkBtnStyle = () => {
        return "w-10 h-9 md:w-12 md:h-10 mt-1 border-2 bg-gray-100 flex justify-center items-center rounded-xl shadow-xl hover:bg-secondary text-secondary text-lg md:text-xl hover:text-white transition-all duration-300";
    }

    return (
        <div className="border-b-2 m-2 md:m-3 border-b-gray-300">
            <div className="w-full min-h-[60px] md:h-[70px] flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 py-2 md:py-0">
                <h1 className="ml-0 md:ml-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl text-secondary mt-1 md:mt-3.5 font-bold text-center md:text-left pl-12 lg:pl-0">
                    {t('laboratory.title')}
                </h1>
                <div className="flex flex-wrap gap-2 md:gap-3 mt-1 md:mt-3.5 mb-2 md:mb-4 mr-2 md:mr-5 justify-center md:justify-end items-center">
                    <Tooltip placement={"top"} title={t('laboratory.notifications')}>
                        <button
                            onClick={
                                () => { navigate(AppRoutesPaths.laboratoryNotification) }
                            }
                            className={applyNavLinkBtnStyle()}>
                            <FaBell />
                        </button>
                    </Tooltip>
                    <LanguageSwitcher />
                    <Tooltip placement={"top"} title={t('navbar.logout')}>
                        <button
                            onClick={() => { logout() }}
                            className="w-10 h-9 md:w-12 md:h-10 mt-1 border-2 bg-red-400 flex justify-center items-center rounded-xl shadow-xl hover:bg-white text-white text-lg md:text-xl hover:text-red-500 transition-all duration-300"
                        >
                            <FaSignOutAlt />
                        </button>
                    </Tooltip>
                    <Tooltip placement={"top"} title={t('navbar.profile')}>
                        <div className="ml-1 md:ml-3 flex items-center">
                            <p className="font-bold text-secondary text-sm sm:text-base md:text-lg lg:text-xl mt-0 md:mt-2 hidden sm:block truncate max-w-[150px] md:max-w-[200px] lg:max-w-none">
                                {t('common.hello') + " " + getUserDisplayName() + "!"}
                            </p>
                            <img src={userIcon} alt={"user-icon"} className="w-9 h-9 md:w-12 md:h-12 ml-1 md:ml-2 mr-1 md:mr-3" />
                        </div>
                    </Tooltip>
                </div>
            </div>
        </div>
    )
}