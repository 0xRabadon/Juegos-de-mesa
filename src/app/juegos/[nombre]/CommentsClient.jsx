"use client";

import { useState, useEffect } from "react";
// Importamos los estilos nuevos
import styles from "./comentarios.module.css";

export default function CommentsClient({ game }) {
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar comentarios al iniciar
  useEffect(() => {
    loadComments();
  }, [game]);

  async function loadComments() {
    try {
      // codificamos el nombre del juego para la URL
      const res = await fetch(`/api/comentarios?game=${encodeURIComponent(game)}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data || []);
      }
    } catch (error) {
      console.error("Error cargando comentarios:", error);
    }
  }

  async function sendComment() {
    if (!email.endsWith("@alumnos.uach.cl")) {
      alert("⚠️ Debes usar un correo institucional (@alumnos.uach.cl)");
      return;
    }
    if (!comment.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game, email, comment }),
      });

      if (res.ok) {
        setComment(""); // Limpiar campo
        loadComments(); // Recargar lista
      } else {
        alert("Error al enviar el comentario.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function deleteComment(id) {
    if(!confirm("¿Seguro que quieres borrar este comentario?")) return;

    try {
      await fetch("/api/comentarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      // Actualizar lista localmente para que sea rápido
      setComments(comments.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  // Función auxiliar para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
    });
  };

  return (
    <div className={styles.commentsSection}>
      <h3 className={styles.title}>Comentarios de la Comunidad</h3>

      {/* FORMULARIO */}
      <div className={styles.form}>
        <input
          className={styles.input}
          placeholder="Tu correo (@alumnos.uach.cl)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <textarea
          className={styles.textarea}
          placeholder="¿Qué opinas de este juego?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button 
            className={styles.submitButton} 
            onClick={sendComment}
            disabled={loading}
        >
          {loading ? "Enviando..." : "Publicar Comentario"}
        </button>
      </div>

      {/* LISTA DE COMENTARIOS */}
      {comments.length === 0 ? (
        <p className={styles.emptyState}>Aún no hay comentarios. ¡Sé el primero!</p>
      ) : (
        <ul className={styles.commentList}>
          {comments.map((c) => (
            <li key={c.id} className={styles.commentCard}>
              <div className={styles.commentHeader}>
                <span className={styles.author}>{c.email_autor}</span>
                <span className={styles.date}>{formatDate(c.fecha_creacion || c.created_at)}</span>
              </div>
              
              <p className={styles.text}>{c.texto}</p>
              
              <button 
                className={styles.deleteButton} 
                onClick={() => deleteComment(c.id)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}