import React, { useRef } from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

export function ReceiptModal({ entry, onClose }) {
    const receiptRef = useRef(null);

    if (!entry) return null;

    const generatePDF = (mode = 'download') => {
        const doc = new jsPDF();

        // Constants for layout
        const startX = 20;
        let currentY = 20;
        const lineHeight = 12;
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- Document Selection D1 Layout ---

        // Title
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("QUITTANCIERS", pageWidth / 2, currentY, { align: 'center' });

        // Optional: Subtitle "DOCUMENT D1 : MODELE DE QUITTANCE" if needed, but "QUITTANCIERS" is what is on the form itself.
        currentY += 15;

        // Helper function for fields
        const addField = (label, value, x, y, width = 0) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(`${label} :`, x, y);

            const labelWidth = doc.getTextWidth(`${label} : `);
            doc.setFont("helvetica", "normal");

            if (value) {
                doc.text(String(value), x + labelWidth, y);
            }

            // Draw underline for the field
            const lineStartX = x + labelWidth;
            const lineEndX = width > 0 ? x + width : (x === startX ? pageWidth - 20 : x + 80); // Default specific widths or full width
            doc.setLineWidth(0.5);
            doc.line(lineStartX, y + 1, lineEndX, y + 1);
        };

        // --- Row 1: Quittance n° ---
        // Image shows: Quittance n° [_____]       Quittance n° [_____] (if double)
        // We will simplify to single column for PDF or keep it simple.

        addField("Quittance n°", entry.reference, startX, currentY);
        // If we want the "Duplicate" style like the image (Souche + Reçu), we could draw it again on the right side.
        // For now, let's stick to a clean single receipt.
        currentY += lineHeight;

        // --- Row 2: HGR & Date ---
        // HGR: [_____________]      Date: [_____________]
        // HGR = Hospital General de Reference equivalent.
        const leftColX = startX;
        const rightColX = 120;

        addField("HGR", "Fultang Hospital", leftColX, currentY, 80);
        addField("Date", new Date(entry.date).toLocaleDateString('fr-FR'), rightColX, currentY, 60);
        currentY += lineHeight;

        // --- Row 3: Montant ---
        const totalAmount = entry.totalDebit || entry.totalCredit || 0;
        const amountStr = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(totalAmount);
        addField("Montant", amountStr, startX, currentY);
        currentY += lineHeight;

        // --- Row 4: Reçu de ---
        // Try to find the "Tier" name from the lines (e.g. Account 4111 label or general label)
        // If exact payer is not stored, use general description or a placeholder line.
        // Usually 'Reçu de' implies the Payer Name.
        // We'll use a placeholder logic: "Client/Patient"
        const payerName = entry.patientName || "Client / Patient";
        addField("Reçu de", payerName, startX, currentY);
        currentY += lineHeight;

        // --- Row 5: Motif ---
        addField("Motif", entry.generalLabel, startX, currentY);
        currentY += lineHeight * 2; // Extra space before signature

        // --- Row 6: Signature ---
        addField("Signature", "", startX, currentY);


        // Footer (Optional context)
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Fultang Hospital System", pageWidth / 2, 280, { align: 'center' });

        if (mode === 'print') {
            doc.autoPrint();
            window.open(doc.output('bloburl'), '_blank');
        } else {
            doc.save(`Quittance_${entry.reference}.pdf`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-800 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="text-xl font-bold flex items-center">
                        <FileText className="mr-2" /> Aperçu de la Quittance
                    </h3>
                    <button onClick={onClose} className="hover:bg-teal-700 p-2 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Content Preview */}
                <div className="p-8 bg-gray-50 flex justify-center" ref={receiptRef}>
                    <div className="bg-white p-8 shadow-md border border-gray-200 w-full max-w-md font-serif">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold uppercase underline tracking-widest text-black">QUITTANCIERS</h2>
                        </div>

                        <div className="space-y-6 text-sm text-gray-800">
                            <div className="border-b border-gray-300 pb-1 flex justify-between">
                                <span className="font-bold">Quittance n° :</span>
                                <span>{entry.reference}</span>
                            </div>

                            <div className="flex gap-4">
                                <div className="border-b border-gray-300 pb-1 flex-1 flex justify-between">
                                    <span className="font-bold">HGR :</span>
                                    <span>Fultang</span>
                                </div>
                                <div className="border-b border-gray-300 pb-1 flex-1 flex justify-between">
                                    <span className="font-bold">Date :</span>
                                    <span>{new Date(entry.date).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>

                            <div className="border-b border-gray-300 pb-1 flex justify-between">
                                <span className="font-bold">Montant :</span>
                                <span className="font-medium text-lg">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(entry.totalDebit || entry.totalCredit || 0)}
                                </span>
                            </div>

                            <div className="border-b border-gray-300 pb-1 flex justify-between">
                                <span className="font-bold">Reçu de :</span>
                                <span className={entry.patientName ? "" : "text-gray-500 italic"}>
                                    {entry.patientName || "Client / Patient"}
                                </span>
                            </div>

                            <div className="border-b border-gray-300 pb-1 flex flex-col">
                                <span className="font-bold mb-1">Motif :</span>
                                <span>{entry.generalLabel}</span>
                            </div>

                            <div className="pt-8">
                                <div className="border-t border-gray-300 w-1/2 pt-1">
                                    <span className="font-bold">Signature :</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-gray-400 text-center italic mt-8">
                            Modèle D1 conforme
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-100 px-6 py-4 flex justify-end space-x-4 border-t border-gray-200">
                    <button onClick={() => generatePDF('print')} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition shadow-sm">
                        <Printer size={18} className="mr-2" /> Imprimer
                    </button>
                    <button onClick={() => generatePDF('download')} className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium transition shadow-md hover:shadow-lg">
                        <Download size={18} className="mr-2" /> Télécharger PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
