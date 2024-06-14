import React from 'react';

interface ErrorModalProps {
    title: string;
    message: string;
    onRetry: () => void;
    onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ title, message, onRetry, onClose }) => {
    console.log(message)
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
                <div className="flex justify-end items-center mb-4">
                    <button onClick={onClose} className="text-gray-700 text-2xl mr-auto">&times;</button>
                </div>
                <div className="flex justify-center mb-4">
                    <img src="/src/assets/icons/x-button.png" alt="Question Mark" className="h-12 w-12" />
                </div>
                <h2 className="text-xl font-bold text-center pb-4 text-gray-700">{title}</h2>
                <div className="text-center text-gray-500 mb-6">
                    Press OK to If you want to retry, or Cancel to exit the transaction.
                </div>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 w-24 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        OK
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 w-24 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ErrorModal;
