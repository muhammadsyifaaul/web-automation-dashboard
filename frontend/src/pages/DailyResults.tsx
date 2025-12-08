import React, { useEffect, useState } from 'react';
import { getProjects, getDailyResults } from '../services/api';
import { Project, TestResult } from '../types';
import { FaChevronDown, FaChevronRight, FaCheckCircle, FaTimesCircle, FaSmile } from 'react-icons/fa';

const DailyResults: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [results, setResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadData = async () => {
            try {
                const [projData, resData] = await Promise.all([
                    getProjects(),
                    getDailyResults()
                ]);
                setProjects(projData);
                setResults(resData);
                // Expand all by default
                setExpandedProjects(new Set(projData.map(p => p.id)));
            } catch (error) {
                console.error("Failed to load daily results", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const toggleExpand = (projectId: string) => {
        const newSet = new Set(expandedProjects);
        if (newSet.has(projectId)) {
            newSet.delete(projectId);
        } else {
            newSet.add(projectId);
        }
        setExpandedProjects(newSet);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <div className="text-xl font-bold text-blue-500 text-glow animate-pulse">Loading Daily Results...</div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold dark:text-white mb-6">Today's Results 📅</h1>

            {projects.map(project => {
                const projectResults = results.filter(r => r.projectId === project.id);
                const isExpanded = expandedProjects.has(project.id);
                const successCount = projectResults.filter(r => r.status === 'PASS').length;
                const failCount = projectResults.filter(r => r.status === 'FAIL').length;

                return (
                    <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                        {/* Header */}
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => toggleExpand(project.id)}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-gray-400">
                                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                </span>
                                <h2 className="text-lg font-bold dark:text-white">{project.name}</h2>
                                <div className="flex gap-2 text-xs">
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        {successCount} PASS
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        {failCount} FAIL
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        {isExpanded && (
                            <div className="border-t border-gray-100 dark:border-gray-700">
                                {projectResults.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
                                        <FaSmile className="text-4xl text-yellow-400" />
                                        <p>No test executed today :)</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {projectResults.map((result) => (
                                            <div key={result.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    {result.status === 'PASS'
                                                        ? <FaCheckCircle className="text-green-500" />
                                                        : <FaTimesCircle className="text-red-500" />
                                                    }
                                                    <div>
                                                        <p className="font-medium dark:text-gray-200">{result.testName}</p>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(result.timestamp).toLocaleTimeString()} • {result.duration}s
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded font-bold ${result.status === 'PASS'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                                    }`}>
                                                    {result.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default DailyResults;
