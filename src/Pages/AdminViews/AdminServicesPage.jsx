import { useState, useEffect, useCallback } from 'react';
import { Tooltip, Tag } from 'antd';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { newAdminNavLink } from "./newAdminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";
import { getAllServices, deleteService } from '../../services/servicesApi';
import { AddServiceModal, EditServiceModal, ServiceStatsModal } from './Services';
import { ConfirmationModal } from '../Modals/ConfirmAction.Modal.jsx';
import { useFeedback } from '../../contexts/FeedbackContext.jsx';
import { useAutoRefresh, deepEqual } from '../../hooks/usePolling';
import Loader from "../../GlobalComponents/Loader.jsx";
import { Building2, Search, RefreshCw, Plus, ChevronLeft, ChevronRight, Eye, User, Calendar, FileText } from 'lucide-react';

/**
 * Hospital services management page with pagination and modern design.
 */
export function AdminServicesPage() {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Custom feedback hook for error/success messages
    const { showSuccess, showError } = useFeedback();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const fetchServices = useCallback(async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const response = await getAllServices();
            const servicesData = response.results || response.data || [];
            setServices(prev => deepEqual(prev, servicesData) ? prev : servicesData);
            
            if (!isBackground) {
                setFilteredServices(servicesData);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // Auto-refresh toutes les 5 secondes
    useAutoRefresh(() => fetchServices(true), 5000, false);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, services]);

    const applyFilters = () => {
        let filtered = [...services];

        if (searchTerm.trim() !== '') {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(service =>
                service.nom_service?.toLowerCase().includes(search) ||
                service.desc_service?.toLowerCase().includes(search) ||
                service.chef_service_details?.nom?.toLowerCase().includes(search) ||
                service.chef_service_details?.prenom?.toLowerCase().includes(search)
            );
        }

        setFilteredServices(filtered);
        setCurrentPage(1);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentServices = filteredServices.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleDelete = (service) => {
        setServiceToDelete(service);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!serviceToDelete) return;
        try {
            await deleteService(serviceToDelete.id);
            showSuccess(
                `Le service "${serviceToDelete.nom_service}" a été supprimé avec succès.`,
                'Service supprimé'
            );
            fetchServices();
        } catch (error) {
            showError(
                'Une erreur est survenue lors de la suppression du service. Veuillez réessayer.',
                'Échec de la suppression'
            );
        }
        setServiceToDelete(null);
    };

    const handleEdit = (service) => {
        setSelectedService(service);
        setShowEditModal(true);
    };

    const handleViewStats = (service) => {
        setSelectedService(service);
        setShowStatsModal(true);
    };

    const getServiceColor = (serviceName) => {
        const colors = [
            'blue', 'green', 'purple', 'orange', 'cyan', 'magenta', 'gold', 'red', 'geekblue', 'volcano'
        ];
        const hash = serviceName?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
        return colors[hash % colors.length];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <CustomDashboard linkList={newAdminNavLink} requiredRole={"admin"}>
            <AdminNavBar />

            <div className="p-6">
                {/* Modern gradient header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Services Management</h1>
                                <p className="text-sm opacity-90">
                                    {filteredServices.length} hospital service{filteredServices.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchServices}
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
                                Add Service
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, description, head of service..."
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
                ) : currentServices.length === 0 ? (
                    <div className="text-center py-12">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-xl text-gray-700 mb-2">
                            {searchTerm ? 'No service found' : 'No services'}
                        </h3>
                        <p className="text-gray-500">Manage hospital services from here</p>
                    </div>
                ) : (
                    <>
                        {/* Service cards grid */}
                        <div className="grid gap-4">
                            {currentServices.map((service) => (
                                <div
                                    key={service.id}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        {/* Main info */}
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Avatar */}
                                            <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-xl w-14 h-14 flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                                                <Building2 className="w-6 h-6" />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-lg font-bold text-gray-800">
                                                        {service.nom_service}
                                                    </h3>
                                                    <Tag color={getServiceColor(service.nom_service)}>
                                                        Service
                                                    </Tag>
                                                </div>

                                                {service.desc_service && (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                        <FileText className="w-3 h-3 inline mr-1" />
                                                        {service.desc_service}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-6 mt-2 text-sm text-gray-500 flex-wrap">
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="w-4 h-4" />
                                                        Head: {service.chef_service_details
                                                            ? `${service.chef_service_details.nom} ${service.chef_service_details.prenom}`
                                                            : 'Not assigned'}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        Created: {formatDate(service.date_creation)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 ml-4">
                                            <Tooltip title="View stats">
                                                <button
                                                    onClick={() => handleViewStats(service)}
                                                    className="p-2 text-primary-end hover:bg-primary-end/10 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <button
                                                    onClick={() => handleEdit(service)}
                                                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                >
                                                    <FaEdit className="w-5 h-5" />
                                                </button>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <button
                                                    onClick={() => handleDelete(service)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <FaTrash className="w-5 h-5" />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 px-2">
                                <p className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredServices.length)} of {filteredServices.length} services
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
            <AddServiceModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchServices} />
            <EditServiceModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={fetchServices} service={selectedService} />
            <ServiceStatsModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} service={selectedService} />
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Service"
                message={`Are you sure you want to delete the service "${serviceToDelete?.nom_service}"?`}
            />
        </CustomDashboard>
    );
}
