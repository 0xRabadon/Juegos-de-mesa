"use client";

// 1. IMPORTS
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Page() {
  // 2. ESTADOS Y CONFIGURACIÓN
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuración de paginación
  const itemsPorPagina = 12;
  const [paginaActual, setPaginaActual] = useState(1);

  // 3. EFECTO DE CARGA (FETCH)
  useEffect(() => {
    fetch("/api/juegos", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        // BLINDAJE: Aseguramos que 'data' sea un array. Si es null, usamos [].
        setJuegos(Array.isArray(json.data) ? json.data : []); 
        
        // RECUPERACIÓN DE POSICIÓN (Scroll y Paginación)
        const paginaGuardada = sessionStorage.getItem("catalogo_pagina");
        const scrollGuardado = sessionStorage.getItem("catalogo_scroll");

        if (paginaGuardada) {
          setPaginaActual(parseInt(paginaGuardada));
        }

        setLoading(false);

        // Restaurar scroll si el usuario volvió desde un detalle
        if (scrollGuardado) {
          setTimeout(() => {
            window.scrollTo({ top: parseInt(scrollGuardado), behavior: "instant" });
            sessionStorage.removeItem("catalogo_scroll"); 
          }, 100);
        }
      })
      .catch((e) => {
        console.error("Error cargando catálogo:", e);
        setJuegos([]); // En caso de error, array vacío para no romper la app
        setLoading(false);
      });
  }, []);

  // 4. FUNCIONES AUXILIARES
  const guardarPosicion = () => {
    sessionStorage.setItem("catalogo_pagina", paginaActual);
    sessionStorage.setItem("catalogo_scroll", window.scrollY);
  };

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
    sessionStorage.setItem("catalogo_pagina", nuevaPagina);
    sessionStorage.removeItem("catalogo_scroll");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetearApp = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  // 5. CÁLCULOS DE PAGINACIÓN
  const indice = (paginaActual - 1) * itemsPorPagina;
  const juegosVisibles = juegos.slice(indice, indice + itemsPorPagina);
  const totalPaginas = Math.ceil(juegos.length / itemsPorPagina) || 1;

  // 6. RENDERIZADO
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
          <a href="#" className={styles.logo} onClick={resetearApp}>
            Juegos de Mesa
          </a>
        </div>
      </nav>

      <main className={styles.container}>
        <h1 className={styles.pageHeader}>
          {/* Título opcional aquí */}
        </h1>

        <div className={styles.grid}>
          {juegosVisibles.map((juego, i) => {
            // --- INICIO DE ZONA SEGURA ---
            if (!juego) return null; // Saltar objetos nulos

            // Variables sanitizadas: Si el campo falta, usamos un valor por defecto.
            const nombreSeguro = juego.nombre || "Juego sin nombre";
            const imagenSegura = juego.imagen || "/placeholder.jpg";
            const autorSeguro = juego.autor || "Autor desconocido";
            const anioSeguro = juego.creacion || "Año desc.";
            
            // Jugadores: Usamos ?. para evitar error si juego.jugadores es null
            const minJ = juego.jugadores?.min || "?";
            const maxJ = juego.jugadores?.max || "?";
            
            // Link Seguro: Si no hay nombre, desactivamos el link poniendo "#"
            const linkHref = juego.nombre 
              ? `/juegos/${encodeURIComponent(juego.nombre)}` 
              : "#";
            // --- FIN DE ZONA SEGURA ---

            return (
              <Link
                key={`${nombreSeguro}-${i}`}
                href={linkHref}
                className={styles.cardLink}
                onClick={(e) => {
                   if(!juego.nombre) e.preventDefault(); // Bloquear click si no hay datos
                   guardarPosicion();
                }}
              >
                <div className={styles.card}>
                  <h3>{nombreSeguro}</h3>
                  
                  <div className={styles.imageWrapper}>
                    <Image
                      src={imagenSegura}
                      alt={nombreSeguro}
                      fill
                      style={{ objectFit: "contain" }}
                      className={styles.imageSecondary}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={i < 4} // Prioridad de carga a los primeros 4
                    />
                  </div>

                  <p><b>Autor:</b> {autorSeguro}</p>
                  <p><b>Año:</b> {anioSeguro}</p>
                  <p><b>Jugadores:</b> {minJ}-{maxJ}</p>

                  <div className={styles.tags}>
                    {/* (juego.tags ?? []) asegura que siempre sea un array */}
                    {(juego.tags ?? []).slice(0, 3).map((tag, idx) => (
                      <span key={idx} className={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
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