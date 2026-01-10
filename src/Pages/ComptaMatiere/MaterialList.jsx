import { AccountantDashBoard } from "./Components/AccountantDashboard";
import { AccountantNavLink } from "./AccountantNavLink";
import { AccountantNavBar } from "./Components/AccountantNavBar";
import { useState, useEffect } from "react";
import {
    Search,
    Package,
    Filter,
    X,
    Stethoscope,
    Wrench,
    Info,
    Calendar,
    DollarSign,
    Barcode,
    FileText,
    RefreshCw
} from "lucide-react";
import PropTypes from "prop-types";
import jsPDF from "jspdf";

export function MaterialList() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    // State for detail modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    // Data from API
    const [materials, setMaterials] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Load data from API
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token_key_fultang");
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        const baseUrl = import.meta.env.VITE_BACKEND_FULTANG_API_BASE_MEDICALSTAFF_URL || "http://127.0.0.1:8000/api";

        try {
            console.log("🚀 MaterialList - Loading fresh data...");

            const [medicauxRes, durablesRes] = await Promise.all([
                fetch(`${baseUrl}/materiels-medicaux/`, { headers, cache: "no-store" }).then(res => res.json()),
                fetch(`${baseUrl}/materiels-durables/`, { headers, cache: "no-store" }).then(res => res.json())
            ]);

            const medicauxData = medicauxRes.results || medicauxRes || [];
            const durablesData = durablesRes.results || durablesRes || [];

            console.log(`📦 Received: ${medicauxData.length} medical, ${durablesData.length} durable`);

            // NORMALIZE DATA
            const medicaux = medicauxData.map(m => ({
                id: m.idMateriel || m.materiel_ptr_id,
                code: m.code_materiel,
                name: m.nom_Materiel,
                category: "Medical Material",
                categoryType: "medical",
                quantity: m.quantite_stock,
                unit: m.unite_mesure_display || m.unite_mesure,
                lastUpdate: m.date_derniere_modification?.split('T')[0] || '-',
                location: "Pharmacy Stock",
                prixAchat: parseFloat(m.prix_achat_unitaire) || 0,
                prixVente: parseFloat(m.prix_vente_unitaire) || 0,
                dateEnregistrement: m.date_derniere_modification?.split('T')[0] || '-'
            }));

            const durables = durablesData.map(m => ({
                id: m.idMateriel || m.materiel_ptr_id,
                code: m.code_materiel,
                name: m.nom_Materiel,
                category: "Durable Material",
                categoryType: "durable",
                quantity: m.quantite_stock,
                unit: "Piece",
                lastUpdate: m.date_derniere_modification?.split('T')[0] || '-',
                location: m.localisation || "General Stock",
                prixAchat: parseFloat(m.prix_achat_unitaire) || 0,
                prixVente: null,
                dateEnregistrement: m.date_Enregistrement?.split('T')[0] || '-',
                etat: m.Etat_display || m.Etat
            }));

            setMaterials([...medicaux, ...durables]);
        } catch (err) {
            console.error("❌ Error:", err);
            setError("Unable to load material list.");
        } finally {
            setLoading(false);
        }
    };

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
        if (price === null || price === undefined || price === 0) return "-";
        return new Intl.NumberFormat('en-US').format(price) + " FCFA";
    }

    function exportToPDF() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;

        doc.setFontSize(18);
        doc.setTextColor(26, 115, 163);
        doc.text("Material List", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100);
        const categoryLabel = filterCategory === "all" ? "All categories" : filterCategory;
        doc.text(`Category: ${categoryLabel} | Generated: ${new Date().toLocaleDateString('en-US')}`, pageWidth / 2, 28, { align: "center" });

        doc.setDrawColor(80, 194, 185);
        doc.setLineWidth(0.5);
        doc.line(margin, 32, pageWidth - margin, 32);

        let yPos = 42;
        doc.setFillColor(26, 115, 163);
        doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');

        doc.setFontSize(9);
        doc.setTextColor(255);
        doc.setFont(undefined, 'bold');
        doc.text("Code", margin + 2, yPos);
        doc.text("Name", margin + 25, yPos);
        doc.text("Category", margin + 75, yPos);
        doc.text("Qty", margin + 115, yPos);
        doc.text("Location", margin + 130, yPos);
        doc.text("Purchase Price", margin + 165, yPos);

        yPos += 10;

        doc.setFont(undefined, 'normal');
        doc.setTextColor(0);

        const materielsAffiches = getFilteredMaterials();

        materielsAffiches.forEach((material, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            if (index % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
            }

            doc.setFontSize(8);
            doc.text(material.code, margin + 2, yPos);
            doc.text(material.name.substring(0, 25), margin + 25, yPos);
            doc.text(material.category === "Medical Material" ? "Medical" : "Durable", margin + 75, yPos);
            doc.text(String(material.quantity), margin + 115, yPos);
            doc.text(material.location.substring(0, 15), margin + 130, yPos);
            doc.text(formatPrice(material.prixAchat).replace(" FCFA", ""), margin + 165, yPos);

            yPos += 8;
        });

        yPos += 10;
        doc.setDrawColor(80, 194, 185);
        doc.line(margin, yPos, pageWidth - margin, yPos);

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Total: ${materielsAffiches.length} material(s)`, margin, yPos + 8);
        doc.text("Fultang Clinic - Material Accountant", pageWidth - margin, yPos + 8, { align: "right" });

        doc.save(`material_list_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    const filteredMaterials = getFilteredMaterials();
    const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentMaterials = filteredMaterials.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <AccountantDashBoard linkList={AccountantNavLink} requiredRole={"comptable_matiere"}>
                <AccountantNavBar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <RefreshCw className="animate-spin text-primary-start mx-auto mb-4 w-10 h-10" />
                        <p className="text-gray-600">Loading materials...</p>
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
                {/* Modern gradient header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <Package className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Material List</h1>
                                <p className="text-sm opacity-90">{materials.length} materials registered</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadData}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-primary-end rounded-lg hover:bg-gray-100 transition-all"
                            >
                                <FileText className="w-5 h-5" /> Export PDF
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Filters and search */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Search
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                                placeholder="Search by name or code..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Category
                            </label>
                            <select
                                value={filterCategory}
                                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                            >
                                <option value="all">All categories</option>
                                <option value="Durable Material">Durable Material</option>
                                <option value="Medical Material">Medical Material</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Material Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary-start to-primary-end text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Category</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Qty</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">Purchase Price</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">Sale Price</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Last Update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentMaterials.length > 0 ? (
                                currentMaterials.map((material, index) => (
                                    <tr
                                        key={`${material.categoryType}-${material.id}`}
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
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${material.category === "Medical Material"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-blue-100 text-blue-800"
                                                }`}>
                                                {material.category === "Medical Material" ? (
                                                    <><Stethoscope className="w-3 h-3" />Medical</>
                                                ) : (
                                                    <><Wrench className="w-3 h-3" />Durable</>
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
                                        <Package className="mx-auto text-gray-300 mb-4 w-16 h-16" />
                                        <p>No materials found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-gray-600 font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}

                <div className="text-sm text-gray-600 text-right">
                    Showing {currentMaterials.length} of {filteredMaterials.length} material(s)
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedMaterial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${selectedMaterial.category === "Medical Material"
                                    ? "bg-red-100"
                                    : "bg-blue-100"
                                    }`}>
                                    {selectedMaterial.category === "Medical Material"
                                        ? <Stethoscope className="text-red-600 w-6 h-6" />
                                        : <Wrench className="text-blue-600 w-6 h-6" />
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
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Barcode className="w-3 h-3" /> Code
                                    </p>
                                    <p className="font-bold text-gray-800 font-mono">{selectedMaterial.code}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Category</p>
                                    <p className="font-bold text-gray-800">{selectedMaterial.category}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Stock Quantity</p>
                                    <p className={`font-bold text-2xl ${selectedMaterial.quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                        {selectedMaterial.quantity}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="font-bold text-gray-800">{selectedMaterial.location}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" /> Purchase Price
                                    </p>
                                    <p className="font-bold text-gray-800">{formatPrice(selectedMaterial.prixAchat)}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" /> Sale Price
                                    </p>
                                    <p className="font-bold text-gray-800">{formatPrice(selectedMaterial.prixVente)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Registration Date
                                    </p>
                                    <p className="font-bold text-gray-800">{selectedMaterial.dateEnregistrement}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Info className="w-3 h-3" /> Last Update
                                    </p>
                                    <p className="font-bold text-gray-800">{selectedMaterial.lastUpdate}</p>
                                </div>
                            </div>

                            {selectedMaterial.etat && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Material Condition</p>
                                    <p className="font-bold text-gray-800">{selectedMaterial.etat}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-full px-4 py-3 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg hover:opacity-90 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AccountantDashBoard>
    );
}
