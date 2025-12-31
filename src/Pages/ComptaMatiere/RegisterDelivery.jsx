import { AccountantDashBoard } from "./Components/AccountantDashboard";
import { AccountantNavLink } from "./AccountantNavLink";
import { AccountantNavBar } from "./Components/AccountantNavBar";
import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSave, FaTruck, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import PropTypes from "prop-types";

export function RegisterDelivery() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Liste des matériels (chargée depuis l'API)
    const [materialsDatabase, setMaterialsDatabase] = useState([]);

    const [deliveryItems, setDeliveryItems] = useState([
        {
            id: 1,
            isNewMaterial: false,
            material: "",
            materialCode: "",
            type: "Matériel Médical",
            quantityOrdered: "",
            quantityReceived: "",
            unitPrice: "",
            justification: "",
            // Champs pour nouveau matériel médical
            prixVente: "",
            unite: "boîte",
            seuilAlerte: "10",
            // Champs pour nouveau matériel durable
            localisation: "",
            numeroSerie: "",
            dureeGarantie: "",
            // Champs communs
            description: "",
            emplacement: ""
        }
    ]);

    const [deliveryInfo, setDeliveryInfo] = useState({
        supplier: "",
        deliveryNoteNumber: "",
        deliveryDate: new Date().toISOString().split('T')[0],
        receptionDate: new Date().toISOString().split('T')[0],
        supplierContact: "",
        amount: ""
    });

    const [formError, setFormError] = useState("");

    // Charger les données au montage
    useEffect(() => {
        loadData();
    }, []);

    /**
     * 📡 CHARGEMENT DES DONNÉES (Mode "Toujours Frais")
     */
    async function loadData() {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token_key_fultang");
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        const baseUrl = "http://127.0.0.1:8000/api";

        const fetchJson = async (url) => {
            const res = await fetch(url, { headers, cache: "no-store" });
            if (!res.ok) {
                // Tenter de lire le corps pour avoir des détails si c'est du JSON
                try {
                    const errBody = await res.json();
                    throw new Error(errBody.detail || `Erreur HTTP ${res.status}`);
                } catch (e) {
                    throw new Error(`Erreur HTTP ${res.status} lors de l'appel à ${url}`);
                }
            }
            return res.json();
        };

        try {
            console.log("Chargement des données RegisterDelivery...");
            // Charger les deux catalogues en parallèle
            const [medicauxRes, durablesRes] = await Promise.all([
                fetchJson(`${baseUrl}/materiels-medicaux/`),
                fetchJson(`${baseUrl}/materiels-durables/`)
            ]);

            let medicauxData = medicauxRes.results || medicauxRes || [];
            if (!Array.isArray(medicauxData)) {
                console.warn("API Materiels Médicaux a renvoyé un format inattendu (pas un tableau):", medicauxData);
                medicauxData = [];
            }

            let durablesData = durablesRes.results || durablesRes || [];
            if (!Array.isArray(durablesData)) {
                console.warn("API Materiels Durables a renvoyé un format inattendu (pas un tableau):", durablesData);
                durablesData = [];
            }

            // Normalisation
            const medicaux = medicauxData.map(m => ({
                id: m.idMateriel || m.materiel_ptr_id,
                code: m.code_materiel,
                name: m.nom_Materiel,
                category: "Matériel Médical",
                quantity: m.quantite_stock,
                prixAchat: parseFloat(m.prix_achat_unitaire) || 0
            }));

            const durables = durablesData.map(m => ({
                id: m.idMateriel || m.materiel_ptr_id,
                code: m.code_materiel,
                name: m.nom_Materiel,
                category: "Matériel Durable",
                quantity: m.quantite_stock,
                prixAchat: parseFloat(m.prix_achat_unitaire) || 0
            }));

            setMaterialsDatabase([...medicaux, ...durables]);
            console.log("Données chargées avec succès.");

        } catch (err) {
            console.error("Erreur chargement:", err);
            setError(`Impossible de charger le catalogue matériel: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    // Générer un code automatique pour nouveau matériel
    function generateMaterialCode(type) {
        const prefix = type === "Matériel Médical" ? "MED" : "DUR";
        const existingCodes = materialsDatabase
            .filter(m => m.code && m.code.startsWith(prefix))
            .map(m => parseInt(m.code.split('-')[1]) || 0);

        // Trouver le max
        const nextNumber = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;

        return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
    }

    function addDeliveryItem() {
        const newItem = {
            id: Date.now(),
            isNewMaterial: false,
            material: "",
            materialCode: "",
            type: "Matériel Médical",
            quantityOrdered: "",
            quantityReceived: "",
            unitPrice: "",
            justification: "",
            prixVente: "",
            unite: "boîte",
            seuilAlerte: "10",
            localisation: "",
            numeroSerie: "",
            dureeGarantie: "",
            description: "",
            emplacement: ""
        };
        setDeliveryItems([...deliveryItems, newItem]);
    }

    function removeDeliveryItem(id) {
        if (deliveryItems.length > 1) {
            setDeliveryItems(deliveryItems.filter(item => item.id !== id));
        }
    }

    function updateDeliveryItem(id, field, value) {
        setDeliveryItems(deliveryItems.map(item => {
            if (item.id !== id) return item;

            const updated = { ...item, [field]: value };

            // Si on change isNewMaterial, générer un code automatique
            if (field === 'isNewMaterial' && value === true) {
                updated.materialCode = generateMaterialCode(item.type);
            }

            // Si on change le type pour un nouveau matériel, régénérer le code
            if (field === 'type' && item.isNewMaterial) {
                updated.materialCode = generateMaterialCode(value);
            }

            // Si on sélectionne un matériel existant
            if (field === 'materialCode' && !item.isNewMaterial) {
                const existingMaterial = materialsDatabase.find(m => m.code === value);
                if (existingMaterial) {
                    updated.material = existingMaterial.name;
                    updated.type = existingMaterial.category;
                }
            }

            return updated;
        }));
    }

    function calculateTotal() {
        return deliveryItems.reduce((total, item) => {
            const quantity = parseFloat(item.quantityReceived) || 0;
            const price = parseFloat(item.unitPrice) || 0;
            return total + (quantity * price);
        }, 0);
    }

    function validateForm() {
        for (const item of deliveryItems) {
            if (item.isNewMaterial) {
                // Validation pour nouveau matériel
                if (!item.material.trim()) {
                    return "Veuillez saisir le nom du nouveau matériel.";
                }
                if (item.type === "Matériel Médical") {
                    if (!item.prixVente || !item.unite) {
                        return "Pour un nouveau matériel médical, le prix de vente et l'unité sont obligatoires.";
                    }
                } else {
                    if (!item.localisation.trim()) {
                        return "Pour un nouveau matériel durable, la localisation est obligatoire.";
                    }
                }
            } else {
                // Validation pour matériel existant
                if (!item.materialCode) {
                    return "Veuillez sélectionner un matériel existant ou cocher 'Nouveau matériel'.";
                }
            }

            if (!item.quantityReceived || parseInt(item.quantityReceived) <= 0) {
                return "La quantité reçue doit être supérieure à 0.";
            }
            if (!item.unitPrice || parseFloat(item.unitPrice) <= 0) {
                return "Le prix unitaire doit être supérieur à 0.";
            }
        }
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");

        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        const token = localStorage.getItem("token_key_fultang");
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        const baseUrl = "http://127.0.0.1:8000/api";

        try {
            setLoading(true); // Réutiliser loading state ou créer submitting state

            // 1. Créer la livraison (Entête)
            const personnelId = parseInt(localStorage.getItem("personnel_id") || "1");
            const deliveryData = {
                fournisseur: deliveryInfo.supplier,
                numero_bon_livraison: deliveryInfo.deliveryNoteNumber,
                date_livraison: deliveryInfo.deliveryDate,
                date_reception: deliveryInfo.receptionDate,
                montant_total: calculateTotal(),
                idPersonnel: personnelId
            };

            const livRes = await fetch(`${baseUrl}/livraisons/`, {
                method: 'POST',
                headers,
                body: JSON.stringify(deliveryData)
            });

            if (!livRes.ok) throw new Error("Erreur création livraison");
            const createdDelivery = await livRes.json();
            const idLivraison = createdDelivery.idLivraison;

            // 2. Traiter chaque article
            for (const item of deliveryItems) {
                let materialId = null;

                if (item.isNewMaterial) {
                    // A. Créer le nouveau matériel
                    const isMedical = item.type === "Matériel Médical";
                    const newMatData = {
                        code_materiel: item.materialCode,
                        nom_Materiel: item.material,
                        quantite_stock: parseInt(item.quantityReceived),
                        prix_achat_unitaire: parseFloat(item.unitPrice),
                        description: item.description || "",
                        // Champs spécifiques
                        ...(isMedical ? {
                            prix_vente_unitaire: parseFloat(item.prixVente),
                            unite_mesure: item.unite,
                            seuil_alerte: parseInt(item.seuilAlerte) || 10,
                            date_peremption: null // Pas géré dans formulaire actuel
                        } : {
                            localisation: item.localisation,
                            numero_serie: item.numeroSerie,
                            duree_garantie: parseInt(item.dureeGarantie) || 0,
                            etat: 'bon'
                        })
                    };

                    const endpoint = isMedical ? '/materiels-medicaux/' : '/materiels-durables/';
                    const matRes = await fetch(`${baseUrl}${endpoint}`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(newMatData)
                    });

                    if (!matRes.ok) throw new Error(`Erreur création matériel ${item.material}`);
                    const createdMat = await matRes.json();
                    materialId = createdMat.idMateriel || createdMat.materiel_ptr_id;

                } else {
                    // B. Matériel existant : Récupérer son ID via le code
                    const existingMat = materialsDatabase.find(m => m.code === item.materialCode);
                    if (!existingMat) throw new Error(`Matériel introuvable ${item.materialCode}`);
                    materialId = existingMat.id;

                    // Mettre à jour le stock (PATCH)
                    const endpoint = existingMat.category === "Matériel Médical"
                        ? `/materiels-medicaux/${materialId}/`
                        : `/materiels-durables/${materialId}/`;

                    const newQuantity = (existingMat.quantity || 0) + parseInt(item.quantityReceived);

                    await fetch(`${baseUrl}${endpoint}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify({ quantite_stock: newQuantity })
                    });
                }

                // 3. Créer la ligne de livraison
                if (materialId) {
                    const ligneData = {
                        id_livraison: idLivraison,
                        id_materiel: materialId,
                        quantite_recu: parseInt(item.quantityReceived),
                        prix_unitaire: parseFloat(item.unitPrice),
                        ecart_accuse: false, // Par défaut
                        commentaire_ecart: item.justification || ""
                    };

                    await fetch(`${baseUrl}/lignes-livraison/`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(ligneData)
                    });
                }
            }

            // Succès
            alert(`Livraison enregistrée avec succès ! (N° ${deliveryInfo.deliveryNoteNumber})`);

            // Recharger les données pour mettre à jour les stocks affichés
            await loadData();

            // Reset form
            setDeliveryInfo({
                supplier: "",
                deliveryNoteNumber: "",
                deliveryDate: new Date().toISOString().split('T')[0],
                receptionDate: new Date().toISOString().split('T')[0],
                supplierContact: "",
                amount: ""
            });
            setDeliveryItems([{
                id: Date.now(),
                isNewMaterial: false,
                material: "",
                materialCode: "",
                type: "Matériel Médical",
                quantityOrdered: "",
                quantityReceived: "",
                unitPrice: "",
                justification: "",
                prixVente: "",
                unite: "boîte",
                seuilAlerte: "10",
                localisation: "",
                numeroSerie: "",
                dureeGarantie: "",
                description: "",
                emplacement: ""
            }]);

        } catch (err) {
            console.error("Erreur enregistrement:", err);
            setFormError("Erreur lors de l'enregistrement de la livraison. Détails console.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AccountantDashBoard
            linkList={AccountantNavLink}
            requiredRole={"ComptaMatiere"}
        >
            <AccountantNavBar />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaTruck className="text-4xl text-blue-500" />
                        <h1 className="text-3xl font-bold text-gray-800">Enregistrer une Livraison</h1>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-100 border border-red-300 rounded-lg flex items-start gap-3 mb-4">
                        <FaExclamationTriangle className="text-red-600 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-800">Erreur de chargement</p>
                            <p className="text-sm text-red-700">{error}</p>
                            <button
                                onClick={loadData}
                                className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                            >
                                Réessayer
                            </button>
                        </div>
                    </div>
                )}

                {formError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <FaExclamationTriangle className="text-red-500 mt-0.5" />
                        <p className="text-sm text-red-700">{formError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informations de livraison */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Informations de Livraison</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Fournisseur *
                                </label>
                                <input
                                    type="text"
                                    value={deliveryInfo.supplier}
                                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, supplier: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Nom du fournisseur"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    N° de bon de livraison *
                                </label>
                                <input
                                    type="text"
                                    value={deliveryInfo.deliveryNoteNumber}
                                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, deliveryNoteNumber: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="BL-2024-001"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Contact fournisseur
                                </label>
                                <input
                                    type="text"
                                    value={deliveryInfo.supplierContact}
                                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, supplierContact: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Téléphone ou email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Date de création *
                                </label>
                                <input
                                    type="date"
                                    value={deliveryInfo.deliveryDate}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                                    disabled
                                    title="Date de création automatique (non modifiable)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Date de réception *
                                </label>
                                <input
                                    type="date"
                                    value={deliveryInfo.receptionDate}
                                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, receptionDate: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Montant Total
                                </label>
                                <div className="w-full p-3 border border-gray-300 rounded-lg bg-green-50">
                                    <span className="font-bold text-green-600 text-lg">
                                        {calculateTotal().toLocaleString('fr-FR')} FCFA
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Articles livrés */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Articles Livrés</h2>
                            <button
                                type="button"
                                onClick={addDeliveryItem}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                            >
                                <FaPlus /> Ajouter un article
                            </button>
                        </div>

                        <div className="space-y-6">
                            {deliveryItems.map((item) => (
                                <DeliveryItemRow
                                    key={item.id}
                                    item={item}
                                    materialsDatabase={materialsDatabase}
                                    onUpdate={updateDeliveryItem}
                                    onRemove={removeDeliveryItem}
                                    canRemove={deliveryItems.length > 1}
                                />
                            ))}
                        </div>

                        {/* Résumé */}
                        <div className="mt-6 pt-4 border-t-2 border-gray-300">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold">{deliveryItems.length}</span> article(s) |
                                    <span className="text-green-600 ml-2">{deliveryItems.filter(i => !i.isNewMaterial).length} existant(s)</span> |
                                    <span className="text-blue-600 ml-2">{deliveryItems.filter(i => i.isNewMaterial).length} nouveau(x)</span>
                                </div>
                                <div>
                                    <span className="text-xl font-bold text-gray-700 mr-4">Montant Total:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {calculateTotal().toLocaleString('fr-FR')} FCFA
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg hover:opacity-90 transition-all duration-300"
                        >
                            <FaSave /> Enregistrer la livraison
                        </button>
                    </div>
                </form>
            </div>
        </AccountantDashBoard>
    );
}

