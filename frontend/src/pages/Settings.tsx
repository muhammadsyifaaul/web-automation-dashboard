import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { isLocalEnv } from '../services/api';

const Settings: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Appearance</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Current Theme: {theme.toUpperCase()}</span>
                        <button
                            onClick={toggleTheme}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Toggle Theme
                        </button>
                    </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Environment Info</h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p><strong>VITE_ENV:</strong> {import.meta.env.VITE_ENV || 'local'}</p>
                        <p><strong>API URL:</strong> {import.meta.env.VITE_ENV === 'production' ? import.meta.env.VITE_API_URL_PROD : (import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:3000/api')}</p>
                        <p><strong>Local Execution:</strong> {isLocalEnv() ? 'Enabled' : 'Disabled (Cloud Mode)'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
