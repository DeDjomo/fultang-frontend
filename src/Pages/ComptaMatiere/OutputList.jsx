import { ComptaMatiereDashBoard } from "./Components/ComptaMatiereDashboard";
import { ComptaMatiereNavLink } from "./ComptaMatiereNavLink";
import { ComptaMatiereNavBar } from "./Components/ComptaMatiereNavBar";
import { useState, useEffect } from "react";
import {
    FaSearch,
    FaEye,
    FaFilter,
    FaListAlt,
    FaFilePdf,
    FaBuilding,
    FaCalendarAlt,
    FaBoxOpen,
    FaSpinner
} from "react-icons/fa";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import { getAllSorties, getLignesSortie } from "../../services/comptabiliteMatiereApi";

export function OutputList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterMotif, setFilterMotif] = useState("all");
    const [filterPeriod, setFilterPeriod] = useState("all");
    const [loading, setLoading] = useState(true);

    // Données des sorties
    const [outputs, setOutputs] = useState([]);

    // Charger les sorties au montage du composant
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const sortiesData = await getAllSorties();
                const sorties = sortiesData.results || sortiesData;

                // Transformer les données pour l'affichage
                const outputsFormatted = await Promise.all(sorties.map(async (s) => {
                    // Récupérer les lignes de sortie si nécessaire
                    let articles = s.lignes || [];
                    if (articles.length === 0 && s.idSortie) {
                        try {
                            const lignesData = await getLignesSortie(s.idSortie);
                            articles = lignesData.results || lignesData || [];
                        } catch (e) {
                            articles = [];
                        }
                    }

                    return {
                        id: s.numero_sortie || `SOR-${s.idSortie}`,
                        serviceMedical: s.service_responsable || "Service",
                        dateSortie: s.date_sortie?.split('T')[0] || new Date().toISOString().split('T')[0],
                        dateEnregistrement: s.date_creation?.split('T')[0] || new Date().toISOString().split('T')[0],
                        motifSortie: s.motif_sortie?.toLowerCase() || "utilisation",
                        articles: articles.map(a => ({
                            nomMateriel: a.materiel_nom || a.nom_materiel || "Matériel",
                            codeMateriel: a.materiel_code || a.code || "N/A",
                            typeMateriel: a.type_materiel || "Matériel",
                            quantite: a.quantite || 0
                        }))
                    };
                }));

                setOutputs(outputsFormatted);
            } catch (err) {
                console.error("Erreur lors du chargement des sorties:", err);
                // Fallback to mock data
                setOutputs([
                    { id: "SOR-2024-001", serviceMedical: "Service Médical", dateSortie: "2024-12-20", dateEnregistrement: "2024-12-20", motifSortie: "vente", articles: [{ nomMateriel: "Gants médicaux", codeMateriel: "MED-001", typeMateriel: "Matériel Médical", quantite: 20 }] },
                    { id: "SOR-2024-002", serviceMedical: "Pharmacie", dateSortie: "2024-12-19", dateEnregistrement: "2024-12-19", motifSortie: "perime", articles: [{ nomMateriel: "Compresses stériles", codeMateriel: "MED-003", typeMateriel: "Matériel Médical", quantite: 50 }] },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    function getFilteredOutputs() {
        return outputs.filter(output => {
            const matchesSearch = output.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                output.serviceMedical.toLowerCase().includes(searchTerm.toLowerCase()) ||
                output.articles.some(a =>
                    a.nomMateriel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.codeMateriel.toLowerCase().includes(searchTerm.toLowerCase())
                );

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
            defectueux: { bg: "bg-red-100", text: "text-red-800", label: "Défectueux" },
            perime: { bg: "bg-orange-100", text: "text-orange-800", label: "Périmé" },
            vente: { bg: "bg-green-100", text: "text-green-800", label: "Vente" },
            transfert: { bg: "bg-blue-100", text: "text-blue-800", label: "Transfert" },
            utilisation: { bg: "bg-purple-100", text: "text-purple-800", label: "Utilisation" }
        };

        const { bg, text, label } = config[motif] || config.defectueux;

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
                {label}
            </span>
        );
    }

    function exportToPDF() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Titre du document
        doc.setFontSize(20);
        doc.setTextColor(26, 115, 163);
        doc.text("Liste des Sorties de Matériel", pageWidth / 2, 20, { align: "center" });

        // Sous-titre avec la date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, 28, { align: "center" });

        // Ligne de séparation
        doc.setDrawColor(80, 194, 185);
        doc.setLineWidth(0.5);
        doc.line(14, 32, pageWidth - 14, 32);

        let yPosition = 45;
        const margin = 14;

        const sortiesActuelles = filteredOutputs;

        sortiesActuelles.forEach((output) => {
            // Vérifier si on a besoin d'une nouvelle page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            // En-tête de la sortie
            doc.setFillColor(26, 115, 163);
            doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 10, 'F');

            doc.setFontSize(10);
            doc.setTextColor(255);
            doc.setFont(undefined, 'bold');
            doc.text(`${output.id} - ${output.serviceMedical}`, margin + 3, yPosition + 2);
            doc.text(`${output.dateSortie}`, pageWidth - margin - 25, yPosition + 2);

            yPosition += 12;

            // Infos de la sortie
            doc.setTextColor(0);
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');

            const motifLabels = {
                defectueux: "Défectueux",
                perime: "Périmé",
                vente: "Vente",
                transfert: "Transfert",
                utilisation: "Utilisation"
            };
            doc.text(`Motif: ${motifLabels[output.motifSortie] || output.motifSortie}`, margin + 3, yPosition);
            doc.text(`Enregistré le: ${output.dateEnregistrement}`, margin + 60, yPosition);

            yPosition += 8;

            // Articles
            doc.setFont(undefined, 'bold');
            doc.text("Articles:", margin + 3, yPosition);
            yPosition += 6;

            doc.setFont(undefined, 'normal');
            output.articles.forEach((article) => {
                doc.text(`• ${article.nomMateriel} (${article.codeMateriel}) - Qté: ${article.quantite} - ${article.typeMateriel}`, margin + 5, yPosition);
                yPosition += 5;
            });

            yPosition += 8;
        });

        // Pied de page
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(80, 194, 185);
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Total: ${filteredOutputs.length} sortie(s)`, margin, pageHeight - 12);
        doc.text("Fultang Clinic - Comptable Matière", pageWidth - margin, pageHeight - 12, { align: "right" });

        // Télécharger le PDF
        doc.save(`sorties_materiel_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    const filteredOutputs = getFilteredOutputs();

    return (
        <ComptaMatiereDashBoard
            linkList={ComptaMatiereNavLink}
            requiredRole={"Accountant"}
        >
            <ComptaMatiereNavBar />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaListAlt className="text-4xl text-primary-start" />
                        <h1 className="text-3xl font-bold text-gray-800">Liste des Sorties</h1>
                    </div>
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 shadow-lg"
                    >
                        <FaFilePdf /> Exporter PDF
                    </button>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FaSearch className="inline mr-2" />
                                Rechercher
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                                placeholder="N° sortie, service, matériel, code..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FaFilter className="inline mr-2" />
                                Motif
                            </label>
                            <select
                                value={filterMotif}
                                onChange={(e) => setFilterMotif(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                            >
                                <option value="all">Tous les motifs</option>
                                <option value="defectueux">Défectueux</option>
                                <option value="perime">Périmé</option>
                                <option value="vente">Vente</option>
                                <option value="transfert">Transfert</option>
                                <option value="utilisation">Utilisation</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Période
                            </label>
                            <select
                                value={filterPeriod}
                                onChange={(e) => setFilterPeriod(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent transition-all"
                            >
                                <option value="all">Toutes les périodes</option>
                                <option value="today">Aujourd&apos;hui</option>
                                <option value="week">Cette semaine</option>
                                <option value="month">Ce mois</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Liste des sorties */}
                <div className="space-y-4">
                    {filteredOutputs.length > 0 ? (
                        filteredOutputs.map((output) => (
                            <OutputCard
                                key={output.id}
                                output={output}
                                getMotifBadge={getMotifBadge}
                            />
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg p-12 text-center text-gray-500">
                            <FaBoxOpen className="mx-auto text-5xl text-gray-300 mb-4" />
                            <p>Aucune sortie trouvée</p>
                        </div>
                    )}
                </div>

                <div className="text-sm text-gray-600 text-right">
                    Affichage de {filteredOutputs.length} sur {outputs.length} sorties
                </div>
            </div>
        </ComptaMatiereDashBoard>
    );
}

function OutputCard({ output, getMotifBadge }) {
    OutputCard.propTypes = {
        output: PropTypes.object.isRequired,
        getMotifBadge: PropTypes.func.isRequired
    };

    const [showDetails, setShowDetails] = useState(false);

    // Calculer le total d'articles
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
                                {totalArticles} article(s)
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600 flex items-center gap-1 justify-end">
                            <FaCalendarAlt className="text-gray-400" />
                            Date de sortie
                        </p>
                        <p className="font-semibold text-gray-800">{output.dateSortie}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <FaBuilding className="text-gray-400" />
                            Service responsable
                        </p>
                        <p className="font-semibold text-gray-800">{output.serviceMedical}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Date d&apos;enregistrement</p>
                        <p className="font-semibold text-gray-800">{output.dateEnregistrement}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Quantité totale</p>
                        <p className="font-semibold text-gray-800 text-lg">{totalQuantite} unité(s)</p>
                    </div>
                </div>

                {showDetails && output.articles && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FaBoxOpen className="text-primary-start" />
                            Articles concernés par cette sortie:
                        </h4>
                        <div className="space-y-2">
                            {output.articles.map((article, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <span className="font-semibold text-gray-800">{article.nomMateriel}</span>
                                        <span className="text-xs text-gray-500 font-mono ml-2">({article.codeMateriel})</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 rounded text-xs ${article.typeMateriel === 'Matériel Médical'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {article.typeMateriel}
                                        </span>
                                        <span className="font-bold text-gray-800">Qté: {article.quantite}</span>
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
                    <FaEye />
                    {showDetails ? "Masquer les articles" : `Voir les ${totalArticles} article(s)`}
                </button>
            </div>
        </div>
    );
}
