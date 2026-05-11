// Importamos las dependencias necesarias para la aplicación, incluyendo React, ReactDOM, el proveedor de autenticación de Google y los estilos CSS
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// Definimos el ID de cliente para la autenticación con Google, que se obtiene de la consola de desarrolladores de Google
const CLIENT_ID = "8766145957-alckigh10m1hltgf32i4iqr1jbs8lvko.apps.googleusercontent.com";

// Renderizamos la aplicación dentro del proveedor de autenticación de Google para que los componentes hijos puedan acceder a las funcionalidades de inicio de sesión con Google
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
