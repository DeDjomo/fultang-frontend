import { PharmacistDashBoard } from "./Components/PharmacistDashboard";
import { PharmacistNavLink } from "./PharmacistNavLink";
import { PharmacistNavBar } from "./Components/PharmacistNavBar";
import { useState } from "react";
import { FaPlus, FaTrash, FaSave, FaShoppingCart, FaCheckCircle } from "react-icons/fa";
import PropTypes from "prop-types";

export function PharmacistDailySales() {
    // Liste des matériels existants (simulée - à remplacer par API)
    const materialsDatabase = [
        { code: "MED-001", name: "Paracétamol 500mg", category: "Matériel Médical", quantity: 150 },
        { code: "MED-002", name: "Ibuprofène 400mg", category: "Matériel Médical", quantity: 80 },
        { code: "MED-003", name: "Amoxicilline 500mg", category: "Matériel Médical", quantity: 25 },
        { code: "MED-004", name: "Vitamine C 1000mg", category: "Matériel Médical", quantity: 200 },
        { code: "MED-005", name: "Oméprazole 20mg", category: "Matériel Médical", quantity: 15 },
        { code: "MED-006", name: "Doliprane 1000mg", category: "Matériel Médical", quantity: 100 },
        { code: "MED-007", name: "Aspirine 500mg", category: "Matériel Médical", quantity: 75 },
        { code: "MED-008", name: "Sirop antitussif", category: "Matériel Médical", quantity: 40 },
    ];

    // Liste des ventes existantes (pour générer l'ID)
    const [existingSales] = useState([
        { id: "VTE-2024-001" },
        { id: "VTE-2024-002" },
        { id: "VTE-2024-003" },
    ]);

    // Articles en vente
    const [saleItems, setSaleItems] = useState([
        { id: 1, nomMateriel: "", codeMateriel: "", typeMateriel: "", quantite: "" }
    ]);

    // Informations de vente
    const [saleInfo, setSaleInfo] = useState({
        numeroVente: "",
        dateSortie: new Date().toISOString().split('T')[0],
        dateEnregistrement: new Date().toISOString().split('T')[0],
        motifSortie: "vente" // Fixé à "vente"
    });

    // État pour les suggestions
    const [activeSuggestions, setActiveSuggestions] = useState({});
    const [formError, setFormError] = useState("");

    // Générer le numéro de vente unique
    function generateSaleNumber() {
        const year = new Date().getFullYear();
        const existingThisYear = existingSales.filter(s => s.id.includes(`VTE-${year}`));
        const nextNumber = existingThisYear.length + 1;
        return `VTE-${year}-${String(nextNumber).padStart(3, '0')}`;
    }

    // Au chargement initial, générer le numéro
    useState(() => {
        setSaleInfo(prev => ({
            ...prev,
            numeroVente: generateSaleNumber()
        }));
    }, []);

    function addSaleItem() {
        const newItem = {
            id: Date.now(),
            nomMateriel: "",
            codeMateriel: "",
            typeMateriel: "",
            quantite: ""
        };
        setSaleItems([...saleItems, newItem]);
    }

    function removeSaleItem(id) {
        if (saleItems.length > 1) {
            setSaleItems(saleItems.filter(item => item.id !== id));
        }
    }

    function updateSaleItem(id, field, value) {
        setSaleItems(saleItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    }

    function handleNameChange(itemId, name) {
        updateSaleItem(itemId, 'nomMateriel', name);

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
        setSaleItems(saleItems.map(item =>
            item.id === itemId ? {
                ...item,
                nomMateriel: material.name,
                codeMateriel: material.code,
                typeMateriel: material.category
            } : item
        ));
        setActiveSuggestions(prev => ({
            ...prev,
            [itemId]: []
        }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        setFormError("");

        // Validation des articles
        for (const item of saleItems) {
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

        // Créer l'objet vente
        const newSale = {
            id: saleInfo.numeroVente || generateSaleNumber(),
            serviceMedical: "Pharmacie", // Service fixé automatiquement
            dateSortie: saleInfo.dateSortie,
            dateEnregistrement: saleInfo.dateEnregistrement,
            motifSortie: "vente", // Motif fixé à "vente"
            articles: saleItems.map(item => ({
                nomMateriel: item.nomMateriel,
                codeMateriel: item.codeMateriel,
                typeMateriel: item.typeMateriel,
                quantite: parseInt(item.quantite)
            }))
        };

        console.log("Vente enregistrée:", newSale);

        // Ici on devrait sauvegarder dans un état global ou envoyer à une API
        // Pour l'instant, on stocke dans localStorage
        const savedSales = JSON.parse(localStorage.getItem('sales') || '[]');
        savedSales.unshift(newSale);
        localStorage.setItem('sales', JSON.stringify(savedSales));

        alert("Vente enregistrée avec succès !\nN° " + newSale.id);

        // Réinitialiser le formulaire
        setSaleInfo({
            numeroVente: generateSaleNumber(),
            dateSortie: new Date().toISOString().split('T')[0],
            dateEnregistrement: new Date().toISOString().split('T')[0],
            motifSortie: "vente"
        });
        setSaleItems([
            { id: Date.now(), nomMateriel: "", codeMateriel: "", typeMateriel: "", quantite: "" }
        ]);
    }

    return (
        <PharmacistDashBoard
            linkList={PharmacistNavLink}
            requiredRole={"Pharmacist"}
        >
            <PharmacistNavBar />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaShoppingCart className="text-4xl text-primary-start" />
                        <h1 className="text-3xl font-bold text-gray-800">Enregistrer une Vente</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informations de vente */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Informations de Vente</h2>

                        {formError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {formError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Numéro de vente
                                </label>
                                <input
                                    type="text"
                                    value={saleInfo.numeroVente || generateSaleNumber()}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-mono font-bold"
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">Généré automatiquement</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Service médical responsable
                                </label>
                                <input
                                    type="text"
                                    value="Pharmacie"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-semibold"
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">Service par défaut</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Date de vente *
                                </label>
                                <input
                                    type="date"
                                    value={saleInfo.dateSortie}
                                    onChange={(e) => setSaleInfo({ ...saleInfo, dateSortie: e.target.value })}
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
                                    value={saleInfo.dateEnregistrement}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">Date du jour (automatique)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Motif de la sortie
                                </label>
                                <input
                                    type="text"
                                    value="Vente"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-semibold"
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">Motif fixé automatiquement</p>
                            </div>
                        </div>
                    </div>

                    {/* Articles en vente */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Articles en Vente</h2>
                            <button
                                type="button"
                                onClick={addSaleItem}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-start text-white rounded-lg hover:opacity-90 transition-all duration-300"
                            >
                                <FaPlus /> Ajouter un article
                            </button>
                        </div>

                        <div className="space-y-4">
                            {saleItems.map((item) => (
                                <SaleItemRow
                                    key={item.id}
                                    item={item}
                                    suggestions={activeSuggestions[item.id] || []}
                                    onUpdate={updateSaleItem}
                                    onNameChange={handleNameChange}
                                    onSelectMaterial={selectMaterial}
                                    onRemove={removeSaleItem}
                                    canRemove={saleItems.length > 1}
                                />
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-primary-end/10 rounded-lg">
                            <p className="text-sm text-primary-start flex items-center gap-2">
                                <FaCheckCircle />
                                Total: {saleItems.length} article(s) en vente
                            </p>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setSaleInfo({
                                    numeroVente: generateSaleNumber(),
                                    dateSortie: new Date().toISOString().split('T')[0],
                                    dateEnregistrement: new Date().toISOString().split('T')[0],
                                    motifSortie: "vente"
                                });
                                setSaleItems([
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
                            <FaSave /> Enregistrer la vente
                        </button>
                    </div>
                </form>
            </div>
        </PharmacistDashBoard>
    );
}

function SaleItemRow({ item, suggestions, onUpdate, onNameChange, onSelectMaterial, onRemove, canRemove }) {
    SaleItemRow.propTypes = {
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
