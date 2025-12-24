import axiosInstance from '../Utils/axiosInstance';

/**
 * Service API pour les fonctionnalités médecin
 */

/**
 * Récupère la liste des patients en attente pour un service (médecin)
 * @param {string} serviceName - Nom du service
 */
export const getPatientsEnAttente = async (serviceName) => {
    const response = await axiosInstance.get('/medecin/patients-en-attente/', {
        params: { service: serviceName }
    });
    return response.data;
};

/**
 * Récupère la liste de tous les médecins
 */
export const getAllMedecins = async () => {
    const response = await axiosInstance.get('/personnel/', {
        params: { poste: 'medecin' }
    });
    return response.data;
};

/**
 * Crée un nouveau médecin
 * @param {Object} data - Données du médecin (nom, prenom, email, specialite, etc.)
 */
export const createMedecin = async (data) => {
    const response = await axiosInstance.post('/medecins/', data);
    return response.data;
};

/**
 * Sélectionner un patient de la liste d'attente
 * @param {number} sessionId - ID de la session
 */
export const selectionnerPatient = async (sessionId) => {
    const response = await axiosInstance.post('/medecin/selectionner-patient/', {
        id_session: sessionId
    });
    return response.data;
};

/**
 * Consulter le dossier complet d'un patient
 * @param {number} patientId - ID du patient
 */
export const consulterDossierPatient = async (patientId) => {
    const response = await axiosInstance.get(`/medecin/consulter-dossier/${patientId}/`);
    return response.data;
};

/**
 * Enregistrer une observation médicale
 * @param {Object} data - {id_personnel, observation, id_session}
 */
export const enregistrerObservation = async (data) => {
    const response = await axiosInstance.post('/medecin/observations/', data);
    return response.data;
};

/**
 * Récupérer les observations d'une session
 * @param {number} sessionId - ID de la session
 */
export const getObservationsSession = async (sessionId) => {
    const response = await axiosInstance.get('/observations-medicales/', {
        params: { id_session: sessionId }
    });
    return response.data;
};

/**
 * Enregistrer une prescription de médicaments
 * @param {Object} data - {id_medecin, liste_medicaments, id_session}
 */
export const prescriptionMedicaments = async (data) => {
    const response = await axiosInstance.post('/prescriptions-medicaments/', data);
    return response.data;
};

/**
 * Enregistrer une prescription d'examen
 * @param {Object} data - {id_medecin, nom_examen, id_session}
 */
export const prescriptionExamen = async (data) => {
    const response = await axiosInstance.post('/prescriptions-examens/', data);
    return response.data;
};

/**
 * Enregistrer un résultat d'examen
 * @param {Object} data - {id_medecin, resultat, id_prescription}
 */
export const enregistrerResultatExamen = async (data) => {
    const response = await axiosInstance.post('/resultats-examens/', data);
    return response.data;
};

/**
 * Hospitaliser un patient
 * @param {Object} data - {id_session, id_chambre, id_medecin}
 */
export const hospitaliserPatient = async (data) => {
    const response = await axiosInstance.post('/hospitalisations/', data);
    return response.data;
};

/**
 * Récupérer les chambres disponibles
 */
export const getChambresDisponibles = async () => {
    const response = await axiosInstance.get('/chambres/', {
        params: { disponible: true }
    });
    return response.data;
};

/**
 * Rediriger un patient vers la caisse
 * @param {number} sessionId - ID de la session
 */
export const redirectToCashier = async (sessionId) => {
    const response = await axiosInstance.post('/medecin/redirect-to-cashier/', {
        session_id: sessionId
    });
    return response.data;
};
