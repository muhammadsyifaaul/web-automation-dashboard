import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
        
    </React.StrictMode>,
)
console.log('API_URL:', import.meta.env.VITE_API_URL);
console.log('ENV:', import.meta.env.VITE_ENV);
