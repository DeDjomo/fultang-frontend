import { useState, useEffect } from "react"
import { AlertCircle, Search, Calendar, User, Filter, DollarSign, ArrowLeft, ArrowRight } from "lucide-react"
import PropTypes from "prop-types";
import { Tooltip } from "antd";
import { calculateNumberOfSlides } from "../../Utils/paginationFunctions.js";
import PatientInvoiceModal from "./PatientInvoiceModal.jsx";

export default function PatientsList({ patientsList, totalCount, onFetchPage }) {

    PatientsList.propTypes = {
        patientsList: PropTypes.array.isRequired,
        totalCount: PropTypes.number.isRequired,
        onFetchPage: PropTypes.func.isRequired,
    }

    const [searchTerm, setSearchTerm] = useState("");
    const [filterService, setFilterService] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Invoice modal state
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Filter patients locally
    const filteredPatients = patientsList.filter((patient) => {
        const patientFullName = `${patient.nom} ${patient.prenom} `;
        const matricule = patient.matricule || '';
        return (
            (patientFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                matricule.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filterService === "all" || patient.service_courant === filterService)
        )
    })

    // Extract unique services
    const services = [...new Set(patientsList.map(p => p.service_courant))];

    const handleNextPage = () => {
        if (currentPage < calculateNumberOfSlides(filteredPatients.length, itemsPerPage)) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            onFetchPage(nextPage);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            onFetchPage(prevPage);
        }
    };

    // Paginate filtered patients
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterService]);

    return (
        <div className="w-full mx-auto p-6 rounded-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Patient Invoice Management</h1>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <div className="relative w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Search patient (name or ID)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                <div className="flex items-center space-x-4">
                    <Filter className="text-gray-400" />
                    <select
                        value={filterService}
                        onChange={(e) => setFilterService(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Services</option>
                        {services.map(service => (
                            <option key={service} value={service}>{service}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                {
                    patientsList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-lg font-semibold text-gray-600">
                                No pending patients
                            </p>
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-lg font-semibold text-gray-600">
                                No patients match your search
                            </p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full border-separate border-spacing-y-2">
                                <thead>
                                    <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                                        <th className="px-6 py-5 text-center text-md font-bold text-white uppercase rounded-l-lg">
                                            ID
                                        </th>
                                        <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">
                                            Patient
                                        </th>
                                        <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">
                                            Age
                                        </th>
                                        <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">Service</th>
                                        <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">
                                            Session Date
                                        </th>
                                        <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">Staff</th>
                                        <th className="px-6 py-5 text-center text-md font-bold text-white uppercase rounded-r-lg">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPatients.map((patient, index) => (
                                        <tr key={patient.id} className="bg-gray-100">
                                            <td className="p-4 text-md font-semibold text-center rounded-l-lg">{patient.matricule}</td>
                                            <td className="p-4 text-md text-center">
                                                <div className="flex items-center justify-center">
                                                    <User className="h-5 w-5 text-gray-400 mr-2" />
                                                    <span className="font-semibold">{patient.prenom} {patient.nom}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-md text-center">{patient.age} years</td>
                                            <td className="p-4 text-md text-center">{patient.service_courant}</td>
                                            <td className="p-4 text-md text-center">
                                                <div className="flex items-center justify-center">
                                                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                                    {new Date(patient.debut).toLocaleDateString('en-US')}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                                                    {patient.personnel_responsable}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center rounded-r-lg">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPatient(patient);
                                                        setShowInvoiceModal(true);
                                                    }}
                                                    className="text-primary-end hover:text-green-700 transition-all duration-300 flex items-center justify-center mx-auto font-semibold"
                                                >
                                                    <DollarSign className="h-5 w-5 mr-1" />
                                                    View Invoice
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="flex justify-center items-center mt-6 gap-4">
                                <Tooltip placement="left" title="Previous page">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className={`w - 14 h - 14 border - 2 rounded - lg text - xl shadow - xl flex justify - center items - center transition - all duration - 300 ${currentPage === 1
                                            ? 'text-gray-300 border-gray-300 cursor-not-allowed'
                                            : 'text-secondary border-secondary hover:bg-secondary hover:text-white'
                                            } `}
                                    >
                                        <ArrowLeft />
                                    </button>
                                </Tooltip>

                                <p className="text-secondary text-2xl font-bold">
                                    {currentPage}/{calculateNumberOfSlides(filteredPatients.length, itemsPerPage)}
                                </p>

                                <Tooltip placement="right" title="Next page">
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage >= calculateNumberOfSlides(filteredPatients.length, itemsPerPage)}
                                        className={`w - 14 h - 14 border - 2 rounded - lg text - xl shadow - xl flex justify - center items - center transition - all duration - 300 ${currentPage >= calculateNumberOfSlides(filteredPatients.length, itemsPerPage)
                                            ? 'text-gray-300 border-gray-300 cursor-not-allowed'
                                            : 'text-secondary border-secondary hover:bg-secondary hover:text-white'
                                            } `}
                                    >
                                        <ArrowRight />
                                    </button>
                                </Tooltip>
                            </div>
                        </>
                    )}
            </div>

            {/* Invoice Modal */}
            <PatientInvoiceModal
                isOpen={showInvoiceModal}
                onClose={() => {
                    setShowInvoiceModal(false);
                    setSelectedPatient(null);
                }}
                patient={selectedPatient}
            />
        </div>
    )
}
