import React, { useState, useEffect } from 'react';
import TimeoutModal from './TimeoutModal';
import axios from 'axios';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

interface DecisionProps {
  regNumber: string;
  parkingEndTime: string;
  onFinish: (email: string) => void;
  config: any;
}

const Decision: React.FC<DecisionProps> = ({ regNumber, parkingEndTime, config, onFinish }) => {
  const appInsights = useAppInsightsContext();
  const [email, setEmail] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const theme = config.config.decisionScreen;

  appInsights.trackTrace({ message: 'Decision component rendered', properties: { regNumber, parkingEndTime } });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timer);
      clearTimeout(countdownTimer);
      setCountdown(30);
      setIsModalVisible(false);

      appInsights.trackEvent({ name: 'TimeoutReset' });
      appInsights.trackTrace({ message: 'Timeout reset and countdown started' });

      timer = setTimeout(() => {
        setIsModalVisible(true);
        appInsights.trackEvent({ name: 'TimeoutModalShown' });
        appInsights.trackTrace({ message: 'Timeout modal shown' });

        countdownTimer = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              clearInterval(countdownTimer);
              window.location.href = '/';
              appInsights.trackEvent({ name: 'TimeoutExpired' });
              appInsights.trackTrace({ message: 'Timeout expired, redirecting to home' });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 30000);
    };

    const handleInteraction = () => {
      appInsights.trackEvent({ name: 'UserInteraction' });
      appInsights.trackTrace({ message: 'User interaction detected, resetting timeout' });
      resetTimeout();
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    resetTimeout();

    return () => {
      clearTimeout(timer);
      clearTimeout(countdownTimer);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);

      appInsights.trackTrace({ message: 'Decision component unmounted' });
    };
  }, [appInsights]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    appInsights.trackTrace({ message: 'Email input changed', properties: { email: e.target.value } });
  };

  const handleKeyPress = (key: string) => {
    setEmail((prev) => prev + key);
    appInsights.trackEvent({ name: 'KeyPress', properties: { key, email: email + key } });
  };

  const handleDelete = () => {
    setEmail((prev) => prev.slice(0, -1));
    appInsights.trackEvent({ name: 'KeyDelete', properties: { email: email.slice(0, -1) } });
  };

  const handleFinish = async () => {
    await updateLeaderboard();
    appInsights.trackEvent({ name: 'Finish', properties: { email } });
    appInsights.trackTrace({ message: 'User clicked finish', properties: { email } });
    onFinish(email);
    window.location.href = '/';
  };

  const handleModalContinue = () => {
    appInsights.trackEvent({ name: 'ContinueFromTimeoutModal' });
    appInsights.trackTrace({ message: 'User continued from timeout modal, resetting countdown' });
    setIsModalVisible(false);
    setCountdown(30);
  };

  const handleModalReset = () => {
    appInsights.trackEvent({ name: 'ResetFromTimeoutModal' });
    appInsights.trackTrace({ message: 'User chose to reset from timeout modal, redirecting to home' });
    window.location.href = '/';
  };

  const updateLeaderboard = async () => {
    const nickname = config.nickname; // Assuming nickname is stored in config after donation is made
    const amount = config.amount; // Assuming amount is stored in config after donation is made
    if (!nickname || !amount) return;

    appInsights.trackEvent({ name: 'UpdateLeaderboard', properties: { nickname, amount } });
    appInsights.trackTrace({ message: 'Updating leaderboard', properties: { nickname, amount } });

    const updatedLeaders = [
      ...config.config.tapToStartScreen.recentLeaders,
      { name: nickname, amount: `£${amount}` },
    ].sort((a, b) => parseFloat(b.amount.substring(1)) - parseFloat(a.amount.substring(1)));

    config.config.tapToStartScreen.recentLeaders = updatedLeaders.slice(0, 10);

    try {
      await axios.put(`/api/site-config/${config.siteId}`, config, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      appInsights.trackTrace({ message: 'Leaderboard updated successfully' });
      console.log('Leaderboard updated successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        appInsights.trackException({ exception: error });
      } else {
        appInsights.trackException({ exception: new Error('Unknown error occurred during leaderboard update') });
      }
      console.error('Error updating leaderboard:', error);
    }
  };

  const keys = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '-',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M', '@', '.', '_'
  ];

  return (
    <div className="bg-white flex items-center justify-center min-h-screen font-din">
      <div className="relative w-full max-w-lg" style={{ minHeight: '70vh' }}>
        <h2 className={`text-2xl font-bold p-4 ${theme.textColor} text-center`}>THANK YOU!</h2>
        <p className={`text-lg mb-8 ${theme.textColor} text-center`}>Your parking session details are below</p>
        <div className="mb-6 pl-8 pr-8">
          <input
            type="text"
            value={regNumber}
            readOnly
            className={`w-full px-4 py-3 text-3xl font-bold ${theme.inputBackgroundColor} ${theme.inputTextColor} ${theme.inputBorderColor} rounded-lg focus:outline-none text-center`}
          />
        </div>
        <p className={`text-lg mb-8 ${theme.textColor} text-center`}>is registered to park until:</p>
        <p className={`text-2xl font-bold mb-8 ${theme.textColor} text-center`}>{parkingEndTime}</p>
        <div className="bg-gray-200 p-4 rounded-3xl mb-6">
          <p className={`text-2xl font-bold mb-4 ${theme.receiptTextColor} text-center`}>NEED A RECEIPT?</p>
          <p className={`text-sm mb-4 ${theme.subtitleColor} text-center`}>Enter your email address or scan the QR code below</p>
          <input
            type="text"
            value={email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 text-lg ${theme.inputTextColor} ${theme.inputBorderColor} rounded-lg focus:outline-none mb-6`}
            placeholder="Enter your email address"
          />
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
            onClick={handleFinish}
            className={`w-full py-3 mb-4 ${theme.buttonContinueColor} ${theme.buttonTextColor} rounded-lg ${theme.buttonHoverColor}`}
          >
            FINISH
          </button>
          <div className="flex items-center justify-between bg-white rounded-lg p-4">
            <div className="text-lg font-bold">
              <p className={`mb-1 ${theme.qrTextColor}`}>SCAN HERE TO VIEW</p>
              <p className={`mb-1 ${theme.qrTextColor}`}>YOUR DIGITAL RECEIPT</p>
            </div>
            <img src="/assets/icons/qr-code.png" alt="QR Code" className="w-16 h-16" />
          </div>
        </div>
      </div>
      {isModalVisible && (
        <TimeoutModal countdown={countdown} onContinue={handleModalContinue} onReset={handleModalReset} />
      )}
    </div>
  );
};

export default Decision;
