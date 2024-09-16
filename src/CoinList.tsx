import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { Coin, SortConfig } from './App';

interface CoinListProps {
    coins: Coin[];
    loading: boolean;
    error: string;
    search: string;
    sortConfig: SortConfig | null;
    totalPages: number;
    currentPage: number;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSort: (key: keyof Coin) => void;
    onPageChange: (newPage: number) => void;
    onRefresh: () => Promise<void>;
}

const CoinList: React.FC<CoinListProps> = ({
                                               coins,
                                               loading,
                                               error,
                                               search,
                                               sortConfig,
                                               totalPages,
                                               currentPage,
                                               onSearchChange,
                                               onSort,
                                               onPageChange,
                                               onRefresh,
                                           }) => {
    const navigate = useNavigate();

    const renderSortIcon = (key: keyof Coin) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <FontAwesomeIcon icon={faSort} />;
        }
        return sortConfig.direction === 'ascending' ? (
            <FontAwesomeIcon icon={faSortUp} />
        ) : (
            <FontAwesomeIcon icon={faSortDown} />
        );
    };

    if (loading) return <div className="text-center mt-20 text-xl">Loading...</div>;
    if (error) return <div className="text-center mt-20 text-xl text-red-500">{error}</div>;

    return (
        <>
            <div className="text-center mb-12">
                <a target={'_blank'} href="https://emrelutfi.com/">
                    crafted by emrelutfi.com
                </a>
                <h1 className="text-3xl font-bold mb-4">Search a currency</h1>
                <div className="flex justify-center items-center">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full max-w-md px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={onSearchChange}
                    />
                    <button
                        onClick={onRefresh}
                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        title="Refresh data"
                    >
                        <FontAwesomeIcon icon={faSyncAlt} />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                    <tr>
                        {['Name', 'Price', '24h Change', 'Market Cap', 'Volume', 'Circulating Supply'].map((header, index) => (
                            <th
                                key={index}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                                onClick={() => onSort(header.toLowerCase().replace(/\s+/g, '_') as keyof Coin)}
                            >
                                {header} {renderSortIcon(header.toLowerCase().replace(/\s+/g, '_') as keyof Coin)}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {coins.map((coin) => (
                        <tr
                            key={coin.id}
                            onClick={() => navigate(`/coin/${coin.id}`)}
                            className="hover:bg-gray-800 cursor-pointer"
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <img src={coin.image} alt={coin.name} className="w-6 h-6 mr-2" />
                                    <span>{coin.name}</span>
                                    <span className="ml-2 text-gray-400 text-sm">{coin.symbol.toUpperCase()}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                ${coin.current_price.toLocaleString()}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${coin.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {coin.price_change_percentage_24h.toFixed(2)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                ${coin.market_cap.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                ${coin.total_volume.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {coin.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex justify-center items-center">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed mr-4"
                >
                    Previous
                </button>
                <span className="text-lg">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed ml-4"
                >
                    Next
                </button>
            </div>

        </>
    );
};

export default CoinList;