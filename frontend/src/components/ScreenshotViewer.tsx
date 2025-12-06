import React from 'react';

interface Props {
    base64: string;
}

const ScreenshotViewer: React.FC<Props> = ({ base64 }) => {
    if (!base64) return null;

    return (
        <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Screenshot (Failure)</h4>
            <img
                src={`data:image/png;base64,${base64}`}
                alt="Failure Screenshot"
                className="rounded border border-gray-300 dark:border-gray-600 max-w-full h-auto shadow-sm"
            />
        </div>
    );
};

export default ScreenshotViewer;
