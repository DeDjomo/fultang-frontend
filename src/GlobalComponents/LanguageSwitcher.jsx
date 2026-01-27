import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Composant de sélection de langue avec drapeaux.
 * Permet de basculer entre l'anglais et le français.
 * La préférence est sauvegardée automatiquement dans localStorage.
 * 
 * Style: Bouton avec drapeau de la langue actuelle, dropdown pour changer
 */
export function LanguageSwitcher({ className = "" }) {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
    ];

    // Déterminer la langue actuelle (fallback sur français)
    const getCurrentLanguage = () => {
        const currentCode = i18n.language?.substring(0, 2) || 'fr';
        return languages.find(lang => lang.code === currentCode) || languages[0];
    };

    const currentLanguage = getCurrentLanguage();

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    // Fermer le dropdown si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Bouton principal avec drapeau */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-10 mt-1 border-2 bg-gray-100 flex justify-center items-center rounded-xl shadow-xl hover:bg-secondary text-secondary text-2xl hover:text-white transition-all duration-300"
                aria-label="Changer de langue"
                title={`Langue: ${currentLanguage.name}`}
            >
                <span>{currentLanguage.flag}</span>
            </button>

            {/* Dropdown avec les langues disponibles */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            onClick={() => changeLanguage(language.code)}
                            className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors ${i18n.language?.startsWith(language.code) ? 'bg-blue-50' : ''
                                }`}
                        >
                            <span className="text-xl">{language.flag}</span>
                            <span className="text-sm font-medium text-gray-700">
                                {language.name}
                            </span>
                            {i18n.language?.startsWith(language.code) && (
                                <span className="ml-auto text-secondary font-bold">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LanguageSwitcher;
