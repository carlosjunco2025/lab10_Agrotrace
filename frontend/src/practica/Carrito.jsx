import { useEffect } from 'react'

function Carrito({ lineas, onQuitar, onVaciar }) {
  // Datos derivados: se recalculan en cada render y no usan useState.
  const cantidadTotal = lineas.reduce(
    (total, linea) => total + linea.cantidad,
    0,
  )
  const totalPagar = lineas.reduce(
    (total, linea) => total + Number(linea.precio) * linea.cantidad,
    0,
  )

  useEffect(() => {
    // Ciclo de vida: se ejecuta al montar y cada vez que cambia la cantidad.
    console.log(
      `[Carrito] efecto ejecutado (montaje o cambio). Unidades: ${cantidadTotal}`,
    )
    document.title = `Carrito (${cantidadTotal}) — Cafetería`

    return () => {
      // Limpieza: se ejecuta antes del siguiente efecto y al desmontar.
      console.log(
        `[Carrito] limpieza del efecto. Unidades que tenía: ${cantidadTotal}`,
      )
    }
  }, [cantidadTotal])

  return (
    <aside className="panel-card cart" aria-labelledby="carrito-titulo">
      <div className="panel-card__head">
        <h2 id="carrito-titulo">Carrito</h2>
        <span className="badge badge--neutral">{cantidadTotal} u.</span>
      </div>

      {lineas.length === 0 && (
        <p className="empty-state empty-state--compact">
          El carrito está vacío
        </p>
      )}

      {lineas.length > 0 && (
        <>
          <ul className="cart-list">
            {lineas.map((linea) => (
              <li key={linea.id} className="cart-line">
                <div className="cart-line__info">
                  <strong>{linea.nombre}</strong>
                  <span>
                    {linea.cantidad} × S/ {Number(linea.precio).toFixed(2)}
                  </span>
                </div>
                <div className="cart-line__side">
                  <strong>
                    S/ {(Number(linea.precio) * linea.cantidad).toFixed(2)}
                  </strong>
                  <button
                    type="button"
                    className="button button--ghost button--sm"
                    onClick={() => onQuitar(linea.id)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-total">
            <div>
              <span>Unidades</span>
              <strong>{cantidadTotal}</strong>
            </div>
            <div>
              <span>Total a pagar</span>
              <strong>S/ {totalPagar.toFixed(2)}</strong>
            </div>
          </div>

          <button
            type="button"
            className="button button--danger"
            onClick={onVaciar}
          >
            Vaciar carrito
          </button>
        </>
      )}
    </aside>
  )
}

export default Carrito
