import { PharmacistDashBoard } from "./Components/PharmacistDashboard";
import { PharmacistNavLink } from "./PharmacistNavLink";
import { PharmacistNavBar } from "./Components/PharmacistNavBar";
import { useState, useEffect } from "react";
import {
    FaShoppingCart,
    FaPlus,
    FaTrash,
    FaSave,
    FaCheckCircle,
    FaFilePdf,
    FaEye,
    FaSpinner,
    FaSyncAlt
} from "react-icons/fa";
import jsPDF from "jspdf";
import { materielMedicalApi, sortieApi, ligneSortieApi } from "../../services/comptabiliteMatiereApi";

export function PharmacistDailySales() {
    // États
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Base de médicaments disponibles (depuis l'API)
    const [medicationsDatabase, setMedicationsDatabase] = useState([]);

    // Formulaire de nouvelle vente
    const [saleForm, setSaleForm] = useState({
        articles: [
            { id: 1, materialCode: "", materialName: "", materialId: null, quantity: "", stockDisponible: 0 }
        ]
    });

    // Liste des ventes du jour
    const [dailySales, setDailySales] = useState([]);

    const [successMessage, setSuccessMessage] = useState("");
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);

    // Charger les données depuis l'API
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const token = localStorage.getItem("token_key_fultang");
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        const baseUrl = "http://127.0.0.1:8000/api";

        try {
            setLoading(true);
            setError(null);

            // Charger les deux en parallèle
            const [materielsRes, sortiesRes] = await Promise.all([
                fetch(`${baseUrl}/materiels-medicaux/`, { headers, cache: "no-store" }).then(res => res.json()),
                fetch(`${baseUrl}/sorties/`, { headers, cache: "no-store" }).then(res => res.json())
            ]);

            // 1. Matériels disponibles
            const materiels = materielsRes.results || materielsRes || [];
            const medicationsList = materiels.map(m => ({
                id: m.idMateriel || m.materiel_ptr_id,
                code: m.code_materiel,
                name: m.nom_Materiel,
                quantity: m.quantite_stock
            }));
            setMedicationsDatabase(medicationsList);

            // 2. Ventes du jour
            const sortiesData = sortiesRes.results || sortiesRes || [];
            const today = new Date().toISOString().split('T')[0];

            const ventesAujourdHui = sortiesData.filter(s => {
                const sortieDate = s.date_sortie?.split('T')[0] || '';
                return sortieDate === today && s.motif_sortie === 'VENTE';
            }).map(s => ({
                id: s.numero_sortie || `VTE-${s.idSortie}`,
                idSortie: s.idSortie,
                articles: [],
                motif: "Vente",
                date: s.date_sortie?.split('T')[0],
                heure: new Date(s.date_sortie).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            }));
            setDailySales(ventesAujourdHui);

        } catch (err) {
            console.error("Erreur chargement données:", err);
            setError("Impossible de charger les données fraîches.");
        } finally {
            setLoading(false);
        }
    }

    function generateSaleId() {
        const year = new Date().getFullYear();
        const nextNumber = dailySales.length + 1;
        return `VTE-${year}-${String(nextNumber).padStart(3, '0')}`;
    }

    function addArticle() {
        const newArticle = {
            id: Date.now(),
            materialCode: "",
            materialName: "",
            materialId: null,
            quantity: "",
            stockDisponible: 0
        };
        setSaleForm({
            ...saleForm,
            articles: [...saleForm.articles, newArticle]
        });
    }

    function removeArticle(id) {
        if (saleForm.articles.length > 1) {
            setSaleForm({
                ...saleForm,
                articles: saleForm.articles.filter(a => a.id !== id)
            });
        }
    }

    function updateArticle(id, field, value) {
        setSaleForm({
            ...saleForm,
            articles: saleForm.articles.map(article => {
                if (article.id !== id) return article;

                if (field === 'materialCode') {
                    const medication = medicationsDatabase.find(m => m.code === value);
                    return {
                        ...article,
                        materialCode: value,
                        materialName: medication ? medication.name : "",
                        materialId: medication ? medication.id : null,
                        stockDisponible: medication ? medication.quantity : 0
                    };
                }

                return { ...article, [field]: value };
            })
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Validation
        const hasEmptyArticle = saleForm.articles.some(a => !a.materialCode || !a.quantity);
        if (hasEmptyArticle) {
            alert("Veuillez remplir tous les articles !");
            return;
        }

        // Vérifier les quantités disponibles
        for (const article of saleForm.articles) {
            if (parseInt(article.quantity) > article.stockDisponible) {
                alert(`Stock insuffisant pour ${article.materialName}. Disponible: ${article.stockDisponible}`);
                return;
            }
        }

        const token = localStorage.getItem("token_key_fultang");
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        const baseUrl = "http://127.0.0.1:8000/api";

        try {
            setSubmitting(true);
            setError(null);

            // Récupérer l'ID du personnel connecté
            const personnelId = parseInt(localStorage.getItem("personnel_id") || "1");

            // 1. Créer la sortie (vente)
            const sortieData = {
                numero_sortie: generateSaleId(),
                motif_sortie: "VENTE",
                idPersonnel: personnelId
            };

            const sortieRes = await fetch(`${baseUrl}/sorties/`, {
                method: 'POST',
                headers,
                body: JSON.stringify(sortieData)
            });

            if (!sortieRes.ok) throw new Error("Erreur lors de la création de la vente");
            const newSortie = await sortieRes.json();
            const idSortie = newSortie.idSortie;

            // 2. Créer les lignes de sortie et décrémenter stock
            for (const article of saleForm.articles) {
                // A. Ligne Sortie
                await fetch(`${baseUrl}/lignes-sortie/`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        id_sortie: idSortie,
                        id_materiel: article.materialId,
                        type_materiel: "MEDICAL",
                        quantite: parseInt(article.quantity)
                    })
                });

                // B. Mettre à jour le stock du matériel (PATCH)
                const newStock = article.stockDisponible - parseInt(article.quantity);
                await fetch(`${baseUrl}/materiels-medicaux/${article.materialId}/`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({
                        quantite_stock: newStock
                    })
                });
            }

            // Recharger les données
            await loadData();

            // Reset form
            setSaleForm({
                articles: [{ id: Date.now(), materialCode: "", materialName: "", materialId: null, quantity: "", stockDisponible: 0 }]
            });

            setSuccessMessage(`Vente ${sortieData.numero_sortie} enregistrée avec succès !`);
            setTimeout(() => setSuccessMessage(""), 5000);

        } catch (err) {
            console.error("Erreur lors de l'enregistrement de la vente:", err);
            setError("Impossible d'enregistrer la vente. Détails console.");
        } finally {
            setSubmitting(false);
        }
    }

    function viewSaleDetails(sale) {
        setSelectedSale(sale);
        setShowDetailModal(true);
    }

    function exportSaleToPDF(sale) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;

        // En-tête
        doc.setFontSize(18);
        doc.setTextColor(26, 115, 163);
        doc.text("FULTANG CLINIC - PHARMACIE", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(80, 194, 185);
        doc.text("Ticket de Vente", pageWidth / 2, 28, { align: "center" });

        doc.setDrawColor(80, 194, 185);
        doc.line(margin, 35, pageWidth - margin, 35);

        let yPos = 45;
        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.text(`N° Vente: ${sale.id}`, margin, yPos);
        doc.text(`Date: ${sale.date} à ${sale.heure}`, pageWidth - margin, yPos, { align: "right" });

        // Pied de page
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        doc.text("Merci pour votre visite !", pageWidth / 2, pageHeight - 20, { align: "center" });

        doc.save(`vente_${sale.id}.pdf`);
    }

    function exportAllSalesToPDF() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;

        doc.setFontSize(16);
        doc.setTextColor(26, 115, 163);
        doc.text("Récapitulatif des Ventes du Jour", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: "center" });

        let yPos = 42;

        dailySales.forEach((sale) => {
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFillColor(245, 245, 245);
            doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 15, 'F');

            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.setFont(undefined, 'bold');
            doc.text(`${sale.id} - ${sale.heure}`, margin + 5, yPos);

            yPos += 20;
        });

        // Total général
        yPos += 10;
        doc.setDrawColor(26, 115, 163);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);

        yPos += 10;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(26, 115, 163);
        doc.text(`TOTAL: ${dailySales.length} vente(s)`, margin, yPos);

        doc.save(`ventes_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    if (loading) {
        return (
            <PharmacistDashBoard linkList={PharmacistNavLink} requiredRole={"Pharmacist"}>
                <PharmacistNavBar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-primary-start mx-auto mb-4" />
                        <p className="text-gray-600">Chargement des données...</p>
                    </div>
                </div>
            </PharmacistDashBoard>
        );
    }

    return (
        <PharmacistDashBoard
            linkList={PharmacistNavLink}
            requiredRole={"Pharmacist"}
        >
            <PharmacistNavBar />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaShoppingCart className="text-4xl text-primary-start" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Ventes du Jour</h1>
                            <p className="text-gray-500">Enregistrer les ventes de médicaments</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                        >
                            <FaSyncAlt className={loading ? "animate-spin" : ""} /> Actualiser
                        </button>
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold">
                            {dailySales.length} vente(s) aujourd&apos;hui
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <FaCheckCircle />
                        {successMessage}
                    </div>
                )}

                {/* Formulaire de vente */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800">Nouvelle Vente</h2>

                    <div className="space-y-3">
                        {saleForm.articles.map((article, index) => (
                            <div key={article.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-lg">
                                <div className="col-span-1 text-center text-gray-500 font-bold">
                                    {index + 1}
                                </div>
                                <div className="col-span-6">
                                    <select
                                        value={article.materialCode}
                                        onChange={(e) => updateArticle(article.id, 'materialCode', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        required
                                    >
                                        <option value="">Sélectionner un médicament</option>
                                        {medicationsDatabase.map(m => (
                                            <option key={m.code} value={m.code} disabled={m.quantity === 0}>
                                                {m.name} (Stock: {m.quantity})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        value={article.quantity}
                                        onChange={(e) => updateArticle(article.id, 'quantity', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        placeholder="Quantité"
                                        min="1"
                                        max={article.stockDisponible}
                                        required
                                    />
                                </div>
                                <div className="col-span-2 text-center">
                                    {saleForm.articles.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArticle(article.id)}
                                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={addArticle}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                        >
                            <FaPlus /> Ajouter un article
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg hover:opacity-90 transition-all font-semibold disabled:opacity-50"
                        >
                            {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            Enregistrer la vente
                        </button>
                    </div>
                </form>

                {/* Liste des ventes du jour */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Ventes enregistrées aujourd&apos;hui ({dailySales.length})</h2>
                        {dailySales.length > 0 && (
                            <button
                                onClick={exportAllSalesToPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                            >
                                <FaFilePdf /> Exporter PDF
                            </button>
                        )}
                    </div>

                    {dailySales.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto space-y-3">
                            {dailySales.map(sale => (
                                <div key={sale.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800">{sale.id}</span>
                                            <span className="text-sm text-gray-500">{sale.heure}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => viewSaleDetails(sale)}
                                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={() => exportSaleToPDF(sale)}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                                        >
                                            <FaFilePdf />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Aucune vente enregistrée aujourd&apos;hui</p>
                    )}
                </div>
            </div>

            {/* Modal de détails */}
            {showDetailModal && selectedSale && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Détails de la Vente</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-600">N° Vente</span>
                                <span className="font-bold">{selectedSale.id}</span>
                            </div>
                            <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-600">Date / Heure</span>
                                <span className="font-bold">{selectedSale.date} à {selectedSale.heure}</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        exportSaleToPDF(selectedSale);
                                        setShowDetailModal(false);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                >
                                    <FaFilePdf /> Imprimer Ticket
                                </button>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PharmacistDashBoard>
    );
}
