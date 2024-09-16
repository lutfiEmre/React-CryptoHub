import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import CoinList from './CoinList';
import CoinDetail from './CoinDetail';
import CryptoGuessingGame from "./CryptoGuessingGame";

export interface Coin {
    id: string;
    name: string;
    image: string;
    symbol: string;
    current_price: number;
    market_cap: number;
    total_volume: number;
    price_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
}

export interface CoinDetailData {
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

export interface SortConfig {
    key: keyof Coin;
    direction: 'ascending' | 'descending';
}

export interface AppState {
    coins: Coin[];
    coinDetails: { [key: string]: CoinDetailData };
    search: string;
    page: number;
    sortConfig: SortConfig | null;
    loading: boolean;
    error: string;
}

export const CACHE_DURATION = 5 * 60 * 1000;
export const API_BASE_URL = 'https://api.coingecko.com/api/v3';
const ITEMS_PER_PAGE = 10;

function App() {
    const [state, setState] = useState<AppState>({
        coins: [],
        coinDetails: {},
        search: '',
        page: 1,
        sortConfig: null,
        loading: true,
        error: '',
    });

    const fetchCoins = useCallback(async () => {
        setState(prevState => ({ ...prevState, loading: true, error: '' }));

        try {
            const cachedData = localStorage.getItem('coinData');
            const cachedTimestamp = localStorage.getItem('coinDataTimestamp');

            if (cachedData && cachedTimestamp && Date.now() - Number(cachedTimestamp) < CACHE_DURATION) {
                setState(prevState => ({
                    ...prevState,
                    coins: JSON.parse(cachedData),
                    loading: false
                }));
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/coins/markets`, {
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: 250,
                    page: 1,
                    sparkline: false
                }
            });

            setState(prevState => ({ ...prevState, coins: response.data, loading: false }));
            localStorage.setItem('coinData', JSON.stringify(response.data));
            localStorage.setItem('coinDataTimestamp', Date.now().toString());
        } catch (error) {
            setState(prevState => ({
                ...prevState,
                loading: false,
                error: 'An error occurred while fetching data.'
            }));
            console.error('Error fetching coin data:', error);
        }
    }, []);

    const fetchCoinDetail = useCallback(async (id: string) => {
        if (state.coinDetails[id]) return state.coinDetails[id];

        try {
            const response = await axios.get(`${API_BASE_URL}/coins/${id}`);
            setState(prevState => ({
                ...prevState,
                coinDetails: { ...prevState.coinDetails, [id]: response.data }
            }));
            return response.data;
        } catch (error) {
            console.error('Error fetching coin detail:', error);
            throw error;
        }
    }, [state.coinDetails]);

    useEffect(() => {
        fetchCoins();
    }, [fetchCoins]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({
            ...prev,
            search: e.target.value,
            page: 1,
        }));
    };

    const handleSort = (key: keyof Coin) => {
        setState(prev => {
            const direction: 'ascending' | 'descending' =
                prev.sortConfig?.key === key && prev.sortConfig.direction === 'ascending'
                    ? 'descending'
                    : 'ascending';
            return {
                ...prev,
                sortConfig: { key, direction },
            };
        });
    };

    const sortedCoins = useMemo(() => {
        const sortableCoins = [...state.coins];
        if (state.sortConfig !== null) {
            sortableCoins.sort((a, b) => {
                if (a[state.sortConfig!.key] < b[state.sortConfig!.key]) {
                    return state.sortConfig!.direction === 'ascending' ? -1 : 1;
                }
                if (a[state.sortConfig!.key] > b[state.sortConfig!.key]) {
                    return state.sortConfig!.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableCoins;
    }, [state.coins, state.sortConfig]);

    const filteredCoins = useMemo(() =>
            sortedCoins.filter((coin) =>
                coin.name.toLowerCase().includes(state.search.toLowerCase().trim())
            ),
        [sortedCoins, state.search]
    );

    const paginatedCoins = useMemo(() =>
            filteredCoins.slice(
                (state.page - 1) * ITEMS_PER_PAGE,
                state.page * ITEMS_PER_PAGE
            ),
        [filteredCoins, state.page]
    );

    const totalPages = Math.ceil(filteredCoins.length / ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        setState(prev => ({ ...prev, page: newPage }));
    };

    return (
        <Router>
            <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <Routes>
                        <Route path="/" element={
                            <CoinList
                                coins={paginatedCoins}
                                loading={state.loading}
                                error={state.error}
                                search={state.search}
                                sortConfig={state.sortConfig}
                                totalPages={totalPages}
                                currentPage={state.page}
                                onSearchChange={handleChange}
                                onSort={handleSort}
                                onPageChange={handlePageChange}
                                onRefresh={fetchCoins}
                            />
                        } />
                        <Route path="/coin/:id" element={<CoinDetail fetchCoinDetail={fetchCoinDetail} />} />

                    </Routes>
                    <div className={'w-full mt-[50px] flex justify-start flex-col items-center'}>
                        <CryptoGuessingGame coins={state.coins} />
                    </div>
                </div>
            </div>
        </Router>
    );
}

export default App;