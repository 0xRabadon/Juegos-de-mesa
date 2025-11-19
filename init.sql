CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    nombre_juego VARCHAR(255) NOT NULL,
    email_autor VARCHAR(255) NOT NULL,
    tipo_comentario VARCHAR(50) NOT NULL,
    texto TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO comentarios (nombre_juego, email_autor, tipo_comentario, texto) VALUES 
('Catan', 'roberto.perez@gmail.com', 'RESEÑA', 'Tremendo juegazo, la mecánica es excelente para destruir amistades.'),
('Dixit', 'admin_bodega@umah.cl', 'ESTADO', 'Atención: Faltan 2 cartas de conejo y la caja tiene una esquina rota.'),
('Exploding Kittens', 'gamer_pro@gmail.com', 'RECOMENDACION', 'Si les gusta el caos de este juego, deberían probar Unstable Unicorns.'),
('Catan', 'nuevo_jugador@hotmail.com', 'RESEÑA', 'Un poco largo para mi gusto, pero entretenido.'),
('Monopoly', 'troll_detectado@gmail.com', 'RESEÑA', 'El juego es eterno, nunca termina.');
