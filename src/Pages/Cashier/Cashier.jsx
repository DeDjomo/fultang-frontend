import { cashierNavLink } from "./cashierNavLink.js";
import { CashierNavBar } from "./CashierNavBar.jsx";
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import userIcon from "../../assets/userIcon.png";
import { useAuthentication } from "../../Utils/Provider.jsx";
import PatientsList from "./PatientsList.jsx";
import { useEffect, useState, useCallback } from "react";
import { getPatientsEnAttente } from "../../services/caissierApi.js";
import { useAutoRefresh, deepEqual } from "../../hooks/usePolling";

export function Cashier() {
  const { userData } = useAuthentication();
  const [patients, setPatients] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPatients = useCallback(async (page = 1, isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const response = await getPatientsEnAttente();
      if (!isBackground) setIsLoading(false);
      if (response.success) {
        const newData = response.data || [];
        setPatients(prev => deepEqual(prev, newData) ? prev : newData);
        setTotalCount(response.count || 0);
      }
    } catch (error) {
      if (!isBackground) setIsLoading(false);
      console.error('Error loading patients:', error);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Auto-refresh toutes les 5 secondes
  useAutoRefresh(() => fetchPatients(1, true), 5000, false);

  const handleFetchPage = (page) => {
    // Client-side pagination - data already loaded
  };

  return (
    <DashBoard linkList={cashierNavLink} /* requiredRole={"Cashier"} */>
      <CashierNavBar />
      <div className="flex flex-col">
        <div className="ml-5 mr-5 h-[150px] bg-gradient-to-t from-primary-start to-primary-end flex rounded-lg justify-between">
          <div className="flex gap-4">
            <div className="mt-5 mb-5 ml-5 w-28 h-28 border-4 border-white rounded-full">
              <img
                src={userIcon}
                alt="user icon"
                className="h-[105px] w-[105px] mb-2"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-white text-4xl font-bold mt-6">
                Welcome Back!
              </p>
              <p className="text-2xl mt-2 text-white"> {userData?.nom || "Cashier"}</p>
            </div>
          </div>
          <div>
            <p className="text-white mt-28 text-xl font-bold mr-4">
              {time}
            </p>
          </div>
        </div>
        <PatientsList patientsList={patients} totalCount={totalCount} onFetchPage={handleFetchPage} />
      </div>
    </DashBoard>
  );
}
