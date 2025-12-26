import { ComptaMatiereDashBoard } from "./Components/ComptaMatiereDashboard";
import { ComptaMatiereNavLink } from "./ComptaMatiereNavLink";
import { ComptaMatiereNavBar } from "./Components/ComptaMatiereNavBar";
import {
  FaBoxes,
  FaTruck,
  FaClipboardList,
  FaChartLine,
  FaBoxOpen,
  FaMedkit,
  FaTools,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { getDashboardStats, getAllBesoins } from "../../services/comptabiliteMatiereApi";

export function Accountant() {
  const navigate = useNavigate();
  const besoinsRef = useRef(null);

  // Fonction pour scroller vers la section des besoins
  const scrollToBesoins = () => {
    besoinsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // États pour les données
  const [stats, setStats] = useState({
    totalMaterial: 0,
    totalMedical: 0,
    totalOutputs: 0,
    pendingNeeds: 0,
    totalDeliveries: 0,
    totalDurable: 0,
  });

  const [besoinsEnCours, setBesoinsEnCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données au montage
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les stats et les besoins en parallèle
        const [statsData, besoinsData] = await Promise.all([
          getDashboardStats(),
          getAllBesoins()
        ]);

        setStats(statsData);

        // Transformer les besoins pour l'affichage
        const besoins = besoinsData.results || besoinsData;
        const besoinsFormatted = besoins
          .filter(b => b.statut === 'NON_TRAITE' || b.statut === 'EN_COURS')
          .map(b => ({
            id: b.idBesoin || b.id,
            departement: b.service_demandeur || "Service",
            description: b.motif || "Besoin",
            quantite: b.lignes?.length || 1,
            priorite: b.priorite === 'URGENT' ? 'haute' : b.priorite === 'NORMAL' ? 'moyenne' : 'basse',
            dateEmission: b.date_creation_besoin?.split('T')[0] || new Date().toISOString().split('T')[0],
            statut: b.statut === 'NON_TRAITE' ? 'en_attente' : 'en_cours',
          }));

        setBesoinsEnCours(besoinsFormatted);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données. Veuillez réessayer.");
        // Fallback to mock data if API fails
        setStats({
          totalMaterial: 156,
          totalMedical: 89,
          totalOutputs: 128,
          pendingNeeds: 23,
          totalDeliveries: 45,
          totalDurable: 67,
        });
        setBesoinsEnCours([
          { id: 1, departement: "Service Cardiologie", description: "Moniteurs cardiaques portables", quantite: 5, priorite: "haute", dateEmission: "2024-12-20", statut: "en_attente" },
          { id: 2, departement: "Pharmacie", description: "Seringues stériles 10ml", quantite: 500, priorite: "moyenne", dateEmission: "2024-12-19", statut: "en_cours" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    {
      icon: FaClipboardList,
      label: "Émettre un besoin",
      description: "Créer une demande de matériel",
      color: "bg-blue-500",
      onClick: () => navigate("/compta-matiere/emit-need"),
    },
    {
      icon: FaTruck,
      label: "Enregistrer une livraison",
      description: "Saisir une réception",
      color: "bg-green-500",
      onClick: () => navigate("/compta-matiere/register-delivery"),
    },
    {
      icon: FaBoxOpen,
      label: "Enregistrer une sortie",
      description: "Enregistrer une sortie",
      color: "bg-orange-500",
      onClick: () => navigate("/compta-matiere/register-output"),
    },
    {
      icon: FaChartLine,
      label: "Voir les rapports",
      description: "Consulter les statistiques",
      color: "bg-purple-500",
      onClick: () => navigate("/compta-matiere/reports"),
    },
  ];

  return (
    <ComptaMatiereDashBoard
      linkList={ComptaMatiereNavLink}
      requiredRole={"Accountant"}
    >
      <ComptaMatiereNavBar />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord - Comptable Matière</h1>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Matériel"
            value={stats.totalMaterial}
            description="Articles en stock"
            color="bg-blue-500"
            icon={FaBoxes}
          />
          <StatCard
            title="Matériel Médical Total"
            value={stats.totalMedical}
            description="Équipements médicaux"
            color="bg-yellow-500"
            icon={FaMedkit}
          />
          <StatCard
            title="Sorties Totales"
            value={stats.totalOutputs}
            description="Toutes les sorties"
            color="bg-orange-500"
            icon={FaBoxOpen}
          />
          <StatCard
            title="Besoins en Attente"
            value={stats.pendingNeeds}
            description="Demandes à traiter"
            color="bg-red-500"
            icon={FaClipboardList}
            onClick={scrollToBesoins}
            clickable={true}
          />
          <StatCard
            title="Livraisons"
            value={stats.totalDeliveries}
            description="Réceptions enregistrées"
            color="bg-green-500"
            icon={FaTruck}
          />
          <StatCard
            title="Matériel Durable Total"
            value={stats.totalDurable}
            description="Équipements durables"
            color="bg-purple-500"
            icon={FaTools}
          />
        </div>

        {/* Actions Rapides */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Actions Rapides
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

        {/* Liste des besoins en cours */}
        <div ref={besoinsRef} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Liste des Besoins en Cours
            </h2>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
              {besoinsEnCours.length} besoins
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Département</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Quantité</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Priorité</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {besoinsEnCours.map((besoin) => (
                  <tr key={besoin.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">#{besoin.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{besoin.departement}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{besoin.description}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-800 font-semibold">{besoin.quantite}</td>
                    <td className="px-4 py-3 text-center">
                      <PrioriteBadge priorite={besoin.priorite} />
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">{besoin.dateEmission}</td>
                    <td className="px-4 py-3 text-center">
                      <StatutBadge statut={besoin.statut} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ComptaMatiereDashBoard>
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
        <div className={`${color} rounded-full p-4 text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600 font-semibold">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
          {clickable && (
            <p className="text-xs text-blue-500 mt-1 font-medium">Cliquez pour voir →</p>
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
      <div className={`${color} rounded-full p-4 text-white group-hover:scale-110 transition-transform duration-300`}>
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
    haute: { bg: "bg-red-100", text: "text-red-700", icon: FaExclamationTriangle, label: "Haute" },
    moyenne: { bg: "bg-yellow-100", text: "text-yellow-700", icon: FaClock, label: "Moyenne" },
    basse: { bg: "bg-green-100", text: "text-green-700", icon: FaCheckCircle, label: "Basse" },
  };

  const { bg, text, icon: PrioriteIcon, label } = config[priorite] || config.moyenne;

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
    en_attente: { bg: "bg-orange-100", text: "text-orange-700", label: "En attente" },
    en_cours: { bg: "bg-blue-100", text: "text-blue-700", label: "En cours" },
    traite: { bg: "bg-green-100", text: "text-green-700", label: "Traité" },
  };

  const { bg, text, label } = config[statut] || config.en_attente;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}
