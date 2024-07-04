// src/components/MainScreen.tsx
import React from 'react';

interface MainScreenProps {
  config: any;
  onStart: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ config, onStart }) => {
  const theme = config?.config?.mainScreen;

  if (!theme) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white flex items-center justify-center h-screen w-screen font-din">
      <div className="relative w-full h-full">
        <img
          src={theme.backgroundImage}
          alt="Background"
          className="w-full h-full object-cover"
          onClick={onStart}
        />
        <div
          className="absolute inset-x-0 bottom-0 bg-white p-6 shadow-lg text-center"
          style={{
            height: '35%',
            borderTopLeftRadius: '1.5rem',
            borderTopRightRadius: '1.5rem',
          }}
        >
          <h1 className={`text-4xl font-bold mb-2 ${theme.textColor}`}>{theme.title}</h1>
          <p className={`text-lg mb-2 ${theme.subtitleColor}`}>{theme.subtitle}</p>
          <p className="text-md text-gray-500 mb-4">- TAP SCREEN TO BEGIN -</p>
          <div className="text-sm text-gray-400">
            Powered by - <span className="text-gray-600 font-bold">Parkonomy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainScreen;
