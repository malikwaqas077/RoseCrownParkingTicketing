import React, { useState, useEffect } from 'react';
import TimeoutModal from './TimeoutModal';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

interface EnterStayDurationProps {
  onSelect: (daysOrFee: string | number, isPaying: boolean) => void;
  config: any;
  flowName: string;
}

const EnterStayDuration: React.FC<EnterStayDurationProps> = ({ config, onSelect, flowName }) => {
  const appInsights = useAppInsightsContext();
  const theme = config.config.enterStayDurationScreen;
  const [options, setOptions] = useState<string[] | number[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [showingDays, setShowingDays] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const apiUrl = "https://e850837e-0018-401b-9f24-fb730bd5a456.mock.pstmn.io";

  const fetchDays = () => {
    fetch(`https://parkingticketingwebapp.azurewebsites.net/api/days`)
      .then(response => response.json())
      .then(data => {
        appInsights.trackTrace({ message: "Fetched days from API", properties: { data } });
        setOptions(data.map((item: { Days: number }) => item.Days));
        setShowingDays(true);
      })
      .catch(error => {
        appInsights.trackException({ exception: error });
        console.error('Error fetching days:', error);
      });
  };

  useEffect(() => {
    let URL = '';
    if (flowName === 'OptionalDonationFlow' || flowName === 'MandatoryDonationFlow') {
      URL = `${apiUrl}/carpark/id/VnrOSuFhnql/get-donate-list`;
    } else if (flowName === 'ParkFeeFlow') {
      URL = `${apiUrl}/carpark/id/VnrOSuFhnql/tariffs/2024-05-18T13:23:10/0`;
    } else {
      URL = `http://192.168.2.89:5000/api/days`;
    }
    appInsights.trackTrace({ message: "API URL set", properties: { URL, flowName } });
    
    fetch(URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('external_token')}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        appInsights.trackTrace({ message: "Fetched options from API", properties: { data } });
        if (flowName === 'MandatoryDonationFlow' || flowName === 'OptionalDonationFlow') {
          setOptions(data.donate_options_list.map((item: string) => `£${item}`));
        } else if (flowName === 'ParkFeeFlow') {
          const ranges = data.tariffs.ranges[0].range_options;
          const optionsArray = Object.keys(ranges).map(key => {
            const option = ranges[key];
            return `${option.label.toUpperCase()} - £${option.price}`;
          });
          setOptions(optionsArray);
        } else {
          setOptions(data.map((item: { Days: number }) => item.Days));
          setShowingDays(true);
        }
      })
      .catch(error => {
        appInsights.trackException({ exception: error });
        console.error('Error fetching options:', error);
      });
  }, [flowName, appInsights, apiUrl]);

  useEffect(() => {
    appInsights.trackTrace({ message: 'EnterStayDuration component mounted' });

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

      appInsights.trackTrace({ message: 'EnterStayDuration component unmounted' });
    };
  }, [appInsights]);

  const handleOptionClick = (option: string | number) => {
    appInsights.trackEvent({ name: 'OptionSelected', properties: { option } });
    appInsights.trackTrace({ message: 'User selected an option', properties: { option } });

    if (flowName === 'OptionalDonationFlow' && !showingDays) {
      setIsPaying(true);
      fetchDays();
    } else {
      setSelectedOption(option);
      onSelect(option, flowName === 'MandatoryDonationFlow' || (flowName === 'OptionalDonationFlow' && isPaying));
    }
  };

  const handleSkipClick = () => {
    appInsights.trackEvent({ name: 'SkipClick' });
    appInsights.trackTrace({ message: 'User clicked skip' });
    setIsPaying(false);
    fetchDays();
  };

  const handleMoreClick = () => {
    appInsights.trackEvent({ name: 'MoreClick', properties: { showMore: !showMore } });
    appInsights.trackTrace({ message: 'User clicked more/less', properties: { showMore: !showMore } });
    setShowMore(!showMore);
  };

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

  const getTitle = () => {
    if (showingDays || flowName === 'NoParkFeeFlow'|| flowName === 'ParkFeeFlow') {
      return theme.title;
    } else {
      return 'YOU PICK HOW MUCH YOU WANT TO PAY!';
    }
  };

  const getSubtitle = () => {
    if (showingDays) {
      return theme.subtitle;
    } else if (flowName === 'MandatoryDonationFlow' || flowName === 'OptionalDonationFlow') {
      return "Help us reach our fundraising goals and make a voluntary payment for your parking";
    } else if (flowName === 'ParkFeeFlow') {
      return "Choose how long you want to use the car park and select the correct tariff";
    } else {
      return theme.subtitle;
    }
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center min-h-screen h-screen w-screen p-0 m-0 font-din text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-2 leading-snug">
        {getTitle()}
      </h1>
      <p className="text-base text-green-600 mb-8 leading-snug w-full max-w-md text-center px-4">
        {getSubtitle()}
      </p>
      <div className="flex flex-col space-y-4 w-full max-w-md px-4">
        {options.slice(0, showMore ? options.length : 7).map(option => (
          <button
            key={option}
            className={`px-6 py-3 text-lg font-semibold w-full rounded border ${theme.buttonBorderColor} ${theme.buttonTextColor} ${selectedOption === option ? theme.buttonColor : 'bg-transparent'
              }`}
            onClick={() => handleOptionClick(option)}
          >
            {typeof option === 'number' ? `${option} DAY${option > 1 ? 'S' : ''}` : option}
          </button>
        ))}
      </div>
      {options.length > 7 && (
        <button
          className={`mt-8 px-6 py-3 w-1/2 rounded ${theme.moreButtonColor} ${theme.moreButtonTextColor}`}
          onClick={handleMoreClick}
        >
          {showMore ? 'LESS' : 'MORE'}
        </button>
      )}
      {flowName === 'OptionalDonationFlow' && !showingDays && (
        <button
          className={`mt-8 px-6 py-3 w-1/2 rounded bg-gray-300 text-gray-700`}
          onClick={handleSkipClick}
        >
          No Thanks - Skip
        </button>
      )}
      {isModalVisible && (
        <TimeoutModal countdown={countdown} onContinue={handleContinue} onReset={handleReset} />
      )}
    </div>
  );
};

export default EnterStayDuration;