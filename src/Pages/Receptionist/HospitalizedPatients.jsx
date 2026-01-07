import { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import { receptionistNavLink } from "./receptionistNavLink.js";
import { ReceptionistNavBar } from "./ReceptionistNavBar.jsx";
import { getHospitalizedPatients } from '../../services/patientsApi';
import Loader from "../../GlobalComponents/Loader.jsx";
import { BedDouble, Search, RefreshCw, Eye, Calendar, ChevronLeft, ChevronRight, User } from 'lucide-react';

/**
 * Hospitalized patients page with pagination and modern design.
 */
export function HospitalizedPatients() {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        fetchHospitalizedPatients();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, patients]);

    const fetchHospitalizedPatients = async () => {
        setLoading(true);
        try {
            const response = await getHospitalizedPatients();
            const data = response.data || response.results || [];
            setPatients(data);
            setFilteredPatients(data);
        } catch (error) {
            console.error('Error fetching hospitalized patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...patients];

        if (searchTerm.trim() !== '') {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(patient =>
                patient.nom?.toLowerCase().includes(search) ||
                patient.prenom?.toLowerCase().includes(search) ||
                patient.matricule?.toLowerCase().includes(search) ||
                patient.hospitalisation?.chambre?.numero_chambre?.toLowerCase().includes(search)
            );
        }

        setFilteredPatients(filtered);
        setCurrentPage(1);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPatients = filteredPatients.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusConfig = (statut) => {
        switch (statut) {
            case 'en_cours': return { bg: 'bg-green-100', text: 'text-green-700', label: 'Ongoing' };
            case 'termine': return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed' };
            default: return { bg: 'bg-blue-100', text: 'text-blue-700', label: statut || 'Ongoing' };
        }
    };

    return (
        <DashBoard requiredRole={"receptioniste"} linkList={receptionistNavLink}>
            <ReceptionistNavBar />

            <div className="p-6">
                {/* Modern gradient header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <BedDouble className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Hospitalized Patients</h1>
                                <p className="text-sm opacity-90">
                                    {filteredPatients.length} currently hospitalized patient{filteredPatients.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={fetchHospitalizedPatients}
                            className="flex items-center gap-2 bg-white text-primary-end px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Search bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, room..."
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
                ) : currentPatients.length === 0 ? (
                    <div className="text-center py-12">
                        <BedDouble className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-xl text-gray-700 mb-2">
                            {searchTerm ? 'No patient found' : 'No hospitalized patients'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try with different search terms' : 'There are currently no hospitalized patients'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Cards grid */}
                        <div className="grid gap-4">
                            {currentPatients.map((patient, index) => {
                                const statusConfig = getStatusConfig(patient.hospitalisation?.statut);

                                return (
                                    <div
                                        key={`${patient.id}-${index}`}
                                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between">
                                            {/* Main info */}
                                            <div className="flex items-center gap-4 flex-1">
                                                {/* Avatar */}
                                                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                                                    {patient.prenom?.[0]}{patient.nom?.[0]}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h3 className="text-lg font-bold text-gray-800">
                                                            {patient.nom} {patient.prenom}
                                                        </h3>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-6 mt-2 text-sm text-gray-500 flex-wrap">
                                                        <span className="flex items-center gap-1.5 font-mono">
                                                            <User className="w-4 h-4" />
                                                            {patient.matricule}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <BedDouble className="w-4 h-4" />
                                                            Room: <span className="font-semibold text-blue-600">{patient.hospitalisation?.chambre?.numero_chambre || '-'}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4" />
                                                            Since: {formatDate(patient.hospitalisation?.debut)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 ml-4">
                                                <Tooltip title="View details">
                                                    <button className="p-2 text-primary-end hover:bg-primary-end/10 rounded-lg transition-colors">
                                                        <Eye className="w-5 h-5" />
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
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredPatients.length)} of {filteredPatients.length} patients
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
        </DashBoard>
    );
}
