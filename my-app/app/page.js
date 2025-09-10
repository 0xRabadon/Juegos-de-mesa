"use client";
import data from "./data/nombres.json";
import CajaNombre from "/components/CajaNombre";
import { useState, useEffect } from "react";
export default function Page() {
  const [Contador, setContador] = useState(0);
  const funcionAprietame = (e) => {
    setContador( Contador + 1 );
  };

  useEffect(()=>{
    return alert("pagina cargada exitosamente");
  }, []);
  return (
    <>
      <center>
        <h1>{data.titulo}</h1>
        <div>{Contador}</div>
        <button onClick={funcionAprietame}>Cliqueame!</button>
        <div>
          {data.amigos.map((amigo, i) => (
            <CajaNombre key={i} datosNombre={amigo} indice={i}></CajaNombre>
          ))}
        </div>
      </center>
    </>
  );
}
