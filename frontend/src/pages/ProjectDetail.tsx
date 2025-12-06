import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject, getProjectResults } from '../services/api';
import { Project, TestResult } from '../types';
import StatsCard from '../components/StatsCard';
import ResultTable from '../components/ResultTable';
import RunTestButton from '../components/RunTestButton';
import { FaArrowLeft, FaGlobe } from 'react-icons/fa';

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [results, setResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!id) return;
        try {
            const [projData, resData] = await Promise.all([
                getProject(id),
                getProjectResults(id)
            ]);
            setProject(projData);
            setResults(resData);
        } catch (error) {
            console.error('Failed to load project data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000); // Poll for updates
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;
    if (!project) return <div className="p-10 text-center text-red-500">Project Not Found</div>;

    // Calculate stats on the fly
    const totalTests = results.length;
    const passedTests = results.filter(r => r.status === 'PASS').length;
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    const avgDuration = totalTests > 0
        ? (results.reduce((acc, curr) => acc + curr.duration, 0) / totalTests).toFixed(2)
        : '0';

    return (
        <div className="p-6 space-y-6">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-2">
                <FaArrowLeft className="mr-2" /> Back to Projects
            </Link>

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
                    <RunTestButton
                        onRunComplete={() => {/* Handled by polling */ }}
                        projectId={project.id} // We need to update RunTestButton to accept projectId
                    />
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Executions" value={totalTests} color="border-blue-500" />
                <StatsCard title="Pass Rate" value={`${passRate}%`} color="border-green-500" />
                <StatsCard title="Avg Duration" value={`${avgDuration}s`} color="border-yellow-500" />
                <StatsCard title="Last Run" value={results[0] ? new Date(results[0].timestamp).toLocaleDateString() : 'Never'} color="border-purple-500" />
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">Execution History</h2>
                </div>
                <ResultTable
                    results={results}
                    onViewDetail={(res) => {
                        if (res.screenshotBase64) {
                            const win = window.open("", "_blank");
                            if (win) {
                                win.document.write('<img src="' + res.screenshotBase64 + '" style="max-width: 100%"/>');
                            }
                        } else {
                            alert("No screenshot available for this test.");
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default ProjectDetail;
