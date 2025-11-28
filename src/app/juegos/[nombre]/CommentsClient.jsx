"use client";

import { useState, useEffect } from "react";
import styles from "./comentarios.module.css";

export default function CommentsClient({ game }) {
  // --- Estados del Formulario ---
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  // Estado para el tipo de comentario (por defecto "Reseña")
  const [type, setType] = useState("Reseña"); 

  // --- Estados de la Lista ---
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar comentarios al entrar a la página
  useEffect(() => { loadComments(); }, [game]);

  // --- Función para cargar comentarios ---
  const loadComments = async () => {
    try {
      const res = await fetch(`/api/comentarios?game=${encodeURIComponent(game)}`);
      if (res.ok) {
          const data = await res.json();
          setComments(data || []);
      }
    } catch (error) { console.error(error); }
  };

  // --- Función para enviar un comentario ---
  const sendComment = async () => {
    // Validación del correo institucional
    if (!email.endsWith("@alumnos.uach.cl")) {
        return alert("Debes usar un correo institucional (@alumnos.uach.cl)");
    }
    // Validación de campos vacíos
    if (!comment.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Enviamos los datos al backend
        body: JSON.stringify({ game, email, comment, type }),
      });
      
      if (res.ok) { 
          setComment(""); // Limpiamos el textarea si todo salió bien
          loadComments(); // Recargamos la lista
      } else {
          alert("Error al enviar el comentario.");
      }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  // --- Helper para formatear fecha ---
  const formatDate = (dateString) => {
      return new Date(dateString || "").toLocaleDateString("es-CL", { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // --- Helper para las etiquetas de colores (Badges) ---
  const getTypeBadge = (typeRaw) => {
    // Normalizamos a minúsculas para comparar
    const t = typeRaw ? typeRaw.toLowerCase() : "reseña";
    
    if (t === 'similar' || t === 'recommendation') {
        return <span className={`${styles.badge} ${styles.badgeRec}`}>Similar</span>;
    }
    if (t === 'aviso' || t === 'warning') {
        return <span className={`${styles.badge} ${styles.badgeWarn}`}>Aviso</span>;
    }
    // Default: Reseña
    return <span className={`${styles.badge} ${styles.badgeReview}`}>Reseña</span>;
  };

  return (
    <div className={styles.commentsSection}>
      <h3 className={styles.title}>Comentarios de la Comunidad</h3>
      
      {/* --- Formulario --- */}
      <div className={styles.form}>
        <div className={styles.row}>
          {/* Input Email */}
          <input className={styles.input} placeholder="Tu correo (@alumnos.uach.cl)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          
          {/* Selector de Tipo (Valores en Español) */}
          <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Reseña">Reseña</option>
            <option value="Similar">Similar</option>
            <option value="Aviso">Aviso</option>
          </select>
        </div>
        
        {/* Textarea Comentario */}
        <textarea className={styles.textarea} placeholder="Comparte tu opinión..." value={comment} onChange={(e) => setComment(e.target.value)} />
        
        {/* Botón Enviar */}
        <button className={styles.submitButton} onClick={sendComment} disabled={loading}>
            {loading ? "Enviando..." : "Publicar"}
        </button>
      </div>

      {/* --- Lista de Comentarios --- */}
      {comments.length === 0 ? (
          <p className={styles.emptyState}>Aún no hay comentarios.</p>
      ) : (
        <ul className={styles.commentList}>
          {comments.map((c) => (
            <li key={c.id} className={styles.commentCard}>
              <div className={styles.commentHeader}>
                {/* Autor y Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={styles.author}>{c.email_autor.split('@')[0]}</span>
                    {getTypeBadge(c.tipo_comentario)}
                </div>
                {/* Fecha */}
                <span className={styles.date}>{formatDate(c.fecha_creacion || c.created_at)}</span>
              </div>
              {/* Texto del comentario */}
              <p className={styles.text}>{c.texto}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}