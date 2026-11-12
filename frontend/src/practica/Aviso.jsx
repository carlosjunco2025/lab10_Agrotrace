import { useEffect } from 'react'

function Aviso({ aviso, onCerrar }) {
  useEffect(() => {
    // Sin aviso no hay temporizador que crear.
    if (!aviso) {
      return undefined
    }

    console.log(`[Aviso] temporizador iniciado para "${aviso.nombre}"`)
    const temporizador = setTimeout(() => {
      console.log('[Aviso] pasaron 3 segundos; se oculta el aviso')
      onCerrar()
    }, 3000)

    // Limpieza: si llega otro aviso o el componente se desmonta, se cancela
    // el temporizador anterior para evitar avisos "fantasma".
    return () => {
      clearTimeout(temporizador)
      console.log('[Aviso] limpieza: temporizador cancelado')
    }
  }, [aviso, onCerrar])

  if (!aviso) {
    return null
  }

  return (
    <div className="toast" role="status" aria-live="polite">
      Agregado: <strong>{aviso.nombre}</strong>
    </div>
  )
}

export default Aviso
