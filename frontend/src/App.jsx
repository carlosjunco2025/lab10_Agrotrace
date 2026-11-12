import { useState } from 'react'
import './App.css'
import ListaPractica from './practica/ListaPractica.jsx'
import PanelLotes from './components/PanelLotes.jsx'

const PARTES = [
  {
    id: 'practica',
    indice: '01',
    etiqueta: 'Parte 1 · Lista',
  },
  {
    id: 'panel',
    indice: '02',
    etiqueta: 'Parte 2 · Panel',
  },
]

function App() {
  const [parte, setParte] = useState('practica')

  return (
    <div className="app-shell">
      <nav className="app-nav" aria-label="Navegación del laboratorio">
        <div className="app-nav__inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              AT
            </span>
            <div>
              <strong>AgroTrace</strong>
              <span>Semana 12 · React + Axios + Django REST</span>
            </div>
          </div>

          <div className="app-tabs" role="group" aria-label="Partes del laboratorio">
            {PARTES.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                className={`app-tab${
                  parte === opcion.id ? ' app-tab--active' : ''
                }`}
                aria-pressed={parte === opcion.id}
                onClick={() => setParte(opcion.id)}
              >
                <span className="tab-index" aria-hidden="true">
                  {opcion.indice}
                </span>
                {opcion.etiqueta}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="app-main">
        {parte === 'practica' ? <ListaPractica /> : <PanelLotes />}
      </main>

      <footer className="app-footer">
        <span>AgroTrace · Desarrollo de Aplicaciones Empresariales</span>
        <span>Laboratorio 12 · Consumo de API REST con Axios y CORS</span>
      </footer>
    </div>
  )
}

export default App
