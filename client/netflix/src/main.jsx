import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './main.css'
import App from './App'

console.log("main.jsx: Starting application mount...");
const root = document.getElementById('root');

if (!root) {
  console.error("main.jsx: Root element not found!");
} else {
  console.log("main.jsx: Root element found, rendering...");
  createRoot(root).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}