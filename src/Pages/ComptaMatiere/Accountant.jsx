import { AccountantDashBoard } from "./Components/AccountantDashboard";
import { AccountantNavLink } from "./AccountantNavLink";
import { AccountantNavBar } from "./Components/AccountantNavBar";
import { useState, useEffect, useRef } from "react";
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
  FaSyncAlt
} from "react-icons/fa";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  materielMedicalApi,
  materielDurableApi,
  sortieApi,
  livraisonApi,
  besoinApi,
  ligneBesoinApi
} from "../../services/comptabiliteMatiereApi";

export function Accountant() {
  const navigate = useNavigate();
  const besoinsRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Statistiques depuis l'API
  const [stats, setStats] = useState({
    totalMaterial: 0,
    totalMedical: 0,
    totalOutputs: 0,
    pendingNeeds: 0,
    totalDeliveries: 0,
    totalDurable: 0,
  });

  // Liste des besoins en cours depuis l'API
  const [besoinsEnCours, setBesoinsEnCours] = useState([]);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Charger les matériels médicaux
      const medicauxData = await materielMedicalApi.getAll();
      const medicaux = medicauxData.results || medicauxData;

      // Charger les matériels durables
      const durablesData = await materielDurableApi.getAll();
      const durables = durablesData.results || durablesData;

      // Charger les sorties
      const sortiesData = await sortieApi.getAll();
      const sorties = sortiesData.results || sortiesData;

      // Charger les livraisons
      const livraisonsData = await livraisonApi.getAll();
      const livraisons = livraisonsData.results || livraisonsData;

      // Charger les besoins
      const besoinsData = await besoinApi.getAll();
      const besoins = besoinsData.results || besoinsData;

      // Calculer les statistiques
      setStats({
        totalMaterial: medicaux.length + durables.length,
        totalMedical: medicaux.length,
        totalOutputs: sorties.length,
        pendingNeeds: besoins.filter(b => b.statut === 'NON_TRAITE' || b.statut === 'EN_COURS').length,
        totalDeliveries: livraisons.length,
        totalDurable: durables.length,
      });

      // Récupérer les besoins en cours avec leurs lignes
      const besoinsNonTraites = besoins.filter(b => b.statut === 'NON_TRAITE' || b.statut === 'EN_COURS');
      const besoinsFormates = await Promise.all(
        besoinsNonTraites.slice(0, 10).map(async (b) => {
          let lignes = [];
          try {
            const lignesData = await ligneBesoinApi.getByBesoin(b.idBesoin);
            lignes = lignesData.results || lignesData;
          } catch {
            // Ignorer les erreurs de chargement des lignes
          }

          const quantiteTotal = lignes.reduce((sum, l) => sum + (l.quantite_demandee || 0), 0);
          const description = lignes.length > 0
            ? lignes.map(l => l.materiel_nom).join(', ')
            : b.motif;

          return {
            id: b.idBesoin,
            code: b.code_besoin || `BES-${b.idBesoin}`,
            departement: `Personnel #${b.idPersonnel_emetteur}`,
            description: description || b.motif || 'Non spécifié',
            quantite: quantiteTotal || lignes.length || 1,
            priorite: mapPriorite(b.priorite),
            dateEmission: b.date_creation_besoin?.split('T')[0] || '-',
            statut: mapStatut(b.statut),
          };
        })
      );

      setBesoinsEnCours(besoinsFormates);

    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError("Impossible de charger les données. Vérifiez que le backend est en cours d'exécution.");
    } finally {
      setLoading(false);
    }
  }

  function mapPriorite(priorite) {
    const map = {
      'HIGH': 'haute',
      'NORMAL': 'moyenne',
      'LOW': 'basse'
    };
    return map[priorite] || 'moyenne';
  }

  function mapStatut(statut) {
    const map = {
      'NON_TRAITE': 'en_attente',
      'EN_COURS': 'en_cours',
      'TRAITE': 'traite',
      'REJETE': 'traite'
    };
    return map[statut] || 'en_attente';
  }

  const scrollToBesoins = () => {
    besoinsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  if (loading) {
    return (
      <AccountantDashBoard linkList={AccountantNavLink} requiredRole={"ComptaMatiere"}>
        <AccountantNavBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-primary-start mx-auto mb-4" />
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        </div>
      </AccountantDashBoard>
    );
  }

  return (
    <AccountantDashBoard
      linkList={AccountantNavLink}
      requiredRole={"ComptaMatiere"}
    >
      <AccountantNavBar />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord - Comptable Matière</h1>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

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
          {besoinsEnCours.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Émetteur</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaClipboardList className="mx-auto text-4xl text-gray-300 mb-3" />
              <p>Aucun besoin en attente</p>
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
