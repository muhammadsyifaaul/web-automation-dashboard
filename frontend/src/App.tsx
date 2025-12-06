import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/results" element={<Results />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
