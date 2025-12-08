import React, { useEffect, useState } from 'react';
import { getDailyResults } from '../services/api';
import { TestResult } from '../types';

const DailyStatsChart: React.FC = () => {
    const [stats, setStats] = useState<{ pass: number; fail: number }>({ pass: 0, fail: 0 });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const results = await getDailyResults();
                const pass = results.filter(r => r.status === 'PASS').length;
                const fail = results.filter(r => r.status === 'FAIL').length;
                setStats({ pass, fail });
            } catch (error) {
                console.error("Failed to load daily stats", error);
            }
        };
        loadStats();
    }, []);

    const total = stats.pass + stats.fail;
    // if (total === 0) return null; // Show even if empty

    const passWidth = (stats.pass / total) * 100;
    const failWidth = (stats.fail / total) * 100;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold dark:text-white mb-4">Today's Overview 📊</h2>
            <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
                <span>{total} Executions</span>
                <div className="flex gap-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> {stats.pass} Pass</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> {stats.fail} Fail</span>
                </div>
            </div>
            <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                <div style={{ width: `${passWidth}%` }} className="h-full bg-green-500 transition-all duration-500"></div>
                <div style={{ width: `${failWidth}%` }} className="h-full bg-red-500 transition-all duration-500"></div>
            </div>
        </div>
    );
};

export default DailyStatsChart;
