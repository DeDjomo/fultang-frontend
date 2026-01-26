import { useState } from 'react';
import { Modal } from 'antd';
import { DollarSign, User, CheckCircle } from 'lucide-react';
import { putSessionEnAttente } from '../../services/sessionsApi';
import { useFeedback } from '../../contexts/FeedbackContext.jsx';

/**
 * Modal simplifié pour envoyer un patient à la caisse.
 * Change simplement le statut de la session en 'en attente' sans demander de service.
 * 
 * @param {boolean} isOpen - État d'ouverture du modal
 * @param {function} onClose - Callback de fermeture  
 * @param {Object} patient - Patient sélectionné
 * @param {number} sessionId - ID de la session du patient
 * @param {function} onSuccess - Callback après succès
 */
export function SendToCashierModal({ isOpen, onClose, patient, sessionId, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useFeedback();

    const handleConfirm = async () => {
        if (!sessionId) {
            showError('ID de session manquant.', 'Erreur');
            return;
        }

        setLoading(true);
        try {
            // Mettre la session en attente (statut 'en attente')
            await putSessionEnAttente(sessionId);

            showSuccess('Le patient a été envoyé à la caisse avec succès.', 'Patient envoyé');

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error sending to cashier:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'Erreur lors de l\'envoi à la caisse.';
            showError(errorMessage, 'Échec');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={450}
            centered
        >
            <div className="p-2">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                        <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Envoyer à la caisse
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Le patient sera redirigé vers la caisse pour le paiement
                    </p>
                </div>

                {/* Info patient */}
                {patient && (
                    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">
                                    {patient.nom} {patient.prenom}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Matricule: {patient.matricule}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message de confirmation */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <p className="text-sm text-blue-800">
                            En confirmant, la session du patient sera mise en statut <strong>"en attente"</strong> et le patient apparaîtra dans la liste d'attente du caissier.
                        </p>
                    </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            'Traitement...'
                        ) : (
                            <>
                                <DollarSign className="w-5 h-5" />
                                Confirmer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default SendToCashierModal;
