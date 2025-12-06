import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
            <Header />
            <main className="container mx-auto p-6 flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
