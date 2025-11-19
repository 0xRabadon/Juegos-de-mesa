"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "./detalle.module.css";

// ⬇️ Nuevo componente que reemplaza al antiguo Comentarios
import CommentsClient from "./CommentsClient";

export default function JuegoDetalle() {
  const params = useParams();
  const nombre = params?.nombre;

  const [juego, setJuego] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!nombre) return;

    async function cargarJuego() {
      try {
        const res = await fetch("/api/juegos");
        if (!res.ok) throw new Error("Error al cargar los juegos");

        const json = await res.json();
        const listaJuegos = json.data; // ← FIX

        if (!Array.isArray(listaJuegos)) {
          throw new Error("La API no devolvió una lista válida");
        }

        const encontrado = listaJuegos.find(
          (j) => j.nombre.toLowerCase() === nombre.toLowerCase()
        );

        if (!encontrado) {
          setError("Juego no encontrado");
          return;
        }

        setJuego(encontrado);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    cargarJuego();
  }, [nombre]);

  if (loading)
    return (
      <div className={styles.center}>
        <h2>Cargando...</h2>
      </div>
    );

  if (error)
    return (
      <div className={styles.center}>
        <h2>Ups</h2>
        <p>{error}</p>
        <Link href="/" className={styles.backButton}>
          Volver al inicio
        </Link>
      </div>
    );

  if (!juego) return null;

  return (
    <main className={styles.container}>
      <Link href="/" className={styles.backButton}>
        ← Volver
      </Link>

      <h1 className={styles.title}>{juego.nombre}</h1>

      <div className={styles.content}>
        <img
          src={juego.imagen}
          alt={juego.nombre}
          className={styles.image}
        />

        <div className={styles.info}>
          <p><strong>Género:</strong> {juego.genero}</p>
          <p><strong>Jugadores:</strong> {juego.jugadores?.min} - {juego.jugadores?.max}</p>
          <p><strong>Duración:</strong> {juego.tiempo?.min} - {juego.tiempo?.max} min</p>
          <p><strong>Descripción:</strong></p>
          {juego.desc?.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {/* ⭐ NUEVA SECCIÓN DE COMENTARIOS */}
      <CommentsClient game={nombre} />
      {/* --------
        Explicación:
        - El componente "Comentarios" fue eliminado
        - Ahora usamos CommentsClient (el bueno que se conecta a Supabase)
        - game={nombre} → se usa como identificador único de cada juego
      -------- */}
    </main>
  );
}
