import React, { useState } from 'react';
import { runTest, getWorkerStatus, getProjectTests } from '../services/api';
import { FaPlay, FaList, FaTimes } from 'react-icons/fa';

interface Props {
    projectId?: string;
    onRunComplete?: () => void;
}

const RunTestButton: React.FC<Props> = ({ projectId, onRunComplete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tests, setTests] = useState<string[]>([]);
    const [loadingTests, setLoadingTests] = useState(false);
    const [runningTest, setRunningTest] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const showToast = (type: 'success' | 'error', text: string) => {
        setStatusMessage({ type, text });
        setTimeout(() => setStatusMessage(null), 3000);
    };

    const handleOpenModal = async () => {
        if (!projectId) return;
        setIsModalOpen(true);
        setLoadingTests(true);
        try {
            const testList = await getProjectTests(projectId);
            setTests(testList);
        } catch (error) {
            console.error(error);
            showToast('error', 'Failed to load tests');
        } finally {
            setLoadingTests(false);
        }
    };

    const handleRun = async (testName?: string) => {
        if (!projectId) return;
        setRunningTest(testName || 'ALL');

        try {
            const status = await getWorkerStatus();
            if (!status.online) {
                showToast('error', 'No Worker Online!');
                setRunningTest(null);
                return;
            }

            await runTest(projectId, testName);
            showToast('success', testName ? `Queued: ${testName}` : 'All Tests Queued! 🚀');
            if (onRunComplete) onRunComplete();
        } catch (error: any) {
            showToast('error', error.message || 'Failed');
        } finally {
            setRunningTest(null);
        }
    };

    return (
        <>
            {/* Main Button */}
            <button
                onClick={handleOpenModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors flex items-center gap-2"
            >
                <FaList /> View All Tests
            </button>

            {/* Notification Toast */}
            {statusMessage && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-up z-[60] ${statusMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {statusMessage.text}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                <FaList /> Available Tests
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 overflow-y-auto flex-1">
                            {loadingTests ? (
                                <div className="text-center py-8 text-gray-500">Loading tests...</div>
                            ) : tests.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No tests found in tests.py</div>
                            ) : (
                                <div className="space-y-2">
                                    {tests.map((test) => (
                                        <div key={test} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full">
                                            <span className="font-mono text-sm dark:text-gray-200">{test}</span>
                                            <button
                                                onClick={() => handleRun(test)}
                                                disabled={!!runningTest}
                                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded text-sm flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {runningTest === test ? (
                                                    <span className="animate-spin">⟳</span>
                                                ) : (
                                                    <FaPlay size={10} />
                                                )}
                                                Run
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleRun()}
                                disabled={!!runningTest || tests.length === 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {runningTest === 'ALL' ? (
                                    <>Running...</>
                                ) : (
                                    <>Run All Tests</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RunTestButton;
