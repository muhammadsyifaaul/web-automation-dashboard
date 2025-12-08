import React, { useState } from 'react';
import { runTest, getWorkerStatus } from '../services/api';

interface Props {
    projectId?: string;
    onRunComplete?: () => void;
}

const RunTestButton: React.FC<Props> = ({ projectId, onRunComplete }) => {
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleRun = async () => {
        setLoading(true);
        setNotification(null);
        try {
            const status = await getWorkerStatus();
            if (!status.online) {
                setNotification({ type: 'error', text: 'No Worker Online!' });
                setTimeout(() => setNotification(null), 3000);
                setLoading(false);
                return;
            }

            await runTest(projectId);
            setNotification({ type: 'success', text: 'Test Queued! 🚀' });
            if (onRunComplete) onRunComplete();
            setTimeout(() => setNotification(null), 3000);
        } catch (error: any) {
            setNotification({ type: 'error', text: error.message || 'Failed' });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
            {notification && (
                <span className={`text-sm font-medium animate-fade-in ${notification.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                    {notification.text}
                </span>
            )}
            <button
                onClick={handleRun}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow disabled:opacity-50 transition-colors flex items-center gap-2"
            >
                {loading ? 'Queueing...' : 'Run Test Suite'}
            </button>
        </div>
    );
};

export default RunTestButton;
