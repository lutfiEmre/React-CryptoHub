import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import CoinList from './CoinList.tsx';
import CoinDetail from './CoinDetail';

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

export interface SortConfig {
    key: keyof Coin;
    direction: 'ascending' | 'descending';
}

export interface AppState {
    coins: Coin[];
    search: string;
    page: number;
    sortConfig: SortConfig | null;
    loading: boolean;
    error: string;
}

const ITEMS_PER_PAGE = 10;

function App() {
    const [state, setState] = useState<AppState>({
        coins: [],
        search: '',
        page: 1,
        sortConfig: null,
        loading: true,
        error: '',
    });

    const fetchCoins = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const response = await axios.get(
                'https://api.coingecko.com/api/v3/coins/markets',
                {
                    params: {
                        vs_currency: 'usd',
                        order: 'market_cap_desc',
                        per_page: 250,
                        page: 1,
                        sparkline: false,
                    },
                }
            );
            setState(prev => ({
                ...prev,
                coins: response.data,
                loading: false,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: 'Failed to fetch coin data. Please try again later.',
                loading: false,
            }));
        }
    }, []);

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
                                state={state}
                                paginatedCoins={paginatedCoins}
                                totalPages={totalPages}
                                handleChange={handleChange}
                                handleSort={handleSort}
                                handlePageChange={handlePageChange}
                                fetchCoins={fetchCoins}
                            />
                        } />
                        <Route path="/coin/:id" element={<CoinDetail />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;