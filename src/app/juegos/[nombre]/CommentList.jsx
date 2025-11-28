"use client";

import { useState, useEffect } from "react";
import styles from "./comentarios.module.css";

export default function CommentsClient({ game }) {
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [type, setType] = useState("Reseña"); 
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadComments(); }, [game]);

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/comentarios?game=${encodeURIComponent(game)}`);
      if (res.ok) setComments(await res.json() || []);
    } catch (error) { console.error(error); }
  };

  const sendComment = async () => {
    if (!email.endsWith("@alumnos.uach.cl")) return alert("Debes usar un correo institucional (@alumnos.uach.cl)");
    if (!comment.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game, email, comment, type }),
      });
      if (res.ok) { setComment(""); loadComments(); } else alert("Error al enviar.");
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const formatDate = (dateString) => new Date(dateString || "").toLocaleDateString("es-CL", { year: 'numeric', month: 'short', day: 'numeric' });

  const getTypeBadge = (type) => {
    const t = type ? type.toLowerCase() : "reseña";
    if (t === 'similar' || t === 'recommendation') return <span className={`${styles.badge} ${styles.badgeRec}`}>Similar</span>;
    if (t === 'aviso' || t === 'warning') return <span className={`${styles.badge} ${styles.badgeWarn}`}>Aviso</span>;
    return <span className={`${styles.badge} ${styles.badgeReview}`}>Reseña</span>;
  };

  return (
    <div className={styles.commentsSection}>
      <h3 className={styles.title}>Comentarios de la Comunidad</h3>
      <div className={styles.form}>
        <div className={styles.row}>
          <input className={styles.input} placeholder="Tu correo (@alumnos.uach.cl)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Reseña">Reseña</option>
            <option value="Similar">Similar</option>
            <option value="Aviso">Aviso</option>
          </select>
        </div>
        <textarea className={styles.textarea} placeholder="Comparte tu opinión..." value={comment} onChange={(e) => setComment(e.target.value)} />
        <button className={styles.submitButton} onClick={sendComment} disabled={loading}>{loading ? "Enviando..." : "Publicar"}</button>
      </div>
      {comments.length === 0 ? <p className={styles.emptyState}>Aún no hay comentarios.</p> : (
        <ul className={styles.commentList}>
          {comments.map((c) => (
            <li key={c.id} className={styles.commentCard}>
              <div className={styles.commentHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span className={styles.author}>{c.email_autor.split('@')[0]}</span>{getTypeBadge(c.tipo_comentario)}</div>
                <span className={styles.date}>{formatDate(c.fecha_creacion || c.created_at)}</span>
              </div>
              <p className={styles.text}>{c.texto}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}