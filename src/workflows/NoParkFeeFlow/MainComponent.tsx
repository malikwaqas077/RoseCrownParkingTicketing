import React, { useState } from 'react';
import MainScreen from '../../components/MainScreen';
import TapToStart from '../../components/TapToStart';
import EnterStayDuration from '../../components/EnterStayDuration';
import EnterRegNumber from '../../components/EnterRegNumber';
import GiveNickname from '../../components/GiveNickname';
import CheckDetails from '../../components/CheckDetails';
import Decision from '../../components/Decision';

const MainComponent: React.FC<{ config: any; workflowName: any }> = ({ config, workflowName }) => {
  const [step, setStep] = useState(0);
  const [selectedDayOrFee, setSelectedDayOrFee] = useState<string | number | null>(null);
  const [regNumber, setRegNumber] = useState<string>('');
  const [nickname, setNickname] = useState<string>(''); // Add state for nickname
  const [parkingEndTime, setParkingEndTime] = useState<string>('12:00:00 - 00/00/0000');
  const [isPaying, setIsPaying] = useState(false); // Add state for isPaying

  const flowName = workflowName; // Use the flow from the config
  console.log("config name is :", flowName);

  const nextStep = () => {
    console.log("Proceeding to next step", step + 1);
    console.log("Value of EndTime", setParkingEndTime);
    setStep(step + 1);
  };

  const previousStep = () => {
    console.log("Going back to previous step", step - 1);
    setStep(step - 1);
  };

  const handleDayOrFeeSelect = (dayOrFee: string | number) => {
    setSelectedDayOrFee(dayOrFee);
    if (flowName === 'MandatoryDonationFlow') {
      setIsPaying(true); // Set isPaying to true if the flow is MandatoryDonationFlow
    } else if ((flowName === 'OptionalDonationFlow' || flowName === 'ParkFeeFlow') && typeof dayOrFee === 'string' && dayOrFee.toLowerCase() !== 'no thanks - skip') {
      setIsPaying(true); // Set isPaying to true if a fee is selected
    } else {
      setIsPaying(false);
    }
    nextStep();
  };

  const handleRegNumberContinue = (regNumber: string) => {
    setRegNumber(regNumber);
    if ((flowName === 'OptionalDonationFlow' || flowName === 'ParkFeeFlow') && isPaying) {
      nextStep(); // Go to GiveNickname screen if the flow is OptionalDonationFlow or ParkFeeFlow and user decided to pay
    } else {
      nextStep(); // Go to CheckDetails screen
    }
  };

  const handleNicknameContinue = (nickname: string) => {
    setNickname(nickname);
    nextStep();
  };

  const handleGoBack = async () => {
    if (flowName === 'MandatoryDonationFlow') {
      try {
        await fetch('http://192.168.2.89:5000/api/canceltransaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error cancelling transaction:', error);
      }
    }
    previousStep();
  };

  const handleDecisionFinish = (email: string) => {
    alert(`Email: ${email} | Reg Number: ${regNumber} | Nickname: ${nickname} | Days/Fee: ${selectedDayOrFee}`);
    // Handle finish action, such as redirecting or showing a confirmation screen
  };

  return (
    <div>
      {step === 0 && <MainScreen config={config} onStart={nextStep} />}
      {step === 1 && <TapToStart config={config} onStart={nextStep} flowName={flowName} />}
      {step === 2 && <EnterStayDuration config={config} onSelect={handleDayOrFeeSelect} flowName={flowName} />}
      {step === 3 && (
        <EnterRegNumber
          config={config}
          selectedDay={selectedDayOrFee}
          onContinue={handleRegNumberContinue}
          onGoBack={handleGoBack}
          flowName={flowName}
          isPaying={isPaying} // Pass isPaying to EnterRegNumber
        />
      )}
      {step === 4 && (flowName === 'OptionalDonationFlow' || flowName === 'ParkFeeFlow' || flowName === 'MandatoryDonationFlow') && isPaying && (
        <GiveNickname
          config={config}
          onContinue={handleNicknameContinue}
          onGoBack={previousStep}
        />
      )}
      {step === 4 && (!isPaying || flowName === 'MandatoryDonationFlow' || (flowName === 'OptionalDonationFlow' && !isPaying)) && (
        <CheckDetails
          config={config}
          regNumber={regNumber}
          selectedDay={selectedDayOrFee}
          onGoBack={handleGoBack}
          onContinue={nextStep}
          flowName={flowName}
          isPaying={isPaying}
        />
      )}
      {step === 5 && (flowName === 'NoParkFeeFlow' || (flowName === 'OptionalDonationFlow' && !isPaying)) && (
        <Decision
          config={config}
          regNumber={regNumber}
          parkingEndTime={parkingEndTime}
          onFinish={handleDecisionFinish}
        />
      )}
      {step === 5 && (flowName !== 'NoParkFeeFlow' && !(flowName === 'OptionalDonationFlow' && !isPaying)) && (
        <CheckDetails
          config={config}
          regNumber={regNumber}
          selectedDay={selectedDayOrFee}
          nickname={nickname}
          onGoBack={handleGoBack}
          onContinue={nextStep}
          flowName={flowName}
          isPaying={isPaying}
        />
      )}
      {step === 6 && (
        <Decision
          config={config}
          regNumber={regNumber}
          parkingEndTime={parkingEndTime}
          onFinish={handleDecisionFinish}
        />
      )}
    </div>
  );
};

export default MainComponent;
