import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

interface CoinDetailData {
    id: string;
    name: string;
    symbol: string;
    image: {
        large: string;
    };
    description: {
        en: string;
    };
    market_data: {
        current_price: {
            usd: number;
        };
        price_change_percentage_24h: number;
        market_cap: {
            usd: number;
        };
        total_volume: {
            usd: number;
        };
        circulating_supply: number;
        total_supply: number;
    };
}

function CoinDetail() {
    const { id } = useParams<{ id: string }>();
    const [coin, setCoin] = useState<CoinDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCoinDetail = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`);
                setCoin(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch coin data. Please try again later.');
                setLoading(false);
            }
        };

        fetchCoinDetail();
    }, [id]);

    if (loading) return <div className="text-center mt-20 text-xl">Loading...</div>;
    if (error) return <div className="text-center mt-20 text-xl text-red-500">{error}</div>;
    if (!coin) return <div className="text-center mt-20 text-xl">No coin data available.</div>;

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <Link to="/" className="text-blue-500 hover:text-blue-600 mb-4 inline-block">&larr; Back to list</Link>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-6">
                    <img src={coin.image.large} alt={coin.name} className="w-16 h-16 mr-4" />
                    <div>
                        <h1 className="text-3xl font-bold">{coin.name}</h1>
                        <p className="text-xl text-gray-400">{coin.symbol.toUpperCase()}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Price</h2>
                        <p className="text-2xl">${coin.market_data.current_price.usd.toLocaleString()}</p>
                        <p className={`text-lg ${coin.market_data.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {coin.market_data.price_change_percentage_24h.toFixed(2)}% (24h)
                        </p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Market Cap</h2>
                        <p className="text-2xl">${coin.market_data.market_cap.usd.toLocaleString()}</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Volume (24h)</h2>
                        <p className="text-2xl">${coin.market_data.total_volume.usd.toLocaleString()}</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Circulating Supply</h2>
                        <p className="text-2xl">{coin.market_data.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}</p>
                    </div>
                </div>
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">About {coin.name}</h2>
                    <p className="text-gray-300" dangerouslySetInnerHTML={{ __html: coin.description.en }}></p>
                </div>
            </div>
        </div>
    );
}

export default CoinDetail;