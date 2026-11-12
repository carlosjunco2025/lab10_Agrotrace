import { useEffect, useState } from 'react'
import LoteBuscador from './LoteBuscador.jsx'
import LoteForm from './LoteForm.jsx'
import LoteList from './LoteList.jsx'
import ResumenLotes from './ResumenLotes.jsx'
import { ETIQUETAS_ESTADO, SIGUIENTE_ESTADO } from './loteUtils.js'
import './panel.css'

// Fundos de ejemplo con la forma que devuelve FundoProductorSerializer
// (Semana 8): los decimales viajan como texto.
const fundosIniciales = [
  {
    id: 1,
    nombre_fundo: 'Fundo Santa Elena',
    propietario_dni_ruc: '20481234567',
    hectareas: '48.50',
    valido_exportacion: true,
    cupo_diario_lotes: 12,
  },
  {
    id: 2,
    nombre_fundo: 'Fundo Valle Verde',
    propietario_dni_ruc: '45872136',
    hectareas: '32.00',
    valido_exportacion: false,
    cupo_diario_lotes: 3,
  },
  {
    id: 3,
    nombre_fundo: 'Fundo Los Olivos',
    propietario_dni_ruc: '20567891234',
    hectareas: '65.75',
    valido_exportacion: true,
    cupo_diario_lotes: 8,
  },
  {
    id: 4,
    nombre_fundo: 'Fundo La Esperanza',
    propietario_dni_ruc: '20601234567',
    hectareas: '24.00',
    valido_exportacion: true,
    cupo_diario_lotes: 6,
  },
]

// Registros iniciales con la forma de LoteDetalladoSerializer (Semana 8):
// toneladas_brutas y porcentaje_descarte son strings decimales y el fundo
// viene anidado como objeto.
const lotesIniciales = [
  {
    id: 1,
    codigo_lote: 'LOT-2026-001',
    toneladas_brutas: '12.50',
    porcentaje_descarte: '1.20',
    estado_evaluacion: 'PENDIENTE',
    fecha_ingreso: '2026-11-02T08:30:00-05:00',
    fundo: fundosIniciales[0],
  },
  {
    id: 2,
    codigo_lote: 'LOT-2026-002',
    toneladas_brutas: '8.75',
    porcentaje_descarte: '2.40',
    estado_evaluacion: 'EN_PROCESO',
    fecha_ingreso: '2026-11-03T09:15:00-05:00',
    fundo: fundosIniciales[0],
  },
  {
    id: 3,
    codigo_lote: 'LOT-2026-003',
    toneladas_brutas: '15.00',
    porcentaje_descarte: '0.80',
    estado_evaluacion: 'PROCESADO',
    fecha_ingreso: '2026-11-04T07:45:00-05:00',
    fundo: fundosIniciales[1],
  },
  {
    id: 4,
    codigo_lote: 'LOT-2026-004',
    toneladas_brutas: '6.25',
    porcentaje_descarte: '3.10',
    estado_evaluacion: 'PENDIENTE',
    fecha_ingreso: '2026-11-05T10:20:00-05:00',
    fundo: fundosIniciales[2],
  },
  {
    id: 5,
    codigo_lote: 'LOT-2026-005',
    toneladas_brutas: '22.40',
    porcentaje_descarte: '1.75',
    estado_evaluacion: 'PROCESADO',
    fecha_ingreso: '2026-11-06T11:00:00-05:00',
    fundo: fundosIniciales[3],
  },
  {
    id: 6,
    codigo_lote: 'LOT-2026-006',
    toneladas_brutas: '9.80',
    porcentaje_descarte: '0.00',
    estado_evaluacion: 'EN_PROCESO',
    fecha_ingreso: '2026-11-07T08:05:00-05:00',
    fundo: fundosIniciales[2],
  },
]

