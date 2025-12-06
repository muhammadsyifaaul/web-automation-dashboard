import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getResults } from '../services/api';
import { TestResult } from '../types';
import ResultTable from '../components/ResultTable';
import ScreenshotViewer from '../components/ScreenshotViewer';

const Results: React.FC = () => {
    const [results, setResults] = useState<TestResult[]>([]);
    const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetch = async () => {
            const data = await getResults();
            setResults(data);

            const id = searchParams.get('id');
            if (id) {
                const found = data.find(r => r.id === id);
                if (found) setSelectedResult(found);
            }
        };
        fetch();
    }, [searchParams]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">All Results</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ResultTable results={results} onViewDetail={setSelectedResult} />
                </div>

                <div className="lg:col-span-1">
                    {selectedResult ? (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow sticky top-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Test Detail: {selectedResult.testName}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">ID: {selectedResult.id}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Details
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                            <span className={`font-bold ${selectedResult.status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedResult.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                                            <span className="text-gray-800 dark:text-gray-200">{selectedResult.duration.toFixed(2)}s</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Browser:</span>
                                            <span className="text-gray-800 dark:text-gray-200">{selectedResult.browser}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                                            <span className="text-gray-800 dark:text-gray-200">{selectedResult.environment}</span>
                                        </div>
                                    </div>

                                    {/* Screenshot Viewer */}
                                    {selectedResult.status === 'FAIL' && selectedResult.screenshotBase64 && (
                                        <div className="mt-6">
                                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                Screenshot
                                            </h4>
                                            <ScreenshotViewer base64={selectedResult.screenshotBase64} />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Message
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                        {selectedResult.message || 'No message provided.'}
                                    </div>

                                    {selectedResult.errorStack && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                Stack Trace
                                            </h4>
                                            <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-100 dark:border-red-900 overflow-x-auto text-xs text-red-700 dark:text-red-300">
                                                {selectedResult.errorStack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-500">
                            Select a test to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Results;
