import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './store/ AuthProvider.jsx'
import GlobalProvider from './store/GLobalProviders.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <GlobalProvider>

  <AuthProvider>
    <App />
    
    </AuthProvider>
  </GlobalProvider>

    </BrowserRouter>
 
)