function DeliveryItemRow({ item, materialsDatabase, onUpdate, onRemove, canRemove }) {
    DeliveryItemRow.propTypes = {
        item: PropTypes.object.isRequired,
        materialsDatabase: PropTypes.array.isRequired,
        onUpdate: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
        canRemove: PropTypes.bool.isRequired
    };

    return (
        <div className={`p-4 rounded-lg border-2 ${item.isNewMaterial ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
            {/* Checkbox nouveau matériel */}
            <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={item.isNewMaterial}
                        onChange={(e) => onUpdate(item.id, 'isNewMaterial', e.target.checked)}
                        className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <span className="font-semibold text-gray-700">
                        {item.isNewMaterial ? '🆕 Nouveau matériel' : 'Matériel existant'}
                    </span>
                </label>
                {item.isNewMaterial && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Code auto: {item.materialCode}
                    </span>
                )}
            </div>

            {/* Ligne principale */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                {/* Matériel */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {item.isNewMaterial ? 'Nom du nouveau matériel *' : 'Matériel existant *'}
                    </label>
                    {item.isNewMaterial ? (
                        <input
                            type="text"
                            value={item.material}
                            onChange={(e) => onUpdate(item.id, 'material', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Nom du matériel"
                            required
                        />
                    ) : (
                        <select
                            value={item.materialCode}
                            onChange={(e) => onUpdate(item.id, 'materialCode', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Sélectionner un matériel</option>
                            {materialsDatabase.map(m => (
                                <option key={m.code} value={m.code}>
                                    {m.name} ({m.code}) - Stock: {m.quantity}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Type */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                    <select
                        value={item.type}
                        onChange={(e) => onUpdate(item.id, 'type', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={!item.isNewMaterial}
                    >
                        <option value="Matériel Médical">Matériel Médical</option>
                        <option value="Matériel Durable">Matériel Durable</option>
                    </select>
                </div>

                {/* Qté Reçue */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Qté Reçue *</label>
                    <input
                        type="number"
                        value={item.quantityReceived}
                        onChange={(e) => onUpdate(item.id, 'quantityReceived', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="1"
                        required
                    />
                </div>

                {/* Prix Unitaire */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prix Unit. *</label>
                    <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => onUpdate(item.id, 'unitPrice', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                        required
                    />
                </div>

                {/* Bouton supprimer */}
                <div className="flex items-end">
                    {canRemove && (
                        <button
                            type="button"
                            onClick={() => onRemove(item.id)}
                            className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                            <FaTrash className="mx-auto" />
                        </button>
                    )}
                </div>
            </div>

            {/* Champs supplémentaires pour nouveau matériel */}
            {item.isNewMaterial && (
                <div className="border-t border-gray-300 pt-4 mt-4">
                    <h4 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                        <FaCheckCircle />
                        Informations complémentaires pour le nouveau matériel
                    </h4>

                    {/* Champs communs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                value={item.description}
                                onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Description..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Emplacement</label>
                            <input
                                type="text"
                                value={item.emplacement}
                                onChange={(e) => onUpdate(item.id, 'emplacement', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Stockage A, Pharmacie..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Justification</label>
                            <input
                                type="text"
                                value={item.justification}
                                onChange={(e) => onUpdate(item.id, 'justification', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Justification..."
                            />
                        </div>
                    </div>

                    {/* Champs spécifiques Matériel Médical */}
                    {item.type === "Matériel Médical" && (
                        <div className="bg-red-50 p-3 rounded-lg">
                            <h5 className="text-sm font-semibold text-red-700 mb-2">Attributs Matériel Médical</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Prix Vente *</label>
                                    <input
                                        type="number"
                                        value={item.prixVente}
                                        onChange={(e) => onUpdate(item.id, 'prixVente', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Unité *</label>
                                    <select
                                        value={item.unite}
                                        onChange={(e) => onUpdate(item.id, 'unite', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value="boîte">Boîte</option>
                                        <option value="flacon">Flacon</option>
                                        <option value="unité">Unité</option>
                                        <option value="sachet">Sachet</option>
                                        <option value="tube">Tube</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Seuil Alerte</label>
                                    <input
                                        type="number"
                                        value={item.seuilAlerte}
                                        onChange={(e) => onUpdate(item.id, 'seuilAlerte', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Champs spécifiques Matériel Durable */}
                    {item.type === "Matériel Durable" && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="text-sm font-semibold text-blue-700 mb-2">Attributs Matériel Durable</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Localisation *</label>
                                    <input
                                        type="text"
                                        value={item.localisation}
                                        onChange={(e) => onUpdate(item.id, 'localisation', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="Bureau, Salle..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">N° Série</label>
                                    <input
                                        type="text"
                                        value={item.numeroSerie}
                                        onChange={(e) => onUpdate(item.id, 'numeroSerie', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="SN-XXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Garantie (mois)</label>
                                    <input
                                        type="number"
                                        value={item.dureeGarantie}
                                        onChange={(e) => onUpdate(item.id, 'dureeGarantie', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="12"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Justification pour matériel existant */}
            {!item.isNewMaterial && (
                <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Justification (si écart)</label>
                    <input
                        type="text"
                        value={item.justification}
                        onChange={(e) => onUpdate(item.id, 'justification', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Justification si quantité reçue différente de commandée..."
                    />
                </div>
            )}
        </div>
    );
}
