import { DirectorDashBoard } from "./Components/DirectorDashboard";
import { DirectorNavLink } from "./DirectorNavLink";
import { DirectorNavBar } from "./Components/DirectorNavBar";
import { useState } from "react";
import {
    FaFileAlt,
    FaPaperPlane,
    FaFilePdf,
    FaEye,
    FaTimes,
    FaInbox,
    FaEnvelope,
    FaUser
} from "react-icons/fa";
import PropTypes from "prop-types";
import jsPDF from "jspdf";

export function DirectorReports() {
    // État pour le formulaire de nouveau rapport
    const [reportForm, setReportForm] = useState({
        objet: "",
        concerne: "",
        corps: ""
    });

    // Liste du personnel de l'hôpital (mockée)
    const personnelList = [
        { id: "ADMIN-001", name: "M. Nkongo Paul", role: "Administrateur" },
        { id: "MED-001", name: "Dr. Fotso Marie", role: "Médecin Chef" },
        { id: "PHARM-001", name: "Mme. Tchuente Claire", role: "Pharmacienne" },
        { id: "LAB-001", name: "M. Biya Charles", role: "Chef Laboratoire" },
        { id: "COMPT-001", name: "M. Dupont Michel", role: "Comptable Matière" },
        { id: "FIN-001", name: "Mme. Lefebvre Anne", role: "Comptable Financier" },
        { id: "RH-001", name: "M. Martin Pierre", role: "Ressources Humaines" },
    ];

    // ID du directeur connecté (simulé)
    const currentUserId = "DIR-001";
    const currentUserName = "Dr. Kamdem Jean";

    // Rapports envoyés par le directeur
    const [sentReports, setSentReports] = useState([
        {
            id: "RPT-2024-010",
            objet: "Validation",
            concerne: "COMPT-001",
            concerneName: "M. Dupont Michel",
            corps: "Suite à votre rapport sur le stock de gants médicaux, je vous autorise à passer une commande urgente de 500 unités. Veuillez contacter le fournisseur habituel et me transmettre le bon de commande pour validation.",
            dateEnvoi: "2024-12-21",
            expediteur: currentUserId
        },
        {
            id: "RPT-2024-011",
            objet: "Directive",
            concerne: "ADMIN-001",
            concerneName: "M. Nkongo Paul",
            corps: "Veuillez organiser une réunion du comité de gestion pour le 28 décembre 2024. L'ordre du jour portera sur le bilan annuel et les prévisions budgétaires 2025.",
            dateEnvoi: "2024-12-20",
            expediteur: currentUserId
        }
    ]);

    // Rapports reçus par le directeur
    const [receivedReports, setReceivedReports] = useState([
        {
            id: "RPT-2024-001",
            objet: "Stock",
            concerne: currentUserId,
            concerneName: currentUserName,
            corps: "Suite à l'inventaire effectué ce jour, je vous informe que le stock de gants médicaux est critique. Il reste seulement 50 unités alors que la consommation mensuelle moyenne est de 200 unités. Je recommande une commande urgente.",
            dateEnvoi: "2024-12-20",
            expediteur: "COMPT-001",
            expediteurName: "M. Dupont Michel",
            isRead: true
        },
        {
            id: "RPT-2024-012",
            objet: "Budget",
            concerne: currentUserId,
            concerneName: currentUserName,
            corps: "Je vous transmets le rapport financier du mois de décembre. Les dépenses sont en hausse de 15% par rapport au mois précédent, principalement dues aux achats de matériel médical.",
            dateEnvoi: "2024-12-22",
            expediteur: "FIN-001",
            expediteurName: "Mme. Lefebvre Anne",
            isRead: false
        },
        {
            id: "RPT-2024-013",
            objet: "Urgence",
            concerne: currentUserId,
            concerneName: currentUserName,
            corps: "Nous avons besoin urgemment de 3 nouveaux stéthoscopes pour le service cardiologie. Les équipements actuels présentent des défauts et ne permettent plus un diagnostic précis.",
            dateEnvoi: "2024-12-23",
            expediteur: "MED-001",
            expediteurName: "Dr. Fotso Marie",
            isRead: false
        }
    ]);

    // État pour le modal de détails
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

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
            expediteur: currentUserId
        };

        setSentReports([newReport, ...sentReports]);
        setReportForm({ objet: "", concerne: "", corps: "" });
        alert("Rapport envoyé avec succès !");
    }

    function viewReportDetails(report, isReceived = false) {
        setSelectedReport({ ...report, isReceived });
        setShowDetailModal(true);

        // Si c'est un rapport reçu et non lu, le marquer comme lu
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

        // En-tête
        doc.setFontSize(18);
        doc.setTextColor(26, 115, 163);
        doc.text("FULTANG CLINIC", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(80, 194, 185);
        doc.text("Rapport Officiel", pageWidth / 2, 28, { align: "center" });

        // Ligne de séparation
        doc.setDrawColor(80, 194, 185);
        doc.setLineWidth(0.5);
        doc.line(margin, 35, pageWidth - margin, 35);

        // Informations du rapport
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
        doc.text("Expéditeur (ID):", margin, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(isReceived ? report.expediteur : currentUserId, margin + 40, yPos);

        yPos += 8;
        doc.setFont(undefined, 'bold');
        doc.text("Destinataire (ID):", margin, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(report.concerne, margin + 45, yPos);

        // Ligne de séparation
        yPos += 10;
        doc.setDrawColor(200);
        doc.line(margin, yPos, pageWidth - margin, yPos);

        // Corps du rapport
        yPos += 15;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text("Corps du Rapport:", margin, yPos);

        yPos += 10;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);

        // Diviser le texte en lignes pour le wrapper
        const lines = doc.splitTextToSize(report.corps, maxWidth);
        doc.text(lines, margin, yPos);

        // Pied de page
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(80, 194, 185);
        doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, margin, pageHeight - 18);
        doc.text("Fultang Clinic - Direction", pageWidth - margin, pageHeight - 18, { align: "right" });

        // Télécharger
        doc.save(`rapport_${report.id}.pdf`);
    }

    function exportAllSentToPDF() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;

        // Titre
        doc.setFontSize(16);
        doc.setTextColor(26, 115, 163);
        doc.text("Liste des Rapports Envoyés", pageWidth / 2, 20, { align: "center" });

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

        doc.save(`rapports_envoyes_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    function exportAllReceivedToPDF() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;

        doc.setFontSize(16);
        doc.setTextColor(26, 115, 163);
        doc.text("Liste des Rapports Reçus", pageWidth / 2, 20, { align: "center" });

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

        doc.save(`rapports_recus_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    return (
        <DirectorDashBoard
            linkList={DirectorNavLink}
            requiredRole={"Director"}
        >
            <DirectorNavBar />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaFileAlt className="text-4xl text-primary-start" />
                        <h1 className="text-3xl font-bold text-gray-800">Gestion des Rapports</h1>
                    </div>
                </div>

                {/* Formulaire de saisie d'un rapport */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaEnvelope className="text-primary-end" />
                        Rédiger un Nouveau Rapport
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
                                    placeholder="Objet du rapport (max 10 car.)"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">{reportForm.objet.length}/10 caractères</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Concerné *
                                </label>
                                <select
                                    value={reportForm.concerne}
                                    onChange={(e) => setReportForm({ ...reportForm, concerne: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-transparent"
                                    required
                                >
                                    <option value="">Sélectionner un destinataire</option>
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
                                placeholder="Rédigez le contenu de votre rapport ici..."
                                rows="6"
                                required
                            />
                        </div>
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

                {/* Deux colonnes : Rapports envoyés et Rapports reçus */}
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
                                <FaFilePdf /> Exporter PDF
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
                                        {receivedReports.filter(r => !r.isRead).length} nouveau(x)
                                    </span>
                                )}
                            </h2>
                            <button
                                onClick={exportAllReceivedToPDF}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                            >
                                <FaFilePdf /> Exporter PDF
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
                                className="text-gray-500 hover:text-gray-700 transition-colors"
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
                                    <p className="text-sm text-gray-600">Date d&apos;envoi</p>
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
                                <p className="text-sm text-gray-600 mb-2 font-semibold">Corps du rapport</p>
                                <p className="text-gray-800 whitespace-pre-wrap">{selectedReport.corps}</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        exportReportToPDF(selectedReport, selectedReport.isReceived);
                                        setShowDetailModal(false);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                >
                                    <FaFilePdf /> Télécharger PDF
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
        </DirectorDashBoard>
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
