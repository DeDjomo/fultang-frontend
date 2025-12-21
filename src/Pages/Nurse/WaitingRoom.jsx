import { useState, useEffect } from 'react';
import { message, Tag, Tooltip, Alert } from 'antd';
import { FaSearch, FaUserCheck } from 'react-icons/fa';
import { Users } from 'lucide-react';
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import { nurseNavLink } from "./nurseNavLink.js";
import { NurseNavBar } from "./NurseNavBar.jsx";
import { getPatientsEnAttente, selectionnerPatient } from '../../services/sessionsApi';
import { getPersonnelById } from '../../services/personnelApi';
import { useAuthentication } from "../../Utils/Provider.jsx";
import { useNavigate } from 'react-router-dom';
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";

/**
 * Page de la salle d'attente pour les infirmiers.
 * Affiche la liste des patients en attente pour l'infirmier dans son service.
 */
export function WaitingRoom() {
    const { userData } = useAuthentication();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [serviceName, setServiceName] = useState('');

    useEffect(() => {
        const loadServiceAndPatients = async () => {
            if (!userData?.id) {
                console.warn("userData.id manquant");
                return;
            }

            try {
                // Récupérer les infos complètes du personnel via l'API
                console.log("Récupération du personnel ID:", userData.id);
                const response = await getPersonnelById(userData.id);
                console.log("Réponse complète:", response);

                // L'API retourne { success: true, data: { service_nom: "..." } }
                const personnel = response.data || response;
                console.log("Données personnel:", personnel);

                // Extraire le service_nom (nom textuel du service)
                const service = personnel.service_nom || personnel.departement;

                console.log("Service trouvé:", service);
                setServiceName(service || '');

                if (service) {
                    fetchPatientsEnAttente(service);
                } else {
                    setErrorMessage("Aucun service affecté. Veuillez contacter l'administrateur.");
                    console.error("Aucun service trouvé pour le personnel");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du service:", error);
                setErrorMessage("Impossible de récupérer vos informations de service.");
            }
        };

        if (userData) {
            loadServiceAndPatients();
        }
    }, [userData]);

    const fetchPatientsEnAttente = async (serviceToUse) => {
        const service = serviceToUse || serviceName || userData?.service;
        if (!service) return;

        setLoading(true);
        try {
            const response = await getPatientsEnAttente(service, 'infirmier');
            // API retourne { success: true, count: N, data: [...] }
            const data = response.data || response.results || response || [];
            setPatients(Array.isArray(data) ? data : []);
            setErrorStatus(null);
            setErrorMessage('');
        } catch (error) {
            console.error('Error fetching patients en attente:', error);
            setErrorMessage('Erreur lors du chargement des patients en attente');
            setErrorStatus(error.response?.status || 500);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPatient = async (patient) => {
        try {
            await selectionnerPatient(patient.id_session);
            message.success('Patient selectionne avec succes');
            navigate('/nurse/patient-management', {
                state: {
                    patient: patient,
                    sessionId: patient.id_session,
                    service: serviceName
                }
            });
        } catch (error) {
            console.error('Error selecting patient:', error);
            message.error('Erreur lors de la selection du patient');
        }
    };

    // Tous les patients retournés sont en attente (pas de champ situation dans l'API)
    const getStatusTag = () => {
        return <Tag color="orange">En attente</Tag>;
    };

    const filteredPatients = patients.filter(patient => {
        const searchLower = searchTerm.toLowerCase();
        const patientName = `${patient.nom || ''} ${patient.prenom || ''}`.toLowerCase();
        const matricule = (patient.matricule || '').toLowerCase();
        return patientName.includes(searchLower) || matricule.includes(searchLower);
    });

    return (
        <DashBoard requiredRole={"infirmier"} linkList={nurseNavLink}>
            <NurseNavBar>
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between mb-5">
                        <div className="flex flex-col ml-5">
                            <p className="font-bold text-3xl mt-2">Salle d'attente</p>
                            <p className="text-gray-500 text-md">
                                Service: {serviceName || 'Non defini'}
                            </p>
                        </div>
                        <div className="flex mr-5 mt-2">
                            <div className="flex w-[300px] h-10 border-2 border-secondary rounded-lg">
                                <FaSearch className="text-xl text-secondary m-2" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un patient..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-none focus:outline-none focus:ring-0 w-full"
                                />
                            </div>
                            <button
                                onClick={() => fetchPatientsEnAttente(serviceName)}
                                className="ml-2 w-24 h-10 text-white bg-secondary rounded-lg hover:bg-primary-end transition-all duration-300"
                            >
                                Actualiser
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="h-[500px] w-full flex justify-center items-center">
                            <Loader size={"medium"} color={"primary-end"} />
                        </div>
                    ) : errorStatus ? (
                        <ServerErrorPage errorStatus={errorStatus} message={errorMessage} />
                    ) : filteredPatients.length > 0 ? (
                        <div className="ml-5 mr-5">
                            <table className="w-full border-separate border-spacing-y-2">
                                <thead>
                                    <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                                        <th className="text-center text-white p-4 text-xl font-bold rounded-l-2xl">No</th>
                                        <th className="text-center text-white p-4 text-xl font-bold">Patient</th>
                                        <th className="text-center text-white p-4 text-xl font-bold">Matricule</th>
                                        <th className="text-center text-white p-4 text-xl font-bold">Contact</th>
                                        <th className="text-center text-white p-4 text-xl font-bold">Statut</th>
                                        <th className="text-center text-white p-4 text-xl font-bold">Heure d'arrivee</th>
                                        <th className="text-center text-white p-4 text-xl font-bold rounded-r-2xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((patient, index) => (
                                        <tr key={patient.id || index} className="bg-gray-100">
                                            <td className="p-4 text-md text-blue-900 rounded-l-lg text-center">
                                                {index + 1}
                                            </td>
                                            <td className="p-4 text-md text-center font-bold">
                                                {patient.nom} {patient.prenom}
                                            </td>
                                            <td className="p-4 text-md text-center text-gray-600">
                                                {patient.matricule}
                                            </td>
                                            <td className="p-4 text-md text-center text-gray-600">
                                                {patient.contact || '-'}
                                            </td>
                                            <td className="p-4 text-md text-center">
                                                {getStatusTag()}
                                            </td>
                                            <td className="p-4 text-md text-center">
                                                {patient.debut_session ?
                                                    new Date(patient.debut_session).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : '-'
                                                }
                                            </td>
                                            <td className="p-4 relative rounded-r-lg">
                                                <div className="w-full items-center justify-center flex gap-4">
                                                    <Tooltip title="Selectionner ce patient">
                                                        <button
                                                            onClick={() => handleSelectPatient(patient)}
                                                            className="flex items-center justify-center w-9 h-9 text-green-600 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300"
                                                        >
                                                            <FaUserCheck />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center mt-20">
                            <Users className="w-36 h-36 text-gray-300" />
                            <h3 className="font-bold text-2xl mt-4 mb-2 text-gray-800">
                                Aucun patient en attente
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-xl text-md font-medium">
                                {serviceName ?
                                    `Il n'y a actuellement aucun patient en attente dans le service ${serviceName}.` :
                                    "Veuillez verifier votre affectation a un service."}
                            </p>
                        </div>
                    )}
                </div>
            </NurseNavBar>
        </DashBoard>
    );
}
