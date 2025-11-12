import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { toJuegoDTO } from '../../lib/contracts';

const getFileNameWithoutExt = (filename) => {
    if (!filename) return "";
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return filename.trim();
    return filename.substring(0, lastDotIndex).trim();
};

const mapSpreadsheetRowToJuego = (row, headers, driveImagesMap) => {
    let gameData = {};
    headers.forEach((header, index) => {
        const cleanHeader = header ? header.trim() : "";
        gameData[cleanHeader] = row[index] === undefined ? null : row[index];
    });

    // Cruce por ID
    const rawID = gameData["ID"];
    const juegoId = rawID ? String(rawID).trim() : null;
    const fileId = juegoId ? driveImagesMap.get(juegoId) : null;

    const imagenUrl = fileId 
        ? `https://drive.google.com/uc?export=view&id=${fileId}` 
        : null; 

    const tagsArray = gameData.Tags ? gameData.Tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0) : [];
    const descArray = gameData.Desc ? gameData.Desc.split('\n\n') : [gameData.Desc];

    return {
        id: juegoId,
        nombre: gameData.Nombre || "Sin nombre",
        autor: gameData.Autor || null,
        ilustrador: gameData.Ilustrador || null,
        creacion: gameData.Creacion ? String(gameData.Creacion) : null,
        genero: gameData.Genero || null,
        complejidad: gameData.Complejidad || null,
        edificio: gameData.Edificio || null,
        imagen: imagenUrl, 
        jugadores: {
            min: parseInt(gameData.Jugadores_Min) || null,
            max: parseInt(gameData.Jugadores_Max) || null,
        },
        tiempo: {
            min: parseInt(gameData.Tiempo_Min) || null,
            max: parseInt(gameData.Tiempo_Max) || null,
        },
        tags: tagsArray,
        desc: descArray.filter(d => d && d.trim().length > 0),
    };
};

export async function GET() {
    try {
        const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID; 

        if (!clientEmail || !privateKey || !sheetId) {
            throw new Error("Faltan credenciales en variables de entorno.");
        }
        const pk = privateKey.replace(/\\n/g, '\n'); 

        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: clientEmail, private_key: pk },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets.readonly',
                'https://www.googleapis.com/auth/drive.readonly'
            ],
        });

        // 1. Sheets
        const sheets = google.sheets({ version: 'v4', auth });
        const responseSheet = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Hoja1!A:N', 
        });
        const values = responseSheet.data.values;
        if (!values || values.length === 0) return NextResponse.json({ data: [] });
        
        const headers = values[0]; 
        const rawGameData = values.slice(1);

        // 2. Drive
        let driveImagesMap = new Map(); 
        if (driveFolderId) {
            try {
                const drive = google.drive({ version: 'v3', auth });
                const responseDrive = await drive.files.list({
                    q: `'${driveFolderId}' in parents and trashed = false`,
                    fields: 'files(id, name)',
                    pageSize: 1000
                });
                const files = responseDrive.data.files;
                if (files) {
                    files.forEach(file => {
                        const nameKey = getFileNameWithoutExt(file.name);
                        driveImagesMap.set(nameKey, file.id);
                    });
                }
            } catch (err) {
                console.error("Advertencia Drive:", err.message);
            }
        }

        // 3. Mapeo final
        const rawGames = rawGameData.map(row => mapSpreadsheetRowToJuego(row, headers, driveImagesMap));
        const list = rawGames.map(item => toJuegoDTO(item)); 
        
        return NextResponse.json({ data: list }, { status: 200 });

    } catch (error) {
        console.error("Error API:", error);
        return NextResponse.json({ error: "Error interno", details: error.message }, {status:500});
    }
}