import { AccountantDashBoard } from "./Components/AccountantDashboard";
import { AccountantNavLink } from "./AccountantNavLink";
import { AccountantNavBar } from "./Components/AccountantNavBar";
import { useState, useEffect } from "react";
import {
    Search,
    Eye,
    Filter,
    List,
    FileText,
    Building2,
    Calendar,
    PackageOpen,
    RefreshCw
} from "lucide-react";
import PropTypes from "prop-types";
import jsPDF from "jspdf";

export function OutputList() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterMotif, setFilterMotif] = useState("all");
    const [filterPeriod, setFilterPeriod] = useState("all");

    // Output data from API
    const [outputs, setOutputs] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Load outputs from API
    useEffect(() => {
        loadData();
    }, []);

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

            // 1. Load outputs
            const sortiesRes = await fetch(`${baseUrl}/sorties/`, { headers, cache: "no-store" });
            const sortiesData = await sortiesRes.json();
            const sorties = (sortiesData.results || sortiesData || []);

            // 2. For each output, load its lines
            const outputsWithLines = await Promise.all(
                sorties.map(async (s) => {
                    try {
                        const lignesRes = await fetch(`${baseUrl}/lignes-sortie/?id_sortie=${s.idSortie}`, { headers, cache: "no-store" });
                        const lignesData = await lignesRes.json();
                        const lignesRaw = lignesData.results || lignesData || [];

                        const lignes = lignesRaw.map(l => ({
                            nomMateriel: l.materiel_nom || `Material #${l.id_materiel}`,
                            codeMateriel: l.materiel_code || "",
                            typeMateriel: l.type_materiel === "MEDICAL" ? "Medical Material" : "Durable Material",
                            quantite: l.quantite
                        }));

                        return {
                            id: s.numero_sortie || `OUT-${s.idSortie}`,
                            idSortie: s.idSortie,
                            serviceMedical: s.service_medical || "Not specified",
                            dateSortie: s.date_sortie?.split('T')[0] || '-',
                            dateEnregistrement: s.date_sortie?.split('T')[0] || '-',
                            motifSortie: mapMotif(s.motif_sortie),
                            articles: lignes
                        };
                    } catch (e) {
                        console.warn("Error loading output lines " + s.idSortie, e);
                        return {
                            id: s.numero_sortie || `OUT-${s.idSortie}`,
                            idSortie: s.idSortie,
                            serviceMedical: s.service_medical || "Not specified",
                            dateSortie: s.date_sortie?.split('T')[0] || '-',
                            dateEnregistrement: s.date_sortie?.split('T')[0] || '-',
                            motifSortie: mapMotif(s.motif_sortie),
                            articles: []
                        };
                    }
                })
            );

            setOutputs(outputsWithLines);

        } catch (err) {
            console.error("Error loading outputs:", err);
            setError("Unable to load outputs.");
        } finally {
            setLoading(false);
        }
    }

    function mapMotif(motif) {
        const map = {
            'VENTE': 'sale',
            'UTILISATION_SERVICE': 'usage',
            'DEFECTUEUX': 'defective',
            'PERIME': 'expired',
            'PERTE': 'defective'
        };
        return map[motif] || 'defective';
    }

    function getFilteredOutputs() {
        return outputs.filter(output => {
            const matchesSearch = output.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                output.serviceMedical.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (output.articles && output.articles.some(a =>
                    a.nomMateriel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.codeMateriel.toLowerCase().includes(searchTerm.toLowerCase())
                ));

            const matchesMotif = filterMotif === "all" || output.motifSortie === filterMotif;

            let matchesPeriod = true;
            if (filterPeriod !== "all") {
                const outputDate = new Date(output.dateSortie);
                const today = new Date();
                const diffDays = Math.floor((today - outputDate) / (1000 * 60 * 60 * 24));

                if (filterPeriod === "today") matchesPeriod = diffDays === 0;
                else if (filterPeriod === "week") matchesPeriod = diffDays <= 7;
                else if (filterPeriod === "month") matchesPeriod = diffDays <= 30;
            }

            return matchesSearch && matchesMotif && matchesPeriod;
        });
    }

    function getMotifBadge(motif) {
        const config = {
            defective: { bg: "bg-red-100", text: "text-red-800", label: "Defective" },
            expired: { bg: "bg-orange-100", text: "text-orange-800", label: "Expired" },
            sale: { bg: "bg-green-100", text: "text-green-800", label: "Sale" },
            transfer: { bg: "bg-blue-100", text: "text-blue-800", label: "Transfer" },
            usage: { bg: "bg-purple-100", text: "text-purple-800", label: "Usage" }
        };

        const { bg, text, label } = config[motif] || config.defective;

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
                {label}
            </span>
        );
    }

    function exportToPDF() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(20);
        doc.setTextColor(26, 115, 163);
        doc.text("Material Output List", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-US')} at ${new Date().toLocaleTimeString('en-US')}`, pageWidth / 2, 28, { align: "center" });

        doc.setDrawColor(80, 194, 185);
        doc.setLineWidth(0.5);
        doc.line(14, 32, pageWidth - 14, 32);

        let yPosition = 45;
        const margin = 14;

        const sortiesActuelles = filteredOutputs;

        sortiesActuelles.forEach((output) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFillColor(26, 115, 163);
            doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 10, 'F');

            doc.setFontSize(10);
            doc.setTextColor(255);
            doc.setFont(undefined, 'bold');
            doc.text(`${output.id} - ${output.serviceMedical}`, margin + 3, yPosition + 2);
            doc.text(`${output.dateSortie}`, pageWidth - margin - 25, yPosition + 2);

            yPosition += 12;

            doc.setTextColor(0);
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');

            const motifLabels = {
                defective: "Defective",
                expired: "Expired",
                sale: "Sale",
                transfer: "Transfer",
                usage: "Usage"
            };
            doc.text(`Reason: ${motifLabels[output.motifSortie] || output.motifSortie}`, margin + 3, yPosition);

            yPosition += 8;

            doc.setFont(undefined, 'bold');
            doc.text("Items:", margin + 3, yPosition);
            yPosition += 6;

            doc.setFont(undefined, 'normal');
            if (output.articles && output.articles.length > 0) {
                output.articles.forEach((article) => {
                    doc.text(`• ${article.nomMateriel} (${article.codeMateriel}) - Qty: ${article.quantite}`, margin + 5, yPosition);
                    yPosition += 5;
                });
            } else {
                doc.text(`  No items`, margin + 5, yPosition);
                yPosition += 5;
            }

            yPosition += 8;
        });

        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(80, 194, 185);
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Total: ${filteredOutputs.length} output(s)`, margin, pageHeight - 12);
        doc.text("Fultang Clinic - Material Accountant", pageWidth - margin, pageHeight - 12, { align: "right" });

        doc.save(`material_outputs_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    const filteredOutputs = getFilteredOutputs();
    const totalPages = Math.ceil(filteredOutputs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentOutputs = filteredOutputs.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <AccountantDashBoard linkList={AccountantNavLink} requiredRole={"comptable_matiere"}>
                <AccountantNavBar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <RefreshCw className="animate-spin text-primary-start mx-auto mb-4 w-10 h-10" />
                        <p className="text-gray-600">Loading outputs...</p>
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
                            <List className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Output List</h1>
                                <p className="text-sm opacity-90">{outputs.length} outputs registered</p>
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

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Search
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                                placeholder="Output #, service, material, code..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Reason
                            </label>
                            <select
                                value={filterMotif}
                                onChange={(e) => { setFilterMotif(e.target.value); setCurrentPage(1); }}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                            >
                                <option value="all">All reasons</option>
                                <option value="defective">Defective</option>
                                <option value="expired">Expired</option>
                                <option value="sale">Sale</option>
                                <option value="transfer">Transfer</option>
                                <option value="usage">Usage</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Period
                            </label>
                            <select
                                value={filterPeriod}
                                onChange={(e) => { setFilterPeriod(e.target.value); setCurrentPage(1); }}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                            >
                                <option value="all">All periods</option>
                                <option value="today">Today</option>
                                <option value="week">This week</option>
                                <option value="month">This month</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Output List */}
                <div className="space-y-4">
                    {currentOutputs.length > 0 ? (
                        currentOutputs.map((output) => (
                            <OutputCard
                                key={output.id}
                                output={output}
                                getMotifBadge={getMotifBadge}
                            />
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg p-12 text-center text-gray-500">
                            <PackageOpen className="mx-auto text-gray-300 mb-4 w-16 h-16" />
                            <p className="text-lg">No outputs found</p>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                        </div>
                    )}
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
                    Showing {currentOutputs.length} of {filteredOutputs.length} output(s)
                </div>
            </div>
        </AccountantDashBoard>
    );
}

