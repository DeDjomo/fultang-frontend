import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { FileText, Calendar, DollarSign, Activity, Users, Download, TrendingUp } from "lucide-react"
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import { cashierNavLink } from "./cashierNavLink.js";
import { CashierNavBar } from "./CashierNavBar.jsx";
import { getFinancialStats } from "../../services/quittancesApi";
import Loader from "../../GlobalComponents/Loader";


export function FinancialReport() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const response = await getFinancialStats();
            setStats(response);
        } catch (error) {
            console.error('Error fetching financial report stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = () => {
        window.print();
    }

    if (loading) {
        return (
            <DashBoard linkList={cashierNavLink} /* requiredRole={"Cashier"} */>
                <CashierNavBar />
                <div className="flex justify-center items-center h-[80vh]">
                    <Loader size="large" color="primary-end" />
                </div>
            </DashBoard>
        )
    }

    return (
        <DashBoard linkList={cashierNavLink} /* requiredRole={"Cashier"} */>

            <CashierNavBar />


            <div className="mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-primary-end" />
                            Financial Report
                        </h1>
                        <p className="text-gray-500 mt-1">Overview of hospital financial performance</p>
                    </div>
                    <button
                        onClick={handleGeneratePDF}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Print Report
                    </button>
                </div>

                {/* KPI Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {/* Total Revenue */}
                        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Revenue</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                        {stats.global?.montant_total?.toLocaleString() || 0} FCFA
                                    </h3>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <p className="text-xs text-green-600 font-medium flex items-center">
                                <Activity className="w-3 h-3 mr-1" />
                                Lifetime earnings
                            </p>
                        </div>

                        {/* Monthly Revenue */}
                        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">This Month</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                        {stats.ce_mois?.total?.toLocaleString() || 0} FCFA
                                    </h3>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-xs text-blue-600 font-medium">
                                {stats.ce_mois?.count || 0} transactions
                            </p>
                        </div>

                        {/* Today's Revenue */}
                        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Today</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                        {stats.aujourdhui?.total?.toLocaleString() || 0} FCFA
                                    </h3>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <Activity className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-xs text-purple-600 font-medium">
                                {stats.aujourdhui?.count || 0} transactions today
                            </p>
                        </div>

                        {/* Total Transactions */}
                        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Receipts</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                        {stats.global?.total_quittances || 0}
                                    </h3>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <FileText className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                Issued receipts
                            </p>
                        </div>
                    </div>
                )}

                {/* Coming Soon Section for Detailed Charts */}
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">Detailed Analytics Coming Soon</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        We are currently gathering more financial data to provide you with detailed charts and trend analysis.
                        Check back later for visual insights on consultations vs exams revenue.
                    </p>
                </div>

            </div>
        </DashBoard>
    )
}

