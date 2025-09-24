"use client";
import data from "./data/juegos.json";
import { useState, useEffect } from "react";

export default function Page() {
  const [Contador, setContador] = useState(0);
  const funcionAprietame = (e) => {
    setContador( Contador + 1 );
  };

  useEffect(()=>{
    return alert("pagina recargada"); //eliminar al terminar
  }, []);
  return (
    <>
      <center>
        <h1>
          {
          "Juegos de Mesa" // comentario
          }
        </h1>
        <div>
          bloque central :V
        </div>
      </center>
    </>
  );
}
