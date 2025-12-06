import React from 'react';

interface Props {
    title: string;
    value: number | string;
    color: string;
}

const StatsCard: React.FC<Props> = ({ title, value, color }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 ${color}`}>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase font-semibold">{title}</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{value}</p>
        </div>
    );
};

export default StatsCard;
