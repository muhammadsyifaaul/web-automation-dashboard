import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject, getProjectResults, getProjectCases, createProjectCase, deleteProjectCase, runTest } from '../services/api';
import { Project, TestResult, ProjectCase } from '../types';
import StatsCard from '../components/StatsCard';
import ResultTable from '../components/ResultTable';
import RunTestButton from '../components/RunTestButton';
import { FaArrowLeft, FaGlobe } from 'react-icons/fa';

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [results, setResults] = useState<TestResult[]>([]);
    const [projectCases, setProjectCases] = useState<ProjectCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);


    // Case Form State
    const [showAddCase, setShowAddCase] = useState(false);
    const [newCase, setNewCase] = useState({ name: '', identifier: '', description: '' });

    const loadData = async () => {
        if (!id) return;
        try {
            const [projData, resData, casesData] = await Promise.all([
                getProject(id),
                getProjectResults(id),
                getProjectCases(id)
            ]);
            setProject(projData);
            setProjectCases(casesData || []);
            // Sort results descending
            const sortedResults = resData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setResults(sortedResults);
        } catch (error) {
            console.error('Failed to load project data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000); // Poll for updates

        // Clear notification after 3s
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => { clearTimeout(timer); clearInterval(interval); };
        }
        return () => clearInterval(interval);
    }, [id, notification]);

    // Helper to handle execution
    const handleRunTest = async (filter: string = "") => {
        try {
            // 1. Check worker
            const workerStatus = await import('../services/api').then(m => m.getWorkerStatus());
            if (!workerStatus.online) {
                if (!confirm("The Automation Worker seems to be OFFLINE. The job will be queued but won't start until the worker connects. Continue?")) {
                    return;
                }
            }

            await runTest(project?.id, filter);
            setNotification({ message: 'Job Queued Successfully!', type: 'success' });
        } catch (e: any) {
            console.error(e);
            setNotification({ message: 'Failed to queue job: ' + e.message, type: 'error' });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <div className="text-xl font-bold text-blue-500 text-glow animate-pulse">Loading Dashboard...</div>
        </div>
    );
    if (!project) return <div className="p-10 text-center text-red-500">Project Not Found</div>;

    // Calculate stats on the fly
    const safeResults = results || [];
    const totalTests = safeResults.length;
    const passedTests = safeResults.filter(r => r.status === 'PASS').length;
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    const avgDuration = totalTests > 0
        ? (safeResults.reduce((acc, curr) => acc + curr.duration, 0) / totalTests).toFixed(2)
        : '0';

    return (
        <div className="p-6 space-y-6">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-2">
                <FaArrowLeft className="mr-2" /> Back to Projects
            </Link>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg border animate-fade-in-down ${notification.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' :
                        notification.type === 'warning' ? 'bg-yellow-100 border-yellow-200 text-yellow-800' :
                            'bg-red-100 border-red-200 text-red-800'
                    }`}>
                    <span className="font-bold mr-2">{notification.type === 'success' ? '✓' : '⚠️'}</span>
                    {notification.message}
                </div>
            )}

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                        {project.name}
                        <span className="text-sm font-normal px-2 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                            {passRate}% Health
                        </span>
                    </h1>
                    <a href={project.baseUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-500 flex items-center gap-2 mt-1">
                        <FaGlobe /> {project.baseUrl}
                    </a>
                </div>
                <div className="flex items-center gap-4">
                    {/* 
                  Legacy Run Button removed or hidden in favor of Case Manager. 
                  Or we can keep it as a "Quick Run" for the default case.
               */}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Executions" value={totalTests} color="border-blue-500" />
                <StatsCard title="Pass Rate" value={`${passRate}%`} color="border-green-500" />
                <StatsCard title="Avg Duration" value={`${avgDuration}s`} color="border-yellow-500" />
                <StatsCard title="Last Run" value={results[0] ? new Date(results[0].timestamp).toLocaleDateString() : 'Never'} color="border-purple-500" />
            </div>

            {/* Case Management Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">Test Cases</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleRunTest("")}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            Run All Cases
                        </button>
                        <button
                            onClick={() => setShowAddCase(!showAddCase)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-lg transition-colors"
                        >
                            {showAddCase ? 'Cancel' : '+ Add Case'}
                        </button>
                    </div>
                </div>

                {showAddCase && (
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Case Name (e.g. Add Item)"
                                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                value={newCase.name}
                                onChange={e => setNewCase({ ...newCase, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Identifier (e.g. /add)"
                                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                value={newCase.identifier}
                                onChange={e => setNewCase({ ...newCase, identifier: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Description (Optional)"
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    value={newCase.description}
                                    onChange={e => setNewCase({ ...newCase, description: e.target.value })}
                                />
                                <button
                                    onClick={async () => {
                                        if (!newCase.name || !newCase.identifier) return;
                                        await createProjectCase(project.id, newCase);
                                        setNewCase({ name: '', identifier: '', description: '' });
                                        setShowAddCase(false);
                                        loadData();
                                    }}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {projectCases.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No cases defined. Add one to get started.</div>
                    ) : (
                        projectCases.map((testCase) => (
                            <div key={testCase.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div>
                                    <h3 className="font-medium dark:text-white">{testCase.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-mono">{testCase.identifier}</code>
                                        <span>{testCase.description}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleRunTest(testCase.identifier)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title="Run this case"
                                    >
                                        Run
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Delete this case?')) {
                                                await deleteProjectCase(testCase.id);
                                                loadData();
                                            }
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">Execution History</h2>
                </div>
                <ResultTable
                    results={safeResults}
                    onViewDetail={(res) => setSelectedResult(res)}
                />
            </div>
            {/* Detail Modal */}
            {selectedResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-xl z-10 shrink-0">
                            <h2 className="text-2xl font-bold dark:text-white">Test Details</h2>
                            <button onClick={() => setSelectedResult(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">&times;</button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* ... fields ... */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Status</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${selectedResult.status === 'PASS'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                        {selectedResult.status}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Test Name</h3>
                                    <p className="dark:text-white font-medium">{selectedResult.testName}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Duration</h3>
                                    <p className="dark:text-white">{selectedResult.duration}s</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Time</h3>
                                    <p className="dark:text-white">{new Date(selectedResult.timestamp).toLocaleString()}</p>
                                </div>
                            </div>

                            {selectedResult.message && (
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Message</h3>
                                    <p className="dark:text-gray-300 whitespace-pre-wrap">{selectedResult.message}</p>
                                </div>
                            )}

                            {selectedResult.errorStack && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
                                    <h3 className="text-sm font-semibold text-red-500 uppercase mb-2">Error Stack</h3>
                                    <pre className="text-xs text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap word-break break-words text-wrap">{selectedResult.errorStack}</pre>
                                </div>
                            )}

                            {selectedResult.screenshotBase64 ? (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Screenshot</h3>
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <img src={selectedResult.screenshotBase64} alt="Failure Screenshot" className="w-full h-auto" />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                    No screenshot available (Test passed or image failed to capture)
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end shrink-0 bg-white dark:bg-gray-800 rounded-b-xl">
                            <button
                                onClick={() => setSelectedResult(null)}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;
