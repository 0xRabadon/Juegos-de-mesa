"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Page() {
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  // Paginación
  const itemsPorPagina = 2;
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/juegos", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Error fetching juegos");
        setJuegos(Array.isArray(json.data) ? json.data : []);
      } catch (e) {
        setError(e.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPaginas = Math.ceil(juegos.length / itemsPorPagina) || 1;
  const indiceInicial = (paginaActual - 1) * itemsPorPagina;
  const juegosActuales = juegos.slice(indiceInicial, indiceInicial + itemsPorPagina);

  if (loading) {
    return (
      <main className={styles.container}>
        <h1 className={styles.pageHeader}>Cargando juegos…</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.container}>
        <h1 className={styles.pageHeader}>Error</h1>
        <p>No se pudieron cargar los juegos: {error}</p>
      </main>
    );
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <a href="#" className={styles.logo}>Juegos de Mesa</a>
          <ul className={styles.navLinks}>
            <li><a href="#">Inicio</a></li>
            <li><a href="#">Catálogo</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>
      </nav>

      <main className={styles.container}>
        <h1 className={styles.pageHeader}>
          Catálogo <small>Juegos Recientes</small>
        </h1>

        <div className={styles.grid}>
          {juegosActuales.map((juego, i) => (
            <Link
                key={`${juego.nombre}-${i}`} 
                href={`/juegos/${encodeURIComponent(juego.nombre)}`}
                className={styles.cardLink} 
            >
              <div className={styles.card}>
                <h3>{juego.nombre}</h3>

                <div style={{ position: "relative", width: "100%", height: "200px", marginBottom: "1rem" }}>
                    <Image
                      // Usa la URL de Drive o el placeholder local
                      src={juego.imagen || "/placeholder.jpg"} 
                      alt={juego.nombre}
                      fill 
                      style={{ objectFit: "contain" }}
                      className={styles.imageSecondary}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={i < 2}
                    />
                </div>

              <p><b>Autor:</b> {juego.autor}</p>
              <p><b>Año:</b> {juego.creacion}</p>
              <p><b>Género:</b> {juego.genero}</p>
              <p><b>Jugadores:</b> {juego.jugadores?.min} - {juego.jugadores?.max}</p>

              <p>
                {(juego.tags ?? []).map((tag, idx) => (
                  <span key={idx} className={styles.tag}>#{tag} </span>
                ))}
              </p>
            </div>
            </Link>
          ))}
        </div>
        
        <div className={styles.pagination}>
          <button
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            disabled={paginaActual === 1}
          >
            «
          </button>
          {Array.from({ length: totalPaginas }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPaginaActual(i + 1)}
              className={paginaActual === i + 1 ? styles.activePage : ""}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
            disabled={paginaActual === totalPaginas}
          >
            »
          </button>
        </div>
      </main>
    </>
  );
}