function PanelLotes() {
  // Única fuente de verdad del panel: los registros viven aquí y bajan por
  // props al listado, al resumen y al buscador.
  const [lotes, setLotes] = useState(lotesIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  useEffect(() => {
    document.title = `AgroTrace · ${lotes.length} lotes`
    console.log(
      `[PanelLotes] efecto ejecutado: título con ${lotes.length} lotes`,
    )

    return () => {
      console.log('[PanelLotes] limpieza del efecto de título')
    }
  }, [lotes.length])

  const pendientes = lotes.filter(
    (lote) => lote.estado_evaluacion === 'PENDIENTE',
  ).length

  // Filtro compartido: el texto y el estado se guardan en este padre.
  const textoBuscado = busqueda.trim().toLocaleLowerCase('es')
  const lotesFiltrados = lotes.filter((lote) => {
    const campos = [
      lote.codigo_lote,
      lote.fundo.nombre_fundo,
      ETIQUETAS_ESTADO[lote.estado_evaluacion],
    ]
    const coincideTexto =
      !textoBuscado ||
      campos.some((campo) =>
        campo.toLocaleLowerCase('es').includes(textoBuscado),
      )
    const coincideEstado =
      !filtroEstado || lote.estado_evaluacion === filtroEstado

    return coincideTexto && coincideEstado
  })

  function guardarLote(datos) {
    setLotes((registros) => {
      const siguienteId =
        registros.reduce((maximo, lote) => Math.max(maximo, lote.id), 0) + 1

      // Arreglo nuevo con spread, sin push.
      return [...registros, { id: siguienteId, ...datos }]
    })
  }

  function cambiarEstado(id) {
    // Arreglo nuevo con map; el lote modificado también es un objeto nuevo.
    setLotes((registros) =>
      registros.map((lote) =>
        lote.id === id
          ? {
              ...lote,
              estado_evaluacion: SIGUIENTE_ESTADO[lote.estado_evaluacion],
            }
          : lote,
      ),
    )
  }

  function eliminarLote(id) {
    // Arreglo nuevo con filter.
    setLotes((registros) => registros.filter((lote) => lote.id !== id))
  }

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroEstado('')
  }

  return (
    <div className="module">
      <header className="module-header">
        <div>
          <p className="eyebrow">Parte 2 · Panel administrativo AgroTrace</p>
          <h1>Lotes recepcionados</h1>
          <p className="module-intro">
            Gestión de la entidad <code>LoteRecepcionado</code> con datos mock
            de la API de la Semana 8. El estado vive en <code>PanelLotes</code>{' '}
            y los hijos solo lo leen o avisan cambios.
          </p>
        </div>
        <span className="pill">Datos mock · Sin API todavía</span>
      </header>

      <ResumenLotes lotes={lotes} />

      {pendientes > 0 && (
        <aside className="global-alert" role="status">
          <span className="alert-icon" aria-hidden="true">
            !
          </span>
          <p>
            Hay <strong>{pendientes}</strong>{' '}
            {pendientes === 1 ? 'lote pendiente' : 'lotes pendientes'} de
            evaluación en el panel.
          </p>
        </aside>
      )}

      <div className="management-grid">
        <section className="panel-card" aria-labelledby="form-titulo">
          <div className="panel-card__head">
            <h2 id="form-titulo">Registrar lote</h2>
            <span className="badge badge--neutral">Alta</span>
          </div>
          <LoteForm
            onGuardar={guardarLote}
            fundos={fundosIniciales}
            codigosExistentes={lotes.map((lote) => lote.codigo_lote)}
          />
        </section>

        <LoteBuscador
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          estado={filtroEstado}
          onEstadoChange={setFiltroEstado}
          resultados={lotesFiltrados.length}
          total={lotes.length}
          onLimpiar={limpiarFiltros}
        />
      </div>

      <section className="section-heading">
        <div>
          <p className="eyebrow">Listado y acciones</p>
          <h2>Lotes del periodo</h2>
        </div>
        <span className="record-count">
          {lotesFiltrados.length} de {lotes.length} lotes
        </span>
      </section>

      <LoteList
        lotes={lotesFiltrados}
        onCambiarEstado={cambiarEstado}
        onEliminar={eliminarLote}
      />

      <p className="module-note">
        Los datos son mock y reproducen la estructura JSON de la API de la
        Semana 8. El consumo real de endpoints se realizará en la Semana 12.
      </p>
    </div>
  )
}

export default PanelLotes
