import { useState, useEffect } from 'react';
import { Modal, message, Alert, Select, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { Building2, User, UserCheck, UserPlus } from 'lucide-react';
import { createService } from '../../../services/servicesApi';
import { getAllPersonnel } from '../../../services/personnelApi';

/**
 * Modal pour ajouter un nouveau service avec son chef.
 * Permet de choisir un chef existant ou d'en créer un nouveau.
 */
export function AddServiceModal({ isOpen, onClose, onSuccess }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [chefMode, setChefMode] = useState('existing');
    const [personnelList, setPersonnelList] = useState([]);
    const [loadingPersonnel, setLoadingPersonnel] = useState(false);
    const [selectedChefId, setSelectedChefId] = useState(null);

    const [formData, setFormData] = useState({
        nom_service: '',
        desc_service: '',
        chef_nom: '',
        chef_prenom: '',
        chef_date_naissance: '',
        chef_email: '',
        chef_contact: '',
        chef_poste: '',
        chef_specialite: ''
    });

    const POSTES = [
        { value: 'receptioniste', label: t('personnel.positions.receptioniste') },
        { value: 'caissier', label: t('personnel.positions.caissier') },
        { value: 'infirmier', label: t('personnel.positions.infirmier') },
        { value: 'medecin', label: t('personnel.positions.medecin') },
        { value: 'laborantin', label: t('personnel.positions.laborantin') },
        { value: 'pharmacien', label: t('personnel.positions.pharmacien') },
        { value: 'comptable', label: t('personnel.positions.comptable') },
        { value: 'directeur', label: t('personnel.positions.directeur') }
    ];

    // Charger la liste du personnel quand le modal s'ouvre
    useEffect(() => {
        if (isOpen) {
            loadPersonnel();
            setApiError(null);
        }
    }, [isOpen]);

    const loadPersonnel = async () => {
        setLoadingPersonnel(true);
        try {
            const response = await getAllPersonnel();
            // L'API retourne { success: true, count: X, data: [...] }
            const data = response.results || response.data || response || [];
            console.log('Personnel loaded:', data);
            setPersonnelList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading personnel:', error);
            setPersonnelList([]);
        } finally {
            setLoadingPersonnel(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
        setApiError(null);
    };

    const handleChefSelect = (value) => {
        setSelectedChefId(value);
        if (errors.chef_service_id) {
            setErrors(prev => ({ ...prev, chef_service_id: null }));
        }
        setApiError(null);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nom_service.trim()) {
            newErrors.nom_service = t('services.required');
        }

        if (chefMode === 'existing') {
            if (!selectedChefId) {
                newErrors.chef_service_id = 'Veuillez sélectionner un membre du personnel';
            }
        } else {
            if (!formData.chef_nom.trim()) newErrors.chef_nom = t('services.required');
            if (!formData.chef_prenom.trim()) newErrors.chef_prenom = t('services.required');
            if (!formData.chef_date_naissance) newErrors.chef_date_naissance = t('services.required');
            if (!formData.chef_email.trim()) newErrors.chef_email = t('services.required');
            if (!formData.chef_contact.trim()) {
                newErrors.chef_contact = t('services.required');
            } else if (!/^6\d{8}$/.test(formData.chef_contact)) {
                newErrors.chef_contact = t('services.phoneFormat');
            }
            if (!formData.chef_poste) newErrors.chef_poste = t('services.required');
            if (formData.chef_poste === 'medecin' && !formData.chef_specialite.trim()) {
                newErrors.chef_specialite = t('services.specialtyRequired');
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatErrorMessage = (errorData) => {
        if (typeof errorData === 'string') return errorData;
        if (errorData.erreurs) {
            const messages = [];
            for (const [field, fieldErrors] of Object.entries(errorData.erreurs)) {
                const errorList = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
                messages.push(`${field}: ${errorList.join(', ')}`);
            }
            return messages.join('\n');
        }
        if (errorData.detail) return errorData.detail;
        if (errorData.error) return `${errorData.error}: ${errorData.detail || ''}`;
        return JSON.stringify(errorData);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setApiError(null);

        try {
            let dataToSend = {
                nom_service: formData.nom_service.trim(),
                desc_service: formData.desc_service.trim(),
            };

            if (chefMode === 'existing' && selectedChefId) {
                // S'assurer que c'est bien un entier
                dataToSend.chef_service_id = parseInt(selectedChefId, 10);
                console.log('Mode: existing, chef_service_id:', dataToSend.chef_service_id);
            } else if (chefMode === 'new') {
                dataToSend = {
                    ...dataToSend,
                    chef_nom: formData.chef_nom.trim(),
                    chef_prenom: formData.chef_prenom.trim(),
                    chef_date_naissance: formData.chef_date_naissance,
                    chef_email: formData.chef_email.trim().toLowerCase(),
                    chef_contact: formData.chef_contact.trim(),
                    chef_poste: formData.chef_poste
                };

                if (formData.chef_poste === 'medecin' && formData.chef_specialite.trim()) {
                    dataToSend.chef_specialite = formData.chef_specialite.trim();
                }
                console.log('Mode: new, chef data included');
            }

            console.log('Final data to send:', JSON.stringify(dataToSend, null, 2));

            await createService(dataToSend);
            message.success(t('services.createSuccess'));
            resetForm();
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating service:', error);
            const errorData = error.response?.data;
            const errorMsg = formatErrorMessage(errorData);
            setApiError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nom_service: '',
            desc_service: '',
            chef_nom: '',
            chef_prenom: '',
            chef_date_naissance: '',
            chef_email: '',
            chef_contact: '',
            chef_poste: '',
            chef_specialite: ''
        });
        setSelectedChefId(null);
        setChefMode('existing');
        setErrors({});
        setApiError(null);
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    // Options pour le Select avec recherche
    const personnelOptions = personnelList.map(p => ({
        value: p.id,
        label: `${p.nom} ${p.prenom || ''} - ${p.poste || 'N/A'}`,
        desc: p.matricule ? `Matricule: ${p.matricule}` : p.email
    }));

    // Trouver le chef sélectionné pour afficher ses détails
    const selectedChef = personnelList.find(p => p.id === selectedChefId);

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary-end" />
                    <span>{t('services.addService')}</span>
                </div>
            }
            open={isOpen}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText={t('common.save')}
            cancelText={t('common.cancel')}
            width={700}
        >
            <div className="space-y-6 py-4">
                {/* Affichage des erreurs API */}
                {apiError && (
                    <Alert
                        type="error"
                        message={t('common.error')}
                        description={<pre className="whitespace-pre-wrap text-sm">{apiError}</pre>}
                        showIcon
                        closable
                        onClose={() => setApiError(null)}
                    />
                )}

                {/* Section Service */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        {t('services.serviceInfo')}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('services.serviceName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nom_service"
                                value={formData.nom_service}
                                onChange={handleChange}
                                placeholder="Ex: Cardiologie, Pédiatrie, Urgences..."
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end focus:border-primary-end ${errors.nom_service ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.nom_service && <p className="text-red-500 text-xs mt-1">{errors.nom_service}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('services.serviceDescription')} <span className="text-gray-400 text-xs">(optionnel)</span>
                            </label>
                            <textarea
                                name="desc_service"
                                value={formData.desc_service}
                                onChange={handleChange}
                                placeholder="Description du service..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-primary-end"
                            />
                        </div>
                    </div>
                </div>

                {/* Section Chef de Service */}
                <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Chef de Service
                    </h3>

                    {/* Choix du mode */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-3">Comment souhaitez-vous désigner le chef de service ?</p>
                        <Radio.Group
                            value={chefMode}
                            onChange={(e) => setChefMode(e.target.value)}
                            className="w-full"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <Radio.Button
                                    value="existing"
                                    className="h-auto py-3 px-4 flex items-center justify-center"
                                    style={{ height: 'auto' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Personnel existant</div>
                                            <div className="text-xs text-gray-500">Choisir dans la liste</div>
                                        </div>
                                    </div>
                                </Radio.Button>
                                <Radio.Button
                                    value="new"
                                    className="h-auto py-3 px-4 flex items-center justify-center"
                                    style={{ height: 'auto' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Nouveau personnel</div>
                                            <div className="text-xs text-gray-500">Créer un compte</div>
                                        </div>
                                    </div>
                                </Radio.Button>
                            </div>
                        </Radio.Group>
                    </div>

                    {chefMode === 'existing' ? (
                        /* Mode sélection d'un personnel existant */
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rechercher un membre du personnel <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    showSearch
                                    placeholder="Tapez un nom pour rechercher..."
                                    value={selectedChefId}
                                    onChange={handleChefSelect}
                                    loading={loadingPersonnel}
                                    className="w-full"
                                    size="large"
                                    optionFilterProp="label"
                                    filterOption={(input, option) => {
                                        const searchText = `${option.label} ${option.desc}`.toLowerCase();
                                        return searchText.includes(input.toLowerCase());
                                    }}
                                    options={personnelOptions}
                                    optionRender={(option) => (
                                        <div className="py-1">
                                            <div className="font-medium">{option.data.label}</div>
                                            <div className="text-xs text-gray-500">{option.data.desc}</div>
                                        </div>
                                    )}
                                    notFoundContent={
                                        loadingPersonnel
                                            ? 'Chargement...'
                                            : personnelList.length === 0
                                                ? 'Aucun personnel trouvé'
                                                : 'Aucun résultat'
                                    }
                                    allowClear
                                    status={errors.chef_service_id ? 'error' : ''}
                                />
                                {errors.chef_service_id && (
                                    <p className="text-red-500 text-xs mt-1">{errors.chef_service_id}</p>
                                )}
                            </div>

                            {/* Aperçu du chef sélectionné */}
                            {selectedChef && (
                                <div className="bg-white rounded-lg p-3 border border-blue-200">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Chef sélectionné :</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="text-gray-500">Nom:</span> {selectedChef.nom} {selectedChef.prenom || ''}</div>
                                        <div><span className="text-gray-500">Poste:</span> {selectedChef.poste}</div>
                                        <div><span className="text-gray-500">Matricule:</span> {selectedChef.matricule || 'N/A'}</div>
                                        <div><span className="text-gray-500">Email:</span> {selectedChef.email}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Mode création d'un nouveau chef */
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                                💡 Un compte sera créé pour ce nouveau membre du personnel. Le mot de passe sera envoyé par email.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="chef_nom"
                                        value={formData.chef_nom}
                                        onChange={handleChange}
                                        placeholder="Nom de famille"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_nom ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.chef_nom && <p className="text-red-500 text-xs mt-1">{errors.chef_nom}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prénom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="chef_prenom"
                                        value={formData.chef_prenom}
                                        onChange={handleChange}
                                        placeholder="Prénom"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_prenom ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.chef_prenom && <p className="text-red-500 text-xs mt-1">{errors.chef_prenom}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date de naissance <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="chef_date_naissance"
                                        value={formData.chef_date_naissance}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_date_naissance ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.chef_date_naissance && <p className="text-red-500 text-xs mt-1">{errors.chef_date_naissance}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="chef_email"
                                        value={formData.chef_email}
                                        onChange={handleChange}
                                        placeholder="exemple@hospital.cm"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_email ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.chef_email && <p className="text-red-500 text-xs mt-1">{errors.chef_email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Téléphone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="chef_contact"
                                        value={formData.chef_contact}
                                        onChange={handleChange}
                                        placeholder="677123456"
                                        maxLength={9}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_contact ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">9 chiffres, commence par 6</p>
                                    {errors.chef_contact && <p className="text-red-500 text-xs mt-1">{errors.chef_contact}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Poste <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="chef_poste"
                                        value={formData.chef_poste}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_poste ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">-- Sélectionner --</option>
                                        {POSTES.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                    {errors.chef_poste && <p className="text-red-500 text-xs mt-1">{errors.chef_poste}</p>}
                                </div>
                                {formData.chef_poste === 'medecin' && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Spécialité <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="chef_specialite"
                                            value={formData.chef_specialite}
                                            onChange={handleChange}
                                            placeholder="Ex: Cardiologie, Pédiatrie..."
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_specialite ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.chef_specialite && <p className="text-red-500 text-xs mt-1">{errors.chef_specialite}</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
