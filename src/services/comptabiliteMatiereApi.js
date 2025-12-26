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

/**
 * Récupère les rapports envoyés par un utilisateur
 */
export const getSentRapports = async (userId) => {
    const response = await axiosInstance.get(`/rapports/?expediteur=${userId}`);
    return response.data;
};

/**
 * Récupère les rapports reçus par un utilisateur
 */
export const getReceivedRapports = async (userId) => {
    const response = await axiosInstance.get(`/rapports/?destinataire=${userId}`);
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

/**
 * Récupère mes besoins (utilisateur connecté)
 */
export const getMyBesoins = async () => {
    const response = await axiosInstance.get(`/besoins/mes_besoins/`);
    return response.data;
};

/**
 * Récupère les besoins groupés par statut
 */
export const getBesoinsParStatut = async () => {
    const response = await axiosInstance.get(`/besoins/par_statut/`);
    return response.data;
};

/**
 * Modifier le statut d'un besoin
 */
export const modifierStatutBesoin = async (id, statut) => {
    const response = await axiosInstance.patch(`/besoins/${id}/modifier_statut/`, { statut });
    return response.data;
};

/**
 * Ajouter un commentaire directeur à un besoin
 */
export const ajouterCommentaireBesoin = async (id, commentaire) => {
    const response = await axiosInstance.post(`/besoins/${id}/ajouter_commentaire/`, { commentaire_directeur: commentaire });
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
 * Récupère un matériel par son ID
 */
export const getMaterielById = async (id) => {
    const response = await axiosInstance.get(`/materiels/${id}/`);
    return response.data;
};

/**
 * Crée un nouveau matériel
 */
export const createMateriel = async (data) => {
    const response = await axiosInstance.post(`/materiels/`, data);
    return response.data;
};

/**
 * Met à jour un matériel
 */
export const updateMateriel = async (id, data) => {
    const response = await axiosInstance.patch(`/materiels/${id}/`, data);
    return response.data;
};

/**
 * Supprime un matériel
 */
export const deleteMateriel = async (id) => {
    const response = await axiosInstance.delete(`/materiels/${id}/`);
    return response.data;
};

/**
 * Récupère les matériels avec stock faible
 */
export const getMaterielsStockFaible = async () => {
    const response = await axiosInstance.get(`/materiels/stock_faible/`);
    return response.data;
};

// ==================== MATERIELS MEDICAUX ====================

/**
 * Récupère les matériels médicaux
 */
export const getAllMaterielsMedicaux = async () => {
    const response = await axiosInstance.get(`/materiels-medicaux/`);
    return response.data;
};

/**
 * Récupère un matériel médical par son ID
 */
export const getMaterielMedicalById = async (id) => {
    const response = await axiosInstance.get(`/materiels-medicaux/${id}/`);
    return response.data;
};

/**
 * Crée un nouveau matériel médical
 */
export const createMaterielMedical = async (data) => {
    const response = await axiosInstance.post(`/materiels-medicaux/`, data);
    return response.data;
};

/**
 * Met à jour un matériel médical
 */
export const updateMaterielMedical = async (id, data) => {
    const response = await axiosInstance.patch(`/materiels-medicaux/${id}/`, data);
    return response.data;
};

/**
 * Supprime un matériel médical
 */
export const deleteMaterielMedical = async (id) => {
    const response = await axiosInstance.delete(`/materiels-medicaux/${id}/`);
    return response.data;
};

/**
 * Récupère les matériels médicaux par catégorie
 */
export const getMaterielsMedicauxParCategorie = async () => {
    const response = await axiosInstance.get(`/materiels-medicaux/par_categorie/`);
    return response.data;
};

/**
 * Récupère les matériels médicaux avec stock faible
 */
export const getMaterielsMedicauxStockFaible = async () => {
    const response = await axiosInstance.get(`/materiels-medicaux/stock_faible/`);
    return response.data;
};

// ==================== MATERIELS DURABLES ====================

/**
 * Récupère les matériels durables
 */
export const getAllMaterielsDurables = async () => {
    const response = await axiosInstance.get(`/materiels-durables/`);
    return response.data;
};

/**
 * Récupère un matériel durable par son ID
 */
export const getMaterielDurableById = async (id) => {
    const response = await axiosInstance.get(`/materiels-durables/${id}/`);
    return response.data;
};

/**
 * Crée un nouveau matériel durable
 */
export const createMaterielDurable = async (data) => {
    const response = await axiosInstance.post(`/materiels-durables/`, data);
    return response.data;
};

/**
 * Met à jour un matériel durable
 */
export const updateMaterielDurable = async (id, data) => {
    const response = await axiosInstance.patch(`/materiels-durables/${id}/`, data);
    return response.data;
};

/**
 * Supprime un matériel durable
 */
export const deleteMaterielDurable = async (id) => {
    const response = await axiosInstance.delete(`/materiels-durables/${id}/`);
    return response.data;
};

/**
 * Récupère les matériels durables en réparation
 */
export const getMaterielsDurablesEnReparation = async () => {
    const response = await axiosInstance.get(`/materiels-durables/en_reparation/`);
    return response.data;
};

/**
 * Récupère les matériels durables par localisation
 */
export const getMaterielsDurablesParLocalisation = async () => {
    const response = await axiosInstance.get(`/materiels-durables/par_localisation/`);
    return response.data;
};

/**
 * Mettre un matériel en réparation
 */
export const mettreEnReparation = async (id) => {
    const response = await axiosInstance.post(`/materiels-durables/${id}/mettre_en_reparation/`);
    return response.data;
};

/**
 * Remettre un matériel en service
 */
export const remettreEnService = async (id) => {
    const response = await axiosInstance.post(`/materiels-durables/${id}/remettre_en_service/`);
    return response.data;
};

// ==================== LIVRAISONS ====================

/**
 * Récupère toutes les livraisons
 */
export const getAllLivraisons = async () => {
    const response = await axiosInstance.get(`/livraisons/`);
    return response.data;
};

/**
 * Récupère une livraison par son ID
 */
export const getLivraisonById = async (id) => {
    const response = await axiosInstance.get(`/livraisons/${id}/`);
    return response.data;
};

/**
 * Crée une nouvelle livraison
 */
export const createLivraison = async (data) => {
    const response = await axiosInstance.post(`/livraisons/`, data);
    return response.data;
};

/**
 * Met à jour une livraison
 */
export const updateLivraison = async (id, data) => {
    const response = await axiosInstance.patch(`/livraisons/${id}/`, data);
    return response.data;
};

/**
 * Supprime une livraison
 */
export const deleteLivraison = async (id) => {
    const response = await axiosInstance.delete(`/livraisons/${id}/`);
    return response.data;
};

/**
 * Récupère les livraisons par fournisseur
 */
export const getLivraisonsParFournisseur = async () => {
    const response = await axiosInstance.get(`/livraisons/par_fournisseur/`);
    return response.data;
};

/**
 * Récupère les statistiques des livraisons
 */
export const getLivraisonsStatistiques = async () => {
    const response = await axiosInstance.get(`/livraisons/statistiques/`);
    return response.data;
};

// ==================== LIGNES LIVRAISON ====================

/**
 * Récupère les lignes d'une livraison
 */
export const getLignesLivraison = async (livraisonId) => {
    const response = await axiosInstance.get(`/lignes-livraison/?livraison=${livraisonId}`);
    return response.data;
};

/**
 * Crée une nouvelle ligne de livraison
 */
export const createLigneLivraison = async (data) => {
    const response = await axiosInstance.post(`/lignes-livraison/`, data);
    return response.data;
};

/**
 * Supprime une ligne de livraison
 */
export const deleteLigneLivraison = async (id) => {
    const response = await axiosInstance.delete(`/lignes-livraison/${id}/`);
    return response.data;
};

// ==================== SORTIES ====================

/**
 * Récupère toutes les sorties
 */
export const getAllSorties = async () => {
    const response = await axiosInstance.get(`/sorties/`);
    return response.data;
};

/**
 * Récupère une sortie par son ID
 */
export const getSortieById = async (id) => {
    const response = await axiosInstance.get(`/sorties/${id}/`);
    return response.data;
};

/**
 * Crée une nouvelle sortie
 */
export const createSortie = async (data) => {
    const response = await axiosInstance.post(`/sorties/`, data);
    return response.data;
};

/**
 * Met à jour une sortie
 */
export const updateSortie = async (id, data) => {
    const response = await axiosInstance.patch(`/sorties/${id}/`, data);
    return response.data;
};

/**
 * Supprime une sortie
 */
export const deleteSortie = async (id) => {
    const response = await axiosInstance.delete(`/sorties/${id}/`);
    return response.data;
};

/**
 * Récupère les sorties par motif
 */
export const getSortiesParMotif = async () => {
    const response = await axiosInstance.get(`/sorties/par_motif/`);
    return response.data;
};

/**
 * Récupère les sorties de l'utilisateur connecté
 */
export const getMesSorties = async () => {
    const response = await axiosInstance.get(`/sorties/mes_sorties/`);
    return response.data;
};

/**
 * Récupère les statistiques des sorties
 */
export const getSortiesStatistiques = async () => {
    const response = await axiosInstance.get(`/sorties/statistiques/`);
    return response.data;
};

// ==================== LIGNES SORTIE ====================

/**
 * Récupère les lignes d'une sortie
 */
export const getLignesSortie = async (sortieId) => {
    const response = await axiosInstance.get(`/lignes-sortie/?sortie=${sortieId}`);
    return response.data;
};

/**
 * Crée une nouvelle ligne de sortie
 */
export const createLigneSortie = async (data) => {
    const response = await axiosInstance.post(`/lignes-sortie/`, data);
    return response.data;
};

/**
 * Supprime une ligne de sortie
 */
export const deleteLigneSortie = async (id) => {
    const response = await axiosInstance.delete(`/lignes-sortie/${id}/`);
    return response.data;
};

// ==================== ARCHIVES INVENTAIRE ====================

/**
 * Récupère tous les archives d'inventaire
 */
export const getAllArchivesInventaire = async () => {
    const response = await axiosInstance.get(`/archives-inventaire/`);
    return response.data;
};

/**
 * Récupère une archive par son ID
 */
export const getArchiveInventaireById = async (id) => {
    const response = await axiosInstance.get(`/archives-inventaire/${id}/`);
    return response.data;
};

/**
 * Crée une nouvelle archive d'inventaire
 */
export const createArchiveInventaire = async (data) => {
    const response = await axiosInstance.post(`/archives-inventaire/`, data);
    return response.data;
};

/**
 * Met à jour une archive d'inventaire
 */
export const updateArchiveInventaire = async (id, data) => {
    const response = await axiosInstance.patch(`/archives-inventaire/${id}/`, data);
    return response.data;
};

/**
 * Supprime une archive d'inventaire
 */
export const deleteArchiveInventaire = async (id) => {
    const response = await axiosInstance.delete(`/archives-inventaire/${id}/`);
    return response.data;
};

/**
 * Récupère l'archive en cours
 */
export const getArchiveEnCours = async () => {
    const response = await axiosInstance.get(`/archives-inventaire/en_cours/`);
    return response.data;
};

/**
 * Clôturer une archive d'inventaire
 */
export const cloturerArchive = async (id) => {
    const response = await axiosInstance.post(`/archives-inventaire/${id}/cloturer/`);
    return response.data;
};

// ==================== LIGNES ARCHIVE INVENTAIRE ====================

/**
 * Récupère les lignes d'une archive
 */
export const getLignesArchive = async (archiveId) => {
    const response = await axiosInstance.get(`/lignes-archive/?archive=${archiveId}`);
    return response.data;
};

/**
 * Crée une nouvelle ligne d'archive
 */
export const createLigneArchive = async (data) => {
    const response = await axiosInstance.post(`/lignes-archive/`, data);
    return response.data;
};

/**
 * Met à jour une ligne d'archive
 */
export const updateLigneArchive = async (id, data) => {
    const response = await axiosInstance.patch(`/lignes-archive/${id}/`, data);
    return response.data;
};

/**
 * Supprime une ligne d'archive
 */
export const deleteLigneArchive = async (id) => {
    const response = await axiosInstance.delete(`/lignes-archive/${id}/`);
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

// ==================== STATISTIQUES DASHBOARD ====================

/**
 * Récupère les statistiques générales pour le dashboard comptable matière
 */
export const getDashboardStats = async () => {
    try {
        const [materiels, materielsMedicaux, materielsDurables, sorties, livraisons, besoins] = await Promise.all([
            axiosInstance.get(`/materiels/`),
            axiosInstance.get(`/materiels-medicaux/`),
            axiosInstance.get(`/materiels-durables/`),
            axiosInstance.get(`/sorties/`),
            axiosInstance.get(`/livraisons/`),
            axiosInstance.get(`/besoins/`)
        ]);

        // Compter les besoins en attente (NON_TRAITE ou EN_COURS)
        const besoinsEnAttente = besoins.data.results
            ? besoins.data.results.filter(b => b.statut === 'NON_TRAITE' || b.statut === 'EN_COURS').length
            : besoins.data.filter(b => b.statut === 'NON_TRAITE' || b.statut === 'EN_COURS').length;

        return {
            totalMaterial: materiels.data.results ? materiels.data.results.length : materiels.data.length,
            totalMedical: materielsMedicaux.data.results ? materielsMedicaux.data.results.length : materielsMedicaux.data.length,
            totalDurable: materielsDurables.data.results ? materielsDurables.data.results.length : materielsDurables.data.length,
            totalOutputs: sorties.data.results ? sorties.data.results.length : sorties.data.length,
            totalDeliveries: livraisons.data.results ? livraisons.data.results.length : livraisons.data.length,
            pendingNeeds: besoinsEnAttente
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
};

/**
 * Récupère les statistiques pour le dashboard du directeur
 */
export const getDirectorDashboardStats = async () => {
    try {
        const besoinsResponse = await axiosInstance.get(`/besoins/`);
        const besoins = besoinsResponse.data.results || besoinsResponse.data;

        return {
            total: besoins.length,
            enAttente: besoins.filter(b => b.statut === 'NON_TRAITE').length,
            enCours: besoins.filter(b => b.statut === 'EN_COURS').length,
            approuves: besoins.filter(b => b.statut === 'TRAITE').length,
            rejetes: besoins.filter(b => b.statut === 'REJETE').length,
            besoins: besoins
        };
    } catch (error) {
        console.error("Error fetching director dashboard stats:", error);
        throw error;
    }
};

/**
 * Récupère les statistiques pour le dashboard du pharmacien
 */
export const getPharmacistDashboardStats = async () => {
    try {
        const [materielsMedicaux, sorties] = await Promise.all([
            axiosInstance.get(`/materiels-medicaux/`),
            axiosInstance.get(`/sorties/?motif_sortie=vente`)
        ]);

        const medicaments = materielsMedicaux.data.results || materielsMedicaux.data;
        const ventes = sorties.data.results || sorties.data;

        // Filtrer les ventes du jour
        const today = new Date().toISOString().split('T')[0];
        const ventesAujourdhui = ventes.filter(v => v.date_sortie === today);

        // Trouver les médicaments en stock faible
        const stockFaible = medicaments.filter(m => m.quantite_stock <= (m.seuil_alerte || 20));

        return {
            totalMedications: medicaments.length,
            lowStock: stockFaible.length,
            salesCount: ventesAujourdhui.length,
            medications: medicaments,
            lowStockItems: stockFaible,
            todaySales: ventesAujourdhui
        };
    } catch (error) {
        console.error("Error fetching pharmacist dashboard stats:", error);
        throw error;
    }
};
