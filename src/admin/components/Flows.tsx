import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FlowsProps {
  flow: any;
  siteId: string | null;
  isEditing: boolean;
}

const Flows: React.FC<FlowsProps> = ({ flow, siteId, isEditing }) => {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        let response;
        if (isEditing && siteId) {
          response = await axios.get(`/api/site-config/${siteId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
        } else {
          response = await axios.get(`/api/flows/${flow.workflowName}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
        }
        setConfig(response.data.config);
      } catch (error) {
        console.error('Error fetching configuration:', error);
      }
    };

    fetchConfig();
  }, [flow.workflowName, siteId, isEditing]);

  const renderFormFields = (config: any, parentKey: string = '') => {
    if (!config) return null;

    return Object.keys(config).map((key) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const value = config[key];

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return (
          <div key={fullKey} className="mb-4 col-span-2">
            <h3 className="font-bold text-lg">{key}</h3>
            <div className="ml-4 grid grid-cols-2 gap-4">{renderFormFields(value, fullKey)}</div>
          </div>
        );
      }

      return (
        <div key={fullKey} className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{key}</label>
          <input
            type="text"
            name={fullKey}
            value={value}
            onChange={(e) => handleInputChange(e, fullKey)}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>
      );
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const { value } = e.target;
    const keys = key.split('.');
    const newConfig = { ...config };

    let temp = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      temp = temp[keys[i]];
    }
    temp[keys[keys.length - 1]] = value;

    setConfig(newConfig);
  };

  const handleSaveClick = async () => {
    try {
      if (isEditing && siteId) {
        await axios.put(`/api/site-config/${siteId}`, { config }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      } else {
        await axios.put(`/api/flows/${flow.id}`, { config }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }
      alert('Flow configuration saved successfully!');
    } catch (error) {
      console.error('Error saving flow configuration:', error);
    }
  };

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-auto p-8 h-full">
      <h2 className="text-2xl font-bold mb-8">{flow.workflowName}</h2>
      <form className="grid grid-cols-2 gap-4">
        {renderFormFields(config)}
        <div className="col-span-2">
          <button
            type="button"
            onClick={handleSaveClick}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default Flows;
