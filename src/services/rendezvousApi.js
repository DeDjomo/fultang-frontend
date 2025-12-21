import axiosInstance from '../Utils/axiosInstance';

/**
 * Service API pour la gestion des rendez-vous
 */

/**
 * Récupère tous les rendez-vous
 */
export const getAllRendezVous = async () => {
    const response = await axiosInstance.get('/rendez-vous/');
    return response.data;
};

/**
 * Récupère tous les rendez-vous d'un médecin spécifique
 * @param {number} medecinId - ID du médecin
 */
export const getRendezVousByMedecin = async (medecinId) => {
    const response = await axiosInstance.get('/rendez-vous/', {
        params: { id_medecin: medecinId }
    });
    return response.data;
};

/**
 * Crée un nouveau rendez-vous
 * @param {Object} rendezVousData - Données du rendez-vous (id_medecin, id_patient, date_heure)
 */
export const createRendezVous = async (rendezVousData) => {
    const response = await axiosInstance.post('/rendez-vous/', rendezVousData);
    return response.data;
};

/**
 * Récupère un rendez-vous par son ID
 * @param {number} id - ID du rendez-vous
 */
export const getRendezVousById = async (id) => {
    const response = await axiosInstance.get(`/rendez-vous/${id}/`);
    return response.data;
};

/**
 * Met à jour un rendez-vous
 * @param {number} id - ID du rendez-vous
 * @param {Object} rendezVousData - Données à mettre à jour
 */
export const updateRendezVous = async (id, rendezVousData) => {
    const response = await axiosInstance.patch(`/rendez-vous/${id}/`, rendezVousData);
    return response.data;
};

/**
 * Supprime un rendez-vous
 * @param {number} id - ID du rendez-vous
 */
export const deleteRendezVous = async (id) => {
    const response = await axiosInstance.delete(`/rendez-vous/${id}/`);
    return response.data;
};
