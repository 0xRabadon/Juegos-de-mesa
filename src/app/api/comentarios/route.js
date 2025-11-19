import { NextResponse } from 'next/server'
import { supabase } from '../../lib/supabaseClient'

/**
 * GET /api/comentarios
 * Supported Query Params:
 * - ?id=1            -> Retrieve a specific comment by ID (Primary Key lookup).
 * - ?juego=Catan     -> Retrieve all comments associated with a specific game (Foreign Key logic).
 * - (No params)      -> Retrieve full dataset (use with caution on high volume).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const juego = searchParams.get('juego')

  let query = supabase.from('comentarios').select('*')

  if (id) {
    query = query.eq('id', id)
  } else if (juego) {
    query = query.eq('nombre_juego', juego)
  }

  const { data, error } = await query.order('fecha_creacion', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

/**
 * POST /api/comentarios
 * Persist a new comment record.
 * Required Payload: { nombre_juego, email_autor, tipo_comentario, texto }
 */
export async function POST(request) {
  const body = await request.json()
  const { nombre_juego, email_autor, tipo_comentario, texto } = body

  if (!nombre_juego || !email_autor || !tipo_comentario || !texto) {
    return NextResponse.json(
      { error: 'Faltan campos obligatorios (nombre_juego, email_autor, tipo_comentario, texto)' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('comentarios')
    .insert([{ nombre_juego, email_autor, tipo_comentario, texto }])
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Comentario registrado correctamente', data })
}

/**
 * PATCH /api/comentarios
 * Modify an existing comment record.
 * Required Payload: { id, ...updates }
 */
export async function PATCH(request) {
  const body = await request.json()
  const { id, ...updates } = body

  if (!id)
    return NextResponse.json({ error: 'Falta el ID del comentario' }, { status: 400 })

  const { error } = await supabase
    .from('comentarios')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: `Comentario ${id} actualizado correctamente` })
}

/**
 * DELETE /api/comentarios?id=X
 * Remove a comment record by ID.
 */
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id)
    return NextResponse.json({ error: 'Falta el parámetro id' }, { status: 400 })

  const { error } = await supabase
    .from('comentarios')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: `Comentario ${id} eliminado correctamente` })
} 
