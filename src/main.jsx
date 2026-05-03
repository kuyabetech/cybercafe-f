import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Configure axios base URL
const API_URL = import.meta.env.VITE_API_URL || 'https://cybercafe-b.onrender.com';
axios.defaults.baseURL = API_URL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
