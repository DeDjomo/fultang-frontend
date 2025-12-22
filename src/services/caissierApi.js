/**
 * API Service pour le caissier
 * Gère les requêtes relatives aux patients, consultations, paiements
 */
import axiosInstance from '../Utils/axiosInstance';

const BASE_URL = '/caissier';

/**
 * Récupère tous les patients en attente
 * @returns {Promise} - Liste des patients avec sessions en attente
 */
export const getPatientsEnAttente = async () => {
    const response = await axiosInstance.get(`${BASE_URL}/patients-en-attente`);
    return response.data;
};
