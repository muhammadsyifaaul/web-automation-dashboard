import React, { useState } from 'react';
import { runTest } from '../services/api';

interface Props {
    projectId?: string;
    onRunComplete?: () => void;
}

const RunTestButton: React.FC<Props> = ({ projectId, onRunComplete }) => {
    const [loading, setLoading] = useState(false);

    const handleRun = async () => {
        setLoading(true);
        try {
            await runTest(projectId);
            if (onRunComplete) onRunComplete();
            alert('Test Queued Successfully! 🚀');
        } catch (error: any) {
            alert(error.message || 'Failed to queue test');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleRun}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow disabled:opacity-50 transition-colors flex items-center gap-2"
        >
            {loading ? 'Queueing...' : 'Run Test Suite'}
        </button>
    );
};

export default RunTestButton;
