export interface Project {
    id: string;
    name: string;
    baseUrl: string;
    createdAt: string;
    updatedAt: string;
}

export interface TestResult {
    id: string;
    projectId?: string;
    testName: string;
    status: 'PASS' | 'FAIL';
    message: string;
    duration: number;
    timestamp: string;
    screenshotBase64?: string;
    errorStack?: string;
    browser: string;
    environment: string;
}

export interface Stats {
    totalTests: number;
    passRate: number;
    avgDuration: number;
    lastRun: string | null;
}

export interface Job {
    id: string;
    projectId?: string;
    type: string;
    status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
    createdAt: string;
    updatedAt: string;
}
