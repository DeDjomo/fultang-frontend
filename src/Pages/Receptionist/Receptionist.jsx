import { ReceptionistNavBar } from "./ReceptionistNavBar.jsx";
import { FaEdit, FaPlus, FaMoneyBillWave } from "react-icons/fa";
import { FolderOpen, Users, Search, RefreshCw, Eye, Phone, ChevronLeft, ChevronRight, Calendar, CreditCard } from 'lucide-react';

import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import { receptionistNavLink } from "./receptionistNavLink.js";
import { useEffect, useState, useCallback } from "react";
import { AddNewPatientModal } from "./addNewPatientModal.jsx";
import { SuccessModal } from "../Modals/SuccessModal.jsx";
import Wait from "../Modals/wait.jsx";
import { ViewPatientDetailsModal } from "./ViewPatientDetailsModal.jsx";
import { EditPatientInfosModal } from "./EditPatientInfosModal.jsx";
import { OpenSessionModal } from "./OpenSessionModal.jsx";

import { Button, Tag, Space, Table, Input, Tooltip, Dropdown, Menu } from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    MoreOutlined,
    UserOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { getAllPatients } from '../../services/patientsApi';
import { useFeedback } from '../../contexts/FeedbackContext.jsx';
import { useAutoRefresh, deepEqual, useWebSocket } from '../../hooks/usePolling';
import Loader from '../../GlobalComponents/Loader';


