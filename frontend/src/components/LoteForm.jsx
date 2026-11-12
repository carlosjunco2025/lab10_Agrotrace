import { useState } from 'react'

const CAMPOS_INICIALES = {
  codigo_lote: '',
  toneladas_brutas: '',
  porcentaje_descarte: '0.00',
  fundo: '',
}

function camposDesdeLote(lote) {
  if (!lote) return CAMPOS_INICIALES

  return {
    codigo_lote: lote.codigo_lote,
    toneladas_brutas: String(lote.toneladas_brutas),
    porcentaje_descarte: String(lote.porcentaje_descarte),
    fundo: String(lote.fundo?.id ?? ''),
  }
}

function LoteForm({
  onGuardar,
  fundos,
  codigosExistentes,
  loteEnEdicion,
  onCancelarEdicion,
}) {
  const [campos, setCampos] = useState(() => camposDesdeLote(loteEnEdicion))
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)

  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setCampos((anteriores) => ({ ...anteriores, [name]: value }))

    // Al escribir se limpia el error de ese campo.
    if (errores[name]) {
      setErrores((anteriores) => ({ ...anteriores, [name]: undefined }))
    }
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setErrores({})

    const nuevosErrores = {}
    const codigoNormalizado = campos.codigo_lote.trim().toUpperCase()
    const toneladas = Number(campos.toneladas_brutas)
    const descarte =
      campos.porcentaje_descarte.trim() === ''
        ? 0
        : Number(campos.porcentaje_descarte)
    const codigosAComparar = codigosExistentes.filter(
      (codigo) => codigo !== loteEnEdicion?.codigo_lote,
    )

    // Regla 1: campo obligatorio y único (codigo_lote unique=True).
    if (!codigoNormalizado) {
      nuevosErrores.codigo_lote = 'El código de lote es obligatorio.'
    } else if (
      codigosAComparar.some(
        (codigo) => codigo.toUpperCase() === codigoNormalizado,
      )
    ) {
      nuevosErrores.codigo_lote = 'Ya existe un lote con ese código.'
    }

    // Regla 2: número mayor que cero (validate_toneladas_brutas).
    if (
      campos.toneladas_brutas.trim() === '' ||
      !Number.isFinite(toneladas) ||
      toneladas <= 0
    ) {
      nuevosErrores.toneladas_brutas =
        'Las toneladas brutas deben ser un número mayor a 0.'
    }

    // Regla 3: porcentaje válido entre 0 y 100.
    if (!Number.isFinite(descarte) || descarte < 0 || descarte > 100) {
      nuevosErrores.porcentaje_descarte =
        'El porcentaje de descarte debe estar entre 0 y 100.'
    }

    // Regla 4: el lote debe pertenecer a un fundo existente.
    if (!campos.fundo) {
      nuevosErrores.fundo = 'Selecciona el fundo productor.'
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    setEnviando(true)

    try {
      // El padre decide POST o PATCH y devuelve los errores del serializer.
      const resultado = await onGuardar({
        codigo_lote: codigoNormalizado,
        toneladas_brutas: toneladas.toFixed(2),
        porcentaje_descarte: descarte.toFixed(2),
        fundo: campos.fundo,
      })

      if (!resultado.ok) {
        setErrores(resultado.errores ?? {})
        return
      }

      setCampos(CAMPOS_INICIALES)
      setErrores({})
    } finally {
      setEnviando(false)
    }
  }

  const errorGeneral = errores.general ?? errores.non_field_errors
  const estaEditando = Boolean(loteEnEdicion)

  return (
    <form className="panel-form" onSubmit={manejarEnvio} noValidate>
      {estaEditando && (
        <p className="form-alert form-alert--info" role="status">
          Editando <strong>{loteEnEdicion.codigo_lote}</strong>. El botón
          guardar enviará un PATCH.
        </p>
      )}

      {errorGeneral && (
        <p className="form-alert" role="alert">
          {errorGeneral}
        </p>
      )}

      {Object.keys(errores).filter(
        (campo) => errores[campo] && !['general', 'non_field_errors'].includes(campo),
      ).length > 0 && (
        <p className="form-alert" role="alert">
          Revisa los campos marcados antes de guardar.
        </p>
      )}

      <div className="form-grid">
        <label className="field field--full">
          <span>Código de lote *</span>
          <input
            type="text"
            name="codigo_lote"
            value={campos.codigo_lote}
            onChange={cambiarCampo}
            placeholder="LOT-2026-007"
            aria-invalid={Boolean(errores.codigo_lote)}
            autoComplete="off"
          />
          {errores.codigo_lote && (
            <small className="field-error" role="alert">
              {errores.codigo_lote}
            </small>
          )}
        </label>

        <label className="field">
          <span>Toneladas brutas *</span>
          <input
            type="number"
            name="toneladas_brutas"
            value={campos.toneladas_brutas}
            onChange={cambiarCampo}
            placeholder="10.00"
            min="0.01"
            step="0.01"
            aria-invalid={Boolean(errores.toneladas_brutas)}
          />
          {errores.toneladas_brutas && (
            <small className="field-error" role="alert">
              {errores.toneladas_brutas}
            </small>
          )}
        </label>

        <label className="field">
          <span>Descarte (%)</span>
          <input
            type="number"
            name="porcentaje_descarte"
            value={campos.porcentaje_descarte}
            onChange={cambiarCampo}
            placeholder="0.00"
            min="0"
            max="100"
            step="0.01"
            aria-invalid={Boolean(errores.porcentaje_descarte)}
          />
          {errores.porcentaje_descarte && (
            <small className="field-error" role="alert">
              {errores.porcentaje_descarte}
            </small>
          )}
        </label>

        <label className="field field--full">
          <span>Fundo productor *</span>
          <select
            name="fundo"
            value={campos.fundo}
            onChange={cambiarCampo}
            aria-invalid={Boolean(errores.fundo)}
          >
            <option value="">Selecciona un fundo</option>
            {fundos.map((fundo) => (
              <option key={fundo.id} value={fundo.id}>
                {fundo.nombre_fundo} · {Number(fundo.hectareas).toFixed(2)} ha
              </option>
            ))}
          </select>
          {errores.fundo && (
            <small className="field-error" role="alert">
              {errores.fundo}
            </small>
          )}
        </label>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="button button--primary"
          disabled={enviando}
        >
          {enviando
            ? 'Guardando...'
            : estaEditando
              ? 'Guardar cambios (PATCH)'
              : 'Guardar lote (POST)'}
        </button>

        {estaEditando && (
          <button
            type="button"
            className="button button--ghost"
            onClick={onCancelarEdicion}
            disabled={enviando}
          >
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  )
}

export default LoteForm
