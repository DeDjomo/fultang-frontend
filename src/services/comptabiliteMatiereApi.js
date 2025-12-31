/**
 * Service API pour la Comptabilité Matière
 * Se connecte au backend Fultang pour les opérations de gestion de stock
 */
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_COMPTABILITE_MATIERE_URL || "http://127.0.0.1:8000";

// Instance Axios pour la comptabilité matière
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Intercepteur pour ajouter le token si disponible
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token_key_fultang");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Helper pour charger toutes les pages d'une API paginée
async function fetchAllPages(endpoint) {
    let allResults = [];
    let url = endpoint;

    while (url) {
        const response = await apiClient.get(url);
        const data = response.data;

        // Si c'est une réponse paginée
        if (data.results) {
            allResults = [...allResults, ...data.results];
            // Extraire le chemin relatif du next URL
            if (data.next) {
                const nextUrl = new URL(data.next);
                url = nextUrl.pathname + nextUrl.search;
            } else {
                url = null;
            }
        } else {
            // Si ce n'est pas paginé, retourner directement
            return data;
        }
    }

    return allResults;
}

// ============================================
// MATÉRIELS MÉDICAUX
// URL Backend: GET /api/materiels-medicaux/
// Opération: Récupération de la liste des consommables médicaux
// ============================================
export const materielMedicalApi = {
    getAll: async () => {
        // Charger toutes les pages
        return await fetchAllPages("/api/materiels-medicaux/");
    },
    getById: async (id) => {
        const response = await apiClient.get(`/api/materiels-medicaux/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/api/materiels-medicaux/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/api/materiels-medicaux/${id}/`, data);
        return response.data;
    },
    patch: async (id, data) => {
        const response = await apiClient.patch(`/api/materiels-medicaux/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/api/materiels-medicaux/${id}/`);
        return response.data;
    }
};

// ============================================
// MATÉRIELS DURABLES
// URL Backend: GET /api/materiels-durables/
// Opération: Récupération de la liste des équipements (lits, machines...)
// ============================================
export const materielDurableApi = {
    getAll: async () => {
        const response = await apiClient.get("/api/materiels-durables/");
        return response.data;
    },
    getById: async (id) => {
        const response = await apiClient.get(`/api/materiels-durables/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/api/materiels-durables/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/api/materiels-durables/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/api/materiels-durables/${id}/`);
        return response.data;
    }
};

