import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// --- FUNCIÓN PRINCIPAL (GET) ---
export async function GET() {
    try {
        // 1. Cargar variables de entorno críticas
        // Necesitamos estas 3 variables definidas en .env.local para conectar
        const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
        const sheetId = process.env.GOOGLE_SHEET_ID;

        // Si falta alguna, detenemos la ejecución inmediatamente
        if (!clientEmail || !privateKey || !sheetId) {
             return NextResponse.json(
                { error: "CONFIG_ERROR", message: "Missing Google Sheets environment variables" }, 
                { status: 500 }
             );
        }

        // --- CONFIGURACIÓN DE SEGURIDAD Y AUTENTICACIÓN ---
        
        // Definimos que solo vamos a LEER la hoja de cálculo
        const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
        
        // Arreglo típico para saltos de línea en la clave privada (necesario en Vercel/Netlify)
        // Convierte los "\\n" literales en saltos de línea reales
        const pk = privateKey.replace(/\\n/g, '\n');
        
        // Creamos la instancia de autenticación (Service Account)
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: pk,
            },
            scopes,
        });

        // --- PASO A: Petición a Google Sheets ---
        
        // Iniciamos el cliente de Sheets
        const sheets = google.sheets({ version: 'v4', auth });

        // Definimos qué vamos a leer: Hoja1, desde la col A hasta la M
        const range = 'Hoja1!A:M'; 

        // Hacemos la llamada asíncrona a la API
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range,
        });
        
        // --- PASO B: Respuesta al Cliente ---
        
        // Extraemos los datos crudos (Array de Arrays)
        const values = response.data.values;
        
        // Retornamos el JSON. 
        // Nota: Aquí 'games' incluye los encabezados en la posición [0]
        return NextResponse.json({ 
            games: values 
        }, { status: 200 });

    } catch (error) {
        // --- MANEJO DE ERRORES ---
        console.error("Error fetching sheets data:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        return NextResponse.json({ 
            error: "Failed to fetch data from Google Sheets", 
            details: errorMessage,
            hint: "Did you share the sheet with the Service Account email?"
        }, {status:500});
    }
}
