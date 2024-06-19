import React, { useState } from 'react';
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
}

const CheckDetails: React.FC<CheckDetailsProps> = ({ regNumber, selectedDay, config, nickname, onGoBack, onContinue, flowName }) => {
  const theme = config.config.checkDetailsScreen;
  const [transactionMessage, setTransactionMessage] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const [showRetry, setShowRetry] = useState<boolean>(false);
  const [paymentProcessed, setPaymentProcessed] = useState<boolean>(false);
  const [isPaymentInProgress, setIsPaymentInProgress] = useState<boolean>(false);

  const defaultNickname = nickname || 'Guest';

  const handlePayment = async () => {
    console.log("handlePayment called");
    setIsPaymentInProgress(true);
    try {
      const amount = typeof selectedDay === 'string' ? parseInt(selectedDay.match(/£(\d+)/)?.[1] || '0', 10) * 100 : selectedDay;
      console.log("Amount to be charged", amount);

      const requestBody = {
        amount,
        client_reference: 'test_reference',
      };

      console.log('Request Body:', requestBody);

      const response = await fetch('http://192.168.2.89:5000/api/makepayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      console.log('Response:', result);

      const message = result.transaction_status;
      setTransactionStatus(message);

      if (message === 'Transaction Successful') {
        console.log("Transaction Successful, calling onContinue");
        setTransactionMessage(null);
        setShowRetry(false);
        setPaymentProcessed(true);
        onContinue();
      } else {
        console.log("Transaction failed or already processed:", message);
        setTransactionMessage(message);
        setShowRetry(true);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setTransactionStatus('Error');
      setTransactionMessage('Payment has not been successful.');
      setShowRetry(true);
    } finally {
      setIsPaymentInProgress(false);
    }
  };

  const handleRetry = () => {
    console.log("Retrying payment");
    setTransactionMessage(null);
    setShowRetry(false);
    handlePayment();
  };

  const handleCancelTransaction = async () => {
    console.log("Cancelling transaction");
    try {
      const response = await fetch('http://192.168.2.89:5000/api/canceltransaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Cancel Response:', result);
    } catch (error) {
      console.error('Error cancelling transaction:', error);
    }

    onGoBack();
  };

  const handleModalClose = () => {
    window.location.href = '/';
  };

  return (
    <div className="bg-white flex items-center justify-center min-h-screen font-din">
      <div className="relative w-full max-w-lg p-8" style={{ minHeight: '70vh' }}>
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
        {(flowName === 'MandatoryDonationFlow' || flowName === 'ParkFeeFlow' || (flowName === 'OptionalDonationFlow' && defaultNickname)) && !paymentProcessed && (
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
        {(flowName !== 'MandatoryDonationFlow' && flowName !== 'ParkFeeFlow' && (!defaultNickname || flowName !== 'OptionalDonationFlow')) && (
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
          onClick={handleCancelTransaction}
          className={`w-full font-bold py-3 bg-transparent border-2 border-red-600 text-red-600 rounded-lg hover:bg-gray-100`}
        >
          GO BACK & EDIT DETAILS
        </button>
      </div>
      {showRetry && (
        <ErrorModal
          title={transactionStatus ?? 'Transaction Error'}
          message={transactionMessage ?? 'An error occurred'}
          onRetry={handleRetry}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default CheckDetails;
