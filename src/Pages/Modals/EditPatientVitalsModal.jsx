import { useState, useEffect } from 'react';
import { Modal, Input, Select, InputNumber } from 'antd';
import { HeartPulse, FileText, Activity } from 'lucide-react';
import { updateDossierPatient, getDossierPatient } from '../../services/patientHistoryApi';
import { useFeedback } from '../../contexts/FeedbackContext.jsx';
import { useAuthentication } from '../../Utils/Provider';

const { TextArea } = Input;
const { Option } = Select;

/**
 * Modal pour éditer les constantes vitales et informations du dossier patient.
 * Accessible par les médecins et infirmiers.
 */
export function EditPatientVitalsModal({ isOpen, onClose, patientId, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [dossierId, setDossierId] = useState(null);
    const { userData } = useAuthentication();
    const { showSuccess, showError } = useFeedback();

    const [groupeOnly, setGroupeOnly] = useState(null);

    const [formData, setFormData] = useState({
        groupe_sanguin: null,
        facteur_rhesus: null,
        poids: null,
        taille: null,
        allergies: '',
        antecedents: ''
    });

    // Charger les données existantes à l'ouverture
    useEffect(() => {
        if (isOpen && patientId) {
            fetchDossierData();
        }
    }, [isOpen, patientId]);

    const fetchDossierData = async () => {
        setFetching(true);
        try {
            const response = await getDossierPatient(patientId);
            // Gestion robuste format réponse
            let data = null;
            if (response.success && response.data && Array.isArray(response.data)) {
                data = response.data.find(d => d.id_patient == patientId);
            } else if (Array.isArray(response)) {
                data = response.find(d => d.id_patient == patientId);
            } else if (response.id || response.id_patient) {
                data = response;
            }

            if (data) {
                setDossierId(data.id_patient);

                // Extraire le groupe sans le rhésus pour l'affichage (ex: "A+" -> "A")
                let grp = null;
                if (data.groupe_sanguin) {
                    grp = data.groupe_sanguin.replace('+', '').replace('-', '');
                }
                setGroupeOnly(grp);

                setFormData({
                    groupe_sanguin: data.groupe_sanguin, // On garde la valeur complète interne
                    facteur_rhesus: data.facteur_rhesus,
                    poids: data.poids,
                    taille: data.taille,
                    allergies: data.allergies || '',
                    antecedents: data.antecedents || ''
                });
            }
        } catch (error) {
            console.error("Erreur chargement dossier:", error);
            // Ne pas bloquer, on peut créer/updater quand même
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handler spécifique pour le groupe (A, B, AB, O)
    const handleGroupeChange = (val) => {
        setGroupeOnly(val);
        // On ne met pas à jour formData.groupe_sanguin tout de suite, on le fera au submit ou dynamiquement
        // Mais pour garder la synchro, on peut essayer de reconstruire si on a déjà le rhésus
        if (val && formData.facteur_rhesus) {
            const sign = formData.facteur_rhesus === 'Positif' ? '+' : (formData.facteur_rhesus === 'Negatif' ? '-' : formData.facteur_rhesus);
            // Le backend attend '+' ou '-' pour facteur_rhesus, et 'A+' pour groupe_sanguin
            // Attention: facteur_rhesus value dans le select doit être '+' ou '-'
            setFormData(prev => ({ ...prev, groupe_sanguin: `${val}${sign}` }));
        } else {
            // Si pas de rhésus, on ne peut pas faire un groupe valide pour le backend ('A' n'est pas dans les choices 'A+', 'A-')
            // On attend que l'utilisateur saisisse le rhésus
            setFormData(prev => ({ ...prev, groupe_sanguin: null }));
        }
    };

    const handleRhesusChange = (val) => {
        handleChange('facteur_rhesus', val);
        if (groupeOnly && val) {
            setFormData(prev => ({ ...prev, groupe_sanguin: `${groupeOnly}${val}` }));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Validation basique
            let dataToSend = { ...formData };

            // Si l'utilisateur a sélectionné Groupe et Rhésus, on s'assure que groupe_sanguin est bien combiné
            if (groupeOnly && formData.facteur_rhesus) {
                dataToSend.groupe_sanguin = `${groupeOnly}${formData.facteur_rhesus}`;
            }

            // L'ID du dossier est le même que l'ID du patient (OneToOne primary_key=True dans le modèle Django)
            await updateDossierPatient(patientId, dataToSend);

            showSuccess('Dossier médical mis à jour avec succès', 'Succès');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Erreur mise à jour dossier:', error);
            showError("Impossible de mettre à jour le dossier.", "Erreur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
            centered
            title={
                <div className="flex items-center gap-2 mb-4">
                    <HeartPulse className="w-6 h-6 text-red-500" />
                    <span className="text-xl font-bold text-gray-800">Données Médicales</span>
                </div>
            }
        >
            <div className="p-2 space-y-6">

                {/* 1. Constantes Vitales */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Métriques Corporelles
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Poids (kg)</label>
                            <InputNumber
                                className="w-full"
                                min={0}
                                max={500}
                                step={0.1}
                                value={formData.poids}
                                onChange={(val) => handleChange('poids', val)}
                                placeholder="Ex: 75.5"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Taille (m)</label>
                            <InputNumber
                                className="w-full"
                                min={0}
                                max={3}
                                step={0.01}
                                value={formData.taille}
                                onChange={(val) => handleChange('taille', val)}
                                placeholder="Ex: 1.80"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Groupe Sanguin */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                        <HeartPulse className="w-4 h-4" />
                        Groupe Sanguin
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Groupe</label>
                            <Select
                                className="w-full"
                                placeholder="Sélectionner"
                                value={groupeOnly}
                                onChange={handleGroupeChange}
                                allowClear
                            >
                                {['A', 'B', 'AB', 'O'].map(g => (
                                    <Option key={g} value={g}>{g}</Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Rhésus</label>
                            <Select
                                className="w-full"
                                placeholder="Rhésus"
                                value={formData.facteur_rhesus}
                                onChange={handleRhesusChange}
                                allowClear
                            >
                                <Option value="+">Positif (+)</Option>
                                <Option value="-">Négatif (-)</Option>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* 3. Informations Cliniques */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Informations Cliniques
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Allergies</label>
                            <TextArea
                                rows={2}
                                placeholder="Liste des allergies connues..."
                                value={formData.allergies}
                                onChange={(e) => handleChange('allergies', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Antécédents Médicaux</label>
                            <TextArea
                                rows={3}
                                placeholder="Antécédents chirurgicaux, maladies chroniques..."
                                value={formData.antecedents}
                                onChange={(e) => handleChange('antecedents', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || fetching}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium disabled:opacity-50"
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

import React from 'react';
