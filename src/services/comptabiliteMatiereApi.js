import axiosInstance from "../Utils/axiosInstance";

// Routes are directly under /api/ as configured in comptabilite_matiere/urls.py

// ==================== RAPPORTS ====================

/**
 * Récupère tous les rapports
 */
export const getAllRapports = async () => {
    const response = await axiosInstance.get(`/rapports/`);
    return response.data;
};

/**
 * Récupère un rapport par son ID
 */
export const getRapportById = async (id) => {
    const response = await axiosInstance.get(`/rapports/${id}/`);
    return response.data;
};

/**
 * Crée un nouveau rapport
 */
export const createRapport = async (data) => {
    const response = await axiosInstance.post(`/rapports/`, data);
    return response.data;
};

/**
 * Met à jour un rapport
 */
export const updateRapport = async (id, data) => {
    const response = await axiosInstance.patch(`/rapports/${id}/`, data);
    return response.data;
};

/**
 * Marque un rapport comme lu
 */
export const markRapportAsRead = async (id) => {
    const response = await axiosInstance.patch(`/rapports/${id}/`, { statut: "lu" });
    return response.data;
};

/**
 * Supprime un rapport
 */
export const deleteRapport = async (id) => {
    const response = await axiosInstance.delete(`/rapports/${id}/`);
    return response.data;
};

// ==================== BESOINS ====================

/**
 * Récupère tous les besoins
 */
export const getAllBesoins = async () => {
    const response = await axiosInstance.get(`/besoins/`);
    return response.data;
};

/**
 * Récupère un besoin par son ID
 */
export const getBesoinById = async (id) => {
    const response = await axiosInstance.get(`/besoins/${id}/`);
    return response.data;
};

/**
 * Crée un nouveau besoin
 */
export const createBesoin = async (data) => {
    const response = await axiosInstance.post(`/besoins/`, data);
    return response.data;
};

/**
 * Met à jour un besoin
 */
export const updateBesoin = async (id, data) => {
    const response = await axiosInstance.patch(`/besoins/${id}/`, data);
    return response.data;
};

/**
 * Supprime un besoin
 */
export const deleteBesoin = async (id) => {
    const response = await axiosInstance.delete(`/besoins/${id}/`);
    return response.data;
};

// ==================== LIGNES BESOIN ====================

/**
 * Récupère les lignes d'un besoin
 */
export const getLignesBesoin = async (besoinId) => {
    const response = await axiosInstance.get(`/lignes-besoin/?besoin=${besoinId}`);
    return response.data;
};

/**
 * Crée une nouvelle ligne de besoin
 */
export const createLigneBesoin = async (data) => {
    const response = await axiosInstance.post(`/lignes-besoin/`, data);
    return response.data;
};

/**
 * Supprime une ligne de besoin
 */
export const deleteLigneBesoin = async (id) => {
    const response = await axiosInstance.delete(`/lignes-besoin/${id}/`);
    return response.data;
};

// ==================== MATERIELS ====================

/**
 * Récupère tous les matériels
 */
export const getAllMateriels = async () => {
    const response = await axiosInstance.get(`/materiels/`);
    return response.data;
};

/**
 * Récupère les matériels médicaux
 */
export const getAllMaterielsMedicaux = async () => {
    const response = await axiosInstance.get(`/materiels-medicaux/`);
    return response.data;
};

// ==================== PIECES JOINTES ====================

/**
 * Récupère les pièces jointes d'un rapport
 */
export const getPiecesJointesRapport = async (rapportId) => {
    const response = await axiosInstance.get(`/pieces-jointes/?rapport=${rapportId}`);
    return response.data;
};

/**
 * Crée une pièce jointe
 */
export const createPieceJointe = async (data) => {
    const response = await axiosInstance.post(`/pieces-jointes/`, data);
    return response.data;
};

/**
 * Supprime une pièce jointe
 */
export const deletePieceJointe = async (id) => {
    const response = await axiosInstance.delete(`/pieces-jointes/${id}/`);
    return response.data;
};

// ==================== PERSONNEL ====================

/**
 * Récupère le personnel (directeurs, comptables, etc.)
 */
export const getPersonnelList = async () => {
    const response = await axiosInstance.get(`/personnel/`);
    return response.data;
};
