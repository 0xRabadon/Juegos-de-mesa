'use client';

import { useEffect, useState } from 'react';

export default function CommentBox() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar comentarios
  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    setLoading(true);
    const res = await fetch('/api/comments');
    const data = await res.json();
    setComments(data);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newComment }),
    });

    if (res.ok) {
      setNewComment('');
      fetchComments();
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>

      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          rows="3"
          style={{ width: '100%', padding: '8px' }}
        />
        <button
          type="submit"
          style={{
            marginTop: '8px',
            padding: '8px 16px',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Enviar
        </button>
      </form>

      {loading ? (
        <p>Cargando comentarios...</p>
        ) : comments.length === 0 ? (
        <p>No hay comentarios</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {comments.map((c) => (
            <li
              key={c.id}
              style={{
                background: '#f2f2f2',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '8px',
              }}
            >
              {c.text}
              <br />
              <small style={{ color: '#777' }}>
                {new Date(c.created_at).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}