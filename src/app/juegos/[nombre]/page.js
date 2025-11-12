import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
// IMPORTAR la función que acabamos de crear
import { fetchAllGamesFromSheets } from '/src/app/api/sheets/route.js'; 

// -------------------------------------------------------------------------
// 1. generateStaticParams: Define qué rutas pre-generar (para el build)
// -------------------------------------------------------------------------
export async function generateStaticParams() {
    // AHORA LLAMA a la función que tiene la lógica de Sheets
    //const games = await fetchAllGamesFromSheets(); esta funcion no esta en /sheets/route pero el chat me lo agrega igual
    
    return games.map((game) => ({
        // Debe retornar un objeto con el nombre del parámetro (nombre)
        nombre: encodeURIComponent(game.Nombre), 
    }));
}

// -------------------------------------------------------------------------
// 2. Componente Principal (Obtiene los datos del juego específico)
// -------------------------------------------------------------------------
export default async function ProductDetailPage({ params }) {
    // 1. Decodificar el nombre de la URL
    const cleanName = decodeURIComponent(params.nombre);

    // 2. Obtener los datos del juego específico
    const allGames = await fetchAllGamesFromSheets();
    const gameData = allGames.find(game => game.Nombre === cleanName);

    if (!gameData) {
        // Next.js se encargará de esto si usas generateStaticParams correctamente, 
        // pero es buena práctica de manejo de errores.
        return <div>Error 404: Juego no encontrado.</div>;
    }

    return (
        <div className="main-layout-container">
            {/* Encabezado fijo */}
            <header className="navbar-fixed-design"></header>

            <main className="container-main-content">
                {/* Botón de regreso usando Link */}
                <Link href="/" style={{ marginBottom: '20px', display: 'block' }}>
                    ← Volver al Catálogo
                </Link>

                {/* Diseño de la Vista 2 */}
                <div className="product-detail-layout">
                    
                    {/* IZQUIERDA: Imagen del Producto */}
                    <div className="product-image-box">
                        <Image
                            src={`/images/${cleanName.toLowerCase().replace(/\s+/g, "_")}.jpg`}
                            alt={cleanName}
                            width={300}
                            height={300}
                            style={{ border: '3px solid black' }} 
                        />
                        <p className="product-label">{cleanName}</p>
                    </div>

                    {/* DERECHA: Información del Google Sheet */}
                    <div className="product-info-box">
                        <h1>nombre: {cleanName}</h1>
                        <p>{gameData.Desc}</p> 
                        <p>Autor: {gameData.Autor}</p>
                        <p>Jugadores: {gameData.Jugadores_Min} - {gameData.Jugadores_Max}</p>
                        {/* Puedes mapear aquí toda la información de tu hoja */}
                        
                        <hr/>
                        {/* Aquí iría la sección de COMENTARIOS (que por ahora ignoramos) */}
                        <h2>Comentarios:</h2>
                        <p>Los comentarios irían aquí y se cargarían con JavaScript si decides implementarlos.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}