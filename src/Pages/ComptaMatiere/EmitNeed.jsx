import { AccountantDashBoard } from "./Components/AccountantDashboard";
import { AccountantNavLink } from "./AccountantNavLink";
import { AccountantNavBar } from "./Components/AccountantNavBar";
import { useState, useEffect } from "react";
import { Plus, Trash2, Save, ClipboardList, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import PropTypes from "prop-types";
import { besoinApi, ligneBesoinApi, materielMedicalApi } from "../../services/comptabiliteMatiereApi";

export function EmitNeed() {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState(null);
    const [materiels, setMateriels] = useState([]);

    const [needItems, setNeedItems] = useState([
        { id: 1, material: "", quantity: "", priority: "NORMAL", description: "" }
    ]);

    const [needInfo, setNeedInfo] = useState({
        motif: "",
        requestDate: new Date().toISOString().split('T')[0]
    });

    // Charger la liste des matériels pour les suggestions
    useEffect(() => {
        loadMateriels();
    }, []);

    async function loadMateriels() {
        try {
            setLoading(true);
            const data = await materielMedicalApi.getAll();
            setMateriels(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            console.error("Error loading materials:", err);
        } finally {
            setLoading(false);
        }
    }

    function addNeedItem() {
        const newItem = {
            id: Date.now(),
            material: "",
            quantity: "",
            priority: "NORMAL",
            description: ""
        };
        setNeedItems([...needItems, newItem]);
    }

    function removeNeedItem(id) {
        if (needItems.length > 1) {
            setNeedItems(needItems.filter(item => item.id !== id));
        }
    }

    function updateNeedItem(id, field, value) {
        setNeedItems(needItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Validation
        if (!needInfo.motif.trim()) {
            setError("Please enter a reason for the need!");
            return;
        }

        const hasEmptyItem = needItems.some(item => !item.material || !item.quantity);
        if (hasEmptyItem) {
            setError("Please fill all items (material and quantity)!");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Get the ID of the connected personnel (use localStorage or default to 1)
            const personnelId = parseInt(localStorage.getItem("personnel_id") || "1");

            // 1. Create the need (Besoin)
            const besoinData = {
                motif: needInfo.motif,
                idPersonnel_emetteur: personnelId,
                statut: "NON_TRAITE"
            };

            const newBesoin = await besoinApi.create(besoinData);

            // 2. Create the need lines (LigneBesoin)
            for (const item of needItems) {
                await ligneBesoinApi.create({
                    id_besoin: newBesoin.idBesoin,
                    materiel_nom: item.material,
                    quantite_demandee: parseInt(item.quantity),
                    priorite: item.priority,
                    description_justification: item.description || ""
                });
            }

            // Reset form
            setNeedItems([{ id: Date.now(), material: "", quantity: "", priority: "NORMAL", description: "" }]);
            setNeedInfo({ motif: "", requestDate: new Date().toISOString().split('T')[0] });

            setSuccessMessage("Need sent successfully! The director will be notified.");
            setTimeout(() => setSuccessMessage(""), 5000);

        } catch (err) {
            console.error("Error submitting need:", err);
            setError("Unable to send the need. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AccountantDashBoard
            linkList={AccountantNavLink}
            requiredRole={"comptable_matiere"}
        >
            <AccountantNavBar />
            <div className="p-6 space-y-6">
                {/* Modern gradient header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 shadow-lg">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl font-bold">Emit Need</h1>
                            <p className="text-sm opacity-90">Create a material request</p>
                        </div>
                    </div>
                </div>

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Information */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">General Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason for the need *
                                </label>
                                <textarea
                                    value={needInfo.motif}
                                    onChange={(e) => setNeedInfo({ ...needInfo, motif: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Describe the reason for your request..."
                                    rows="3"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Request Date
                                </label>
                                <input
                                    type="date"
                                    value={needInfo.requestDate}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Requested Materials List */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Requested Materials</h2>
                            <button
                                type="button"
                                onClick={addNeedItem}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                            >
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {needItems.map((item, index) => (
                                <NeedItemRow
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    materiels={materiels}
                                    onUpdate={updateNeedItem}
                                    onRemove={removeNeedItem}
                                    canRemove={needItems.length > 1}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setNeedItems([{ id: Date.now(), material: "", quantity: "", priority: "NORMAL", description: "" }]);
                                setNeedInfo({ motif: "", requestDate: new Date().toISOString().split('T')[0] });
                            }}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save Need
                        </button>
                    </div>
                </form>
            </div>
        </AccountantDashBoard>
    );
}

function NeedItemRow({ item, index, materiels, onUpdate, onRemove, canRemove }) {
    NeedItemRow.propTypes = {
        item: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        materiels: PropTypes.array.isRequired,
        onUpdate: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
        canRemove: PropTypes.bool.isRequired
    };

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    function handleMaterialChange(value) {
        onUpdate(item.id, 'material', value);

        if (value.length >= 2 && materiels.length > 0) {
            const filtered = materiels.filter(m =>
                m.nom_Materiel?.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }

    function selectSuggestion(materiel) {
        onUpdate(item.id, 'material', materiel.nom_Materiel);
        setShowSuggestions(false);
    }

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2 relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Material *
                    </label>
                    <input
                        type="text"
                        value={item.material}
                        onChange={(e) => handleMaterialChange(e.target.value)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Material name"
                        required
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                            {suggestions.map(m => (
                                <div
                                    key={m.idMateriel || m.materiel_ptr_id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => selectSuggestion(m)}
                                >
                                    <p className="font-medium">{m.nom_Materiel}</p>
                                    <p className="text-xs text-gray-500">Stock: {m.quantite_stock}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantity *
                    </label>
                    <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdate(item.id, 'quantity', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        min="1"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Priority
                    </label>
                    <select
                        value={item.priority}
                        onChange={(e) => onUpdate(item.id, 'priority', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>

                <div className="flex items-end">
                    {canRemove && (
                        <button
                            type="button"
                            onClick={() => onRemove(item.id)}
                            className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description / Justification
                </label>
                <textarea
                    value={item.description}
                    onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Reason for the request..."
                    rows="2"
                />
            </div>
        </div>
    );
}
