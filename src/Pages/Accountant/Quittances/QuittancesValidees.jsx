/**
 * Page des quittances validées
 * Affiche les quittances validées avec possibilité de visualiser, télécharger et exporter
 */
import { useState, useEffect } from "react";
import { accountantNavLink } from "../NavLinks.js";
import { AccountantNavBar } from "../NavBar.jsx";
import { DashBoard } from "../../../GlobalComponents/DashBoard.jsx";
import { message, Modal, Spin, Tag, DatePicker, Button, Table, Tooltip } from "antd";
import {
    getQuittancesValidees,
    downloadQuittancePdf,
    downloadQuittancesCsv
} from "../../../services/accountantApi.js";
import {
    FaDownload,
    FaEye,
    FaFilePdf,
    FaFileCsv,
    FaCheckCircle,
    FaUser,
    FaCalendar,
    FaMoneyBillWave,
    FaFileAlt
} from "react-icons/fa";
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export function QuittancesValideesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [quittances, setQuittances] = useState([]);
    const [total, setTotal] = useState(0);
    const [dateRange, setDateRange] = useState(null);

    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedQuittance, setSelectedQuittance] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await getQuittancesValidees();
            setQuittances(data.quittances || []);
            setTotal(data.total || 0);
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
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const openDetailsModal = (quittance) => {
        setSelectedQuittance(quittance);
        setIsModalVisible(true);
    };

    const handleDownloadPdf = async (quittance) => {
        setIsDownloading(true);
        try {
            await downloadQuittancePdf(quittance.idQuittance);
            message.success('PDF généré avec succès');
        } catch (error) {
            console.error('Download error:', error);
            message.error('Erreur lors de la génération du PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleExportCsv = async () => {
        setIsDownloading(true);
        try {
            const filters = {};
            if (dateRange) {
                filters.date_debut = dateRange[0].format('YYYY-MM-DD');
                filters.date_fin = dateRange[1].format('YYYY-MM-DD');
            }
            await downloadQuittancesCsv(filters);
            message.success('Export CSV réussi');
        } catch (error) {
            console.error('Export error:', error);
            message.error('Erreur lors de l\'export CSV');
        } finally {
            setIsDownloading(false);
        }
    };

    // Table columns
    const columns = [
        {
            title: 'N° Quittance',
            dataIndex: 'numero_quittance',
            key: 'numero_quittance',
            render: (text) => <span className="font-medium text-blue-600">{text}</span>
        },
        {
            title: 'Patient',
            key: 'patient',
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.patient_full_name || 'N/A'}</div>
                    {record.patient_matricule && (
                        <div className="text-xs text-gray-400">{record.patient_matricule}</div>
                    )}
                </div>
            )
        },
        {
            title: 'Date',
            dataIndex: 'date_paiement',
            key: 'date_paiement',
            render: (date) => formatDate(date)
        },
        {
            title: 'Motif',
            dataIndex: 'Motif',
            key: 'Motif',
        },
        {
            title: 'Montant',
            dataIndex: 'Montant_paye',
            key: 'Montant_paye',
            render: (amount) => (
                <span className="font-bold text-green-600">
                    {formatCurrency(parseFloat(amount))}
                </span>
            ),
            align: 'right'
        },
        {
            title: 'Compte',
            key: 'compte',
            render: (_, record) => (
                record.compte_comptable_info ? (
                    <Tag color="purple">
                        {record.compte_comptable_info.numero}
                    </Tag>
                ) : <Tag color="gray">Non affecté</Tag>
            )
        },
        {
            title: 'Créé par',
            key: 'caissier',
            render: (_, record) => record.caissier_nom || 'N/A'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Tooltip title="Voir détails">
                        <button
                            onClick={() => openDetailsModal(record)}
                            className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all"
                        >
                            <FaEye className="text-blue-600" />
                        </button>
                    </Tooltip>
                    <Tooltip title="Télécharger PDF">
                        <button
                            onClick={() => handleDownloadPdf(record)}
                            className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-all"
                        >
                            <FaFilePdf className="text-red-600" />
                        </button>
                    </Tooltip>
                </div>
            ),
            align: 'center'
        }
    ];

    return (
        <DashBoard linkList={accountantNavLink} requiredRole={"comptable"}>
            <AccountantNavBar />
            <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quittances Validées</h1>
                        <p className="text-gray-500">Consultez, téléchargez et exportez les quittances validées</p>
                    </div>
                    <div className="bg-green-100 px-4 py-2 rounded-lg">
                        <p className="text-sm text-green-600">Total validé</p>
                        <p className="text-2xl font-bold text-green-700">{quittances.length}</p>
                        <p className="text-sm text-green-600">{formatCurrency(total)}</p>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center">
                            <span className="text-gray-600">Période:</span>
                            <RangePicker
                                onChange={(dates) => setDateRange(dates)}
                                format="DD/MM/YYYY"
                                placeholder={['Date début', 'Date fin']}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="primary"
                                icon={<FaFileCsv />}
                                onClick={handleExportCsv}
                                loading={isDownloading}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                Exporter CSV
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={quittances}
                        rowKey="idQuittance"
                        loading={isLoading}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} quittances`
                        }}
                    />
                </div>

                {/* Details Modal */}
                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <FaFileAlt className="text-blue-500" />
                            <span>Détails de la quittance</span>
                        </div>
                    }
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setIsModalVisible(false)}>
                            Fermer
                        </Button>,
                        <Button
                            key="download"
                            type="primary"
                            icon={<FaDownload />}
                            onClick={() => selectedQuittance && handleDownloadPdf(selectedQuittance)}
                            loading={isDownloading}
                            className="bg-blue-500"
                        >
                            Télécharger PDF
                        </Button>
                    ]}
                    width={600}
                >
                    {selectedQuittance && (
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm opacity-80">Numéro</p>
                                        <p className="text-xl font-bold">{selectedQuittance.numero_quittance}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm opacity-80">Montant</p>
                                        <p className="text-2xl font-bold">{formatCurrency(parseFloat(selectedQuittance.Montant_paye))}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <FaUser className="text-gray-500" /> Patient
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Nom:</span>
                                        <span className="ml-2 font-medium">{selectedQuittance.patient_full_name || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Matricule:</span>
                                        <span className="ml-2 font-medium">{selectedQuittance.patient_matricule || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <FaMoneyBillWave className="text-gray-500" /> Paiement
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Date:</span>
                                        <span className="ml-2 font-medium">{formatDate(selectedQuittance.date_paiement)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Mode:</span>
                                        <span className="ml-2 font-medium capitalize">{selectedQuittance.mode_paiement}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Type:</span>
                                        <span className="ml-2 font-medium">{selectedQuittance.type_recette}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Motif:</span>
                                        <span className="ml-2 font-medium">{selectedQuittance.Motif}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Validation Info */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <FaCheckCircle className="text-green-500" /> Validation
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Validé par:</span>
                                        <span className="ml-2 font-medium">{selectedQuittance.comptable_nom || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Date validation:</span>
                                        <span className="ml-2 font-medium">{formatDate(selectedQuittance.date_affectation_compte)}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Compte:</span>
                                        <span className="ml-2 font-medium">
                                            {selectedQuittance.compte_comptable_info
                                                ? `${selectedQuittance.compte_comptable_info.numero} - ${selectedQuittance.compte_comptable_info.libelle}`
                                                : 'Non affecté'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </DashBoard>
    );
}
