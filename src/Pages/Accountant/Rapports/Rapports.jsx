/**
 * Rapports Financiers - Accountant Module
 * Financial reports with charts, period comparison, and print functionality
 */
import { accountantNavLink } from "../NavLinks.js";
import { AccountantNavBar } from "../NavBar.jsx";
import { DashBoard } from "../../../GlobalComponents/DashBoard.jsx";
import { useState, useEffect, useRef } from "react";
import { message } from "antd";
import {
    getStatistiquesAvancees,
    getBalance
} from "../../../services/accountantApi.js";
import {
    FaFileAlt, FaPrint, FaChartBar, FaChartLine,
    FaArrowUp, FaArrowDown, FaSync
} from "react-icons/fa";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export function RapportsPage() {
    const printRef = useRef();
    const [loading, setLoading] = useState(true);
    const [periodType, setPeriodType] = useState('mois');
    const [stats, setStats] = useState({
        periode: { actuel: {}, precedent: {}, variation: 0 },
        parType: [],
        parMode: [],
        evolution: [],
        annees: []
    });
    const [balance, setBalance] = useState({
        produits: 0,
        charges: 0,
        resultat: 0,
        tresorerie: 0
    });

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F'];
    const TYPE_LABELS = {
        'soins': 'Soins Infirmiers',
        'consultation': 'Consultations',
        'examens': 'Examens',
        'pharmacie': 'Pharmacie',
        'autre': 'Autres'
    };
    const MODE_LABELS = {
        'especes': 'Espèces',
        'mobile_money': 'Mobile Money',
        'virement': 'Virement',
        'cheque': 'Chèque',
        'carte': 'Carte Bancaire'
    };

    useEffect(() => {
        loadData();
    }, [periodType]);

    const loadData = async () => {
        setLoading(true);
        try {
            console.log('📊 Loading real report data for period:', periodType);

            // Fetch advanced statistics (real data)
            const statsData = await getStatistiquesAvancees(periodType);
            console.log('✅ Real Stats:', statsData);

            // Fetch balance for financial statements
            const balanceData = await getBalance({});
            const balanceArray = balanceData?.balance || (Array.isArray(balanceData) ? balanceData : []);

            // Calculate financial positions from balance
            const produits = balanceArray
                .filter(c => c.classe === '7')
                .reduce((sum, c) => sum + (parseFloat(c.total_credit) || 0), 0);
            const charges = balanceArray
                .filter(c => c.classe === '6')
                .reduce((sum, c) => sum + (parseFloat(c.total_debit) || 0), 0);
            const tresorerie = balanceArray
                .filter(c => c.classe === '5')
                .reduce((sum, c) => sum + ((parseFloat(c.total_debit) || 0) - (parseFloat(c.total_credit) || 0)), 0);

            // Convert par_type object to array for charts
            const parTypeArray = Object.entries(statsData.par_type || {}).map(([key, value]) => ({
                name: TYPE_LABELS[key] || key,
                value: value.total,
                count: value.count
            }));

            // Convert par_mode object to array for charts
            const parModeArray = Object.entries(statsData.par_mode || {}).map(([key, value]) => ({
                name: MODE_LABELS[key] || key,
                value: value.total,
                count: value.count
            }));

            // Use real monthly evolution data
            const evolutionData = (statsData.evolution_mensuelle || []).map(m => ({
                name: m.nom,
                actuel: m.actuel,
                precedent: m.precedent
            }));

            setStats({
                periode: statsData.periode || { actuel: {}, precedent: {}, variation: 0 },
                parType: parTypeArray,
                parMode: parModeArray,
                evolution: evolutionData,
                annees: statsData.comparaison_annuelle || []
            });

            setBalance({
                produits,
                charges,
                resultat: produits - charges,
                tresorerie
            });

            console.log('✅ Data loaded successfully!');

        } catch (error) {
            console.error('❌ Error loading report data:', error);
            message.error('Erreur lors du chargement: ' + (error.response?.status || 'Réseau'));
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';
    };

    const getPeriodLabel = () => {
        const labels = { jour: "Aujourd'hui", semaine: 'Cette semaine', mois: 'Ce mois', annee: 'Cette année' };
        return labels[periodType] || 'Ce mois';
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = `
            <html>
                <head>
                    <title>Rapport Financier - Fultang Clinic</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                        .print-header h1 { margin: 0; color: #333; }
                        .print-header p { color: #666; margin: 5px 0; }
                        .section { margin-bottom: 25px; }
                        .section h2 { color: #444; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .amount { text-align: right; font-weight: bold; }
                        .total-row { background-color: #e8e8e8; font-weight: bold; }
                        .positive { color: green; }
                        .negative { color: red; }
                        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
                    </style>
                </head>
                <body>${printContent.innerHTML}</body>
            </html>
        `;

        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    const currentDate = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <DashBoard linkList={accountantNavLink} requiredRole={"comptable"}>
            <AccountantNavBar />
            <div className="flex flex-col p-5">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                        <FaFileAlt className="text-blue-600 text-3xl" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Rapports Financiers</h1>
                            <p className="text-gray-500 text-sm">Données réelles - {getPeriodLabel()}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={periodType}
                            onChange={(e) => setPeriodType(e.target.value)}
                            className="border rounded-lg px-3 py-2"
                        >
                            <option value="jour">Aujourd'hui</option>
                            <option value="semaine">Cette semaine</option>
                            <option value="mois">Ce mois</option>
                            <option value="annee">Cette année</option>
                        </select>
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                        >
                            <FaSync className={loading ? 'animate-spin' : ''} /> Actualiser
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            <FaPrint /> Imprimer
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Chargement des rapports...</div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                            <div className="bg-white rounded-lg shadow-lg p-5 border-l-4 border-green-500">
                                <p className="text-gray-500 text-sm">Recettes - {getPeriodLabel()}</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.periode.actuel?.total)}</p>
                                <p className="text-sm text-gray-400">{stats.periode.actuel?.count || 0} quittances</p>
                                <div className="flex items-center gap-1 mt-2 text-sm">
                                    {stats.periode.variation >= 0 ? (
                                        <><FaArrowUp className="text-green-500" /><span className="text-green-500">+{stats.periode.variation}%</span></>
                                    ) : (
                                        <><FaArrowDown className="text-red-500" /><span className="text-red-500">{stats.periode.variation}%</span></>
                                    )}
                                    <span className="text-gray-400">vs année dernière</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-lg p-5 border-l-4 border-blue-500">
                                <p className="text-gray-500 text-sm">Trésorerie</p>
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(balance.tresorerie)}</p>
                                <p className="text-sm text-gray-400 mt-2">Caisse + Banque</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-lg p-5 border-l-4 border-indigo-500">
                                <p className="text-gray-500 text-sm">Produits (Classe 7)</p>
                                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(balance.produits)}</p>
                                <p className="text-sm text-gray-400 mt-2">Total des recettes</p>
                            </div>
                            <div className={`bg-white rounded-lg shadow-lg p-5 border-l-4 ${balance.resultat >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                                <p className="text-gray-500 text-sm">Résultat</p>
                                <p className={`text-2xl font-bold ${balance.resultat >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(balance.resultat)}
                                </p>
                                <p className="text-sm text-gray-400 mt-2">Produits - Charges</p>
                            </div>
                        </div>

                        {/* Charts Row 1: Evolution */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                            {/* Line Chart - Monthly Evolution */}
                            <div className="bg-white rounded-lg shadow-lg p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaChartLine className="text-blue-500" />
                                    <h2 className="text-lg font-bold text-gray-800">Évolution Mensuelle ({new Date().getFullYear()} vs {new Date().getFullYear() - 1})</h2>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={stats.evolution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend />
                                        <Area type="monotone" dataKey="actuel" name={String(new Date().getFullYear())} fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
                                        <Area type="monotone" dataKey="precedent" name={String(new Date().getFullYear() - 1)} fill="#82ca9d" stroke="#82ca9d" fillOpacity={0.3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Bar Chart - 5 Year Comparison */}
                            <div className="bg-white rounded-lg shadow-lg p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaChartBar className="text-green-500" />
                                    <h2 className="text-lg font-bold text-gray-800">Comparaison sur 5 Ans</h2>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats.annees}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="annee" />
                                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Bar dataKey="total" name="Recettes" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Charts Row 2: Pie Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                            {/* Par Type */}
                            <div className="bg-white rounded-lg shadow-lg p-5">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Répartition par Type de Recette</h2>
                                {stats.parType.length > 0 ? (
                                    <div className="flex flex-col lg:flex-row items-center gap-4">
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={stats.parType}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    paddingAngle={2}
                                                >
                                                    {stats.parType.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="w-full space-y-2">
                                            {(() => {
                                                const total = stats.parType.reduce((sum, item) => sum + (item.value || 0), 0);
                                                return stats.parType.map((item, i) => {
                                                    const percent = total > 0 ? ((item.value / total) * 100).toFixed(2) : '0.00';
                                                    return (
                                                        <div key={i} className="flex justify-between items-center text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                                <span className="truncate">{item.name}</span>
                                                            </div>
                                                            <div className="flex gap-2 items-center flex-shrink-0">
                                                                <span className="font-bold text-gray-600">{percent}%</span>
                                                                <span className="font-bold">{formatCurrency(item.value)}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-gray-400">Aucune donnée</div>
                                )}
                            </div>

                            {/* Par Mode de Paiement */}
                            <div className="bg-white rounded-lg shadow-lg p-5">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Répartition par Mode de Paiement</h2>
                                {stats.parMode.length > 0 ? (
                                    <div className="flex flex-col lg:flex-row items-center gap-4">
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={stats.parMode}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={80}
                                                    fill="#82ca9d"
                                                    dataKey="value"
                                                    paddingAngle={2}
                                                >
                                                    {stats.parMode.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="w-full space-y-2">
                                            {(() => {
                                                const total = stats.parMode.reduce((sum, item) => sum + (item.value || 0), 0);
                                                return stats.parMode.map((item, i) => {
                                                    const percent = total > 0 ? ((item.value / total) * 100).toFixed(2) : '0.00';
                                                    return (
                                                        <div key={i} className="flex justify-between items-center text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                                <span className="truncate">{item.name}</span>
                                                            </div>
                                                            <div className="flex gap-2 items-center flex-shrink-0">
                                                                <span className="font-bold text-gray-600">{percent}%</span>
                                                                <span className="font-bold">{formatCurrency(item.value)}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-gray-400">Aucune donnée</div>
                                )}
                            </div>
                        </div>

                        {/* Print Content (Hidden on screen) */}
                        <div ref={printRef} className="hidden print:block">
                            <div className="print-header">
                                <h1>POLYCLINIQUE FULTANG</h1>
                                <p>Rapport Financier - {getPeriodLabel()}</p>
                                <p>Édité le {currentDate}</p>
                            </div>

                            <div className="section">
                                <h2>1. Synthèse des Recettes</h2>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Période actuelle ({stats.periode.actuel?.debut} au {stats.periode.actuel?.fin})</td>
                                            <td className="amount">{formatCurrency(stats.periode.actuel?.total)}</td>
                                        </tr>
                                        <tr>
                                            <td>Période précédente ({stats.periode.precedent?.debut} au {stats.periode.precedent?.fin})</td>
                                            <td className="amount">{formatCurrency(stats.periode.precedent?.total)}</td>
                                        </tr>
                                        <tr className="total-row">
                                            <td>Variation</td>
                                            <td className={`amount ${stats.periode.variation >= 0 ? 'positive' : 'negative'}`}>
                                                {stats.periode.variation >= 0 ? '+' : ''}{stats.periode.variation}%
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="section">
                                <h2>2. Répartition par Type</h2>
                                <table>
                                    <thead><tr><th>Type</th><th>Qté</th><th className="amount">Montant</th></tr></thead>
                                    <tbody>
                                        {stats.parType.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.name}</td>
                                                <td>{item.count}</td>
                                                <td className="amount">{formatCurrency(item.value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="section">
                                <h2>3. Répartition par Mode de Paiement</h2>
                                <table>
                                    <thead><tr><th>Mode</th><th>Qté</th><th className="amount">Montant</th></tr></thead>
                                    <tbody>
                                        {stats.parMode.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.name}</td>
                                                <td>{item.count}</td>
                                                <td className="amount">{formatCurrency(item.value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="section">
                                <h2>4. Comparaison sur 5 Ans</h2>
                                <table>
                                    <thead><tr><th>Année</th><th>Qté</th><th className="amount">Montant</th></tr></thead>
                                    <tbody>
                                        {stats.annees.map((y, i) => (
                                            <tr key={i}>
                                                <td>{y.annee}</td>
                                                <td>{y.count}</td>
                                                <td className="amount">{formatCurrency(y.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="section">
                                <h2>5. Situation Financière</h2>
                                <table>
                                    <tbody>
                                        <tr><td>Produits (Classe 7)</td><td className="amount positive">{formatCurrency(balance.produits)}</td></tr>
                                        <tr><td>Charges (Classe 6)</td><td className="amount negative">{formatCurrency(balance.charges)}</td></tr>
                                        <tr className="total-row">
                                            <td>Résultat Net</td>
                                            <td className={`amount ${balance.resultat >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(balance.resultat)}</td>
                                        </tr>
                                        <tr><td>Trésorerie</td><td className="amount">{formatCurrency(balance.tresorerie)}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p>___________________________</p>
                                    <p>Le Comptable</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p>___________________________</p>
                                    <p>Le Directeur</p>
                                </div>
                            </div>
                        </div>

                        {/* Financial Statement on screen */}
                        <div className="bg-white rounded-lg shadow-lg p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-800">État Financier</h2>
                                <span className="text-sm text-gray-500">{currentDate}</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Poste</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Montant</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr className="bg-green-50">
                                            <td className="px-4 py-3 font-bold text-green-700">PRODUITS (Classe 7)</td>
                                            <td className="px-4 py-3 text-right font-bold text-green-700">{formatCurrency(balance.produits)}</td>
                                        </tr>
                                        <tr className="bg-red-50">
                                            <td className="px-4 py-3 font-bold text-red-700">CHARGES (Classe 6)</td>
                                            <td className="px-4 py-3 text-right font-bold text-red-700">{formatCurrency(balance.charges)}</td>
                                        </tr>
                                        <tr className="bg-gray-100">
                                            <td className="px-4 py-4 font-bold text-lg">RÉSULTAT NET</td>
                                            <td className={`px-4 py-4 text-right font-bold text-lg ${balance.resultat >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(balance.resultat)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashBoard>
    );
}

export default RapportsPage;
