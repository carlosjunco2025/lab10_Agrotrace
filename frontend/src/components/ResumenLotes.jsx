import {
  CLASE_ESTADO,
  ETIQUETAS_ESTADO,
} from './loteUtils.js'

function ResumenLotes({ lotes }) {
  // Todos los valores son datos derivados: se calculan en cada render y no
  // necesitan useState propio.
  const totalRegistros = lotes.length
  const toneladasTotales = lotes.reduce(
    (total, lote) => total + Number(lote.toneladas_brutas),
    0,
  )
  const descartePromedio =
    totalRegistros === 0
      ? 0
      : lotes.reduce(
          (total, lote) => total + Number(lote.porcentaje_descarte),
          0,
        ) / totalRegistros

  const conteoPorEstado = lotes.reduce((conteo, lote) => {
    const estado = lote.estado_evaluacion

    return { ...conteo, [estado]: (conteo[estado] || 0) + 1 }
  }, {})

  return (
    <section className="summary-section" aria-labelledby="resumen-titulo">
      <div className="summary-heading">
        <div>
          <p className="eyebrow">Resumen hermano del listado</p>
          <h2 id="resumen-titulo">Indicadores del panel</h2>
        </div>
        <span className="summary-caption">
          Calculado sobre el estado completo: {totalRegistros} registros
        </span>
      </div>

      <div className="summary-grid">
        <article className="summary-card">
          <span className="summary-label">Total de lotes</span>
          <strong>{totalRegistros}</strong>
          <span className="summary-footnote">registros en el periodo</span>
        </article>
        <article className="summary-card">
          <span className="summary-label">Toneladas brutas</span>
          <strong>{toneladasTotales.toFixed(2)} t</strong>
          <span className="summary-footnote">suma con reduce()</span>
        </article>
        <article className="summary-card">
          <span className="summary-label">Descarte promedio</span>
          <strong>{descartePromedio.toFixed(2)} %</strong>
          <span className="summary-footnote">promedio del panel</span>
        </article>
        <article className="summary-card summary-card--estados">
          <span className="summary-label">Lotes por estado</span>
          <div className="estado-counts">
            {Object.entries(ETIQUETAS_ESTADO).map(([clave, etiqueta]) => (
              <span key={clave} className={`badge ${CLASE_ESTADO[clave]}`}>
                {etiqueta}: {conteoPorEstado[clave] || 0}
              </span>
            ))}
          </div>
          <span className="summary-footnote">conteo derivado</span>
        </article>
      </div>
    </section>
  )
}

export default ResumenLotes
