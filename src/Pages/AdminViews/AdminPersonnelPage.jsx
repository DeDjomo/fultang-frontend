import { useState, useEffect, useCallback } from 'react';
import { Tooltip, Tag } from 'antd';
import { FaEdit, FaTrash, FaKey } from 'react-icons/fa';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { newAdminNavLink } from "./newAdminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";
import { getAllPersonnel, deletePersonnel, resetPersonnelPassword, getPersonnelDependencies } from '../../services/personnelApi';
import { AddPersonnelModal, EditPersonnelModal, PersonnelDetailsModal } from './Personnel';
import { ConfirmationModal } from '../Modals/ConfirmAction.Modal.jsx';
import { useFeedback } from '../../contexts/FeedbackContext.jsx';
import { useAutoRefresh, deepEqual } from '../../hooks/usePolling';
import Loader from "../../GlobalComponents/Loader.jsx";
import { Users, Search, RefreshCw, Eye, Plus, ChevronLeft, ChevronRight, Phone, Mail, UserCircle, AlertTriangle } from 'lucide-react';

/**
 * Hospital staff management page with pagination and modern design.
 */
export function AdminPersonnelPage() {
    const [personnel, setPersonnel] = useState([]);
    const [filteredPersonnel, setFilteredPersonnel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPersonnel, setSelectedPersonnel] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ type: null, data: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPoste, setSelectedPoste] = useState('');
    const [dependencies, setDependencies] = useState(null);
    const [loadingDeps, setLoadingDeps] = useState(false);
    const { showSuccess, showError } = useFeedback();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    // Liste des postes pour le filtre
    const POSTES = [
        { value: 'receptioniste', label: 'Receptionist' },
        { value: 'caissier', label: 'Cashier' },
        { value: 'infirmier', label: 'Nurse' },
        { value: 'medecin', label: 'Doctor' },
        { value: 'laborantin', label: 'Lab Technician' },
        { value: 'pharmacien', label: 'Pharmacist' },
        { value: 'comptable', label: 'Accountant' },
        { value: 'directeur', label: 'Director' }
    ];

    const fetchPersonnel = useCallback(async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const response = await getAllPersonnel();
            const personnelData = response.results || response.data || [];

            setPersonnel(prev => deepEqual(prev, personnelData) ? prev : personnelData);

            if (!isBackground) {
                setFilteredPersonnel(personnelData);
            }
        } catch (error) {
            console.error('Error fetching personnel:', error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPersonnel();
    }, [fetchPersonnel]);

    // Auto-refresh toutes les 5 secondes
    useAutoRefresh(() => fetchPersonnel(true), 5000, false);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, selectedPoste, personnel]);

    const applyFilters = () => {
        let filtered = [...personnel];

        // Filtre par recherche texte
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(person =>
                person.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                person.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                person.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtre par poste
        if (selectedPoste) {
            filtered = filtered.filter(person =>
                person.poste?.toLowerCase() === selectedPoste.toLowerCase()
            );
        }

        setFilteredPersonnel(filtered);
        setCurrentPage(1);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredPersonnel.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPersonnel = filteredPersonnel.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleDelete = async (record) => {
        // Fetch dependencies before showing confirmation
        setLoadingDeps(true);
        try {
            const response = await getPersonnelDependencies(record.id);
            setDependencies(response.data);
            setConfirmAction({ type: 'delete', data: record });
            setShowConfirmModal(true);
        } catch (error) {
            console.error('Error fetching dependencies:', error);
            // Show confirmation anyway if dependencies can't be fetched
            setDependencies(null);
            setConfirmAction({ type: 'delete', data: record });
            setShowConfirmModal(true);
        } finally {
            setLoadingDeps(false);
        }
    };

    const handleResetPassword = (record) => {
        setDependencies(null);
        setConfirmAction({ type: 'resetPassword', data: record });
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        const { type, data } = confirmAction;
        if (type === 'delete') {
            try {
                await deletePersonnel(data.id);
                showSuccess(`${data.nom} ${data.prenom} a été supprimé(e) avec succès.`, 'Personnel supprimé');
                fetchPersonnel();
            } catch (error) {
                const errorMessage = error.message || 'Une erreur est survenue lors de la suppression.';
                showError(errorMessage, 'Échec de la suppression');
            }
        } else if (type === 'resetPassword') {
            try {
                await resetPersonnelPassword(data.email);
                showSuccess(`Un nouveau mot de passe a été envoyé à ${data.email}.`, 'Mot de passe réinitialisé');
            } catch (error) {
                showError('Erreur lors de la réinitialisation du mot de passe.', 'Échec');
            }
        }
        setConfirmAction({ type: null, data: null });
        setDependencies(null);
    };

    const getConfirmModalProps = () => {
        const { type, data } = confirmAction;
        if (type === 'delete') {
            let message = `Êtes-vous sûr de vouloir supprimer ${data?.nom} ${data?.prenom} ?`;

            // Build user-friendly warning if there are dependencies
            if (dependencies && dependencies.has_dependencies) {
                const deps = dependencies.dependencies;
                const items = [];
                if (deps.patients_enregistres > 0) items.push(`${deps.patients_enregistres} patient(s)`);
                if (deps.sessions_ouvertes > 0 || deps.sessions_patients > 0) {
                    const totalSessions = (deps.sessions_ouvertes || 0) + (deps.sessions_patients || 0);
                    items.push(`${totalSessions} session(s)`);
                }
                if (deps.rendez_vous_patients > 0) items.push(`${deps.rendez_vous_patients} rendez-vous`);
                if (deps.observations_medicales > 0) items.push(`${deps.observations_medicales} observation(s)`);
                if (deps.besoins_emis > 0) items.push(`${deps.besoins_emis} demande(s) de matériel`);

                message = `⚠️ Attention ! En supprimant ce membre du personnel, vous supprimerez également :\n\n• ${items.join('\n• ')}\n\nCette action est irréversible. Voulez-vous continuer ?`;
            }

            return {
                title: 'Supprimer le personnel',
                message: message
            };
        } else if (type === 'resetPassword') {
            return {
                title: 'Réinitialiser le mot de passe',
                message: `Êtes-vous sûr de vouloir réinitialiser le mot de passe de ${data?.nom} ${data?.prenom} ?`
            };
        }
        return { title: '', message: '' };
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'actif': return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Active' };
            case 'licencie': return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Dismissed' };
            case 'retraite': return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500', label: 'Retired' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500', label: status || 'Unknown' };
        }
    };

    const getPositionLabel = (poste) => {
        const positions = {
            'medecin': 'Doctor',
            'infirmier': 'Nurse',
            'receptioniste': 'Receptionist',
            'caissier': 'Cashier',
            'laborantin': 'Lab Technician',
            'pharmacien': 'Pharmacist',
            'comptable': 'Accountant',
            'directeur': 'Director'
        };
        return positions[poste?.toLowerCase()] || poste;
    };

    const getPosteColor = (poste) => {
        const colors = {
            'medecin': 'blue',
            'infirmier': 'cyan',
            'receptioniste': 'purple',
            'caissier': 'orange',
            'laborantin': 'magenta',
            'pharmacien': 'green',
            'comptable': 'gold',
            'directeur': 'red'
        };
        return colors[poste?.toLowerCase()] || 'default';
    };

    return (
        <CustomDashboard linkList={newAdminNavLink} requiredRole={"admin"}>
            <AdminNavBar />

            <div className="p-6">
                {/* Modern gradient header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Staff Management</h1>
                                <p className="text-sm opacity-90">
                                    {filteredPersonnel.length} staff member{filteredPersonnel.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchPersonnel}
                                className="flex items-center gap-2 bg-white text-primary-end px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                disabled={loading}
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add Staff
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search bar and filters */}
                <div className="mb-6 flex gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end transition-colors"
                        />
                    </div>
                    <select
                        value={selectedPoste}
                        onChange={(e) => setSelectedPoste(e.target.value)}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end transition-colors bg-white min-w-[180px]"
                    >
                        <option value="">All Positions</option>
                        {POSTES.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                    {(searchTerm || selectedPoste) && (
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedPoste(''); }}
                            className="px-4 py-3 text-gray-600 hover:text-red-500 hover:bg-red-50 border-2 border-gray-300 rounded-lg transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Main content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader size="medium" color="primary-end" />
                    </div>
                ) : currentPersonnel.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-xl text-gray-700 mb-2">
                            {searchTerm ? 'No staff member found' : 'No staff members'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try with different search terms' : 'Manage hospital staff from here'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Staff cards grid */}
                        <div className="grid gap-4">
                            {currentPersonnel.map((person) => {
                                const statusConfig = getStatusConfig(person.statut);

                                return (
                                    <div
                                        key={person.id}
                                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between">
                                            {/* Main info */}
                                            <div className="flex items-center gap-4 flex-1">
                                                {/* Avatar */}
                                                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                                                    {person.prenom?.[0]}{person.nom?.[0]}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h3 className="text-lg font-bold text-gray-800">
                                                            {person.nom} {person.prenom}
                                                        </h3>
                                                        <Tag color={getPosteColor(person.poste)}>
                                                            {getPositionLabel(person.poste)}
                                                        </Tag>
                                                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-6 mt-2 text-sm text-gray-500 flex-wrap">
                                                        <span className="flex items-center gap-1.5 font-mono">
                                                            <UserCircle className="w-4 h-4" />
                                                            {person.matricule}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Mail className="w-4 h-4" />
                                                            {person.email}
                                                        </span>
                                                        {person.contact && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Phone className="w-4 h-4" />
                                                                {person.contact}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 ml-4">
                                                <Tooltip title="View details">
                                                    <button
                                                        onClick={() => { setSelectedPersonnel(person); setShowDetailsModal(true); }}
                                                        className="p-2 text-primary-end hover:bg-primary-end/10 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <button
                                                        onClick={() => { setSelectedPersonnel(person); setShowEditModal(true); }}
                                                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                    >
                                                        <FaEdit className="w-5 h-5" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Reset password">
                                                    <button
                                                        onClick={() => handleResetPassword(person)}
                                                        className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                                                    >
                                                        <FaKey className="w-5 h-5" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <button
                                                        onClick={() => handleDelete(person)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <FaTrash className="w-5 h-5" />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 px-2">
                                <p className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredPersonnel.length)} of {filteredPersonnel.length} members
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:border-primary-end hover:text-primary-end'
                                            }`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === page
                                                    ? 'bg-gradient-to-r from-primary-end to-primary-start text-white shadow-md'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:border-primary-end'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:border-primary-end hover:text-primary-end'
                                            }`}
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <AddPersonnelModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchPersonnel} />
            <EditPersonnelModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={fetchPersonnel} personnel={selectedPersonnel} />
            <PersonnelDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} personnel={selectedPersonnel} />
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmAction}
                {...getConfirmModalProps()}
            />
        </CustomDashboard>
    );
}
