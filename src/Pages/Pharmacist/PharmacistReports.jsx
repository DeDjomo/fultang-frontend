import { PharmacistDashBoard } from "./Components/PharmacistDashboard";
import { PharmacistNavLink } from "./PharmacistNavLink";
import { PharmacistNavBar } from "./Components/PharmacistNavBar";
import { useState, useEffect } from "react";
import {
    FaFileAlt,
    FaPaperPlane,
    FaFilePdf,
    FaEye,
    FaTimes,
    FaInbox,
    FaEnvelope,
    FaUser,
    FaPaperclip,
    FaArchive,
    FaBoxes
} from "react-icons/fa";
import PropTypes from "prop-types";
import jsPDF from "jspdf";

export function PharmacistReports() {
    const [reportForm, setReportForm] = useState({
        objet: "",
        concerne: "",
        corps: ""
    });

    // Données d'inventaire en attente (venant de la page inventaire)
    const [pendingInventoryData, setPendingInventoryData] = useState(null);

    const personnelList = [
        { id: "ADMIN-001", name: "M. Nkongo Paul", role: "Administrateur" },
        { id: "DIR-001", name: "Dr. Kamdem Jean", role: "Directeur" },
        { id: "MED-001", name: "Dr. Fotso Marie", role: "Médecin Chef" },
        { id: "COMPT-001", name: "M. Dupont Michel", role: "Comptable Matière" },
        { id: "FIN-001", name: "Mme. Lefebvre Anne", role: "Comptable Financier" },
    ];

    const currentUserId = "PHARM-001";
    const currentUserName = "Mme. Tchuente Claire";

    const [sentReports, setSentReports] = useState([
        {
            id: "RPT-2024-020",
            objet: "Stock",
            concerne: "COMPT-001",
            concerneName: "M. Dupont Michel",
            corps: "Suite à l'inventaire du jour, je vous informe que le stock de Paracétamol est en dessous du seuil critique. Il reste 25 boîtes alors que la consommation hebdomadaire est d'environ 50 boîtes. Je recommande une commande urgente.",
            dateEnvoi: "2024-12-22",
            expediteur: currentUserId,
            attachments: null
        }
    ]);

    const [receivedReports, setReceivedReports] = useState([
        {
            id: "RPT-2024-015",
            objet: "Livraison",
            concerne: currentUserId,
            concerneName: currentUserName,
            corps: "Je vous informe qu'une livraison de médicaments est prévue pour demain matin. Merci de préparer la réception et de vérifier les quantités reçues.",
            dateEnvoi: "2024-12-21",
            expediteur: "COMPT-001",
            expediteurName: "M. Dupont Michel",
            isRead: false,
            attachments: null
        }
    ]);

    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Charger les données d'inventaire en attente
    useEffect(() => {
        const storedData = localStorage.getItem('pending_inventory_report');
        if (storedData) {
            const data = JSON.parse(storedData);
            setPendingInventoryData(data);

            // Pré-remplir le formulaire pour un rapport d'inventaire
            setReportForm({
                objet: "Inventaire",
                concerne: "COMPT-001",
                corps: `Suite à l'inventaire effectué le ${new Date(data.dateInventaire).toLocaleDateString('fr-FR')}, veuillez trouver ci-joint:\n\n` +
                    `1. L'état actuel du stock après inventaire\n` +
                    `2. L'archive de l'inventaire (Réf: ${data.archiveId})\n\n` +
                    `Ces documents vous permettront de constater les différences entre l'ancien et le nouveau stock.\n\n` +
                    `Cordialement,\n${currentUserName}`
            });
        }
    }, []);

    function generateReportId() {
        const year = new Date().getFullYear();
        const allReports = [...sentReports, ...receivedReports];
        const existingThisYear = allReports.filter(r => r.id.includes(`RPT-${year}`));
        const nextNumber = existingThisYear.length + 1;
        return `RPT-${year}-${String(nextNumber).padStart(3, '0')}`;
    }

    function handleSubmitReport(e) {
        e.preventDefault();

        const concernedPerson = personnelList.find(p => p.id === reportForm.concerne);

        const newReport = {
            id: generateReportId(),
            objet: reportForm.objet,
            concerne: reportForm.concerne,
            concerneName: concernedPerson ? concernedPerson.name : "",
            corps: reportForm.corps,
            dateEnvoi: new Date().toISOString().split('T')[0],
            expediteur: currentUserId,
            expediteurName: currentUserName,
            attachments: pendingInventoryData ? {
                type: "inventaire",
                archiveId: pendingInventoryData.archiveId,
                etatStock: pendingInventoryData.etatActuelStock,
                archive: pendingInventoryData.archive
            } : null
        };

        setSentReports([newReport, ...sentReports]);

        // Sauvegarder aussi pour le comptable
        const comptableReports = JSON.parse(localStorage.getItem('accountant_received_reports') || '[]');
        localStorage.setItem('accountant_received_reports', JSON.stringify([newReport, ...comptableReports]));

        // Nettoyer les données d'inventaire en attente
        localStorage.removeItem('pending_inventory_report');
        setPendingInventoryData(null);

        setReportForm({ objet: "", concerne: "", corps: "" });
        alert("Rapport envoyé avec succès !");
    }

    function viewReportDetails(report, isReceived = false) {
        setSelectedReport({ ...report, isReceived });
        setShowDetailModal(true);

        if (isReceived && !report.isRead) {
            setReceivedReports(receivedReports.map(r =>
                r.id === report.id ? { ...r, isRead: true } : r
            ));
        }
    }

    function exportReportToPDF(report, isReceived = false) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const maxWidth = pageWidth - 2 * margin;

        doc.setFontSize(18);
        doc.setTextColor(26, 115, 163);
        doc.text("FULTANG CLINIC", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(80, 194, 185);
        doc.text("Rapport Pharmacie", pageWidth / 2, 28, { align: "center" });

        doc.setDrawColor(80, 194, 185);
        doc.setLineWidth(0.5);
        doc.line(margin, 35, pageWidth - margin, 35);

        doc.setFontSize(10);
        doc.setTextColor(0);

        let yPos = 50;

        doc.setFont(undefined, 'bold');
        doc.text("Référence:", margin, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(report.id, margin + 30, yPos);

        yPos += 8;
        doc.setFont(undefined, 'bold');
        doc.text("Date:", margin, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(report.dateEnvoi, margin + 30, yPos);

        yPos += 8;
        doc.setFont(undefined, 'bold');
        doc.text("Objet:", margin, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(report.objet, margin + 30, yPos);

        yPos += 12;
        doc.setFont(undefined, 'bold');
        doc.text("Expéditeur:", margin, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(isReceived ? (report.expediteurName || report.expediteur) : currentUserName, margin + 40, yPos);

        yPos += 8;
        doc.setFont(undefined, 'bold');
        doc.text("Destinataire:", margin, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(report.concerneName || report.concerne, margin + 40, yPos);

        yPos += 10;
        doc.setDrawColor(200);
        doc.line(margin, yPos, pageWidth - margin, yPos);

        yPos += 15;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text("Corps du Rapport:", margin, yPos);

        yPos += 10;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);

        const lines = doc.splitTextToSize(report.corps, maxWidth);
        doc.text(lines, margin, yPos);

        // Si le rapport a des pièces jointes d'inventaire
        if (report.attachments && report.attachments.type === "inventaire") {
            yPos += lines.length * 6 + 15;

            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPos - 5, maxWidth, 25, 'F');

            doc.setFont(undefined, 'bold');
            doc.setFontSize(11);
            doc.text("Pièces jointes:", margin + 5, yPos + 3);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`• Archive d'inventaire: ${report.attachments.archiveId}`, margin + 10, yPos + 12);
            doc.text(`• État du stock: ${report.attachments.etatStock?.length || 0} produits`, margin + 10, yPos + 20);
        }

        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(80, 194, 185);
        doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, pageHeight - 18);
        doc.text("Fultang Clinic - Pharmacie", pageWidth - margin, pageHeight - 18, { align: "right" });

        doc.save(`rapport_${report.id}.pdf`);
    }

    // Exporter l'état du stock d'un rapport
    function exportStockFromReport(report) {
        if (!report.attachments || !report.attachments.etatStock) {
            alert("Aucun état du stock attaché à ce rapport.");
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;

        doc.setFontSize(18);
        doc.setTextColor(26, 115, 163);
        doc.text("FULTANG CLINIC - PHARMACIE", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(80, 194, 185);
        doc.text("État du Stock après Inventaire", pageWidth / 2, 28, { align: "center" });

        doc.setDrawColor(80, 194, 185);
        doc.line(margin, 35, pageWidth - margin, 35);

        let yPos = 45;
        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.text(`Rapport: ${report.id}`, margin, yPos);
        doc.text(`Date: ${report.dateEnvoi}`, pageWidth - margin, yPos, { align: "right" });

        yPos += 15;

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

        report.attachments.etatStock.forEach((med, index) => {
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

        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, pageHeight - 15);
        doc.text("Fultang Clinic - Pharmacie", pageWidth - margin, pageHeight - 15, { align: "right" });

        doc.save(`etat_stock_${report.id}.pdf`);
    }

    // Exporter l'archive d'un rapport
    function exportArchiveFromReport(report) {
        if (!report.attachments || !report.attachments.archive) {
            alert("Aucune archive attachée à ce rapport.");
            return;
        }

        const archive = report.attachments.archive;
        const doc = new jsPDF('landscape');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;

        doc.setFontSize(18);
        doc.setTextColor(26, 115, 163);
        doc.text("FULTANG CLINIC - PHARMACIE", pageWidth / 2, 15, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(80, 194, 185);
        doc.text(`Archive d'Inventaire - ${archive.id}`, pageWidth / 2, 23, { align: "center" });

        doc.setDrawColor(80, 194, 185);
        doc.line(margin, 28, pageWidth - margin, 28);

        let yPos = 35;
        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.text(`Date création: ${new Date(archive.dateCreation).toLocaleDateString('fr-FR')}`, margin, yPos);
        if (archive.dateTermine) {
            doc.text(`Date fin: ${new Date(archive.dateTermine).toLocaleDateString('fr-FR')}`, margin + 80, yPos);
        }

        yPos += 12;

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

        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, pageHeight - 10);
        doc.text("Fultang Clinic - Pharmacie", pageWidth - margin, pageHeight - 10, { align: "right" });

        doc.save(`archive_${archive.id}.pdf`);
    }

    function exportAllSentToPDF() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;

        doc.setFontSize(16);
        doc.setTextColor(26, 115, 163);
        doc.text("Rapports Envoyés - Pharmacie", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Exporté le: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: "center" });

        let yPos = 40;

        sentReports.forEach((report) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFillColor(245, 245, 245);
            doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 25, 'F');

            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.setFont(undefined, 'bold');
            doc.text(`${report.id} - ${report.objet}`, margin + 5, yPos);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            doc.text(`À: ${report.concerneName} | Date: ${report.dateEnvoi}`, margin + 5, yPos + 8);
            doc.text(report.corps.substring(0, 80) + "...", margin + 5, yPos + 16);

            yPos += 32;
        });

        doc.save(`rapports_envoyes_pharmacie_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    function exportAllReceivedToPDF() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;

        doc.setFontSize(16);
        doc.setTextColor(26, 115, 163);
        doc.text("Rapports Reçus - Pharmacie", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Exporté le: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: "center" });

        let yPos = 40;

        receivedReports.forEach((report) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFillColor(245, 245, 245);
            doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 25, 'F');

            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.setFont(undefined, 'bold');
            doc.text(`${report.id} - ${report.objet}`, margin + 5, yPos);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            doc.text(`De: ${report.expediteurName} | Date: ${report.dateEnvoi}`, margin + 5, yPos + 8);
            doc.text(report.corps.substring(0, 80) + "...", margin + 5, yPos + 16);

            yPos += 32;
        });

        doc.save(`rapports_recus_pharmacie_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    function cancelPendingInventory() {
        localStorage.removeItem('pending_inventory_report');
        setPendingInventoryData(null);
        setReportForm({ objet: "", concerne: "", corps: "" });
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
                        <FaFileAlt className="text-4xl text-primary-start" />
                        <h1 className="text-3xl font-bold text-gray-800">Gestion des Rapports</h1>
                    </div>
                </div>

                {/* Alerte si un inventaire est en attente */}
                {pendingInventoryData && (
                    <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FaPaperclip className="text-2xl text-blue-500" />
                            <div className="flex-1">
                                <p className="font-bold text-blue-800">Rapport d'inventaire en attente</p>
                                <p className="text-sm text-blue-600">
                                    Archive: {pendingInventoryData.archiveId} •
                                    {pendingInventoryData.etatActuelStock?.length} produits en stock
                                </p>
                            </div>
                            <button
                                onClick={cancelPendingInventory}
                                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {/* Formulaire de saisie d'un rapport */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaEnvelope className="text-primary-end" />
                        {pendingInventoryData ? "Rédiger le Rapport d'Inventaire" : "Rédiger un Nouveau Rapport"}
                    </h2>
                    <form onSubmit={handleSubmitReport} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Objet *
                                </label>
                                <input
                                    type="text"
                                    maxLength={10}
                                    value={reportForm.objet}
                                    onChange={(e) => setReportForm({ ...reportForm, objet: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent"
                                    placeholder="Objet (max 10 car.)"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">{reportForm.objet.length}/10</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Destinataire *
                                </label>
                                <select
                                    value={reportForm.concerne}
                                    onChange={(e) => setReportForm({ ...reportForm, concerne: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent"
                                    required
                                >
                                    <option value="">Sélectionner</option>
                                    {personnelList.map(person => (
                                        <option key={person.id} value={person.id}>
                                            {person.name} - {person.role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Corps du rapport *
                            </label>
                            <textarea
                                value={reportForm.corps}
                                onChange={(e) => setReportForm({ ...reportForm, corps: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent"
                                placeholder="Rédigez le contenu de votre rapport..."
                                rows="6"
                                required
                            />
                        </div>

                        {/* Pièces jointes si inventaire en attente */}
                        {pendingInventoryData && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <FaPaperclip /> Pièces jointes automatiques:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border">
                                        <FaBoxes className="text-2xl text-green-500" />
                                        <div>
                                            <p className="font-medium text-gray-800">État du Stock</p>
                                            <p className="text-xs text-gray-500">{pendingInventoryData.etatActuelStock?.length} produits</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border">
                                        <FaArchive className="text-2xl text-blue-500" />
                                        <div>
                                            <p className="font-medium text-gray-800">Archive d'Inventaire</p>
                                            <p className="text-xs text-gray-500">{pendingInventoryData.archiveId}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg hover:opacity-90 transition-all"
                            >
                                <FaPaperPlane /> Envoyer
                            </button>
                        </div>
                    </form>
                </div>

                {/* Deux colonnes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rapports envoyés */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaPaperPlane className="text-blue-500" />
                                Rapports Envoyés
                            </h2>
                            <button
                                onClick={exportAllSentToPDF}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                            >
                                <FaFilePdf /> PDF
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-3">
                            {sentReports.length > 0 ? (
                                sentReports.map(report => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        type="sent"
                                        onView={() => viewReportDetails(report, false)}
                                        onExport={() => exportReportToPDF(report, false)}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">Aucun rapport envoyé</p>
                            )}
                        </div>
                    </div>

                    {/* Rapports reçus */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaInbox className="text-green-500" />
                                Rapports Reçus
                                {receivedReports.filter(r => !r.isRead).length > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                        {receivedReports.filter(r => !r.isRead).length}
                                    </span>
                                )}
                            </h2>
                            <button
                                onClick={exportAllReceivedToPDF}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                            >
                                <FaFilePdf /> PDF
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-3">
                            {receivedReports.length > 0 ? (
                                receivedReports.map(report => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        type="received"
                                        onView={() => viewReportDetails(report, true)}
                                        onExport={() => exportReportToPDF(report, true)}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">Aucun rapport reçu</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de détails */}
            {showDetailModal && selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary-end/20 p-2 rounded-full">
                                    <FaFileAlt className="w-5 h-5 text-primary-start" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Détails du Rapport</h2>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">Référence</p>
                                    <p className="font-bold text-gray-800">{selectedReport.id}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">Date</p>
                                    <p className="font-bold text-gray-800">{selectedReport.dateEnvoi}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">Objet</p>
                                <p className="font-bold text-gray-800">{selectedReport.objet}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-600 flex items-center gap-1">
                                        <FaUser /> Expéditeur
                                    </p>
                                    <p className="font-bold text-gray-800">
                                        {selectedReport.isReceived ? selectedReport.expediteurName : "Vous"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        ID: {selectedReport.isReceived ? selectedReport.expediteur : currentUserId}
                                    </p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="text-sm text-green-600 flex items-center gap-1">
                                        <FaUser /> Destinataire
                                    </p>
                                    <p className="font-bold text-gray-800">{selectedReport.concerneName}</p>
                                    <p className="text-xs text-gray-500">ID: {selectedReport.concerne}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2 font-semibold">Corps</p>
                                <p className="text-gray-800 whitespace-pre-wrap">{selectedReport.corps}</p>
                            </div>

                            {/* Pièces jointes */}
                            {selectedReport.attachments && selectedReport.attachments.type === "inventaire" && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-blue-600 mb-3 font-semibold flex items-center gap-2">
                                        <FaPaperclip /> Pièces jointes
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => exportStockFromReport(selectedReport)}
                                            className="flex items-center gap-2 p-3 bg-white rounded-lg border hover:bg-gray-50"
                                        >
                                            <FaBoxes className="text-green-500" />
                                            <div className="text-left">
                                                <p className="font-medium text-sm">État du Stock</p>
                                                <p className="text-xs text-gray-500">Cliquer pour télécharger</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => exportArchiveFromReport(selectedReport)}
                                            className="flex items-center gap-2 p-3 bg-white rounded-lg border hover:bg-gray-50"
                                        >
                                            <FaArchive className="text-blue-500" />
                                            <div className="text-left">
                                                <p className="font-medium text-sm">Archive Inventaire</p>
                                                <p className="text-xs text-gray-500">{selectedReport.attachments.archiveId}</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        exportReportToPDF(selectedReport, selectedReport.isReceived);
                                        setShowDetailModal(false);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                >
                                    <FaFilePdf /> PDF
                                </button>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PharmacistDashBoard>
    );
}

function ReportCard({ report, type, onView, onExport }) {
    ReportCard.propTypes = {
        report: PropTypes.object.isRequired,
        type: PropTypes.oneOf(['sent', 'received']).isRequired,
        onView: PropTypes.func.isRequired,
        onExport: PropTypes.func.isRequired
    };

    const isUnread = type === 'received' && !report.isRead;
    const hasAttachments = report.attachments && report.attachments.type === "inventaire";

    return (
        <div className={`p-4 rounded-lg border-2 transition-all ${isUnread
            ? 'border-green-400 bg-green-50'
            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{report.id}</span>
                        <span className="px-2 py-0.5 bg-primary-end/20 text-primary-start text-xs rounded-full font-semibold">
                            {report.objet}
                        </span>
                        {hasAttachments && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-semibold flex items-center gap-1">
                                <FaPaperclip className="text-xs" /> Pièces jointes
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        {type === 'sent' ? `À: ${report.concerneName}` : `De: ${report.expediteurName}`}
                    </p>
                </div>
                <span className="text-xs text-gray-500">{report.dateEnvoi}</span>
            </div>
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {report.corps.substring(0, 100)}...
            </p>
            <div className="flex gap-2">
                <button
                    onClick={onView}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isUnread
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                >
                    <FaEye /> Voir
                </button>
                <button
                    onClick={onExport}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                >
                    <FaFilePdf /> PDF
                </button>
            </div>
        </div>
    );
}
