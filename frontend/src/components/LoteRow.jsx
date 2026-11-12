import {
  ACCION_ESTADO,
  CLASE_ESTADO,
  ETIQUETAS_ESTADO,
  formatearFecha,
} from './loteUtils.js'

function LoteRow({ lote, onCambiarEstado, onEliminar }) {
  // La fila no modifica la lista: solo avisa al padre con las funciones
  // recibidas por props.
  return (
    <tr>
      <td data-label="Lote / Fundo">
        <strong>{lote.codigo_lote}</strong>
        <span className="cell-sub">{lote.fundo.nombre_fundo}</span>
      </td>
      <td data-label="Ingreso" className="cell-muted">
        {formatearFecha(lote.fecha_ingreso)}
      </td>
      <td data-label="Toneladas" className="cell-num">
        {Number(lote.toneladas_brutas).toFixed(2)} t
      </td>
      <td data-label="Descarte" className="cell-num">
        {Number(lote.porcentaje_descarte).toFixed(2)} %
      </td>
      <td data-label="Estado">
        <span
          className={`badge ${CLASE_ESTADO[lote.estado_evaluacion]}`}
        >
          {ETIQUETAS_ESTADO[lote.estado_evaluacion]}
        </span>
      </td>
      <td data-label="Acciones">
        <div className="row-actions">
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={() => onCambiarEstado(lote.id)}
          >
            {ACCION_ESTADO[lote.estado_evaluacion]}
          </button>
          <button
            type="button"
            className="button button--danger-ghost button--sm"
            onClick={() => onEliminar(lote.id)}
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  )
}

export default LoteRow
