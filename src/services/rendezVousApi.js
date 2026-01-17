import axiosInstance from '../Utils/axiosInstance';

/**
 * Service API pour les rendez-vous.
 */

const BASE_URL = '/rendez-vous';

/**
 * Recupere tous les rendez-vous.
 */
export const getAllRendezVous = async () => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching rendez-vous:', error);
        throw error;
    }
};

/**
 * Cree un nouveau rendez-vous.
 * @param {Object} data - {id_patient, id_medecin, date_heure}
 */
export const createRendezVous = async (data) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error creating rendez-vous:', error);
        throw error;
    }
};

/**
 * Supprime un rendez-vous.
 */
export const deleteRendezVous = async (id) => {
    try {
        const response = await axiosInstance.delete(`${BASE_URL}/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting rendez-vous:', error);
        throw error;
    }
};

/**
 * Met a jour un rendez-vous (pour reporter).
 * @param {number} id - ID du rendez-vous
 * @param {Object} data - Donnees a mettre a jour {date_rendez_vous, heure_rendez_vous}
 */
export const updateRendezVous = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`${BASE_URL}/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating rendez-vous:', error);
        throw error;
    }
};

/**
 * Recupere tous les rendez-vous d'un medecin specifique.
 * @para