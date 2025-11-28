import { NextResponse } from "next/server";
import supabase from "@/app/lib/supabaseClient";

// POST – Crear un nuevo comentario
export async function POST(req) {
  try {
    const { game, email, comment, type } = await req.json();

    // Validaciones
    if (!email || !comment || !game) {
        return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }
    if (!email.endsWith("@alumnos.uach.cl")) {
        return NextResponse.json({ error: "Se requiere correo institucional (@alumnos.uach.cl)" }, { status: 400 });
    }

    // Lista blanca de tipos válidos
    const validTypes = ["Reseña", "Similar", "Aviso"];
    const commentType = validTypes.includes(type) ? type : "Reseña";

    // Insertar en Supabase
    const { data, error } = await supabase
      .from("comentarios")
      .insert({
        nombre_juego: game,
        email_autor: email,
        tipo_comentario: commentType,
        texto: comment,
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET – Leer comentarios de un juego
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get("game");

    const { data, error } = await supabase
      .from("comentarios")
      .select("*")
      .eq("nombre_juego", game)
      .order("fecha_creacion", { ascending: false }); // Más nuevos primero

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}