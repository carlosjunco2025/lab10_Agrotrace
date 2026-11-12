function Buscador({ valor, onCambiar }) {
  return (
    <label className="search-field">
      <span>Buscar producto</span>
      <input
        type="search"
        value={valor}
        onChange={(evento) => onCambiar(evento.target.value)}
        placeholder="Ej. café, torta, jugo..."
        aria-label="Buscar producto por nombre"
      />
    </label>
  )
}

export default Buscador
