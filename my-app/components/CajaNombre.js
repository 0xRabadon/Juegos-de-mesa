import { useState } from "react";

const CajaNombre = ({ datosNombre, indice }) => {
  const [Contador, setContador] = useState(0);
  const addOneLike = (e) => {
    setContador (Contador + 1);
  };
  return (
    <div className="caja-nombre" key={indice}>
      <div className="nombre-cabecera">{indice + 1} </div>
      <div className="nombre-amigo">{datosNombre.nombre}</div>
      <div className="Likes-amigo">
        {Contador}
        <button onClick={addOneLike}>Like!</button>
      </div>
    </div>
  );
};

export default CajaNombre;