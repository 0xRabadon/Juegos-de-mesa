// utils/data.js

/**
 * Función que hace fetch a tu ruta de API para obtener los datos mapeados
 * de Google Sheets.
 * * Se ejecuta en los Server Components (como generateStaticParams y page.js).
 */
export async function fetchAllGamesFromSheets() {
    // Definir la URL base para el fetch (ej: http://localhost:3000)
    // Esto es necesario para que el fetch funcione de servidor a servidor.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Llama a la ruta de API que creaste en /app/api/sheets/route.js
    const res = await fetch(`${baseUrl}/api/sheets`, {
        // Controla el caché: Revalida los datos cada 3600 segundos (1 hora)
        // O usa { cache: 'no-store' } para siempre obtener datos frescos
        next: { revalidate: 3600 } 
    });

    if (!res.ok) {
        // Manejo de error si la API falla
        console.error(`Fallo al obtener datos de /api/sheets. Estado: ${res.status}`);
        // Lanza un error que Next.js puede capturar
        throw new Error(`Failed to fetch sheets data: ${res.statusText}`);
    }

    const data = await res.json();
    
    // Tu ruta de API devuelve { games: [...] }, retornamos solo el array.
    return data.games;
}