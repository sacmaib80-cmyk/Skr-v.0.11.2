import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { useStore } from './store/useStore.js'
import './index.css'

// expose store for debugging / headless verification
if (typeof window !== 'undefined') window.sqStore = useStore

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
