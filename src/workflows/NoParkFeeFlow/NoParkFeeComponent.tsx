// src/workflows/NoParkFeeFlow/NoParkFeeComponent.tsx
import React, { useState } from 'react';
import MainScreen from '../../components/MainScreen';
import TapToStart from '../../components/TapToStart';
import EnterStayDuration from '../../components/EnterStayDuration';
import EnterRegNumber from '../../components/EnterRegNumber';
import CheckDetails from '../../components/CheckDetails';
import Decision from '../../components/Decision';

const NoParkFeeComponent: React.FC = () => {
  const [step, setStep] = useState(0);
  const [selectedDayOrFee, setSelectedDayOrFee] = useState<string | number | null>(null);
  const [regNumber, setRegNumber] = useState<string>('');
  const [parkingEndTime, setParkingEndTime] = useState<string>('12:00:00 - 00/00/0000');

  const nextStep = () => setStep(step + 1);
  const previousStep = () => setStep(step - 1);

  const handleDayOrFeeSelect = (dayOrFee: string | number) => {
    setSelectedDayOrFee(dayOrFee);
    nextStep();
  };

  const handleRegNumberContinue = (regNumber: string) => {
    setRegNumber(regNumber);
    nextStep();
  };

  const handleDecisionFinish = (email: string) => {
    alert(`Email: ${email} | Reg Number: ${regNumber} | Days/Fee: ${selectedDayOrFee}`);
    // Handle finish action, such as redirecting or showing a confirmation screen
  };

  const flow = "MandatoryDonationFlow"; // Replace this with the logic to dynamically set the flow based on site or configuration

  return (
    <div>
      {step === 0 && <MainScreen flow={flow} onStart={nextStep} />}
      {step === 1 && <TapToStart flow={flow} onStart={nextStep} />}
      {step === 2 && <EnterStayDuration flow={flow} onSelect={handleDayOrFeeSelect} />}
      {step === 3 && <EnterRegNumber flow={flow} selectedDay={selectedDayOrFee} onContinue={handleRegNumberContinue} />}
      {step === 4 && (
        <CheckDetails
          flow={flow}
          regNumber={regNumber}
          selectedDay={selectedDayOrFee}
          onGoBack={previousStep}
          onContinue={nextStep}
        />
      )}
      {step === 5 && (
        <Decision
          flow={flow}
          regNumber={regNumber}
          parkingEndTime={parkingEndTime}
          onFinish={handleDecisionFinish}
        />
      )}
    </div>
  );
};

export default NoParkFeeComponent;