// ============================================
// ARCHIVES D'INVENTAIRE
// URL Backend: GET /api/archives-inventaire/
// Opération: Historique des inventaires réalisés
// ============================================
export const archiveInventaireApi = {
    getAll: async () => {
        return await fetchAllPages("/api/archives-inventaire/");
    },
    getById: async (id) => {
        const response = await apiClient.get(`/api/archives-inventaire/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/api/archives-inventaire/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/api/archives-inventaire/${id}/`, data);
        return response.data;
    },
    patch: async (id, data) => {
        const response = await apiClient.patch(`/api/archives-inventaire/${id}/`, data);
        return response.data;
    },
    terminer: async (id) => {
        const response = await apiClient.patch(`/api/archives-inventaire/${id}/`, { statut: "TERMINE" });
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/api/archives-inventaire/${id}/`);
        return response.data;
    }
};

// ============================================
// LIGNES D'ARCHIVE D'INVENTAIRE
// URL Backend: GET /api/lignes-archive/
// Opération: Détails des produits pour un inventaire donné
// ============================================
export const ligneArchiveApi = {
    getAll: async () => {
        return await fetchAllPages("/api/lignes-archive/");
    },
    getByArchive: async (archiveId) => {
        const response = await apiClient.get(`/api/lignes-archive/?archive=${archiveId}`);
        return response.data;
    },
    getById: async (id) => {
        const response = await apiClient.get(`/api/lignes-archive/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/api/lignes-archive/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/api/lignes-archive/${id}/`, data);
        return response.data;
    },
    patch: async (id, data) => {
        const response = await apiClient.patch(`/api/lignes-archive/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/api/lignes-archive/${id}/`);
        return response.data;
    }
};

// ============================================
// SORTIES
// URL Backend: GET /api/sorties/
// Opération: Gestion des sorties de stock vers les services
// ============================================
export const sortieApi = {
    getAll: async () => {
        return await fetchAllPages("/api/sorties/");
    },
    getById: async (id) => {
        const response = await apiClient.get(`/api/sorties/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/api/sorties/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/api/sorties/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/api/sorties/${id}/`);
        return response.data;
    }
};

// ============================================
// LIGNES DE SORTIE
// URL Backend: GET /api/lignes-sortie/
// Opération: Détail des produits contenus dans une sortie
// ============================================
export const ligneSortieApi = {
    getAll: async () => {
        const response = await apiClient.get("/api/lignes-sortie/");
        return response.data;
    },
    getBySortie: async (sortieId) => {
        const response = await apiClient.get(`/api/lignes-sortie/?id_sortie=${sortieId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/api/lignes-sortie/", data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/api/lignes-sortie/${id}/`);
        return response.data;
    }
};

// ============================================
// RAPPORTS
// URL Backend: GET /api/rapports/
// Opération: Rapports générés par le système ou les utilisateurs
// ============================================
export const rapportApi = {
    getAll: async () => {
        return await fetchAllPages("/api/rapports/");
    },
    getById: async (id) => {
        const response = await apiClient.get(`/api/rapports/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/api/rapports/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/api/rapports/${id}/`, data);
        return response.data;
    },
    patch: async (id, data) => {
        const response = await apiClient.patch(`/api/rapports/${id}/`, data);
        return response.data;
    },
    marquerLu: async (id) => {
        const response = await apiClient.patch(`/api/rapports/${id}/`, { est_lu: true, statut: "lu" });
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/api/rapports/${id}/`);
        return response.data;
    }
};

// ============================================
// BESOINS
// ============================================
export const besoinApi = {
    getAll: async () => {
        return await fetchAllPages("/api/besoins/");
    },
    getById: async (id) => {
        const response = await apiClient.get(`/api/besoins/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/api/besoins/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/api/besoins/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/api/besoins/${id}/`);
        return response.data;
    }
};

// ============================================
// LIGNES DE BESOIN
// ============================================
export const ligneBesoinApi = {
    getAll: async () => {
        const response = await apiClient.get("/api/lignes-besoin/");
        return response.data;
    },
    getByBesoin: async (besoinId) => {
        const response = await apiClient.get(`/api/lignes-besoin/?id_besoin=${besoinId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/api/lignes-besoin/", data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/api/lignes-besoin/${id}/`);
        return response.data;
    }
};

// ============================================
// LIVRAISONS
// ============================================
export const livraisonApi = {
    getAll: async () => {
        return await fetchAllPages("/api/livraisons/");
    },
    getById: async (id) => {
        const response = await apiClient.get(`/api/livraisons/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/api/livraisons/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/api/livraisons/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/api/livraisons/${id}/`);
        return response.data;
    }
};

// ============================================
// LIGNES DE LIVRAISON
// ============================================
export const ligneLivraisonApi = {
    getAll: async () => {
        return await fetchAllPages("/api/lignes-livraison/");
    },
    getByLivraison: async (livraisonId) => {
        const response = await apiClient.get(`/api/lignes-livraison/?id_livraison=${livraisonId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/api/lignes-livraison/", data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/api/lignes-livraison/${id}/`);
        return response.data;
    }
};

// ============================================
// FONCTIONS HELPERS POUR DASHBOARD
// ============================================

/**
 * Récupère les statistiques du dashboard pharmacien
 */
export async function getPharmacistDashboardStats() {
    try {
        // Récupérer les matériels médicaux
        const medications = await materielMedicalApi.getAll();
        const medsArray = Array.isArray(medications) ? medications : (medications.results || []);

        // Récupérer les sorties du jour (ventes)
        const sorties = await sortieApi.getAll();
        const sortiesArray = Array.isArray(sorties) ? sorties : (sorties.results || []);

        const today = new Date().toISOString().split('T')[0];
        const todaySales = sortiesArray.filter(s =>
            s.date_sortie?.startsWith(today) && s.motif_sortie === 'VENTE'
        );

        // Calculer les statistiques
        const lowStock = medsArray.filter(m => (m.quantite_stock || 0) <= (m.seuil_alerte || 20));

        return {
            medications: medsArray,
            todaySales: todaySales,
            totalMedications: medsArray.length,
            lowStock: lowStock.length,
            salesCount: todaySales.length
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des stats pharmacien:", error);
        throw error;
    }
}

export default apiClient;
