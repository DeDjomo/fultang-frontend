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
    FaSyncAlt,
    FaPlay,
    FaCheck,
    FaTimes
} from "react-icons/fa";
import PropTypes from "prop-types";
import { ligneBesoinApi, besoinApi } from "../../services/comptabiliteMatiereApi";

export function Director() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Tous les besoins depuis l'API (pour statistiques)
    const [allBesoins, setAllBesoins] = useState([]);
    // Besoins non traités seulement (pour la liste principale)
    const [besoinsNonTraites, setBesoinsNonTraites] = useState([]);
    const [lignesBesoins, setLignesBesoins] = useState({});

    // Modal de détails
    const [selectedBesoin, setSelectedBesoin] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Modal de liste filtrée par statut
    const [showFilteredModal, setShowFilteredModal] = useState(false);
    const [filteredBesoins, setFilteredBesoins] = useState([]);
    const [filteredTitle, setFilteredTitle] = useState("");

    // Modal de confirmation pour validation
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'approve' ou 'reject'
    const [confirmBesoin, setConfirmBesoin] = useState(null);
    const [rejectComment, setRejectComment] = useState("");

    // Charger les données depuis l'API
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            setError(null);

            const besoinsData = await besoinApi.getAll();
            const besoinsList = (Array.isArray(besoinsData) ? besoinsData : (besoinsData.results || [])).map(b => ({
                id: b.idBesoin,
                code: b.code_besoin || `BES-${b.idBesoin}`,
                motif: b.motif,
                demandeurId: b.idPersonnel_emetteur,
                demandeur: `Personnel #${b.idPersonnel_emetteur}`,
                priorite: mapPriorite(b.priorite || "NORMAL"),
                statut: mapStatut(b.statut),
                rawStatut: b.statut, // Conserver le statut original
                dateDemande: b.date_creation_besoin?.split('T')[0] || '-',
                commentaire: b.commentaire_directeur || ""
            }));

            // Stocker TOUS les besoins pour les statistiques
            setAllBesoins(besoinsList);

            // Filtrer UNIQUEMENT les besoins NON_TRAITE pour la liste principale
            const nonTraites = besoinsList.filter(b => b.rawStatut === 'NON_TRAITE');
            setBesoinsNonTraites(nonTraites);

        } catch (err) {
            console.error("Erreur chargement besoins:", err);
            setError("Impossible de charger les données fraîches.");
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
            'NON_TRAITE': 'non_traite',
            'EN_COURS': 'en_cours',
            'TRAITE': 'traite',
            'REJETE': 'rejete'
        };
        return map[statut] || 'non_traite';
    }

    // Statistiques sur TOUS les besoins
    const stats = {
        nonTraites: allBesoins.filter(b => b.rawStatut === 'NON_TRAITE').length,
        enCours: allBesoins.filter(b => b.rawStatut === 'EN_COURS').length,
        traites: allBesoins.filter(b => b.rawStatut === 'TRAITE').length,
        rejetes: allBesoins.filter(b => b.rawStatut === 'REJETE').length,
        total: allBesoins.length
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

    function getStatutBadge(statut, rawStatut) {
        const config = {
            non_traite: { bg: "bg-yellow-100", text: "text-yellow-800", icon: FaClock, label: "Non traité" },
            en_cours: { bg: "bg-blue-100", text: "text-blue-800", icon: FaPlay, label: "En cours" },
            traite: { bg: "bg-green-100", text: "text-green-800", icon: FaCheckCircle, label: "Traité" },
            rejete: { bg: "bg-red-100", text: "text-red-800", icon: FaTimesCircle, label: "Rejeté" }
        };
        const { bg, text, icon: Icon, label } = config[statut] || config.non_traite;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bg} ${text} flex items-center gap-1`}>
                <Icon className="w-3 h-3" /> {label}
            </span>
        );
    }

    // Ouvrir modal avec besoins filtrés par statut
    function openFilteredModal(rawStatut, title) {
        const filtered = allBesoins.filter(b => b.rawStatut === rawStatut);
        setFilteredBesoins(filtered);
        setFilteredTitle(title);
        setShowFilteredModal(true);
    }

    async function viewBesoinDetails(besoin) {
        setSelectedBesoin(besoin);
        setShowDetailModal(true);

        // Charger les lignes de besoin si pas encore chargées
        if (!lignesBesoins[besoin.id]) {
            try {
                console.log("📦 Chargement des lignes pour besoin ID:", besoin.id);
                const lignes = await ligneBesoinApi.getByBesoin(besoin.id);
                console.log("📦 Réponse API lignes-besoin:", lignes);

                const lignesList = (Array.isArray(lignes) ? lignes : (lignes.results || [])).map(l => ({
                    id: l.id_ligne_besoin || l.idLigneBesoin,
                    materiel: l.materiel_nom,
                    quantite: l.quantite_demandee,
                    priorite: l.priorite,
                    description: l.description_justification
                }));
                console.log("📦 Lignes mappées:", lignesList);
                setLignesBesoins(prev => ({ ...prev, [besoin.id]: lignesList }));
            } catch (err) {
                console.error("❌ Erreur lors du chargement des lignes:", err);
                console.error("❌ Détails:", err.response?.data);
            }
        }
    }

    // Ouvrir la modal de confirmation pour validation
    function openApproveModal(besoin) {
        setConfirmBesoin(besoin);
        setConfirmAction('approve');
        setRejectComment("");
        setShowConfirmModal(true);
    }

    // Ouvrir la modal de confirmation pour rejet (avec champ commentaire)
    function openRejectModal(besoin) {
        setConfirmBesoin(besoin);
        setConfirmAction('reject');
        setRejectComment("");
        setShowConfirmModal(true);
    }

    // Fermer la modal de confirmation
    function closeConfirmModal() {
        setShowConfirmModal(false);
        setConfirmBesoin(null);
        setConfirmAction(null);
        setRejectComment("");
    }

    // Exécuter la validation après confirmation dans la modal
    async function executeApprove() {
        if (!confirmBesoin) return;

        try {
            setActionLoading(true);

            // Changer le statut à EN_COURS via le service API
            await besoinApi.patch(confirmBesoin.id, {
                statut: 'EN_COURS',
                date_traitement_directeur: new Date().toISOString()
            });

            setSuccessMessage(`✅ Besoin ${confirmBesoin.code} validé et passé en cours !`);
            setTimeout(() => setSuccessMessage(""), 3000);
            setShowDetailModal(false);
            closeConfirmModal();
            await loadData();
        } catch (err) {
            console.error("Erreur lors de l'approbation:", err);
            setError("❌ Impossible d'approuver le besoin.");
            setTimeout(() => setError(null), 3000);
        } finally {
            setActionLoading(false);
        }
    }

    // Exécuter le rejet après confirmation dans la modal
    async function executeReject() {
        if (!confirmBesoin) return;

        try {
            setActionLoading(true);

            await besoinApi.patch(confirmBesoin.id, {
                statut: 'REJETE',
                commentaire_directeur: rejectComment || 'Rejeté par le directeur',
                date_traitement_directeur: new Date().toISOString()
            });

            setSuccessMessage(`⛔ Besoin ${confirmBesoin.code} rejeté.`);
            setTimeout(() => setSuccessMessage(""), 3000);
            setShowDetailModal(false);
            closeConfirmModal();
            await loadData();
        } catch (err) {
            console.error("Erreur lors du rejet:", err);
            setError("❌ Impossible de rejeter le besoin.");
            setTimeout(() => setError(null), 3000);
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

                {/* Statistiques cliquables */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Non Traités"
                        value={stats.nonTraites}
                        icon={FaClock}
                        color="bg-yellow-500"
                        onClick={() => openFilteredModal('NON_TRAITE', 'Besoins Non Traités')}
                    />
                    <StatCard
                        title="En Cours"
                        value={stats.enCours}
                        icon={FaPlay}
                        color="bg-blue-500"
                        onClick={() => openFilteredModal('EN_COURS', 'Besoins En Cours')}
                    />
                    <StatCard
                        title="Traités"
                        value={stats.traites}
                        icon={FaCheckCircle}
                        color="bg-green-500"
                        onClick={() => openFilteredModal('TRAITE', 'Besoins Traités')}
                    />
                    <StatCard
                        title="Rejetés"
                        value={stats.rejetes}
                        icon={FaTimesCircle}
                        color="bg-red-500"
                        onClick={() => openFilteredModal('REJETE', 'Besoins Rejetés')}
                    />
                </div>

                {/* Liste des besoins NON TRAITÉS uniquement */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FaClipboardList className="text-primary-start" />
                            Besoins à Traiter
                        </h2>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                {stats.nonTraites} non traités
                            </span>
                        </div>
                    </div>

                    {besoinsNonTraites.length > 0 ? (
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
                                        <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {besoinsNonTraites.map((besoin, index) => (
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
                                                    {getStatutBadge(besoin.statut, besoin.rawStatut)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-500">
                                                {besoin.dateDemande}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => viewBesoinDetails(besoin)}
                                                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all text-xs flex items-center gap-1"
                                                        title="Voir détails"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => openApproveModal(besoin)}
                                                        disabled={actionLoading}
                                                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all text-xs flex items-center gap-1 disabled:opacity-50"
                                                        title="Valider"
                                                    >
                                                        <FaCheck /> Valider
                                                    </button>
                                                    <button
                                                        onClick={() => openRejectModal(besoin)}
                                                        disabled={actionLoading}
                                                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all text-xs flex items-center gap-1 disabled:opacity-50"
                                                        title="Rejeter"
                                                    >
                                                        <FaTimes /> Rejeter
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <FaCheckCircle className="mx-auto text-5xl text-green-300 mb-4" />
                            <p className="text-lg font-semibold">Aucun besoin en attente de traitement</p>
                            <p className="text-sm">Tous les besoins ont été traités !</p>
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
                                    <div className="mt-1">{getStatutBadge(selectedBesoin.statut, selectedBesoin.rawStatut)}</div>
                                </div>
                            </div>

                            {/* Commentaire du directeur si présent */}
                            {selectedBesoin.commentaire && (
                                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                    <p className="text-sm text-orange-600 font-semibold">Commentaire du directeur :</p>
                                    <p className="text-gray-800">{selectedBesoin.commentaire}</p>
                                </div>
                            )}

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

                            {/* Boutons d'action uniquement pour les besoins NON_TRAITE */}
                            {selectedBesoin.rawStatut === "NON_TRAITE" && (
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => openApproveModal(selectedBesoin)}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                        Valider (→ En cours)
                                    </button>
                                    <button
                                        onClick={() => openRejectModal(selectedBesoin)}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                                        Rejeter
                                    </button>
                                </div>
                            )}

                            {/* Message si le besoin n'est plus modifiable */}
                            {selectedBesoin.rawStatut !== "NON_TRAITE" && (
                                <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-600">
                                    <p className="font-semibold">Ce besoin a déjà été traité et ne peut plus être modifié.</p>
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

            {/* Modal des besoins filtrés par statut */}
            {showFilteredModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">{filteredTitle}</h2>
                            <button
                                onClick={() => setShowFilteredModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        {filteredBesoins.length > 0 ? (
                            <div className="max-h-[60vh] overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-primary-start to-primary-end text-white sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Référence</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Motif</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Demandeur</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold">Priorité</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold">Date</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredBesoins.map((besoin, index) => (
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
                                                <td className="px-4 py-3 text-center text-sm text-gray-500">
                                                    {besoin.dateDemande}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setShowFilteredModal(false);
                                                            viewBesoinDetails(besoin);
                                                        }}
                                                        className="px-3 py-1 bg-primary-start text-white rounded-lg hover:opacity-80 transition-all text-sm flex items-center gap-1 mx-auto"
                                                    >
                                                        <FaEye /> Détails
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
                                <p>Aucun besoin dans cette catégorie</p>
                            </div>
                        )}

                        <button
                            onClick={() => setShowFilteredModal(false)}
                            className="w-full mt-6 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de confirmation pour validation/rejet */}
            {showConfirmModal && confirmBesoin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-fade-in">
                        {/* En-tête de la modal */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                {confirmAction === 'approve' ? (
                                    <>
                                        <FaCheck className="text-green-500" />
                                        Confirmer la validation
                                    </>
                                ) : (
                                    <>
                                        <FaTimes className="text-red-500" />
                                        Confirmer le rejet
                                    </>
                                )}
                            </h3>
                            <button
                                onClick={closeConfirmModal}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Contenu de la modal */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Besoin concerné</p>
                                <p className="font-mono font-bold text-gray-800">{confirmBesoin.code}</p>
                                <p className="text-sm text-gray-600 mt-1">{confirmBesoin.motif}</p>
                            </div>

                            {confirmAction === 'approve' ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-800">
                                        Voulez-vous valider ce besoin ? Le statut passera à <strong>&quot;En cours&quot;</strong>.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-800">
                                            Vous êtes sur le point de rejeter ce besoin.
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="rejectComment" className="block text-sm font-medium text-gray-700 mb-2">
                                            Motif du rejet (optionnel)
                                        </label>
                                        <textarea
                                            id="rejectComment"
                                            value={rejectComment}
                                            onChange={(e) => setRejectComment(e.target.value)}
                                            placeholder="Expliquez pourquoi vous rejetez ce besoin..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all"
                                            rows={3}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closeConfirmModal}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmAction === 'approve' ? executeApprove : executeReject}
                                disabled={actionLoading}
                                className={`flex-1 px-4 py-3 text-white rounded-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2 ${confirmAction === 'approve'
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {actionLoading ? (
                                    <FaSpinner className="animate-spin" />
                                ) : confirmAction === 'approve' ? (
                                    <FaCheck />
                                ) : (
                                    <FaTimes />
                                )}
                                {confirmAction === 'approve' ? 'Valider' : 'Rejeter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DirectorDashBoard>
    );
}

function StatCard({ title, value, icon: Icon, color, onClick }) {
    StatCard.propTypes = {
        title: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        icon: PropTypes.elementType.isRequired,
        color: PropTypes.string.isRequired,
        onClick: PropTypes.func
    };

    return (
        <div
            className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-4">
                <div className={`${color} rounded-full p-4 text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-semibold">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
            {onClick && (
                <p className="text-xs text-gray-400 mt-2 text-center">Cliquez pour voir les détails</p>
            )}
        </div>
    );
}
