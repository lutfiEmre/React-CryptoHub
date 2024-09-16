import React, { useState, useEffect } from 'react';

interface Coin {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    market_cap: number;
}

interface CryptoGuessingGameProps {
    coins: Coin[];
}

const CryptoGuessingGame: React.FC<CryptoGuessingGameProps> = ({ coins }) => {
    const [currentCoin, setCurrentCoin] = useState<Coin | null>(null);
    const [userGuess, setUserGuess] = useState('');
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(0);
    const [showAnswerState, setShowAnswerState] = useState(0);

    useEffect(() => {
        if (coins.length > 0) {
            selectRandomCoin(coins);
        }
    }, [coins]);

    const selectRandomCoin = (coinList: Coin[]) => {
        const randomIndex = Math.floor(Math.random() * coinList.length);
        setCurrentCoin(coinList[randomIndex]);
        setShowAnswerState(0);
        setFeedback('');
    };

    const handleGuess = () => {
        if (currentCoin) {
            if (userGuess.toLowerCase() === currentCoin.name.toLowerCase()) {
                setFeedback('Correct! Great job!');
                setScore(score + 1);
                setTimeout(() => selectRandomCoin(coins), 1500);
            } else {
                setFeedback(`Sorry, that's incorrect. Try again or use the "Show Answer" button.`);
                setScore(Math.max(0, score - 1));
            }
            setUserGuess('');
        }
    };

    const getHint = () => {
        if (currentCoin) {
            return `This cryptocurrency has a market cap of $${currentCoin.market_cap.toLocaleString()} and its current price is $${currentCoin.current_price.toLocaleString()}.`;
        }
        return '';
    };

    const handleShowAnswer = () => {
        if (showAnswerState === 0) {
            setShowAnswerState(1);
        } else if (showAnswerState === 1) {
            setShowAnswerState(2);
            setFeedback(`The correct answer is ${currentCoin?.name}.`);
            setTimeout(() => {
                selectRandomCoin(coins);
            }, 5000);
        }
    };

    const getShowAnswerButtonClass = () => {
        switch (showAnswerState) {
            case 1:
                return "bg-red-500 hover:bg-red-600";
            case 2:
                return "bg-green-500 hover:bg-green-600";
            default:
                return "bg-yellow-500 hover:bg-yellow-600";
        }
    };

    const getShowAnswerButtonText = () => {
        switch (showAnswerState) {
            case 1:
                return "Are you sure?";
            case 2:
                return "Showing Answer";
            default:
                return "Show Answer";
        }
    };

    if (coins.length === 0) {
        return <div>Loading game...</div>;
    }

    return (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Crypto Guessing Game</h2>
            <p className="mb-4">Can you guess the cryptocurrency based on the hint?</p>
            <p className="mb-4 font-semibold">Score: {score}</p>
            {currentCoin && (
                <>
                    <p className="mb-4">{getHint()}</p>
                    <input
                        type="text"
                        value={userGuess}
                        onChange={(e) => setUserGuess(e.target.value)}
                        className="w-full px-4 py-2 rounded-md bg-gray-700 text-white mb-4"
                        placeholder="Enter your guess"
                    />
                    <button
                        onClick={handleGuess}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
                    >
                        Submit Guess
                    </button>
                    <button
                        onClick={handleShowAnswer}
                        className={`w-full px-4 py-2 text-white rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${getShowAnswerButtonClass()}`}
                        disabled={showAnswerState === 2}
                    >
                        {getShowAnswerButtonText()}
                    </button>
                </>
            )}
            {feedback && <p className="mt-4 font-semibold">{feedback}</p>}
        </div>
    );
};

export default CryptoGuessingGame;