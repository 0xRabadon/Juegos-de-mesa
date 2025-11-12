"use client";

import React, { useEffect, useState, use } from "react"; // <--- 1. Agregamos 'use' aquí
import Image from "next/image";
import Link from "next/link";
import styles from "./detalle.module.css";

export default function DetalleJuego({ params }) {
  // 2. DESEMPAQUETAMOS LA PROMESA CON React.use()
  // En Next.js 15, params no es un objeto directo, es una promesa.
  const paramsDesempaquetados = use(params); 
  const nombreBruto = paramsDesempaquetados.nombre;
  
  const nombreJuego = nombreBruto ? decodeURIComponent(nombreBruto) : "";

  const [juego, setJuego] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!nombreJuego) return;

    (async () => {
      try {
        // Pedimos la lista completa a la API
        const res = await fetch("/api/juegos", { cache: "no-store" });
        const json = await res.json();
        
        if (!res.ok) throw new Error("Error al conectar con la API");

        const listaJuegos = Array.isArray(json.data) ? json.data : [];
        
        // Buscamos el juego exacto
        const encontrado = listaJuegos.find(
            g => g.nombre.trim().toLowerCase() === nombreJuego.trim().toLowerCase()
        );

        if (!encontrado) {
            setError("Juego no encontrado en el catálogo");
        } else {
            setJuego(encontrado);
        }

      } catch (e) {
        console.error(e);
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    })();
  }, [nombreJuego]);

  if (loading) return <div className={styles.center}><h2>Cargando...</h2></div>;
  
  if (error) return (
      <div className={styles.center}>
        <h2>Ups</h2>
        <p>{error}</p>
        <Link href="/" className={styles.backButton}>Volver al inicio</Link>
      </div>
  );

  if (!juego) return null;

  return (
    <main className={styles.container}>
      <Link href="/" className={styles.backButton}>← Volver al catálogo</Link>

      <div className={styles.detailGrid}>
        {/* COLUMNA IZQUIERDA: IMAGEN */}
        <div className={styles.imageContainer}>
           <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "400px" }}>
             <Image
               src={juego.imagen || "/placeholder.jpg"}
               alt={juego.nombre}
               fill
               style={{ objectFit: "contain" }}
               className={styles.mainImage}
               priority
             />
           </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN */}
        <div className={styles.infoContainer}>
          <h1 className={styles.title}>{juego.nombre}</h1>
          
          <div className={styles.metaData}>
            <p><strong>Autor:</strong> {juego.autor}</p>
            <p><strong>Ilustrador:</strong> {juego.ilustrador}</p>
            <p><strong>Año:</strong> {juego.creacion}</p>
            <p><strong>Ubicación:</strong> {juego.edificio}</p>
          </div>

          <hr className={styles.divider} />

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
                <span className={styles.statLabel}>Jugadores</span>
                <span className={styles.statValue}>{juego.jugadores?.min}-{juego.jugadores?.max}</span>
            </div>
            <div className={styles.statBox}>
                <span className={styles.statLabel}>Tiempo</span>
                <span className={styles.statValue}>{juego.tiempo?.min}-{juego.tiempo?.max}m</span>
            </div>
            <div className={styles.statBox}>
                <span className={styles.statLabel}>Complejidad</span>
                <span className={styles.statValue} data-level={juego.complejidad?.toLowerCase()}>
                    {juego.complejidad}
                </span>
            </div>
             <div className={styles.statBox}>
                <span className={styles.statLabel}>Género</span>
                <span className={styles.statValue}>{juego.genero}</span>
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.description}>
            <h3>Descripción</h3>
            {juego.desc && juego.desc.length > 0 ? (
                juego.desc.map((parrafo, idx) => <p key={idx}>{parrafo}</p>)
            ) : (
                <p>No hay descripción disponible.</p>
            )}
          </div>

          <div className={styles.tags}>
            {juego.tags?.map((tag, i) => (
                <span key={i} className={styles.tag}>#{tag}</span>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}