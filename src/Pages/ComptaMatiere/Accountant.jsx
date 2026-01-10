import { AccountantDashBoard } from "./Components/AccountantDashboard";
import { AccountantNavLink } from "./AccountantNavLink";
import { AccountantNavBar } from "./Components/AccountantNavBar";
import { useState, useEffect, useRef } from "react";
import {
  Package,
  Truck,
  ClipboardList,
  TrendingUp,
  PackageOpen,
  Stethoscope,
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  FileText,
  Eye
} from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

export function Accountant() {
  const navigate = useNavigate();
  const besoinsRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Statistics from API
  const [stats, setStats] = useState({
    totalMaterial: 0,
    totalMedical: 0,
    totalOutputs: 0,
    pendingNeeds: 0,
    totalDeliveries: 0,
    totalDurable: 0,
  });

  // List of pending needs from API
  const [besoinsEnCours, setBesoinsEnCours] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  /**
   * 📡 DATA LOADING (Always Fresh Mode)
   * Using fetch with cache: "no-store" to avoid browser cache.
   */
  const loadData = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token_key_fultang");
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const baseUrl = import.meta.env.VITE_BACKEND_FULTANG_API_BASE_MEDICALSTAFF_URL || "http://127.0.0.1:8000/api";

    try {
      console.log("🚀 Dashboard - Loading fresh data...");

      const [medicauxRes, durablesRes, sortiesRes, livraisonsRes, besoinsRes] = await Promise.all([
        fetch(`${baseUrl}/materiels-medicaux/?page_size=1000`, { headers, cache: "no-store" }).then(res => res.json()),
        fetch(`${baseUrl}/materiels-durables/?page_size=1000`, { headers, cache: "no-store" }).then(res => res.json()),
        fetch(`${baseUrl}/sorties/?page_size=1000`, { headers, cache: "no-store" }).then(res => res.json()),
        fetch(`${baseUrl}/livraisons/?page_size=1000`, { headers, cache: "no-store" }).then(res => res.json()),
        fetch(`${baseUrl}/besoins/?page_size=1000`, { headers, cache: "no-store" }).then(res => res.json())
      ]);

      // Extract results (handling Django Rest Framework paginated format)
      const medicaux = medicauxRes.results || medicauxRes || [];
      const durables = durablesRes.results || durablesRes || [];
      const sorties = sortiesRes.results || sortiesRes || [];
      const livraisons = livraisonsRes.results || livraisonsRes || [];
      const besoins = besoinsRes.results || besoinsRes || [];

      // 🔢 STATISTICAL OPERATIONS
      // Count only EN_COURS needs (to be processed by accountant)
      const pendingCount = besoins.filter(b => b.statut === 'EN_COURS').length;

      setStats({
        totalMaterial: medicaux.length + durables.length,
        totalMedical: medicaux.length,
        totalOutputs: sorties.length,
        pendingNeeds: pendingCount,
        totalDeliveries: livraisons.length,
        totalDurable: durables.length,
      });

      // Get ONLY EN_COURS needs for the accountant
      const besoinsEnCoursFiltered = besoins.filter(b =>
        b.statut === 'EN_COURS'
      ).slice(0, 50);

      const besoinsFormates = await Promise.all(
        besoinsEnCoursFiltered.map(async (b) => {
          // Fetch lines for each need individually with no-store
          let description = b.motif;
          let quantiteTotal = 1;

          try {
            const lignesRes = await fetch(`${baseUrl}/lignes-besoin/?besoin=${b.idBesoin}&page_size=1000`, { headers, cache: "no-store" });
            const lignesData = await lignesRes.json();
            const lignes = lignesData.results || lignesData || [];

            if (lignes.length > 0) {
              quantiteTotal = lignes.reduce((sum, l) => sum + (l.quantite_demandee || 0), 0);
              description = lignes.map(l => l.materiel_nom).join(', ');
            }
          } catch (err) {
            console.warn(`Error fetching lines for need ${b.idBesoin}`, err);
          }

          return {
            id: b.idBesoin,
            code: b.code_besoin || `BES-${b.idBesoin}`,
            departement: `Staff #${b.idPersonnel_emetteur}`,
            description: description || 'Not specified',
            quantite: quantiteTotal,
            priorite: mapPriorite(b.priorite),
            dateEmission: b.date_creation_besoin?.split('T')[0] || '-',
            statut: mapStatut(b.statut),
            rawStatut: b.statut, // Keep original status for actions
          };
        })
      );

      setBesoinsEnCours(besoinsFormates);

    } catch (err) {
      console.error("❌ Loading error:", err);
      setError("Unable to load fresh data.");
    } finally {
      setLoading(false);
    }
  };

  function mapPriorite(priorite) {
    const map = {
      'HIGH': 'high',
      'NORMAL': 'medium',
      'LOW': 'low'
    };
    return map[priorite] || 'medium';
  }

  function mapStatut(statut) {
    const map = {
      'NON_TRAITE': 'pending',
      'EN_COURS': 'in_progress',
      'TRAITE': 'processed',
      'REJETE': 'processed'
    };
    return map[statut] || 'pending';
  }

  /**
   * 📝 PROCESS A NEED (Move from EN_COURS to TRAITE)
   */
  const handleTraiterBesoin = async (besoin) => {
    const confirmation = window.confirm(`Do you want to mark need ${besoin.code} as processed?`);
    if (!confirmation) return;

    const token = localStorage.getItem("token_key_fultang");
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const baseUrl = import.meta.env.VITE_BACKEND_FULTANG_API_BASE_MEDICALSTAFF_URL || "http://127.0.0.1:8000/api";

    try {
      setLoading(true);

      const response = await fetch(`${baseUrl}/besoins/${besoin.id}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ statut: 'TRAITE' })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      // Reload data
      await loadData();
      alert(`✅ Need ${besoin.code} marked as processed successfully!`);

    } catch (err) {
      console.error("Error processing need:", err);
      alert("❌ Error processing need. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBesoins = () => {
    besoinsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Pagination logic
  const totalPages = Math.ceil(besoinsEnCours.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNeeds = besoinsEnCours.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const quickActions = [
    {
      icon: ClipboardList,
      label: "Emit Need",
      description: "Create a material request",
      color: "from-blue-500 to-blue-600",
      onClick: () => navigate("/compta-matiere/emit-need"),
    },
    {
      icon: Truck,
      label: "Register Delivery",
      description: "Record a reception",
      color: "from-green-500 to-green-600",
      onClick: () => navigate("/compta-matiere/register-delivery"),
    },
    {
      icon: PackageOpen,
      label: "Register Output",
      description: "Record an output",
      color: "from-orange-500 to-orange-600",
      onClick: () => navigate("/compta-matiere/register-output"),
    },
    {
      icon: TrendingUp,
      label: "View Reports",
      description: "View statistics",
      color: "from-purple-500 to-purple-600",
      onClick: () => navigate("/compta-matiere/reports"),
    },
  ];

  if (loading) {
    return (
      <AccountantDashBoard linkList={AccountantNavLink} requiredRole={"comptable_matiere"}>
        <AccountantNavBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="animate-spin text-4xl text-primary-start mx-auto mb-4 w-10 h-10" />
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      </AccountantDashBoard>
    );
  }

  return (
    <AccountantDashBoard
      linkList={AccountantNavLink}
      requiredRole={"comptable_matiere"}
    >
      <AccountantNavBar />
      <div className="p-6 space-y-6">
        {/* Modern gradient header */}
        <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Material Accounting Dashboard</h1>
                <p className="text-sm opacity-90">
                  {stats.totalMaterial} material{stats.totalMaterial !== 1 ? 's' : ''} in stock
                </p>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 bg-white text-primary-end px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Materials"
            value={stats.totalMaterial}
            description="Items in stock"
            color="from-blue-500 to-blue-600"
            icon={Package}
            onClick={() => navigate("/compta-matiere/material-list")}
            clickable={true}
          />
          <StatCard
            title="Medical Materials"
            value={stats.totalMedical}
            description="Medical equipment"
            color="from-cyan-500 to-cyan-600"
            icon={Stethoscope}
            onClick={() => navigate("/compta-matiere/material-list")}
            clickable={true}
          />
          <StatCard
            title="Total Outputs"
            value={stats.totalOutputs}
            description="All outputs"
            color="from-orange-500 to-orange-600"
            icon={PackageOpen}
          />
          <StatCard
            title="Pending Needs"
            value={stats.pendingNeeds}
            description="Requests to process"
            color="from-red-500 to-red-600"
            icon={ClipboardList}
            onClick={scrollToBesoins}
            clickable={true}
          />
          <StatCard
            title="Deliveries"
            value={stats.totalDeliveries}
            description="Recorded receptions"
            color="from-green-500 to-green-600"
            icon={Truck}
          />
          <StatCard
            title="Durable Materials"
            value={stats.totalDurable}
            description="Durable equipment"
            color="from-purple-500 to-purple-600"
            icon={Wrench}
            onClick={() => navigate("/compta-matiere/material-list")}
            clickable={true}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionButton
                key={index}
                icon={action.icon}
                label={action.label}
                description={action.description}
                color={action.color}
                onClick={action.onClick}
              />
            ))}
          </div>
        </div>

        {/* Pending Needs List */}
        <div ref={besoinsRef} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pending Needs
            </h2>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
              {besoinsEnCours.length} need{besoinsEnCours.length !== 1 ? 's' : ''}
            </span>
          </div>
          {besoinsEnCours.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Requester</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Quantity</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Priority</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Date</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentNeeds.map((besoin) => (
                      <tr key={besoin.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium font-mono">{besoin.code}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{besoin.departement}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{besoin.description}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-800 font-semibold">{besoin.quantite}</td>
                        <td className="px-4 py-3 text-center">
                          <PrioriteBadge priorite={besoin.priorite} />
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500">{besoin.dateEmission}</td>
                        <td className="px-4 py-3 text-center">
                          <StatutBadge statut={besoin.statut} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleTraiterBesoin(besoin)}
                            disabled={loading}
                            className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mx-auto"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Process
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="mx-auto text-gray-300 mb-3 w-16 h-16" />
              <p className="text-lg">No pending needs</p>
              <p className="text-sm text-gray-400 mt-1">All requests have been processed</p>
            </div>
          )}
        </div>
      </div>
    </AccountantDashBoard>
  );
}

function StatCard({ title, value, description, color, icon: Icon, onClick, clickable }) {
  StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    onClick: PropTypes.func,
    clickable: PropTypes.bool,
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${clickable ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center gap-4">
        <div className={`bg-gradient-to-br ${color} rounded-full p-4 text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600 font-semibold">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
          {clickable && (
            <p className="text-xs text-blue-500 mt-1 font-medium flex items-center gap-1">
              <Eye className="w-3 h-3" /> Click to view
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, description, color, onClick }) {
  QuickActionButton.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 hover:border-primary-end hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group"
    >
      <div className={`bg-gradient-to-br ${color} rounded-full p-4 text-white group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8" />
      </div>
      <div className="text-center">
        <p className="text-md font-bold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </button>
  );
}

function PrioriteBadge({ priorite }) {
  PrioriteBadge.propTypes = {
    priorite: PropTypes.string.isRequired,
  };

  const config = {
    high: { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle, label: "High" },
    medium: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Medium" },
    low: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle, label: "Low" },
  };

  const { bg, text, icon: PrioriteIcon, label } = config[priorite] || config.medium;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <PrioriteIcon className="w-3 h-3" />
      {label}
    </span>
  );
}

function StatutBadge({ statut }) {
  StatutBadge.propTypes = {
    statut: PropTypes.string.isRequired,
  };

  const config = {
    pending: { bg: "bg-orange-100", text: "text-orange-700", label: "Pending" },
    in_progress: { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress" },
    processed: { bg: "bg-green-100", text: "text-green-700", label: "Processed" },
  };

  const { bg, text, label } = config[statut] || config.pending;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}
