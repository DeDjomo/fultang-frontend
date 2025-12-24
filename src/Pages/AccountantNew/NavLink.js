import {
    FaHome,
    FaChartBar,
    FaBookOpen,
    FaEdit,
    FaBook,
    FaUserTie,
    FaFileInvoiceDollar,
    FaChartLine,
    FaCalculator,
    FaBell,
    FaQuestionCircle,
} from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";
import { TrendingUp, } from "lucide-react";

export const FinancialAccountantNavLink = [

    {
        name: "Dashboard",
        link: appRoutes.financialAccountantHome,
        icon: FaHome,
        description: "Overview of financial KPIs"
    },

    // Basic Accounting
    {
        name: 'Basic Accounting',
        icon: FaBookOpen,
        subLinks: [
            {
                icon: FaChartBar,
                name: "Chart of Accounts",
                link: appRoutes.financialAccountantChartOfAccount,
                description: "Manage the OHADA account structure"
            },
            {
                icon: FaEdit,
                name: "Journal Entries",
                link: appRoutes.financialAccountantJournalEntries,
                description: "Record accounting transactions"
            },
            {
                icon: FaBook,
                name: "Accounting Journals",
                link: appRoutes.financialAccountantAccountingJournals,
                description: "View journals (Sales, Purchases, Bank, Cash, Adjustments)"
            },
            {
                icon: FaBook,
                name: "Ledger & Trial Balance",
                link: appRoutes.financialAccountantAccountingGrandLivre,
                description: "View the ledger and trial balance"
            },
            {
                icon: FaFileInvoiceDollar,
                name: "Quittances (Receipts)",
                link: appRoutes.financialAccountantReceipts,
                description: "Print and download receipts"
            },
            {
                icon: FaBook,
                name: "Journal de Ventilation",
                link: appRoutes.financialAccountantRevenueBreakdown,
                description: "Revenue breakdown by category"
            }
        ]
    },

    // Payroll & Social Charges
    {
        name: 'Payroll & Social Charges',
        icon: FaUserTie,
        subLinks: [
            {
                icon: FaFileInvoiceDollar,
                name: "Social Charges",
                link: appRoutes.financialAccountPayroll,
                description: "Manage social security, training taxes, etc."
            },
            {
                icon: FaChartLine,
                name: "HR Cost Analysis",
                link: appRoutes.financialAccountantCostAnalytic,
                description: "Analyze costs by department"
            }
        ]
    },

    // Financial Analysis
    {
        name: 'Financial Analysis',
        icon: FaChartLine,
        subLinks: [
            {
                icon: FaChartLine,
                name: "Financial Ratios",
                link: appRoutes.financialRatios,
                description: "Compute performance ratios"
            },
            {
                icon: TrendingUp,
                name: "Profitability by Service",
                link: appRoutes.profitabilityAnalysis,
                description: "Analyze service profitability"
            },
            {
                icon: FaChartBar,
                name: "Executive Dashboard",
                link: appRoutes.executiveDashboard,
                description: "KPIs for management"
            }
        ]
    },

    // Budget & Control
    {
        name: 'Budget & Control',
        icon: FaCalculator,
        subLinks: [
            {
                icon: FaEdit,
                name: "Budget Entry",
                link: appRoutes.budgetEntry,
                description: "Create and modify budgets"
            },
            {
                icon: FaChartBar,
                name: "Variance Analysis",
                link: appRoutes.budgetVariance,
                description: "Compare budget vs actual"
            },
            {
                icon: FaBell,
                name: "Budget Alerts",
                link: appRoutes.budgetAlerts,
                description: "Receive overrun alerts"
            }
        ]
    },

    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenter,
        description: "Documentation and support"
    }
];
