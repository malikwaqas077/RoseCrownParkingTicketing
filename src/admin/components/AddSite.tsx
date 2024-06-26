// src/admin/components/AddSite.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';

interface Flow {
  id: string;
  name: string;
}

const AddSite: React.FC = () => {
  const [siteName, setSiteName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [workflowName, setWorkflowName] = useState<string>('');
  const [flows, setFlows] = useState<Flow[]>([]);
  const [message, setMessage] = useState<string>('');
//   const { user } = useAuth();

  useEffect(() => {
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

    fetchFlows();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/sites', {
        siteName, address, contactNumber, email, password, workflowName
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log(response.data)
      setMessage('Site added successfully!');
      // Reset form fields
      setSiteName('');
      setAddress('');
      setContactNumber('');
      setEmail('');
      setPassword('');
      setWorkflowName('');
    } catch (error) {
      console.error('Error adding site:', error);
      setMessage('Error adding site');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Site</h2>
      <input
        value={siteName}
        onChange={(e) => setSiteName(e.target.value)}
        placeholder="Site Name"
        required
      />
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
        required
      />
      <input
        value={contactNumber}
        onChange={(e) => setContactNumber(e.target.value)}
        placeholder="Contact Number"
        required
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <select
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        required
      >
        <option value="">Select Workflow</option>
        {flows.map((flow) => (
          <option key={flow.id} value={flow.name}>{flow.name}</option>
        ))}
      </select>
      <button type="submit">Add Site</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default AddSite;
