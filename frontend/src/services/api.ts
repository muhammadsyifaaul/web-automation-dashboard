import axios from 'axios';
import { TestResult, Stats } from '../types';

// Environment Logic
const ENV = import.meta.env.VITE_ENV || 'local';
const LOCAL_API = import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:3000/api';
const PROD_API = import.meta.env.VITE_API_URL_PROD || 'https://your-deployed-backend.com/api';

const BASE_URL = ENV === 'local' ? LOCAL_API : PROD_API;

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

export const getStats = async () => {
    const response = await api.get<{ success: boolean; data: Stats }>('/stats');
    return response.data.data;
};

export const runTest = async () => {
    try {
        const response = await api.post('/run-test');
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 403) {
            throw new Error("Local execution is disabled in this environment.");
        }
        throw error;
    }
};

export const isLocalEnv = () => ENV === 'local';
