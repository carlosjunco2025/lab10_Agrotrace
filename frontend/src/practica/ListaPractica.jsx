import { useEffect, useState } from 'react'
import api, { mensajeDeError, normalizarErrores } from '../api.js'
import '../components/panel.css'

const CAMPOS_INICIALES = {
  nombre_fundo: '',
  propietario_dni_ruc: '',
  hectareas: '',
  cupo_diario_lotes: '10',
  valido_exportacion: false,
}

function ListaPractica() {
  const [fundos, setFundos] = useState([])
  const [buscar, setBuscar] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [campos, setCampos] = useState(CAMPOS_INICIALES)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [editandoId, setEditandoId] = useState(null)

  // Ejercicio 4 y 8: GET inicial y nueva búsqueda cuando cambia [buscar].
  useEffect(() => {
    const controlador = new AbortController()

    async function cargarFundos() {
      setCargando(true)
      setError('')

      try {
        const respuesta = await api.get('fundos/', {
          params: { search: buscar },
          signal: controlador.signal,
        })
        setFundos(respuesta.data)
      } catch (err) {
        if (err.code === 'ERR_CANCELED') return
        setError('No se pudo cargar la lista de fundos.')
        console.error('[ListaPractica] GET /fundos/', err)
      } finally {
        if (!controlador.signal.aborted) setCargando(false)
      }
    }

    const temporizador = setTimeout(cargarFundos, 250)

    return () => {
      clearTimeout(temporizador)
      controlador.abort()
    }
  }, [buscar])

  // Ejercicio 4 y 5: formulario controlado con POST.
  function cambiarCampo(evento) {
    const { name, value, type, checked } = evento.target
    setCampos((anteriores) => ({
      ...anteriores,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errores[name]) {
      setErrores((anteriores) => ({ ...anteriores, [name]: undefined }))
    }
  }

  async function crearFundo(evento) {
    evento.preventDefault()
    setErrores({})
    setAviso('')

    const hectareas = Number(campos.hectareas)
    const cupo = Number(campos.cupo_diario_lotes)
    const erroresLocales = {}

    if (!campos.nombre_fundo.trim()) {
      erroresLocales.nombre_fundo = 'El nombre del fundo es obligatorio.'
    }
    if (!campos.propietario_dni_ruc.trim()) {
      erroresLocales.propietario_dni_ruc = 'El DNI o RUC es obligatorio.'
    }
    if (!Number.isFinite(hectareas) || hectareas <= 0) {
      erroresLocales.hectareas = 'Las hectáreas deben ser mayores a 0.'
    }
    if (!Number.isInteger(cupo) || cupo <= 0) {
      erroresLocales.cupo_diario_lotes = 'El cupo debe ser un entero mayor a 0.'
    }

    if (Object.keys(erroresLocales).length > 0) {
      setErrores(erroresLocales)
      return
    }

    setGuardando(true)

    try {
      const respuesta = await api.post('fundos/', {
        nombre_fundo: campos.nombre_fundo.trim(),
        propietario_dni_ruc: campos.propietario_dni_ruc.trim(),
        hectareas: hectareas.toFixed(2),
        cupo_diario_lotes: cupo,
        valido_exportacion: campos.valido_exportacion,
      })

      // 201 Created: se agrega con un arreglo nuevo (spread).
      setFundos((registros) => [...registros, respuesta.data])
      setCampos(CAMPOS_INICIALES)
      setAviso(`Fundo creado correctamente (HTTP ${respuesta.status}).`)
    } catch (err) {
      if (err.response?.status === 400) {
        // Errores de validación del serializer de Django.
        setErrores(normalizarErrores(err.response))
      } else {
        setErrores({ general: mensajeDeError(err) })
      }
      console.error('[ListaPractica] POST /fundos/', err)
    } finally {
      setGuardando(false)
    }
  }

  // Ejercicio 7: PATCH de edición rápida (alternar exportación).
  async function alternarExportacion(fundo) {
    setAviso('')
    setEditandoId(fundo.id)

    try {
      const respuesta = await api.patch(`fundos/${fundo.id}/`, {
        valido_exportacion: !fundo.valido_exportacion,
      })

      // 200 OK: se reemplaza el registro con map().
      setFundos((registros) =>
        registros.map((registro) =>
          registro.id === fundo.id ? respuesta.data : registro,
        ),
      )
      setAviso(`Fundo ${fundo.nombre_fundo} actualizado (HTTP 200).`)
    } catch (err) {
      setAviso(mensajeDeError(err, 'No se pudo actualizar el fundo.'))
      console.error('[ListaPractica] PATCH /fundos/', err)
    } finally {
      setEditandoId(null)
    }
  }

  // Ejercicio 6: DELETE por fila con filter() al recibir 204.
  async function eliminarFundo(fundo) {
    const confirmado = window.confirm(
      `¿Eliminar el fundo "${fundo.nombre_fundo}"? Esta acción no se puede deshacer.`,
    )

    if (!confirmado) return

    setAviso('')

    try {
      const respuesta = await api.delete(`fundos/${fundo.id}/`)

      if (respuesta.status === 204) {
        setFundos((registros) =>
          registros.filter((registro) => registro.id !== fundo.id),
        )
        setAviso('Fundo eliminado (HTTP 204).')
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setFundos((registros) =>
          registros.filter((registro) => registro.id !== fundo.id),
        )
        setAviso('El fundo ya no existía en el servidor (HTTP 404). Se quitó de la lista.')
      } else {
        setAviso(
          mensajeDeError(err, 'No se pudo eliminar el fundo seleccionado.'),
        )
      }
      console.error('[ListaPractica] DELETE /fundos/', err)
    }
  }

  const filtrosActivos = buscar !== ''

  return (
    <div className="module">
      <header className="module-header">
        <div>
          <p className="eyebrow">Parte 1 · Ajax con Axios</p>
          <h1>Fundos productores</h1>
          <p className="module-intro">
            Ejercicios 4 al 8: <code>GET</code>, <code>POST</code>,{' '}
            <code>PATCH</code>, <code>DELETE</code> y <code>?search=</code>{' '}
            contra <code>http://127.0.0.1:8000/api/fundos/</code>.
          </p>
        </div>
        <span className="pill">Axios · API real</span>
      </header>

      {aviso && (
        <aside className="global-alert" role="status">
          <span className="alert-icon" aria-hidden="true">
            i
          </span>
          <p>{aviso}</p>
        </aside>
      )}

      <div className="management-grid">
        <section className="panel-card" aria-labelledby="practica-form-titulo">
          <div className="panel-card__head">
            <h2 id="practica-form-titulo">Nuevo fundo</h2>
            <span className="badge badge--neutral">POST</span>
          </div>

          <form className="panel-form" onSubmit={crearFundo} noValidate>
            {errores.general && (
              <p className="form-alert" role="alert">
                {errores.general}
              </p>
            )}

            <div className="form-grid">
              <label className="field field--full">
                <span>Nombre del fundo *</span>
                <input
                  type="text"
                  name="nombre_fundo"
                  value={campos.nombre_fundo}
                  onChange={cambiarCampo}
                  placeholder="Fundo Santa Elena"
                  aria-invalid={Boolean(errores.nombre_fundo)}
                  autoComplete="off"
                />
                {errores.nombre_fundo && (
                  <small className="field-error">{errores.nombre_fundo}</small>
                )}
              </label>

              <label className="field">
                <span>DNI / RUC *</span>
                <input
                  type="text"
                  name="propietario_dni_ruc"
                  value={campos.propietario_dni_ruc}
                  onChange={cambiarCampo}
                  placeholder="20481234567"
                  aria-invalid={Boolean(errores.propietario_dni_ruc)}
                  autoComplete="off"
                />
                {errores.propietario_dni_ruc && (
                  <small className="field-error">
                    {errores.propietario_dni_ruc}
                  </small>
                )}
              </label>

              <label className="field">
                <span>Hectáreas *</span>
                <input
                  type="number"
                  name="hectareas"
                  value={campos.hectareas}
                  onChange={cambiarCampo}
                  placeholder="48.50"
                  min="0.01"
                  step="0.01"
                  aria-invalid={Boolean(errores.hectareas)}
                />
                {errores.hectareas && (
                  <small className="field-error">{errores.hectareas}</small>
                )}
              </label>

              <label className="field">
                <span>Cupo diario de lotes *</span>
                <input
                  type="number"
                  name="cupo_diario_lotes"
                  value={campos.cupo_diario_lotes}
                  onChange={cambiarCampo}
                  min="1"
                  step="1"
                  aria-invalid={Boolean(errores.cupo_diario_lotes)}
                />
                {errores.cupo_diario_lotes && (
                  <small className="field-error">
                    {errores.cupo_diario_lotes}
                  </small>
                )}
              </label>

              <label className="field field--full field--check">
                <input
                  type="checkbox"
                  name="valido_exportacion"
                  checked={campos.valido_exportacion}
                  onChange={cambiarCampo}
                />
                <span>Válido para exportación</span>
              </label>
            </div>

            <button
              type="submit"
              className="button button--primary"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar fundo (POST)'}
            </button>
          </form>
        </section>

        <section className="panel-card filter-panel" aria-labelledby="practica-filtro">
          <div className="panel-card__head">
            <h2 id="practica-filtro">Buscar</h2>
            <span className="badge badge--neutral">GET</span>
          </div>

          <label className="field">
            <span>Texto (nombre o DNI/RUC)</span>
            <input
              type="search"
              value={buscar}
              onChange={(evento) => setBuscar(evento.target.value)}
              placeholder="Ej. Santa Elena o 2048"
              aria-label="Buscar fundos por texto"
            />
          </label>

          <button
            type="button"
            className="button button--ghost button--sm"
            onClick={() => setBuscar('')}
            disabled={!filtrosActivos}
          >
            Limpiar búsqueda
          </button>

          <p className="module-note">
            Cada cambio envía <code>params: {'{ search: buscar }'}</code> al
            servidor.
          </p>
        </section>
      </div>

      <section className="section-heading">
        <div>
          <p className="eyebrow">Listado</p>
          <h2>Fundos registrados</h2>
        </div>
        <span className="record-count">{fundos.length} registros</span>
      </section>

      {cargando && (
        <div className="empty-state" role="status">
          <span aria-hidden="true">…</span>
          <p>Cargando...</p>
          <small>Consultando GET /api/fundos/</small>
        </div>
      )}

      {!cargando && error && (
        <div className="empty-state" role="alert">
          <span aria-hidden="true">!</span>
          <p>{error}</p>
          <small>Revisa que Django esté corriendo en el puerto 8000.</small>
        </div>
      )}

      {!cargando && !error && fundos.length === 0 && (
        <div className="empty-state" role="status">
          <span aria-hidden="true">∅</span>
          <p>No hay fundos que coincidan con la búsqueda.</p>
          <small>Prueba con otro texto o registra un fundo nuevo.</small>
        </div>
      )}

      {!cargando && !error && fundos.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Fundo</th>
                <th scope="col">DNI / RUC</th>
                <th scope="col">Hectáreas</th>
                <th scope="col">Cupo</th>
                <th scope="col">Exportación</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fundos.map((fundo) => (
                <tr key={fundo.id}>
                  <td data-label="Fundo">
                    <strong>{fundo.nombre_fundo}</strong>
                    <span className="cell-sub">ID {fundo.id}</span>
                  </td>
                  <td data-label="DNI / RUC" className="cell-muted">
                    {fundo.propietario_dni_ruc}
                  </td>
                  <td data-label="Hectáreas" className="cell-num">
                    {Number(fundo.hectareas).toFixed(2)} ha
                  </td>
                  <td data-label="Cupo" className="cell-num">
                    {fundo.cupo_diario_lotes}
                  </td>
                  <td data-label="Exportación">
                    <span
                      className={`badge ${
                        fundo.valido_exportacion
                          ? 'badge--done'
                          : 'badge--pending'
                      }`}
                    >
                      {fundo.valido_exportacion ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <div className="row-actions">
                      <button
                        type="button"
                        className="button button--secondary button--sm"
                        onClick={() => alternarExportacion(fundo)}
                        disabled={editandoId === fundo.id}
                      >
                        {editandoId === fundo.id
                          ? 'Actualizando...'
                          : fundo.valido_exportacion
                            ? 'Quitar exportación'
                            : 'Marcar exportación'}
                      </button>
                      <button
                        type="button"
                        className="button button--danger-ghost button--sm"
                        onClick={() => eliminarFundo(fundo)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="module-note">
        Esta tabla usa <code>filter()</code> al eliminar y <code>map()</code> al
        editar, sin mutar el estado de React.
      </p>
    </div>
  )
}

export default ListaPractica
