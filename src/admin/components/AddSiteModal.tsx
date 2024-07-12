import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AddSiteModalProps {
  initialFlows: any[];
}

const AddSiteModal: React.FC<AddSiteModalProps> = ({ initialFlows }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [siteId, setSiteId] = useState('');
  const [siteName, setSiteName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const [alioIpAddress, setAlioIpAddress] = useState('');
  const [alioPortNo, setAlioPortNo] = useState('');
  const [role, setRole] = useState('user');
  const [flows, setFlows] = useState<any[]>(initialFlows || []);
  const [message, setMessage] = useState('');
  const [isFieldsEnabled, setIsFieldsEnabled] = useState(false);

  useEffect(() => {
    const fetchCarparkInfo = async (siteId: string) => {
      try {
        const response = await axios.get(`https://e850837e-0018-401b-9f24-fb730bd5a456.mock.pstmn.io/carpark/id/${siteId}?flow=voluntary_payment&whitelist=true`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = response.data;
        setAddress(`${data.street}, ${data.city}, ${data.postcode}`);
        setSiteName(`${data.client.name} `);
        const enabledFlows = [];
        if (data.kiosk_settings.standard_payment.enabled) enabledFlows.push("ParkFeeFlow");
        if (data.kiosk_settings.voluntary_payment_not_whitelist.enabled) enabledFlows.push("OptionalDonationFlow");
        if (data.kiosk_settings.voluntary_payment_whitelist.enabled) enabledFlows.push("MandatoryDonationFlow");
        if (data.kiosk_settings.free_parking.enabled) enabledFlows.push("NoParkFeeFlow");
        setFlows(enabledFlows.map((flowName, index) => ({ id: index.toString(), name: flowName })));
        setIsFieldsEnabled(true);
        setMessage('Site ID verified successfully!');
      } catch (error) {
        console.error('Error fetching carpark info:', error);
        setMessage('Error: Site ID is not correct.');
      }
    };

    if (siteId) {
      fetchCarparkInfo(siteId);
    }
  }, [siteId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("the post data is", siteId, siteName, address, contactNumber, email, password, workflowName, alioIpAddress, alioPortNo, role);
    e.preventDefault();
    try {
      const response = await axios.post('/api/sites', {
        siteId, siteName, address, contactNumber, email, password, workflowName, alioIpAddress, alioPortNo, role
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log("the post data is", siteId, siteName, address, contactNumber, email, password, workflowName, alioIpAddress, alioPortNo, role);
      console.log(response);
      setMessage('Site added successfully!');
      // Reset form fields
      setSiteId('');
      setSiteName('');
      setAddress('');
      setContactNumber('');
      setEmail('');
      setPassword('');
      setWorkflowName('');
      setAlioIpAddress('');
      setAlioPortNo('');
      setRole('user');
      setIsFieldsEnabled(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding site:', error);
      setMessage('Error adding site');
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Add Site
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Site</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Site ID</label>
                <input
                  type="text"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Contact Number</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!isFieldsEnabled}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!isFieldsEnabled}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!isFieldsEnabled}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Alio IP Address</label>
                <input
                  type="text"
                  value={alioIpAddress}
                  onChange={(e) => setAlioIpAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!isFieldsEnabled}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Alio Port Number</label>
                <input
                  type="text"
                  value={alioPortNo}
                  onChange={(e) => setAlioPortNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!isFieldsEnabled}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!isFieldsEnabled}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Workflow</label>
                <select
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!isFieldsEnabled}
                >
                  <option value="">Select Workflow</option>
                  {flows && flows.map((flow) => (
                    <option key={flow.id} value={flow.name}>{flow.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mr-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isFieldsEnabled}
                >
                  Add Site
                </button>
              </div>
              {message && <p className="mt-4 text-red-500">{message}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// VnrOSuFhnql

export default AddSiteModal;
