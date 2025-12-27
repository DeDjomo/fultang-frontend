/**
 * Plan Comptable - Accountant Module
 * Manages the chart of accounts (OHADA compliant)
 */
import { accountantNavLink } from "../NavLinks.js";
import { AccountantNavBar } from "../NavBar.jsx";
import { DashBoard } from "../../../GlobalComponents/DashBoard.jsx";
import { useState, useEffect } from "react";
import { message, Modal, Input, Select, Switch } from "antd";
import {
    getComptesComptables,
    createCompteComptable,
    updateCompteComptable,
    deleteCompteComptable
} from "../../../services/accountantApi.js";
import { FaBookOpen, FaPlus, FaEdit, FaTrash, FaSearch, FaChevronDown, FaChevronRight } from "react-icons/fa";

export function PlanComptablePage() {
    const [comptes, setComptes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClasse, setSelectedClasse] = useState('');
    const [expandedClasses, setExpandedClasses] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingCompte, setEditingCompte] = useState(null);
    const [formData, setFormData] = useState({
        numero_compte: '',
        libelle: '',
        classe: '',
        type_compte: 'produit',
        description: '',
        actif: true
    });

    const classes = [
        { value: '1', label: 'Classe 1 - Comptes de Capitaux', color: 'bg-purple-500' },
        { value: '2', label: 'Classe 2 - Immobilisations', color: 'bg-indigo-500' },
        { value: '3', label: 'Classe 3 - Comptes de Stocks', color: 'bg-blue-500' },
        { value: '4', label: 'Classe 4 - Comptes de Tiers', color: 'bg-cyan-500' },
        { value: '5', label: 'Classe 5 - Comptes de Trésorerie', color: 'bg-teal-500' },
        { value: '6', label: 'Classe 6 - Comptes de Charges', color: 'bg-red-500' },
        { value: '7', label: 'Classe 7 - Comptes de Produits', color: 'bg-green-500' }
    ];

    useEffect(() => {
        fetchComptes();
    }, []);

    const fetchComptes = async () => {
        setLoading(true);
        try {
            const data = await getComptesComptables();
            const comptesArray = data.results || data || [];
            setComptes(comptesArray);
        } catch (error) {
            console.error('Error fetching comptes:', error);
            message.error('Erreur lors du chargement du plan comptable');
        } finally {
            setLoading(false);
        }
    };

    const toggleClass = (classe) => {
        setExpandedClasses(prev => ({ ...prev, [classe]: !prev[classe] }));
    };

    const filteredComptes = comptes.filter(compte => {
        const matchesSearch = compte.numero_compte?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            compte.libelle?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClasse = !selectedClasse || compte.classe === selectedClasse;
        return matchesSearch && matchesClasse;
    });

    const groupedComptes = filteredComptes.reduce((acc, compte) => {
        const classe = compte.classe;
        if (!acc[classe]) acc[classe] = [];
        acc[classe].push(compte);
        return acc;
    }, {});

    const getClasseInfo = (classe) => {
        return classes.find(c => c.value === classe) || { label: `Classe ${classe}`, color: 'bg-gray-500' };
    };

    const openCreateModal = () => {
        setEditingCompte(null);
        setFormData({ numero_compte: '', libelle: '', classe: '', type_compte: 'produit', description: '', actif: true });
        setShowModal(true);
    };

    const openEditModal = (compte) => {
        setEditingCompte(compte);
        setFormData({
            numero_compte: compte.numero_compte,
            libelle: compte.libelle,
            classe: compte.classe,
            type_compte: compte.type_compte,
            description: compte.description || '',
            actif: compte.actif
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        try {
            if (editingCompte) {
                await updateCompteComptable(editingCompte.id, formData);
                message.success('Compte modifié avec succès');
            } else {
                await createCompteComptable(formData);
                message.success('Compte créé avec succès');
            }
            setShowModal(false);
            fetchComptes();
        } catch (error) {
            console.error('Error saving compte:', error);
            message.error('Erreur: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (compte) => {
        Modal.confirm({
            title: 'Confirmer la suppression',
            content: `Supprimer le compte ${compte.numero_compte} - ${compte.libelle} ?`,
            okText: 'Supprimer',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk: async () => {
                try {
                    await deleteCompteComptable(compte.id);
                    message.success('Compte supprimé');
                    fetchComptes();
                } catch (error) {
                    message.error('Erreur lors de la suppression');
                }
            }
        });
    };

    return (
        <DashBoard linkList={accountantNavLink} requiredRole={"comptable"}>
            <AccountantNavBar />
            <div className="flex flex-col p-5">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                        <FaBookOpen className="text-indigo-600 text-3xl" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Plan Comptable OHADA</h1>
                            <p className="text-gray-500 text-sm">Gestion des comptes comptables</p>
                        </div>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        <FaPlus /> Nouveau Compte
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow-lg p-4 mb-5 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[250px]">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un compte..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border rounded-lg pl-10 pr-3 py-2"
                        />
                    </div>
                    <select
                        value={selectedClasse}
                        onChange={(e) => setSelectedClasse(e.target.value)}
                        className="border rounded-lg px-3 py-2 min-w-[200px]"
                    >
                        <option value="">Toutes les classes</option>
                        {classes.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                    <span className="text-gray-500">
                        <strong>{filteredComptes.length}</strong> compte{filteredComptes.length > 1 ? 's' : ''}
                    </span>
                </div>

                {/* Accounts List */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-gray-500">Chargement du plan comptable...</div>
                    ) : Object.keys(groupedComptes).length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            <FaBookOpen className="text-5xl mx-auto mb-3 text-gray-300" />
                            <p>Aucun compte trouvé</p>
                        </div>
                    ) : (
                        Object.keys(groupedComptes).sort().map(classe => {
                            const classeInfo = getClasseInfo(classe);
                            return (
                                <div key={classe}>
                                    {/* Class Header */}
                                    <div
                                        onClick={() => toggleClass(classe)}
                                        className={`flex items-center justify-between p-4 border-b cursor-pointer hover:bg-gray-50 transition-all`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {expandedClasses[classe] ?
                                                <FaChevronDown className="text-gray-500" /> :
                                                <FaChevronRight className="text-gray-500" />
                                            }
                                            <span className="font-bold text-gray-700">{classeInfo.label}</span>
                                        </div>
                                        <span className={`${classeInfo.color} text-white px-3 py-1 rounded-full text-xs`}>
                                            {groupedComptes[classe].length} compte{groupedComptes[classe].length > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Class Accounts */}
                                    {expandedClasses[classe] && (
                                        <div className="bg-gray-50">
                                            {groupedComptes[classe].sort((a, b) =>
                                                a.numero_compte.localeCompare(b.numero_compte)
                                            ).map(compte => (
                                                <div
                                                    key={compte.id}
                                                    className="flex items-center justify-between px-6 py-3 border-b border-gray-200 hover:bg-white transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-bold text-indigo-600 w-20">{compte.numero_compte}</span>
                                                        <span className="text-gray-700">{compte.libelle}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${compte.actif ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                            {compte.actif ? 'Actif' : 'Inactif'}
                                                        </span>
                                                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs capitalize">
                                                            {compte.type_compte}
                                                        </span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openEditModal(compte); }}
                                                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(compte); }}
                                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modal for Create/Edit */}
            <Modal
                title={editingCompte ? 'Modifier le compte' : 'Nouveau compte'}
                open={showModal}
                onOk={handleSubmit}
                onCancel={() => setShowModal(false)}
                okText={editingCompte ? 'Modifier' : 'Créer'}
                cancelText="Annuler"
            >
                <div className="space-y-4 py-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Numéro de compte *</label>
                        <Input
                            value={formData.numero_compte}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData({ ...formData, numero_compte: value, classe: value[0] || '' });
                            }}
                            placeholder="Ex: 706100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Libellé *</label>
                        <Input
                            value={formData.libelle}
                            onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                            placeholder="Ex: Consultations médicales"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Classe *</label>
                            <Select
                                value={formData.classe}
                                onChange={(value) => setFormData({ ...formData, classe: value })}
                                className="w-full"
                                placeholder="Sélectionner"
                            >
                                {classes.map(c => (
                                    <Select.Option key={c.value} value={c.value}>{c.label}</Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Type *</label>
                            <Select
                                value={formData.type_compte}
                                onChange={(value) => setFormData({ ...formData, type_compte: value })}
                                className="w-full"
                            >
                                <Select.Option value="actif">Actif</Select.Option>
                                <Select.Option value="passif">Passif</Select.Option>
                                <Select.Option value="charge">Charge</Select.Option>
                                <Select.Option value="produit">Produit</Select.Option>
                                <Select.Option value="tresorerie">Trésorerie</Select.Option>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Input.TextArea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            placeholder="Description optionnelle..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={formData.actif}
                            onChange={(checked) => setFormData({ ...formData, actif: checked })}
                        />
                        <span>Compte actif</span>
                    </div>
                </div>
            </Modal>
        </DashBoard>
    );
}

export default PlanComptablePage;