function OutputCard({ output, getMotifBadge }) {
    OutputCard.propTypes = {
        output: PropTypes.object.isRequired,
        getMotifBadge: PropTypes.func.isRequired
    };

    const [showDetails, setShowDetails] = useState(false);

    const totalArticles = output.articles ? output.articles.length : 0;
    const totalQuantite = output.articles ? output.articles.reduce((sum, a) => sum + a.quantite, 0) : 0;

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2 font-mono">{output.id}</h3>
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {getMotifBadge(output.motifSortie)}
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                {totalArticles} item(s)
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600 flex items-center gap-1 justify-end">
                            <Calendar className="text-gray-400 w-4 h-4" />
                            Output Date
                        </p>
                        <p className="font-semibold text-gray-800">{output.dateSortie}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Building2 className="text-gray-400 w-4 h-4" />
                            Responsible Service
                        </p>
                        <p className="font-semibold text-gray-800">{output.serviceMedical}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Registration Date</p>
                        <p className="font-semibold text-gray-800">{output.dateEnregistrement}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Quantity</p>
                        <p className="font-semibold text-gray-800 text-lg">{totalQuantite} unit(s)</p>
                    </div>
                </div>

                {showDetails && output.articles && output.articles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <PackageOpen className="text-primary-start w-5 h-5" />
                            Items in this output:
                        </h4>
                        <div className="space-y-2">
                            {output.articles.map((article, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <span className="font-semibold text-gray-800">{article.nomMateriel}</span>
                                        <span className="text-xs text-gray-500 font-mono ml-2">({article.codeMateriel})</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 rounded text-xs ${article.typeMateriel === 'Medical Material'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {article.typeMateriel}
                                        </span>
                                        <span className="font-bold text-gray-800">Qty: {article.quantite}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                    <Eye className="w-5 h-5" />
                    {showDetails ? "Hide items" : `View ${totalArticles} item(s)`}
                </button>
            </div>
        </div>
    );
}
