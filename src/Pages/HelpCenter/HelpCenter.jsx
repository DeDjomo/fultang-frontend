import { useNavigate } from "react-router-dom";
import ChatWindow from "../../GlobalComponents/ChatWindow.jsx";
import { Collapse, theme } from "antd";
import { FaQuestionCircle, FaLock, FaFileAlt, FaUserMd } from "react-icons/fa";

export function HelpCenter() {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  const faqItems = [
    {
      key: '1',
      label: <div className="flex items-center gap-2 font-semibold text-lg"><FaLock className="text-blue-600" /> How do I change my password?</div>,
      children: <p className="text-gray-600">You can change your password by clicking on the <strong>Settings</strong> icon (cogwheel) in the top navigation bar. Then select "Change Password", enter your current password and your new password twice. A confirmation message will appear upon success.</p>,
      style: panelStyle,
    },
    {
      key: '2',
      label: <div className="flex items-center gap-2 font-semibold text-lg"><FaFileAlt className="text-green-600" /> How can I view my reports?</div>,
      children: <p className="text-gray-600">Click on the <strong>Envelope</strong> icon in the navigation bar to access your messages and reports. Depending on your role (Director, Pharmacist, Accountant), you will be redirected to the specific reports page for your department.</p>,
      style: panelStyle,
    },
    {
      key: '3',
      label: <div className="flex items-center gap-2 font-semibold text-lg"><FaUserMd className="text-purple-600" /> Who should I contact for technical issues?</div>,
      children: <p className="text-gray-600">For any technical issues (login problems, system errors, data not loading), please contact the IT Support team or the System Administrator immediately. You can also use the form below to send a ticket.</p>,
      style: panelStyle,
    },
    {
      key: '4',
      label: <div className="flex items-center gap-2 font-semibold text-lg"><FaQuestionCircle className="text-orange-600" /> How does the inventory system update?</div>,
      children: <p className="text-gray-600">The inventory is updated in real-time when new deliveries are registered (input) or when supplies are distributed to services (output). Pharmacy sales also automatically deduct stock.</p>,
      style: panelStyle,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 h-[70px] flex justify-between items-center">
          <h1 className="text-3xl text-secondary font-bold flex items-center gap-2">
            <FaQuestionCircle /> Help Center
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-10">
        {/* Flèche de retour */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-800 hover:text-blue-900 mt-6 mb-4 font-medium transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </button>

        {/* Barre de recherche */}
        <div className="mt-4 mb-10">
          <input
            type="text"
            placeholder="Search for help (e.g. 'Password', 'Inventory')..."
            className="w-full p-4 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>

        {/* FAQ Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Frequently Asked Questions</h2>
        <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
          <Collapse
            bordered={false}
            defaultActiveKey={['1']}
            expandIcon={({ isActive }) => <FaQuestionCircle style={{ transform: `rotate(${isActive ? 90 : 0}deg)`, transition: 'transform 0.2s', color: '#666' }} />}
            style={{ background: token.colorBgContainer }}
            items={faqItems}
          />
        </div>

        {/* Customer Support Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Contact Support</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <select className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all">
                    <option>Select a topic</option>
                    <option>Technical Issue</option>
                    <option>Billing / Payments</option>
                    <option>Access Request</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    placeholder="Describe your issue in detail..."
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all h-32"
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button" // Prevent submit for demo
                    onClick={() => alert("Message sent to support! (Demo)")}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 shadow-md transition-all font-semibold"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-secondary text-white p-6 rounded-xl shadow-lg h-full">
              <h3 className="text-xl font-bold mb-4">Quick Assistance</h3>
              <p className="mb-4 opacity-90">For urgent matters, reach us directly:</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="bg-white/20 p-2 rounded-full">📞</span>
                  <div>
                    <p className="text-xs opacity-70">IT Hotline</p>
                    <p className="font-mono font-bold">+237 000 000 000</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="bg-white/20 p-2 rounded-full">📧</span>
                  <div>
                    <p className="text-xs opacity-70">Email Support</p>
                    <p className="font-bold">support@fultang.clinic</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Fultang Clinic. All rights reserved.</p>
        </footer>
      </div>
      <ChatWindow />
    </div>
  );
}