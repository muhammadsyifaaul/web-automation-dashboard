import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Projects from './pages/Projects';
import DailyResults from './pages/DailyResults';
import ProjectDetail from './pages/ProjectDetail';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <HashRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Projects />} />
                        <Route path="/results" element={<DailyResults />} />
                        <Route path="/project/:id" element={<ProjectDetail />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </Layout>
            </HashRouter>
        </ThemeProvider>
    );
};

export default App;
