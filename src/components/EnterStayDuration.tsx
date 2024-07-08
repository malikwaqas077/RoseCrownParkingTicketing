import React, { useState, useEffect } from 'react';
import TimeoutModal from './TimeoutModal';

interface EnterStayDurationProps {
  onSelect: (daysOrFee: string | number, isPaying: boolean) => void;
  config: any;
  flowName: string;
}

const EnterStayDuration: React.FC<EnterStayDurationProps> = ({ config, onSelect, flowName }) => {
  const theme = config.config.enterStayDurationScreen;
  const [options, setOptions] = useState<string[] | number[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [showingDays, setShowingDays] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchDays = () => {
    fetch(`${apiUrl}/api/days`)
      .then(response => response.json())
      .then(data => {
        console.log("API Response for days:", data);
        setOptions(data.map((item: { Days: number }) => item.Days));
        setShowingDays(true);
      })
      .catch(error => console.error('Error fetching days:', error));
  };

  useEffect(() => {
    let URL = '';
    if (flowName === 'OptionalDonationFlow' || flowName === 'MandatoryDonationFlow') {
      URL = `${apiUrl}/api/parking-fee-without-hours`;
    } else if (flowName === 'ParkFeeFlow') {
      URL = `${apiUrl}/api/parking-fee`;
    } else {
      URL = `${apiUrl}/api/days`;
    }
    console.log("The API URL is", URL);
    fetch(URL)
      .then(response => response.json())
      .then(data => {
        console.log("API Response is", data);
        if (flowName === 'MandatoryDonationFlow' || flowName === 'OptionalDonationFlow' || flowName === 'ParkFeeFlow') {
          setOptions(data.map((item: { Fee: string }) => item.Fee));
        } else {
          setOptions(data.map((item: { Days: number }) => item.Days));
        }
      })
      .catch(error => console.error('Error fetching options:', error));
  }, [flowName]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timer);
      clearTimeout(countdownTimer);
      setCountdown(30);
      setIsModalVisible(false);

      timer = setTimeout(() => {
        setIsModalVisible(true);
        countdownTimer = setInterval(() => {
          setCountdown(prev => {
            if (prev === 1) {
              clearInterval(countdownTimer);
              window.location.href = '/';
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 30000);
    };

    const handleInteraction = () => {
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
    };
  }, []);

  const handleOptionClick = (option: string | number) => {
    if (flowName === 'OptionalDonationFlow' && !showingDays) {
      setIsPaying(true);
      fetchDays();
    } else {
      setSelectedOption(option);
      onSelect(option, flowName === 'MandatoryDonationFlow' || (flowName === 'OptionalDonationFlow' && isPaying));
    }
  };

  const handleSkipClick = () => {
    setIsPaying(false);
    fetchDays();
  };

  const handleMoreClick = () => setShowMore(!showMore);

  const handleContinue = () => {
    setIsModalVisible(false);
    setCountdown(30);
  };

  const handleReset = () => {
    window.location.href = '/';
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center min-h-screen h-screen w-screen p-0 m-0 font-din text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-2 leading-snug">
        {theme.title}
      </h1>
      <p className="text-base text-green-600 mb-8 leading-snug w-full max-w-md text-center px-4">
        {showingDays ? "Select number of days" : theme.subtitle}
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
