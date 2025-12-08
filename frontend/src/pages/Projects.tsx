import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, createProject } from '../services/api';
import { Project } from '../types';
import DailyStatsChart from '../components/DailyStatsChart';
import { FaPlus, FaExternalLinkAlt, FaRobot } from 'react-icons/fa';

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectUrl, setNewProjectUrl] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await getProjects();
            setProjects(data);
        } catch (error) {
            console.error('Failed to load projects', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createProject(newProjectName, newProjectUrl);
            setShowModal(false);
            setNewProjectName('');
            setNewProjectUrl('');
            loadProjects();
        } catch (error) {
            alert('Failed to create project');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <div className="text-xl font-bold text-blue-500 text-glow animate-pulse">Loading Projects...</div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white mb-2">Automation Hub</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your automation suites across multiple websites.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <FaPlus /> New Project
                </button>
            </div>

            <DailyStatsChart />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link
                        to={`/project/${project.id}`}
                        key={project.id}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <FaRobot size={24} />
                            </div>
                            <FaExternalLinkAlt className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">{project.baseUrl}</p>

                        <div className="flex items-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
                            Created: {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4 dark:text-white">Add New Project</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Project Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newProjectName}
                                    onChange={e => setNewProjectName(e.target.value)}
                                    placeholder="e.g. Production Site"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Base URL</label>
                                <input
                                    type="url"
                                    required
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newProjectUrl}
                                    onChange={e => setNewProjectUrl(e.target.value)}
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
