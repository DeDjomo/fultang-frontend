import { useEffect, useState, useCallback } from "react"
import { Search, Calendar, ChevronLeft, ChevronRight, Plus, RefreshCw, Clock } from "lucide-react"
import { DatePicker, Alert, Tag } from 'antd';
import { FaCheck, FaTimes } from 'react-icons/fa';
import AppointmentCard from "./DoctorComponents/AppointmentCard.jsx";
import { useAuthentication } from "../../Utils/Provider.jsx";
import { doctorNavLink } from "./lib/doctorNavLink.js";
import { DoctorNavBar } from "./DoctorComponents/DoctorNavBar.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { getRendezVousByMedecin } from "../../services/rendezvousApi.js";
import { createRendezVous, updateRendezVous } from "../../services/rendezVousApi.js";
import { searchPatients } from "../../services/patientsApi.js";
import { useFeedback } from "../../contexts/FeedbackContext.jsx";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";
import dayjs from 'dayjs';



export function AppointmentList() {
    const [filter, setFilter] = useState("upcoming");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const appointmentsPerPage = 5;
    const [appointmentList, setAppointmentList] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    // Create appointment modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [patientSearchResults, setPatientSearchResults] = useState([]);
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [formData, setFormData] = useState({
        matricule_patient: '',
        date_rendez_vous: null,
        heure_rendez_vous: null
    });
    const [formErrors, setFormErrors] = useState({});
    const [apiError, setApiError] = useState('');

    // Reschedule modal
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedAppointmentForReschedule, setSelectedAppointmentForReschedule] = useState(null);
    const [rescheduleData, setRescheduleData] = useState({
        date_rendez_vous: null,
        heure_rendez_vous: null
    });

    const { userData } = useAuthentication();
    const { showSuccess, showError } = useFeedback();

    const filteredAppointments = appointmentList.filter((appointment) => {
        const fullName = appointment?.id_patient?.prenom + " " + appointment?.id_patient?.nom;

        let matchesFilter = true;
        if (filter === "upcoming") {
            const appointmentDate = new Date(appointment?.date_heure);
            const now = new Date();
            matchesFilter = appointment?.statut === "en_attente" && appointmentDate > now;
        } else if (filter === "effectue") {
            matchesFilter = appointment?.statut === "effectue";
        } else if (filter !== "all") {
            matchesFilter = appointment?.statut === filter;
        }

        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesDate = dateFilter ? appointment?.date_heure?.split('T')[0] === dateFilter : true
        return matchesFilter && matchesSearch && matchesDate
    })


    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

    const paginate = (pageNumber) => setCurrentPage(pageNumber)

    const retrieveDoctorAppointments = useCallback(async (doctorId) => {
        setIsLoading(true);
        try {
            const response = await getRendezVousByMedecin(doctorId);
            setIsLoading(false);
            if (response.success) {
                setAppointmentList(response.data || []);
                setErrorStatus(null);
                setErrorMessage("");
            }
        }
        catch (error) {
            setIsLoading(false);
            console.log(error);
            setErrorStatus(error.response?.status || 500);
            setErrorMessage("Erreur lors de la récupération de vos rendez-vous, veuillez réessayer plus tard !");
        }
    }, []);

    useEffect(() => {
        if (userData.id) {
            retrieveDoctorAppointments(userData.id);
        }
    }, [userData.id, retrieveDoctorAppointments]);

    // Patient search for create modal
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
        if (formErrors.matricule_patient) {
            setFormErrors(prev => ({ ...prev, matricule_patient: null }));
        }
    };

    const resetCreateForm = () => {
        setFormData({ matricule_patient: '', date_rendez_vous: null, heure_rendez_vous: null });
        setSelectedPatient(null);
        setPatientSearchTerm('');
        setPatientSearchResults([]);
        setFormErrors({});
        setApiError('');
    };

    const validateCreateForm = () => {
        const errors = {};
        if (!formData.matricule_patient) errors.matricule_patient = "Veuillez selectionner un patient";
        if (!formData.date_rendez_vous) errors.date_rendez_vous = "Veuillez choisir une date";
        if (!formData.heure_rendez_vous) errors.heure_rendez_vous = "Veuillez choisir une heure";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateAppointment = async () => {
        if (!validateCreateForm()) return;
        setApiError('');

        try {
            const dataToSend = {
                matricule_patient: formData.matricule_patient,
                matricule_medecin: userData.matricule,
                date_rendez_vous: formData.date_rendez_vous.format('YYYY-MM-DD'),
                heure_rendez_vous: formData.heure_rendez_vous.format('HH:mm')
            };

            await createRendezVous(dataToSend);
            showSuccess('Le rendez-vous a été créé avec succès.', 'Rendez-vous créé');
            setShowCreateModal(false);
            resetCreateForm();
            retrieveDoctorAppointments(userData.id);
        } catch (error) {
            const errMsg = error.response?.data?.detail || error.response?.data?.error || "Une erreur s'est produite";
            setApiError(errMsg);
        }
    };

    // Reschedule functions
    const openRescheduleModal = (appointment) => {
        setSelectedAppointmentForReschedule(appointment);
        const appointmentDate = dayjs(appointment.date_heure);
        setRescheduleData({
            date_rendez_vous: appointmentDate,
            heure_rendez_vous: appointmentDate
        });
        setShowRescheduleModal(true);
    };

    const handleReschedule = async () => {
        if (!rescheduleData.date_rendez_vous || !rescheduleData.heure_rendez_vous) {
            showError('Veuillez sélectionner une nouvelle date et heure.', 'Champs requis');
            return;
        }

        try {
            await updateRendezVous(selectedAppointmentForReschedule.id, {
                date_rendez_vous: rescheduleData.date_rendez_vous.format('YYYY-MM-DD'),
                heure_rendez_vous: rescheduleData.heure_rendez_vous.format('HH:mm')
            });
            showSuccess('Le rendez-vous a été reporté avec succès.', 'Rendez-vous reporté');
            setShowRescheduleModal(false);
            setSelectedAppointmentForReschedule(null);
            retrieveDoctorAppointments(userData.id);
        } catch (error) {
            showError('Erreur lors du report du rendez-vous.', 'Échec');
        }
    };

    const applyFormStyle = (hasError = false) => {
        return `w-full px-4 py-2 border rounded-md focus:outline-none focus:border-2 focus:border-primary-end ${hasError ? 'border-red-500' : 'border-gray-300'}`;
    };


    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar />
            <div className="mx-auto p-6 h-fit">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">{`Appointments of Dr. ${(userData?.prenom || "") + " " + (userData?.nom || "")}`}</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg hover:opacity-90 transition-all shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        New Appointment
                    </button>
                </div>


                <div className="mb-8 space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setFilter("upcoming")}
                            className={`px-4 py-2 rounded-md hover:bg-primary-start text-white duration-300 transition-all ${filter === "upcoming" ? "bg-primary-end text-white font-bold " : "bg-gray-100 text-gray-800 hover:bg-gray-200"} transition-colors`}
                        >
                            Upcoming appointments
                        </button>
                        <button
                            onClick={() => setFilter("effectue")}
                            className={`px-4 py-2 rounded-md hover:bg-primary-start duration-300 transition-all  hover:text-white ${filter === "effectue" ? "bg-primary-end text-white font-bold " : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                } transition-colors`}
                        >
                            Honored appointments
                        </button>
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded-md  hover:bg-primary-start duration-300 transition-all hover:text-white ${filter === "all" ? "bg-primary-end text-white font-bold" : "bg-gray-100 text-gray-800 hover:bg-gray-200"} transition-colors`}
                        >
                            All appointments
                        </button>
                        <button
                            onClick={() => retrieveDoctorAppointments(userData.id)}
                            className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for a patient..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-0 focus:outline-none focus:border-2 focus:border-primary-end"
                            />
                        </div>
                        <div className="flex items-center">
                            <Calendar className="text-gray-400 mr-2" />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md  focus:ring-0 focus:outline-none focus:border-2 focus:border-primary-end "
                            />
                        </div>
                    </div>
                </div>

                {/* Liste des rendez-vous */}

                {isLoading ? (
                    <div className="h-[400px] w-full flex justify-center items-center">
                        <Loader size={"medium"} color={"primary-end"} />
                    </div>
                ) : (
                    errorStatus ? <ServerErrorPage errorStatus={errorStatus} message={errorMessage} /> : (
                        filteredAppointments.length > 0 ? (
                            <div className="space-y-6">
                                {currentAppointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                        onReschedule={() => openRescheduleModal(appointment)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 mt-24 flex items-center justify-center">
                                <div className="flex flex-col">
                                    <Calendar className="h-16 w-16 text-primary-end mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2 mx-auto">No Appointments
                                    </h2>
                                    <p className="text-gray-600 mb-4 mx-auto">There are currently no appointments
                                        scheduled.</p>
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            className="px-4 hover:bg-primary-start duration-300 mx-auto py-2 bg-primary-end text-white rounded-lg transition-all"
                                            onClick={() => setShowCreateModal(true)}
                                        >
                                            Create Appointment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    )
                )}

                {/* Pagination */}
                {appointmentList.length > appointmentsPerPage && (
                    <div className="mt-8 flex justify-center">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                            aria-label="Pagination">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                <span className="sr-only">Précédent</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {Array.from({ length: Math.ceil(appointmentList.length / appointmentsPerPage) }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => paginate(index + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === index + 1
                                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                        : "text-gray-500 hover:bg-gray-50"
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === Math.ceil(filteredAppointments.length / appointmentsPerPage)}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Create Appointment Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                        <div className="bg-gradient-to-r from-primary-end to-primary-start px-6 py-4 rounded-t-lg flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">New Appointment</h3>
                            <button onClick={() => { resetCreateForm(); setShowCreateModal(false); }} className="text-white hover:text-gray-200">
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        {apiError && (
                            <div className="px-6 pt-4">
                                <Alert type="error" message={apiError} showIcon closable onClose={() => setApiError('')} />
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
                                    placeholder="Search patient by name or matricule..."
                                    value={patientSearchTerm}
                                    onChange={(e) => handleSearchPatients(e.target.value)}
                                    className={applyFormStyle(formErrors.matricule_patient)}
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
                                {formErrors.matricule_patient && <p className="text-red-500 text-xs mt-1">{formErrors.matricule_patient}</p>}
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        value={formData.date_rendez_vous}
                                        onChange={(date) => setFormData(prev => ({ ...prev, date_rendez_vous: date }))}
                                        className={`w-full ${formErrors.date_rendez_vous ? 'border-red-500' : ''}`}
                                        placeholder="Select date"
                                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                                    />
                                    {formErrors.date_rendez_vous && <p className="text-red-500 text-xs mt-1">{formErrors.date_rendez_vous}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Time <span className="text-red-500">*</span>
                                    </label>
                                    <DatePicker
                                        picker="time"
                                        format="HH:mm"
                                        value={formData.heure_rendez_vous}
                                        onChange={(time) => setFormData(prev => ({ ...prev, heure_rendez_vous: time }))}
                                        className={`w-full ${formErrors.heure_rendez_vous ? 'border-red-500' : ''}`}
                                        placeholder="Select time"
                                        minuteStep={15}
                                    />
                                    {formErrors.heure_rendez_vous && <p className="text-red-500 text-xs mt-1">{formErrors.heure_rendez_vous}</p>}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-center space-x-4 pt-4">
                                <button
                                    onClick={handleCreateAppointment}
                                    className="px-6 py-2 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg font-bold hover:opacity-90"
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => { resetCreateForm(); setShowCreateModal(false); }}
                                    className="px-6 py-2 border bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {showRescheduleModal && selectedAppointmentForReschedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Reschedule Appointment
                            </h3>
                            <button onClick={() => setShowRescheduleModal(false)} className="text-white hover:text-gray-200">
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Current appointment info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Patient</p>
                                <p className="font-bold text-gray-800">
                                    {selectedAppointmentForReschedule.id_patient?.prenom} {selectedAppointmentForReschedule.id_patient?.nom}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">Current Date</p>
                                <p className="font-medium text-gray-700">
                                    {new Date(selectedAppointmentForReschedule.date_heure).toLocaleString('fr-FR')}
                                </p>
                            </div>

                            {/* New Date and Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        value={rescheduleData.date_rendez_vous}
                                        onChange={(date) => setRescheduleData(prev => ({ ...prev, date_rendez_vous: date }))}
                                        className="w-full"
                                        placeholder="Select date"
                                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                                    <DatePicker
                                        picker="time"
                                        format="HH:mm"
                                        value={rescheduleData.heure_rendez_vous}
                                        onChange={(time) => setRescheduleData(prev => ({ ...prev, heure_rendez_vous: time }))}
                                        className="w-full"
                                        placeholder="Select time"
                                        minuteStep={15}
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-center space-x-4 pt-4">
                                <button
                                    onClick={handleReschedule}
                                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:opacity-90"
                                >
                                    Reschedule
                                </button>
                                <button
                                    onClick={() => setShowRescheduleModal(false)}
                                    className="px-6 py-2 border bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CustomDashboard>
    )
}


