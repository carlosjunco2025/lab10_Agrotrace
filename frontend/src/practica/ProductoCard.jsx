function ProductoCard({ producto, onAgregar }) {
  const agotado = producto.stock === 0

  return (
    <article
      className={`product-card${agotado ? ' product-card--agotado' : ''}`}
    >
      <div className="product-card__top">
        <span className="product-avatar" aria-hidden="true">
          {producto.nombre.charAt(0)}
        </span>
        <span className={`badge ${agotado ? 'badge--danger' : 'badge--ok'}`}>
          {agotado ? 'Agotado' : `${producto.stock} en stock`}
        </span>
      </div>

      <h3>{producto.nombre}</h3>
      <p className="product-price">S/ {Number(producto.precio).toFixed(2)}</p>

      <button
        type="button"
        className="button button--primary"
        onClick={() => onAgregar(producto)}
        disabled={agotado}
      >
        {agotado ? 'Agotado' : 'Agregar'}
      </button>
    </article>
  )
}

export default ProductoCard
