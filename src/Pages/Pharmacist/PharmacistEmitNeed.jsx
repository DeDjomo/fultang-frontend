import { PharmacistDashBoard } from "./Components/PharmacistDashboard";
import { PharmacistNavLink } from "./PharmacistNavLink";
import { PharmacistNavBar } from "./Components/PharmacistNavBar";
import { useState } from "react";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";
import PropTypes from "prop-types";

export function PharmacistEmitNeed() {
    const [needItems, setNeedItems] = useState([
        { id: 1, material: "", quantity: "", priority: "normal", description: "" }
    ]);
    const [needInfo, setNeedInfo] = useState({
        department: "pharmacy",
        requestedBy: "",
        requestDate: new Date().toISOString().split('T')[0],
        urgency: "normal"
    });

    function addNeedItem() {
        const newItem = {
            id: Date.now(),
            material: "",
            quantity: "",
            priority: "normal",
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

    function handleSubmit(e) {
        e.preventDefault();
        console.log("Need submitted:", { needInfo, needItems });
        // Ici, vous ajouterez la logique d'envoi au backend
        alert("Besoin enregistré avec succès !");
    }

    return (
        <PharmacistDashBoard
            linkList={PharmacistNavLink}
            requiredRole={"Pharmacist"}
        >
            <PharmacistNavBar />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Émettre un Besoin</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informations générales */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Informations Générales</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Département
                                </label>
                                <select
                                    value={needInfo.department}
                                    onChange={(e) => setNeedInfo({ ...needInfo, department: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Sélectionner un département</option>
                                    <option value="administration">Administration</option>
                                    <option value="medical">Médical</option>
                                    <option value="pharmacy">Pharmacie</option>
                                    <option value="laboratory">Laboratoire</option>
                                    <option value="reception">Réception</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Demandé par
                                </label>
                                <input
                                    type="text"
                                    value={needInfo.requestedBy}
                                    onChange={(e) => setNeedInfo({ ...needInfo, requestedBy: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Nom du demandeur"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Date de demande
                                </label>
                                <input
                                    type="date"
                                    value={needInfo.requestDate}
                                    onChange={(e) => setNeedInfo({ ...needInfo, requestDate: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Urgence
                                </label>
                                <select
                                    value={needInfo.urgency}
                                    onChange={(e) => setNeedInfo({ ...needInfo, urgency: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="low">Basse</option>
                                    <option value="normal">Normale</option>
                                    <option value="high">Haute</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Liste des matériels demandés */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Matériels Demandés</h2>
                            <button
                                type="button"
                                onClick={addNeedItem}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                            >
                                <FaPlus /> Ajouter un article
                            </button>
                        </div>

                        <div className="space-y-4">
                            {needItems.map((item, index) => (
                                <NeedItemRow
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    onUpdate={updateNeedItem}
                                    onRemove={removeNeedItem}
                                    canRemove={needItems.length > 1}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Bouton de soumission */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                        >
                            <FaSave /> Enregistrer le besoin
                        </button>
                    </div>
                </form>
            </div>
        </PharmacistDashBoard>
    );
}

function NeedItemRow({ item, index, onUpdate, onRemove, canRemove }) {
    NeedItemRow.propTypes = {
        item: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        onUpdate: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
        canRemove: PropTypes.bool.isRequired
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Matériel
                    </label>
                    <input
                        type="text"
                        value={item.material}
                        onChange={(e) => onUpdate(item.id, 'material', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nom du matériel"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantité
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
                        Priorité
                    </label>
                    <select
                        value={item.priority}
                        onChange={(e) => onUpdate(item.id, 'priority', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="low">Basse</option>
                        <option value="normal">Normale</option>
                        <option value="high">Haute</option>
                    </select>
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

            <div className="mt-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description / Justification
                </label>
                <textarea
                    value={item.description}
                    onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Raison de la demande..."
                    rows="2"
                />
            </div>
        </div>
    );
}
