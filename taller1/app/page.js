"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

// Importamos el JSON
import juegos from "./data/juegos.json";

export default function Page() {
  // Configuración de paginación
  const itemsPerPage = 2;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(juegos.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJuegos = juegos.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <a href="#" className={styles.logo}>
            🎲 Juegos de Mesa
          </a>
          <ul className={styles.navLinks}>
            <li><a href="#">Inicio</a></li>
            <li><a href="#">Catálogo</a></li>
            <li className={styles.active}><a href="#">Portfolio</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>
      </nav>

      {/* CONTENT */}
      <main className={styles.container}>
        <h1 className={styles.pageHeader}>
          Catálogo <small>Juegos Recientes</small>
        </h1>

        {/* GRID */}
        <div className={styles.grid}>
          {currentJuegos.map((juego, i) => (
            <div key={i} className={styles.card}>
              <h3>{juego.nombre}</h3>

              <Image
                src={`/images/${juego.nombre.toLowerCase().replace(/\s+/g, "_")}.jpg`}
                alt={juego.nombre}
                width={700}
                height={200}
                className={styles.imageSecondary}
              />

              <p><b>Autor:</b> {juego.autor}</p>
              <p><b>Año:</b> {juego.creacion}</p>
              <p><b>Género:</b> {juego.genero}</p>
              <p><b>Complejidad:</b> {juego.complejidad}</p>
              <p><b>Jugadores:</b> {juego.jugadores.min} - {juego.jugadores.max}</p>

              {/* Tags */}
              <p>
                {juego.tags.map((tag, idx) => (
                  <span key={idx} className={styles.tag}>
                    #{tag}{" "}
                  </span>
                ))}
              </p>

              {/* Descripción (primer párrafo para no saturar) */}
              <p>{juego.desc[0]}</p>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            «
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? styles.activePage : ""}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </main>
    </>
  );
}
