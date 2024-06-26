import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHome, FaCogs, FaBolt, FaChargingStation, FaPalette, FaUsers, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import AddSiteModal from './AddSiteModal';
import Flows from './Flows';

const AdminDashboard: React.FC = () => {
  const [flows, setFlows] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedFlow, setSelectedFlow] = useState<any>(null);
  const [showFlowsDropdown, setShowFlowsDropdown] = useState<boolean>(false);

  useEffect(() => {
    fetchFlows(); // Ensure flows are fetched on component mount to populate dropdown
  }, []);

  useEffect(() => {
    if (currentView === 'home') {
      fetchSites();
    }
  }, [currentView]);

  const fetchSites = async () => {
    try {
      const response = await axios.get('/api/sites', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSites(response.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchFlows = async () => {
    try {
      const response = await axios.get('/api/flows', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFlows(response.data);
    } catch (error) {
      console.error('Error fetching flows:', error);
    }
  };

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    if (view !== 'flows') {
      setSelectedFlow(null);
      setShowFlowsDropdown(false);
    }
  };

  const handleFlowSelect = (flow: any) => {
    setSelectedFlow(flow);
    setShowFlowsDropdown(false);
    setCurrentView('flows'); // Switch to flows view when a flow is selected
  };

  const renderContent = () => {
    if (currentView === 'home') {
      return (
        <div>
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Sites Overview</h1>
            <AddSiteModal flows={flows} />
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Name</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sites.map((site) => (
                  <tr key={site.siteId} className="hover:bg-gray-50">
                    <td className="py-4 px-4 whitespace-nowrap">{site.siteName}</td>
                    <td className="py-4 px-4">{site.address}</td>
                    <td className="py-4 px-4">{site.contactNumber}</td>
                    <td className="py-4 px-4">{site.email}</td>
                    <td className="py-4 px-4">{site.workflowName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (currentView === 'flows' && selectedFlow) {
      return <Flows flow={selectedFlow} />;
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      <aside className="w-64 bg-gradient-to-b from-blue-800 to-blue-600 text-white relative">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8">Admin Dashboard</h2>
          <nav className="space-y-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition duration-200 ${currentView === 'home' ? 'bg-blue-700' : ''}`}
            >
              <FaHome />
              <span>Home</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowFlowsDropdown(!showFlowsDropdown)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition duration-200 ${currentView === 'flows' ? 'bg-blue-700' : ''}`}
              >
                <FaCogs />
                <span>Flows</span>
                <FaChevronDown />
              </button>
              {showFlowsDropdown && (
                <div className="absolute left-0 mt-2 w-full bg-white text-black rounded-md shadow-lg z-10">
                  {flows.map((flow) => (
                    <button
                      key={flow.id}
                      onClick={() => handleFlowSelect(flow)}
                      className="block px-4 py-2 text-left w-full hover:bg-gray-200"
                    >
                      {flow.workflowName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {[
              { icon: <FaBolt />, label: 'Test Charger', view: 'test' },
              { icon: <FaChargingStation />, label: 'Monitor Charger', view: 'monitor' },
              { icon: <FaPalette />, label: 'Colors-Setting', view: 'colors' },
              { icon: <FaUsers />, label: 'User Management', view: 'users' },
              { icon: <FaSignOutAlt />, label: 'Logout', view: 'logout' },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item.view)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition duration-200 ${currentView === item.view ? 'bg-blue-700' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
