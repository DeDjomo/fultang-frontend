import { AccountantDashBoard } from "./Components/AccountantDashboard";
import { AccountantNavLink } from "./AccountantNavLink";
import { AccountantNavBar } from "./Components/AccountantNavBar";
import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSave, FaBoxOpen, FaCheckCircle, FaSpinner, FaSyncAlt } from "react-icons/fa";
import PropTypes from "prop-types";
import { materielMedicalApi, materielDurableApi, sortieApi, ligneSortieApi } from "../../services/comptabiliteMatiereApi";

export function RegisterOutput() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    // Liste des matériels depuis l'API
    const [materialsDatabase, setMaterialsDatabase] = useState([]);

    // Articles en sortie
    const [outputItems, setOutputItems] = useState([
        { id: 1, nomMateriel: "", codeMateriel: "", typeMateriel: "", materialId: null, quantite: "", stockDisponible: 0 }
    ]);

    // Informations de sortie
    const [outputInfo, setOutputInfo] = useState({
        numeroSortie: "",
        serviceMedical: "",
        dateSortie: new Date().toISOString().split('T')[0],
        dateEnregistrement: new Date().toISOString().split('T')[0],
        motifSortie: "DEFECTUEUX",
        observations: ""
    });

    // État pour les suggestions
    const [activeSuggestions, setActiveSuggestions] = useState({});
    const [formError, setFormError] = useState("");

    // Charger les données au montage
    useEffect(() => {
        loadData();
    }, []);

    /**
     * 📡 CHARGEMENT DES DONNÉES INITIALES
     * 
     * Objectifs:
     * 1. Charger tout le catalogue (Médical + Durable) pour l'autocomplétion sans latence.
     * 2. Générer automatiquement le prochain numéro de sortie (SOR-YYYY-NNN).
     * 
     * URLs Appeleés:
     * - GET /api/materiels-medicaux/
     * - GET /api/materiels-durables/
     * - GET /api/sorties/ (pour calculer le dernier ID)
     */
    async function loadData() {
        const token = localStorage.getItem("token_key_fultang");
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        const baseUrl = "http://127.0.0.1:8000/api";

        try {
            setLoading(true);
            setError(null);

            // Charger les matériels médicaux et durables en parallèle (cache désactivé)
            const [medicauxRes, durablesRes] = await Promise.all([
                fetch(`${baseUrl}/materiels-medicaux/`, { headers, cache: "no-store" }).then(res => res.json()),
                fetch(`${baseUrl}/materiels-durables/`, { headers, cache: "no-store" }).then(res => res.json())
            ]);

            const medicauxData = medicauxRes.results || medicauxRes || [];
            const durablesData = durablesRes.results || durablesRes || [];

            const medicaux = medicauxData.map(m => ({
                id: m.idMateriel || m.materiel_ptr_id,
                code: m.code_materiel,
                name: m.nom_Materiel,
                category: "MEDICAL",
                categoryDisplay: "Medical Material",
                quantity: m.quantite_stock,
                prixVente: parseFloat(m.prix_vente_unitaire) || 0
            }));

            const durables = durablesData.map(m => ({
                id: m.idMateriel || m.materiel_ptr_id,
                code: m.code_materiel,
                name: m.nom_Materiel,
                category: "DURABLE",
                categoryDisplay: "Durable Material",
                quantity: m.quantite_stock,
                prixVente: null
            }));

            setMaterialsDatabase([...medicaux, ...durables]);

            // Générer le numéro de sortie
            // Récupérer toutes les sorties pour trouver le dernier numéro
            // Note: Optimisation possible -> Endpoint dédié backend 'next-number'
            const sortiesRes = await fetch(`${baseUrl}/sorties/`, { headers, cache: "no-store" });
            const sortiesData = await sortiesRes.json();
            const sorties = sortiesData.results || sortiesData || [];

            const year = new Date().getFullYear();
            const count = sorties.filter(s => s.numero_sortie?.includes(`SOR-${year}`)).length + 1;
            const newNumber = `SOR-${year}-${String(count).padStart(3, '0')}`;

            setOutputInfo(prev => ({ ...prev, numeroSortie: newNumber }));

        } catch (err) {
            console.error("Erreur chargement:", err);
            setError("Unable to load fresh data.");
        } finally {
            setLoading(false);
        }
    }

    function addOutputItem() {
        const newItem = {
            id: Date.now(),
            nomMateriel: "",
            codeMateriel: "",
            typeMateriel: "",
            materialId: null,
            quantite: "",
            stockDisponible: 0
        };
        setOutputItems([...outputItems, newItem]);
    }

    function removeOutputItem(id) {
        if (outputItems.length > 1) {
            setOutputItems(outputItems.filter(item => item.id !== id));
        }
    }

    function updateOutputItem(id, field, value) {
        setOutputItems(outputItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    }

    function handleNameChange(itemId, name) {
        updateOutputItem(itemId, 'nomMateriel', name);

        if (name.length > 0) {
            const filteredSuggestions = materialsDatabase.filter(m =>
                m.name.toLowerCase().includes(name.toLowerCase())
            );
            setActiveSuggestions(prev => ({
                ...prev,
                [itemId]: filteredSuggestions
            }));
        } else {
            setActiveSuggestions(prev => ({
                ...prev,
                [itemId]: []
            }));
        }
    }

    function selectMaterial(itemId, material) {
        setOutputItems(outputItems.map(item =>
            item.id === itemId ? {
                ...item,
                nomMateriel: material.name,
                codeMateriel: material.code,
                typeMateriel: material.category,
                materialId: material.id,
                stockDisponible: material.quantity
            } : item
        ));
        setActiveSuggestions(prev => ({
            ...prev,
            [itemId]: []
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");

        // Validation
        if (!outputInfo.serviceMedical) {
            setFormError("Please select a medical service.");
            return;
        }

        for (const item of outputItems) {
            if (!item.nomMateriel || !item.codeMateriel || !item.quantite || !item.materialId) {
                setFormError("Please fill all fields for each item.");
                return;
            }

            if (parseInt(item.quantite) > item.stockDisponible) {
                setFormError(`Insufficient quantity for "${item.nomMateriel}". Stock: ${item.stockDisponible}, Requested: ${item.quantite}`);
                return;
            }
        }

        try {
            setSubmitting(true);

            // 💾 TRANSACTION DE SAUVEGARDE
            // Étape 1: Créer l'entête de la sortie
            // POST /api/sorties/
            // Champs backend: numero_sortie, date_sortie, motif_sortie, idPersonnel
            const personnelId = parseInt(localStorage.getItem("personnel_id") || "1");
            const sortieData = {
                numero_sortie: outputInfo.numeroSortie,
                date_sortie: `${outputInfo.dateSortie}T00:00:00`,
                motif_sortie: outputInfo.motifSortie,
                idPersonnel: personnelId,
                service_responsable: outputInfo.serviceMedical,
                observations: outputInfo.observations || null
            };

            const createdSortie = await sortieApi.create(sortieData);

            // Étape 2: Créer les lignes de sortie et décrémenter le stock
            // Champs backend: id_sortie, id_materiel, code_materiel, nom_materiel, type_materiel, quantite, prix_unitaire, sous_total
            for (const item of outputItems) {
                const prixUnitaire = item.typeMateriel === "MEDICAL" ?
                    materialsDatabase.find(m => m.id === item.materialId)?.prixVente : null;
                const ligneData = {
                    id_sortie: createdSortie.idSortie,
                    id_materiel: item.materialId,
                    code_materiel: item.codeMateriel,
                    nom_materiel: item.nomMateriel,
                    type_materiel: item.typeMateriel,
                    quantite: parseInt(item.quantite),
                    prix_unitaire: prixUnitaire
                };
                await ligneSortieApi.create(ligneData);

                // Mettre à jour le stock
                const material = materialsDatabase.find(m => m.id === item.materialId);
                if (material) {
                    const newStock = material.quantity - parseInt(item.quantite);
                    if (item.typeMateriel === "MEDICAL") {
                        await materielMedicalApi.patch(item.materialId, { quantite_stock: newStock });
                    } else {
                        await materielDurableApi.patch(item.materialId, { quantite_stock: newStock });
                    }
                }
            }

            setSuccessMessage(`Output registered successfully! # ${outputInfo.numeroSortie}`);
            setTimeout(() => setSuccessMessage(""), 5000);

            // Réinitialiser le formulaire
            await loadData();
            setOutputItems([
                { id: Date.now(), nomMateriel: "", codeMateriel: "", typeMateriel: "", materialId: null, quantite: "", stockDisponible: 0 }
            ]);
            setOutputInfo(prev => ({
                ...prev,
                serviceMedical: "",
                dateSortie: new Date().toISOString().split('T')[0],
                dateEnregistrement: new Date().toISOString().split('T')[0],
                motifSortie: "DEFECTUEUX",
                observations: ""
            }));

        } catch (err) {
            console.error("Erreur lors de l'enregistrement:", err);
            setFormError("Error registering output. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <AccountantDashBoard linkList={AccountantNavLink} requiredRole={"comptable_matiere"}>
                <AccountantNavBar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-primary-start mx-auto mb-4" />
                        <p className="text-gray-600">Loading data...</p>
                    </div>
                </div>
            </AccountantDashBoard>
        );
    }

    return (
        <AccountantDashBoard
            linkList={AccountantNavLink}
            requiredRole={"comptable_matiere"}
        >
            <AccountantNavBar />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaBoxOpen className="text-4xl text-primary-start" />
                        <h1 className="text-3xl font-bold text-gray-800">Register Output</h1>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    >
                        <FaSyncAlt className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <FaCheckCircle /> {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informations de sortie */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Output Information</h2>

                        {formError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {formError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Output Number
                                </label>
                                <input
                                    type="text"
                                    value={outputInfo.numeroSortie}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-mono font-bold"
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Responsible Medical Service *
                                </label>
                                <select
                                    value={outputInfo.serviceMedical}
                                    onChange={(e) => setOutputInfo({ ...outputInfo, serviceMedical: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select a service</option>
                                    <option value="Service Médical">Medical Service</option>
                                    <option value="Service Cardiologie">Cardiology Service</option>
                                    <option value="Pharmacie">Pharmacy</option>
                                    <option value="Laboratoire">Laboratory</option>
                                    <option value="Administration">Administration</option>
                                    <option value="Bloc Opératoire">Operating Room</option>
                                    <option value="Service Pédiatrie">Pediatrics Service</option>
                                    <option value="Urgences">Emergency</option>
                                    <option value="Radiologie">Radiology</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Output Date *
                                </label>
                                <input
                                    type="date"
                                    value={outputInfo.dateSortie}
                                    onChange={(e) => setOutputInfo({ ...outputInfo, dateSortie: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Date d&apos;enregistrement
                                </label>
                                <input
                                    type="date"
                                    value={outputInfo.dateEnregistrement}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">Today's date (automatic)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Output Reason *
                                </label>
                                <select
                                    value={outputInfo.motifSortie}
                                    onChange={(e) => setOutputInfo({ ...outputInfo, motifSortie: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="DEFECTUEUX">Defective</option>
                                    <option value="PERIME">Expired</option>
                                    <option value="VENTE">Sale</option>
                                    <option value="UTILISATION_SERVICE">Internal Use</option>
                                    <option value="PERTE">Loss</option>
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Observations
                                </label>
                                <textarea
                                    value={outputInfo.observations}
                                    onChange={(e) => setOutputInfo({ ...outputInfo, observations: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                                    placeholder="Optional remarks about this output..."
                                    rows="2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Articles en sortie */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Output Items</h2>
                            <button
                                type="button"
                                onClick={addOutputItem}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-start text-white rounded-lg hover:opacity-90 transition-all duration-300"
                            >
                                <FaPlus /> Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {outputItems.map((item) => (
                                <OutputItemRow
                                    key={item.id}
                                    item={item}
                                    suggestions={activeSuggestions[item.id] || []}
                                    onUpdate={updateOutputItem}
                                    onNameChange={handleNameChange}
                                    onSelectMaterial={selectMaterial}
                                    onRemove={removeOutputItem}
                                    canRemove={outputItems.length > 1}
                                />
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-primary-end/10 rounded-lg">
                            <p className="text-sm text-primary-start flex items-center gap-2">
                                <FaCheckCircle />
                                Total: {outputItems.length} item(s) in output
                            </p>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setOutputItems([
                                    { id: Date.now(), nomMateriel: "", codeMateriel: "", typeMateriel: "", materialId: null, quantite: "", stockDisponible: 0 }
                                ]);
                                setFormError("");
                            }}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                        >
                            {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            Register Output
                        </button>
                    </div>
                </form>
            </div>
        </AccountantDashBoard>
    );
}

function OutputItemRow({ item, suggestions, onUpdate, onNameChange, onSelectMaterial, onRemove, canRemove }) {
    OutputItemRow.propTypes = {
        item: PropTypes.object.isRequired,
        suggestions: PropTypes.array.isRequired,
        onUpdate: PropTypes.func.isRequired,
        onNameChange: PropTypes.func.isRequired,
        onSelectMaterial: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
        canRemove: PropTypes.bool.isRequired
    };

    const [showSuggestions, setShowSuggestions] = useState(false);

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Material Name *
                    </label>
                    <input
                        type="text"
                        value={item.nomMateriel}
                        onChange={(e) => onNameChange(item.id, e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
                        placeholder="Type to search..."
                        required
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {suggestions.map((material) => (
                                <div
                                    key={material.id}
                                    onClick={() => onSelectMaterial(item.id, material)}
                                    className="p-2 hover:bg-primary-end/10 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="font-semibold text-gray-800 text-sm">{material.name}</div>
                                    <div className="text-xs text-gray-500 flex justify-between">
                                        <span className="font-mono">{material.code}</span>
                                        <span>Stock: {material.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Material Code
                    </label>
                    <input
                        type="text"
                        value={item.codeMateriel}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 font-mono"
                        placeholder="Auto"
                        readOnly
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Material Type
                    </label>
                    <input
                        type="text"
                        value={item.typeMateriel === "MEDICAL" ? "Medical Material" : item.typeMateriel === "DURABLE" ? "Durable Material" : ""}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                        placeholder="Auto"
                        readOnly
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantity * {item.stockDisponible > 0 && <span className="text-xs text-gray-500">(Stock: {item.stockDisponible})</span>}
                    </label>
                    <input
                        type="number"
                        value={item.quantite}
                        onChange={(e) => onUpdate(item.id, 'quantite', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
                        placeholder="0"
                        min="1"
                        max={item.stockDisponible || undefined}
                        required
                    />
                </div>

                <div className="flex items-end">
                    {canRemove && (
                        <button
                            type="button"
                            onClick={() => onRemove(item.id)}
                            className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
                        >
                            <FaTrash className="mx-auto" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
