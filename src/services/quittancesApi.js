/**
 * API Service for quittances (receipts)
 */
import axiosInstance from '../Utils/axiosInstance';

const BASE_URL = '/quittances';

/**
 * Get all quittances for a specific patient
 * @param {number} patientId - Patient ID
 * @returns {Promise} - List of quittances
 */
export const getPatientQuittances = async (patientId) => {
    const response = await axiosInstance.get(`/caissier/${patientId}/quittances`);
    return response.data;
};

/**
 * Create a new quittance
 * @param {object} quittanceData - Quittance data
 * @returns {Promise} - Created quittance
 */
export const createQuittance = async (quittanceData) => {
    const response = await axiosInstance.post(`${BASE_URL}/`, quittanceData);
    return response.data;
};

/**
 * Redirect patient to another service
 * @param {number} patientId - Patient ID
 * @param {string} newService - New service name
 * @returns {Promise} - Response
 */
export const redirectPatientToService = async (patientId, newService) => {
    const response = await axiosInstance.post(`/caissier/${patientId}/redirect-service/`, {
        new_service: newService
    });
    return response.data;
};

/**
 * Get receipts filtered by period
 * @param {string} filter - 'day', 'week', 'month'
 * @returns {Promise} - Filtered receipts and stats
 */
export const getFilteredQuittances = async (filter) => {
    let endpoint = '';
    switch (filter) {
        case 'day':
            endpoint = '/quittances/du_jour/';
            break;
        case 'week':
            endpoint = '/quittances/de_la_semaine/';
            break;
        case 'month':
            endpoint = '/quittances/du_mois/';
            break;
        default:
            endpoint = '/quittances/';
    }
    const response = await axiosInstance.get(endpoint);
    return response.data;
};

/**
 * Get global financial statistics
 * @returns {Promise} - Global stats
 */
export const getFinancialStats = async () => {
    const response = await axiosInstance.get('/quittances/statistiques/');
    return response.data;
};
