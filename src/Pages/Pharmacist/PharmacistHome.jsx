import { PharmacistDashBoard } from "./Components/PharmacistDashboard";
import { PharmacistNavLink } from "./PharmacistNavLink";
import { PharmacistNavBar } from "./Components/PharmacistNavBar";
import { useState, useEffect } from "react";
import {
    FaHome,
    FaPills,
    FaShoppingCart,
    FaExclamationTriangle,
    FaClipboardList,
    FaChartLine,
    FaSpinner,
    FaSyncAlt
} from "react-icons/fa";
import PropTypes from "prop-types";
import { materielMedicalApi, sortieApi } from "../../services/comptabiliteMatiereApi";

export function PharmacistHome() {
    // États
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [medications, setMedications] = useState([]);
    const [dailySales, setDailySales] = useState([]);

    // Charger les données depuis l'API
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const token = localStorage.getItem("token_key_fultang");
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        const baseUrl = import.meta.env.VITE_BACKEND_FULTANG_API_BASE_MEDICALSTAFF_URL || "http://127.0.0.1:8000/api";

        try {
            setLoading(true);
            setError(null);

            // Charger en parallèle
            const [materielsRes, sortiesRes] = await Promise.all([
                fetch(`${baseUrl}/materiels-medicaux/`, { headers, cache: "no-store" }).then(res => res.json()),
                fetch(`${baseUrl}/sorties/`, { headers, cache: "no-store" }).then(res => res.json())
            ]);

            // 1. Traiter Matériels
            const materielsData = materielsRes.results || materielsRes || [];
            const medicationsList = materielsData.map(m => ({
                id: m.idMateriel || m.materiel_ptr_id,
                code: m.code_materiel,
                name: m.nom_Materiel,
                quantity: m.quantite_stock,
                seuil: m.seuil_alerte || 10, // Utiliser le seuil du modèle ou 10 par défaut
                prixVente: parseFloat(m.prix_vente_unitaire) || 0
            }));
            setMedications(medicationsList);

            // 2. Traiter Ventes du jour
            const sortiesData = sortiesRes.results || sortiesRes || [];
            const today = new Date().toISOString().split('T')[0];

            const ventesAujourdHui = sortiesData.filter(s => {
                const sortieDate = s.date_sortie?.split('T')[0] || '';
                return sortieDate === today && s.motif_sortie === 'VENTE';
            }).map(s => ({
                id: s.idSortie,
                medication: s.numero_sortie, // On affiche le N° de sortie faute de nom précis ici sans join
                quantity: 1, // Simplification, idéalement il faudrait les lignes
                total: parseFloat(s.montant_total) || 0,
                time: new Date(s.date_sortie).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            }));
            setDailySales(ventesAujourdHui);

        } catch (err) {
            console.error("Erreur chargement données:", err);
            setError("Impossible de charger les données fraîches.");
        } finally {
            setLoading(false);
        }
    }

    // Statistiques calculées à partir des données réelles
    const stats = {
        totalMedications: medications.length,
        lowStock: medications.filter(m => m.quantity <= m.seuil).length,
        salesCount: dailySales.length
    };

    if (loading) {
        return (
            <PharmacistDashBoard linkList={PharmacistNavLink} requiredRole={"Pharmacist"}>
                <PharmacistNavBar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-primary-start mx-auto mb-4" />
                        <p className="text-gray-600">Chargement des données...</p>
                    </div>
                </div>
            </PharmacistDashBoard>
        );
    }

    return (
        <PharmacistDashBoard
            linkList={PharmacistNavLink}
            requiredRole={"Pharmacist"}
        >
            <PharmacistNavBar />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaHome className="text-4xl text-primary-start" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord</h1>
                            <p className="text-gray-500">Bienvenue sur votre espace pharmacie</p>
                        </div>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    >
                        <FaSyncAlt className={loading ? "animate-spin" : ""} /> Actualiser
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Médicaments"
                        value={stats.totalMedications}
                        icon={FaPills}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Stock Faible"
                        value={stats.lowStock}
                        icon={FaExclamationTriangle}
                        color="bg-orange-500"
                    />
                    <StatCard
                        title="Ventes du Jour"
                        value={stats.salesCount}
                        icon={FaShoppingCart}
                        color="bg-green-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stock faible */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaExclamationTriangle className="text-orange-500" />
                            Médicaments en Stock Faible
                        </h2>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {medications.filter(m => m.quantity <= m.seuil).length > 0 ? (
                                medications.filter(m => m.quantity <= m.seuil).map(med => (
                                    <div key={med.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div>
                                            <p className="font-semibold text-gray-800">{med.name}</p>
                                            <p className="text-sm text-gray-500">{med.code}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-orange-600">{med.quantity}</p>
                                            <p className="text-xs text-gray-500">Seuil: {med.seuil}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">Aucun médicament en stock faible</p>
                            )}
                        </div>
                    </div>

                    {/* Ventes récentes */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaClipboardList className="text-green-500" />
                            Ventes Récentes
                        </h2>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {dailySales.length > 0 ? (
                                dailySales.map(sale => (
                                    <div key={sale.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div>
                                            <p className="font-semibold text-gray-800">{sale.medication}</p>
                                            <p className="text-sm text-gray-500">Qté: {sale.quantity} • {sale.time}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">Aucune vente enregistrée aujourd&apos;hui</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PharmacistDashBoard>
    );
}

function StatCard({ title, value, icon: Icon, color, isText = false }) {
    StatCard.propTypes = {
        title: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        icon: PropTypes.elementType.isRequired,
        color: PropTypes.string.isRequired,
        isText: PropTypes.bool
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className={`${color} rounded-full p-4 text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-semibold">{title}</p>
                    <p className={`font-bold text-gray-900 ${isText ? 'text-xl' : 'text-3xl'}`}>{value}</p>
                </div>
            </div>
        </div>
    );
}
