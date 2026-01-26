/**
 * API Service pour l'historique patient
 * Récupère toutes les données historiques d'un patient (observations, prescriptions, résultats)
 */
import axiosInstance from '../Utils/axiosInstance';

const BASE_URL = '/patients';

/**
 * Récupère toutes les observations médicales d'un patient
 * @param {number} patientId - ID du patient
 * @returns {Promise} - Liste des observations
 */
export const getPatientObservations = async (patientId) => {
    const response = await axiosInstance.get(`${BASE_URL}/${patientId}/observations`);
    return response.data;
};

/**
 * Récupère toutes les prescriptions de médicaments d'un patient
 * @param {number} patientId - ID du patient
 * @returns {Promise} - Liste des prescriptions de médicaments
 */
export const getPatientPrescriptionsMedicaments = async (patientId) => {
    const response = await axiosInstance.get(`${BASE_URL}/${patientId}/prescriptions-medicaments`);
    return response.data;
};

/**
 * Récupère toutes les prescriptions d'examens d'un patient
 * @param {number} patientId - ID du patient
 * @returns {Promise} - Liste des prescriptions d'examens
 */
export const getPatientPrescriptionsExamens = async (patientId) => {
    const response = await axiosInstance.get(`${BASE_URL}/${patientId}/prescriptions-examens`);
    return response.data;
};

/**
 * Récupère tous les résultats d'examens d'un patient
 * @param {number} patientId - ID du patient
 * @returns {Promise} - Liste des résultats d'examens
 */
export const getPatientResultatsExamens = async (patientId) => {
    const response = await axiosInstance.get(`${BASE_URL}/${patientId}/resultats-examens`);
    return response.data;
};

/**
 * Récupérer le dossier médical d'un patient
 * @param {number} patientId - ID du patient
 */
/**
 * Récupérer le dossier médical d'un patient
 * @param {number} patientId - ID du patient
 */
export const getDossierPatient = async (patientId) => {
    // L'endpoint backend est /api/dossiers-patients/?id_patient=XX
    const response = await axiosInstance.get(`/dossiers-patients/?id_patient=${patientId}`);
    return response.data;
};

/**
 * Mettre à jour le dossier médical
 * @param {number} patientId - ID du patient (qui est aussi ID du dossier)
 * @param {Object} data - Données à mettre à jour
 */
export const updateDossierPatient = async (patientId, data) => {
    // L'endpoint backend est /api/dossiers-patients/ID/
    const response = await axiosInstance.patch(`/dossiers-patients/${patientId}/`, data);
    return response.data;
};

/**
 * Télécharger l'historique médical en PDF
 * @param {number} dossierId - ID du dossier
 */
export const downloadPatientHistoryPDF = async (dossierId) => {
    const response = await axiosInstance.get(`/dossiers-patients/${dossierId}/download-history/`, {
        responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historique_medical_${dossierId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};
