import React, { useEffect, useState } from 'react';
import TimeoutModal from './TimeoutModal';  // Import the TimeoutModal component
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';
import axios from 'axios';

interface Leader {
  name: string;
  amount: string;
}

interface Theme {
  logo: string;
  validateParkingTextColor: string;
  buttonColor: string;
  buttonTextColor: string;
  backgroundColor: string;
  title: string;
  Macmillanlogo: string;
  subtitle: string;
  recentLeadersBackgroundColor: string;
  poweredByBackgroundColor: string;
}

interface Config {
  config: {
    tapToStartScreen: Theme;
  };
}

interface TapToStartProps {
  onStart: () => void;
  config: Config | 'NoParkFeeFlow' | 'MandatoryDonationFlow';
  flowName: string;
}

const TapToStart: React.FC<TapToStartProps> = ({ config, onStart, flowName }) => {
  const appInsights = useAppInsightsContext();
  const theme = (config as Config).config?.tapToStartScreen;
  const showBottomSections = flowName !== 'NoParkFeeFlow' && flowName !== 'ParkFeeFlow';
  const apiUrl = import.meta.env.VITE_API_URL;
  const api = import.meta.env.NEXT_PUBLIC_API_BASE_URL;
  console.log("API Number is:", apiUrl+api)

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [recentLeaders, setRecentLeaders] = useState<Leader[]>([]);

  useEffect(() => {
    appInsights.trackTrace({ message: 'TapToStart component mounted' });
    const API_KEY = import.meta.env.NEXT_PUBLIC_API_KEY;
    console.log(API_KEY)
    const fetchRecentLeaders = async () => {
      try {
        const token = localStorage.getItem('external_token');
        const response = await axios.get('https://e850837e-0018-401b-9f24-fb730bd5a456.mock.pstmn.io/carpark/id/VnrOSuFhnql/top-donates', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const leadersData = Object.entries(response.data['top-donates']).map(([name, amount]) => ({
          name,
          amount: amount as string, // Explicitly cast amount to string
        }));
        
        setRecentLeaders(leadersData);
      } catch (error) {
        console.error('Error fetching recent leaders:', error);
        appInsights.trackException({ exception: error as Error });
      }
    };

    fetchRecentLeaders();

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

      appInsights.trackTrace({ message: 'TapToStart component unmounted' });
    };
  }, [appInsights]);

  const handleContinue = () => {
    appInsights.trackEvent({ name: 'ContinueFromTimeoutModal' });
    appInsights.trackTrace({ message: 'User continued from timeout modal, resetting countdown' });
    setIsModalVisible(false);
    setCountdown(30);
  };

  const handleReset = () => {
    appInsights.trackEvent({ name: 'ResetFromTimeoutModal' });
    appInsights.trackTrace({ message: 'User chose to reset from timeout modal, redirecting to home' });
    window.location.href = '/';
  };

  return (
    <div className="bg-white flex items-center justify-center min-h-screen h-screen w-screen p-0 m-0 font-din">
      <div className="relative w-full h-full" style={{ minHeight: '70vh', minWidth: '50vh' }}>
        <div className="text-center mt-48">
          <img src={theme.logo} alt="Parkdonate Logo" className="mb-4 w-72 h-36 mx-auto" />
          <h3 className={`font-bold ${theme.validateParkingTextColor}`}>VALIDATE YOUR PARKING!</h3>
        </div>
        <div className="text-center mb-12">
          <button
            className={`mt-16 px-16 py-3 rounded ${theme.buttonColor} ${theme.buttonTextColor} text-lg font-semibold w-3/4`}
            onClick={() => {
              appInsights.trackEvent({ name: 'TapToStartButtonClicked' });
              appInsights.trackTrace({ message: 'User clicked TAP TO START button' });
              onStart();
            }}
          >
            TAP TO START
          </button>
        </div>
        {showBottomSections && (
          <>
            <div className="text-center mb-4">
              <p className="inline-block text-sm text-gray-700 bg-gray-200 rounded-full py-2 px-4">Powered by - Parkonomy</p>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 text-center py-8 w-full rounded-t-3xl ${theme.backgroundColor}`}>
              <h2 className="text-xl font-bold text-white mb-4">{theme.title}</h2>
              <div className="bg-white mx-auto rounded-full py-4 px-8 inline-block">
                <img src={theme.Macmillanlogo} alt={theme.subtitle} />
              </div>
              <div className={`py-4 w-full flex items-center pl-4 ${theme.recentLeadersBackgroundColor}`}>
                <h3 className="text-gray-700 font-semibold text-lg mb-0 flex-shrink-0" style={{ minWidth: '150px' }}>Recent Leaders:</h3>
                <div className="relative w-full overflow-hidden ml-4">
                  <div className="flex animate-scroll space-x-4 whitespace-nowrap">
                    {recentLeaders.map((leader: Leader, index: number) => (
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
            </div>
          </>
        )}
        {(flowName === 'NoParkFeeFlow' || flowName === 'MandatoryDonationFlow') && (
          <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-16 ${theme.poweredByBackgroundColor} rounded-full py-2 px-4`}>
            <p className="text-sm text-gray-700">Powered by - Parkonomy</p>
          </div>
        )}
        {isModalVisible && (
          <TimeoutModal countdown={countdown} onContinue={handleContinue} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default TapToStart;
