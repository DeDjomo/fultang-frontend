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