export function Receptionist() {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorStatus, setErrorStatus] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState('');
    const searchText = searchTerm;

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const startIndex = (currentPage - 1) * itemsPerPage;

    const [canOpenAddNewPatientModal, setCanOpenAddNewPatientModal] = useState(false);
    const [canOpenEditPatientDetailModal, setCanOpenEditPatientDetailModal] = useState(false);
    const [canOpenViewPatientDetailModal, setCanOpenViewPatientDetailModal] = useState(false);
    const [canOpenSessionModal, setCanOpenSessionModal] = useState(false);
    const [canOpenSendToCashierModal, setCanOpenSendToCashierModal] = useState(false);
    const [canOpenSuccessModal, setCanOPenSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);

    const waitData = loading;

    const navigate = useNavigate();
    const { showSuccess, showError } = useFeedback();

    const fetchPatients = useCallback(async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const response = await getAllPatients();
            // L'API peut retourner { results: [...] } ou directement [...]
            const data = response.data || response.results || response || [];
            if (Array.isArray(data)) {
                setPatients(prev => deepEqual(prev, data) ? prev : data);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            // Suppression de l'erreur pendant le polling
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // WebSocket for real-time updates (replaces polling)
    const { isConnected } = useWebSocket((message) => {
        if (message.model === 'patient') {
            console.log('[Receptionist] Patient updated via WebSocket:', message.action);
            fetchPatients(true); // Background refresh
        }
    });

    useEffect(() => {
        if (!searchText) {
            setFilteredPatients(patients);
        } else {
            const lowerSearch = searchText.toLowerCase();
            const filtered = patients.filter(patient =>
                patient.nom?.toLowerCase().includes(lowerSearch) ||
                patient.prenom?.toLowerCase().includes(lowerSearch) ||
                patient.matricule?.toLowerCase().includes(lowerSearch) ||
                patient.telephone?.includes(lowerSearch)
            );
            if (!deepEqual(filteredPatients, filtered)) {
                setFilteredPatients(filtered);
            }
        }
    }, [searchText, patients]);
    // Pagination logic
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    const endIndex = startIndex + itemsPerPage;
    const currentPatients = filteredPatients.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const calculateAge = (dateNaissance) => {
        if (!dateNaissance) return null;
        const today = new Date();
        const birth = new Date(dateNaissance);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getGenderColor = (genre) => {
        if (genre?.toLowerCase() === 'masculin' || genre?.toLowerCase() === 'm') {
            return 'blue';
        }
        return 'pink';
    };

    return (
        <DashBoard linkList={receptionistNavLink} requiredRole={"receptioniste"}>
            <ReceptionistNavBar />

            <div className="p-6">
                {/* Modern gradient header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Patients List</h1>
                                <p className="text-sm opacity-90">
                                    {filteredPatients.length} registered patient{filteredPatients.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchPatients}
                                className="flex items-center gap-2 bg-white text-primary-end px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                disabled={waitData}
                            >
                                <RefreshCw className={`w-5 h-5 ${waitData ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setCanOpenAddNewPatientModal(true)}
                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <FaPlus className="w-4 h-4" />
                                New Patient
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
                            placeholder="Search by name, ID, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end transition-colors"
                        />
                    </div>
                </div>

                {/* Main content */}
                {waitData ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader size="medium" color="primary-end" />
                    </div>
                ) : errorStatus ? (
                    <div className="mt-16">
                        <ServerErrorPage errorStatus={errorStatus} message={errorMessage} />
                    </div>
                ) : currentPatients.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-xl text-gray-700 mb-2">
                            {searchTerm ? 'No patient found' : 'No registered patients'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'Try with different search terms' : 'Start by adding a new patient'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setCanOpenAddNewPatientModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-end text-white rounded-lg mx-auto hover:bg-primary-start transition-colors"
                            >
                                <FaPlus />
                                Add a patient
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Patient cards grid */}
                        <div className="grid gap-4">
                            {currentPatients.map((patient, index) => {
                                const age = calculateAge(patient.date_naissance);

                                return (
                                    <div
                                        key={patient.id || index}
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
                                                        {patient.genre && (
                                                            <Tag color={getGenderColor(patient.genre)}>
                                                                {patient.genre}
                                                            </Tag>
                                                        )}
                                                        {age !== null && (
                                                            <span className="text-sm text-gray-500">{age} years</span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-6 mt-2 text-sm text-gray-500 flex-wrap">
                                                        <span className="flex items-center gap-1.5 font-mono">
                                                            <CreditCard className="w-4 h-4" />
                                                            {patient.matricule}
                                                        </span>
                                                        {patient.contact && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Phone className="w-4 h-4" />
                                                                {patient.contact}
                                                            </span>
                                                        )}
                                                        {patient.date_naissance && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(patient.date_naissance).toLocaleDateString('en-US')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 ml-4">
                                                <Tooltip title="View details">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPatientDetails(patient);
                                                            setCanOpenViewPatientDetailModal(true);
                                                        }}
                                                        className="p-2 text-primary-end hover:bg-primary-end/10 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPatientDetails(patient);
                                                            setCanOpenEditPatientDetailModal(true);
                                                        }}
                                                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                    >
                                                        <FaEdit className="w-5 h-5" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Open session">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPatientDetails(patient);
                                                            setCanOpenSessionModal(true);
                                                        }}
                                                        className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                    >
                                                        <FolderOpen className="w-5 h-5" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Send to cashier">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPatientDetails(patient);
                                                            setCanOpenSendToCashierModal(true);
                                                        }}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <FaMoneyBillWave className="w-5 h-5" />
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

            {/* Modals */}
            <AddNewPatientModal
                isOpen={canOpenAddNewPatientModal}
                onClose={() => setCanOpenAddNewPatientModal(false)}
                setCanOpenSuccessModal={setCanOPenSuccessModal}
                setSuccessMessage={setSuccessMessage}
                setIsLoading={setIsLoading}
            />
            <EditPatientInfosModal
                isOpen={canOpenEditPatientDetailModal}
                onClose={() => setCanOpenEditPatientDetailModal(false)}
                setCanOpenSuccessModal={setCanOPenSuccessModal}
                setSuccessMessage={setSuccessMessage}
                setIsLoading={setIsLoading}
                patientData={selectedPatientDetails}
            />
            <SuccessModal
                isOpen={canOpenSuccessModal}
                message={successMessage}
                canOpenSuccessModal={setCanOPenSuccessModal}
                makeAction={() => window.location.reload()}
            />
            <ViewPatientDetailsModal
                isOpen={canOpenViewPatientDetailModal}
                patient={selectedPatientDetails}
                onClose={() => setCanOpenViewPatientDetailModal(false)}
            />
            <OpenSessionModal
                isOpen={canOpenSessionModal}
                onClose={() => setCanOpenSessionModal(false)}
                patient={selectedPatientDetails}
                onSuccess={() => {
                    setSuccessMessage("Session opened successfully!");
                    setCanOPenSuccessModal(true);
                }}
            />
            <OpenSessionModal
                isOpen={canOpenSendToCashierModal}
                onClose={() => setCanOpenSendToCashierModal(false)}
                patient={selectedPatientDetails}
                mode="cashier"
                onSuccess={() => {
                    setSuccessMessage("Patient sent to cashier successfully!");
                    setCanOPenSuccessModal(true);
                }}
            />
            {isLoading && <Wait />}
        </DashBoard>
    );
}