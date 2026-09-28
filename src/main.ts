import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById('app')

if (!rootElement) {
  throw new Error('Elemento raiz da aplicacao nao encontrado.')
}

createRoot(rootElement).render(
  React.createElement(React.StrictMode, null, React.createElement(App)),
)
