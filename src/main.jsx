
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { ModulePermissionProvider } from './context/ModulePermissionContext.jsx'

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
    <ModulePermissionProvider>
    <App />

    </ModulePermissionProvider>
    </Provider>
    
  
 
)
