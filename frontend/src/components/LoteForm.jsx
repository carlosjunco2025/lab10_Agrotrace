import { useState } from 'react'

const CAMPOS_INICIALES = {
  codigo_lote: '',
  toneladas_brutas: '',
  porcentaje_descarte: '0.00',
  fundo: '',
}

function LoteForm({ onGuardar, fundos, codigosExistentes }) {
  const [campos, setCampos] = useState(CAMPOS_INICIALES)
  const [errores, setErrores] = useState({})

  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setCampos((anteriores) => ({ ...anteriores, [name]: value }))

    // Al escribir se limpia el error de ese campo.
    if (errores[name]) {
      setErrores((anteriores) => ({ ...anteriores, [name]: undefined }))
    }
  }

  function manejarEnvio(evento) {
    evento.preventDefault()

    const nuevosErrores = {}
    const codigoNormalizado = campos.codigo_lote.trim().toUpperCase()
    const toneladas = Number(campos.toneladas_brutas)
    const descarte =
      campos.porcentaje_descarte.trim() === ''
        ? 0
        : Number(campos.porcentaje_descarte)

    // Regla 1: campo obligatorio y único (similar a codigo_lote unique=True).
    if (!codigoNormalizado) {
      nuevosErrores.codigo_lote = 'El código de lote es obligatorio.'
    } else if (
      codigosExistentes.some(
        (codigo) => codigo.toUpperCase() === codigoNormalizado,
      )
    ) {
      nuevosErrores.codigo_lote = 'Ya existe un lote con ese código.'
    }

    // Regla 2: número mayor que cero (validate_toneladas_brutas del serializer).
    if (
      campos.toneladas_brutas.trim() === '' ||
      !Number.isFinite(toneladas) ||
      toneladas <= 0
    ) {
      nuevosErrores.toneladas_brutas =
        'Las toneladas brutas deben ser un número mayor a 0.'
    }

    // Regla 3: porcentaje válido entre 0 y 100.
    if (
      !Number.isFinite(descarte) ||
      descarte < 0 ||
      descarte > 100
    ) {
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

    const fundoSeleccionado = fundos.find(
      (fundo) => fundo.id === Number(campos.fundo),
    )

    if (!fundoSeleccionado) {
      setErrores({ fundo: 'El fundo seleccionado no existe.' })
      return
    }

    // El formulario no guarda el registro: avisa al padre con onGuardar.
    onGuardar({
      codigo_lote: codigoNormalizado,
      toneladas_brutas: toneladas.toFixed(2),
      porcentaje_descarte: descarte.toFixed(2),
      estado_evaluacion: 'PENDIENTE',
      fecha_ingreso: new Date().toISOString(),
      fundo: fundoSeleccionado,
    })

    // Campos vacíos después de un alta válida.
    setCampos(CAMPOS_INICIALES)
    setErrores({})
  }

  return (
    <form className="panel-form" onSubmit={manejarEnvio} noValidate>
      {Object.keys(errores).length > 0 && (
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

      <button type="submit" className="button button--primary">
        Guardar lote
      </button>
    </form>
  )
}

export default LoteForm
