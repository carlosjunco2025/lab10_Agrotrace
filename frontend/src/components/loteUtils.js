export const ETIQUETAS_ESTADO = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  PROCESADO: 'Procesado',
}

export const SIGUIENTE_ESTADO = {
  PENDIENTE: 'EN_PROCESO',
  EN_PROCESO: 'PROCESADO',
  PROCESADO: 'PENDIENTE',
}

export const ACCION_ESTADO = {
  PENDIENTE: 'Evaluar',
  EN_PROCESO: 'Procesar',
  PROCESADO: 'Reabrir',
}

export const CLASE_ESTADO = {
  PENDIENTE: 'badge--pending',
  EN_PROCESO: 'badge--process',
  PROCESADO: 'badge--done',
}

export function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
