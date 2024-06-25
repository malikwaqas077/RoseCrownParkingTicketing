import React, { useState, useEffect } from 'react';
import { system_config } from '../config/config';
import ErrorModal from './ErrorModal'; // Assuming ErrorModal is a component you use
import Loader from './Loader'; // Assuming Loader is a component you use

interface DecisionProps {
    regNumber: string;
    parkingEndTime: string;
    onFinish: (email: string) => void;
    config: any;
}

const Decision: React.FC<DecisionProps> = ({ regNumber, parkingEndTime, config, onFinish }) => {
    const [email, setEmail] = useState('');
    const theme = config.config.decisionScreen;

    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = '/';
        }, system_config.redirectTimeout * 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleKeyPress = (key: string) => {
        setEmail((prev) => prev + key);
    };

    const handleDelete = () => {
        setEmail((prev) => prev.slice(0, -1));
    };

    const handleFinish = () => {
        onFinish(email);
        window.location.href = '/';
    };

    const keys = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
        'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
        'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
        'Z', 'X', 'C', 'V', 'B', 'N', 'M' , '@', '.'
    ];

    return (
        <div className="bg-white flex items-center justify-center min-h-screen font-din">
            <div className="relative w-full max-w-lg" style={{ minHeight: '70vh' }}>
                <h2 className={`text-2xl font-bold p-4 ${theme.textColor} text-center`}>THANK YOU!</h2>
                <p className={`text-lg mb-8 ${theme.textColor} text-center`}>Your parking session details are below</p>
                <div className="mb-6 pl-8 pr-8" >
                    <input
                        type="text"
                        value={regNumber}
                        readOnly
                        className={`w-full px-4 py-3 text-3xl font-bold ${theme.inputBackgroundColor} ${theme.inputTextColor} ${theme.inputBorderColor} rounded-lg focus:outline-none text-center`}
                    />
                </div>
                <p className={`text-lg mb-8 ${theme.textColor} text-center`}>is registered to park until:</p>
                <p className={`text-2xl font-bold mb-8 ${theme.textColor} text-center`}>{parkingEndTime}</p>
                <div className="bg-gray-200 p-4 rounded-3xl mb-6">
                    <p className={`text-2xl font-bold mb-4 ${theme.receiptTextColor} text-center`}>NEED A RECEIPT?</p>
                    <p className={`text-sm mb-4 ${theme.subtitleColor} text-center`}>Enter your email address or scan the QR code below</p>
                    <input
                        type="text"
                        value={email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-lg ${theme.inputTextColor} ${theme.inputBorderColor} rounded-lg focus:outline-none mb-6`}
                        placeholder="Enter your email address"
                    />
                    <div className="grid grid-cols-10 gap-2 mb-6">
                        {keys.map((key) => (
                            <button
                                key={key}
                                onClick={() => handleKeyPress(key)}
                                className="w-12 h-12 text-gray-600 text-xl border rounded-lg bg-white hover:bg-gray-200"
                            >
                                {key}
                            </button>
                        ))}
                        <button
                            onClick={handleDelete}
                            className="w-12 h-12 text-xl border text-gray-600 rounded-lg bg-white hover:bg-gray-200 col-span-2"
                        >
                            ⌫
                        </button>
                    </div>
                    <button
                        onClick={handleFinish}
                        className={`w-full py-3 mb-4 ${theme.buttonContinueColor} ${theme.buttonTextColor} rounded-lg ${theme.buttonHoverColor}`}
                    >
                        FINISH
                    </button>
                    <div className="flex items-center justify-between bg-white rounded-lg p-4">
                        <div className="text-lg font-bold">
                            <p className={`mb-1 ${theme.qrTextColor}`}>SCAN HERE TO VIEW</p>
                            <p className={`mb-1 ${theme.qrTextColor}`}>YOUR DIGITAL RECEIPT</p>
                        </div>
                        <img src="/src/assets/icons/qr-code.png" alt="QR Code" className="w-16 h-16" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Decision;
