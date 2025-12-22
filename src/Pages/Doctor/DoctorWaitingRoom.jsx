import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, RefreshCw, UserCheck } from 'lucide-react';
import { message } from 'antd';
import { DoctorNavBar } from './DoctorComponents/DoctorNavBar';
import { CustomDashboard } from '../../GlobalComponents/CustomDashboard';
import { doctorNavLink } from './lib/doctorNavLink';
import { useAuthentication } from '../../Utils/Provider';
import { getPatientsEnAttente, selectionnerPatient } from '../../services/medecinsApi';
import { getPersonnelById } from '../../services/personnelApi';
import Loader from '../../GlobalComponents/Loader';

export function DoctorWaitingRoom() {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [serviceName, setServiceName] = useState('');
    const { userData } = useAuthentication();
    const navigate = useNavigate();

    useEffect(() => {
        const loadServiceAndPatients = async () => {
            if (!userData?.id) {
                console.warn("userData.id manquant");
                return;
            }

            try {
                // Récupérer les infos complètes du médecin via l'API
                console.log("Récupération du médecin ID:", userData.id);
                const response = await getPersonnelById(userData.id);
                console.log("Réponse complète:", response);

                // L'API retourne { success: true, data: { service_nom: "..." } }
                const personnel = response.data || response;
                console.log("Données médecin:", personnel);

                // Extraire le service_nom (nom textuel du service)
                const service = personnel.service_nom;

                console.log("Service trouvé:", service);
                setServiceName(service || '');

                if (service) {
                    fetchPatientsEnAttente(service);
                } else {
                    message.error("Aucun service affecté. Veuillez contacter l'administrateur.");
                    console.error("Aucun service trouvé pour le médecin");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du service:", error);
                message.error("Impossible de récupérer vos informations de service.");
            }
        };

        if (userData) {
            loadServiceAndPatients();
        }
    }, [userData]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPatients(patients);
        } else {
            const filtered = patients.filter(patient =>
                patient.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPatients(filtered);
        }
    }, [searchTerm, patients]);

    const fetchPatientsEnAttente = async (service) => {
        setIsLoading(true);
        try {
            const response = await getPatientsEnAttente(service);
            if (response.success) {
                setPatients(response.data || []);
                setFilteredPatients(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            message.error('Erreur lors de la récupération des patients');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPatient = async (patient) => {
        try {
            await selectionnerPatient(patient.id_session);
            navigate('/doctor/consultation', {
                state: {
                    patient: patient,
                    sessionId: patient.id_session,
                    service: serviceName
                }
            });
        } catch (error) {
            console.error('Error selecting patient:', error);
            message.error('Erreur lors de la sélection du patient');
        }
    };

    const handleRefresh = () => {
        if (serviceName) {
            fetchPatientsEnAttente(serviceName);
        }
    };

    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole="Doctor">
            <DoctorNavBar />
            <div className="p-6">
                {/* Header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Doctor's Waiting Room</h1>
                                <p className="text-sm opacity-90">Service: {serviceName || 'Non défini'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 bg-white text-primary-end px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un patient (nom, prénom, matricule)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end"
                        />
                    </div>
                </div>

                {/* Patients List */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader size="medium" color="primary-end" />
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? 'Aucun patient trouvé' : 'Aucun patient en attente'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredPatients.map((patient) => (
                            <div
                                key={patient.id_session}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-primary-end text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                                                {patient.prenom?.[0]}{patient.nom?.[0]}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {patient.prenom} {patient.nom}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Matricule: {patient.matricule}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="ml-15 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Contact:</span> {patient.contact || 'N/A'}
                                            </div>
                                            <div>
                                                <span className="font-medium">Âge:</span> {patient.age || 'N/A'} ans
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSelectPatient(patient)}
                                        className="flex items-center gap-2 bg-gradient-to-r from-primary-end to-primary-start text-white px-6 py-3 rounded-lg hover:opacity-80 transition-opacity"
                                    >
                                        <UserCheck className="w-5 h-5" />
                                        Consulter
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Statistics */}
                {!isLoading && (
                    <div className="mt-6 text-center text-gray-600">
                        <p>
                            {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} en attente
                            {searchTerm && ` sur ${patients.length} total`}
                        </p>
                    </div>
                )}
            </div>
        </CustomDashboard>
    );
}
