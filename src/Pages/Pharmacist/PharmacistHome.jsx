import { PharmacistDashBoard } from "./Components/PharmacistDashboard";
import { PharmacistNavLink } from "./PharmacistNavLink";
import { PharmacistNavBar } from "./Components/PharmacistNavBar";
import { useState, useEffect } from "react";
import {
    FaHome,
    FaPills,
    FaShoppingCart,
    FaExclamationTriangle,
    FaClipboardList,
    FaChartLine,
    FaSpinner
} from "react-icons/fa";
import PropTypes from "prop-types";
import { getPharmacistDashboardStats } from "../../services/comptabiliteMatiereApi";

export function PharmacistHome() {
    // États pour les données
    const [medications, setMedications] = useState([]);
    const [dailySales, setDailySales] = useState([]);
    const [stats, setStats] = useState({
        totalMedications: 0,
        lowStock: 0,
        salesCount: 0,
        salesTotal: 0
    });
    const [loading, setLoading] = useState(true);

    // Charger les données au montage
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getPharmacistDashboardStats();

                // Transformer les médicaments pour l'affichage
                const medsFormatted = data.medications.map(m => ({
                    id: m.idMateriel || m.id,
                    code: m.code || `MED-${m.idMateriel}`,
                    name: m.nom_Materiel || m.name,
                    quantity: m.quantite_stock || 0,
                    seuil: m.seuil_alerte || 20,
                    prixVente: m.prix_vente_unitaire || 0
                }));

                // Transformer les ventes du jour
                const salesFormatted = data.todaySales.map(s => ({
                    id: s.idSortie || s.id,
                    medication: s.lignes?.[0]?.materiel_nom || "Produit",
                    quantity: s.lignes?.reduce((sum, l) => sum + (l.quantite || 0), 0) || 0,
                    total: s.montant_total || 0,
                    time: s.date_sortie?.split('T')[1]?.substring(0, 5) || "00:00"
                }));

                setMedications(medsFormatted);
                setDailySales(salesFormatted);
                setStats({
                    totalMedications: data.totalMedications,
                    lowStock: data.lowStock,
                    salesCount: data.salesCount,
                    salesTotal: salesFormatted.reduce((sum, s) => sum + s.total, 0)
                });
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                // Fallback to mock data
                setMedications([
                    { id: 1, code: "MED-001", name: "Paracétamol 500mg", quantity: 150, seuil: 50, prixVente: 250 },
                    { id: 2, code: "MED-002", name: "Ibuprofène 400mg", quantity: 80, seuil: 30, prixVente: 350 },
                    { id: 3, code: "MED-003", name: "Amoxicilline 500mg", quantity: 25, seuil: 40, prixVente: 800 },
                ]);
                setDailySales([
                    { id: 1, medication: "Paracétamol 500mg", quantity: 10, total: 2500, time: "08:30" },
                ]);
                setStats({ totalMedications: 3, lowStock: 1, salesCount: 1, salesTotal: 2500 });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <PharmacistDashBoard
            linkList={PharmacistNavLink}
            requiredRole={"Pharmacist"}
        >
            <PharmacistNavBar />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaHome className="text-4xl text-primary-start" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord</h1>
                            <p className="text-gray-500">Bienvenue, Mme. Tchuente Claire</p>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Médicaments"
                        value={stats.totalMedications}
                        icon={FaPills}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Stock Faible"
                        value={stats.lowStock}
                        icon={FaExclamationTriangle}
                        color="bg-orange-500"
                    />
                    <StatCard
                        title="Ventes du Jour"
                        value={stats.salesCount}
                        icon={FaShoppingCart}
                        color="bg-green-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stock faible */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaExclamationTriangle className="text-orange-500" />
                            Médicaments en Stock Faible
                        </h2>
                        <div className="space-y-3">
                            {medications.filter(m => m.quantity <= m.seuil).map(med => (
                                <div key={med.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <div>
                                        <p className="font-semibold text-gray-800">{med.name}</p>
                                        <p className="text-sm text-gray-500">{med.code}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-orange-600">{med.quantity}</p>
                                        <p className="text-xs text-gray-500">Seuil: {med.seuil}</p>
                                    </div>
                                </div>
                            ))}
                            {medications.filter(m => m.quantity <= m.seuil).length === 0 && (
                                <p className="text-center text-gray-500 py-4">Aucun médicament en stock faible</p>
                            )}
                        </div>
                    </div>

                    {/* Liste du matériel vendu */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaClipboardList className="text-green-500" />
                            Liste du Matériel Vendu
                        </h2>
                        <div className="space-y-3">
                            {dailySales.map(sale => (
                                <div key={sale.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div>
                                        <p className="font-semibold text-gray-800">{sale.medication}</p>
                                        <p className="text-sm text-gray-500">
                                            Date: {new Date().toLocaleDateString('fr-FR')} à {sale.time}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600">Qté: {sale.quantity}</p>
                                    </div>
                                </div>
                            ))}
                            {dailySales.length === 0 && (
                                <p className="text-center text-gray-500 py-4">Aucune vente aujourd&apos;hui</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PharmacistDashBoard>
    );
}

function StatCard({ title, value, icon: Icon, color, isText = false }) {
    StatCard.propTypes = {
        title: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        icon: PropTypes.elementType.isRequired,
        color: PropTypes.string.isRequired,
        isText: PropTypes.bool
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className={`${color} rounded-full p-4 text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-semibold">{title}</p>
                    <p className={`font-bold text-gray-900 ${isText ? 'text-xl' : 'text-3xl'}`}>{value}</p>
                </div>
            </div>
        </div>
    );
}
