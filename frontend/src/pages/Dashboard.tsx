import React, { useEffect, useState } from 'react';
import { getStats, getResults, runTest } from '../services/api';
import { Stats, TestResult } from '../types';
import StatsCard from '../components/StatsCard';
import ResultTable from '../components/ResultTable';
import RunTestButton from '../components/RunTestButton';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentResults, setRecentResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const s = await getStats();
            const r = await getResults();
            setStats(s);
            setRecentResults(r.slice(0, 5)); // Top 5
        } catch (e) {
            console.error("Failed to fetch data", e);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 3 seconds (was 5)
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000); // Hide after 3s
    };

    const handleRunTest = async () => {
        setLoading(true);
        try {
            await runTest();
            showNotification('Test triggered! Updating...');
            setTimeout(fetchData, 3000); // Sync manual update
        } catch (err: any) {
            showNotification(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            {notification && (
                <div className="absolute top-0 right-56 bg-black border border-blue-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-bounce">
                    {notification}
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
                <RunTestButton loading={loading} onClick={handleRunTest} />
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatsCard title="Total Tests" value={stats.total} color="border-blue-500" />
                    <StatsCard title="Passed" value={stats.passed} color="border-green-500" />
                    <StatsCard title="Failed" value={stats.failed} color="border-red-500" />
                    <StatsCard
                        title="Success Rate"
                        value={`${stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0}%`}
                        color="border-purple-500"
                    />
                </div>
            )}

            <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Runs</h3>
                <ResultTable results={recentResults} onViewDetail={(res) => navigate(`/results?id=${res.id}`)} />
            </div>
        </div>
    );
};

export default Dashboard;
