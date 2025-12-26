import { PharmacistDashBoard } from "./Components/PharmacistDashboard";
import { PharmacistNavLink } from "./PharmacistNavLink";
import { PharmacistNavBar } from "./Components/PharmacistNavBar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBoxes,
    FaSave,
    FaCheckCircle,
    FaFilePdf,
    FaArchive,
    FaEye,
    FaHistory,
    FaArrowRight,
    FaPrint
} from "react-icons/fa";
import jsPDF from "jspdf";

export function PharmacistInventory() {
    const navigate = useNavigate();

    // État actuel des médicaments (simulé - normalement depuis l'API)
    const [medications, setMedications] = useState([
        { code: "MED-001", name: "Paracétamol 500mg", quantiteActuelle: 150, nouvelleQuantite: "", prixVente: 250 },
        { code: "MED-002", name: "Ibuprofène 400mg", quantiteActuelle: 80, nouvelleQuantite: "", prixVente: 350 },
        { code: "MED-003", name: "Amoxicilline 500mg", quantiteActuelle: 25, nouvelleQuantite: "", prixVente: 800 },
        { code: "MED-004", name: "Vitamine C 1000mg", quantiteActuelle: 200, nouvelleQuantite: "", prixVente: 150 },
        { code: "MED-005", name: "Oméprazole 20mg", quantiteActuelle: 15, nouvelleQuantite: "", prixVente: 500 },
        { code: "MED-006", name: "Doliprane 1000mg", quantiteActuelle: 100, nouvelleQuantite: "", prixVente: 300 },
        { code: "MED-007", name: "Aspirine 100mg", quantiteActuelle: 45, nouvelleQuantite: "", prixVente: 200 },
        { code: "MED-008", name: "Métronidazole 250mg", quantiteActuelle: 60, nouvelleQuantite: "", prixVente: 450 },
    ]);

    // Liste des archives
    const [archives, setArchives] = useState([]);

    // Mode actuel
    const [mode, setMode] = useState("list"); // "list" | "inventory" | "report"

    // Archive sélectionnée pour consultation
    const [selectedArchive, setSelectedArchive] = useState(null);
    const [showArchiveModal, setShowArchiveModal] = useState(false);

    // Message de succès
    const [successMessage, setSuccessMessage] = useState("");

    // Charger les archives depuis localStorage
    useEffect(() => {
        const storedArchives = JSON.parse(localStorage.getItem('pharmacist_archives') || '[]');
        setArchives(storedArchives);
    }, []);

    function generateArchiveId() {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const day = String(new Date().getDate()).padStart(2, '0');
        const randomNum = Math.floor(Math.random() * 100);
        return `ARC-${year}${month}${day}-${String(randomNum).padStart(2, '0')}`;
    }

    // Calculer si un inventaire est en cours
    const hasInProgress = archives.length > 0 && archives[0].statut === "en_cours";

    function createNewInventory() {
        // Créer une archive de l'état actuel (ancien stock)
        const archive = {
            id: generateArchiveId(),
            dateCreation: new Date().toISOString(),
            ancienStock: medications.map(m => ({
                code: m.code,
                name: m.name,
                quantite: m.quantiteActuelle,
                prixVente: m.prixVente
            })),
            nouveauStock: null,
            differences: null,
            responsable: "PHARM-001",
            statut: "en_cours",
            draftQuantities: {} // Pour sauvegarder l'avancement
        };

        // Sauvegarder l'archive
        const updatedArchives = [archive, ...archives];
        setArchives(updatedArchives);
        localStorage.setItem('pharmacist_archives', JSON.stringify(updatedArchives));

        // Réinitialiser les nouvelles quantités
        setMedications(medications.map(m => ({ ...m, nouvelleQuantite: "" })));

        // Passer en mode inventaire
        setMode("inventory");
        setSuccessMessage(`Archive ${archive.id} créée. Veuillez maintenant saisir les nouvelles quantités.`);
        setTimeout(() => setSuccessMessage(""), 5000);
    }

    function resumeInventory() {
        if (!hasInProgress) return;
        const currentArchive = archives[0];
        const draft = currentArchive.draftQuantities || {};

        setMedications(medications.map(m => ({
            ...m,
            nouvelleQuantite: draft[m.code] !== undefined ? draft[m.code] : ""
        })));

        setMode("inventory");
        setSuccessMessage(`Reprise de l'inventaire ${currentArchive.id}.`);
        setTimeout(() => setSuccessMessage(""), 5000);
    }

    function handleStartInventory() {
        if (hasInProgress) {
            resumeInventory();
        } else {
            createNewInventory();
        }
    }

    function updateQuantity(code, value) {
        // Mettre à jour l'état local
        const updatedMeds = medications.map(m =>
            m.code === code ? { ...m, nouvelleQuantite: value } : m
        );
        setMedications(updatedMeds);

        // Sauvegarder dans le brouillon de l'archive en cours
        if (archives.length > 0 && archives[0].statut === "en_cours") {
            const currentArchive = archives[0];
            const newDraft = { ...(currentArchive.draftQuantities || {}), [code]: value };

            const updatedArchive = { ...currentArchive, draftQuantities: newDraft };
            const updatedArchives = [updatedArchive, ...archives.slice(1)];

            setArchives(updatedArchives);
            localStorage.setItem('pharmacist_archives', JSON.stringify(updatedArchives));
        }
    }

    function saveInventory() {
        // Vérifier que toutes les quantités sont remplies
        const hasEmpty = medications.some(m => m.nouvelleQuantite === "");
        if (hasEmpty) {
            alert("Veuillez remplir toutes les nouvelles quantités !");
            return;
        }

        // Calculer les différences et créer le nouveau stock
        const nouveauStock = medications.map(m => ({
            code: m.code,
            name: m.name,
            quantite: parseInt(m.nouvelleQuantite),
            prixVente: m.prixVente
        }));

        const differences = medications.map(m => ({
            code: m.code,
            name: m.name,
            ancienneQuantite: m.quantiteActuelle,
            nouvelleQuantite: parseInt(m.nouvelleQuantite),
            difference: parseInt(m.nouvelleQuantite) - m.quantiteActuelle
        }));

        // Mettre à jour l'archive en cours avec les 3 colonnes
        const latestArchive = archives[0];
        if (latestArchive && latestArchive.statut === "en_cours") {
            const updatedArchive = {
                ...latestArchive,
                statut: "termine",
                dateTermine: new Date().toISOString(),
                nouveauStock: nouveauStock,
                differences: differences
            };
            const updatedArchives = [updatedArchive, ...archives.slice(1)];
            setArchives(updatedArchives);
            localStorage.setItem('pharmacist_archives', JSON.stringify(updatedArchives));
        }

        // Mettre à jour les quantités des médicaments
        const updatedMedications = medications.map(m => ({
            ...m,
            quantiteActuelle: parseInt(m.nouvelleQuantite),
            nouvelleQuantite: ""
        }));
        setMedications(updatedMedications);

        // Passer en mode rapport
        setMode("report");
        setSuccessMessage("Inventaire enregistré ! Vous pouvez maintenant rédiger votre rapport.");
        setTimeout(() => setSuccessMessage(""), 5000);
    }

    function goToReports() {
        // Préparer les données du rapport d'inventaire pour la page des rapports
        const latestArchive = archives[0];

        if (latestArchive) {
            // Sauvegarder les données de l'inventaire pour le rapport
            const inventoryReportData = {
                archiveId: latestArchive.id,
                dateInventaire: latestArchive.dateTermine || new Date().toISOString(),
                etatActuelStock: medications.map(m => ({
                    code: m.code,
                    name: m.name,
                    quantite: m.quantiteActuelle,
                    prixVente: m.prixVente
                })),
                archive: latestArchive
            };

            localStorage.setItem('pending_inventory_report', JSON.stringify(inventoryReportData));
        }

        // Rediriger vers la page des rapports
        navigate("/pharmacist/reports");
    }

    function viewArchive(archive) {
        setSelectedArchive(archive);
        setShowArchiveModal(true);
    }

    // Fonction pour exporter l'ancien stock en PDF
    function exportAncienStockToPDF(archive) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;

        // En-tête
        doc.setFontSize(18);
        doc.setTextColor(26, 115, 163);
        doc.text("FULTANG CLINIC - PHARMACIE", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(80, 194, 185);
        doc.text("État Ancien du Stock", pageWidth / 2, 28, { align: "center" });

        doc.setDrawColor(80, 194, 185);
        doc.line(margin, 35, pageWidth - margin, 35);

        let yPos = 45;
        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.text(`Archive: ${archive.id}`, margin, yPos);
        doc.text(`Date: ${new Date(archive.dateCreation).toLocaleDateString('fr-FR')}`, pageWidth - margin, yPos, { align: "right" });

        yPos += 15;

        // En-tête du tableau
        doc.setFillColor(26, 115, 163);
        doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
        doc.setTextColor(255);
        doc.setFont(undefined, 'bold');
        doc.text("Code", margin + 5, yPos);
        doc.text("Médicament", margin + 35, yPos);
        doc.text("Quantité", margin + 120, yPos);
        doc.text("Prix Vente", margin + 150, yPos);

        yPos += 10;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0);

        archive.ancienStock.forEach((med, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            if (index % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
            }

            doc.text(med.code, margin + 5, yPos);
            doc.text(med.name.substring(0, 30), margin + 35, yPos);
            doc.text(String(med.quantite), margin + 120, yPos);
            doc.text(`${med.prixVente} F`, margin + 150, yPos);

            yPos += 8;
        });

        // Pied de page
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, pageHeight - 15);
        doc.text("Fultang Clinic - Pharmacie", pageWidth - margin, pageHeight - 15, { align: "right" });

        doc.save(`ancien_stock_${archive.id}.pdf`);
    }

    // Fonction pour exporter le nouveau stock en PDF
    function exportNouveauStockToPDF(archive) {
        if (!archive.nouveauStock) {
            alert("Le nouveau stock n'est pas encore disponible pour cette archive.");
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;

        // En-tête
        doc.setFontSize(18);
        doc.setTextColor(26, 115, 163);
        doc.text("FULTANG CLINIC - PHARMACIE", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(80, 194, 185);
        doc.text("État Nouveau du Stock (Après Inventaire)", pageWidth / 2, 28, { align: "center" });

        doc.setDrawColor(80, 194, 185);
        doc.line(margin, 35, pageWidth - margin, 35);

        let yPos = 45;
        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.text(`Archive: ${archive.id}`, margin, yPos);
        doc.text(`Date: ${new Date(archive.dateTermine).toLocaleDateString('fr-FR')}`, pageWidth - margin, yPos, { align: "right" });

        yPos += 15;

        // En-tête du tableau
        doc.setFillColor(39, 174, 96);
        doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
        doc.setTextColor(255);
        doc.setFont(undefined, 'bold');
        doc.text("Code", margin + 5, yPos);
        doc.text("Médicament", margin + 35, yPos);
        doc.text("Quantité", margin + 120, yPos);
        doc.text("Prix Vente", margin + 150, yPos);

        yPos += 10;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0);

        archive.nouveauStock.forEach((med, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            if (index % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
            }

            doc.text(med.code, margin + 5, yPos);
            doc.text(med.name.substring(0, 30), margin + 35, yPos);
            doc.text(String(med.quantite), margin + 120, yPos);
            doc.text(`${med.prixVente} F`, margin + 150, yPos);

            yPos += 8;
        });

        // Pied de page
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, pageHeight - 15);
        doc.text("Fultang Clinic - Pharmacie", pageWidth - margin, pageHeight - 15, { align: "right" });

        doc.save(`nouveau_stock_${archive.id}.pdf`);
    }

    // Fonction pour exporter les différences en PDF
    function exportDifferencesToPDF(archive) {
        if (!archive.differences) {
            alert("Les différences ne sont pas encore disponibles pour cette archive.");
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;

        // En-tête
        doc.setFontSize(18);
        doc.setTextColor(26, 115, 163);
        doc.text("FULTANG CLINIC - PHARMACIE", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(80, 194, 185);
        doc.text("Rapport des Différences d'Inventaire", pageWidth / 2, 28, { align: "center" });

        doc.setDrawColor(80, 194, 185);
        doc.line(margin, 35, pageWidth - margin, 35);

        let yPos = 45;
        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.text(`Archive: ${archive.id}`, margin, yPos);
        doc.text(`Date: ${new Date(archive.dateTermine).toLocaleDateString('fr-FR')}`, pageWidth - margin, yPos, { align: "right" });

        yPos += 15;

        // En-tête du tableau
        doc.setFillColor(230, 126, 34);
        doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
        doc.setTextColor(255);
        doc.setFont(undefined, 'bold');
        doc.text("Code", margin + 3, yPos);
        doc.text("Médicament", margin + 25, yPos);
        doc.text("Ancien", margin + 95, yPos);
        doc.text("Nouveau", margin + 120, yPos);
        doc.text("Diff.", margin + 150, yPos);
        doc.text("Statut", margin + 165, yPos);

        yPos += 10;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0);

        archive.differences.forEach((item, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            if (index % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
            }

            doc.text(item.code, margin + 3, yPos);
            doc.text(item.name.substring(0, 25), margin + 25, yPos);
            doc.text(String(item.ancienneQuantite), margin + 95, yPos);
            doc.text(String(item.nouvelleQuantite), margin + 120, yPos);

            // Couleur selon la différence
            if (item.difference > 0) {
                doc.setTextColor(39, 174, 96);
                doc.text(`+${item.difference}`, margin + 150, yPos);
                doc.text("Excédent", margin + 165, yPos);
            } else if (item.difference < 0) {
                doc.setTextColor(231, 76, 60);
                doc.text(String(item.difference), margin + 150, yPos);
                doc.text("Déficit", margin + 165, yPos);
            } else {
                doc.setTextColor(127, 140, 141);
                doc.text("0", margin + 150, yPos);
                doc.text("OK", margin + 165, yPos);
            }

            doc.setTextColor(0);
            yPos += 8;
        });

        // Résumé
        yPos += 10;
        const excedents = archive.differences.filter(d => d.difference > 0).length;
        const deficits = archive.differences.filter(d => d.difference < 0).length;
        const conformes = archive.differences.filter(d => d.difference === 0).length;

        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
        yPos += 8;
        doc.setFont(undefined, 'bold');
        doc.text("RÉSUMÉ:", margin + 5, yPos);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(39, 174, 96);
        doc.text(`Excédents: ${excedents}`, margin + 40, yPos);
        doc.setTextColor(231, 76, 60);
        doc.text(`Déficits: ${deficits}`, margin + 80, yPos);
        doc.setTextColor(127, 140, 141);
        doc.text(`Conformes: ${conformes}`, margin + 115, yPos);

        // Pied de page
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, pageHeight - 15);
        doc.text("Fultang Clinic - Pharmacie", pageWidth - margin, pageHeight - 15, { align: "right" });

        doc.save(`differences_${archive.id}.pdf`);
    }

    // Fonction pour exporter l'archive complète (les 3 colonnes)
    function exportFullArchiveToPDF(archive) {
        const doc = new jsPDF('landscape');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;

        // En-tête
        doc.setFontSize(18);
        doc.setTextColor(26, 115, 163);
        doc.text("FULTANG CLINIC - PHARMACIE", pageWidth / 2, 15, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(80, 194, 185);
        doc.text("Rapport Complet d'Inventaire", pageWidth / 2, 23, { align: "center" });

        doc.setDrawColor(80, 194, 185);
        doc.line(margin, 28, pageWidth - margin, 28);

        let yPos = 35;
        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.text(`Référence Archive: ${archive.id}`, margin, yPos);
        doc.text(`Date début: ${new Date(archive.dateCreation).toLocaleDateString('fr-FR')}`, margin + 80, yPos);
        if (archive.dateTermine) {
            doc.text(`Date fin: ${new Date(archive.dateTermine).toLocaleDateString('fr-FR')}`, margin + 160, yPos);
        }
        doc.text(`Statut: ${archive.statut === 'termine' ? 'Terminé' : 'En cours'}`, pageWidth - margin, yPos, { align: "right" });

        yPos += 12;

        // En-tête du tableau complet
        doc.setFillColor(26, 115, 163);
        doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
        doc.setTextColor(255);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        doc.text("Code", margin + 3, yPos);
        doc.text("Médicament", margin + 28, yPos);
        doc.text("Ancien Stock", margin + 100, yPos);
        doc.text("Nouveau Stock", margin + 140, yPos);
        doc.text("Différence", margin + 185, yPos);
        doc.text("Statut", margin + 220, yPos);

        yPos += 12;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0);
        doc.setFontSize(9);

        const items = archive.differences || archive.ancienStock.map(m => ({
            code: m.code,
            name: m.name,
            ancienneQuantite: m.quantite,
            nouvelleQuantite: '-',
            difference: '-'
        }));

        items.forEach((item, index) => {
            if (yPos > 180) {
                doc.addPage();
                yPos = 20;
            }

            if (index % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
            }

            doc.setTextColor(0);
            doc.text(item.code, margin + 3, yPos);
            doc.text(item.name.substring(0, 28), margin + 28, yPos);
            doc.text(String(item.ancienneQuantite || (archive.ancienStock.find(a => a.code === item.code)?.quantite || '-')), margin + 105, yPos);
            doc.text(String(item.nouvelleQuantite || '-'), margin + 150, yPos);

            // Différence avec couleur
            if (typeof item.difference === 'number') {
                if (item.difference > 0) {
                    doc.setTextColor(39, 174, 96);
                    doc.text(`+${item.difference}`, margin + 190, yPos);
                    doc.text("Excédent", margin + 220, yPos);
                } else if (item.difference < 0) {
                    doc.setTextColor(231, 76, 60);
                    doc.text(String(item.difference), margin + 190, yPos);
                    doc.text("Déficit", margin + 220, yPos);
                } else {
                    doc.setTextColor(127, 140, 141);
                    doc.text("0", margin + 190, yPos);
                    doc.text("OK", margin + 220, yPos);
                }
            } else {
                doc.setTextColor(127, 140, 141);
                doc.text("-", margin + 190, yPos);
                doc.text("En attente", margin + 220, yPos);
            }

            yPos += 8;
        });

        // Pied de page
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, pageHeight - 10);
        doc.text("Fultang Clinic - Pharmacie", pageWidth - margin, pageHeight - 10, { align: "right" });

        doc.save(`archive_complete_${archive.id}.pdf`);
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
                        <FaBoxes className="text-4xl text-primary-start" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Inventaire</h1>
                            <p className="text-gray-500">
                                {mode === "list" && "Gestion des archives d'inventaire"}
                                {mode === "inventory" && "Saisie des nouvelles quantités"}
                                {mode === "report" && "Rapport d'inventaire"}
                            </p>
                        </div>
                    </div>
                    {mode === "list" && (
                        <button
                            onClick={handleStartInventory}
                            className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all font-semibold ${hasInProgress
                                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                                    : "bg-gradient-to-r from-primary-start to-primary-end"
                                }`}
                        >
                            <FaArchive />
                            {hasInProgress ? "Reprendre l'inventaire en cours" : "Démarrer un inventaire"}
                        </button>
                    )}
                </div>

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <FaCheckCircle />
                        {successMessage}
                    </div>
                )}

                {/* Mode Liste des archives */}
                {mode === "list" && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaHistory className="text-blue-500" />
                            Historique des Archives
                        </h2>

                        {archives.length > 0 ? (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {archives.map(archive => (
                                    <div key={archive.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-800">{archive.id}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${archive.statut === "termine"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                    }`}>
                                                    {archive.statut === "termine" ? "Terminé" : "En cours"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Créé le {new Date(archive.dateCreation).toLocaleDateString('fr-FR')} •
                                                {archive.ancienStock?.length || 0} médicaments archivés
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => viewArchive(archive)}
                                                className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                                            >
                                                <FaEye /> Voir
                                            </button>
                                            <button
                                                onClick={() => exportFullArchiveToPDF(archive)}
                                                className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                                            >
                                                <FaFilePdf /> PDF Complet
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <FaArchive className="mx-auto text-5xl text-gray-300 mb-4" />
                                <p>Aucune archive d&apos;inventaire</p>
                                <p className="text-sm">Cliquez sur &quot;Démarrer un inventaire&quot; pour créer la première archive</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Mode Inventaire */}
                {mode === "inventory" && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Saisie des Nouvelles Quantités</h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setMode("list")}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={saveInventory}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                                >
                                    <FaSave /> Valider l&apos;inventaire
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-primary-start to-primary-end text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Code</th>
                                        <th className="px-4 py-3 text-left">Médicament</th>
                                        <th className="px-4 py-3 text-center">Qté en BD</th>
                                        <th className="px-4 py-3 text-center">Nouvelle Qté</th>
                                        <th className="px-4 py-3 text-center">Différence</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {medications.map((med, index) => {
                                        const diff = med.nouvelleQuantite !== ""
                                            ? parseInt(med.nouvelleQuantite) - med.quantiteActuelle
                                            : null;
                                        return (
                                            <tr key={med.code} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                                <td className="px-4 py-3 font-mono text-sm">{med.code}</td>
                                                <td className="px-4 py-3 font-medium">{med.name}</td>
                                                <td className="px-4 py-3 text-center font-bold text-gray-600">
                                                    {med.quantiteActuelle}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        value={med.nouvelleQuantite}
                                                        onChange={(e) => updateQuantity(med.code, e.target.value)}
                                                        className="w-24 p-2 border border-gray-300 rounded-lg text-center"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {diff !== null && (
                                                        <span className={`font-bold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
                                                            }`}>
                                                            {diff > 0 ? '+' : ''}{diff}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Mode Rapport */}
                {mode === "report" && (
                    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FaFilePdf className="text-red-500" />
                            Rapport d&apos;Inventaire
                        </h2>

                        {/* État actuel du stock après inventaire */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-700 mb-3">État actuel du stock après inventaire:</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {medications.map(med => (
                                    <div key={med.code} className="bg-white p-3 rounded-lg border shadow-sm">
                                        <p className="font-medium truncate text-sm text-gray-700">{med.name}</p>
                                        <p className="text-2xl font-bold text-primary-start">{med.quantiteActuelle}</p>
                                        <p className="text-xs text-gray-500">unités</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bouton unique pour rédiger le rapport */}
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={goToReports}
                                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-xl hover:opacity-90 transition-all font-bold text-lg shadow-lg"
                            >
                                Rédiger Rapport <FaArrowRight />
                            </button>
                        </div>

                        <p className="text-center text-sm text-gray-500">
                            Le rapport sera accompagné de l&apos;état actuel du stock et de l&apos;archive créée lors de cet inventaire.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de détails d'archive avec les 3 colonnes */}
            {showArchiveModal && selectedArchive && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Archive {selectedArchive.id}</h2>
                                <p className="text-sm text-gray-500">
                                    Créée le {new Date(selectedArchive.dateCreation).toLocaleDateString('fr-FR')}
                                    {selectedArchive.dateTermine && ` • Terminée le ${new Date(selectedArchive.dateTermine).toLocaleDateString('fr-FR')}`}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowArchiveModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Tableau avec les 3 colonnes */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-primary-start to-primary-end text-white">
                                    <tr>
                                        <th className="p-3 text-left">Code</th>
                                        <th className="p-3 text-left">Médicament</th>
                                        <th className="p-3 text-center bg-blue-600">Ancien Stock</th>
                                        <th className="p-3 text-center bg-green-600">Nouveau Stock</th>
                                        <th className="p-3 text-center bg-orange-500">Différence</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedArchive.ancienStock.map((med, idx) => {
                                        const nouveauItem = selectedArchive.nouveauStock?.find(n => n.code === med.code);
                                        const diffItem = selectedArchive.differences?.find(d => d.code === med.code);

                                        return (
                                            <tr key={med.code} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                                                <td className="p-3 font-mono">{med.code}</td>
                                                <td className="p-3">{med.name}</td>
                                                <td className="p-3 text-center font-bold text-blue-600">{med.quantite}</td>
                                                <td className="p-3 text-center font-bold text-green-600">
                                                    {nouveauItem ? nouveauItem.quantite : '-'}
                                                </td>
                                                <td className="p-3 text-center font-bold">
                                                    {diffItem ? (
                                                        <span className={
                                                            diffItem.difference > 0 ? 'text-green-600' :
                                                                diffItem.difference < 0 ? 'text-red-600' :
                                                                    'text-gray-500'
                                                        }>
                                                            {diffItem.difference > 0 ? '+' : ''}{diffItem.difference}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Boutons d'impression individuels */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <FaPrint /> Imprimer individuellement:
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <button
                                    onClick={() => exportAncienStockToPDF(selectedArchive)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                >
                                    <FaFilePdf /> Ancien Stock
                                </button>
                                <button
                                    onClick={() => exportNouveauStockToPDF(selectedArchive)}
                                    disabled={!selectedArchive.nouveauStock}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaFilePdf /> Nouveau Stock
                                </button>
                                <button
                                    onClick={() => exportDifferencesToPDF(selectedArchive)}
                                    disabled={!selectedArchive.differences}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaFilePdf /> Différences
                                </button>
                                <button
                                    onClick={() => exportFullArchiveToPDF(selectedArchive)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                >
                                    <FaFilePdf /> Archive Complète
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowArchiveModal(false)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PharmacistDashBoard>
    );
}
