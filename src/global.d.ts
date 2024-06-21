interface Window {
    handlePaymentResponse: (response: { transaction_status: string }) => void;
  }
  