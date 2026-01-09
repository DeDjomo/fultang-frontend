/**
 * API Service for Accountant Financial Module
 * Handles all API calls related to financial accounting
 */
import axiosInstance from '../Utils/axiosInstance';

// ==================== QUITTANCES ====================

/**
 * Get statistics for quittances
 * @returns {Promise} Statistics data
 */
export const getQuittancesStatistiques = async () => {
    const response = await axiosInstance.get('/quittances/statistiques/');
    return response.data;
};

/**
 * Get advanced statistics for financial reports
 * @param {string} periode - 'jour', 'semaine', 'mois', 'annee'
 * @returns {Promise} Advanced statistics with period comparison
 */
export const getStatistiquesAvancees = async (periode = 'mois') => {
    const response = await axiosInstance.get(`/quittances/statistiques_avancees/?periode=${periode}`);
    return response.data;
};

/**
 * Get quittances pending validation
 * @returns {Promise} List of quittances to validate
 */
export const getQuittancesAValider = async () => {
    const response = await axiosInstance.get('/quittances/a_valider/');
    return response.data;
};

/**
 * Get validated quittances
 * @returns {Promise} List of validated quittances
 */
export const getQuittancesValidees = async () => {
    const response = await axiosInstance.get('/quittances/validees/');
    return response.data;
};

/**
 * Validate a quittance and optionally assign to an account
 * @param {number} id - Quittance ID
 * @param {number|null} compteComptableId - Optional account ID
 * @returns {Promise} Validation result
 */
export const validerQuittance = async (id, compteComptableId = null) => {
    const data = compteComptableId ? { compte_comptable_id: compteComptableId } : {};
    const response = await axiosInstance.post(`/quittances/${id}/valider/`, data);
    return response.data;
};

/**
 * Get journal de ventilation (distribution journal)
 * @param {Object} filters - Optional filters (date_debut, date_fin, compte_comptable_id)
 * @returns {Promise} Ventilation data
 */
export const getJournalVentilation = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date_debut) params.append('date_debut', filters.date_debut);
    if (filters.date_fin) params.append('date_fin', filters.date_fin);
    if (filters.compte_comptable_id) params.append('compte_comptable_id', filters.compte_comptable_id);

    const response = await axiosInstance.get(`/quittances/journal_ventilation/?${params.toString()}`);
    return response.data;
};

/**
 * Get quittances for today
 * @returns {Promise} Today's quittances
 */
export const getQuittancesDuJour = async () => {
    const response = await axiosInstance.get('/quittances/du_jour/');
    return response.data;
};

/**
 * Get quittances for this month
 * @returns {Promise} This month's quittances
 */
export const getQuittancesDuMois = async () => {
    const response = await axiosInstance.get('/quittances/du_mois/');
    return response.data;
};

// ==================== COMPTES COMPTABLES ====================

/**
 * Get all accounting accounts
 * @returns {Promise} List of accounts
 */
export const getComptesComptables = async () => {
    const response = await axiosInstance.get('/comptes-comptables/');
    return response.data;
};

/**
 * Get product accounts (Class 7) for receipt allocation
 * @returns {Promise} List of product accounts
 */
export const getComptesProduits = async () => {
    const response = await axiosInstance.get('/comptes-comptables/produits/');
    return response.data;
};

/**
 * Get accounts statistics
 * @returns {Promise} Account statistics
 */
export const getComptesStatistiques = async () => {
    const response = await axiosInstance.get('/comptes-comptables/statistiques/');
    return response.data;
};

/**
 * Get accounts by class
 * @param {string} classe - Class number (1-7)
 * @returns {Promise} Accounts in that class
 */
export const getComptesParClasse = async (classe) => {
    const response = await axiosInstance.get(`/comptes-comptables/par-classe/${classe}/`);
    return response.data;
};

/**
 * Get accounts in tree structure
 * @returns {Promise} Account tree
 */
export const getComptesArborescence = async () => {
    const response = await axiosInstance.get('/comptes-comptables/arborescence/');
    return response.data;
};

/**
 * Create a new accounting account
 * @param {Object} data - Account data
 * @returns {Promise} Created account
 */
export const createCompteComptable = async (data) => {
    const response = await axiosInstance.post('/comptes-comptables/', data);
    return response.data;
};

/**
 * Update an accounting account
 * @param {number} id - Account ID
 * @param {Object} data - Updated data
 * @returns {Promise} Updated account
 */
export const updateCompteComptable = async (id, data) => {
    const response = await axiosInstance.patch(`/comptes-comptables/${id}/`, data);
    return response.data;
};

/**
 * Delete an accounting account
 * @param {number} id - Account ID
 * @returns {Promise} Deletion result
 */
export const deleteCompteComptable = async (id) => {
    const response = await axiosInstance.delete(`/comptes-comptables/${id}/`);
    return response.data;
};

// ==================== ÉCRITURES COMPTABLES ====================

/**
 * Get all accounting entries
 * @returns {Promise} List of entries
 */
export const getEcritures = async () => {
    const response = await axiosInstance.get('/ecritures/');
    return response.data;
};

/**
 * Get écritures statistics
 * @returns {Promise} Statistics
 */
export const getEcrituresStatistiques = async () => {
    const response = await axiosInstance.get('/ecritures/statistiques/');
    return response.data;
};

/**
 * Get balance of accounts
 * @param {Object} filters - Optional filters (date_debut, date_fin, classe)
 * @returns {Promise} Balance data
 */
