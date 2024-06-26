import React from 'react';

interface FlowsProps {
  flow: any;
}

const Flows: React.FC<FlowsProps> = ({ flow }) => {
  const renderFormFields = (config: any, parentKey: string = '') => {
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
    const newConfig = { ...flow.config };

    let temp = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      temp = temp[keys[i]];
    }
    temp[keys[keys.length - 1]] = value;

    flow.config = newConfig;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-auto p-8 h-full">
      <h2 className="text-2xl font-bold mb-8">{flow.workflowName}</h2>
      <form className="grid grid-cols-2 gap-4">
        {renderFormFields(flow.config)}
        <div className="col-span-2">
          <button
            type="button"
            onClick={() => handleSaveClick(flow.id)}
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
