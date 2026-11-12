import ProductoCard from './ProductoCard.jsx'

function Catalogo({ productos, onAgregar }) {
  // El filtro se aplica en Practica; aquí solo se recibe el arreglo ya filtrado.
  if (productos.length === 0) {
    return (
      <div className="empty-state" role="status">
        <span aria-hidden="true">⌕</span>
        <p>No hay productos que coincidan</p>
        <small>Prueba con otro nombre o borra la búsqueda.</small>
      </div>
    )
  }

  return (
    <div className="product-grid">
      {productos.map((producto) => (
        <ProductoCard
          key={producto.id}
          producto={producto}
          onAgregar={onAgregar}
        />
      ))}
    </div>
  )
}

export default Catalogo
