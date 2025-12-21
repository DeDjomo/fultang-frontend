import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, message, Modal } from 'antd';
import {
    FileText, Activity, Pill, FlaskConical,
    ClipboardList, Hotel, ArrowLeft, CheckCircle, User, History
} from 'lucide-react';
import { DoctorNavBar } from './DoctorComponents/DoctorNavBar';
import { CustomDashboard } from '../../GlobalComponents/CustomDashboard';
import { doctorNavLink } from './lib/doctorNavLink';
import { useAuthentication } from '../../Utils/Provider';
import {
    enregistrerObservation,
    getObservationsSession,
    prescriptionMedicaments,
    prescriptionExamen,
    enregistrerResultatExamen,
    hospitaliserPatient,
    getChambresDisponibles
} from '../../services/medecinsApi';
import { getDossierByPatientId } from '../../services/dossiersApi';
import {
    getPatientObservations,
    getPatientPrescriptionsMedicaments,
    getPatientPrescriptionsExamens,
    getPatientResultatsExamens
} from '../../services/patientHistoryApi';
import Loader from '../../GlobalComponents/Loader';

export function ConsultationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { userData } = useAuthentication();

    const { patient, sessionId, service } = location.state || {};

    // State management
    const [activeTab, setActiveTab] = useState('1');
    const [dossier, setDossier] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form states for each tab
    const [observation, setObservation] = useState('');
    const [medicaments, setMedicaments] = useState('');
    const [nomExamen, setNomExamen] = useState('');
    const [resultatExamen, setResultatExamen] = useState('');
    const [selectedPrescriptionExamen, setSelectedPrescriptionExamen] = useState(null);
    const [selectedChambre, setSelectedChambre] = useState(null);

    // Lists
    const [chambresDisponibles, setChambresDisponibles] = useState([]);
    const [prescriptionsExamens, setPrescriptionsExamens] = useState([]);
    const [observationsSession, setObservationsSession] = useState([]);

    // History states
    const [historique, setHistorique] = useState({
        observations: [],
        medicaments: [],
        examens: [],
        resultats: []
    });
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (!patient || !sessionId) {
            message.error('Informations patient manquantes');
            navigate('/doctor/waiting-room');
            return;
        }

        loadDossierPatient();
        loadChambresDisponibles();
        loadObservations();
    }, [patient]);

    const loadDossierPatient = async () => {
        setLoading(true);
        try {
            const response = await getDossierByPatientId(patient.id);
            const data = response.data || response;

            if (Array.isArray(data) && data.length > 0) {
                setDossier(data[0]);
            } else if (data && !Array.isArray(data)) {
                setDossier(data);
            }
        } catch (error) {
            console.error('Error loading dossier:', error);
            message.error('Erreur lors du chargement du dossier patient');
        } finally {
            setLoading(false);
        }
    };

    const loadObservations = async () => {
        try {
            const response = await getObservationsSession(sessionId);
            if (response.success) {
                setObservationsSession(response.data || []);
            }
        } catch (error) {
            console.error('Error loading observations:', error);
        }
    };

    const loadChambresDisponibles = async () => {
        try {
            const response = await getChambresDisponibles();
            if (response.success) {
                setChambresDisponibles(response.data);
            }
        } catch (error) {
            console.error('Error loading chambres:', error);
        }
    };

    const loadPatientHistory = async () => {
        if (!patient || loadingHistory) return;

        setLoadingHistory(true);
        try {
            const [obsResp, medResp, examResp, resResp] = await Promise.all([
                getPatientObservations(patient.id),
                getPatientPrescriptionsMedicaments(patient.id),
                getPatientPrescriptionsExamens(patient.id),
                getPatientResultatsExamens(patient.id)
            ]);

            setHistorique({
                observations: obsResp.data || [],
                medicaments: medResp.data || [],
                examens: examResp.data || [],
                resultats: resResp.data || []
            });
        } catch (error) {
            console.error('Error loading patient history:', error);
            message.error('Erreur lors du chargement de l\'historique');
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleEnregistrerObservation = async () => {
        if (!observation.trim()) {
            message.warning('Veuillez saisir une observation');
            return;
        }

        try {
            await enregistrerObservation({
                id_personnel: userData.id,
                observation: observation,
                id_session: sessionId
            });
            message.success('Observation enregistrée avec succès');
            setObservation('');
            loadObservations(); // Refresh list
        } catch (error) {
            console.error('Error saving observation:', error);
            message.error('Erreur lors de l\'enregistrement de l\'observation');
        }
    };

    const handlePrescriptionMedicaments = async () => {
        if (!medicaments.trim()) {
            message.warning('Veuillez saisir les médicaments à prescrire');
            return;
        }

        try {
            await prescriptionMedicaments({
                id_medecin: userData.id,
                liste_medicaments: medicaments,
                id_session: sessionId
            });
            message.success('Prescription de médicaments enregistrée');
            setMedicaments('');
        } catch (error) {
            console.error('Error saving prescription:', error);
            message.error('Erreur lors de l\'enregistrement de la prescription');
        }
    };

    const handlePrescriptionExamen = async () => {
        if (!nomExamen.trim()) {
            message.warning('Veuillez saisir le nom de l\'examen');
            return;
        }

        try {
            const response = await prescriptionExamen({
                id_medecin: userData.id,
                nom_examen: nomExamen,
                id_session: sessionId
            });
            message.success('Examen prescrit avec succès');
            setNomExamen('');
            if (response.data) {
                setPrescriptionsExamens([...prescriptionsExamens, response.data]);
            }
        } catch (error) {
            console.error('Error prescribing exam:', error);
            message.error('Erreur lors de la prescription de l\'examen');
        }
    };

    const handleEnregistrerResultat = async () => {
        if (!selectedPrescriptionExamen) {
            message.warning('Veuillez sélectionner une prescription d\'examen');
            return;
        }
        if (!resultatExamen.trim()) {
            message.warning('Veuillez saisir le résultat');
            return;
        }

        try {
            await enregistrerResultatExamen({
                id_medecin: userData.id,
                resultat: resultatExamen,
                id_prescription: selectedPrescriptionExamen
            });
            message.success('Résultat enregistré avec succès');
            setResultatExamen('');
            setSelectedPrescriptionExamen(null);
        } catch (error) {
            console.error('Error saving result:', error);
            message.error('Erreur lors de l\'enregistrement du résultat');
        }
    };

    const handleHospitaliser = async () => {
        if (!selectedChambre) {
            message.warning('Veuillez sélectionner une chambre');
            return;
        }

        Modal.confirm({
            title: 'Confirmer l\'hospitalisation',
            content: `Êtes-vous sûr de vouloir hospitaliser ${patient.prenom} ${patient.nom} ?`,
            okText: 'Confirmer',
            cancelText: 'Annuler',
            onOk: async () => {
                try {
                    await hospitaliserPatient({
                        id_session: sessionId,
                        id_chambre: selectedChambre,
                        id_medecin: userData.id
                    });
                    message.success('Patient hospitalisé avec succès');
                    setSelectedChambre(null);
                    loadChambresDisponibles(); // Refresh available rooms
                } catch (error) {
                    console.error('Error hospitalizing patient:', error);
                    message.error('Erreur lors de l\'hospitalisation');
                }
            }
        });
    };

    if (!patient || !sessionId) {
        return null;
    }

    const tabItems = [
        {
            key: '1',
            label: (
                <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Dossier Patient
                </span>
            ),
            children: (
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader size="medium" color="primary-end" />
                        </div>
                    ) : dossier ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-700 mb-2">Groupe Sanguin</h4>
                                    <p>{dossier.groupe_sanguin || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-700 mb-2">Facteur Rhésus</h4>
                                    <p>{dossier.facteur_rhesus || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-700 mb-2">Poids</h4>
                                    <p>{dossier.poids ? `${dossier.poids} kg` : 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-700 mb-2">Taille</h4>
                                    <p>{dossier.taille ? `${dossier.taille} cm` : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">Allergies</h4>
                                <p className="whitespace-pre-wrap">{dossier.allergies || 'Aucune allergie connue'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">Antécédents</h4>
                                <p className="whitespace-pre-wrap">{dossier.antecedents || 'Aucun antécédent'}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">Aucun dossier médical disponible</p>
                    )}
                </div>
            )
        },
        {
            key: '2',
            label: (
                <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Observations
                </span>
            ),
            children: (
                <div className="p-6">
                    <div className="space-y-6">
                        {/* List of existing observations */}
                        {observationsSession.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    Observations de cette session
                                </h3>
                                <div className="space-y-3">
                                    {observationsSession.map((obs, index) => (
                                        <div key={obs.id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">
                                                        {obs.personnel_nom} {obs.personnel_prenom}
                                                    </span>
                                                    <span className="mx-2">•</span>
                                                    <span>
                                                        {new Date(obs.date_heure).toLocaleString('fr-FR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 whitespace-pre-wrap">{obs.observation}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-300 my-4"></div>
                            </div>
                        )}

                        {/* New observation form */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nouvelle Observation
                            </label>
                            <textarea
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                rows={6}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end"
                                placeholder="Saisissez vos observations médicales..."
                            />
                        </div>
                        <button
                            onClick={handleEnregistrerObservation}
                            className="bg-gradient-to-r from-primary-end to-primary-start text-white px-6 py-3 rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Enregistrer Observation
                        </button>
                    </div>
                </div>
            )
        },
        {
            key: '3',
            label: (
                <span className="flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Médicaments
                </span>
            ),
            children: (
                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Liste des Médicaments
                            </label>
                            <textarea
                                value={medicaments}
                                onChange={(e) => setMedicaments(e.target.value)}
                                rows={6}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end"
                                placeholder="Ex: Paracétamol 500mg - 3x/jour pendant 5 jours&#10;Amoxicilline 1g - 2x/jour pendant 7 jours"
                            />
                        </div>
                        <button
                            onClick={handlePrescriptionMedicaments}
                            className="bg-gradient-to-r from-primary-end to-primary-start text-white px-6 py-3 rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2"
                        >
                            <Pill className="w-5 h-5" />
                            Enregistrer Prescription
                        </button>
                    </div>
                </div>
            )
        },
        {
            key: '4',
            label: (
                <span className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Examens
                </span>
            ),
            children: (
                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom de l'Examen
                            </label>
                            <input
                                type="text"
                                value={nomExamen}
                                onChange={(e) => setNomExamen(e.target.value)}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end"
                                placeholder="Ex: Scanner thoracique, Bilan sanguin complet..."
                            />
                        </div>
                        <button
                            onClick={handlePrescriptionExamen}
                            className="bg-gradient-to-r from-primary-end to-primary-start text-white px-6 py-3 rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2"
                        >
                            <FlaskConical className="w-5 h-5" />
                            Prescrire Examen
                        </button>
                    </div>
                </div>
            )
        },
        {
            key: '5',
            label: (
                <span className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Résultats
                </span>
            ),
            children: (
                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prescription d'Examen
                            </label>
                            <select
                                value={selectedPrescriptionExamen || ''}
                                onChange={(e) => setSelectedPrescriptionExamen(e.target.value)}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end"
                            >
                                <option value="">Sélectionner une prescription</option>
                                {prescriptionsExamens.map((prescription) => (
                                    <option key={prescription.id} value={prescription.id}>
                                        {prescription.nom_examen}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Résultat
                            </label>
                            <textarea
                                value={resultatExamen}
                                onChange={(e) => setResultatExamen(e.target.value)}
                                rows={6}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end"
                                placeholder="Saisissez les résultats de l'examen..."
                            />
                        </div>
                        <button
                            onClick={handleEnregistrerResultat}
                            className="bg-gradient-to-r from-primary-end to-primary-start text-white px-6 py-3 rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Enregistrer Résultat
                        </button>
                    </div>
                </div>
            )
        },
        {
            key: '6',
            label: (
                <span className="flex items-center gap-2">
                    <Hotel className="w-4 h-4" />
                    Hospitalisation
                </span>
            ),
            children: (
                <div className="p-6">
                    {chambresDisponibles.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800">
                                Aucune chambre disponible pour le moment.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chambre
                                </label>
                                <select
                                    value={selectedChambre || ''}
                                    onChange={(e) => setSelectedChambre(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end"
                                >
                                    <option value="">Sélectionner une chambre</option>
                                    {chambresDisponibles.map((chambre) => (
                                        <option key={chambre.id} value={chambre.id}>
                                            {chambre.numero_chambre} - {chambre.nombre_places_dispo} place(s) disponible(s) - {chambre.tarif_journalier} FCFA/jour
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleHospitaliser}
                                className="bg-gradient-to-r from-primary-end to-primary-start text-white px-6 py-3 rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2"
                            >
                                <Hotel className="w-5 h-5" />
                                Hospitaliser le Patient
                            </button>
                        </div>
                    )}
                </div>
            )
        }
        ,{
            key: '7',
            label: (
                <span className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Historique
                </span>
            ),
            children: (
                <div className="p-6">
                    {!loadingHistory && historique.observations.length === 0 ? (
                        <button onClick={loadPatientHistory} className="bg-gradient-to-r from-primary-end to-primary-start text-white px-6 py-3 rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2 mb-6">
                            <History className="w-5 h-5" />
                            Charger l'Historique Complet
                        </button>
                    ) : loadingHistory ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader size="medium" color="primary-end" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary-end" />
                                    Observations Médicales ({historique.observations.length})
                                </h3>
                                {historique.observations.length > 0 ? (
                                    <div className="space-y-3">
                                        {historique.observations.map((obs) => (
                                            <div key={obs.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">{obs.personnel_nom} {obs.personnel_prenom}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{new Date(obs.date_heure).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700">{obs.observation}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 text-center py-4">Aucune observation</p>}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Pill className="w-5 h-5 text-primary-end" />
                                    Prescriptions Médicaments ({historique.medicaments.length})
                                </h3>
                                {historique.medicaments.length > 0 ? (
                                    <div className="space-y-3">
                                        {historique.medicaments.map((presc) => (
                                            <div key={presc.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">Dr. {presc.medecin_nom} {presc.medecin_prenom}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{new Date(presc.date_prescription).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                                <p className="text-gray-700 whitespace-pre-wrap">{presc.liste_medicaments}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 text-center py-4">Aucune prescription</p>}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FlaskConical className="w-5 h-5 text-primary-end" />
                                    Examens Prescrits ({historique.examens.length})
                                </h3>
                                {historique.examens.length > 0 ? (
                                    <div className="space-y-3">
                                        {historique.examens.map((exam) => (
                                            <div key={exam.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">Dr. {exam.medecin_nom} {exam.medecin_prenom}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{new Date(exam.date_prescription).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                                <p className="text-gray-700 font-medium">{exam.nom_examen}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 text-center py-4">Aucun examen prescrit</p>}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-primary-end" />
                                    Résultats d'Examens ({historique.resultats.length})
                                </h3>
                                {historique.resultats.length > 0 ? (
                                    <div className="space-y-3">
                                        {historique.resultats.map((res) => (
                                            <div key={res.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                <div className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">{res.nom_examen}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>Dr. {res.medecin_nom} {res.medecin_prenom}</span>
                                                </div>
                                                <p className="text-gray-700 whitespace-pre-wrap">{res.resultat}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 text-center py-4">Aucun résultat</p>}
                            </div>
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole="Doctor">
            <DoctorNavBar />
            <div className="p-6">
                {/* Patient Header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-white text-primary-end rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{patient.prenom} {patient.nom}</h1>
                            <div className="flex gap-4 text-sm opacity-90 mt-1">
                                <span>Matricule: {patient.matricule}</span>
                                <span>•</span>
                                <span>Âge: {patient.age} ans</span>
                                <span>•</span>
                                <span>Contact: {patient.contact}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={tabItems}
                        className="consultation-tabs"
                    />
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={() => navigate('/doctor/waiting-room')}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Retour
                    </button>
                </div>
            </div>
        </CustomDashboard>
    );
}
