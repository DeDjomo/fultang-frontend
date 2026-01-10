import React from "react"
import { Route, Routes } from "react-router-dom";
import { Loading } from "../GlobalComponents/Loading.jsx";
import { AppRoutesPaths } from "./appRouterPaths.js";





export function AppRoute() {
    const LoginPage = React.lazy(async () => ({ default: (await import("../Pages/Authentication/Login.jsx")).LoginPage }));
    const ForgottenPage = React.lazy(async () => ({ default: (await import("../Pages/Authentication/ForgottenPassword.jsx")).ForgottenPassword }));
    const LandingPage = React.lazy(async () => ({ default: (await import("../Pages/LandingPage/LandingPage.jsx")).LandingPage }));
    const NurseWaitingRoomPage = React.lazy(async () => ({ default: (await import("../Pages/Nurse/WaitingRoom.jsx")).WaitingRoom }));
    const NurseAppointmentsPage = React.lazy(async () => ({ default: (await import("../Pages/Nurse/NurseAppointments.jsx")).NurseAppointments }));
    const PatientManagementPage = React.lazy(async () => ({ default: (await import("../Pages/Nurse/PatientManagement.jsx")).PatientManagement }));
    const NotFoundPage = React.lazy(async () => ({ default: (await import("../GlobalComponents/NotFound.jsx")).NotFound }));
    const NurseMedicalStaffsPage = React.lazy(async () => ({ default: (await import("../Pages/Nurse/MedicalStaffs.jsx")).MedicalStaffs }));
    const ConsultationHistoryPage = React.lazy(async () => ({ default: (await import("../Pages/Nurse/ConsultationHistory.jsx")).ConsultationHistory }));
    const HelpCenterPage = React.lazy(async () => ({ default: (await import("../Pages/HelpCenter/HelpCenter.jsx")).HelpCenter }));
    const PatientDetailsPage = React.lazy(async () => ({ default: (await import("../Pages/Nurse/PatientParameters.jsx")).PatientParameters }));

    const ReceptionistPage = React.lazy(async () => ({ default: (await import("../Pages/Receptionist/Receptionist.jsx")).Receptionist }));
    /*const LaboratoryAssistantPage = React.lazy(async () => ({default: (await import("../Pages/Laboratory/LaboratoryAssistant.jsx")).LaboratoryAssistant}));*/
    const CashierPage = React.lazy(async () => ({ default: (await import("../Pages/Cashier/Cashier.jsx")).Cashier }));
    const ExamsList = React.lazy(async () => ({ default: (await import("../Pages/Cashier/ExamsList.jsx")).ExamsList }));
    const Hospitalisations = React.lazy(async () => ({ default: (await import("../Pages/Cashier/Hospitalisations.jsx")).Hospitalisations }));
    const FinancialReport = React.lazy(async () => ({ default: (await import("../Pages/Cashier/FinancialReport.jsx")).FinancialReport }));
    const FinancialHistory = React.lazy(async () => ({ default: (await import("../Pages/Cashier/FinancialHistory.jsx")).default }));
    const HelpCenter = React.lazy(async () => ({ default: (await import("../GlobalComponents/HelpCenter.jsx")).HelpCenter }));
    const AdminHomePage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AdminHomePage.jsx")).AdminHomePage }));
    const AdminServicesPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AdminServicesPage.jsx")).AdminServicesPage }));
    const AdminPersonnelPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AdminPersonnelPage.jsx")).AdminPersonnelPage }));
    const AdminChambresPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AdminChambresPage.jsx")).AdminChambresPage }));
    const ReceptionistMedicalStaffsPage = React.lazy(async () => ({ default: (await import("../Pages/Receptionist/ReceptionistMedicalStaffs.jsx")).ReceptionistMedicalStaffs }));
    const ReceptionistAppointmentsPage = React.lazy(async () => ({ default: (await import("../Pages/Receptionist/Appointments.jsx")).Appointments }));
    const HospitalizedPatientsPage = React.lazy(async () => ({ default: (await import("../Pages/Receptionist/HospitalizedPatients.jsx")).HospitalizedPatients }));
    const AdminPatientListPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AdminPatientList.jsx")).AdminPatientList }));
    const AddMedicalStaffPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AddMedicalStaff.jsx")).AddMedicalStaff }));
    const AdminMedicalStaffListPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AdminMedicalStaffList.jsx")).AdminMedicalStaffList }));
    const AdminConsultationListPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AdminConsultationList.jsx")).AdminConsultationList }));
    const AdminAppointmentsListPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AdminAppointmentsList.jsx")).AdminAppointmentsList }));
    const AddExamPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AddExam.jsx")).AddExam }));
    const AdminExamsListPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AdminExamsList.jsx")).AdminExamsList }));
    const AddDrugPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AddDrug.jsx")).AddDrug }));
    const AdminDrugsListPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AdminDrugsList.jsx")).AdminDrugsList }));
    const AdminHospitalRoomPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AdminHospitalRooms.jsx")).AdminHospitalRooms }));
    const AdminFinancialReportsPage = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/AdminFinancialReports.jsx")).AdminFinancialReports }));
    const AdminConsultationDetails = React.lazy(async () => ({ default: (await import("../Pages/AdminViews/ConsultationDetails.jsx")).ConsultationDetails }));
    /*const CurrentExamsLaboratoryPage = React.lazy(async () => ({default: (await import("../Pages/Laboratory/CurrentExams.jsx")).CurrentExams}));
    const ExamsHistoryLaboratoryPage = React.lazy(async () => ({default: (await import("../Pages/Laboratory/ExamsHistory.jsx")).ExamHistory}));*/

    const DoctorAppointments = React.lazy(async () => ({ default: (await import("../Pages/Doctor/AppointmentList.jsx")).AppointmentList }));
    const DoctorWaitingRoom = React.lazy(async () => ({ default: (await import("../Pages/Doctor/DoctorWaitingRoom.jsx")).DoctorWaitingRoom }));
    const DoctorConsultation = React.lazy(async () => ({ default: (await import("../Pages/Doctor/ConsultationPage.jsx")).ConsultationPage }));

    const LaboratoryHomePage = React.lazy(async () => ({ default: (await import("../Pages/Laboratory/LaboratoryHomePage.jsx")).LaboratoryHomePage, }));
    const LaboratoryPatientList = React.lazy(async () => ({ default: (await import("../Pages/Laboratory/LaboratoryPatientList.jsx")).LaboratoryPatientList, }));
    const LaboratoryExamenList = React.lazy(async () => ({ default: (await import("../Pages/Laboratory/LaboratoryExamList.jsx")).ExamenList, }));
    const LaboratoryExamenDetails = React.lazy(async () => ({ default: (await import("../Pages/Laboratory/ExamenDetails.jsx")).ExamDetails, }));
    const LaboratoryExamenHistories = React.lazy(async () => ({ default: (await import("../Pages/Laboratory/LaboratoryExamHistory.jsx")).ExamHistory, }));
    const LaboratoryExamResulDetails = React.lazy(async () => ({ default: (await import("../Pages/Laboratory/ExamResultDetail.jsx")).ExamResultDetails, }));
    const LaboratoryNotifications = React.lazy(async () => ({ default: (await import("../Pages/Laboratory/Notification.jsx")).Notification, }));

    // ComptaMatiere (Comptable Matière) components
    const ComptaMatiereDashboard = React.lazy(async () => ({ default: (await import("../Pages/ComptaMatiere/Accountant.jsx")).Accountant }));
    const ComptaMatiereEmitNeed = React.lazy(async () => ({ default: (await import("../Pages/ComptaMatiere/EmitNeed.jsx")).EmitNeed }));
    const ComptaMatiereRegisterDelivery = React.lazy(async () => ({ default: (await import("../Pages/ComptaMatiere/RegisterDelivery.jsx")).RegisterDelivery }));
    const ComptaMatiereRegisterOutput = React.lazy(async () => ({ default: (await import("../Pages/ComptaMatiere/RegisterOutput.jsx")).RegisterOutput }));
    const ComptaMatiereReports = React.lazy(async () => ({ default: (await import("../Pages/ComptaMatiere/AccountantReports.jsx")).AccountantReports }));
    const ComptaMatiereMaterialList = React.lazy(async () => ({ default: (await import("../Pages/ComptaMatiere/MaterialList.jsx")).MaterialList }));
    const ComptaMatiereOutputList = React.lazy(async () => ({ default: (await import("../Pages/ComptaMatiere/OutputList.jsx")).OutputList }));

    // Director components
    const DirectorDashboard = React.lazy(async () => ({ default: (await import("../Pages/Director/Director.jsx")).Director }));
    const DirectorReports = React.lazy(async () => ({ default: (await import("../Pages/Director/DirectorReports.jsx")).DirectorReports }));

    // Pharmacist components
    const PharmacistDashboard = React.lazy(async () => ({ default: (await import("../Pages/Pharmacist/PharmacistHome.jsx")).PharmacistHome }));
    const PharmacistMedicationList = React.lazy(async () => ({ default: (await import("../Pages/Pharmacist/PharmacistMedicationList.jsx")).PharmacistMedicationList }));
    const PharmacistEmitNeed = React.lazy(async () => ({ default: (await import("../Pages/Pharmacist/PharmacistEmitNeed.jsx")).PharmacistEmitNeed }));
    const PharmacistDailySales = React.lazy(async () => ({ default: (await import("../Pages/Pharmacist/PharmacistDailySales.jsx")).PharmacistDailySales }));
    const PharmacistInventory = React.lazy(async () => ({ default: (await import("../Pages/Pharmacist/PharmacistInventory.jsx")).PharmacistInventory }));
    const PharmacistReports = React.lazy(async () => ({ default: (await import("../Pages/Pharmacist/PharmacistReports.jsx")).PharmacistReports }));
    const PharmacistPrescriptions = React.lazy(async () => ({ default: (await import("../Pages/Pharmacist/PharmacistPrescriptions.jsx")).PharmacistPrescriptions }));

    // Accountant Module components (from prototype)
    const AccountantHomePage = React.lazy(async () => ({ default: (await import("../Pages/Accountant/Home/HomePage.jsx")).AccountantHomePage }));
    const QuittancesAValiderPage = React.lazy(async () => ({ default: (await import("../Pages/Accountant/Quittances/QuittancesAValider.jsx")).QuittancesAValiderPage }));
    const QuittancesValideesPage = React.lazy(async () => ({ default: (await import("../Pages/Accountant/Quittances/QuittancesValidees.jsx")).QuittancesValideesPage }));
    const EcrituresComptablesPage = React.lazy(async () => ({ default: (await import("../Pages/Accountant/Ecritures/EcrituresComptables.jsx")).EcrituresComptablesPage }));
    const BalancePage = React.lazy(async () => ({ default: (await import("../Pages/Accountant/Balance/Balance.jsx")).BalancePage }));
    const PlanComptablePage = React.lazy(async () => ({ default: (await import("../Pages/Accountant/PlanComptable/PlanComptable.jsx")).PlanComptablePage }));
    const RapportsPage = React.lazy(async () => ({ default: (await import("../Pages/Accountant/Rapports/Rapports.jsx")).RapportsPage }));



    return (
        <React.Suspense fallback={<Loading />}>
            <Routes>
                <Route path={AppRoutesPaths.welcomePage} element={<LandingPage />} />
                <Route path={AppRoutesPaths.loginPage} element={<LoginPage />} />
                <Route path={AppRoutesPaths.forgottenPasswordPage} element={<ForgottenPage />} />
                <Route path={AppRoutesPaths.nursePage} element={<NurseWaitingRoomPage />} />
                <Route path={AppRoutesPaths.nurseWaitingRoomPage} element={<NurseWaitingRoomPage />} />
                <Route path="/nurse/patient-management" element={<PatientManagementPage />} />
                <Route path={AppRoutesPaths.nurseAppointmentsPage} element={<NurseAppointmentsPage />} />

                <Route path={AppRoutesPaths.consultationHistoryPage} element={<ConsultationHistoryPage />} />
                <Route path={AppRoutesPaths.helpCenterPage} element={<HelpCenterPage />} />
                <Route path={AppRoutesPaths.patientDetailsPage} element={<PatientDetailsPage />} />
                <Route path={AppRoutesPaths.cashierPage} element={<CashierPage />} />
                <Route path={AppRoutesPaths.financialHistory} element={<FinancialHistory />} />
                <Route path={AppRoutesPaths.examsList} element={<ExamsList />} />
                <Route path={AppRoutesPaths.hospitalisations} element={<Hospitalisations />} />
                <Route path={AppRoutesPaths.financialReport} element={<FinancialReport />} />
                <Route path={AppRoutesPaths.helpCenter} element={<HelpCenter />} />
                <Route path={AppRoutesPaths.receptionistPage} element={<ReceptionistPage />} />
                {/*<Route path={AppRoutesPaths.laboratoryAssistantPage} element={<LaboratoryAssistantPage />} />*/}
                <Route path={AppRoutesPaths.adminHomePage} element={<AdminHomePage />} />
                <Route path={AppRoutesPaths.adminServicesPage} element={<AdminServicesPage />} />
                <Route path={AppRoutesPaths.adminPersonnelPage} element={<AdminPersonnelPage />} />
                <Route path={AppRoutesPaths.adminChambresPage} element={<AdminChambresPage />} />
                <Route path={AppRoutesPaths.receptionistMedicalStaffsPage} element={<ReceptionistMedicalStaffsPage />} />
                <Route path={AppRoutesPaths.appointmentsPage} element={<ReceptionistAppointmentsPage />} />
                <Route path={AppRoutesPaths.hospitalizedPatientsPage} element={<HospitalizedPatientsPage />} />
                <Route path={AppRoutesPaths.adminPatientListPage} element={<AdminPatientListPage />} />
                <Route path={AppRoutesPaths.addMedicalStaff} element={<AddMedicalStaffPage />} />
                <Route path={AppRoutesPaths.adminMedicalStaffListPage} element={<AdminMedicalStaffListPage />} />
                <Route path={AppRoutesPaths.adminConsultationListPage} element={<AdminConsultationListPage />} />
                <Route path={AppRoutesPaths.adminAppointmentsListPage} element={<AdminAppointmentsListPage />} />
                <Route path={AppRoutesPaths.addExam} element={<AddExamPage />} />
                <Route path={AppRoutesPaths.adminExamsListPage} element={<AdminExamsListPage />} />
                <Route path={AppRoutesPaths.addDrug} element={<AddDrugPage />} />
                <Route path={AppRoutesPaths.adminDrugsListPage} element={<AdminDrugsListPage />} />
                <Route path={AppRoutesPaths.adminHospitalRoomPage} element={<AdminHospitalRoomPage />} />
                <Route path={AppRoutesPaths.adminFinancialReportsPage} element={<AdminFinancialReportsPage />} />
                <Route path={AppRoutesPaths.adminConsultationDetailsPage} element={<AdminConsultationDetails />} />
                {/*<Route path={AppRoutesPaths.laboratoryHistory} element={<ExamsHistoryLaboratoryPage />} />*/}
                {/*<Route path={AppRoutesPaths.laboratoryCurrent} element={<CurrentExamsLaboratoryPage />} />*/}
                <Route path={AppRoutesPaths.financialHistory} element={<FinancialHistory />} />
                <Route path={AppRoutesPaths.notFound} element={<NotFoundPage />} />

                <Route path={AppRoutesPaths.doctorAppointment} element={<DoctorAppointments />} />
                <Route path="/doctor/waiting-room" element={<DoctorWaitingRoom />} />
                <Route path="/doctor/consultation" element={<DoctorConsultation />} />

                <Route path={AppRoutesPaths.laboratoryAssistantPage} element={<LaboratoryHomePage />} />
                <Route path={AppRoutesPaths.laboratoryPatientList} element={<LaboratoryPatientList />} />
                <Route path={AppRoutesPaths.laboratoryExamenList} element={<LaboratoryExamenList />} />
                <Route path={AppRoutesPaths.laboratoryExamenDetail} element={<LaboratoryExamenDetails />} />
                <Route path={AppRoutesPaths.laboratoryExamenHistories} element={<LaboratoryExamenHistories />} />
                <Route path={AppRoutesPaths.laboratoryExamResultDetails} element={<LaboratoryExamResulDetails />} />
                <Route path={AppRoutesPaths.laboratoryNotification} element={<LaboratoryNotifications />} />

                {/* ComptaMatiere (Comptable Matière) Routes */}
                <Route path={AppRoutesPaths.comptaMatiereDashboard} element={<ComptaMatiereDashboard />} />
                <Route path={AppRoutesPaths.comptaMatiereEmitNeed} element={<ComptaMatiereEmitNeed />} />
                <Route path={AppRoutesPaths.comptaMatiereRegisterDelivery} element={<ComptaMatiereRegisterDelivery />} />
                <Route path={AppRoutesPaths.comptaMatiereRegisterOutput} element={<ComptaMatiereRegisterOutput />} />
                <Route path={AppRoutesPaths.comptaMatiereReports} element={<ComptaMatiereReports />} />
                <Route path={AppRoutesPaths.comptaMatiereMaterialList} element={<ComptaMatiereMaterialList />} />
                <Route path={AppRoutesPaths.comptaMatiereOutputList} element={<ComptaMatiereOutputList />} />

                {/* Director Routes */}
                <Route path={AppRoutesPaths.directorDashboard} element={<DirectorDashboard />} />
                <Route path={AppRoutesPaths.directorReports} element={<DirectorReports />} />

                {/* Pharmacist Routes */}
                <Route path={AppRoutesPaths.pharmacistDashboard} element={<PharmacistDashboard />} />
                <Route path={AppRoutesPaths.pharmacistMedicationList} element={<PharmacistMedicationList />} />
                <Route path={AppRoutesPaths.pharmacistEmitNeed} element={<PharmacistEmitNeed />} />
                <Route path={AppRoutesPaths.pharmacistDailySales} element={<PharmacistDailySales />} />
                <Route path={AppRoutesPaths.pharmacistInventory} element={<PharmacistInventory />} />
                <Route path={AppRoutesPaths.pharmacistReports} element={<PharmacistReports />} />
                <Route path={AppRoutesPaths.pharmacistPrescriptions} element={<PharmacistPrescriptions />} />

                {/* Accountant Module Routes (from prototype) */}
                <Route path={AppRoutesPaths.accountantHome} element={<AccountantHomePage />} />
                <Route path={AppRoutesPaths.accountantQuittancesAValider} element={<QuittancesAValiderPage />} />
                <Route path={AppRoutesPaths.accountantQuittancesValidees} element={<QuittancesValideesPage />} />
                <Route path={AppRoutesPaths.accountantEcritures} element={<EcrituresComptablesPage />} />
                <Route path={AppRoutesPaths.accountantBalance} element={<BalancePage />} />
                <Route path={AppRoutesPaths.accountantPlanComptable} element={<PlanComptablePage />} />
                <Route path={AppRoutesPaths.accountantRapports} element={<RapportsPage />} />

            </Routes>
        </React.Suspense>
    )
}
