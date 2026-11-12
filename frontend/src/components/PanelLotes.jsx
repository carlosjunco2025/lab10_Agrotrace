import { useEffect, useState } from 'react'
import api, { mensajeDeError, normalizarErrores } from '../api.js'
import LoteBuscador from './LoteBuscador.jsx'
import LoteForm from './LoteForm.jsx'
import LoteList from './LoteList.jsx'
import ResumenLotes from './ResumenLotes.jsx'
import { SIGUIENTE_ESTADO } from './loteUtils.js'
import './panel.css'

// El serializer devuelve los decimales como texto (por ejemplo "12.50").
// El adaptador los convierte a Number para que las operaciones aritméticas
// del resumen y de la tabla sean seguras.
function normalizarFundo(fundo) {
  if (!fundo) return fundo

  return {
    ...fundo,
    hectareas: Number(fundo.hectareas),
  }
}

function normalizarLote(lote) {
  return {
    ...lote,
    toneladas_brutas: Number(lote.toneladas_brutas),
    porcentaje_descarte: Number(lote.porcentaje_descarte),
    fundo: normalizarFundo(lote.fundo),
  }
}

function PanelLotes() {
  const [lotes, setLotes] = useState([])
  const [fundos, setFundos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorFundos, setErrorFundos] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [loteEnEdicion, setLoteEnEdicion] = useState(null)
  const [aviso, setAviso] = useState('')
  const [recarga, setRecarga] = useState(0)

  // GET de fundos una sola vez: alimenta el <select> del formulario.
  useEffect(() => {
    const controlador = new AbortController()

    async function cargarFundos() {
      try {
        const respuesta = await api.get('fundos/', {
          signal: controlador.signal,
        })
        setFundos(respuesta.data.map(normalizarFundo))
      } catch (err) {
        if (err.code === 'ERR_CANCELED') return
        setErrorFundos('No se pudo cargar el catálogo de fundos.')
        console.error('[PanelLotes] GET /fundos/', err)
      }
    }

    cargarFundos()
    return () => controlador.abort()
  }, [])

  // GET de lotes cada vez que cambia el texto, el estado o se pide recargar.
  // Ejercicio 11: búsqueda y filtro combinados en una sola petición.
  useEffect(() => {
    const controlador = new AbortController()

    async function cargarLotes() {
      setCargando(true)
      setError('')

      try {
        const respuesta = await api.get('lotes-detallados/', {
          params: {
            search: busqueda,
            estado: filtroEstado,
          },
          signal: controlador.signal,
        })
        setLotes(respuesta.data.map(normalizarLote))
      } catch (err) {
        if (err.code === 'ERR_CANCELED') return
        setError(
          'No se pudieron cargar los lotes. Revisa que Django esté encendido en el puerto 8000.',
        )
        console.error('[PanelLotes] GET /lotes-detallados/', err)
      } finally {
        if (!controlador.signal.aborted) setCargando(false)
      }
    }

    const temporizador = setTimeout(cargarLotes, 250)

    return () => {
      clearTimeout(temporizador)
      controlador.abort()
    }
  }, [busqueda, filtroEstado, recarga])

  useEffect(() => {
    document.title = `AgroTrace · ${lotes.length} lotes`
  }, [lotes.length])

  // POST o PATCH según haya un lote en edición. Devuelve el resultado al
  // formulario para que pinte los errores 400 del serializer.
  async function guardarLote(datos) {
    setAviso('')
    const fundoSeleccionado = fundos.find(
      (fundo) => fundo.id === Number(datos.fundo),
    )

    const payload = {
      codigo_lote: datos.codigo_lote,
      toneladas_brutas: datos.toneladas_brutas,
      porcentaje_descarte: datos.porcentaje_descarte,
      estado_evaluacion: loteEnEdicion
        ? loteEnEdicion.estado_evaluacion
        : 'PENDIENTE',
      fundo: Number(datos.fundo),
    }

    try {
      if (loteEnEdicion) {
        const respuesta = await api.patch(
          `lotes/${loteEnEdicion.id}/`,
          payload,
        )

        // 200 OK: map() reemplaza solo la fila editada.
        setLotes((registros) =>
          registros.map((lote) =>
            lote.id === loteEnEdicion.id
              ? normalizarLote({
                  ...lote,
                  ...respuesta.data,
                  fundo: fundoSeleccionado,
                })
              : lote,
          ),
        )
        setLoteEnEdicion(null)
        setAviso(`Lote ${payload.codigo_lote} actualizado (HTTP 200).`)
        return { ok: true }
      }

      const respuesta = await api.post('lotes/', payload)

      // 201 Created: arreglo nuevo con spread.
      setLotes((registros) => [
        ...registros,
        normalizarLote({
          ...respuesta.data,
          fecha_ingreso: new Date().toISOString(),
          fundo: fundoSeleccionado,
        }),
      ])
      setAviso(`Lote ${payload.codigo_lote} creado (HTTP 201).`)
      return { ok: true }
    } catch (err) {
      console.error('[PanelLotes] guardar lote', err)

      if (err.response?.status === 400) {
        return { ok: false, errores: normalizarErrores(err.response) }
      }

      return {
        ok: false,
        errores: { general: mensajeDeError(err, 'No se pudo guardar el lote.') },
      }
    }
  }

  // PATCH de la acción rápida de estado.
  async function cambiarEstado(id) {
    const lote = lotes.find((registro) => registro.id === id)
    if (!lote) return

    setAviso('')

    try {
      const respuesta = await api.patch(`lotes/${id}/`, {
        estado_evaluacion: SIGUIENTE_ESTADO[lote.estado_evaluacion],
      })

      const actualizado = normalizarLote({ ...lote, ...respuesta.data })
      setLotes((registros) =>
        registros.map((registro) =>
          registro.id === id ? actualizado : registro,
        ),
      )
      setLoteEnEdicion((enEdicion) =>
        enEdicion?.id === id ? actualizado : enEdicion,
      )
      setAviso(`Estado de ${lote.codigo_lote} actualizado (HTTP 200).`)
    } catch (err) {
      if (err.response?.status === 404) {
        setLotes((registros) =>
          registros.filter((registro) => registro.id !== id),
        )
        setAviso(
          `El lote ${lote.codigo_lote} ya no existe en el servidor (HTTP 404) y se quitó de la tabla.`,
        )
      } else {
        setAviso(mensajeDeError(err, 'No se pudo cambiar el estado.'))
      }
      console.error('[PanelLotes] PATCH estado', err)
    }
  }

  // Ejercicio 12: DELETE con confirmación y manejo explícito del 404.
  async function eliminarLote(id) {
    const lote = lotes.find((registro) => registro.id === id)
    if (!lote) return

    const confirmado = window.confirm(
      `¿Eliminar el lote "${lote.codigo_lote}" del fundo ${lote.fundo.nombre_fundo}?`,
    )

    if (!confirmado) return

    setAviso('')

    try {
      const respuesta = await api.delete(`lotes/${id}/`)

      if (respuesta.status === 204) {
        setLotes((registros) =>
          registros.filter((registro) => registro.id !== id),
        )
        if (loteEnEdicion?.id === id) setLoteEnEdicion(null)
        setAviso(`Lote ${lote.codigo_lote} eliminado (HTTP 204).`)
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setLotes((registros) =>
          registros.filter((registro) => registro.id !== id),
        )
        if (loteEnEdicion?.id === id) setLoteEnEdicion(null)
        setAviso(
          `El lote ${lote.codigo_lote} ya no existía en el servidor (HTTP 404). Se sincronizó la tabla.`,
        )
      } else {
        setAviso(mensajeDeError(err, 'No se pudo eliminar el lote.'))
      }
      console.error('[PanelLotes] DELETE /lotes/', err)
    }
  }

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroEstado('')
  }

  const pendientes = lotes.filter(
    (lote) => lote.estado_evaluacion === 'PENDIENTE',
  ).length

  return (
    <div className="module">
      <header className="module-header">
        <div>
          <p className="eyebrow">Parte 2 · Panel administrativo AgroTrace</p>
          <h1>Lotes recepcionados</h1>
          <p className="module-intro">
            Gestión real de <code>LoteRecepcionado</code> contra{' '}
            <code>/api/lotes-detallados/</code>. El estado vive en{' '}
            <code>PanelLotes</code> y los hijos solo lo leen o avisan cambios.
          </p>
        </div>
        <span className="pill">
          {cargando ? 'Consultando API...' : 'API real · CORS activo'}
        </span>
      </header>

      {aviso && (
        <aside className="global-alert" role="status">
          <span className="alert-icon" aria-hidden="true">
            i
          </span>
          <p>{aviso}</p>
        </aside>
      )}

      {errorFundos && (
        <aside className="global-alert" role="alert">
          <span className="alert-icon" aria-hidden="true">
            !
          </span>
          <p>{errorFundos}</p>
        </aside>
      )}

      <ResumenLotes lotes={lotes} />

      {pendientes > 0 && (
        <aside className="global-alert" role="status">
          <span className="alert-icon" aria-hidden="true">
            !
          </span>
          <p>
            Hay <strong>{pendientes}</strong>{' '}
            {pendientes === 1 ? 'lote pendiente' : 'lotes pendientes'} de
            evaluación en la vista actual.
          </p>
        </aside>
      )}

      <div className="management-grid">
        <section className="panel-card" aria-labelledby="form-titulo">
          <div className="panel-card__head">
            <h2 id="form-titulo">
              {loteEnEdicion ? 'Editar lote' : 'Registrar lote'}
            </h2>
            <span className="badge badge--neutral">
              {loteEnEdicion ? 'PATCH' : 'POST'}
            </span>
          </div>
          <LoteForm
            key={loteEnEdicion?.id ?? 'nuevo'}
            onGuardar={guardarLote}
            fundos={fundos}
            codigosExistentes={lotes.map((lote) => lote.codigo_lote)}
            loteEnEdicion={loteEnEdicion}
            onCancelarEdicion={() => setLoteEnEdicion(null)}
          />
        </section>

        <LoteBuscador
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          estado={filtroEstado}
          onEstadoChange={setFiltroEstado}
          resultados={lotes.length}
          onLimpiar={limpiarFiltros}
        />
      </div>

      <section className="section-heading">
        <div>
          <p className="eyebrow">Listado y acciones</p>
          <h2>Lotes del periodo</h2>
        </div>
        <span className="record-count">
          {cargando ? 'Cargando...' : `${lotes.length} lotes en la vista`}
        </span>
      </section>

      {cargando && lotes.length === 0 && (
        <div className="empty-state" role="status">
          <span aria-hidden="true">…</span>
          <p>Cargando...</p>
          <small>Consultando GET /api/lotes-detallados/</small>
        </div>
      )}

      {!cargando && error && (
        <div className="empty-state" role="alert">
          <span aria-hidden="true">!</span>
          <p>{error}</p>
          <small>
            Enciende Django con <code>python manage.py runserver</code> y pulsa
            recargar.
          </small>
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={() => setRecarga((valor) => valor + 1)}
            style={{ marginTop: '12px' }}
          >
            Recargar
          </button>
        </div>
      )}

      {!cargando && !error && lotes.length === 0 && (
        <div className="empty-state" role="status">
          <span aria-hidden="true">∅</span>
          <p>No hay lotes que coincidan con la búsqueda.</p>
          <small>Cambia el texto, el estado o registra un lote nuevo.</small>
        </div>
      )}

      {!error && lotes.length > 0 && (
        <LoteList
          lotes={lotes}
          onCambiarEstado={cambiarEstado}
          onEliminar={eliminarLote}
          onEditar={setLoteEnEdicion}
        />
      )}

      <p className="module-note">
        Búsqueda y filtro viajan juntos:{' '}
        <code>{'params: { search, estado }'}</code>. Los datos se normalizan con{' '}
        <code>Number()</code> antes de calcular el resumen.
      </p>
    </div>
  )
}

export default PanelLotes
