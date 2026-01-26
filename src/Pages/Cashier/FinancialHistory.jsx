import { useState, useEffect } from 'react';
import { DashBoard } from '../../GlobalComponents/DashBoard';
import { CashierNavBar } from './CashierNavBar';
import { cashierNavLink } from './cashierNavLink';
import { getFilteredQuittances } from '../../services/quittancesApi';
import { Calendar, TrendingUp, DollarSign, Filter, Search } from 'lucide-react';
import Loader from '../../GlobalComponents/Loader';

export default function FinancialHistory() {
    const [period, setPeriod] = useState('day'); // 'day', 'week', 'month'
    const [data, setData] = useState({ quittances: [], total: 0, count: 0 });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getFilteredQuittances(period);
            setData(response);
        } catch (error) {
            console.error('Error fetching financial history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPeriodLabel = () => {
        switch (period) {
            case 'day': return "Today's Receipts";
            case 'week': return "This Week's Receipts";
            case 'month': return "This Month's Receipts";
            default: return "All Receipts";
        }
    };

    const filteredQuittances = (data.quittances || []).filter(q =>
        q.numero_quittance.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.Motif.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashBoard linkList={cashierNavLink} /* requiredRole="Cashier" */>
            <CashierNavBar />
            <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-primary-end" />
                            Financial History
                        </h1>
                        <p className="text-gray-500 mt-1">Track and analyze financial transactions</p>
                    </div>
                </div>

                {/* Filters & Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Period Filter Card */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2">
                        <h3 className="text-gray-500 font-semibold mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Select Period
                        </h3>
                        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-lg">
                            {['day', 'week', 'month'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 capitalize ${period === p
                                            ? 'bg-white text-primary-end shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Total Revenue Card */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-green-100 font-medium mb-1">Total Revenue</p>
                                <h3 className="text-3xl font-bold">
                                    {loading ? '...' : `${data.total?.toLocaleString() || 0} FCFA`}
                                </h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-green-100 text-sm">
                            For {getPeriodLabel().toLowerCase()}
                        </p>
                    </div>

                    {/* Transaction Count Card */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-blue-100 font-medium mb-1">Transactions</p>
                                <h3 className="text-3xl font-bold">
                                    {loading ? '...' : data.count || 0}
                                </h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-blue-100 text-sm">
                            Receipts issued
                        </p>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">{getPeriodLabel()}</h2>

                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search receipt..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-end/20 focus:border-primary-end"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-64 flex justify-center items-center">
                            <Loader size="medium" color="primary-end" />
                        </div>
                    ) : (data.quittances && data.quittances.length > 0) ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt No</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredQuittances.map((q) => (
                                        <tr key={q.idQuittance} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 bg-primary-end/10 text-primary-end rounded-full text-sm font-semibold">
                                                    {q.numero_quittance}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {new Date(q.date_paiement).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {q.Motif}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-800">
                                                {parseFloat(q.Montant_paye).toLocaleString()} FCFA
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <DollarSign className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No receipts found for this period</p>
                        </div>
                    )}
                </div>
            </div>
        </DashBoard>
    );
}
