/**
 * Page des écritures comptables
 * Affiche toutes les écritures comptables avec filtrage par journal
 */
import { useState, useEffect } from "react";
import { accountantNavLink } from "../NavLinks.js";
import { AccountantNavBar } from "../NavBar.jsx";
import { DashBoard } from "../../../GlobalComponents/DashBoard.jsx";
import { message, Spin, Tag, DatePicker, Select, Table, Modal, Collapse, Tooltip } from "antd";
import {
    getEcritures,
    getEcrituresStatistiques,
    getJournaux
} from "../../../services/accountantApi.js";
import {
    FaFileAlt,
    FaBook,
    FaEye,
    FaCalendar,
    FaFilter,
    FaChartBar
} from "react-icons/fa";
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

export function EcrituresComptablesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [ecritures, setEcritures] = useState([]);
    const [journaux, setJournaux] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [dateRange, setDateRange] = useState(null);

    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedEcriture, setSelectedEcriture] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [ecrituresData, journauxData, statsData] = await Promise.all([
                getEcritures(),
                getJournaux(),
                getEcrituresStatistiques()
            ]);

            setEcritures(ecrituresData.results || ecrituresData || []);
            setJournaux(journauxData.results || journauxData || []);
            setStats(statsData);
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
            year: 'numeric'
        });
    };

    const openDetailsModal = (ecriture) => {
        setSelectedEcriture(ecriture);
        setIsModalVisible(true);
    };

    // Filter écritures
    const filteredEcritures = ecritures.filter(e => {
        if (selectedJournal && e.journal !== selectedJournal) return false;
        if (dateRange) {
            const ecritureDate = dayjs(e.date_ecriture);
            if (ecritureDate.isBefore(dateRange[0], 'day') || ecritureDate.isAfter(dateRange[1], 'day')) {
                return false;
            }
        }
        return true;
    });

    // Calculate totals
    const totalDebit = filteredEcritures.reduce((sum, e) => sum + parseFloat(e.total_debit || 0), 0);
    const totalCredit = filteredEcritures.reduce((sum, e) => sum + parseFloat(e.total_credit || 0), 0);

    // Table columns
    const columns = [
        {
            title: 'N° Écriture',
            dataIndex: 'numero_ecriture',
            key: 'numero_ecriture',
            render: (text) => <span className="font-medium text-blue-600">{text}</span>
        },
        {
            title: 'Date',
            dataIndex: 'date_ecriture',
            key: 'date_ecriture',
            render: (date) => formatDate(date)
        },
        {
            title: 'Journal',
            dataIndex: 'journal',
            key: 'journal',
            render: (code, record) => (
                <Tag color={
                    code === 'JC' ? 'green' :
                        code === 'JB' ? 'blue' :
                            code === 'JMM' ? 'purple' : 'gray'
                }>
                    {code}
                </Tag>
            )
        },
        {
            title: 'Libellé',
            dataIndex: 'libelle',
            key: 'libelle',
            ellipsis: true,
        },
        {
            title: 'Pièce',
            dataIndex: 'piece_justificative',
            key: 'piece_justificative',
            render: (piece) => piece || '-'
        },
        {
            title: 'Débit',
            dataIndex: 'total_debit',
            key: 'total_debit',
            render: (amount) => (
                <span className="font-bold text-blue-600">
                    {formatCurrency(parseFloat(amount || 0))}
                </span>
            ),
            align: 'right'
        },
        {
            title: 'Crédit',
            dataIndex: 'total_credit',
            key: 'total_credit',
            render: (amount) => (
                <span className="font-bold text-green-600">
                    {formatCurrency(parseFloat(amount || 0))}
                </span>
            ),
            align: 'right'
        },
        {
            title: 'Équilibre',
            key: 'equilibre',
            render: (_, record) => (
                record.is_equilibree ?
                    <Tag color="green">✓</Tag> :
                    <Tag color="red">✗</Tag>
            ),
            align: 'center'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Tooltip title="Voir détails">
                    <button
                        onClick={() => openDetailsModal(record)}
                        className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all"
                    >
                        <FaEye className="text-blue-600" />
                    </button>
                </Tooltip>
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
                        <h1 className="text-2xl font-bold text-gray-800">Écritures Comptables</h1>
                        <p className="text-gray-500">Journal des écritures comptables en partie double</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-blue-100 px-4 py-2 rounded-lg text-center">
                            <p className="text-sm text-blue-600">Total Débit</p>
                            <p className="text-xl font-bold text-blue-700">{formatCurrency(totalDebit)}</p>
                        </div>
                        <div className="bg-green-100 px-4 py-2 rounded-lg text-center">
                            <p className="text-sm text-green-600">Total Crédit</p>
                            <p className="text-xl font-bold text-green-700">{formatCurrency(totalCredit)}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
                            <p className="text-gray-500 text-sm">Total Écritures</p>
                            <p className="text-2xl font-bold">{stats.total_ecritures}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                            <p className="text-gray-500 text-sm">Aujourd'hui</p>
                            <p className="text-2xl font-bold">{stats.ecritures_jour}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                            <p className="text-gray-500 text-sm">Ce mois</p>
                            <p className="text-2xl font-bold">{stats.ecritures_mois}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                            <p className="text-gray-500 text-sm">Journaux actifs</p>
                            <p className="text-2xl font-bold">{Object.keys(stats.par_journal || {}).length}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-gray-400" />
                            <span className="text-gray-600">Filtres:</span>
                        </div>
                        <Select
                            placeholder="Tous les journaux"
                            allowClear
                            style={{ width: 200 }}
                            onChange={(value) => setSelectedJournal(value)}
                            options={[
                                { value: undefined, label: 'Tous les journaux' },
                                ...journaux.map(j => ({ value: j.code, label: `${j.code} - ${j.libelle}` }))
                            ]}
                        />
                        <RangePicker
                            onChange={(dates) => setDateRange(dates)}
                            format="DD/MM/YYYY"
                            placeholder={['Date début', 'Date fin']}
                        />
                        <span className="text-gray-500">
                            {filteredEcritures.length} écriture(s)
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={filteredEcritures}
                        rowKey="id"
                        loading={isLoading}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} écritures`
                        }}
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row className="bg-gray-100 font-bold">
                                    <Table.Summary.Cell index={0} colSpan={5}>TOTAUX</Table.Summary.Cell>
                                    <Table.Summary.Cell index={5} align="right" className="text-blue-600">
                                        {formatCurrency(totalDebit)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={6} align="right" className="text-green-600">
                                        {formatCurrency(totalCredit)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={7} colSpan={2}></Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                </div>

                {/* Details Modal */}
                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <FaFileAlt className="text-indigo-500" />
                            <span>Détails de l'écriture</span>
                        </div>
                    }
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                    width={700}
                >
                    {selectedEcriture && (
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm opacity-80">N° Écriture</p>
                                        <p className="text-xl font-bold">{selectedEcriture.numero_ecriture}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm opacity-80">Date</p>
                                        <p className="text-lg font-bold">{formatDate(selectedEcriture.date_ecriture)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Journal:</span>
                                        <span className="ml-2 font-medium">{selectedEcriture.journal_libelle}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Pièce:</span>
                                        <span className="ml-2 font-medium">{selectedEcriture.piece_justificative || '-'}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Libellé:</span>
                                        <span className="ml-2 font-medium">{selectedEcriture.libelle}</span>
                                    </div>
                                    {selectedEcriture.quittance_numero && (
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Quittance:</span>
                                            <Tag color="blue" className="ml-2">{selectedEcriture.quittance_numero}</Tag>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500">Comptable:</span>
                                        <span className="ml-2 font-medium">{selectedEcriture.comptable_nom || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Lignes */}
                            <div>
                                <h4 className="font-bold text-gray-700 mb-3">Lignes de l'écriture</h4>
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-2 text-left border">Compte</th>
                                            <th className="p-2 text-left border">Libellé</th>
                                            <th className="p-2 text-right border">Débit</th>
                                            <th className="p-2 text-right border">Crédit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedEcriture.lignes?.map((ligne, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="p-2 border">
                                                    <span className="font-medium">{ligne.compte_numero}</span>
                                                    <span className="text-gray-500 text-sm ml-2">{ligne.compte_libelle}</span>
                                                </td>
                                                <td className="p-2 border text-sm">{ligne.libelle}</td>
                                                <td className="p-2 border text-right font-bold text-blue-600">
                                                    {parseFloat(ligne.montant_debit) > 0 ? formatCurrency(parseFloat(ligne.montant_debit)) : ''}
                                                </td>
                                                <td className="p-2 border text-right font-bold text-green-600">
                                                    {parseFloat(ligne.montant_credit) > 0 ? formatCurrency(parseFloat(ligne.montant_credit)) : ''}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-100 font-bold">
                                            <td colSpan="2" className="p-2 border">TOTAL</td>
                                            <td className="p-2 border text-right text-blue-600">
                                                {formatCurrency(parseFloat(selectedEcriture.total_debit))}
                                            </td>
                                            <td className="p-2 border text-right text-green-600">
                                                {formatCurrency(parseFloat(selectedEcriture.total_credit))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Équilibre */}
                            <div className={`p-3 rounded-lg text-center ${selectedEcriture.is_equilibree ? 'bg-green-100' : 'bg-red-100'}`}>
                                {selectedEcriture.is_equilibree ? (
                                    <span className="text-green-700 font-medium">✓ Écriture équilibrée (Débit = Crédit)</span>
                                ) : (
                                    <span className="text-red-700 font-medium">✗ Écriture NON équilibrée</span>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </DashBoard>
    );
}
