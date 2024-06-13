// src/components/EnterRegNumber.tsx
import React, { useState, useEffect } from 'react';
import { themes } from '../config/themes';

interface EnterRegNumberProps {
  selectedDay: number |string | null;
  flow: keyof typeof themes;
  onContinue: (regNumber: string) => void;
}

const EnterRegNumber: React.FC<EnterRegNumberProps> = ({ selectedDay, flow, onContinue }) => {
  const [regNumber, setRegNumber] = useState('');
  const theme = themes[flow].enterRegNumberScreen;

  useEffect(() => {
    console.log('Selected day:', selectedDay);
  }, [selectedDay]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegNumber(e.target.value.toUpperCase());
  };

  const handleKeyPress = (key: string) => {
    setRegNumber((prev) => (prev + key).toUpperCase());
  };

  const handleDelete = () => {
    setRegNumber((prev) => prev.slice(0, -1));
  };

  const handleContinue = () => {
    if (regNumber) {
      onContinue(regNumber);
    } else {
      alert('Please enter a registration number');
    }
  };

  const keys = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M'
  ];

  return (
    <div className="bg-white flex items-center justify-center min-h-screen font-din">
      <div className="relative w-full max-w-lg p-8" style={{ minHeight: '70vh' }}>
        <h2 className={`text-2xl font-semibold mb-4 ${theme.textColor} text-center`}>{theme.title}</h2>
        <p className={`text mb-8 ${theme.textColor} text-center`}>{theme.subtitle}</p>
        <div className="mb-6">
          <input
            type="text"
            value={regNumber}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 text-3xl font-bold ${theme.inputBackgroundColor} ${theme.inputTextColor} ${theme.inputBorderColor} rounded-lg focus:outline-none text-center`}
            placeholder="Enter Registration Number"
          />
        </div>
        <div className="grid grid-cols-10 gap-2 mb-6">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="w-12 h-12 text-gray-600 text-xl border rounded-lg bg-white hover:bg-gray-200"
            >
              {key}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="w-12 h-12 text-xl border text-gray-600 rounded-lg bg-white hover:bg-gray-200 col-span-2"
          >
            ⌫
          </button>
        </div>
        <button
          onClick={handleContinue}
          className={`w-full py-3 mb-4 ${theme.buttonContinueColor} ${theme.buttonTextColor} rounded-lg ${theme.buttonHoverColor}`}
        >
          CONTINUE
        </button>
        <p className={`text-lg font-bold mb-4 ${theme.inputTextColor} text-center`}>OR</p>
        <button
          className={`w-full py-3 font-semibold bg-transparent border-2 ${theme.inputBorderColor} ${theme.goBackButotntextColor} rounded-lg ${theme.backButtonHoverColor}`}
        >
          GO BACK & EDIT DETAILS
        </button>
      </div>
    </div>
  );
};

export default EnterRegNumber;
