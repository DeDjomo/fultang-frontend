/**
 * MobileMenuToggle - Bouton hamburger pour ouvrir/fermer le sidebar sur mobile
 * 
 * Ce composant s'affiche automatiquement sur les écrans < 768px
 * et permet de toggle la classe 'sidebar-open' sur le body
 */
import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export function MobileMenuToggle() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        document.body.classList.toggle('sidebar-open', !isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
        document.body.classList.remove('sidebar-open');
    };

    // Fermer le menu lors du changement de route
    useEffect(() => {
        const handleRouteChange = () => closeMenu();
        window.addEventListener('popstate', handleRouteChange);

        // Fermer quand on clique sur l'overlay
        const handleOverlayClick = (e) => {
            if (e.target.classList.contains('sidebar-overlay')) {
                closeMenu();
            }
        };
        document.addEventListener('click', handleOverlayClick);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
            document.removeEventListener('click', handleOverlayClick);
        };
    }, []);

    // Fermer avec la touche Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeMenu();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    return (
        <>
            {/* Bouton hamburger */}
            <button
                onClick={toggleMenu}
                className="menu-toggle"
                aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
                {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            {/* Overlay pour fermer le menu */}
            {isOpen && <div className="sidebar-overlay" onClick={closeMenu} />}
        </>
    );
}

export default MobileMenuToggle;
