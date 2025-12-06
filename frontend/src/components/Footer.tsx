import React from 'react';
import { FaGithub } from 'react-icons/fa';

const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 mt-auto">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">

                {/* Warning Section */}
                <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-900/50 max-w-xl">
                    <span className="text-xl">⚠️</span>
                    <div>
                        <p className="text-xs font-bold text-yellow-800 dark:text-yellow-200 uppercase tracking-wide">
                            For Now Automation tests cannot run in production
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            The tests only execute when the developer's local machine is running the automation worker.
                        </p>
                    </div>
                </div>

                {/* Links Section */}
                <div className="flex items-center gap-6">
                    <a
                        href="https://github.com/muhammadsyifaaul/web-automation-dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium"
                    >
                        <FaGithub className="text-xl" />
                        <span>Visit The Repository</span>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
