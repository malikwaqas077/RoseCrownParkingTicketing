import React from 'react';

interface MainScreenProps {
  config: any;
  onStart: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ config, onStart }) => {
  const theme = config?.config?.mainScreen;

  if (!theme) {
    return (
      <div className="bg-white flex flex-col items-center justify-center h-screen w-screen font-din">
        <div className="loader mb-4"></div>
        <p className="text-lg text-gray-700">Loading configuration, please wait...</p>
        <style>
          {`
            .loader {
              border: 8px solid #f3f3f3;
              border-radius: 50%;
              border-top: 8px solid #3498db;
              width: 60px;
              height: 60px;
              animation: spin 2s linear infinite;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div 
      className="bg-white flex items-center justify-center h-screen w-screen font-din cursor-pointer"
      onClick={onStart}
    >
      <div className="relative w-full h-full">
        <img
          src={theme.backgroundImage}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-x-0 bottom-0 bg-white p-6 shadow-lg text-center"
          style={{
            height: '35%',
            borderTopLeftRadius: '1.5rem',
            borderTopRightRadius: '1.5rem',
          }}
        >
          <h1 className={`text-6xl font-bold mb-2 mt-16 ${theme.textColor}`}>{theme.title}</h1>
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