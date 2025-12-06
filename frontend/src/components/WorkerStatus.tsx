import React, { useEffect, useState } from 'react';
import { getWorkerStatus } from '../services/api';

const WorkerStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const data = await getWorkerStatus();
                setIsOnline(data.online);
            } catch (error) {
                setIsOnline(false);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${isOnline
                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
            }`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {isOnline ? 'Worker Online' : 'Worker Offline'}
        </div>
    );
};

export default WorkerStatus;
