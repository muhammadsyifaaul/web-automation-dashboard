import axios from 'axios';
import { TestResult, Stats, Project } from '../types';

// Environment Logic
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ENV = import.meta.env.VITE_ENV || 'development';

const BASE_URL = API_URL;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getResults = async () => {
    const response = await api.get<{ success: boolean; data: TestResult[] }>('/results');
    return response.data.data;
};

export const getDailyResults = async () => {
    const response = await api.get<{ success: boolean; data: TestResult[] }>('/results/daily');
    return response.data.data;
};

export const getStats = async () => {
    const response = await api.get<{ success: boolean; data: Stats }>('/stats');
    return response.data.data;
};

export const runTest = async (projectId?: string, testFilter?: string) => {
    try {
        // Optional: Check worker status first? Or let backend handle it.
        // Backend doesn't strictly check worker online for queueing, but UI might want to warn.

        const response = await api.post('/queue-job', {
            projectId: projectId,
            type: testFilter ? 'SingleTest' : 'FullSuite',
            testFilter: testFilter
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 403) {
            throw new Error("Local execution is disabled in this environment.");
        }
        throw error;
    }
};


// Project APIs
export const getProjects = async () => {
    const response = await api.get<{ success: boolean; data: Project[] }>('/projects');
    return response.data.data;
};

export const getProject = async (id: string) => {
    const response = await api.get<{ success: boolean; data: Project }>('/projects/' + id);
    return response.data.data;
};

export const createProject = async (name: string, baseUrl: string) => {
    const response = await api.post<{ success: boolean; data: Project }>('/projects', { name, baseUrl });
    return response.data.data;
};

export const getProjectResults = async (id: string) => {
    const response = await api.get<{ success: boolean; data: TestResult[] }>('/projects/' + id + '/results');
    return response.data.data;
};

// Case Management
export const getProjectCases = async (projectId: string) => {
    const response = await api.get<{ success: boolean; data: any[] }>(`/projects/${projectId}/cases`);
    return response.data.data;
};

export const createProjectCase = async (projectId: string, data: { name: string; identifier: string; description: string }) => {
    const response = await api.post<{ success: boolean; data: any }>(`/projects/${projectId}/cases`, data);
    return response.data.data;
};

export const deleteProjectCase = async (caseId: string) => {
    const response = await api.delete<{ success: boolean }>(`/cases/${caseId}`);
    return response.data;
};

export const updateProjectCase = async (caseId: string, data: { name: string; identifier: string; description: string }) => {
    const response = await api.put<{ success: boolean; data: any }>(`/cases/${caseId}`, data);
    return response.data;
};



export const getWorkerStatus = async () => {
    const response = await api.get<{ online: boolean; lastSeen: string }>('/worker-status');
    return response.data;
};

export const isLocalEnv = () => ENV === 'development';
