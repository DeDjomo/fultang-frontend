import { DirectorDashBoard } from "./Components/DirectorDashboard";
import { DirectorNavLink } from "./DirectorNavLink";
import { DirectorNavBar } from "./Components/DirectorNavBar";
import { useState, useEffect } from "react";
import {
    FaHome,
    FaClipboardList,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaEye,
    FaSpinner,
    FaSyncAlt
} from "react-icons/fa";
import PropTypes from "prop-types";
import { besoinApi, ligneBesoinApi } from "../../services/comptabiliteMatiereApi";

export function Director() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Besoins depuis l'API
    const [besoins, setBesoins] = useState([]);
    const [lignesBesoins, setLignesBesoins] = useState({});

    // Modal de détails
    const [selectedBesoin, setSelectedBesoin] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Charger les données depuis l'API
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            setError(null);

            const besoinsData = await besoinApi.getAll();
            const besoinsList = (besoinsData.results || besoinsData).map(b => ({
                id: b.idBesoin,
                code: b.code_besoin || `BES-${b.idBesoin}`,
                motif: b.motif,
                demandeurId: b.idPersonnel_emetteur,
                demandeur: `Personnel #${b.idPersonnel_emetteur}`,
                priorite: mapPriorite(b.priorite || "NORMAL"),
                statut: mapStatut(b.statut),
                dateDemande: b.date_creation_besoin?.split('T')[0] || '-',
                commentaire: b.commentaire_directeur || ""
            }));
            setBesoins(besoinsList);

        } catch (err) {
            console.error("Erreur lors du chargement des besoins:", err);
            setError("Impossible de charger les besoins. Vérifiez que le backend est en cours d'exécution.");
        } finally {
            setLoading(false);
        }
    }

    function mapPriorite(priorite) {
        const map = {
            'HIGH': 'urgente',
            'NORMAL': 'normale',
            'LOW': 'basse'
        };
        return map[priorite] || 'normale';
    }

    function mapStatut(statut) {
        const map = {
            'NON_TRAITE': 'en_attente',
            'EN_COURS': 'en_attente',
            'TRAITE': 'approuve',
            'REJETE': 'rejete'
        };
        return map[statut] || 'en_attente';
    }

    // Statistiques
    const stats = {
        enAttente: besoins.filter(b => b.statut === "en_attente").length,
        approuves: besoins.filter(b => b.statut === "approuve").length,
        rejetes: besoins.filter(b => b.statut === "rejete").length,
        total: besoins.length
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

    async function viewBesoinDetails(besoin) {
        setSelectedBesoin(besoin);
        setShowDetailModal(true);

        // Charger les lignes de besoin si pas encore chargées
        if (!lignesBesoins[besoin.id]) {
            try {
                const lignes = await ligneBesoinApi.getByBesoin(besoin.id);
                const lignesList = (lignes.results || lignes).map(l => ({
                    id: l.idLigneBesoin,
                    materiel: l.materiel_nom,
                    quantite: l.quantite_demandee,
                    priorite: l.priorite,
                    description: l.description_justification
                }));
                setLignesBesoins(prev => ({ ...prev, [besoin.id]: lignesList }));
            } catch (err) {
                console.error("Erreur lors du chargement des lignes:", err);
            }
        }
    }

    async function handleApprove(besoin) {
        try {
            setActionLoading(true);
            await besoinApi.update(besoin.id, { statut: "TRAITE" });
            setSuccessMessage(`Besoin ${besoin.code} approuvé avec succès !`);
            setTimeout(() => setSuccessMessage(""), 3000);
            setShowDetailModal(false);
            await loadData();
        } catch (err) {
            console.error("Erreur lors de l'approbation:", err);
            setError("Impossible d'approuver le besoin.");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleReject(besoin) {
        try {
            setActionLoading(true);
            await besoinApi.update(besoin.id, { statut: "REJETE" });
            setSuccessMessage(`Besoin ${besoin.code} rejeté.`);
            setTimeout(() => setSuccessMessage(""), 3000);
            setShowDetailModal(false);
            await loadData();
        } catch (err) {
            console.error("Erreur lors du rejet:", err);
            setError("Impossible de rejeter le besoin.");
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) {
        return (
            <DirectorDashBoard linkList={DirectorNavLink} requiredRole={"Director"}>
                <DirectorNavBar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-primary-start mx-auto mb-4" />
                        <p className="text-gray-600">Chargement des besoins...</p>
                    </div>
                </div>
            </DirectorDashBoard>
        );
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
                            <p className="text-gray-500">Gestion des besoins en matériel</p>
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

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <FaCheckCircle /> {successMessage}
                    </div>
                )}

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

                    {besoins.length > 0 ? (
                        <div className="max-h-[500px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-primary-start to-primary-end text-white sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Référence</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Motif</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Demandeur</th>
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
                                                {besoin.code}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                                                {besoin.motif}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {besoin.demandeur}
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
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <FaClipboardList className="mx-auto text-5xl text-gray-300 mb-4" />
                            <p>Aucun besoin enregistré</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de détails */}
            {showDetailModal && selectedBesoin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-500">Référence</p>
                                    <p className="font-bold text-gray-800 font-mono">{selectedBesoin.code}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-500">Date de demande</p>
                                    <p className="font-semibold text-gray-800">{selectedBesoin.dateDemande}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-500">Motif</p>
                                <p className="font-semibold text-gray-800">{selectedBesoin.motif}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-500">Demandeur</p>
                                    <p className="font-semibold text-gray-800">{selectedBesoin.demandeur}</p>
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

                            {/* Lignes de besoin */}
                            {lignesBesoins[selectedBesoin.id] && lignesBesoins[selectedBesoin.id].length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-3 font-semibold">Articles demandés :</p>
                                    <div className="space-y-2">
                                        {lignesBesoins[selectedBesoin.id].map((ligne, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded border flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{ligne.materiel}</p>
                                                    {ligne.description && (
                                                        <p className="text-xs text-gray-500">{ligne.description}</p>
                                                    )}
                                                </div>
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                    x{ligne.quantite}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedBesoin.statut === "en_attente" && (
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => handleApprove(selectedBesoin)}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold disabled:opacity-50"
                                    >
                                        {actionLoading ? <FaSpinner className="animate-spin inline mr-2" /> : null}
                                        ✓ Approuver
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedBesoin)}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold disabled:opacity-50"
                                    >
                                        ✕ Rejeter
                                    </button>
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
