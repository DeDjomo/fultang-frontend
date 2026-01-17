import { useState, useEffect } from 'react';
import { Tooltip, Modal, Select } from 'antd';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { newAdminNavLink } from "./newAdminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";
import { getAllChambres, deleteChambre, createChambre, updateChambre } from '../../services/chambresApi';
import { getAllServices } from '../../services/servicesApi';
import { ConfirmationModal } from '../Modals/ConfirmAction.Modal.jsx';
import { useFeedback } from '../../contexts/FeedbackContext.jsx';
import Loader from "../../GlobalComponents/Loader.jsx";
import { BedDouble, Search, RefreshCw, Plus, ChevronLeft, ChevronRight, Users, DollarSign, Building2 } from 'lucide-react';

/**
 * Hospital rooms management page with pagination and modern design.
 */
export function AdminChambresPage() {
    const [chambres, setChambres] = useState([]);
    const [filteredChambres, setFilteredChambres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedChambre, setSelectedChambre] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [chambreToDelete, setChambreToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        numero_chambre: '',
        nombre_places_total: '',
        nombre_places_dispo: '',
        tarif_journalier: '',
        service_id: null
    });
    const [formErrors, setFormErrors] = useState({});
    const [services, setServices] = useState([]);
    const { showSuccess, showError } = useFeedback();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        fetchChambres();
        fetchServices();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, chambres]);

    const fetchChambres = async () => {
        setLoading(true);
        try {
            const response = await getAllChambres();
            const data = response.results || response.data || [];
            setChambres(data);
            setFilteredChambres(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            showError('Erreur lors du chargement des chambres. Veuillez réessayer.', 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await getAllServices();
            const data = response.results || response.data || [];
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...chambres];

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(chambre =>
                chambre.numero_chambre?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredChambres(filtered);
        setCurrentPage(1);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredChambres.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentChambres = filteredChambres.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleDelete = (chambre) => {
        setChambreToDelete(chambre);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!chambreToDelete) return;
        try {
            await deleteChambre(chambreToDelete.id);
            showSuccess(`La chambre "${chambreToDelete.numero_chambre}" a été supprimée avec succès.`, 'Chambre supprimée');
            fetchChambres();
        } catch (error) {
            showError('Erreur lors de la suppression de la chambre. Veuillez réessayer.', 'Échec de la suppression');
        }
        setChambreToDelete(null);
    };

    const handleEdit = (chambre) => {
        setSelectedChambre(chambre);
        setFormData({
            numero_chambre: chambre.numero_chambre,
            nombre_places_total: chambre.nombre_places_total,
            nombre_places_dispo: chambre.nombre_places_dispo,
            tarif_journalier: chambre.tarif_journalier,
            service_id: chambre.service || null
        });
        setFormErrors({});
        setShowEditModal(true);
    };

    const handleAdd = () => {
        setFormData({ numero_chambre: '', nombre_places_total: '', nombre_places_dispo: '', tarif_journalier: '', service_id: null });
        setFormErrors({});
        setShowAddModal(true);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.numero_chambre.trim()) errors.numero_chambre = 'Required';
        if (!formData.nombre_places_total || formData.nombre_places_total <= 0) errors.nombre_places_total = 'Required';
        if (!formData.tarif_journalier || formData.tarif_journalier <= 0) errors.tarif_journalier = 'Required';
        if (formData.nombre_places_dispo === '' || formData.nombre_places_dispo < 0) errors.nombre_places_dispo = 'Required';
        if (parseInt(formData.nombre_places_dispo) > parseInt(formData.nombre_places_total)) {
            errors.nombre_places_dispo = 'Cannot exceed total beds';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitAdd = async () => {
        if (!validateForm()) return;
        try {
            await createChambre({
                numero_chambre: formData.numero_chambre,
                nombre_places_total: parseInt(formData.nombre_places_total),
                tarif_journalier: parseFloat(formData.tarif_journalier),
                service_id: formData.service_id || null
            });
            showSuccess('La nouvelle chambre a été créée avec succès.', 'Chambre créée');
            setShowAddModal(false);
            fetchChambres();
        } catch (error) {
            showError(error.response?.data?.detail || 'Erreur lors de la création de la chambre.', 'Échec de la création');
        }
    };

    const handleSubmitEdit = async () => {
        if (!validateForm()) return;
        try {
            await updateChambre(selectedChambre.id, {
                numero_chambre: formData.numero_chambre,
                nombre_places_total: parseInt(formData.nombre_places_total),
                nombre_places_dispo: parseInt(formData.nombre_places_dispo),
                tarif_journalier: parseFloat(formData.tarif_journalier),
                service: formData.service_id || null
            });
            showSuccess('La chambre a été mise à jour avec succès.', 'Chambre modifiée');
            setShowEditModal(false);
            fetchChambres();
        } catch (error) {
            showError(error.response?.data?.detail || 'Erreur lors de la modification de la chambre.', 'Échec de la modification');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    // Statistics
    const totalBeds = chambres.reduce((acc, c) => acc + (c.nombre_places_total || 0), 0);
    const availableBeds = chambres.reduce((acc, c) => acc + (c.nombre_places_dispo || 0), 0);
    const occupancyRate = totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0;

    const FormModal = ({ isOpen, onClose, onSubmit, title }) => (
        <Modal open={isOpen} onCancel={onClose} onOk={onSubmit} okText="Save" cancelText="Cancel" title={title} width={500}>
            <div className="space-y-4 py-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                    <input type="text" name="numero_chambre" value={formData.numero_chambre} onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg ${formErrors.numero_chambre ? 'border-red-500' : 'border-gray-300'}`} />
                    {formErrors.numero_chambre && <p className="text-red-500 text-xs mt-1">{formErrors.numero_chambre}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                    <Select
                        placeholder="Select a service"
                        value={formData.service_id}
                        onChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}
                        allowClear
                        className="w-full"
                        options={services.map(s => ({ value: s.id, label: s.nom_service }))}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Beds *</label>
                        <input type="number" name="nombre_places_total" value={formData.nombre_places_total} onChange={handleInputChange} min="1"
                            className={`w-full px-3 py-2 border rounded-lg ${formErrors.nombre_places_total ? 'border-red-500' : 'border-gray-300'}`} />
                        {formErrors.nombre_places_total && <p className="text-red-500 text-xs mt-1">{formErrors.nombre_places_total}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available Beds *</label>
                        <input type="number" name="nombre_places_dispo" value={formData.nombre_places_dispo} onChange={handleInputChange} min="0"
                            className={`w-full px-3 py-2 border rounded-lg ${formErrors.nombre_places_dispo ? 'border-red-500' : 'border-gray-300'}`} />
                        {formErrors.nombre_places_dispo && <p className="text-red-500 text-xs mt-1">{formErrors.nombre_places_dispo}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (FCFA) *</label>
                    <input type="number" name="tarif_journalier" value={formData.tarif_journalier} onChange={handleInputChange} min="0" step="100"
                        className={`w-full px-3 py-2 border rounded-lg ${formErrors.tarif_journalier ? 'border-red-500' : 'border-gray-300'}`} />
                    {formErrors.tarif_journalier && <p className="text-red-500 text-xs mt-1">{formErrors.tarif_journalier}</p>}
                </div>
            </div>
        </Modal>
    );

    return (
        <CustomDashboard linkList={newAdminNavLink} requiredRole={"admin"}>
            <AdminNavBar />

            <div className="p-6">
                {/* Modern gradient header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <BedDouble className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Rooms Management</h1>
                                <p className="text-sm opacity-90">
                                    {filteredChambres.length} room{filteredChambres.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchChambres}
                                className="flex items-center gap-2 bg-white text-primary-end px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                disabled={loading}
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={handleAdd}
                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add Room
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <BedDouble className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Beds</p>
                                <p className="text-2xl font-bold text-gray-800">{totalBeds}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Available</p>
                                <p className="text-2xl font-bold text-green-600">{availableBeds}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <DollarSign className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Occupancy Rate</p>
                                <p className="text-2xl font-bold text-orange-600">{occupancyRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by room number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end transition-colors"
                        />
                    </div>
                </div>

                {/* Main content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader size="medium" color="primary-end" />
                    </div>
                ) : currentChambres.length === 0 ? (
                    <div className="text-center py-12">
                        <BedDouble className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-xl text-gray-700 mb-2">
                            {searchTerm ? 'No room found' : 'No rooms'}
                        </h3>
                        <p className="text-gray-500">Manage hospital rooms from here</p>
                    </div>
                ) : (
                    <>
                        {/* Room cards grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {currentChambres.map((chambre) => {
                                const isAvailable = chambre.nombre_places_dispo > 0;
                                const occupancy = chambre.nombre_places_total > 0
                                    ? Math.round(((chambre.nombre_places_total - chambre.nombre_places_dispo) / chambre.nombre_places_total) * 100)
                                    : 0;

                                return (
                                    <div
                                        key={chambre.id}
                                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`rounded-xl w-12 h-12 flex items-center justify-center ${isAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    <BedDouble className={`w-6 h-6 ${isAvailable ? 'text-green-600' : 'text-red-600'}`} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">
                                                        Room {chambre.numero_chambre}
                                                    </h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {isAvailable ? 'Available' : 'Full'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-1">
                                                <Tooltip title="Edit">
                                                    <button
                                                        onClick={() => handleEdit(chambre)}
                                                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                    >
                                                        <FaEdit className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <button
                                                        onClick={() => handleDelete(chambre)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Beds</span>
                                                <span className="font-semibold">
                                                    {chambre.nombre_places_dispo} / {chambre.nombre_places_total}
                                                </span>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${occupancy > 80 ? 'bg-red-500' : occupancy > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                                                    style={{ width: `${occupancy}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                                <span className="text-sm text-gray-500">Daily rate</span>
                                                <span className="font-bold text-primary-end">
                                                    {chambre.tarif_journalier?.toLocaleString()} FCFA
                                                </span>
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
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredChambres.length)} of {filteredChambres.length} rooms
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
            <FormModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleSubmitAdd} title="Add Room" />
            <FormModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSubmit={handleSubmitEdit} title="Edit Room" />
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Room"
                message={`Are you sure you want to delete room "${chambreToDelete?.numero_chambre}"?`}
            />
        </CustomDashboard>
    );
}
