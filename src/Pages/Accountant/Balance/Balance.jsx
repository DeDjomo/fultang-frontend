/**
 * Balance des Comptes - Accountant Module
 * Displays the balance of all accounts with debit/credit totals
 */
import { accountantNavLink } from "../NavLinks.js";
import { AccountantNavBar } from "../NavBar.jsx";
import { DashBoard } from "../../../GlobalComponents/DashBoard.jsx";
import { useState, useEffect } from "react";
import { message } from "antd";
import { getBalance } from "../../../services/accountantApi.js";
import { FaBalanceScale, FaDownload, FaFilter } from "react-icons/fa";

export function BalancePage() {
    const [balance, setBalance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        date_debut: '',
        date_fin: '',
        classe: ''
    });
    const [totals, setTotals] = useState({
        totalDebit: 0,
        totalCredit: 0
    });

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        setLoading(true);
        try {
            const data = await getBalance(filters);
            const balanceData = data.balance || data || [];
            setBalance(balanceData);

            const totalDebit = balanceData.reduce((sum, item) => sum + (parseFloat(item.total_debit) || 0), 0);
            const totalCredit = balanceData.reduce((sum, item) => sum + (parseFloat(item.total_credit) || 0), 0);
            setTotals({ totalDebit, totalCredit });
        } catch (error) {
            console.error('Error fetching balance:', error);
            message.error('Erreur lors du chargement de la balance');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';
    };

    const getSoldeType = (debit, credit) => {
        const solde = (parseFloat(debit) || 0) - (parseFloat(credit) || 0);
        if (solde > 0) return { value: solde, type: 'Débiteur', color: 'text-blue-600 bg-blue-100' };
        if (solde < 0) return { value: Math.abs(solde), type: 'Créditeur', color: 'text-green-600 bg-green-100' };
        return { value: 0, type: '-', color: 'text-gray-500 bg-gray-100' };
    };

    const exportToCSV = () => {
        const headers = ['Compte', 'Libellé', 'Classe', 'Débit', 'Crédit', 'Solde', 'Type'];
        const rows = balance.map(item => {
            const soldeInfo = getSoldeType(item.total_debit, item.total_credit);
            return [item.numero_compte, item.libelle, item.classe, item.total_debit || 0, item.total_credit || 0, soldeInfo.value, soldeInfo.type];
        });
        const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `balance_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        message.success('Export CSV téléchargé');
    };

    return (
        <DashBoard linkList={accountantNavLink} requiredRole={"comptable"}>
            <AccountantNavBar />
            <div className="flex flex-col p-5">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                        <FaBalanceScale className="text-purple-600 text-3xl" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Balance des Comptes</h1>
                            <p className="text-gray-500 text-sm">Synthèse des mouvements par compte comptable</p>
                        </div>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        <FaDownload /> Exporter CSV
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-lg p-4 mb-5">
                    <div className="flex items-center gap-2 mb-3">
                        <FaFilter className="text-purple-500" />
                        <span className="font-medium">Filtres</span>
                    </div>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Date début</label>
                            <input
                                type="date"
                                value={filters.date_debut}
                                onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
                                className="border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Date fin</label>
                            <input
                                type="date"
                                value={filters.date_fin}
                                onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
                                className="border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Classe</label>
                            <select
                                value={filters.classe}
                                onChange={(e) => setFilters({ ...filters, classe: e.target.value })}
                                className="border rounded-lg px-3 py-2"
                            >
                                <option value="">Toutes</option>
                                <option value="1">Classe 1 - Capitaux</option>
                                <option value="2">Classe 2 - Immobilisations</option>
                                <option value="3">Classe 3 - Stocks</option>
                                <option value="4">Classe 4 - Tiers</option>
                                <option value="5">Classe 5 - Trésorerie</option>
                                <option value="6">Classe 6 - Charges</option>
                                <option value="7">Classe 7 - Produits</option>
                            </select>
                        </div>
                        <button onClick={fetchBalance} className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg">
                            Appliquer
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                    <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-500">
                        <p className="text-gray-500 text-sm">Total Débits</p>
                        <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.totalDebit)}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-green-500">
                        <p className="text-gray-500 text-sm">Total Crédits</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(totals.totalCredit)}</p>
                    </div>
                    <div className={`bg-white rounded-lg shadow-lg p-4 border-l-4 ${totals.totalDebit === totals.totalCredit ? 'border-purple-500' : 'border-red-500'}`}>
                        <p className="text-gray-500 text-sm">Équilibre</p>
                        <p className={`text-xl font-bold ${totals.totalDebit === totals.totalCredit ? 'text-purple-600' : 'text-red-600'}`}>
                            {totals.totalDebit === totals.totalCredit ? '✓ Équilibré' : '⚠ Déséquilibre'}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-orange-500">
                        <p className="text-gray-500 text-sm">Nombre de comptes</p>
                        <p className="text-xl font-bold text-orange-600">{balance.length}</p>
                    </div>
                </div>

                {/* Balance Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-gray-500">Chargement...</div>
                    ) : balance.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            <FaBalanceScale className="text-5xl mx-auto mb-3 text-gray-300" />
                            <p>Aucun mouvement enregistré</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Compte</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Libellé</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Classe</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-blue-600">Débit</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-green-600">Crédit</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Solde</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {balance.map((item, index) => {
                                    const soldeInfo = getSoldeType(item.total_debit, item.total_credit);
                                    return (
                                        <tr key={item.id || index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-bold text-purple-600">{item.numero_compte}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{item.libelle}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs">{item.classe}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">
                                                {new Intl.NumberFormat('fr-FR').format(item.total_debit || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                                                {new Intl.NumberFormat('fr-FR').format(item.total_credit || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-bold">
                                                {new Intl.NumberFormat('fr-FR').format(soldeInfo.value)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${soldeInfo.color}`}>
                                                    {soldeInfo.type}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gray-100 font-bold">
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right">TOTAUX</td>
                                    <td className="px-4 py-3 text-right text-blue-600">{new Intl.NumberFormat('fr-FR').format(totals.totalDebit)}</td>
                                    <td className="px-4 py-3 text-right text-green-600">{new Intl.NumberFormat('fr-FR').format(totals.totalCredit)}</td>
                                    <td className="px-4 py-3 text-right">{new Intl.NumberFormat('fr-FR').format(Math.abs(totals.totalDebit - totals.totalCredit))}</td>
                                    <td className="px-4 py-3 text-center text-sm">
                                        {totals.totalDebit > totals.totalCredit ? 'Débiteur' : totals.totalDebit < totals.totalCredit ? 'Créditeur' : '-'}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            </div>
        </DashBoard>
    );
}

export default BalancePage;
