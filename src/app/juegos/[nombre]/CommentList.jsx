"use client";

export default function CommentList({ comments, juego, onChange }) {
  async function deleteComment(id) {
    await fetch(`/api/comments/${juego}/${id}`, { method: "DELETE" });
    onChange(comments.filter((c) => c.id !== id));
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      {comments.length === 0 && (
        <p style={{ opacity: 0.6 }}>No hay comentarios aún.</p>
      )}

      {comments.map((c) => (
        <div
          key={c.id}
          style={{
            padding: "1rem",
            background: "#f9f9f9",
            borderRadius: 8,
            marginBottom: "0.7rem",
            border: "1px solid #eee",
          }}
        >
          <p style={{ margin: 0 }}>{c.contenido}</p>

          <button
            onClick={() => deleteComment(c.id)}
            style={{
              marginTop: "0.4rem",
              background: "transparent",
              color: "red",
              border: "none",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}
