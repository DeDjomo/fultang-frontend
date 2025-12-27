/**
 * Service API pour la Comptabilité Matière
 * Se connecte au backend Fultang pour les opérations de gestion de stock
 */
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_COMPTABILITE_MATIERE_URL || "http://127.0.0.1:8000/api";

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
// ============================================
export const materielMedicalApi = {
    getAll: async () => {
        // Charger toutes les pages
        return await fetchAllPages("/materiels-medicaux/");
    },
    getById: async (id) => {
        const response = await apiClient.get(`/materiels-medicaux/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/materiels-medicaux/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/materiels-medicaux/${id}/`, data);
        return response.data;
    },
    patch: async (id, data) => {
        const response = await apiClient.patch(`/materiels-medicaux/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/materiels-medicaux/${id}/`);
        return response.data;
    }
};

// ============================================
// MATÉRIELS DURABLES
// ============================================
export const materielDurableApi = {
    getAll: async () => {
        const response = await apiClient.get("/materiels-durables/");
        return response.data;
    },
    getById: async (id) => {
        const response = await apiClient.get(`/materiels-durables/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/materiels-durables/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/materiels-durables/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/materiels-durables/${id}/`);
        return response.data;
    }
};

// ============================================
// ARCHIVES D'INVENTAIRE
// ============================================
export const archiveInventaireApi = {
    getAll: async () => {
        return await fetchAllPages("/archives-inventaire/");
    },
    getById: async (id) => {
        const response = await apiClient.get(`/archives-inventaire/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/archives-inventaire/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/archives-inventaire/${id}/`, data);
        return response.data;
    },
    patch: async (id, data) => {
        const response = await apiClient.patch(`/archives-inventaire/${id}/`, data);
        return response.data;
    },
    terminer: async (id) => {
        const response = await apiClient.patch(`/archives-inventaire/${id}/`, { statut: "TERMINE" });
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/archives-inventaire/${id}/`);
        return response.data;
    }
};

// ============================================
// LIGNES D'ARCHIVE D'INVENTAIRE
// ============================================
export const ligneArchiveApi = {
    getAll: async () => {
        return await fetchAllPages("/lignes-archive/");
    },
    getByArchive: async (archiveId) => {
        const response = await apiClient.get(`/lignes-archive/?archive=${archiveId}`);
        return response.data;
    },
    getById: async (id) => {
        const response = await apiClient.get(`/lignes-archive/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/lignes-archive/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/lignes-archive/${id}/`, data);
        return response.data;
    },
    patch: async (id, data) => {
        const response = await apiClient.patch(`/lignes-archive/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/lignes-archive/${id}/`);
        return response.data;
    }
};

// ============================================
// SORTIES
// ============================================
export const sortieApi = {
    getAll: async () => {
        return await fetchAllPages("/sorties/");
    },
    getById: async (id) => {
        const response = await apiClient.get(`/sorties/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/sorties/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/sorties/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/sorties/${id}/`);
        return response.data;
    }
};

// ============================================
// LIGNES DE SORTIE
// ============================================
export const ligneSortieApi = {
    getAll: async () => {
        const response = await apiClient.get("/lignes-sortie/");
        return response.data;
    },
    getBySortie: async (sortieId) => {
        const response = await apiClient.get(`/lignes-sortie/?id_sortie=${sortieId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/lignes-sortie/", data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/lignes-sortie/${id}/`);
        return response.data;
    }
};

// ============================================
// RAPPORTS
// ============================================
export const rapportApi = {
    getAll: async () => {
        return await fetchAllPages("/rapports/");
    },
    getById: async (id) => {
        const response = await apiClient.get(`/rapports/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/rapports/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/rapports/${id}/`, data);
        return response.data;
    },
    patch: async (id, data) => {
        const response = await apiClient.patch(`/rapports/${id}/`, data);
        return response.data;
    },
    marquerLu: async (id) => {
        const response = await apiClient.patch(`/rapports/${id}/`, { est_lu: true, statut: "lu" });
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/rapports/${id}/`);
        return response.data;
    }
};

// ============================================
// BESOINS
// ============================================
export const besoinApi = {
    getAll: async () => {
        return await fetchAllPages("/besoins/");
    },
    getById: async (id) => {
        const response = await apiClient.get(`/besoins/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/besoins/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/besoins/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/besoins/${id}/`);
        return response.data;
    }
};

// ============================================
// LIGNES DE BESOIN
// ============================================
export const ligneBesoinApi = {
    getAll: async () => {
        const response = await apiClient.get("/lignes-besoin/");
        return response.data;
    },
    getByBesoin: async (besoinId) => {
        const response = await apiClient.get(`/lignes-besoin/?id_besoin=${besoinId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/lignes-besoin/", data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/lignes-besoin/${id}/`);
        return response.data;
    }
};

// ============================================
// LIVRAISONS
// ============================================
export const livraisonApi = {
    getAll: async () => {
        return await fetchAllPages("/livraisons/");
    },
    getById: async (id) => {
        const response = await apiClient.get(`/livraisons/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/livraisons/", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/livraisons/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/livraisons/${id}/`);
        return response.data;
    }
};

// ============================================
// LIGNES DE LIVRAISON
// ============================================
export const ligneLivraisonApi = {
    getAll: async () => {
        return await fetchAllPages("/lignes-livraison/");
    },
    getByLivraison: async (livraisonId) => {
        const response = await apiClient.get(`/lignes-livraison/?id_livraison=${livraisonId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post("/lignes-livraison/", data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/lignes-livraison/${id}/`);
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