export const getBalance = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date_debut) params.append('date_debut', filters.date_debut);
    if (filters.date_fin) params.append('date_fin', filters.date_fin);
    if (filters.classe) params.append('classe', filters.classe);

    const response = await axiosInstance.get(`/ecritures/balance/?${params.toString()}`);
    return response.data;
};

/**
 * Get Grand Livre (movements for a specific account)
 * @param {number} compteId - Account ID
 * @param {Object} filters - Optional date filters
 * @returns {Promise} Grand Livre data
 */
export const getGrandLivre = async (compteId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date_debut) params.append('date_debut', filters.date_debut);
    if (filters.date_fin) params.append('date_fin', filters.date_fin);

    const response = await axiosInstance.get(`/ecritures/grand-livre/${compteId}/?${params.toString()}`);
    return response.data;
};

/**
 * Get all journals
 * @returns {Promise} List of journals
 */
export const getJournaux = async () => {
    const response = await axiosInstance.get('/journaux/');
    return response.data;
};

/**
 * Get entries for a specific journal
 * @param {string} code - Journal code (JC, JB, JMM, JOD)
 * @param {Object} filters - Optional date filters
 * @returns {Promise} Journal entries
 */
export const getJournalEcritures = async (code, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date_debut) params.append('date_debut', filters.date_debut);
    if (filters.date_fin) params.append('date_fin', filters.date_fin);

    const response = await axiosInstance.get(`/journaux/${code}/ecritures/?${params.toString()}`);
    return response.data;
};

// ==================== DASHBOARD DATA ====================

/**
 * Get all dashboard data in one call
 * @returns {Promise} Combined dashboard data
 */
export const getDashboardData = async () => {
    try {
        const [quittancesStats, comptesStats, ecrituresStats] = await Promise.all([
            getQuittancesStatistiques(),
            getComptesStatistiques(),
            getEcrituresStatistiques()
        ]);

        return {
            success: true,
            quittances: quittancesStats,
            comptes: comptesStats,
            ecritures: ecrituresStats
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// ==================== EXPORT FUNCTIONS ====================

/**
 * Get quittance data for PDF generation
 * @param {number} id - Quittance ID
 * @returns {Promise} Quittance data for PDF
 */
export const getQuittanceExportPdf = async (id) => {
    const response = await axiosInstance.get(`/quittances/${id}/export_pdf/`);
    return response.data;
};

/**
 * Download validated quittances as CSV
 * @param {Object} filters - Optional filters (date_debut, date_fin)
 * @returns {Promise} CSV file blob
 */
export const downloadQuittancesCsv = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date_debut) params.append('date_debut', filters.date_debut);
    if (filters.date_fin) params.append('date_fin', filters.date_fin);

    const response = await axiosInstance.get(`/quittances/export_csv/?${params.toString()}`, {
        responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quittances_validees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
};

/**
 * Generate and download PDF for a single quittance
 * Uses browser print functionality as a simple PDF solution
 * @param {number} id - Quittance ID
 */
export const downloadQuittancePdf = async (id) => {
    const data = await getQuittanceExportPdf(id);

    if (!data.success) {
        throw new Error('Failed to fetch quittance data');
    }

    // Create printable HTML
    const quittance = data.quittance;
    const patient = data.patient;
    const hopital = data.hopital;

    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Quittance ${quittance.numero}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .header h1 { margin: 0; color: #333; }
                .header p { margin: 5px 0; color: #666; }
                .content { margin: 20px 0; }
                .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .label { font-weight: bold; color: #555; }
                .value { color: #333; }
                .amount { font-size: 24px; font-weight: bold; color: #2e7d32; text-align: center; margin: 20px 0; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
                .validated { background: #e8f5e9; padding: 10px; border-radius: 5px; text-align: center; }
                @media print { 
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${hopital.nom}</h1>
                <p>${hopital.adresse}</p>
                <p>Tél: ${hopital.telephone}</p>
            </div>
            
            <h2 style="text-align: center; margin-top: 30px;">QUITTANCE DE PAIEMENT</h2>
            <p style="text-align: center; font-size: 14px; color: #666;">N° ${quittance.numero}</p>
            
            <div class="content">
                <div class="row">
                    <span class="label">Date de paiement:</span>
                    <span class="value">${new Date(quittance.date_paiement).toLocaleString('fr-FR')}</span>
                </div>
                ${patient ? `
                <div class="row">
                    <span class="label">Patient:</span>
                    <span class="value">${patient.full_name} (${patient.matricule})</span>
                </div>
                ` : ''}
                <div class="row">
                    <span class="label">Motif:</span>
                    <span class="value">${quittance.motif}</span>
                </div>
                <div class="row">
                    <span class="label">Type de recette:</span>
                    <span class="value">${quittance.type_recette}</span>
                </div>
                <div class="row">
                    <span class="label">Mode de paiement:</span>
                    <span class="value">${quittance.mode_paiement}</span>
                </div>
            </div>
            
            <div class="amount">
                ${new Intl.NumberFormat('fr-FR').format(quittance.montant)} FCFA
            </div>
            <p style="text-align: center; font-style: italic; color: #666;">
                ${quittance.montant_lettres}
            </p>
            
            ${quittance.validee ? `
            <div class="validated">
                ✓ Quittance validée le ${quittance.date_validation ? new Date(quittance.date_validation).toLocaleDateString('fr-FR') : 'N/A'}
            </div>
            ` : ''}
            
            <div class="footer">
                <p>Document généré le ${new Date().toLocaleString('fr-FR')}</p>
                <p>${hopital.nom} - Système de Gestion Hospitalière</p>
            </div>
        </body>
        </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);

    return { success: true };
};
