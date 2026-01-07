import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { DollarSign, Plus, X, Send } from 'lucide-react';
import PropTypes from 'prop-types';
import { getPatientQuittances, createQuittance, redirectPatientToService } from '../../services/quittancesApi';
import { getAllServices } from '../../services/servicesApi';
import { useFeedback } from '../../contexts/FeedbackContext.jsx';
import Loader from '../../GlobalComponents/Loader';

export default function PatientInvoiceModal({ isOpen, onClose, patient }) {

    PatientInvoiceModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        patient: PropTypes.object
    };

    const [quittances, setQuittances] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { showSuccess, showError, showWarning } = useFeedback();

    // Form state
    const [formData, setFormData] = useState({
        numero_quittance: '',
        Montant_paye: '',
        Motif: '',
        id_session: ''
    });

    //Redirect state
    const [showRedirectForm, setShowRedirectForm] = useState(false);
    const [selectedService, setSelectedService] = useState('');

    useEffect(() => {
        if (isOpen && patient) {
            loadQuittances();
            loadServices();
            setFormData(prev => ({ ...prev, id_session: patient.id_session }));
        }
    }, [isOpen, patient]);

    const loadQuittances = async () => {
        if (!patient) return;
        setLoading(true);
        try {
            const response = await getPatientQuittances(patient.id);
            if (response.success) {
                setQuittances(response.data || []);
            }
        } catch (error) {
            console.error('Error loading quittances:', error);
            showError('Erreur lors du chargement des reçus.', 'Échec');
        } finally {
            setLoading(false);
        }
    };

    const loadServices = async () => {
        try {
            const response = await getAllServices();
            setServices(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading services:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitQuittance = async (e) => {
        e.preventDefault();

        if (!formData.numero_quittance || !formData.Montant_paye || !formData.Motif) {
            showWarning('Veuillez remplir tous les champs.', 'Champs requis');
            return;
        }

        setSubmitting(true);
        try {
            const dataToSend = {
                ...formData,
                date_paiement: new Date().toISOString(),
                Montant_paye: parseFloat(formData.Montant_paye)
            };

            await createQuittance(dataToSend);
            showSuccess('Le reçu a été ajouté avec succès.', 'Reçu créé');
            setShowAddForm(false);
            setFormData({
                numero_quittance: '',
                Montant_paye: '',
                Motif: '',
                id_session: patient.id_session
            });
            loadQuittances();
        } catch (error) {
            console.error('Error creating quittance:', error);
            showError(error.response?.data?.detail || 'Erreur lors de la création du reçu.', 'Échec');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRedirectPatient = async () => {
        if (!selectedService) {
            showWarning('Veuillez sélectionner un service.', 'Champ requis');
            return;
        }

        setSubmitting(true);
        try {
            const response = await redirectPatientToService(patient.id, selectedService);
            if (response.success) {
                showSuccess(`Le patient a été redirigé vers ${selectedService}.`, 'Patient redirigé');
                setShowRedirectForm(false);
                setSelectedService('');
                onClose();
            }
        } catch (error) {
            console.error('Error redirecting patient:', error);
            showError('Erreur lors de la redirection du patient.', 'Échec');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setShowAddForm(false);
        setShowRedirectForm(false);
        setFormData({
            numero_quittance: '',
            Montant_paye: '',
            Motif: '',
            id_session: ''
        });
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            footer={null}
            width={900}
            title={null}
            className="invoice-modal"
        >
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 pb-4 border-b-2 border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-primary-end" />
                        Patient Invoices
                    </h2>
                    {patient && (
                        <div className="mt-3 text-gray-600">
                            <p className="text-lg"><span className="font-semibold">Patient:</span> {patient.prenom} {patient.nom}</p>
                            <p className="text-sm"><span className="font-semibold">ID:</span> {patient.matricule} | <span className="font-semibold">Service:</span> {patient.service_courant}</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => { setShowAddForm(!showAddForm); setShowRedirectForm(false); }}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition font-semibold shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Receipt
                    </button>
                    <button
                        onClick={() => { setShowRedirectForm(!showRedirectForm); setShowAddForm(false); }}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition font-semibold shadow-md"
                    >
                        <Send className="w-5 h-5" />
                        Redirect Patient
                    </button>
                </div>

                {/* Add Receipt Form */}
                {showAddForm && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg mb-6 border-2 border-green-200 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-600" />
                            New Receipt
                        </h3>
                        <form onSubmit={handleSubmitQuittance} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Receipt Number</label>
                                    <input
                                        type="text"
                                        name="numero_quittance"
                                        value={formData.numero_quittance}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g., QT-2024-001"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (FCFA)</label>
                                    <input
                                        type="number"
                                        name="Montant_paye"
                                        value={formData.Montant_paye}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose / Description</label>
                                <textarea
                                    name="Motif"
                                    value={formData.Motif}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    placeholder="Payment purpose or description..."
                                    required
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 font-semibold transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : 'Save Receipt'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Redirect Form */}
                {showRedirectForm && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg mb-6 border-2 border-blue-200 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Send className="w-5 h-5 text-blue-600" />
                            Redirect Patient to Another Service
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Service</label>
                                <select
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">-- Select Service --</option>
                                    {services.map((service) => (
                                        <option key={service.id} value={service.nom}>{service.nom}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowRedirectForm(false)}
                                    className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRedirectPatient}
                                    disabled={submitting}
                                    className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 font-semibold transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? 'Redirecting...' : 'Redirect Patient'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Receipts List */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Receipt History ({quittances.length})</h3>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader size="medium" color="primary-end" />
                        </div>
                    ) : quittances.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 text-lg font-medium">No receipts found for this patient</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {quittances.map((quittance) => (
                                <div key={quittance.idQuittance} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-3 py-1 bg-primary-end text-white rounded-full text-sm font-bold">
                                                    {quittance.numero_quittance}
                                                </span>
                                                <span className="text-2xl font-bold text-green-600">
                                                    {parseFloat(quittance.Montant_paye).toLocaleString()} FCFA
                                                </span>
                                            </div>
                                            <p className="text-gray-700 mb-2">{quittance.Motif}</p>
                                            <div className="flex gap-4 text-sm text-gray-600">
                                                <span><span className="font-semibold">Date:</span> {new Date(quittance.date_paiement).toLocaleString('en-US')}</span>
                                                {quittance.service && <span><span className="font-semibold">Service:</span> {quittance.service}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition flex items-center gap-2"
                    >
                        <X className="w-5 h-5" />
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
