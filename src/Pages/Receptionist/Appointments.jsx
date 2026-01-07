import { useState, useEffect } from 'react';
import { Modal, message, DatePicker, Alert, Tooltip } from 'antd';
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { XIcon, Calendar, Search, RefreshCw, Clock, User, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import { receptionistNavLink } from "./receptionistNavLink.js";
import { ReceptionistNavBar } from "./ReceptionistNavBar.jsx";
import { getAllRendezVous, createRendezVous } from '../../services/rendezVousApi';
import { getAllMedecins } from '../../services/medecinsApi';
import { searchPatients } from '../../services/patientsApi';
import Loader from "../../GlobalComponents/Loader.jsx";
import dayjs from 'dayjs';

/**
 * Appointments page with pagination and modern design.
 * Note: Delete functionality removed for receptionist role.
 */
export function Appointments() {
    const [rendezVous, setRendezVous] = useState([]);
    const [filteredRendezVous, setFilteredRendezVous] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [medecins, setMedecins] = useState([]);
    const [patientSearchResults, setPatientSearchResults] = useState([]);
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const [formData, setFormData] = useState({
        matricule_patient: '',
        matricule_medecin: '',
        date_rendez_vous: null,
        heure_rendez_vous: null
    });

    useEffect(() => {
        fetchRendezVous();
        fetchMedecins();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, rendezVous]);

    const fetchRendezVous = async () => {
        setLoading(true);
        try {
            const response = await getAllRendezVous();
            const data = response.data || response.results || [];
            setRendezVous(data);
            setFilteredRendezVous(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMedecins = async () => {
        try {
            const response = await getAllMedecins();
            const data = response.data || response.results || [];
            setMedecins(data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...rendezVous];

        if (searchTerm.trim() !== '') {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(rdv => {
                const patientName = `${rdv.patient_nom || ''} ${rdv.patient_prenom || ''}`.toLowerCase();
                const medecinName = `${rdv.medecin_nom || ''} ${rdv.medecin_prenom || ''}`.toLowerCase();
                return patientName.includes(search) || medecinName.includes(search);
            });
        }

        setFilteredRendezVous(filtered);
        setCurrentPage(1);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredRendezVous.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRendezVous = filteredRendezVous.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleSearchPatients = async (query) => {
        setPatientSearchTerm(query);
        if (query.length < 2) {
            setPatientSearchResults([]);
            return;
        }
        try {
            const response = await searchPatients(query);
            const data = response.results || response.data || [];
            setPatientSearchResults(data);
        } catch (error) {
            console.error('Error searching patients:', error);
        }
    };

    const selectPatient = (patient) => {
        setSelectedPatient(patient);
        setFormData(prev => ({ ...prev, matricule_patient: patient.matricule }));
        setPatientSearchResults([]);
        setPatientSearchTerm(`${patient.nom} ${patient.prenom} (${patient.matricule})`);
        if (errors.matricule_patient) {
            setErrors(prev => ({ ...prev, matricule_patient: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.matricule_patient) newErrors.matricule_patient = "Please select a patient";
        if (!formData.matricule_medecin) newErrors.matricule_medecin = "Please select a doctor";
        if (!formData.date_rendez_vous) newErrors.date_rendez_vous = "Please choose a date";
        if (!formData.heure_rendez_vous) newErrors.heure_rendez_vous = "Please choose a time";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatApiErrors = (errorData) => {
        if (errorData?.erreurs) {
            const messages = [];
            for (const [field, fieldErrors] of Object.entries(errorData.erreurs)) {
                const errorList = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
                messages.push(`${field}: ${errorList.join(', ')}`);
            }
            return messages.join('\n');
        }
        return errorData?.detail || errorData?.error || "An error occurred";
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setApiError('');

        try {
            const dataToSend = {
                matricule_patient: formData.matricule_patient,
                matricule_medecin: formData.matricule_medecin,
                date_rendez_vous: formData.date_rendez_vous.format('YYYY-MM-DD'),
                heure_rendez_vous: formData.heure_rendez_vous.format('HH:mm')
            };

            await createRendezVous(dataToSend);
            message.success('Appointment created successfully');
            setShowAddModal(false);
            resetForm();
            fetchRendezVous();
        } catch (error) {
            const errorMsg = formatApiErrors(error.response?.data);
            setApiError(errorMsg);
        }
    };

    const resetForm = () => {
        setFormData({ matricule_patient: '', matricule_medecin: '', date_rendez_vous: null, heure_rendez_vous: null });
        setSelectedPatient(null);
        setPatientSearchTerm('');
        setPatientSearchResults([]);
        setErrors({});
        setApiError('');
    };

    const getStatutConfig = (statut) => {
        const config = {
            'en_attente': { color: 'orange', label: 'Pending', bg: 'bg-orange-100', text: 'text-orange-700' },
            'effectue': { color: 'green', label: 'Completed', bg: 'bg-green-100', text: 'text-green-700' },
            'annule': { color: 'red', label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' }
        };
        return config[statut] || { color: 'default', label: statut, bg: 'bg-gray-100', text: 'text-gray-700' };
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return { date: 'N/A', time: 'N/A' };
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const applyFormStyle = (hasError = false) => {
        return `w-full px-4 py-2 border rounded-md focus:outline-none focus:border-2 focus:border-primary-end ${hasError ? 'border-red-500' : 'border-gray-300'}`;
    };

    return (
        <DashBoard requiredRole={"receptioniste"} linkList={receptionistNavLink}>
            <ReceptionistNavBar />

            <div className="p-6">
                {/* Modern gradient header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Appointments List</h1>
                                <p className="text-sm opacity-90">
                                    {filteredRendezVous.length} scheduled appointment{filteredRendezVous.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchRendezVous}
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
                                <FaPlus className="w-4 h-4" />
                                New Appointment
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
                            placeholder="Search by patient or doctor..."
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
                ) : currentRendezVous.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-xl text-gray-700 mb-2">
                            {searchTerm ? 'No appointment found' : 'No scheduled appointments'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'Try with different search terms' : 'Start by creating a new appointment'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-end text-white rounded-lg mx-auto hover:bg-primary-start transition-colors"
                            >
                                <FaPlus />
                                New Appointment
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Cards grid */}
                        <div className="grid gap-4">
                            {currentRendezVous.map((rdv) => {
                                const statusConfig = getStatutConfig(rdv.statut);
                                const { date, time } = formatDateTime(rdv.date_heure);

                                return (
                                    <div
                                        key={rdv.id}
                                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between">
                                            {/* Main info */}
                                            <div className="flex items-center gap-4 flex-1">
                                                {/* Date/Time */}
                                                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-xl w-16 h-16 flex flex-col items-center justify-center shadow-md flex-shrink-0">
                                                    <Clock className="w-4 h-4 mb-1" />
                                                    <span className="text-lg font-bold">{time}</span>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h3 className="text-lg font-bold text-gray-800">
                                                            {rdv.patient_nom} {rdv.patient_prenom}
                                                        </h3>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-6 mt-2 text-sm text-gray-500 flex-wrap">
                                                        <span className="flex items-center gap-1.5 font-mono">
                                                            <User className="w-4 h-4" />
                                                            {rdv.patient_matricule}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Stethoscope className="w-4 h-4" />
                                                            Dr. {rdv.medecin_nom} {rdv.medecin_prenom}
                                                            {rdv.medecin_specialite && <span className="text-gray-400">({rdv.medecin_specialite})</span>}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4" />
                                                            {date}
                                                        </span>
                                                    </div>
                                                </div>
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
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredRendezVous.length)} of {filteredRendezVous.length} appointments
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

            {/* Add appointment modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                        <div className="bg-gradient-to-r from-primary-end to-primary-start px-6 py-4 rounded-t-lg flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-white">New Appointment</h3>
                            <button onClick={() => { resetForm(); setShowAddModal(false); }} className="text-white hover:text-gray-200">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {apiError && (
                            <div className="px-6 pt-4">
                                <Alert
                                    type="error"
                                    message={apiError}
                                    showIcon
                                    closable
                                    onClose={() => setApiError('')}
                                />
                            </div>
                        )}

                        <div className="p-6 space-y-5">
                            {/* Patient search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search patient by name or ID..."
                                    value={patientSearchTerm}
                                    onChange={(e) => handleSearchPatients(e.target.value)}
                                    className={applyFormStyle(errors.matricule_patient)}
                                />
                                {patientSearchResults.length > 0 && (
                                    <div className="border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto bg-white shadow-md">
                                        {patientSearchResults.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => selectPatient(p)}
                                                className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                            >
                                                <span className="font-bold">{p.nom} {p.prenom}</span>
                                                <span className="text-gray-500 ml-2">({p.matricule})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedPatient && (
                                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md flex justify-between items-center">
                                        <span className="text-green-800">
                                            <FaCheck className="inline mr-2" />
                                            {selectedPatient.nom} {selectedPatient.prenom} - {selectedPatient.matricule}
                                        </span>
                                        <button onClick={() => { setSelectedPatient(null); setPatientSearchTerm(''); setFormData(prev => ({ ...prev, matricule_patient: '' })); }}>
                                            <FaTimes className="text-red-500" />
                                        </button>
                                    </div>
                                )}
                                {errors.matricule_patient && <p className="text-red-500 text-xs mt-1">{errors.matricule_patient}</p>}
                            </div>

                            {/* Doctor selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Doctor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.matricule_medecin}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, matricule_medecin: e.target.value }));
                                        if (errors.matricule_medecin) setErrors(prev => ({ ...prev, matricule_medecin: null }));
                                    }}
                                    className={applyFormStyle(errors.matricule_medecin)}
                                >
                                    <option value="">Select a doctor</option>
                                    {medecins.map(m => (
                                        <option key={m.id} value={m.matricule}>Dr. {m.nom} {m.prenom} - {m.specialite}</option>
                                    ))}
                                </select>
                                {errors.matricule_medecin && <p className="text-red-500 text-xs mt-1">{errors.matricule_medecin}</p>}
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <DatePicker
                                        format="MM/DD/YYYY"
                                        value={formData.date_rendez_vous}
                                        onChange={(date) => {
                                            setFormData(prev => ({ ...prev, date_rendez_vous: date }));
                                            if (errors.date_rendez_vous) setErrors(prev => ({ ...prev, date_rendez_vous: null }));
                                        }}
                                        className={`w-full ${errors.date_rendez_vous ? 'border-red-500' : ''}`}
                                        placeholder="Select date"
                                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                                    />
                                    {errors.date_rendez_vous && <p className="text-red-500 text-xs mt-1">{errors.date_rendez_vous}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Time <span className="text-red-500">*</span>
                                    </label>
                                    <DatePicker
                                        picker="time"
                                        format="HH:mm"
                                        value={formData.heure_rendez_vous}
                                        onChange={(time) => {
                                            setFormData(prev => ({ ...prev, heure_rendez_vous: time }));
                                            if (errors.heure_rendez_vous) setErrors(prev => ({ ...prev, heure_rendez_vous: null }));
                                        }}
                                        className={`w-full ${errors.heure_rendez_vous ? 'border-red-500' : ''}`}
                                        placeholder="Select time"
                                        minuteStep={15}
                                    />
                                    {errors.heure_rendez_vous && <p className="text-red-500 text-xs mt-1">{errors.heure_rendez_vous}</p>}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-center space-x-4 pt-4">
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg font-bold hover:opacity-90 transition-all duration-300"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => { resetForm(); setShowAddModal(false); }}
                                    className="px-6 py-2 border bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashBoard>
    );
}