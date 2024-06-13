import React, { useState, useEffect } from 'react';
import { themes } from '../config/themes';

interface EnterStayDurationProps {
  flow: keyof typeof themes;
  onSelect: (daysOrFee: string | number) => void;
}

const EnterStayDuration: React.FC<EnterStayDurationProps> = ({ flow, onSelect }) => {
  const theme = themes[flow].enterStayDurationScreen;
  const [options, setOptions] = useState<string[] | number[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);

  useEffect(() => {
    let URL;
    if (flow === 'MandatoryDonationFlow' || flow === 'NoParkFeeFlow') {
      URL = "http://localhost:5000/api/parking-fee";
      fetch(URL)
        .then(response => response.json())
        .then(data => setOptions(data.map((item: { Fee: string }) => item.Fee)));
    } else {
      URL = "http://localhost:5000/api/days";
      fetch(URL)
        .then(response => response.json())
        .then(data => setOptions(data.map((item: { Days: number }) => item.Days)));
    }
  }, [flow]);

  const handleOptionClick = (option: string | number) => {
    setSelectedOption(option);
    onSelect(option);
  };

  const handleMoreClick = () => setShowMore(!showMore);

  return (
    <div className="bg-white flex flex-col items-center justify-center min-h-screen p-4 font-din text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-2 leading-snug">
        {theme.title}
      </h1>
      <p className="text-base text-green-600 mb-8 leading-snug w-full max-w-md text-center px-4">
        {theme.subtitle}
      </p>
      <div className="flex flex-col space-y-4 w-full max-w-md px-4">
        {(flow === 'MandatoryDonationFlow' || flow === 'NoParkFeeFlow'
          ? options
          : options
        ).slice(0, showMore ? options.length : 7).map(option => (
          <button
            key={option}
            className={`px-6 py-3 text-lg font-semibold w-full rounded border ${theme.buttonBorderColor} ${theme.buttonTextColor} ${
              selectedOption === option ? theme.buttonColor : 'bg-transparent'
            }`}
            onClick={() => handleOptionClick(option)}
          >
            {typeof option === 'number' ? `${option} DAY${option > 1 ? 'S' : ''}` : option}
          </button>
        ))}
      </div>
      {options.length > 7 && (
        <button
          className={`mt-8 px-6 py-3 w-full rounded ${theme.moreButtonColor} ${theme.moreButtonTextColor}`}
          onClick={handleMoreClick}
        >
          {showMore ? 'LESS' : 'MORE'}
        </button>
      )}
    </div>
  );
};

export default EnterStayDuration;
