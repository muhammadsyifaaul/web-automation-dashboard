import React, { useState } from 'react';
import { runTest, getWorkerStatus } from '../services/api';
import { FaPlay } from 'react-icons/fa';

interface Props {
    projectId?: string;
    onRunComplete?: () => void;
}

const RunTestButton: React.FC<Props> = ({ projectId, onRunComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const showToast = (type: 'success' | 'error', text: string) => {
        setStatusMessage({ type, text });
        setTimeout(() => setStatusMessage(null), 3000);
    };

    const handleRun = async () => {
        if (!projectId) return;
        setIsLoading(true);

        try {
            const status = await getWorkerStatus();
            if (!status.online) {
                showToast('error', 'No Worker Online!');
                setIsLoading(false);
                return;
            }

            await runTest(projectId);
            showToast('success', 'Tests queued successfully!');
            if (onRunComplete) onRunComplete();
        } catch (error: any) {
            console.error(error);
            showToast('error', error.message || 'Failed to queue job');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleRun}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="animate-spin">⟳</span>
                ) : (
                    <FaPlay size={12} />
                )}
                Run Test
            </button>

            {statusMessage && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-up z-[60] ${statusMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {statusMessage.text}
                </div>
            )}
        </>
    );
};

export default RunTestButton;
