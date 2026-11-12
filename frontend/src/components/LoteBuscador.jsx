function LoteBuscador({
  busqueda,
  onBusquedaChange,
  estado,
  onEstadoChange,
  resultados,
  total,
  onLimpiar,
}) {
  const filtrosActivos = busqueda !== '' || estado !== ''

  return (
    <section className="panel-card filter-panel" aria-labelledby="filtro-titulo">
      <div className="panel-card__head">
        <h2 id="filtro-titulo">Buscar y filtrar</h2>
        <span className="badge badge--neutral">
          {resultados} de {total}
        </span>
      </div>

      <label className="field">
        <span>Texto (código, fundo o estado)</span>
        <input
          type="search"
          value={busqueda}
          onChange={(evento) => onBusquedaChange(evento.target.value)}
          placeholder="Ej. LOT-2026 o Santa Elena"
          aria-label="Buscar lotes por texto"
        />
      </label>

      <label className="field">
        <span>Estado de evaluación</span>
        <select
          value={estado}
          onChange={(evento) => onEstadoChange(evento.target.value)}
          aria-label="Filtrar lotes por estado"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="PROCESADO">Procesado</option>
        </select>
      </label>

      <button
        type="button"
        className="button button--ghost button--sm"
        onClick={onLimpiar}
        disabled={!filtrosActivos}
      >
        Limpiar filtros
      </button>
    </section>
  )
}

export default LoteBuscador
