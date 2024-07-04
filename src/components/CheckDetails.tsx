import React, { useState, useEffect } from 'react';
import ErrorModal from './ErrorModal';
import Loader from './Loader';

interface CheckDetailsProps {
  regNumber: string;
  selectedDay: string | number | null;
  nickname?: string;
  onGoBack: () => void;
  onContinue: () => void;
  config: any;
  flowName: string;
  isPaying: boolean;
}

const CheckDetails: React.FC<CheckDetailsProps> = ({ regNumber, selectedDay, config, nickname, onGoBack, onContinue, flowName, isPaying }) => {
  const theme = config.config.checkDetailsScreen;
  const [transactionMessage, setTransactionMessage] = useState<string | null>(null);
  const [showRetry, setShowRetry] = useState<boolean>(false);
  const [paymentProcessed, setPaymentProcessed] = useState<boolean>(false);
  const [isPaymentInProgress, setIsPaymentInProgress] = useState<boolean>(false);
  const [isGoBackDisabled, setIsGoBackDisabled] = useState<boolean>(false);

  console.log("user is paying:", isPaying);

  useEffect(() => {
    window.handlePaymentResponse = function(response: { transaction_status: string }) {
      console.log('Payment Response:', response);
      setTransactionMessage(response.transaction_status);
      setIsPaymentInProgress(false);
      setIsGoBackDisabled(false);
      if (response.transaction_status === 'Transaction Successful') {
        setPaymentProcessed(true);
        onContinue();
      } else {
        setShowRetry(true);
      }
    };
  }, [onContinue]);

  const defaultNickname = nickname || 'Guest';

  const handlePayment = () => {
    const amount = typeof selectedDay === 'string' ? parseInt(selectedDay.match(/£(\d+)/)?.[1] || '0', 10) * 100 : selectedDay;
    const clientReference = 'test_reference';
    const paymentUrl = `/api/makepayment?amount=${amount}&client_reference=${clientReference}`;
    setIsPaymentInProgress(true);
    setIsGoBackDisabled(true);
    window.location.href = paymentUrl;
  };

  const handleModalClose = () => {
    window.location.href = '/';
  };

  const handleRetry = () => {
    setShowRetry(false);
    setIsPaymentInProgress(true);
    setIsGoBackDisabled(true);
    handlePayment();
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center min-h-screen h-screen w-screen p-0 m-0 font-din text-center">
      <div className="relative w-full max-w-xl" style={{ minHeight: '70vh' }}>
        <h2 className={`text-2xl font-bold mb-4 px-16 ${theme.textColor} text-center`}>{theme.title}</h2>
        <p className={`text-lg mb-8 ${theme.textColor} text-center`}>{theme.subtitle}</p>
        <div className="mb-6">
          <input
            type="text"
            value={regNumber}
            readOnly
            className={`w-full px-4 py-3 text-3xl font-bold ${theme.inputBackgroundColor} ${theme.inputTextColor} ${theme.inputBorderColor} rounded-lg focus:outline-none text-center`}
            placeholder={theme.inputPlaceholder}
          />
        </div>
        <div className="mb-6">
          <input
            type="text"
            value={flowName === 'NoParkFeeFlow' ? `${selectedDay ?? ''} DAYS` : selectedDay ?? ''}
            readOnly
            className={`w-full px-4 py-3 text-3xl font-bold ${theme.inputDaysBackgroundColor} ${theme.inputTextColor} ${theme.inputBorderColor} rounded-lg focus:outline-none text-center`}
          />
        </div>
        {transactionMessage && (
          <div className="mb-6">
            <p className={`text-lg font-bold text-center`}>{transactionMessage}</p>
          </div>
        )}
        {(flowName === 'MandatoryDonationFlow' || flowName === 'ParkFeeFlow' || (flowName === 'OptionalDonationFlow' && defaultNickname && isPaying)) && !paymentProcessed && (
          <>
            <div className="flex items-center justify-center mb-6">
              <p className="text-xl font-bold text-blue-800">
                {isPaymentInProgress ? "Please proceed with the payment device" : theme.paymentText}
              </p>
              {isPaymentInProgress ? (
                <Loader />
              ) : (
                <img 
                  src={theme.arrowIcon} 
                  alt="Arrow" 
                  className="ml-2 cursor-pointer" 
                  style={{ width: '30px', height: '30px' }} 
                  onClick={handlePayment}
                />
              )}
            </div>
            <div className="flex items-center justify-center mb-6">
              <img src={theme.nfcIcon} alt="NFC Icon" className="w-32 h-32" />
            </div>
          </>
        )}
        {(!isPaying || flowName === 'NoParkFeeFlow' || flowName === 'OptionalDonationFlow') && (
          <>
            <button
              onClick={onContinue}
              className={`w-full py-3 mb-4 mt-48 ${theme.buttonContinueColor} ${theme.buttonTextColor} rounded-lg ${theme.buttonHoverColor}`}
            >
              CONTINUE
            </button>
            <p className={`text-lg font-bold mb-4 ${theme.inputTextColor} text-center`}>OR</p>
          </>
        )}
        <button
          onClick={onGoBack}
          className={`w-full font-bold py-3 bg-transparent border-2 border-red-600 text-red-600 rounded-lg hover:bg-gray-100 ${isGoBackDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isGoBackDisabled}
        >
          GO BACK & EDIT DETAILS
        </button>
      </div>
      {showRetry && (
        <ErrorModal
          title={transactionMessage ?? 'Transaction Error'}
          message={transactionMessage ?? 'An error occurred'}
          onRetry={handleRetry}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default CheckDetails;
