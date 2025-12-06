import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">AutoDash</h1>
                <nav className="flex gap-4">
                    <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Dashboard</Link>
                    <Link to="/results" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Results</Link>
                    <Link to="/settings" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Settings</Link>
                </nav>
            </div>
            <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            >
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
        </header>
    );
};

export default Header;
