// src/app/api/juegos/route.js - Este es el archivo final y completo

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { toJuegoDTO } from '../../lib/contracts';

const mapSpreadsheetRowToJuego = (row, headers) => {
    let gameData = {};
    headers.forEach((header, index) => {
        gameData[header] = row[index] === undefined ? null : row[index];
    });

    const tagsArray = gameData.Tags ? gameData.Tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0) : [];
    const descArray = gameData.Desc ? gameData.Desc.split('\n\n') : [gameData.Desc];
    
    return {
        nombre: gameData.Nombre || null,
        autor: gameData.Autor || null,
        ilustrador: gameData.Ilustrador || null,
        creacion: gameData.Creacion ? String(gameData.Creacion) : null,
        genero: gameData.Genero || null,
        complejidad: gameData.Complejidad || null,
        edificio: gameData.Edificio || null,
        
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

        if (!clientEmail || !privateKey || !sheetId) {
            throw new Error("Missing Google Sheets environment variables (CLIENT_EMAIL, PRIVATE_KEY, or SHEET_ID)");
        }
        
        const pk = privateKey.replace(/\\n/g, '\n'); 

        const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: pk,
            },
            scopes,
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const range = 'Hoja1!A:M'; 

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range,
        });

        const values = response.data.values;

        if (!values || values.length === 0) {
            return NextResponse.json({ data: [] }, { status: 200 });
        }
        
        const headers = values[0]; 
        const rawGameData = values.slice(1);
        
        const rawGames = rawGameData.map(row => mapSpreadsheetRowToJuego(row, headers));
        const list = rawGames.map(item => toJuegoDTO(item)); 
        
        return NextResponse.json({ data: list }, { status: 200 });

    } catch (error) {
        console.error("Error fetching sheets data:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ 
            error: "Failed to fetch data from Google Sheets", 
            details: errorMessage 
        }, {status:500});
    }
}