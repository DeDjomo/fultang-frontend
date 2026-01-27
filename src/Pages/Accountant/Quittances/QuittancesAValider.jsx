/**
 * Page de validation des quittances
 * Permet au comptable de valider les quittances et générer les écritures comptables
 */
import { useState, useEffect } from "react";
import { accountantNavLink } from "../NavLinks.js";
import { AccountantNavBar } from "../NavBar.jsx";
import { DashBoard } from "../../../GlobalComponents/DashBoard.jsx";
import { useAuthentication } from "../../../Utils/Provider.jsx";
import { message, Modal, Select, Spin, Tag, Tooltip } from "antd";
import {
    getQuittancesAValider,
    validerQuittance,
    getComptesProduits
} from "../../../services/accountantApi.js";
import {
    FaCheck,
    FaEye,
    FaExclamationTriangle,
    FaUser,
    FaCalendar,
    FaMoneyBillWave
} from "react-icons/fa";

export function QuittancesAValiderPage() {
    const { userData } = useAuthentication();
    const [isLoading, setIsLoading] = useState(true);
    const [quittances, setQuittances] = useState([]);
    const [total, setTotal] = useState(0);
    const [comptesProduits, setComptesProduits] = useState([]);

    // Validation Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedQuittance, setSelectedQuittance] = useState(null);
    const [selectedCompte, setSelectedCompte] = useState(undefined);
    const [isValidating, setIsValidating] = useState(false);

    // Details Modal state
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [detailsQuittance, setDetailsQuittance] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [quittancesData, comptesData] = await Promise.all([
                getQuittancesAValider(),
                getComptesProduits()
            ]);

            setQuittances(quittancesData.quittances || []);
            setTotal(quittancesData.total || 0);
            setComptesProduits(comptesData.comptes || []);
        } catch (error) {
            console.error('Error loading data:', error);
            message.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' FCFA';
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

    const openValidationModal = (quittance) => {
        setSelectedQuittance(quittance);
        setSelectedCompte(undefined);
        setIsModalVisible(true);
    };

    const openDetailsModal = (quittance) => {
        setDetailsQuittance(quittance);
        setIsDetailsModalVisible(true);
    };

    const handleValidation = async () => {
        if (!selectedCompte) {
            message.warning('Veuillez sélectionner un compte de produit');
            return;
        }

        setIsValidating(true);
        try {
            const result = await validerQuittance(selectedQuittance.idQuittance, selectedCompte);

            if (result.success) {
                message.success(
                    <span>
                        Quittance validée! Écriture <strong>{result.ecriture?.numero}</strong> créée.
                    </span>
                );
                setIsModalVisible(false);
                loadData(); // Refresh list
            } else {
                message.error(result.error || 'Erreur lors de la validation');
            }
        } catch (error) {
            console.error('Validation error:', error);
            message.error(error.response?.data?.error || 'Erreur lors de la validation');
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <DashBoard linkList={accountantNavLink} requiredRole={"comptable"}>
            <AccountantNavBar />
            <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quittances à Valider</h1>
                        <p className="text-gray-500">Validez les quittances pour générer les écritures comptables</p>
                    </div>
                    <div className="bg-orange-100 px-4 py-2 rounded-lg">
                        <p className="text-sm text-orange-600">En attente</p>
                        <p className="text-2xl font-bold text-orange-700">{quittances.length}</p>
                        <p className="text-sm text-orange-600">{formatCurrency(total)}</p>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" />
                    </div>
                ) : quittances.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-10 text-center">
                        <FaCheck className="text-green-500 text-6xl mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Toutes les quittances sont validées!</h2>
                        <p className="text-gray-500">Aucune quittance en attente de validation.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {quittances.map((q) => (
                            <div
                                key={q.idQuittance}
                                className="bg-white rounded-lg shadow-lg p-5 hover:shadow-xl transition-all border-l-4 border-orange-400"
                            >
                                <div className="flex justify-between items-start">
                                    {/* Left side - Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-800">{q.numero_quittance}</h3>
                                            <Tag color="orange">En attente</Tag>
                                            <Tag color="blue">{q.type_recette}</Tag>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <FaUser className="text-gray-400" />
                                                <div>
                                                    <p className="text-gray-500">Patient</p>
                                                    <p className="font-medium">{q.patient_full_name || 'N/A'}</p>
                                                    {q.patient_matricule && (
                                                        <p className="text-xs text-gray-400">{q.patient_matricule}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <FaCalendar className="text-gray-400" />
                                                <div>
                                                    <p className="text-gray-500">Date</p>
                                                    <p className="font-medium">{formatDate(q.date_paiement)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <FaMoneyBillWave className="text-gray-400" />
                                                <div>
                                                    <p className="text-gray-500">Mode</p>
                                                    <p className="font-medium capitalize">{q.mode_paiement}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-gray-500">Motif</p>
                                                <p className="font-medium">{q.Motif}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side - Amount & Actions */}
                                    <div className="text-right ml-4">
                                        <p className="text-2xl font-bold text-green-600 mb-3">
                                            {formatCurrency(parseFloat(q.Montant_paye))}
                                        </p>
                                        <div className="flex gap-2 justify-end">
                                            <Tooltip title="Voir détails">
                                                <button
                                                    onClick={() => openDetailsModal(q)}
                                                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                                                >
                                                    <FaEye className="text-gray-600" />
                                                </button>
                                            </Tooltip>
                                            <button
                                                onClick={() => openValidationModal(q)}
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2"
                                            >
                                                <FaCheck /> Valider
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Validation Modal */}
                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <FaExclamationTriangle className="text-orange-500" />
                            <span>Valider la quittance</span>
                        </div>
                    }
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                    width={500}
                >
                    {selectedQuittance && (
                        <div>
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Quittance:</span>
                                    <span className="font-bold">{selectedQuittance.numero_quittance}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Patient:</span>
                                    <span className="font-medium">{selectedQuittance.patient_full_name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Motif:</span>
                                    <span>{selectedQuittance.Motif}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Montant:</span>
                                    <span className="text-xl font-bold text-green-600">
                                        {formatCurrency(parseFloat(selectedQuittance.Montant_paye))}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Compte de produit (Crédit) *
                                </label>
                                <Select
                                    placeholder="Sélectionnez le compte de produit"
                                    className="w-full"
                                    size="large"
                                    value={selectedCompte}
                                    onChange={setSelectedCompte}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={comptesProduits
                                        .filter(c => c.numero_compte && c.numero_compte.length >= 6) // Only detail accounts (6+ digits)
                                        .map(c => ({
                                            value: c.id,
                                            label: `${c.numero_compte} - ${c.libelle}`
                                        }))}
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Le compte de trésorerie (Caisse/Banque) sera automatiquement déterminé selon le mode de paiement.
                                </p>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm">
                                <p className="font-medium text-blue-800 mb-1">Écriture à générer:</p>
                                <div className="flex justify-between text-blue-700">
                                    <span>Débit: {selectedQuittance.mode_paiement === 'especes' ? '571 Caisse' : '521 Banque'}</span>
                                    <span>{formatCurrency(parseFloat(selectedQuittance.Montant_paye))}</span>
                                </div>
                                <div className="flex justify-between text-blue-700">
                                    <span>Crédit: {selectedCompte ? comptesProduits.find(c => c.id === selectedCompte)?.numero_compte + ' ' + comptesProduits.find(c => c.id === selectedCompte)?.libelle : '???'}</span>
                                    <span>{formatCurrency(parseFloat(selectedQuittance.Montant_paye))}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsModalVisible(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleValidation}
                                    disabled={isValidating || !selectedCompte}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isValidating ? (
                                        <Spin size="small" />
                                    ) : (
                                        <>
                                            <FaCheck /> Valider et Générer l'écriture
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Details Modal */}
                <Modal
                    title={<span className="font-bold">Détails de la quittance</span>}
                    open={isDetailsModalVisible}
                    onCancel={() => setIsDetailsModalVisible(false)}
                    footer={[
                        <button
                            key="close"
                            onClick={() => setIsDetailsModalVisible(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Fermer
                        </button>,
                        <button
                            key="validate"
                            onClick={() => {
                                setIsDetailsModalVisible(false);
                                openValidationModal(detailsQuittance);
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ml-2"
                        >
                            <FaCheck className="inline mr-1" /> Passer à la validation
                        </button>
                    ]}
                    width={550}
                >
                    {detailsQuittance && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm opacity-80">N° Quittance</p>
                                        <p className="text-xl font-bold">{detailsQuittance.numero_quittance}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm opacity-80">Montant</p>
                                        <p className="text-2xl font-bold">{formatCurrency(parseFloat(detailsQuittance.Montant_paye))}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-700 mb-3">
                                    <FaUser className="inline mr-2 text-gray-500" /> Patient
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-gray-500">Nom:</span> <span className="font-medium">{detailsQuittance.patient_full_name || 'N/A'}</span></div>
                                    <div><span className="text-gray-500">Matricule:</span> <span className="font-medium">{detailsQuittance.patient_matricule || 'N/A'}</span></div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-700 mb-3">
                                    <FaMoneyBillWave className="inline mr-2 text-gray-500" /> Paiement
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-gray-500">Date:</span> <span className="font-medium">{formatDate(detailsQuittance.date_paiement)}</span></div>
                                    <div><span className="text-gray-500">Mode:</span> <span className="font-medium capitalize">{detailsQuittance.mode_paiement}</span></div>
                                    <div><span className="text-gray-500">Type:</span> <span className="font-medium">{detailsQuittance.type_recette}</span></div>
                                    <div><span className="text-gray-500">Motif:</span> <span className="font-medium">{detailsQuittance.Motif}</span></div>
                                </div>
                            </div>

                            {detailsQuittance.session_info && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-bold text-gray-700 mb-3">Session</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="text-gray-500">Service:</span> <span className="font-medium">{detailsQuittance.session_info.service}</span></div>
                                        <div><span className="text-gray-500">Statut:</span> <span className="font-medium">{detailsQuittance.session_info.statut}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </DashBoard>
    );
}
