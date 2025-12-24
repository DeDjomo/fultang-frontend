"use client"

import { useState, useEffect } from "react";
import { Search, FileText, Printer, Filter, Download, Eye, Calendar } from "lucide-react";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { ReceiptModal } from "./ReceiptModal";
import { sampleEntries } from "../Data/mockFinancialData";

export function ReceiptsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptsList, setReceiptsList] = useState([]);

    useEffect(() => {
        // Load data from localStorage to get the latest entries including new ones
        const storedEntries = localStorage.getItem('financialEntries');
        let allEntries = [];

        if (storedEntries) {
            allEntries = JSON.parse(storedEntries);
        } else {
            // Fallback to static data if not yet initialized in localStorage
            allEntries = sampleEntries;
        }

        // Filter only Validated entries
        const validated = allEntries.filter(entry => entry.status === "Validée");
        setReceiptsList(validated);
    }, []);

    const filteredReceipts = receiptsList.filter(receipt => {
        const receiptDate = new Date(receipt.date);
        const receiptYear = receiptDate.getFullYear().toString();
        const receiptMonth = (receiptDate.getMonth() + 1).toString().padStart(2, '0');
        const receiptDay = receiptDate.getDate().toString().padStart(2, '0');

        const matchesSearch = receipt.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.generalLabel.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesYear = !selectedYear || receiptYear === selectedYear;
        const matchesMonth = !selectedMonth || receiptMonth === selectedMonth;
        const matchesDay = !selectedDay || receiptDay === selectedDay;

        return matchesSearch && matchesYear && matchesMonth && matchesDay;
    });

    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
    const months = [
        { value: "01", label: "Janvier" }, { value: "02", label: "Février" }, { value: "03", label: "Mars" },
        { value: "04", label: "Avril" }, { value: "05", label: "Mai" }, { value: "06", label: "Juin" },
        { value: "07", label: "Juillet" }, { value: "08", label: "Août" }, { value: "09", label: "Septembre" },
        { value: "10", label: "Octobre" }, { value: "11", label: "Novembre" }, { value: "12", label: "Décembre" }
    ];
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const handleOpenReceipt = (entry) => {
        setSelectedEntry(entry);
        setShowReceiptModal(true);
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="bg-white min-h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl text-white p-8 mb-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold mb-2 flex items-center">
                                <FileText className="mr-3 h-8 w-8" />
                                Gestion des Quittances
                            </h1>
                            <p className="opacity-90">Consultez, imprimez et téléchargez les reçus de paiement validés.</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-gray-100 rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
                        <div className="flex items-center mb-4">
                            <Filter className="h-6 w-6 text-teal-800 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-800">Filtres de recherche</h2>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
                            <div className="flex-grow w-full md:w-auto relative min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="text"
                                        placeholder="N° Quittance, Libellé, Client..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-800 focus:border-teal-800 transition-all hover:border-teal-800"
                                    />
                                </div>
                            </div>

                            {/* Date Selectors */}
                            <div className="w-full md:w-auto min-w-[120px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-800 focus:border-teal-800 bg-white"
                                >
                                    <option value="">Année</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="w-full md:w-auto min-w-[140px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-800 focus:border-teal-800 bg-white"
                                >
                                    <option value="">Mois</option>
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </div>

                            <div className="w-full md:w-auto min-w-[100px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jour</label>
                                <select
                                    value={selectedDay}
                                    onChange={(e) => setSelectedDay(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-800 focus:border-teal-800 bg-white"
                                >
                                    <option value="">Jour</option>
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div className="w-full md:w-auto">
                                <button
                                    onClick={() => { setSearchTerm(""); setSelectedYear(""); setSelectedMonth(""); setSelectedDay(""); }}
                                    className="px-6 py-3 text-sm text-teal-600 font-medium hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100 h-full w-full md:w-auto"
                                    title="Réinitialiser tous les filtres"
                                >
                                    Réinitialiser
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-teal-600 to-teal-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider rounded-tl-2xl">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">N° Quittance</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Libellé / Objet</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-white uppercase tracking-wider">Montant</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider rounded-tr-2xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredReceipts.length > 0 ? (
                                    filteredReceipts.map((receipt) => (
                                        <tr key={receipt.id} className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-300 group">
                                            <td className="px-6 py-4 whitespace-nowrap border-l-4 border-green-500">
                                                <div className="text-sm text-gray-900 font-medium">{new Date(receipt.date).toLocaleDateString('fr-FR')}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-teal-700 font-bold whitespace-nowrap">
                                                {receipt.reference}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {receipt.patientName || <span className="text-gray-400 italic">Non spécifié</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                {receipt.generalLabel}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-green-600 font-bold text-right whitespace-nowrap">
                                                {formatAmount(receipt.totalDebit)}
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => handleOpenReceipt(receipt)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 shadow-sm text-teal-700 text-sm font-medium rounded-lg hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all transform hover:scale-105"
                                                    title="Imprimer / Télécharger"
                                                >
                                                    <Printer size={16} className="mr-2" />
                                                    Quittance
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <Search size={48} className="mb-4 opacity-20" />
                                                <p className="text-lg">Aucune quittance trouvée pour ces critères.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showReceiptModal && (
                    <ReceiptModal
                        entry={selectedEntry}
                        onClose={() => setShowReceiptModal(false)}
                    />
                )}
            </div>
        </AccountantDashBoard>
    );
}
