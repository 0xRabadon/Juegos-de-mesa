"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Page() {
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsPorPagina = 12;
  const [paginaActual, setPaginaActual] = useState(1);

  // --- LÓGICA DE MEMORIA ---
  useEffect(() => {
    // 1. Cargar datos
    fetch("/api/juegos", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        setJuegos(json.data || []);
        
        // 2. RECUPERAR ESTADO GUARDADO (Solo si venimos de un detalle)
        const paginaGuardada = sessionStorage.getItem("catalogo_pagina");
        const scrollGuardado = sessionStorage.getItem("catalogo_scroll");

        if (paginaGuardada) {
          setPaginaActual(parseInt(paginaGuardada));
        }

        // Quitamos el loading para que se renderice la grilla
        setLoading(false);

        // 3. RESTAURAR SCROLL (Pequeño delay para asegurar que el DOM ya pintó las cartas)
        if (scrollGuardado) {
          setTimeout(() => {
            window.scrollTo({ top: parseInt(scrollGuardado), behavior: "instant" });
            // Opcional: Borrar el scroll guardado para que si recargas F5 no baje solo
            sessionStorage.removeItem("catalogo_scroll"); 
          }, 100);
        }
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  // Función para guardar la posición antes de irse al detalle
  const guardarPosicion = () => {
    sessionStorage.setItem("catalogo_pagina", paginaActual);
    sessionStorage.setItem("catalogo_scroll", window.scrollY);
  };

  // Función para cambiar de página (Limpiamos el scroll guardado porque es una página nueva)
  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
    sessionStorage.setItem("catalogo_pagina", nuevaPagina); // Guardamos la página nueva
    sessionStorage.removeItem("catalogo_scroll"); // Borramos el scroll antiguo
    window.scrollTo({ top: 0, behavior: "smooth" }); // Subimos suavemente
  };

  // Calculos de renderizado
  const indice = (paginaActual - 1) * itemsPorPagina;
  const juegosVisibles = juegos.slice(indice, indice + itemsPorPagina);
  const totalPaginas = Math.ceil(juegos.length / itemsPorPagina) || 1;

  if (loading) {
    return (
      <main className={styles.container}>
        <h1 className={styles.pageHeader}>Cargando catálogo...</h1>
      </main>
    );
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <a href="#" className={styles.logo} onClick={() => {
             // Si clickean el logo, reseteamos todo
             sessionStorage.clear();
             window.location.reload();
          }}>
            Juegos de Mesa
          </a>
        </div>
      </nav>

      <main className={styles.container}>
        <h1 className={styles.pageHeader}>
        </h1>

        <div className={styles.grid}>
          {juegosVisibles.map((juego, i) => (
            <Link
              key={`${juego.nombre}-${i}`}
              href={`/juegos/${encodeURIComponent(juego.nombre)}`}
              className={styles.cardLink}
              onClick={guardarPosicion} // <--- AQUÍ OCURRE LA MAGIA AL HACER CLICK
            >
              <div className={styles.card}>
                <h3>{juego.nombre}</h3>
                
                <div className={styles.imageWrapper}>
                  <Image
                    src={juego.imagen || "/placeholder.jpg"}
                    alt={juego.nombre}
                    fill
                    style={{ objectFit: "contain" }}
                    className={styles.imageSecondary}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={i < 4}
                  />
                </div>

                <p><b>Autor:</b> {juego.autor}</p>
                <p><b>Año:</b> {juego.creacion}</p>
                <p><b>Jugadores:</b> {juego.jugadores?.min}-{juego.jugadores?.max}</p>

                <div className={styles.tags}>
                  {(juego.tags ?? []).slice(0, 3).map((tag, idx) => (
                    <span key={idx} className={styles.tag}>#{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPaginas > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => cambiarPagina(Math.max(1, paginaActual - 1))}
              disabled={paginaActual === 1}
            >
              «
            </button>

            <span> Página {paginaActual} de {totalPaginas} </span>

            <button
              onClick={() => cambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
              disabled={paginaActual === totalPaginas}
            >
              »
            </button>
          </div>
        )}
      </main>

      <div className={styles.leftBar}></div>
      <div className={styles.rightBar}></div>
    </>
  );
}