// src/components/TapToStart.tsx
import React from 'react';
import { themes } from '../config/themes';

interface TapToStartProps {
  flow: keyof typeof themes;
  onStart: () => void;
}

const TapToStart: React.FC<TapToStartProps> = ({ flow, onStart }) => {
  const theme = themes[flow].tapToStartScreen;

  return (
    <div className="bg-white flex items-center justify-center min-h-screen font-din">
      <div className="relative w-full max-w-lg" style={{ minHeight: '70vh', minWidth: '50vh' }}>
        <div className="text-center mt-12">
          <img src={theme.logo} alt="Parkdonate Logo" className="mb-4 w-72 h-36 mx-auto" />
          <h3 className={`font-bold ${theme.validateParkingTextColor}`}>VALIDATE YOUR PARKING!</h3>
        </div>
        <div className="text-center mb-12">
          <button
            className={`mt-16 px-16 py-3 rounded ${theme.buttonColor} ${theme.buttonTextColor} text-lg font-semibold w-3/4`}
            onClick={onStart}
          >
            TAP TO START
          </button>
        </div>
        {flow !== 'NoParkFeeFlow' && (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-700">Powered by - Parkonomy</p>
            </div>
            <div className={`text-center py-8 w-full rounded-t-3xl ${theme.backgroundColor}`}>
              <h2 className="text-xl font-bold text-white mb-4">{theme.title}</h2>
              <div className="bg-white mx-auto rounded-full py-4 px-8 inline-block">
                <img src={theme.Macmillanlogo} alt={theme.subtitle} />
              </div>
            </div>
            <div className={`py-4 w-full flex items-center pl-4 ${theme.recentLeadersBackgroundColor}`}>
              <h3 className="text-gray-700 font-semibold text-lg mb-0 flex-shrink-0" style={{ minWidth: '150px' }}>Recent Leaders:</h3>
              <div className="relative w-full overflow-hidden ml-4">
                <div className="flex animate-scroll space-x-4 whitespace-nowrap">
                  {theme.recentLeaders.map((leader, index) => (
                    <span key={index} className="bg-white rounded-full px-4 py-1 text-sm font-semibold text-gray-700">
                      {leader.name} - {leader.amount}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-gray-600 px-4 py-4">
              <p>The money paid to the owner of this car park is donated to a charity of their choosing by the owner. Payments for parking are voluntary and you choose how much you want to pay!</p>
              <p className="mt-2">For information and terms & conditions go to www.parkdonate.com</p>
            </div>
          </>
        )}
        {flow === 'NoParkFeeFlow' && (
          <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 ${theme.poweredByBackgroundColor} rounded-full py-2 px-4`}>
            <p className="text-sm text-gray-700">Powered by - Parkonomy</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TapToStart;
