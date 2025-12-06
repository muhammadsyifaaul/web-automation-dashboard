import React from 'react';
import { TestResult } from '../types';

interface Props {
    results: TestResult[];
    onViewDetail: (result: TestResult) => void;
}

const ResultTable: React.FC<Props> = ({ results, onViewDetail }) => {
    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                    <tr>
                        <th className="p-4">Status</th>
                        <th className="p-4">Test Name</th>
                        <th className="p-4">Duration</th>
                        <th className="p-4">Time</th>
                        <th className="p-4">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {results.map((res) => (
                        <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${res.status === 'PASS'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                    {res.status}
                                </span>
                            </td>
                            <td className="p-4 text-gray-800 dark:text-gray-200">{res.testName}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">{res.duration.toFixed(2)}s</td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">{new Date(res.timestamp).toLocaleString()}</td>
                            <td className="p-4">
                                <button
                                    onClick={() => onViewDetail(res)}
                                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResultTable;
