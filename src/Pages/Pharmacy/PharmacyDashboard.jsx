import PropTypes from "prop-types";

export const PharmacyDashboard = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="h-screen w-64 bg-gradient-to-b from-[#1A73A3] to-[#50C2B9] text-white p-4 fixed">
        <div className="text-2xl font-bold mb-8">Fultang Polyclinic</div>
        <nav className="space-y-4">
          {/* Navigation links will be added here */}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-screen overflow-x-hidden ml-[256px]">
        {children}
      </div>
    </div>
  );
};

PharmacyDashboard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PharmacyDashboard;