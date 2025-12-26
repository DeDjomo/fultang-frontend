import { ComptaMatiereDashBoard } from "./Components/ComptaMatiereDashboard";
import { ComptaMatiereNavLink } from "./ComptaMatiereNavLink";
import { ComptaMatiereNavBar } from "./Components/ComptaMatiereNavBar";
import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSave, FaBoxOpen, FaCheckCircle, FaSpinner } from "react-icons/fa";
import PropTypes from "prop-types";
import { getAllMaterielsMedicaux, getAllMaterielsDurables, createSortie, createLigneSortie, getAllSorties } from "../../services/comptabiliteMatiereApi";

export function RegisterOutput() {
    // Liste des matériels existants
    const [materialsDatabase, setMaterialsDatabase] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Articles en sortie
    const [outputItems, setOutputItems] = useState([
        { id: 1, nomMateriel: "", codeMateriel: "", typeMateriel: "", quantite: "", materielId: null }
    ]);

    // Informations de sortie
    const [outputInfo, setOutputInfo] = useState({
        numeroSortie: "",
        serviceMedical: "",
        dateSortie: new Date().toISOString().split('T')[0],
        dateEnregistrement: new Date().toISOString().split('T')[0],
        motifSortie: "defectueux"
    });

    // État pour les suggestions
    const [activeSuggestions, setActiveSuggestions] = useState({});
    const [formError, setFormError] = useState("");

    // Charger les données au montage
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Récupérer les matériels et les sorties existantes
                const [medicaux, durables, sortiesData] = await Promise.all([
                    getAllMaterielsMedicaux(),
                    getAllMaterielsDurables(),
                    getAllSorties()
                ]);

                // Transformer les matériels
                const medList = (medicaux.results || medicaux).map(m => ({
                    id: m.idMateriel || m.id,
                    code: m.code || `MED-${m.idMateriel}`,
                    name: m.nom_Materiel || m.name,
                    category: "Matériel Médical",
                    quantity: m.quantite_stock || 0
                }));

                const durList = (durables.results || durables).map(m => ({
                    id: m.idMateriel || m.id,
                    code: m.code || `DUR-${m.idMateriel}`,
                    name: m.nom_Materiel || m.name,
                    category: "Matériel Durable",
                    quantity: m.quantite_stock || 1
                }));

                setMaterialsDatabase([...medList, ...durList]);

                // Générer le numéro de sortie
                const sorties = sortiesData.results || sortiesData || [];
                const year = new Date().getFullYear();
                const nextNumber = sorties.length + 1;
                setOutputInfo(prev => ({
                    ...prev,
                    numeroSortie: `SOR-${year}-${String(nextNumber).padStart(3, '0')}`
                }));
            } catch (err) {
                console.error("Erreur lors du chargement des matériels:", err);
                // Fallback to mock data
                setMaterialsDatabase([
                    { id: 1, code: "MED-001", name: "Gants médicaux", category: "Matériel Médical", quantity: 150 },
                    { id: 2, code: "MED-002", name: "Seringues 5ml", category: "Matériel Médical", quantity: 200 },
                    { id: 3, code: "DUR-001", name: "Stéthoscope", category: "Matériel Durable", quantity: 5 },
                ]);
                setOutputInfo(prev => ({
                    ...prev,
                    numeroSortie: `SOR-${new Date().getFullYear()}-001`
                }));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Générer le numéro de sortie unique
    function generateOutputNumber() {
        const year = new Date().getFullYear();
        return `SOR-${year}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    }

    function addOutputItem() {
        const newItem = {
            id: Date.now(),
            nomMateriel: "",
            codeMateriel: "",
            typeMateriel: "",
            quantite: ""
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
                materielId: material.id
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

        // Validation des articles
        for (const item of outputItems) {
            if (!item.nomMateriel || !item.codeMateriel || !item.quantite) {
                setFormError("Veuillez remplir tous les champs pour chaque article.");
                return;
            }

            // Vérifier la cohérence code/nom
            const material = materialsDatabase.find(m => m.code === item.codeMateriel);
            if (!material || material.name !== item.nomMateriel) {
                setFormError(`Le code ${item.codeMateriel} ne correspond pas au matériel "${item.nomMateriel}".`);
                return;
            }

            // Vérifier la quantité disponible
            if (parseInt(item.quantite) > material.quantity) {
                setFormError(`Quantité insuffisante pour "${item.nomMateriel}". Stock: ${material.quantity}, Demandé: ${item.quantite}`);
                return;
            }
        }

        try {
            setSubmitting(true);

            // Créer la sortie via l'API
            const sortieData = {
                numero_sortie: outputInfo.numeroSortie || generateOutputNumber(),
                service_responsable: outputInfo.serviceMedical,
                date_sortie: outputInfo.dateSortie,
                motif_sortie: outputInfo.motifSortie.toUpperCase()
            };

            const createdSortie = await createSortie(sortieData);

            // Créer les lignes de sortie
            for (const item of outputItems) {
                const material = materialsDatabase.find(m => m.code === item.codeMateriel);
                await createLigneSortie({
                    sortie: createdSortie.idSortie || createdSortie.id,
                    materiel: material?.id || item.materielId,
                    quantite: parseInt(item.quantite)
                });
            }

            alert("Sortie enregistrée avec succès !\nN° " + sortieData.numero_sortie);

            // Réinitialiser le formulaire
            setOutputInfo({
                numeroSortie: generateOutputNumber(),
                serviceMedical: "",
                dateSortie: new Date().toISOString().split('T')[0],
                dateEnregistrement: new Date().toISOString().split('T')[0],
                motifSortie: "defectueux"
            });
            setOutputItems([
                { id: Date.now(), nomMateriel: "", codeMateriel: "", typeMateriel: "", quantite: "", materielId: null }
            ]);
        } catch (err) {
            console.error("Erreur lors de l'enregistrement:", err);
            setFormError("Erreur lors de l'enregistrement de la sortie. Veuillez réessayer.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ComptaMatiereDashBoard
            linkList={ComptaMatiereNavLink}
            requiredRole={"Accountant"}
        >
            <ComptaMatiereNavBar />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaBoxOpen className="text-4xl text-primary-start" />
                        <h1 className="text-3xl font-bold text-gray-800">Enregistrer une Sortie</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informations de sortie */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Informations de Sortie</h2>

                        {formError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {formError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Numéro de sortie
                                </label>
                                <input
                                    type="text"
                                    value={outputInfo.numeroSortie || generateOutputNumber()}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-mono font-bold"
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">Généré automatiquement</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Service médical responsable *
                                </label>
                                <select
                                    value={outputInfo.serviceMedical}
                                    onChange={(e) => setOutputInfo({ ...outputInfo, serviceMedical: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Sélectionner un service</option>
                                    <option value="Service Médical">Service Médical</option>
                                    <option value="Service Cardiologie">Service Cardiologie</option>
                                    <option value="Pharmacie">Pharmacie</option>
                                    <option value="Laboratoire">Laboratoire</option>
                                    <option value="Administration">Administration</option>
                                    <option value="Bloc Opératoire">Bloc Opératoire</option>
                                    <option value="Service Pédiatrie">Service Pédiatrie</option>
                                    <option value="Urgences">Urgences</option>
                                    <option value="Radiologie">Radiologie</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Date de sortie *
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
                                <p className="text-xs text-gray-500 mt-1">Date du jour (automatique)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Motif de la sortie *
                                </label>
                                <select
                                    value={outputInfo.motifSortie}
                                    onChange={(e) => setOutputInfo({ ...outputInfo, motifSortie: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="defectueux">Défectueux</option>
                                    <option value="perime">Périmé</option>
                                    <option value="vente">Vente</option>
                                    <option value="transfert">Transfert</option>
                                    <option value="utilisation">Utilisation interne</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Articles en sortie */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Articles en Sortie</h2>
                            <button
                                type="button"
                                onClick={addOutputItem}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-start text-white rounded-lg hover:opacity-90 transition-all duration-300"
                            >
                                <FaPlus /> Ajouter un article
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
                                Total: {outputItems.length} article(s) en sortie
                            </p>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setOutputInfo({
                                    numeroSortie: generateOutputNumber(),
                                    serviceMedical: "",
                                    dateSortie: new Date().toISOString().split('T')[0],
                                    dateEnregistrement: new Date().toISOString().split('T')[0],
                                    motifSortie: "defectueux"
                                });
                                setOutputItems([
                                    { id: Date.now(), nomMateriel: "", codeMateriel: "", typeMateriel: "", quantite: "" }
                                ]);
                            }}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg hover:opacity-90 transition-all duration-300"
                        >
                            <FaSave /> Enregistrer la sortie
                        </button>
                    </div>
                </form>
            </div>
        </ComptaMatiereDashBoard>
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
                        Nom Matériel *
                    </label>
                    <input
                        type="text"
                        value={item.nomMateriel}
                        onChange={(e) => onNameChange(item.id, e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
                        placeholder="Tapez pour rechercher..."
                        required
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {suggestions.map((material) => (
                                <div
                                    key={material.code}
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
                        Code Matériel
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
                        Type Matériel
                    </label>
                    <input
                        type="text"
                        value={item.typeMateriel}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                        placeholder="Auto"
                        readOnly
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantité *
                    </label>
                    <input
                        type="number"
                        value={item.quantite}
                        onChange={(e) => onUpdate(item.id, 'quantite', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
                        placeholder="0"
                        min="1"
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
