"use client";

import { useState } from "react";

export default function CommentBox({ juego, onNewComment }) {
  const [text, setText] = useState("");

  async function sendComment() {
    if (!text.trim()) return;

    const res = await fetch(`/api/comments/${juego}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido: text }),
    });

    const json = await res.json();
    if (json.data) {
      onNewComment(json.data);
      setText("");
    }
  }

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <textarea
        placeholder="Escribe un comentario..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: "100%",
          padding: "0.8rem",
          borderRadius: 8,
          border: "1px solid #ccc",
          resize: "vertical",
        }}
      ></textarea>

      <button
        onClick={sendComment}
        style={{
          marginTop: "0.6rem",
          padding: "0.6rem 1rem",
          background: "#4f46e5",
          color: "white",
          borderRadius: 8,
        }}
      >
        Publicar
      </button>
    </div>
  );
}
