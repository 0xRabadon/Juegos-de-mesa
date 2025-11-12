import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { toJuegoDTO } from '../../lib/contracts';

// --- AYUDANTE 1: Limpiar nombres de archivo ---
// Convierte "1.jpg" -> "1", o "10.png" -> "10" para poder compararlos con el ID del Excel
const getFileNameWithoutExt = (filename) => {
    if (!filename) return "";
    const lastDotIndex = filename.lastIndexOf('.');
    // Si no tiene extensión, devolvemos el nombre tal cual
    if (lastDotIndex === -1) return filename.trim();
    return filename.substring(0, lastDotIndex).trim();
};

// --- AYUDANTE 2: Mapear Filas de Excel a Objetos ---
const mapSpreadsheetRowToJuego = (row, headers, driveImagesMap) => {
    let gameData = {};
    
    // Convertimos la fila ["Catan", "3", "4"...] en objeto { Nombre: "Catan", Jugadores_Min: "3"... }
    headers.forEach((header, index) => {
        const cleanHeader = header ? header.trim() : "";
        gameData[cleanHeader] = row[index] === undefined ? null : row[index];
    });

    // Lógica de Imagen:
    // 1. Leemos la columna "ID" del Excel
    const rawID = gameData["ID"];
    const juegoId = rawID ? String(rawID).trim() : null;
    
    // 2. Buscamos si existe una foto con ese nombre en el mapa de Drive
    const fileId = juegoId ? driveImagesMap.get(juegoId) : null;

    // 3. Si existe, creamos la URL pública
    const imagenUrl = fileId 
        ? `https://drive.google.com/uc?export=view&id=${fileId}` 
        : null; 

    // Procesamos las listas (Tags y Descripción por párrafos)
    const tagsArray = gameData.Tags ? gameData.Tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0) : [];
    const descArray = gameData.Desc ? gameData.Desc.split('\n\n') : [gameData.Desc];

    // Retornamos el objeto limpio
    return {
        id: juegoId,
        nombre: gameData.Nombre,
        autor: gameData.Autor,
        ilustrador: gameData.Ilustrador,
        creacion: gameData.Creacion,
        genero: gameData.Genero,
        complejidad: gameData.Complejidad,
        edificio: gameData.Edificio,
        imagen: imagenUrl, // <--- Aquí va el link de la foto
        jugadores: {
            min: gameData.Jugadores_Min,
            max: gameData.Jugadores_Max,
        },
        tiempo: {
            min: gameData.Tiempo_Min,
            max: gameData.Tiempo_Max,
        },
        tags: tagsArray,
        desc: descArray,
    };
};

// --- FUNCIÓN PRINCIPAL (GET) ---
export async function GET() {
    try {
        // 1. Cargar credenciales del .env
        const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID; 

        if (!clientEmail || !privateKey || !sheetId) {
            throw new Error("Faltan variables de entorno (Credenciales de Google)");
        }
        
        // Arreglo típico para saltos de línea en la clave privada
        const pk = privateKey.replace(/\\n/g, '\n'); 

        // Autenticación con Google
        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: clientEmail, private_key: pk },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets.readonly', // Permiso para leer Excel
                'https://www.googleapis.com/auth/drive.readonly'         // Permiso para leer Drive
            ],
        });

        // ---------------------------------------------------------
        // PASO A: Obtener datos de Google Sheets
        // ---------------------------------------------------------
        const sheets = google.sheets({ version: 'v4', auth });
        const responseSheet = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Hoja1!A:N', // Asegúrate de que cubra todas tus columnas
        });

        const values = responseSheet.data.values;
        if (!values || values.length === 0) {
            return NextResponse.json({ data: [] }, { status: 200 });
        }
        
        const headers = values[0]; // La primera fila son los títulos
        const rawGameData = values.slice(1); // El resto son los juegos

        // ---------------------------------------------------------
        // PASO B: Obtener lista de archivos de Google Drive
        // ---------------------------------------------------------
        let driveImagesMap = new Map(); 
        
        if (driveFolderId) {
            try {
                const drive = google.drive({ version: 'v3', auth });
                // Pedimos lista de archivos dentro de la carpeta especificada
                const responseDrive = await drive.files.list({
                    q: `'${driveFolderId}' in parents and trashed = false`,
                    fields: 'files(id, name)',
                    pageSize: 1000
                });

                const files = responseDrive.data.files;
                if (files) {
                    files.forEach(file => {
                        // Guardamos: Clave="1" -> Valor="ID_DEL_ARCHIVO_EN_DRIVE"
                        const nameKey = getFileNameWithoutExt(file.name);
                        driveImagesMap.set(nameKey, file.id);
                    });
                }
            } catch (err) {
                console.error("Error leyendo Drive (Revisa permisos o ID):", err.message);
                // Si falla Drive, seguimos adelante para mostrar al menos los textos
            }
        }

        // ---------------------------------------------------------
        // PASO C: Cruzar datos, validar y responder
        // ---------------------------------------------------------
        
        // 1. Mapeamos filas de Excel cruzando con el mapa de imágenes
        const rawGames = rawGameData.map(row => mapSpreadsheetRowToJuego(row, headers, driveImagesMap));
        
        // 2. Pasamos por el validador DTO (Contracts) para asegurar tipos de datos
        const list = rawGames.map(item => toJuegoDTO(item)); 
        
        return NextResponse.json({ data: list }, { status: 200 });

    } catch (error) {
        console.error("Error API Juegos:", error);
        return NextResponse.json({ 
            error: "Error interno del servidor", 
            details: error instanceof Error ? error.message : "Desconocido" 
        }, { status: 500 });
    }
}