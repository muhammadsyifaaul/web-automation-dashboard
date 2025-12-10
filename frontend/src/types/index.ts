export interface TestResult {
    id: string;
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
    total: number;
    passed: number;
    failed: number;
}


export interface ProjectCase {
    id: string;
    projectId: string;
    name: string;
    identifier: string;
    description: string;
    createdAt: string;
}
