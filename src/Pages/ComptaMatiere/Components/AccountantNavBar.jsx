import { Settings, Mail, LogOut, User } from "lucide-react";
import { Tooltip } from "antd";
import { useAuthentication } from "../../../Utils/Provider.jsx";
import userIcon from "../../../assets/userIcon.png";
import { useState } from "react";
import { SettingsModal } from "../../../GlobalComponents/SettingsModal.jsx";
import { useNavigate } from "react-router-dom";
import { AppRoutesPaths } from "../../../Router/appRouterPaths.js";

export function AccountantNavBar() {
  const { logout, userData } = useAuthentication();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const applyNavLinkBtnStyle = () => {
    return " w-12 h-10 mt-1 border-2 bg-gray-100 flex justify-center items-center rounded-xl shadow-xl hover:bg-secondary text-secondary hover:text-white transition-all duration-300";
  };

  return (
    <>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <div className="border-b-2 m-3 border-b-gray-300">
        <div className="w-full h-[70px] flex justify-between">
          <h1 className="ml-7 text-4xl text-secondary mt-3.5 font-bold">
            Material Accountant
          </h1>
          <div className="flex gap-3 mt-3.5 mb-4 mr-5">
            <Tooltip placement={"top"} title={"Settings"}>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={applyNavLinkBtnStyle()}
              >
                <Settings className="w-5 h-5" />
              </button>
            </Tooltip>

            <Tooltip placement={"top"} title={"Messages / Reports"}>
              <button
                onClick={() => navigate(AppRoutesPaths.comptaMatiereReports)}
                className={applyNavLinkBtnStyle()}
              >
                <Mail className="w-5 h-5" />
              </button>
            </Tooltip>
            <Tooltip placement={"top"} title={"Log Out"}>
              <button
                onClick={() => {
                  logout();
                }}
                className={
                  " w-12 h-10 mt-1 border-2 bg-red-400 flex justify-center items-center rounded-xl shadow-xl hover:bg-white text-white hover:text-red-500 transition-all duration-300"
                }
              >
                <LogOut className="w-5 h-5" />
              </button>
            </Tooltip>
            <Tooltip placement={"top"} title={"Profile"}>
              <button className="ml-3 flex">
                <p className="font-bold text-secondary text-xl mt-2">
                  {"Hello " + userData?.username + "!"}
                </p>
                <img
                  src={userIcon}
                  alt={"user-icon"}
                  className="w-12 h-12 ml-2 mr-3"
                />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
}
