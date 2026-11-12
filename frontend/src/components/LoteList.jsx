import LoteRow from './LoteRow.jsx'

function LoteList({ lotes, onCambiarEstado, onEliminar, onEditar }) {
  if (lotes.length === 0) {
    return (
      <div className="empty-state empty-state--panel" role="status">
        <span aria-hidden="true">⌕</span>
        <p>No hay lotes que coincidan con la búsqueda.</p>
        <small>Cambia el texto o el estado seleccionado.</small>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Lote / Fundo</th>
            <th scope="col">Ingreso</th>
            <th scope="col">Toneladas</th>
            <th scope="col">Descarte</th>
            <th scope="col">Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lotes.map((lote) => (
            <LoteRow
              key={lote.id}
              lote={lote}
              onCambiarEstado={onCambiarEstado}
              onEliminar={onEliminar}
              onEditar={onEditar}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LoteList
