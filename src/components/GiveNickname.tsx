import React, { useState, useEffect, useRef } from 'react';
import TimeoutModal from './TimeoutModal';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

interface GiveNicknameProps {
  onContinue: (nickname: string) => void;
  onGoBack: () => void;
  config: any;
}

const GiveNickname: React.FC<GiveNicknameProps> = ({ config, onContinue, onGoBack }) => {
  const appInsights = useAppInsightsContext();
  const [nickname, setNickname] = useState('');
  const theme = config.config.enterNickNameScreen;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const recentlyPressedRef = useRef(false);

  useEffect(() => {
    appInsights.trackTrace({ message: 'GiveNickname component mounted' });

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
          setCountdown(prev => {
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

      appInsights.trackTrace({ message: 'GiveNickname component unmounted' });
    };
  }, [appInsights]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    appInsights.trackTrace({ message: 'Nickname input changed', properties: { nickname: e.target.value } });
  };

  const handleKeyPress = (key: string) => {
    if (recentlyPressedRef.current) return;

    setNickname((prev) => prev + key);
    appInsights.trackEvent({ name: 'KeyPress', properties: { key, nickname: nickname + key } });

    recentlyPressedRef.current = true;
    setTimeout(() => {
      recentlyPressedRef.current = false;
    }, 200); // Allow 200ms delay between key presses
  };

  const handleDelete = () => {
    if (recentlyPressedRef.current) return;

    setNickname((prev) => prev.slice(0, -1));
    appInsights.trackEvent({ name: 'KeyDelete', properties: { nickname: nickname.slice(0, -1) } });

    recentlyPressedRef.current = true;
    setTimeout(() => {
      recentlyPressedRef.current = false;
    }, 200); // Allow 200ms delay between key presses
  };

  const handleContinue = () => {
    if (nickname) {
      appInsights.trackEvent({ name: 'ContinueWithNickname', properties: { nickname } });
      appInsights.trackTrace({ message: 'User clicked continue with nickname', properties: { nickname } });
      onContinue(nickname);
    } else {
      appInsights.trackEvent({ name: 'ContinueWithoutNickname' });
      appInsights.trackTrace({ message: 'User attempted to continue without entering nickname' });
      alert('Please enter a nickname');
    }
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

  const keys = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M'
  ];

  return (
    <div className="bg-white flex flex-col items-center justify-center min-h-screen h-screen w-screen p-0 m-0 font-din text-center">
      <div className="relative w-full max-w-xl" style={{ minHeight: '70vh' }}>
        <h2 className={`text-2xl font-semibold mb-4 ${theme.textColor} text-center`}>{theme.title}</h2>
        <p className={`text mb-8 ${theme.textColor} text-center`}>{theme.subtitle}</p>
        <div className="mb-6">
          <input
            type="text"
            value={nickname}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 text-3xl font-bold ${theme.inputBackgroundColor} ${theme.inputTextColor} ${theme.inputBorderColor} rounded-lg focus:outline-none text-center pointer-events-none select-none`}
            placeholder="Enter Nickname"
          />
        </div>
        <div className="grid grid-cols-10 gap-2 mb-6">
          {keys.map((key) => (
            <button
              key={key}
              onMouseDown={() => handleKeyPress(key)}
              onTouchStart={() => handleKeyPress(key)}
              onClick={() => handleKeyPress(key)}
              className="w-12 h-12 text-gray-600 text-xl border rounded-lg bg-white hover:bg-gray-200"
            >
              {key}
            </button>
          ))}
          <button
            onMouseDown={handleDelete}
            onTouchStart={handleDelete}
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
          onClick={() => {
            appInsights.trackEvent({ name: 'GoBack' });
            appInsights.trackTrace({ message: 'User chose to go back and edit details' });
            onGoBack();
          }}
          className={`w-full py-3 font-semibold bg-transparent border-2 ${theme.inputBorderColor} ${theme.goBackButotntextColor} rounded-lg ${theme.backButtonHoverColor}`}
        >
          GO BACK & EDIT DETAILS
        </button>
      </div>
      {isModalVisible && (
        <TimeoutModal countdown={countdown} onContinue={handleModalContinue} onReset={handleModalReset} />
      )}
    </div>
  );
};

export default GiveNickname;
