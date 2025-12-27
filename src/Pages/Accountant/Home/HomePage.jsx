/**
 * Accountant Dashboard/Home Page
 * Following the same pattern as Cashier.jsx
 */
import { accountantNavLink } from "../NavLinks.js";
import { AccountantNavBar } from "../NavBar.jsx";
import { DashBoard } from "../../../GlobalComponents/DashBoard.jsx";
import userIcon from "../../../assets/userIcon.png";
import { useAuthentication } from "../../../Utils/Provider.jsx";
import { useEffect, useState } from "react";
import { message } from "antd";
import { getDashboardData, getQuittancesAValider } from "../../../services/accountantApi.js";
import { useNavigate } from "react-router-dom";
import { FaReceipt, FaCheckCircle, FaBookOpen, FaClock, FaFileAlt, FaBalanceScale } from "react-icons/fa";

export function AccountantHomePage() {
    const { userData } = useAuthentication();
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRecettes: 0,
        recettesJour: 0,
        recettesMois: 0,
        quittancesAValider: 0,
        quittancesValidees: 0,
        montantAValider: 0,
        montantValidee: 0,
        montantJour: 0,
        montantMois: 0,
        totalComptes: 0,
        comptesActifs: 0,
        // Écritures stats
        totalEcritures: 0,
        ecrituresJour: 0,
        ecrituresMois: 0,
        parJournal: {}
    });
    const [recentQuittances, setRecentQuittances] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // Fetch dashboard data
            const dashboardData = await getDashboardData();

            if (dashboardData.success) {
                const { quittances, comptes, ecritures } = dashboardData;

                setStats({
                    totalRecettes: quittances.global.total_quittances || 0,
                    recettesJour: quittances.aujourdhui.count || 0,
                    recettesMois: quittances.ce_mois.count || 0,
                    montantJour: quittances.aujourdhui.total || 0,
                    montantMois: quittances.ce_mois.total || 0,
                    quittancesAValider: quittances.validation.a_valider || 0,
                    quittancesValidees: quittances.validation.validees || 0,
                    montantAValider: quittances.validation.montant_a_valider || 0,
                    montantValidee: quittances.validation.montant_validee || 0,
                    totalComptes: comptes.total || 0,
                    comptesActifs: comptes.actifs || 0,
                    // Écritures
                    totalEcritures: ecritures?.total_ecritures || 0,
                    ecrituresJour: ecritures?.ecritures_jour || 0,
                    ecrituresMois: ecritures?.ecritures_mois || 0,
                    parJournal: ecritures?.par_journal || {}
                });
            }

            // Fetch recent quittances to validate
            const quittancesData = await getQuittancesAValider();
            setRecentQuittances(quittancesData.quittances?.slice(0, 5) || []);

        } catch (error) {
            console.error('Error loading dashboard:', error);
            message.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' FCFA';
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <DashBoard linkList={accountantNavLink} requiredRole={"comptable"} >
            <AccountantNavBar />
            <div className="flex flex-col">
                {/* Welcome Banner - Same as Cashier */}
                <div className="ml-5 mr-5 h-[150px] bg-gradient-to-t from-primary-start to-primary-end flex rounded-lg justify-between">
                    <div className="flex gap-4">
                        <div className="mt-5 mb-5 ml-5 w-28 h-28 border-4 border-white rounded-full">
                            <img
                                src={userIcon}
                                alt="user icon"
                                className="h-[105px] w-[105px] mb-2"
                            />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-white text-4xl font-bold mt-6">
                                Bienvenue!
                            </p>
                            <p className="text-2xl mt-2 text-white"> {userData?.nom || "Comptable"}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-white mt-28 text-xl font-bold mr-4">
                            {time}
                        </p>
                    </div>
                </div>

                {/* Stats Cards - Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-5">
                    {/* À Valider */}
                    <div
                        className="bg-white rounded-lg shadow-lg p-5 border-l-4 border-orange-500 cursor-pointer hover:shadow-xl transition-all"
                        onClick={() => navigate('/accountant/quittances/a-valider')}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm">À Valider</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.quittancesAValider}</p>
                                <p className="text-sm text-orange-500">{formatCurrency(stats.montantAValider)}</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <FaClock className="text-orange-500 text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Validées */}
                    <div
                        className="bg-white rounded-lg shadow-lg p-5 border-l-4 border-green-500 cursor-pointer hover:shadow-xl transition-all"
                        onClick={() => navigate('/accountant/quittances/validees')}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm">Recettes Validées</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.quittancesValidees}</p>
                                <p className="text-sm text-green-500">{formatCurrency(stats.montantValidee)}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <FaCheckCircle className="text-green-500 text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Écritures Comptables */}
                    <div
                        className="bg-white rounded-lg shadow-lg p-5 border-l-4 border-indigo-500 cursor-pointer hover:shadow-xl transition-all"
                        onClick={() => navigate('/accountant/ecritures')}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm">Écritures Comptables</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.totalEcritures}</p>
                                <p className="text-sm text-indigo-500">{stats.ecrituresMois} ce mois</p>
                            </div>
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <FaFileAlt className="text-indigo-500 text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Balance */}
                    <div
                        className="bg-white rounded-lg shadow-lg p-5 border-l-4 border-teal-500 cursor-pointer hover:shadow-xl transition-all"
                        onClick={() => navigate('/accountant/balance')}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm">Balance</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.totalComptes}</p>
                                <p className="text-sm text-teal-500">{stats.comptesActifs} comptes actifs</p>
                            </div>
                            <div className="bg-teal-100 p-3 rounded-full">
                                <FaBalanceScale className="text-teal-500 text-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Quittances Table */}
            <div className="m-5 bg-white rounded-lg shadow-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Quittances en attente de validation</h2>
                    <button
                        onClick={() => navigate('/accountant/quittances/a-valider')}
                        className="text-secondary hover:underline font-medium"
                    >
                        Voir tout →
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-10 text-center">
                        <p className="text-gray-500">Chargement...</p>
                    </div>
                ) : recentQuittances.length === 0 ? (
                    <div className="p-10 text-center">
                        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
                        <p className="text-gray-500">Aucune quittance en attente de validation</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">N° Quittance</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Patient</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Motif</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Montant</th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentQuittances.map((q) => (
                                <tr key={q.idQuittance} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{q.numero_quittance}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                                        {q.patient_full_name || 'N/A'}
                                        {q.patient_matricule && (
                                            <span className="text-xs text-gray-400 block">{q.patient_matricule}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(q.date_paiement)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{q.Motif}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                                        {formatCurrency(parseFloat(q.Montant_paye))}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            En attente
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-5">
                {/* Aujourd'hui */}
                <div className="bg-white rounded-lg shadow-lg p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Statistiques du jour</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="text-gray-600">Nombre de recettes</span>
                            <span className="font-bold text-blue-600">{stats.recettesJour}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-600">Total encaissé</span>
                            <span className="font-bold text-green-600">{formatCurrency(stats.montantJour)}</span>
                        </div>
                    </div>
                </div>

                {/* Ce mois */}
                <div className="bg-white rounded-lg shadow-lg p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Statistiques du mois</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span className="text-gray-600">Nombre de recettes</span>
                            <span className="font-bold text-purple-600">{stats.recettesMois}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-600">Total encaissé</span>
                            <span className="font-bold text-green-600">{formatCurrency(stats.montantMois)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashBoard>
    );
}
