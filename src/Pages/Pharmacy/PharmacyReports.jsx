import { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw, Plus, MessageSquare, CheckCircle, User, Calendar, Send, Paperclip, Trash2, Mail, Clock, Tag } from 'lucide-react';
import { message, Modal, Input, Button, Badge, Select, Upload, Tooltip } from 'antd';
import { PharmacyNavBar } from './PharmacyNavBar';
import { CustomDashboard } from '../../GlobalComponents/CustomDashboard';
import { pharmacyNavLink } from './lib/pharmacyNavLink';
import { getAllRapports, createRapport, markRapportAsRead, createPieceJointe, getPersonnelList } from '../../services/comptabiliteMatiereApi';
import Loader from '../../GlobalComponents/Loader';
import dayjs from 'dayjs';
import { useAuthentication } from '../../Utils/Provider.jsx';

const { TextArea } = Input;

export function PharmacyReports() {
    const { userData } = useAuthentication();
    const [rapports, setRapports] = useState([]);
    const [filteredRapports, setFilteredRapports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRapport, setSelectedRapport] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [personnel, setPersonnel] = useState([]);
    const [filterTab, setFilterTab] = useState('all'); // all, sent, received

    // Create form state - updated to match design
    const [formData, setFormData] = useState({
        objet: '',
        type_rapport: 'GENERAL',
        destinataire: null,
        corps: ''
    });
    const [piecesJointes, setPiecesJointes] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const typeRapportOptions = [
        { value: 'GENERAL', label: 'Général' },
        { value: 'INVENTAIRE', label: 'Inventaire' },
        { value: 'STOCK', label: 'Stock' },
        { value: 'LIVRAISON', label: 'Livraison' }
    ];

    useEffect(() => {
        fetchRapports();
        fetchPersonnel();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, rapports, filterTab]);

    const fetchRapports = async () => {
        setIsLoading(true);
        try {
            const response = await getAllRapports();
            let data = [];
            if (Array.isArray(response)) {
                data = response;
            } else if (response?.data && Array.isArray(response.data)) {
                data = response.data;
            } else if (response?.results && Array.isArray(response.results)) {
                data = response.results;
            }
            setRapports(data);
            setFilteredRapports(data);
        } catch (error) {
            console.error('Error fetching rapports:', error);
            message.error('Erreur lors de la récupération des rapports');
            setRapports([]);
            setFilteredRapports([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPersonnel = async () => {
        try {
            const response = await getPersonnelList();
            let data = [];
            if (Array.isArray(response)) {
                data = response;
            } else if (response?.data && Array.isArray(response.data)) {
                data = response.data;
            } else if (response?.results && Array.isArray(response.results)) {
                data = response.results;
            }
            setPersonnel(data);
        } catch (error) {
            console.error('Error fetching personnel:', error);
            // Use mock data if API fails
            setPersonnel([]);
        }
    };

    const applyFilters = () => {
        let filtered = [...rapports];

        // Filter by tab
        if (filterTab === 'sent' && userData?.id) {
            filtered = filtered.filter(r => r.expediteur === userData.id || r.id_personnel === userData.id);
        } else if (filterTab === 'received' && userData?.id) {
            filtered = filtered.filter(r => r.destinataire === userData.id);
        }

        // Filter by search term
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(rapport =>
                rapport.objet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rapport.corps?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rapport.id_personnel_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rapport.expediteur_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rapport.destinataire_nom?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredRapports(filtered);
    };

    const handleViewReport = async (rapport) => {
        setSelectedRapport(rapport);
        setIsDetailModalOpen(true);

        // Mark as read if unread
        if (rapport.statut === 'non lu' || !rapport.est_lu) {
            try {
                await markRapportAsRead(rapport.id);
                // Update local state
                setRapports(prev => prev.map(r =>
                    r.id === rapport.id ? { ...r, statut: 'lu', est_lu: true } : r
                ));
            } catch (error) {
                console.error('Error marking rapport as read:', error);
            }
        }
    };

    const handleCreateRapport = async () => {
        if (!formData.objet.trim()) {
            message.warning('Veuillez saisir l\'objet du rapport');
            return;
        }
        if (!formData.corps.trim()) {
            message.warning('Veuillez saisir le contenu du rapport');
            return;
        }

        setIsSubmitting(true);
        try {
            const rapportData = {
                objet: formData.objet,
                corps: formData.corps,
                type_rapport: formData.type_rapport,
                id_personnel: userData?.id || null,
                expediteur: userData?.id || null,
                destinataire: formData.destinataire
            };

            const rapportResponse = await createRapport(rapportData);

            // Create pieces jointes if any
            if (piecesJointes.length > 0 && rapportResponse.id) {
                for (const piece of piecesJointes) {
                    await createPieceJointe({
                        id_rapport: rapportResponse.id,
                        type_piece: piece.type || 'AUTRE',
                        nom_fichier: piece.name,
                        donnees_json: piece.data || null
                    });
                }
            }

            message.success('Rapport créé avec succès');
            setIsCreateModalOpen(false);
            resetForm();
            fetchRapports();
        } catch (error) {
            console.error('Error creating rapport:', error);
            message.error('Erreur lors de la création du rapport');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            objet: '',
            type_rapport: 'GENERAL',
            destinataire: null,
            corps: ''
        });
        setPiecesJointes([]);
    };

    const handleAddPieceJointe = () => {
        const newPiece = {
            id: Date.now(),
            name: '',
            type: 'AUTRE',
            data: null
        };
        setPiecesJointes([...piecesJointes, newPiece]);
    };

    const handleRemovePieceJointe = (id) => {
        setPiecesJointes(piecesJointes.filter(p => p.id !== id));
    };

    const handlePieceJointeChange = (id, field, value) => {
        setPiecesJointes(piecesJointes.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    };

    const getTypeRapportConfig = (type) => {
        const configs = {
            'GENERAL': { color: 'blue', label: 'Général' },
            'INVENTAIRE': { color: 'purple', label: 'Inventaire' },
            'STOCK': { color: 'orange', label: 'Stock' },
            'LIVRAISON': { color: 'green', label: 'Livraison' }
        };
        return configs[type] || configs['GENERAL'];
    };

    const unreadCount = rapports.filter(r => r.statut === 'non lu' || !r.est_lu).length;

    const filterTabs = [
        { key: 'all', label: 'Tous', icon: FileText },
        { key: 'received', label: 'Reçus', icon: Mail },
        { key: 'sent', label: 'Envoyés', icon: Send }
    ];

    const pieceJointeTypes = [
        { value: 'ETAT_STOCK', label: 'État du stock' },
        { value: 'ARCHIVE', label: 'Archive' },
        { value: 'ANCIEN_STOCK', label: 'Ancien stock' },
        { value: 'NOUVEAU_STOCK', label: 'Nouveau stock' },
        { value: 'DIFFERENCES', label: 'Différences' },
        { value: 'AUTRE', label: 'Autre' }
    ];

    return (
        <CustomDashboard linkList={pharmacyNavLink} requiredRole="Pharmacist">
            <PharmacyNavBar />

            <div className="p-6">
                {/* Header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start text-white rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Rapports</h1>
                                <p className="text-sm opacity-90">
                                    {filteredRapports.length} rapport{filteredRapports.length !== 1 ? 's' : ''}
                                    {unreadCount > 0 && ` (${unreadCount} non lu${unreadCount > 1 ? 's' : ''})`}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchRapports}
                                className="flex items-center gap-2 bg-white text-primary-end px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                disabled={isLoading}
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                                Actualiser
                            </button>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Nouveau Rapport
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {filterTabs.map(tab => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setFilterTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${filterTab === tab.key
                                    ? 'bg-primary-end text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-300 hover:border-primary-end'
                                    }`}
                            >
                                <TabIcon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par objet, contenu, expéditeur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-end"
                        />
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader size="medium" color="primary-end" />
                    </div>
                ) : filteredRapports.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? 'Aucun rapport trouvé' : 'Aucun rapport disponible'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredRapports.map((rapport) => {
                            const typeConfig = getTypeRapportConfig(rapport.type_rapport);
                            const isRead = rapport.statut === 'lu' || rapport.est_lu;

                            return (
                                <div
                                    key={rapport.id}
                                    onClick={() => handleViewReport(rapport)}
                                    className={`bg-white border rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer ${!isRead ? 'border-primary-end border-2' : 'border-gray-200'}`}
                                >
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`rounded-full w-14 h-14 flex items-center justify-center font-bold text-lg shadow-md ${!isRead ? 'bg-gradient-to-br from-primary-end to-primary-start text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                {(rapport.expediteur_nom || rapport.id_personnel_nom)?.[0] || 'R'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`text-xl font-bold ${!isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {rapport.objet}
                                                    </h3>
                                                    {!isRead && (
                                                        <span className="bg-primary-end text-white text-xs px-2 py-0.5 rounded-full">Nouveau</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        De: {rapport.expediteur_nom || rapport.id_personnel_nom || 'Inconnu'}
                                                    </span>
                                                    {rapport.destinataire_nom && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            À: {rapport.destinataire_nom}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(rapport.date_creation || rapport.date_envoi)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${isRead
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                {isRead ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    <MessageSquare className="w-4 h-4" />
                                                )}
                                                {isRead ? 'Lu' : 'Non lu'}
                                            </div>
                                            {rapport.type_rapport && (
                                                <Badge color={typeConfig.color} text={typeConfig.label} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <FileText className="w-4 h-4 text-primary-end" />
                                            <span>Aperçu du contenu</span>
                                        </div>
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {rapport.corps}
                                        </p>
                                    </div>

                                    {/* Attachments indicator */}
                                    {rapport.pieces_jointes && rapport.pieces_jointes.length > 0 && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                                            <Paperclip className="w-4 h-4" />
                                            {rapport.pieces_jointes.length} pièce(s) jointe(s)
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Modal
                title={null}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={null}
                width={700}
                centered
            >
                {selectedRapport && (() => {
                    const typeConfig = getTypeRapportConfig(selectedRapport.type_rapport);
                    const isRead = selectedRapport.statut === 'lu' || selectedRapport.est_lu;

                    return (
                        <div>
                            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                                <div className="bg-gradient-to-br from-primary-end to-primary-start rounded-xl w-14 h-14 flex items-center justify-center">
                                    <FileText className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-800">{selectedRapport.objet}</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <Badge
                                            status={isRead ? 'success' : 'warning'}
                                            text={isRead ? 'Lu' : 'Non lu'}
                                        />
                                        {selectedRapport.type_rapport && (
                                            <Badge color={typeConfig.color} text={typeConfig.label} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Contenu du rapport</label>
                                <div className="bg-gray-50 rounded-lg p-4 mt-2 max-h-72 overflow-y-auto">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedRapport.corps}</p>
                                </div>
                            </div>

                            {/* Pieces jointes */}
                            {selectedRapport.pieces_jointes && selectedRapport.pieces_jointes.length > 0 && (
                                <div className="mb-5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Pièces jointes</label>
                                    <div className="mt-2 space-y-2">
                                        {selectedRapport.pieces_jointes.map(piece => (
                                            <div key={piece.id_piece_jointe} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                                <Paperclip className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">{piece.nom_fichier || 'Fichier sans nom'}</span>
                                                <Badge text={pieceJointeTypes.find(t => t.value === piece.type_piece)?.label || piece.type_piece} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Expéditeur</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <User className="w-4 h-4 text-primary-end" />
                                        <span className="text-sm">{selectedRapport.expediteur_nom || selectedRapport.id_personnel_nom || 'Inconnu'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Destinataire</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="w-4 h-4 text-primary-end" />
                                        <span className="text-sm">{selectedRapport.destinataire_nom || 'Non spécifié'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Date d'envoi</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-primary-end" />
                                        <span className="text-sm">{formatDate(selectedRapport.date_creation || selectedRapport.date_envoi)}</span>
                                    </div>
                                </div>
                                {selectedRapport.date_lecture && (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Date de lecture</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-4 h-4 text-green-500" />
                                            <span className="text-sm">{formatDate(selectedRapport.date_lecture)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* Create Modal - Updated to match design */}
            <Modal
                title={null}
                open={isCreateModalOpen}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                }}
                footer={null}
                width={700}
                centered
            >
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-br from-primary-end to-primary-start rounded-xl w-12 h-12 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Nouveau Rapport</h2>
                            <p className="text-sm text-gray-500">Créer et envoyer un rapport interne</p>
                        </div>
                    </div>

                    {/* Objet */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Objet *</label>
                        <Input
                            value={formData.objet}
                            onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                            placeholder="Brève description du rapport"
                            size="large"
                            className="rounded-lg"
                        />
                    </div>

                    {/* Type de rapport & Destinataire */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Type de rapport</label>
                            <Select
                                value={formData.type_rapport}
                                onChange={(val) => setFormData({ ...formData, type_rapport: val })}
                                options={typeRapportOptions}
                                className="w-full"
                                size="large"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Destinataire</label>
                            <Select
                                value={formData.destinataire}
                                onChange={(val) => setFormData({ ...formData, destinataire: val })}
                                placeholder="Sélectionner un destinataire"
                                className="w-full"
                                size="large"
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={personnel.map(p => ({
                                    value: p.id || p.idPersonnel,
                                    label: `${p.nom || ''} ${p.prenom || ''} - ${p.role || p.fonction || ''}`
                                }))}
                            />
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Contenu *</label>
                        <TextArea
                            value={formData.corps}
                            onChange={(e) => setFormData({ ...formData, corps: e.target.value })}
                            placeholder="Rédigez le contenu de votre rapport..."
                            rows={6}
                            className="rounded-lg"
                        />
                    </div>

                    {/* Pièces jointes */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">Pièces jointes</label>
                            <Button
                                type="dashed"
                                onClick={handleAddPieceJointe}
                                icon={<Paperclip className="w-4 h-4" />}
                                className="flex items-center gap-1"
                            >
                                Ajouter une pièce jointe
                            </Button>
                        </div>

                        {piecesJointes.length > 0 && (
                            <div className="space-y-2">
                                {piecesJointes.map(piece => (
                                    <div key={piece.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                        <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <Input
                                            value={piece.name}
                                            onChange={(e) => handlePieceJointeChange(piece.id, 'name', e.target.value)}
                                            placeholder="Nom du fichier"
                                            size="small"
                                            className="flex-1"
                                        />
                                        <Select
                                            value={piece.type}
                                            onChange={(val) => handlePieceJointeChange(piece.id, 'type', val)}
                                            options={pieceJointeTypes}
                                            size="small"
                                            className="w-40"
                                        />
                                        <Button
                                            type="text"
                                            danger
                                            icon={<Trash2 className="w-4 h-4" />}
                                            onClick={() => handleRemovePieceJointe(piece.id)}
                                            size="small"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 justify-end border-t pt-4">
                        <Button
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                resetForm();
                            }}
                            className="rounded-lg h-10 px-6"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleCreateRapport}
                            loading={isSubmitting}
                            icon={<Send className="w-4 h-4" />}
                            className="rounded-lg h-10 px-6 bg-gradient-to-r from-primary-end to-primary-start border-none"
                        >
                            Envoyer le rapport
                        </Button>
                    </div>
                </div>
            </Modal>
        </CustomDashboard>
    );
}
