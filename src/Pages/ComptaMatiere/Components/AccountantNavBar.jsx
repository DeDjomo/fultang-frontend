import { FaSignOutAlt } from "react-icons/fa";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { useAuthentication } from "../../../Utils/Provider.jsx";
import userIcon from "../../../assets/userIcon.png";
import { LanguageSwitcher } from "../../../GlobalComponents/LanguageSwitcher.jsx";

export function AccountantNavBar() {
  const { logout, userData } = useAuthentication();
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
    return t('navbar.accountant');
  };

  return (
    <>
      <div className="border-b-2 m-2 md:m-3 border-b-gray-300">
        <div className="w-full min-h-[60px] md:h-[70px] flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 py-2 md:py-0">
          <h1 className="ml-0 md:ml-7 text-xl sm:text-2xl md:text-3xl lg:text-4xl text-secondary mt-1 md:mt-3.5 font-bold text-center md:text-left pl-12 lg:pl-0">
            {t('comptaMatiere.title')}
          </h1>
          <div className="flex flex-wrap gap-2 md:gap-3 mt-1 md:mt-3.5 mb-2 md:mb-4 mr-2 md:mr-5 justify-center md:justify-end items-center">
            <LanguageSwitcher />
            <Tooltip placement={"top"} title={t('navbar.logout')}>
              <button
                onClick={() => {
                  logout();
                }}
                className="w-10 h-9 md:w-12 md:h-10 mt-1 border-2 bg-red-400 flex justify-center items-center rounded-xl shadow-xl hover:bg-white text-white text-lg md:text-xl hover:text-red-500 transition-all duration-300"
              >
                <FaSignOutAlt />
              </button>
            </Tooltip>
            <Tooltip placement={"top"} title={t('navbar.profile')}>
              <button className="ml-1 md:ml-3 flex items-center">
                <p className="font-bold text-secondary text-sm sm:text-base md:text-lg lg:text-xl mt-0 md:mt-2 hidden sm:block truncate max-w-[150px] md:max-w-[200px] lg:max-w-none">
                  {t('common.hello') + " " + getUserDisplayName() + "!"}
                </p>
                <img
                  src={userIcon}
                  alt={"user-icon"}
                  className="w-9 h-9 md:w-12 md:h-12 ml-1 md:ml-2 mr-1 md:mr-3"
                />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
}
