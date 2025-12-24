import { useState, useEffect } from 'react';
import { History, Search, RefreshCw, Filter, Calendar, User, Stethoscope, Pill, Package, Syringe, CheckCircle, Clock } from 'lucide-react';
import { message, Select, DatePicker } from 'antd';
import { PharmacyNavBar } from './PharmacyNavBar';
import { CustomDashboard } from '../../GlobalComponents/CustomDashboard';
import { pharmacyNavLink } from './lib/pharmacyNavLink';
import { getAllPrescriptions } from '../../services/prescriptionsApi';
import Loader from '../../GlobalComponents/Loader';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export function PharmacyHistory() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [expandedPrescription, setExpandedPrescription] = useState(null);

    // Filters
    const [periodFilter, setPeriodFilter] = useState('all');
    const [stateFilter, setStateFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);

    useEffect(() => {
        fetchAllPrescriptions();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, prescriptions, periodFilter, stateFilter, dateRange]);

    const fetchAllPrescriptions = async () => {
        setIsLoading(true);
        try {
            const response = await getAllPrescriptions();
            // Handle various response formats
            let data = [];
            if (Array.isArray(response)) {
                data = response;
            } else if (response?.data && Array.isArray(response.data)) {
                data = response.data;
            } else if (response?.results && Array.isArray(response.results)) {
                data = response.results;
            } else if (response?.success && response?.data) {
                data = Array.isArray(response.data) ? response.data : [];
            }
            setPrescriptions(data);
            setFilteredPrescriptions(data);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            message.error('Erreur lors de la récupération des prescriptions');
            setPrescriptions([]);
            setFilteredPrescriptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...prescriptions];

        // Search filter
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(prescription =>
                prescription.patient_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.patient_matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.medecin_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.liste_medicaments?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // State filter
        if (stateFilter !== 'all') {
            filtered = filtered.filter(prescription => prescription.state === stateFilter);
        }

        // Period filter
        if (periodFilter !== 'all' && periodFilter !== 'custom') {
            const now = dayjs();
            filtered = filtered.filter(prescription => {
                const prescriptionDate = dayjs(prescription.date_heure);
                switch (periodFilter) {
                    case 'today':
                        return prescriptionDate.isSame(now, 'day');
                    case 'week':
                        return prescriptionDate.isAfter(now.subtract(7, 'day'));
                    case 'month':
                        return prescriptionDate.isAfter(now.subtract(30, 'day'));
                    case 'year':
                        return prescriptionDate.isAfter(now.subtract(365, 'day'));
                    default:
                        return true;
                }
            });
        }

        // Custom date range filter
        if (periodFilter === 'custom' && dateRange && dateRange[0] && dateRange[1]) {
            filtered = filtered.filter(prescription => {
                const prescriptionDate = dayjs(prescription.date_heure);
                return prescriptionDate.isAfter(dateRange[0]) && prescriptionDate.isBefore(dateRange[1].add(1, 'day'));
            });
        }

        setFilteredPrescriptions(filtered);
    };

    const handleRefresh = () => {
        fetchAllPrescriptions();
    };

    const resetFilters = () => {
        setPeriodFilter('all');
        setStateFilter('all');
        setDateRange(null);
        setSearchTerm('');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const parseMedications = (medicationText) => {
        if (!medicationText) return [];
        const items = medicationText
            .split(/[\n;,]|(?:\d+\.\s*)/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
        return items;
    };

    const getMedicationIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('seringue') || lowerName.includes('injection')) {
            return <Syringe className="w-4 h-4" />;
        }
        if (lowerName.includes('comprimé') || lowerName.includes('gélule') || lowerName.includes('capsule')) {
            return <Pill className="w-4 h-4" />;
        }
        return <Package className="w-4 h-4" />;
    };

    const getMedicationColor = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('seringue') || lowerName.includes('injection')) {
            return 'bg-red-100 text-red-700 border-red-200';
        }
        if (lowerName.includes('sirop') || lowerName.includes('solution')) {
            return 'bg-purple-100 text-purple-700 border-purple-200';
        }
        if (lowerName.includes('pommade') || lowerName.includes('crème')) {
            return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
        return 'bg-blue-100 text-blue-700 border-blue-200';
    };

    const getStateColor = (state) => {
        if (state === 'effectuee') {
            return 'bg-green-100 text-green-700 border-green-300';
        }
        return 'bg-orange-100 text-orange-700 border-orange-300';
    };

    const toggleExpanded = (prescriptionId) => {
        setExpandedPrescription(expandedPrescription === prescriptionId ? null : prescriptionId);
    };

    return (
        <CustomDashboard linkList={pharmacyNavLink} requiredRole="Pharmacist">
            <PharmacyNavBar />
            <div className="p-6">
                {/* Header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <History className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Historique des Prescriptions</h1>
                                <p className="text-sm opacity-90">Consultez toutes les prescriptions</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-white text-primary-end' : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                            >
                                <Filter className="w-5 h-5" />
                                Filtres
                            </button>
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-2 bg-white text-primary-end px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                disabled={isLoading}
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                                Actualiser
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Period Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Période
                                </label>
                                <Select
                                    value={periodFilter}
                                    onChange={setPeriodFilter}
                                    className="w-full"
                                    options={[
                                        { value: 'all', label: 'Toutes' },
                                        { value: 'today', label: "Aujourd'hui" },
                                        { value: 'week', label: 'Cette semaine' },
                                        { value: 'month', label: 'Ce mois' },
                                        { value: 'year', label: 'Cette année' },
                                        { value: 'custom', label: 'Personnalisé' },
                                    ]}
                                />
                            </div>

                            {/* Custom Date Range */}
                            {periodFilter === 'custom' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Plage de dates
                                    </label>
                                    <RangePicker
                                        value={dateRange}
                                        onChange={setDateRange}
                                        className="w-full"
                                        format="DD/MM/YYYY"
                                    />
                                </div>
                            )}

                            {/* State Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                    État
                                </label>
                                <Select
                                    value={stateFilter}
                                    onChange={setStateFilter}
                                    className="w-full"
                                    options={[
                                        { value: 'all', label: 'Tous' },
                                        { value: 'en attente', label: 'En attente' },
                                        { value: 'effectuee', label: 'Effectuée' },
                                    ]}
                                />
                            </div>

                            {/* Reset Button */}
                            <div className="flex items-end">
                                <button
                                    onClick={resetFilters}
                                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Réinitialiser
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par patient, matricule, médecin ou médicament..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end"
                        />
                    </div>
                </div>

                {/* Prescriptions List */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader size="medium" color="primary-end" />
                    </div>
                ) : filteredPrescriptions.length === 0 ? (
                    <div className="text-center py-12">
                        <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {searchTerm || periodFilter !== 'all' || stateFilter !== 'all'
                                ? 'Aucune prescription trouvée avec ces critères'
                                : 'Aucune prescription enregistrée'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredPrescriptions.map((prescription) => {
                            const medications = parseMedications(prescription.liste_medicaments);
                            const isExpanded = expandedPrescription === prescription.id;
                            const displayedMeds = isExpanded ? medications : medications.slice(0, 3);
                            const hasMoreMeds = medications.length > 3;

                            return (
                                <div
                                    key={prescription.id}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                                >
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-lg shadow-md">
                                                {prescription.patient_nom?.[0] || 'P'}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {prescription.patient_nom || 'Patient'}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {prescription.patient_matricule || 'N/A'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(prescription.date_heure)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* State Badge */}
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStateColor(prescription.state)} font-medium text-sm`}>
                                            {prescription.state === 'effectuee' ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                <Clock className="w-4 h-4" />
                                            )}
                                            {prescription.state === 'effectuee' ? 'Effectuée' : 'En attente'}
                                        </div>
                                    </div>

                                    {/* Doctor Info */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">
                                        <Stethoscope className="w-4 h-4 text-primary-end" />
                                        <span className="font-medium">Prescrit par:</span>
                                        <span>Dr. {prescription.medecin_nom} {prescription.medecin_prenom}</span>
                                    </div>

                                    {/* Medications Grid */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <Pill className="w-4 h-4 text-primary-end" />
                                            <span>Médicaments prescrits ({medications.length})</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {displayedMeds.map((med, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getMedicationColor(med)} font-medium text-sm transition-all duration-200 hover:shadow-md`}
                                                >
                                                    {getMedicationIcon(med)}
                                                    <span>{med}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {hasMoreMeds && (
                                            <button
                                                onClick={() => toggleExpanded(prescription.id)}
                                                className="text-primary-end text-sm font-medium hover:underline flex items-center gap-1"
                                            >
                                                {isExpanded
                                                    ? '▲ Voir moins'
                                                    : `▼ Voir ${medications.length - 3} élément(s) de plus`
                                                }
                                            </button>
                                        )}

                                        {medications.length === 0 && prescription.liste_medicaments && (
                                            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-wrap">
                                                {prescription.liste_medicaments}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Statistics */}
                {!isLoading && (
                    <div className="mt-6 text-center text-gray-600">
                        <p>
                            {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? 's' : ''}
                            {(searchTerm || periodFilter !== 'all' || stateFilter !== 'all') && ` sur ${prescriptions.length} total`}
                        </p>
                    </div>
                )}
            </div>
        </CustomDashboard>
    );
}
