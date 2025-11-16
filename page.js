"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css"; // Asegúrate de tener tu CSS normal aquí

export default function Page() {
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Paginación
  const itemsPorPagina = 4;
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    fetch("/api/juegos", { cache: "no-store" })
      .then(res => res.json())
      .then(json => setJuegos(json.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const indice = (paginaActual - 1) * itemsPorPagina;
  const juegosVisibles = juegos.slice(indice, indice + itemsPorPagina);
  const totalPaginas = Math.ceil(juegos.length / itemsPorPagina) || 1;

  if (loading) return <main className={styles.container}><h1>Cargando...</h1></main>;

  return (
    <main className={styles.container}>
      <h1 className={styles.pageHeader}>Catálogo de Juegos</h1>

      <div className={styles.grid}>
        {juegosVisibles.map((juego, i) => (
          <Link key={i} href={`/juegos/${encodeURIComponent(juego.nombre)}`} className={styles.cardLink}>
            <div className={styles.card}>
              <h3>{juego.nombre}</h3>
              <div style={{ position: "relative", width: "100%", height: "200px", marginBottom: "1rem" }}>
                  <Image
                    src={juego.imagen || "/placeholder.jpg"} 
                    alt={juego.nombre}
                    fill 
                    style={{ objectFit: "contain" }}
                  />
              </div>
              <p><b>Jugadores:</b> {juego.jugadores?.min}-{juego.jugadores?.max}</p>
            </div>
          </Link>
        ))}
      </div>
      
      <div className={styles.pagination}>
         {/* ... Tu código de botones de paginación ... */}
         <button onClick={() => setPaginaActual(p => Math.max(1, p-1))}>«</button>
         <span> {paginaActual} / {totalPaginas} </span>
         <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p+1))}>»</button>
      </div>
    </main>
  );
}