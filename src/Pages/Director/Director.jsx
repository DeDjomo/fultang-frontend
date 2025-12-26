import { DirectorDashBoard } from "./Components/DirectorDashboard";
import { DirectorNavLink } from "./DirectorNavLink";
import { DirectorNavBar } from "./Components/DirectorNavBar";
import { useState, useEffect } from "react";
import {
    FaHome,
    FaClipboardList,
    FaExclamationTriangle,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaEye,
    FaSpinner
} from "react-icons/fa";
import PropTypes from "prop-types";
import { getDirectorDashboardStats, modifierStatutBesoin, ajouterCommentaireBesoin } from "../../services/comptabiliteMatiereApi";

export function Director() {
    // États pour les données
    const [besoins, setBesoins] = useState([]);
    const [stats, setStats] = useState({
        enAttente: 0,
        approuves: 0,
        rejetes: 0,
        total: 0
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal de détails
    const [selectedBesoin, setSelectedBesoin] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [commentaire, setCommentaire] = useState("");

    // Charger les données au montage
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getDirectorDashboardStats();

            // Transformer les besoins pour l'affichage
            const besoinsFormatted = data.besoins.map(b => ({
                id: b.idBesoin || b.id,
                description: b.motif || "Besoin",
                service: b.service_demandeur || "Service",
                demandeur: b.personnel_emetteur_nom || "Demandeur",
                priorite: b.priorite === 'URGENT' ? 'urgente' : b.priorite === 'NORMAL' ? 'normale' : 'basse',
                statut: b.statut === 'NON_TRAITE' ? 'en_attente' : b.statut === 'TRAITE' ? 'approuve' : b.statut === 'REJETE' ? 'rejete' : 'en_cours',
                quantite: b.lignes?.length || 1,
                dateDemande: b.date_creation_besoin?.split('T')[0] || new Date().toISOString().split('T')[0],
                rawData: b
            }));

            setBesoins(besoinsFormatted);
            setStats({
                enAttente: data.enAttente + data.enCours,
                approuves: data.approuves,
                rejetes: data.rejetes,
                total: data.total
            });
        } catch (err) {
            console.error("Erreur lors du chargement des données:", err);
            // Fallback to mock data
            setBesoins([
                { id: "BES-2024-001", description: "Commande de 500 gants médicaux", service: "Service Médical", demandeur: "M. Dupont Michel", priorite: "urgente", statut: "en_attente", quantite: 500, dateDemande: "2024-12-22" },
                { id: "BES-2024-002", description: "Besoin de 3 stéthoscopes", service: "Service Cardiologie", demandeur: "Dr. Fotso Marie", priorite: "haute", statut: "en_attente", quantite: 3, dateDemande: "2024-12-21" },
            ]);
            setStats({ enAttente: 2, approuves: 0, rejetes: 0, total: 2 });
        } finally {
            setLoading(false);
        }
    };

    // Approuver un besoin
    const handleApprove = async (besoinId) => {
        try {
            setActionLoading(true);
            await modifierStatutBesoin(besoinId, 'TRAITE');
            if (commentaire) {
                await ajouterCommentaireBesoin(besoinId, commentaire);
            }
            setShowDetailModal(false);
            setCommentaire("");
            await fetchData(); // Recharger les données
            alert("Besoin approuvé avec succès !");
        } catch (err) {
            console.error("Erreur lors de l'approbation:", err);
            alert("Erreur lors de l'approbation du besoin");
        } finally {
            setActionLoading(false);
        }
    };

    // Rejeter un besoin
    const handleReject = async (besoinId) => {
        try {
            setActionLoading(true);
            await modifierStatutBesoin(besoinId, 'REJETE');
            if (commentaire) {
                await ajouterCommentaireBesoin(besoinId, commentaire);
            }
            setShowDetailModal(false);
            setCommentaire("");
            await fetchData(); // Recharger les données
            alert("Besoin rejeté !");
        } catch (err) {
            console.error("Erreur lors du rejet:", err);
            alert("Erreur lors du rejet du besoin");
        } finally {
            setActionLoading(false);
        }
    };

    function getPrioriteBadge(priorite) {
        const config = {
            urgente: { bg: "bg-red-100", text: "text-red-800", label: "Urgente" },
            haute: { bg: "bg-orange-100", text: "text-orange-800", label: "Haute" },
            normale: { bg: "bg-blue-100", text: "text-blue-800", label: "Normale" },
            basse: { bg: "bg-gray-100", text: "text-gray-800", label: "Basse" }
        };
        const { bg, text, label } = config[priorite] || config.normale;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
                {label}
            </span>
        );
    }

    function getStatutBadge(statut) {
        const config = {
            en_attente: { bg: "bg-yellow-100", text: "text-yellow-800", icon: FaClock, label: "En attente" },
            approuve: { bg: "bg-green-100", text: "text-green-800", icon: FaCheckCircle, label: "Approuvé" },
            rejete: { bg: "bg-red-100", text: "text-red-800", icon: FaTimesCircle, label: "Rejeté" }
        };
        const { bg, text, icon: Icon, label } = config[statut] || config.en_attente;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bg} ${text} flex items-center gap-1`}>
                <Icon className="w-3 h-3" /> {label}
            </span>
        );
    }

    function viewBesoinDetails(besoin) {
        setSelectedBesoin(besoin);
        setShowDetailModal(true);
    }

    return (
        <DirectorDashBoard
            linkList={DirectorNavLink}
            requiredRole={"Director"}
        >
            <DirectorNavBar />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaHome className="text-4xl text-primary-start" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord</h1>
                            <p className="text-gray-500">Bienvenue, Dr. Kamdem Jean</p>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Besoins"
                        value={stats.total}
                        icon={FaClipboardList}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="En Attente"
                        value={stats.enAttente}
                        icon={FaClock}
                        color="bg-yellow-500"
                    />
                    <StatCard
                        title="Approuvés"
                        value={stats.approuves}
                        icon={FaCheckCircle}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Rejetés"
                        value={stats.rejetes}
                        icon={FaTimesCircle}
                        color="bg-red-500"
                    />
                </div>

                {/* Liste des besoins */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FaClipboardList className="text-primary-start" />
                            Liste des Besoins
                        </h2>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                {stats.enAttente} en attente
                            </span>
                        </div>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-primary-start to-primary-end text-white sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Référence</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Service</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">Priorité</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">Statut</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">Date</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {besoins.map((besoin, index) => (
                                    <tr
                                        key={besoin.id}
                                        className={`hover:bg-primary-end/10 transition-all ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                                    >
                                        <td className="px-4 py-3 font-mono font-semibold text-gray-800">
                                            {besoin.id}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                                            {besoin.description}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {besoin.service}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {getPrioriteBadge(besoin.priorite)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center">
                                                {getStatutBadge(besoin.statut)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-gray-500">
                                            {besoin.dateDemande}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => viewBesoinDetails(besoin)}
                                                className="px-3 py-1 bg-primary-start text-white rounded-lg hover:opacity-80 transition-all text-sm flex items-center gap-1 mx-auto"
                                            >
                                                <FaEye /> Voir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de détails */}
            {showDetailModal && selectedBesoin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Détails du Besoin</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-500">Référence</p>
                                <p className="font-bold text-gray-800 font-mono">{selectedBesoin.id}</p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="font-semibold text-gray-800">{selectedBesoin.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-500">Service demandeur</p>
                                    <p className="font-semibold text-gray-800">{selectedBesoin.service}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-500">Demandeur</p>
                                    <p className="font-semibold text-gray-800">{selectedBesoin.demandeur}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-500">Quantité</p>
                                    <p className="font-bold text-2xl text-primary-start">{selectedBesoin.quantite}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-500">Priorité</p>
                                    <div className="mt-1">{getPrioriteBadge(selectedBesoin.priorite)}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-500">Statut</p>
                                    <div className="mt-1">{getStatutBadge(selectedBesoin.statut)}</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-500">Date de demande</p>
                                <p className="font-semibold text-gray-800">{selectedBesoin.dateDemande}</p>
                            </div>

                            {selectedBesoin.statut === "en_attente" && (
                                <div className="space-y-3 pt-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Commentaire (optionnel)
                                        </label>
                                        <textarea
                                            value={commentaire}
                                            onChange={(e) => setCommentaire(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent"
                                            placeholder="Ajouter un commentaire..."
                                            rows="2"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(selectedBesoin.id)}
                                            disabled={actionLoading}
                                            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {actionLoading ? <FaSpinner className="animate-spin" /> : "✓"} Approuver
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedBesoin.id)}
                                            disabled={actionLoading}
                                            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {actionLoading ? <FaSpinner className="animate-spin" /> : "✕"} Rejeter
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DirectorDashBoard>
    );
}

function StatCard({ title, value, icon: Icon, color }) {
    StatCard.propTypes = {
        title: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        icon: PropTypes.elementType.isRequired,
        color: PropTypes.string.isRequired
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className={`${color} rounded-full p-4 text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-semibold">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}
