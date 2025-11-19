// src/app/api/comentarios/route.js

import { NextResponse } from "next/server";
import supabase from "@/app/lib/supabaseClient";



// POST – Crear comentario
export async function POST(req) {
  try {
    const { game, email, comment } = await req.json();

    if (!email || !comment || !game) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    if (!email.endsWith("@alumnos.uach.cl")) {
      return NextResponse.json({ error: "Correo debe ser institucional" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("comentarios")
      .insert({
        nombre_juego: game,
        email_autor: email,
        tipo_comentario: "general",
        texto: comment,
      })
      .select();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET – Obtener comentarios
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get("game");

    const { data, error } = await supabase
      .from("comentarios")
      .select("*")
      .eq("nombre_juego", game)
      .order("fecha_creacion", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE – Borrar comentario
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    const { error } = await supabase
      .from("comentarios")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
