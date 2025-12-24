import { v4 as uuidv4 } from 'uuid';

export const sampleChartOfAccounts = [
    { code: "6132", label: "Loyers", type: "Charge" },
    { code: "5121", label: "Banque BICEC", type: "Actif" },
    { code: "7011", label: "Consultations médicales", type: "Produit" },
    { code: "4011", label: "Fournisseurs", type: "Passif" },
    { code: "4111", label: "Clients", type: "Actif" },
    { code: "6064", label: "Fournitures de bureau", type: "Charge" },
    { code: "5300", label: "Caisse", type: "Actif" },
    { code: "7070", label: "Vente Marchandises", type: "Produit" }
];

export const sampleEntries = [
    {
        id: 'entry1',
        journal: "OD",
        date: "2024-07-20",
        reference: "LOY-2024-07",
        generalLabel: "Loyer juillet 2024",
        status: "Validée",
        totalDebit: 500000,
        totalCredit: 500000,
        lines: [
            { id: uuidv4(), accountId: "6132", accountLabel: "Loyers", lineLabel: "Loyer Bureau Principal", debit: 500000, credit: "" },
            { id: uuidv4(), accountId: "5121", accountLabel: "Banque BICEC", lineLabel: "Paiement Loyer", debit: "", credit: 500000 }
        ],
        validatedAt: "2024-07-21T10:00:00Z"
    },
    {
        id: 'entry2',
        journal: "AC",
        date: "2024-07-19",
        reference: "FAC-00123",
        generalLabel: "Achat fournitures de bureau",
        status: "Brouillon",
        totalDebit: 75000,
        totalCredit: 0,
        lines: [
            { id: uuidv4(), accountId: "6064", accountLabel: "Fournitures de bureau", lineLabel: "", debit: 75000, credit: "" }
        ]
    },
    {
        id: 'entry3',
        journal: "VT",
        date: "2024-07-22",
        reference: "REC-2024-002",
        generalLabel: "Consultation - Patient Jean Dupont",
        patientName: "Jean Dupont",
        revenueCategory: "Consultation",
        status: "Validée",
        totalDebit: 15000,
        totalCredit: 15000,
        lines: [
            { id: uuidv4(), accountId: "5300", accountLabel: "Caisse", debit: 15000, credit: "" },
            { id: uuidv4(), accountId: "7011", accountLabel: "Consultations", credit: 15000, debit: "" }
        ]
    },
    {
        id: 'entry4',
        journal: "VT",
        date: "2024-07-23",
        reference: "REC-2024-003",
        generalLabel: "Vente Médicaments - Patient Marie Curie",
        patientName: "Marie Curie",
        revenueCategory: "Pharmacie",
        status: "Validée",
        totalDebit: 2500,
        totalCredit: 2500,
        lines: [
            { id: uuidv4(), accountId: "5300", accountLabel: "Caisse", debit: 2500, credit: "" },
            { id: uuidv4(), accountId: "7070", accountLabel: "Vente Marchandises", credit: 2500, debit: "" }
        ]
    },
    {
        id: 'entry5',
        journal: "OD",
        date: "2024-08-01",
        reference: "VRM-TEST",
        generalLabel: "Virement Salaire (Brouillon)",
        status: "Brouillon",
        totalDebit: 100000,
        totalCredit: 100000,
        lines: [
            { id: uuidv4(), accountId: "5121", accountLabel: "Banque BICEC", debit: "", credit: 100000 },
            { id: uuidv4(), accountId: "4210", accountLabel: "Personnel", debit: 100000, credit: "" }
        ]
    },
    {
        id: 'entry6',
        journal: "VT",
        date: "2024-12-15",
        reference: "REC-2024-010",
        generalLabel: "Consultation - Patient Paul Martin",
        patientName: "Paul Martin",
        revenueCategory: "Consultation",
        status: "Validée",
        totalDebit: 12000,
        totalCredit: 12000,
        lines: [
            { id: uuidv4(), accountId: "5300", accountLabel: "Caisse", debit: 12000, credit: "" },
            { id: uuidv4(), accountId: "7011", accountLabel: "Consultations", credit: 12000, debit: "" }
        ]
    },
    {
        id: 'entry7',
        journal: "VT",
        date: "2024-12-16",
        reference: "REC-2024-011",
        generalLabel: "Médicaments - Patient Sophie Dubois",
        patientName: "Sophie Dubois",
        revenueCategory: "Pharmacie",
        status: "Validée",
        totalDebit: 8500,
        totalCredit: 8500,
        lines: [
            { id: uuidv4(), accountId: "5300", accountLabel: "Caisse", debit: 8500, credit: "" },
            { id: uuidv4(), accountId: "7070", accountLabel: "Vente Marchandises", credit: 8500, debit: "" }
        ]
    },
    {
        id: 'entry8',
        journal: "VT",
        date: "2024-12-17",
        reference: "REC-2024-012",
        generalLabel: "Hospitalisation - Patient Ahmed Hassan",
        patientName: "Ahmed Hassan",
        revenueCategory: "Hospitalisation",
        status: "Validée",
        totalDebit: 45000,
        totalCredit: 45000,
        lines: [
            { id: uuidv4(), accountId: "5300", accountLabel: "Caisse", debit: 45000, credit: "" },
            { id: uuidv4(), accountId: "7070", accountLabel: "Vente Marchandises", credit: 45000, debit: "" }
        ]
    },
    {
        id: 'entry9',
        journal: "VT",
        date: "2024-12-18",
        reference: "REC-2024-013",
        generalLabel: "Consultation + Médicaments - Patient Claire Rousseau",
        patientName: "Claire Rousseau",
        revenueCategory: "Consultation",
        status: "Validée",
        totalDebit: 18000,
        totalCredit: 18000,
        lines: [
            { id: uuidv4(), accountId: "5300", accountLabel: "Caisse", debit: 18000, credit: "" },
            { id: uuidv4(), accountId: "7011", accountLabel: "Consultations", credit: 18000, debit: "" }
        ]
    }
];
