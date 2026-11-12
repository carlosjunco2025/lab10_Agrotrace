import { useCallback, useState } from 'react'
import { productos } from './datos.js'
import Buscador from './Buscador.jsx'
import Catalogo from './Catalogo.jsx'
import Carrito from './Carrito.jsx'
import Aviso from './Aviso.jsx'
import './practica.css'

function Practica() {
  // Estado elevado: el carrito y el filtro viven aquí para compartirlos entre
  // componentes hermanos (Catalogo, Carrito y Buscador).
  const [carrito, setCarrito] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [aviso, setAviso] = useState(null)

  const cerrarAviso = useCallback(() => setAviso(null), [])

  // Dato derivado: no necesita un useState propio.
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre
      .toLocaleLowerCase('es')
      .includes(busqueda.trim().toLocaleLowerCase('es')),
  )

  function agregarAlCarrito(producto) {
    setCarrito((lineas) => {
      const yaExiste = lineas.some((linea) => linea.id === producto.id)

      if (yaExiste) {
        // Se crea un arreglo nuevo con map(); la línea modificada también es
        // un objeto nuevo para no mutar el estado anterior.
        return lineas.map((linea) =>
          linea.id === producto.id
            ? { ...linea, cantidad: linea.cantidad + 1 }
            : linea,
        )
      }

      // Arreglo nuevo con spread, sin push.
      return [
        ...lineas,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
        },
      ]
    })

    setAviso({ id: Date.now(), nombre: producto.nombre })
  }

  function quitarDelCarrito(id) {
    setCarrito((lineas) => lineas.filter((linea) => linea.id !== id))
  }

  function vaciarCarrito() {
    setCarrito([])
  }

  return (
    <div className="module">
      <header className="module-header">
        <div>
          <p className="eyebrow">Parte 1 · Comunicación entre componentes</p>
          <h1>Mini catálogo de cafetería</h1>
          <p className="module-intro">
            El estado del carrito y del buscador vive en <code>Practica</code> y
            baja por props; los hijos avisan con funciones recibidas por props.
          </p>
        </div>
        <span className="pill">Datos mock · Soles peruanos</span>
      </header>

      <section className="practica-toolbar" aria-label="Filtro del catálogo">
        <Buscador valor={busqueda} onCambiar={setBusqueda} />
        <p className="toolbar-note">
          Mostrando <strong>{productosFiltrados.length}</strong> de{' '}
          <strong>{productos.length}</strong> productos
        </p>
      </section>

      <div className="practica-grid">
        <section className="panel-card" aria-labelledby="catalogo-titulo">
          <div className="panel-card__head">
            <h2 id="catalogo-titulo">Catálogo</h2>
            <span className="badge badge--neutral">Precios en S/</span>
          </div>
          <Catalogo
            productos={productosFiltrados}
            onAgregar={agregarAlCarrito}
          />
        </section>

        <Carrito
          lineas={carrito}
          onQuitar={quitarDelCarrito}
          onVaciar={vaciarCarrito}
        />
      </div>

      <Aviso aviso={aviso} onCerrar={cerrarAviso} />
    </div>
  )
}

export default Practica
