import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    User, FileText, Activity, Stethoscope, ArrowRight,
    Save, ArrowLeft, Phone, MapPin, Calendar, Droplet,
    Weight, Ruler, AlertCircle, Clock
} from 'lucide-react';
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import { nurseNavLink } from "./nurseNavLink.js";
import { NurseNavBar } from "./NurseNavBar.jsx";
import { useAuthentication } from "../../Utils/Provider.jsx";
import { useFeedback } from '../../contexts/FeedbackContext.jsx';
import Loader from "../../GlobalComponents/Loader.jsx";
import { getDossierByPatientId } from '../../services/dossiersApi';
import { createObservation } from '../../services/observationsApi';
import { rediriggerPatient, updateSessionStatus } from '../../services/sessionsApi';
import { getAllServices } from '../../services/servicesApi';
import { SendToCashierModal } from '../Modals/SendToCashierModal';
import { FaMoneyBillWave } from 'react-icons/fa';

export function PatientManagement() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { userData } = useAuthentication();

    const patient = state?.patient;
    const sessionId = state?.sessionId;
    const serviceName = state?.service;

    const [dossier, setDossier] = useState(null);
    const [observation, setObservation] = useState('');
    const [redirectType, setRedirectType] = useState('service');
    const [redirectValue, setRedirectValue] = useState('');
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDossier, setLoadingDossier] = useState(true);
    const [submittingObs, setSubmittingObs] = useState(false);
    const [submittingRedirect, setSubmittingRedirect] = useState(false);
    const [openSendToCashierModal, setOpenSendToCashierModal] = useState(false);
    const { showSuccess, showError, showWarning } = useFeedback();

    const personnelTypes = [
        { value: 'medecin', label: 'Medecin' },
        { value: 'laborantin', label: 'Laborantin' },
        { value: 'pharmacien', label: 'Pharmacien' },
        { value: 'caissier', label: 'Caissier' }
    ];

    useEffect(() => {
        if (!patient || !sessionId) {
            showError('Informations patient manquantes. Retour à la salle d\'attente.', 'Erreur');
            navigate('/nurse/waiting-room');
            return;
        }

        loadDossierPatient();
        loadServices();
    }, [patient]);

    const loadDossierPatient = async () => {
        try {
            setLoadingDossier(true);
            const response = await getDossierByPatientId(patient.id);
            const data = response.data || response;

            if (Array.isArray(data) && data.length > 0) {
                setDossier(data[0]);
            } else if (data && !Array.isArray(data)) {
                setDossier(data);
            }
        } catch (error) {
            console.error('Error loading dossier:', error);
        } finally {
            setLoadingDossier(false);
        }
    };

    const loadServices = async () => {
        try {
            const response = await getAllServices();
            const data = response.data || response.results || response || [];
            setServices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading services:', error);
        }
    };

    const handleSubmitObservation = async (e) => {
        e.preventDefault();

        if (!observation.trim()) {
            showWarning('Veuillez saisir une observation avant d\'enregistrer.', 'Champ requis');
            return;
        }

        try {
            setSubmittingObs(true);
            await createObservation({
                id_personnel: userData.id,
                observation: observation.trim(),
                id_session: sessionId
            });

            showSuccess('L\'observation a été enregistrée avec succès.', 'Observation enregistrée');
            setObservation('');
        } catch (error) {
            console.error('Error saving observation:', error);
            showError('Erreur lors de l\'enregistrement de l\'observation. Veuillez réessayer.', 'Échec de l\'enregistrement');
        } finally {
            setSubmittingObs(false);
        }
    };

    const handleRedirectPatient = async (e) => {
        e.preventDefault();

        if (!redirectValue) {
            showWarning('Veuillez sélectionner une destination.', 'Champ requis');
            return;
        }

        try {
            setSubmittingRedirect(true);

            await rediriggerPatient(sessionId, {
                type: redirectType,
                valeur: redirectValue
            });

            if (redirectType === 'personnel' && redirectValue.toLowerCase() === 'caissier') {
                await updateSessionStatus(sessionId, 'en attente');
            }

            showSuccess(`Le patient a été redirigé vers ${redirectValue} avec succès.`, 'Patient redirigé');

            setTimeout(() => {
                navigate('/nurse/waiting-room');
            }, 1000);
        } catch (error) {
            console.error('Error redirecting patient:', error);
            showError('Erreur lors de la redirection du patient. Veuillez réessayer.', 'Échec de la redirection');
        } finally {
            setSubmittingRedirect(false);
        }
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    if (!patient || !sessionId) {
        return null;
    }

    return (
        <DashBoard requiredRole={"infirmier"} linkList={nurseNavLink}>
            <NurseNavBar>
                <div className="min-h-screen p-6">
                    <button
                        className="flex text-xl font-bold text-primary-start items-start hover:text-primary-end transition-all duration-300 gap-2 mb-5"
                        onClick={() => navigate('/nurse/waiting-room')}
                    >
                        <ArrowLeft className="mt-1" />
                        <p>Retour a la salle d'attente</p>
                    </button>

                    <div className="bg-gradient-to-br from-primary-end to-primary-start rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                                <User className="w-12 h-12 text-black" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white">
                                    {patient.nom} {patient.prenom}
                                </h1>
                                <div className="mt-3.5 grid grid-cols-3 gap-4 font-semibold">
                                    <div className="flex items-center gap-2 text-white">
                                        <Calendar className="w-6 h-6" />
                                        <span>
                                            {patient.date_naissance
                                                ? `${patient.date_naissance} (${calculateAge(patient.date_naissance)} ans)`
                                                : 'Non available'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <FileText className="w-6 h-6" />
                                        <span>{patient.matricule}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <Phone className="w-6 h-6" />
                                        <span>{patient.contact}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-primary-end to-primary-start p-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <FileText className="w-7 h-7" />
                                    Dossier Medical
                                </h2>
                            </div>

                            <div className="p-6">
                                {loadingDossier ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader size="medium" color="primary-end" />
                                    </div>
                                ) : dossier ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="border-2 border-gray-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Droplet className="w-5 h-5" />
                                                    <span className="text-sm font-medium">Groupe Sanguin</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-800">
                                                    {dossier.groupe_sanguin || '-'} {dossier.facteur_rhesus || ''}
                                                </p>
                                            </div>
                                            <div className="border-2 border-gray-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Weight className="w-5 h-5" />
                                                    <span className="text-sm font-medium">Poids</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-800">
                                                    {dossier.poids ? `${dossier.poids} kg` : '-'}
                                                </p>
                                            </div>
                                            <div className="border-2 border-gray-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Ruler className="w-5 h-5" />
                                                    <span className="text-sm font-medium">Taille</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-800">
                                                    {dossier.taille ? `${dossier.taille} m` : '-'}
                                                </p>
                                            </div>
                                            <div className="border-2 border-gray-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Activity className="w-5 h-5" />
                                                    <span className="text-sm font-medium">IMC</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-800">
                                                    {dossier.poids && dossier.taille
                                                        ? (dossier.poids / (dossier.taille * dossier.taille)).toFixed(2)
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-2 border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                                <AlertCircle className="w-5 h-5" />
                                                <span className="text-md font-bold">Allergies</span>
                                            </div>
                                            <p className="text-gray-700">
                                                {dossier.allergies || 'No known allergies'}
                                            </p>
                                        </div>

                                        <div className="border-2 border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                                <Clock className="w-5 h-5" />
                                                <span className="text-md font-bold">Antecedents</span>
                                            </div>
                                            <p className="text-gray-700">
                                                {dossier.antecedents || 'No known medical history'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                                        <p className="text-lg font-medium">No medical record available</p>
                                        <p className="text-sm mt-1">Ce patient n'a pas encore de dossier medical enregistre</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-primary-end to-primary-start p-4">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        <Stethoscope className="w-7 h-7" />
                                        Observations Medicales
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmitObservation} className="p-6">
                                    <div className="mb-4">
                                        <label className="block text-md font-bold mb-2 text-gray-700">
                                            Nouvelle observation
                                        </label>
                                        <textarea
                                            value={observation}
                                            onChange={(e) => setObservation(e.target.value)}
                                            rows={6}
                                            className="w-full p-3 border-2 border-gray-400 rounded-md focus:outline-none focus:border-primary-end transition-all duration-300"
                                            placeholder="Exemple: Temperature: 37.5°C, Tension: 120/80, Pouls: 72 bpm. Patient stable et conscient..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingObs || !observation.trim()}
                                        className={`w-full py-3 px-6 rounded-md flex items-center justify-center gap-2 font-bold transition-all duration-300 ${submittingObs || !observation.trim()
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-primary-end to-primary-start text-white hover:opacity-70'
                                            }`}
                                    >
                                        <Save className="w-5 h-5" />
                                        {submittingObs ? 'Saving...' : 'Save Observation'}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-primary-end to-primary-start p-4">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        <ArrowRight className="w-7 h-7" />
                                        Redirecting...tient
                                    </h2>
                                </div>

                                <form onSubmit={handleRedirectPatient} className="p-6">
                                    <div className="mb-4">
                                        <label className="block text-md font-bold mb-3 text-gray-700">
                                            Type de redirection
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="service"
                                                    checked={redirectType === 'service'}
                                                    onChange={(e) => {
                                                        setRedirectType(e.target.value);
                                                        setRedirectValue('');
                                                    }}
                                                    className="w-5 h-5 text-primary-end focus:ring-primary-end"
                                                />
                                                <span className="font-medium">Service</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="personnel"
                                                    checked={redirectType === 'personnel'}
                                                    onChange={(e) => {
                                                        setRedirectType(e.target.value);
                                                        setRedirectValue('');
                                                    }}
                                                    className="w-5 h-5 text-primary-end focus:ring-primary-end"
                                                />
                                                <span className="font-medium">Personnel</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-md font-bold mb-2 text-gray-700">
                                            {redirectType === 'service' ? 'Selectionner un service' : 'Selectionner un type de personnel'}
                                        </label>
                                        <select
                                            value={redirectValue}
                                            onChange={(e) => setRedirectValue(e.target.value)}
                                            className="w-full p-3 border-2 border-gray-400 rounded-md focus:outline-none focus:border-primary-end transition-all duration-300"
                                        >
                                            <option value="">-- Selectionner --</option>
                                            {redirectType === 'service'
                                                ? services.map(service => (
                                                    <option key={service.id} value={service.nom_service}>
                                                        {service.nom_service}
                                                    </option>
                                                ))
                                                : personnelTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingRedirect || !redirectValue}
                                        className={`w-full py-3 px-6 rounded-md flex items-center justify-center gap-2 font-bold transition-all duration-300 ${submittingRedirect || !redirectValue
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-primary-end to-primary-start text-white hover:opacity-70'
                                            }`}
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                        {submittingRedirect ? 'Redirecting...' : 'Redirect Patient'}
                                    </button>

                                    <div className="mt-4 border-t pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setOpenSendToCashierModal(true)}
                                            className="w-full py-3 px-6 rounded-md flex items-center justify-center gap-2 font-bold transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600"
                                        >
                                            <FaMoneyBillWave className="w-5 h-5" />
                                            Envoyer à la caisse pour paiement
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </NurseNavBar>
            <SendToCashierModal
                isOpen={openSendToCashierModal}
                onClose={() => setOpenSendToCashierModal(false)}
                patient={patient}
                sessionId={sessionId}
                onSuccess={() => {
                    navigate('/nurse/waiting-room');
                }}
            />
        </DashBoard>
    );
}
