"use client";

// 1. IMPORTS
import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./detalle.module.css";
import CommentsClient from "./CommentsClient";

export default function DetalleJuego({ params }) {
  // 2. RECUPERACIÓN DE PARÁMETROS (Compatible con Next.js 15)
  const paramsDesempaquetados = use(params);
  const nombreBruto = paramsDesempaquetados.nombre;
  
  // Decodificación segura para manejar espacios y acentos en la URL
  const nombreJuego = nombreBruto ? decodeURIComponent(nombreBruto) : "";

  // 3. ESTADOS
  const [juego, setJuego] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 4. EFECTO: BUSCAR EL JUEGO
  useEffect(() => {
    if (!nombreJuego) return;

    (async () => {
      try {
        const res = await fetch("/api/juegos", { cache: "no-store" });
        const json = await res.json();
        
        if (!res.ok) throw new Error("Error en la respuesta de la API");

        const listaJuegos = Array.isArray(json.data) ? json.data : [];
        
        // --- BLINDAJE DE BÚSQUEDA ---
        // Aquí evitamos que la app explote si un juego en la DB no tiene nombre.
        // Usamos (g.nombre || "") para garantizar que siempre sea un string.
        const encontrado = listaJuegos.find(
            g => (g.nombre || "").trim().toLowerCase() === nombreJuego.trim().toLowerCase()
        );

        if (!encontrado) {
            setError(`No encontramos el juego: ${nombreJuego}`);
        } else {
            setJuego(encontrado);
        }

      } catch (e) {
        console.error(e);
        setError("Error de conexión al cargar el juego");
      } finally {
        setLoading(false);
      }
    })();
  }, [nombreJuego]);

  // 5. RENDERIZADO CONDICIONAL (Carga y Errores)
  if (loading) return   <div className={styles.imagenCentrada}> <img src="/foto1.png" alt="Mi imagen" /> </div>;
  
  if (error) return (
      <div className={styles.center}>
        <h2>Ups</h2>
        <p>{error}</p>
        <Link href="/" className={styles.backButton}>Volver al inicio</Link>
      </div>
  );

  if (!juego) return null;

  // 6. SANITIZACIÓN DE DATOS (Previo al JSX)
  // Definimos valores por defecto para evitar textos vacíos o undefined en pantalla
  const nombreSeguro = juego.nombre || "Nombre no disponible";
  const imagenSegura = juego.imagen || "/placeholder.jpg";
  const complejidadSegura = juego.complejidad || "Media"; // Valor base para evitar error en toLowerCase()
  
  const minJugadores = juego.jugadores?.min || "?";
  const maxJugadores = juego.jugadores?.max || "?";
  const minTiempo = juego.tiempo?.min || "?";
  const maxTiempo = juego.tiempo?.max || "?";

  // 7. RENDERIZADO PRINCIPAL
  return (
    <main className={styles.container}>
      <Link href="/" className={styles.backButton}>← Volver al catálogo</Link>

      {/* SECCIÓN SUPERIOR: FOTO Y DATOS */}
      <div className={styles.topSectionGrid}> 
        
        <div className={styles.imageContainer}>
           <div className={styles.imageWrapper}>
             <Image
               src={imagenSegura}
               alt={nombreSeguro}
               fill
               style={{ objectFit: "contain" }}
               className={styles.mainImage}
               priority
             />
           </div>
        </div>

        <div className={styles.infoContainer}>
          <h1 className={styles.title}>{nombreSeguro}</h1>
          
          <div className={styles.metaData}>
            <p><strong>Autor:</strong> {juego.autor || "Desconocido"}</p>
            <p><strong>Ilustrador:</strong> {juego.ilustrador || "Desconocido"}</p>
            <p><strong>Año:</strong> {juego.creacion || "?"}</p>
            <p><strong>Ubicación:</strong> {juego.edificio || "No especificada"}</p>
          </div>

          <hr className={styles.divider} />

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
                <span className={styles.statLabel}>Jugadores</span>
                <span className={styles.statValue}>{minJugadores}-{maxJugadores}</span>
            </div>
            <div className={styles.statBox}>
                <span className={styles.statLabel}>Tiempo</span>
                <span className={styles.statValue}>{minTiempo}-{maxTiempo}m</span>
            </div>
            <div className={styles.statBox}>
                <span className={styles.statLabel}>Complejidad</span>
                {/* Usamos data-level seguro gracias a complejidadSegura */}
                <span className={styles.statValue} data-level={complejidadSegura.toLowerCase()}>
                    {complejidadSegura}
                </span>
            </div>
             <div className={styles.statBox}>
                <span className={styles.statLabel}>Género</span>
                <span className={styles.statValue}>{juego.genero || "-"}</span>
            </div>
          </div>

          <div className={styles.tags}>
            {(juego.tags || []).map((tag, i) => (
                <span key={i} className={styles.tag}>#{tag}</span>
            ))}
          </div>
        </div>
      </div> 

      {/* SECCIÓN DESCRIPCIÓN */}
      <div className={styles.descriptionSection}> 
        <h3 className={styles.descriptionTitle}>Descripción del Juego</h3>
        {Array.isArray(juego.desc) && juego.desc.length > 0 ? (
            juego.desc.map((parrafo, idx) => <p key={idx}>{parrafo}</p>)
        ) : (
            <p>No hay descripción disponible para este juego.</p>
        )}
      </div>

      {/* SECCIÓN COMENTARIOS */}
      <div style={{ marginTop: "3rem" }}>
        <CommentsClient game={nombreSeguro} />
      </div>

    </main>
  );
}