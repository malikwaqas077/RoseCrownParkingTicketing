import React, { useState, useEffect } from 'react';
import ErrorModal from './ErrorModal';
import Loader from './Loader';
import TimeoutModal from './TimeoutModal';
import axios from 'axios';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

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

const CheckDetails: React.FC<CheckDetailsProps> = ({
  regNumber,
  selectedDay,
  config,
  nickname,
  onGoBack,
  onContinue,
  flowName,
  isPaying,
}) => {
  const appInsights = useAppInsightsContext();
  const theme = config.config.checkDetailsScreen;
  const [transactionMessage, setTransactionMessage] = useState<string | null>(null);
  const [showRetry, setShowRetry] = useState<boolean>(false);
  const [paymentProcessed, setPaymentProcessed] = useState<boolean>(false);
  const [isPaymentInProgress, setIsPaymentInProgress] = useState<boolean>(false);
  const [isGoBackDisabled, setIsGoBackDisabled] = useState<boolean>(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(30);

  appInsights.trackTrace({ message: 'CheckDetails component rendered', properties: { regNumber, selectedDay, nickname, flowName, isPaying } });

  useEffect(() => {
    window.handlePaymentResponse = function (response: { transaction_status: string }) {
      appInsights.trackTrace({ message: 'Payment response received', properties: { response } });
      console.log('Payment Response:', response);
      setTransactionMessage(response.transaction_status);
      setIsPaymentInProgress(false);
      setIsGoBackDisabled(false);
      if (response.transaction_status === 'Transaction Successful') {
        setPaymentProcessed(true);
        updateLeaderboard();
        onContinue();
      } else {
        setShowRetry(true);
      }
    };
  }, [onContinue]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    const startTimeout = (duration: number) => {
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
      }, duration);
    };

    const resetTimeout = () => {
      clearTimeout(timer);
      clearTimeout(countdownTimer);
      setCountdown(30);
      setIsModalVisible(false);

      appInsights.trackEvent({ name: 'TimeoutReset' });
      appInsights.trackTrace({ message: 'Timeout reset and countdown started' });

      // Scenario 1: Check if flow is NoParkFeeFlow or OptionalDonationFlow with isPaying true
      if (flowName === 'NoParkFeeFlow' || (flowName === 'OptionalDonationFlow' && isPaying)) {
        startTimeout(30000);
      } else {
        // Scenario 2: User is on the CheckDetails page without interaction for 30 seconds
        if (!isPaymentInProgress && !showRetry) {
          startTimeout(30000);
        }
      }
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

      appInsights.trackTrace({ message: 'CheckDetails component unmounted' });
    };
  }, [flowName, isPaying, isPaymentInProgress, showRetry, appInsights]);

  useEffect(() => {
    // Scenario 3: If ErrorModal is shown for 30 seconds without interaction
    if (showRetry) {
      let errorModalTimer: NodeJS.Timeout;
      let countdownTimer: NodeJS.Timeout;
      errorModalTimer = setTimeout(() => {
        setIsModalVisible(true);
        appInsights.trackEvent({ name: 'ErrorModalShown' });
        appInsights.trackTrace({ message: 'Error modal shown' });

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

      return () => {
        clearTimeout(errorModalTimer);
        clearTimeout(countdownTimer);
      };
    }
  }, [showRetry, appInsights]);

  const handlePayment = () => {
    const amount =
      typeof selectedDay === 'string'
        ? parseInt(selectedDay.match(/£(\d+)/)?.[1] || '0', 10) * 100
        : selectedDay;
    const clientReference = 'test_reference';
    const paymentUrl = `/api/makepayment?amount=${amount}&client_reference=${clientReference}`;
    appInsights.trackEvent({ name: 'InitiatePayment', properties: { amount, clientReference, paymentUrl } });
    appInsights.trackTrace({ message: 'Initiating payment', properties: { amount, clientReference, paymentUrl } });

    setIsPaymentInProgress(true);
    setIsGoBackDisabled(true);
    window.location.href = paymentUrl;
  };

  const handleModalClose = () => {
    appInsights.trackEvent({ name: 'CloseModal' });
    appInsights.trackTrace({ message: 'User closed the modal, redirecting to home' });
    window.location.href = '/';
  };

  const handleRetry = () => {
    appInsights.trackEvent({ name: 'RetryPayment' });
    appInsights.trackTrace({ message: 'User chose to retry payment' });

    setShowRetry(false);
    setIsPaymentInProgress(true);
    setIsGoBackDisabled(true);
    handlePayment();
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
    const amount = typeof selectedDay === 'string' ? selectedDay.match(/£(\d+)/)?.[1] || '0' : selectedDay?.toString() || '0';
    appInsights.trackEvent({ name: 'UpdateLeaderboard', properties: { nickname, amount } });
    appInsights.trackTrace({ message: 'Updating leaderboard', properties: { nickname, amount } });

    console.log('Updating leaderboard with nickname:', nickname, 'and amount:', amount);

    const updatedLeaders = [
      ...config.config.tapToStartScreen.recentLeaders,
      { name: nickname || 'Guest', amount: `£${amount}` },
    ].sort((a, b) => parseFloat(b.amount.substring(1)) - parseFloat(a.amount.substring(1)));

    config.config.tapToStartScreen.recentLeaders = updatedLeaders.slice(0, 10);

    try {
      console.log('Sending updated config to server');
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

  const defaultNickname = nickname || 'Guest';

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
        {(flowName === 'MandatoryDonationFlow' ||
          flowName === 'ParkFeeFlow' ||
          (flowName === 'OptionalDonationFlow' && defaultNickname && isPaying)) &&
          !paymentProcessed && (
            <>
              <div className="flex items-center justify-center mb-6">
                <p className="text-xl font-bold text-blue-800">
                  {isPaymentInProgress ? 'Please proceed with the payment device' : theme.paymentText}
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
        {((!isPaying && flowName === 'OptionalDonationFlow') || flowName === 'NoParkFeeFlow') && (
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
          className={`w-full font-bold py-3 bg-transparent border-2 border-red-600 text-red-600 rounded-lg hover:bg-gray-100 ${
            isGoBackDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
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
      {isModalVisible && (
        <TimeoutModal countdown={countdown} onContinue={handleModalContinue} onReset={handleModalReset} />
      )}
    </div>
  );
};

export default CheckDetails;
