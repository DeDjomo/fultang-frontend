import { ComptaMatiereDashBoard } from "./Components/ComptaMatiereDashboard";
import { ComptaMatiereNavLink } from "./ComptaMatiereNavLink";
import { ComptaMatiereNavBar } from "./Components/ComptaMatiereNavBar";
import { useState, useEffect } from "react";
import {
    FaSearch,
    FaBoxes,
    FaFilter,
    FaTimes,
    FaMedkit,
    FaTools,
    FaInfoCircle,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaBarcode,
    FaFilePdf,
    FaSpinner
} from "react-icons/fa";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import { getAllMaterielsMedicaux, getAllMaterielsDurables } from "../../services/comptabiliteMatiereApi";

export function MaterialList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [loading, setLoading] = useState(true);

    // État pour le modal de détails
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    // Données des matériels
    const [materials, setMaterials] = useState([]);

    // Charger les données au montage
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Récupérer les matériels médicaux et durables en parallèle
                const [medicaux, durables] = await Promise.all([
                    getAllMaterielsMedicaux(),
                    getAllMaterielsDurables()
                ]);

                // Transformer les données
                const medList = (medicaux.results || medicaux).map(m => ({
                    id: m.idMateriel || m.id,
                    code: m.code || `MED-${m.idMateriel}`,
                    name: m.nom_Materiel || m.name,
                    category: "Matériel Médical",
                    quantity: m.quantite_stock || 0,
                    unit: m.unite_mesure || "Unité",
                    lastUpdate: m.date_derniere_modification?.split('T')[0] || new Date().toISOString().split('T')[0],
                    location: m.emplacement || "Non défini",
                    prixAchat: m.prix_achat_unitaire || 0,
                    prixVente: m.prix_vente_unitaire || null,
                    dateEnregistrement: m.date_creation?.split('T')[0] || new Date().toISOString().split('T')[0]
                }));

                const durList = (durables.results || durables).map(m => ({
                    id: m.idMateriel || m.id,
                    code: m.code || `DUR-${m.idMateriel}`,
                    name: m.nom_Materiel || m.name,
                    category: "Matériel Durable",
                    quantity: m.quantite_stock || 1,
                    unit: "Pièce",
                    lastUpdate: m.date_derniere_modification?.split('T')[0] || new Date().toISOString().split('T')[0],
                    location: m.localisation || "Non défini",
                    prixAchat: m.prix_achat_unitaire || 0,
                    prixVente: null,
                    dateEnregistrement: m.date_Enregistrement?.split('T')[0] || new Date().toISOString().split('T')[0]
                }));

                setMaterials([...medList, ...durList]);
            } catch (err) {
                console.error("Erreur lors du chargement des matériels:", err);
                // Fallback to mock data
                setMaterials([
                    { id: 1, code: "MED-001", name: "Gants médicaux", category: "Matériel Médical", quantity: 150, unit: "Boîte", lastUpdate: "2024-12-20", location: "Stockage A", prixAchat: 15000, prixVente: 18000, dateEnregistrement: "2024-01-15" },
                    { id: 2, code: "MED-002", name: "Seringues 5ml", category: "Matériel Médical", quantity: 200, unit: "Pièce", lastUpdate: "2024-12-19", location: "Stockage A", prixAchat: 500, prixVente: 750, dateEnregistrement: "2024-02-10" },
                    { id: 3, code: "DUR-001", name: "Stéthoscope", category: "Matériel Durable", quantity: 5, unit: "Pièce", lastUpdate: "2024-12-18", location: "Stockage B", prixAchat: 85000, prixVente: null, dateEnregistrement: "2024-03-05" },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    function getFilteredMaterials() {
        return materials.filter(material => {
            const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                material.code.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === "all" || material.category === filterCategory;

            return matchesSearch && matchesCategory;
        });
    }

    function handleMaterialClick(material) {
        setSelectedMaterial(material);
        setShowDetailModal(true);
    }

    function formatPrice(price) {
        if (price === null || price === undefined) return "-";
        return new Intl.NumberFormat('fr-FR').format(price) + " FCFA";
    }

    function exportToPDF() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;

        // Titre
        doc.setFontSize(18);
        doc.setTextColor(26, 115, 163);
        doc.text("Liste du Matériel", pageWidth / 2, 20, { align: "center" });

        // Sous-titre
        doc.setFontSize(10);
        doc.setTextColor(100);
        const categoryLabel = filterCategory === "all" ? "Toutes catégories" : filterCategory;
        doc.text(`Catégorie: ${categoryLabel} | Généré le: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: "center" });

        // Ligne de séparation
        doc.setDrawColor(80, 194, 185);
        doc.setLineWidth(0.5);
        doc.line(margin, 32, pageWidth - margin, 32);

        // En-têtes du tableau
        let yPos = 42;
        doc.setFillColor(26, 115, 163);
        doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');

        doc.setFontSize(9);
        doc.setTextColor(255);
        doc.setFont(undefined, 'bold');
        doc.text("Code", margin + 2, yPos);
        doc.text("Nom", margin + 25, yPos);
        doc.text("Catégorie", margin + 75, yPos);
        doc.text("Qté", margin + 115, yPos);
        doc.text("Emplacement", margin + 130, yPos);
        doc.text("Prix Achat", margin + 165, yPos);

        yPos += 10;

        // Données
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0);

        const materielsAffiches = getFilteredMaterials();

        materielsAffiches.forEach((material, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            // Alternance de couleur
            if (index % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
            }

            doc.setFontSize(8);
            doc.text(material.code, margin + 2, yPos);
            doc.text(material.name.substring(0, 25), margin + 25, yPos);
            doc.text(material.category === "Matériel Médical" ? "Médical" : "Durable", margin + 75, yPos);
            doc.text(String(material.quantity), margin + 115, yPos);
            doc.text(material.location.substring(0, 15), margin + 130, yPos);
            doc.text(formatPrice(material.prixAchat).replace(" FCFA", ""), margin + 165, yPos);

            yPos += 8;
        });

        // Pied de page
        yPos += 10;
        doc.setDrawColor(80, 194, 185);
        doc.line(margin, yPos, pageWidth - margin, yPos);

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Total: ${materielsAffiches.length} matériel(s)`, margin, yPos + 8);
        doc.text("Fultang Clinic - Comptable Matière", pageWidth - margin, yPos + 8, { align: "right" });

        // Télécharger
        doc.save(`liste_materiel_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    const filteredMaterials = getFilteredMaterials();

    return (
        <ComptaMatiereDashBoard
            linkList={ComptaMatiereNavLink}
            requiredRole={"Accountant"}
        >
            <ComptaMatiereNavBar />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaBoxes className="text-4xl text-primary-start" />
                        <h1 className="text-3xl font-bold text-gray-800">Liste du Matériel</h1>
                    </div>
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 shadow-lg"
                    >
                        <FaFilePdf /> Exporter PDF
                    </button>
                </div>

                {/* Filtres et recherche */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FaSearch className="inline mr-2" />
                                Rechercher
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                                placeholder="Rechercher par nom ou code..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FaFilter className="inline mr-2" />
                                Catégorie
                            </label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                            >
                                <option value="all">Toutes les catégories</option>
                                <option value="Matériel Durable">Matériel Durable</option>
                                <option value="Matériel Médical">Matériel Médical</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tableau du matériel */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary-start to-primary-end text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Nom</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Catégorie</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Qté</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Emplacement</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">Prix Achat</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">Prix Vente</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Dernière MAJ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredMaterials.length > 0 ? (
                                filteredMaterials.map((material, index) => (
                                    <tr
                                        key={material.id}
                                        className={`hover:bg-primary-end/10 cursor-pointer transition-all ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                                        onClick={() => handleMaterialClick(material)}
                                    >
                                        <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-800">
                                            {material.code}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {material.name}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${material.category === "Matériel Médical"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-blue-100 text-blue-800"
                                                }`}>
                                                {material.category === "Matériel Médical" ? (
                                                    <><FaMedkit className="inline mr-1" />Médical</>
                                                ) : (
                                                    <><FaTools className="inline mr-1" />Durable</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-bold ${material.quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                                {material.quantity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-sm">
                                            {material.location}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-gray-800">
                                            {formatPrice(material.prixAchat)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-gray-800">
                                            {formatPrice(material.prixVente)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs text-gray-500">
                                            {material.lastUpdate}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                                        <FaBoxes className="mx-auto text-5xl text-gray-300 mb-4" />
                                        <p>Aucun matériel trouvé</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="text-sm text-gray-600 text-right">
                    Affichage de {filteredMaterials.length} sur {materials.length} matériel(s)
                </div>
            </div>

            {/* Modal de détails */}
            {showDetailModal && selectedMaterial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${selectedMaterial.category === "Matériel Médical"
                                    ? "bg-red-100"
                                    : "bg-blue-100"
                                    }`}>
                                    {selectedMaterial.category === "Matériel Médical"
                                        ? <FaMedkit className="text-red-600 text-xl" />
                                        : <FaTools className="text-blue-600 text-xl" />
                                    }
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedMaterial.name}</h2>
                                    <p className="text-sm text-gray-500 font-mono">{selectedMaterial.code}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <FaBarcode /> Code
                                    </p>
                                    <p className="font-bold text-gray-800 font-mono">{selectedMaterial.code}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Catégorie</p>
                                    <p className="font-bold text-gray-800">{selectedMaterial.category}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Quantité en stock</p>
                                    <p className={`font-bold text-2xl ${selectedMaterial.quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                        {selectedMaterial.quantity}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <FaMapMarkerAlt /> Emplacement
                                    </p>
                                    <p className="font-bold text-gray-800">{selectedMaterial.location}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <FaMoneyBillWave /> Prix d&apos;achat
                                    </p>
                                    <p className="font-bold text-gray-800">{formatPrice(selectedMaterial.prixAchat)}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <FaMoneyBillWave /> Prix de vente
                                    </p>
                                    <p className="font-bold text-gray-800">{formatPrice(selectedMaterial.prixVente)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <FaCalendarAlt /> Date d&apos;enregistrement
                                    </p>
                                    <p className="font-bold text-gray-800">{selectedMaterial.dateEnregistrement}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <FaInfoCircle /> Dernière MAJ
                                    </p>
                                    <p className="font-bold text-gray-800">{selectedMaterial.lastUpdate}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-full px-4 py-3 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg hover:opacity-90 transition-all"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ComptaMatiereDashBoard>
    );
}
