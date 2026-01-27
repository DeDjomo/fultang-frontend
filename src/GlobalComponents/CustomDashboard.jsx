import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { AccessDenied } from "./AccessDenied.jsx";
import { useAuthentication } from "../Utils/Provider.jsx";
import { ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { Loading } from "./Loading.jsx";

export function CustomDashboard({ children, linkList, requiredRole }) {

    CustomDashboard.propTypes = {
        children: PropTypes.node.isRequired,
        linkList: PropTypes.array.isRequired,
        requiredRole: PropTypes.string.isRequired,
    }

    const { t } = useTranslation();
    const location = useLocation();
    const activeLink = location.pathname;
    const { isAuthenticated, hasRole } = useAuthentication();
    const [isLoading, setIsLoading] = useState(true);
    const [expandedLinks, setExpandedLinks] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Fonction pour obtenir le nom traduit
    const getTranslatedName = (item) => {
        if (item.nameKey) {
            return t(item.nameKey);
        }
        return item.name || '';
    };

    function toggleSubMenu(linkName) {
        setExpandedLinks(prev => ({
            ...prev,
            [linkName]: !prev[linkName]
        }));
    }


    function renderLink(item, index, isSubLink = false) {
        const IconComponent = item.icon;
        const displayName = getTranslatedName(item);

        // Find the most specific matching link from linkList
        const matchingLinks = linkList.filter(link =>
            activeLink === link.link || activeLink.startsWith(link.link + '/')
        );
        // Sort by length (longest path = most specific)
        const mostSpecificMatch = matchingLinks.sort((a, b) => b.link.length - a.link.length)[0];
        // Current item is active only if it's the most specific match
        const isActive = mostSpecificMatch?.link === item.link;

        const hasSubLinks = item.subLinks && item.subLinks.length > 0;



        return (
            <div key={index}>
                {!hasSubLinks ? (
                    <Link
                        className={`transition-all duration-400 flex p-3 items-center cursor-pointer ${isActive ? "bg-white rounded-l-full mb-2 mt-2" : "hover:bg-white/20 hover:rounded-l-full"} ${isSubLink ? "ml-4" : "ml-5"}`}
                        to={item.link}
                        onClick={() => setSidebarOpen(false)}
                    >
                        {IconComponent && (
                            <IconComponent
                                className={isActive ? "text-black text-xl mr-3 flex-shrink-0" : "text-xl mr-3 text-white flex-shrink-0"}
                            />
                        )}
                        <p className={`truncate ${isActive ? "text-black font-bold text-md" : "text-md font-bold text-white"}`}>
                            {displayName}
                        </p>
                    </Link>
                ) : (
                    <div
                        className="transition-all duration-400 flex p-3.5 items-center cursor-pointer ml-5 hover:bg-white/20 hover:rounded-l-full"
                        onClick={() => toggleSubMenu(displayName)}
                    >
                        {IconComponent && (
                            <IconComponent
                                className={isActive ? "text-black text-xl mr-3 flex-shrink-0" : "text-xl mr-3 text-white flex-shrink-0"}
                            />
                        )}
                        <p className={`truncate ${isActive ? "text-black font-bold text-md" : "text-md font-bold text-white"}`}>
                            {displayName}
                        </p>
                        {hasSubLinks && (expandedLinks[displayName] ? (
                            <ChevronUp className={`ml-auto flex-shrink-0 ${isActive ? "text-black" : "text-white"}`} />
                        ) : (
                            <ChevronDown className={`ml-auto flex-shrink-0 ${isActive ? "text-black" : "text-white"}`} />
                        )
                        )}
                    </div>
                )
                }
                {hasSubLinks && !expandedLinks[displayName] && (
                    <div className="ml-8 mt-2">
                        {item.subLinks.map((subItem, subIndex) => renderLink(subItem, subIndex, true))}
                    </div>
                )}
            </div>
        );
    }


    useEffect(() => {
        const checkAuth = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            setIsLoading(false);
        };
        checkAuth();
    }, []);




    if (isLoading) {
        return <Loading />
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }

    if (!hasRole(requiredRole)) {
        return <AccessDenied Role={requiredRole} />;
    }

    return (
        <div className="flex h-screen">
            {/* Bouton hamburger pour mobile */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg shadow-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay pour mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed h-screen bg-gradient-to-t from-primary-start to-primary-end flex flex-col overflow-y-auto scrollbar z-40
                transition-transform duration-300 ease-in-out
                w-64 lg:w-[18%] xl:w-[16%]
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <h1 className="text-2xl lg:text-3xl font-bold ml-6 mb-10 mt-7 text-white truncate">
                    Fultang Clinic
                </h1>
                <nav className="flex flex-col space-y-1.5 mb-2">
                    {linkList.map((item, index) => renderLink(item, index))}
                </nav>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 min-h-screen overflow-x-hidden lg:ml-[18%] xl:ml-[16%] w-full">
                {children}
            </div>
        </div>
    )
}

