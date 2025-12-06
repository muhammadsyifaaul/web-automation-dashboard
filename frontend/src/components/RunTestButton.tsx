import React from 'react';

interface Props {
    loading?: boolean;
    onClick?: () => void;
}

const RunTestButton: React.FC<Props> = ({ loading = false, onClick }) => {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow disabled:opacity-50 transition-colors"
        >
            {loading ? 'Running...' : 'Run Test (Local)'}
        </button>
    );
};

export default RunTestButton;
