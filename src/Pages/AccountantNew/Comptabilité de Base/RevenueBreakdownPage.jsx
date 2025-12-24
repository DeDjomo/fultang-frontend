"use client"

import { useState, useEffect } from "react";
import { Search, Download, BarChart3 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";

export function RevenueBreakdownPage() {
    const [ventilatedRows, setVentilatedRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Set default to July 2024 to match sample data
    const [selectedYear, setSelectedYear] = useState("2024");
    const [selectedMonth, setSelectedMonth] = useState("07");

    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
    const months = [
        { value: "01", label: "Janvier" }, { value: "02", label: "Février" },
        { value: "03", label: "Mars" }, { value: "04", label: "Avril" },
        { value: "05", label: "Mai" }, { value: "06", label: "Juin" },
        { value: "07", label: "Juillet" }, { value: "08", label: "Août" },
        { value: "09", label: "Septembre" }, { value: "10", label: "Octobre" },
        { value: "11", label: "Novembre" }, { value: "12", label: "Décembre" }
    ];

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "-";
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    useEffect(() => {
        // Load from localStorage
        const storedEntries = localStorage.getItem('financialEntries');
        let allEntries = [];

        if (storedEntries) {
            allEntries = JSON.parse(storedEntries);
        }

        const processedRows = [];

        // Filter only Validated entries
        const validated = allEntries.filter(e => e.status === "Validée");

        validated.forEach(entry => {
            const entryDate = new Date(entry.date);
            const entryYear = entryDate.getFullYear().toString();
            const entryMonth = (entryDate.getMonth() + 1).toString().padStart(2, '0');

            // Apply filters
            if (selectedYear && entryYear !== selectedYear) return;
            if (selectedMonth && entryMonth !== selectedMonth) return;

            // Search filter
            if (searchTerm &&
                !entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !entry.generalLabel.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !(entry.patientName || "").toLowerCase().includes(searchTerm.toLowerCase())) return;

            // Check if this entry has revenue (credit in class 7 accounts)
            let hasRevenue = false;
            entry.lines.forEach(line => {
                const amount = parseFloat(line.credit || 0);
                if (amount > 0 && line.accountId.startsWith('7')) {
                    hasRevenue = true;
                }
            });

            if (hasRevenue && entry.revenueCategory) {
                // Use revenueCategory to categorize
                const category = entry.revenueCategory;
                const totalAmount = entry.totalCredit || entry.totalDebit || 0;

                let consultation = 0;
                let pharmacie = 0;
                let hospitalisation = 0;
                let autre = 0;

                if (category === "Consultation") {
                    consultation = totalAmount;
                } else if (category === "Pharmacie") {
                    pharmacie = totalAmount;
                } else if (category === "Hospitalisation") {
                    hospitalisation = totalAmount;
                } else {
                    autre = totalAmount;
                }

                processedRows.push({
                    id: entry.id,
                    date: entry.date,
                    reference: entry.reference,
                    patient: entry.patientName || "---",
                    label: entry.generalLabel,
                    consultation,
                    pharmacie,
                    hospitalisation,
                    autre,
                    total: totalAmount
                });
            }
        });

        processedRows.sort((a, b) => new Date(a.date) - new Date(b.date));
        setVentilatedRows(processedRows);

    }, [selectedYear, selectedMonth, searchTerm]);

    const generatePDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');

        doc.setFontSize(16);
        doc.text("JOURNAL DE VENTILATION DES RECETTES", 148, 15, { align: 'center' });

        doc.setFontSize(10);
        const monthLabel = months.find(m => m.value === selectedMonth)?.label;
        doc.text(`Période : ${monthLabel} ${selectedYear}`, 14, 25);
        doc.text("HGR : Fultang Hospital", 14, 30);

        const tableColumn = [
            "DATE", "N° QUITTANCE", "PATIENT", "LIBELLÉ",
            "CONSULTATION", "PHARMACIE", "HOSPITALISATION", "AUTRE", "TOTAL"
        ];

        const tableRows = [];
        let totConsultation = 0;
        let totPharmacie = 0;
        let totHospi = 0;
        let totAutres = 0;
        let totGlobal = 0;

        ventilatedRows.forEach(row => {
            totConsultation += row.consultation;
            totPharmacie += row.pharmacie;
            totHospi += row.hospitalisation;
            totAutres += row.autre;
            totGlobal += row.total;

            tableRows.push([
                new Date(row.date).toLocaleDateString('fr-FR'),
                row.reference,
                row.patient,
                row.label,
                row.consultation ? formatCurrency(row.consultation) : "-",
                row.pharmacie ? formatCurrency(row.pharmacie) : "-",
                row.hospitalisation ? formatCurrency(row.hospitalisation) : "-",
                row.autre ? formatCurrency(row.autre) : "-",
                formatCurrency(row.total)
            ]);
        });

        tableRows.push([
            "", "", "", "TOTAUX",
            formatCurrency(totConsultation),
            formatCurrency(totPharmacie),
            formatCurrency(totHospi),
            formatCurrency(totAutres),
            formatCurrency(totGlobal)
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74] },
            styles: { fontSize: 7 },
            columnStyles: {
                4: { halign: 'right' },
                5: { halign: 'right' },
                6: { halign: 'right' },
                7: { halign: 'right' },
                8: { halign: 'right', fontStyle: 'bold' },
            },
            didParseCell: (data) => {
                if (data.row.index === tableRows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [240, 253, 244];
                }
            }
        });

        doc.save(`Journal_Ventilation_${selectedMonth}_${selectedYear}.pdf`);
    };

    const totals = ventilatedRows.reduce((acc, row) => ({
        consultation: acc.consultation + row.consultation,
        pharmacie: acc.pharmacie + row.pharmacie,
        hospitalisation: acc.hospitalisation + row.hospitalisation,
        autre: acc.autre + row.autre,
        total: acc.total + row.total
    }), { consultation: 0, pharmacie: 0, hospitalisation: 0, autre: 0, total: 0 });

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="bg-white min-h-screen p-4 md:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-2xl text-white p-8 mb-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold mb-2 flex items-center">
                                    <BarChart3 className="mr-3 h-8 w-8" />
                                    Journal de Ventilation des Recettes
                                </h1>
                                <p className="opacity-90">Analyse détaillée des revenus par catégorie</p>
                            </div>
                            <button
                                onClick={generatePDF}
                                disabled={ventilatedRows.length === 0}
                                className="mt-4 md:mt-0 flex items-center bg-white text-green-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download size={20} className="mr-2" /> Exporter PDF
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="text"
                                        placeholder="N° Quittance, Patient, Libellé..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white"
                                >
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white"
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase">Date</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase">N° Quittance</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase">Patient</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase">Libellé</th>
                                        <th className="px-6 py-4 text-right font-semibold text-blue-600 uppercase bg-blue-50">Consultation</th>
                                        <th className="px-6 py-4 text-right font-semibold text-purple-600 uppercase bg-purple-50">Pharmacie</th>
                                        <th className="px-6 py-4 text-right font-semibold text-orange-600 uppercase bg-orange-50">Hospitalisation</th>
                                        <th className="px-6 py-4 text-right font-semibold text-gray-600 uppercase">Autre</th>
                                        <th className="px-6 py-4 text-right font-bold text-gray-800 uppercase bg-gray-50">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {ventilatedRows.length > 0 ? (
                                        ventilatedRows.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                                                    {new Date(row.date).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-green-700 font-bold">
                                                    {row.reference}
                                                </td>
                                                <td className="px-6 py-4 text-gray-900">
                                                    {row.patient}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                                    {row.label}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-blue-700 bg-blue-50/30">
                                                    {row.consultation ? formatCurrency(row.consultation) : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-purple-700 bg-purple-50/30">
                                                    {row.pharmacie ? formatCurrency(row.pharmacie) : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-orange-700 bg-orange-50/30">
                                                    {row.hospitalisation ? formatCurrency(row.hospitalisation) : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-500">
                                                    {row.autre ? formatCurrency(row.autre) : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900 bg-gray-50">
                                                    {formatCurrency(row.total)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                                                <p className="text-lg">Aucune recette avec catégorie trouvée pour cette période.</p>
                                                <p className="text-sm mt-2">Astuce: Créez des écritures de recettes et sélectionnez une catégorie dans le formulaire.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {ventilatedRows.length > 0 && (
                                    <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-200">
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-right text-gray-700 uppercase">TOTAUX GÉNÉRAUX</td>
                                            <td className="px-6 py-4 text-right text-blue-800 bg-blue-100">{formatCurrency(totals.consultation)}</td>
                                            <td className="px-6 py-4 text-right text-purple-800 bg-purple-100">{formatCurrency(totals.pharmacie)}</td>
                                            <td className="px-6 py-4 text-right text-orange-800 bg-orange-100">{formatCurrency(totals.hospitalisation)}</td>
                                            <td className="px-6 py-4 text-right text-gray-800">{formatCurrency(totals.autre)}</td>
                                            <td className="px-6 py-4 text-right text-black bg-gray-200 text-lg">{formatCurrency(totals.total)}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AccountantDashBoard>
    );
}
