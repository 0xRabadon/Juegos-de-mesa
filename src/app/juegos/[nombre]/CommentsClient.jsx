"use client";

import { useState, useEffect } from "react";

export default function CommentsClient({ game }) {
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  // Cargar comentarios
  async function loadComments() {
    const res = await fetch(`/api/comentarios?game=${game}`);
    const data = await res.json();
    setComments(data);
  }

  useEffect(() => {
    loadComments();
  }, [game]);

  // Enviar comentario
  async function sendComment() {
    if (!email.endsWith("@alumnos.uach.cl")) {
      alert("Debe ser un correo institucional");
      return;
    }

    if (comment.trim() === "") return;

    await fetch("/api/comentarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game, email, comment }),
    });

    setComment("");
    loadComments();
  }

  // Borrar comentario
  async function deleteComment(id) {
    await fetch("/api/comentarios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadComments();
  }

  return (
    <div>
      <h2>Comentarios</h2>

      <input
        placeholder="correo@alumnos.uach.cl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <textarea
        placeholder="Escribe tu comentario..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button onClick={sendComment}>Enviar</button>

      <ul>
        {comments.map((c) => (
          <li key={c.id}>
            <b>{c.email_author}</b> — {c.texto} ({c.fecha_creacion})
            <button onClick={() => deleteComment(c.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
