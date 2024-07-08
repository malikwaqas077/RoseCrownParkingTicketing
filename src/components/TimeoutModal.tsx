import React from 'react';

interface TimeoutModalProps {
  countdown: number;
  onContinue: () => void;
  onReset: () => void;
}

const TimeoutModal: React.FC<TimeoutModalProps> = ({ countdown, onContinue, onReset }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg text-center">
        <h2 className="text-2xl mb-4">Are you still there?</h2>
        <p className="text-lg mb-4">You will be redirected to the main screen in {countdown} seconds.</p>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
          onClick={onContinue}
        >
          Yes
        </button>
        <button
          className="bg-gray-500 text-white py-2 px-4 rounded"
          onClick={onReset}
        >
          No
        </button>
      </div>
    </div>
  );
};

export default TimeoutModal;
