import { NextResponse } from 'next/server';
import seed from '../../data/juegos.json'; 
import { JuegoCreateInput, toJuegoDTO } from '../../lib/contracts';

export async function GET() {
  try {
   
    const list = (Array.isArray(seed) ? seed : []).map(item => toJuegoDTO(item));
    return NextResponse.json({ data: list }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: 'SEED_PARSE_ERROR', message: err?.message ?? 'No se pudo leer/validar el seed' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const raw = await request.json();
    const parsed = JuegoCreateInput.parse(raw);   
    const dto = toJuegoDTO(parsed);              
    return NextResponse.json({ data: dto }, { status: 201 });
  } catch (err) {

    if (err?.issues) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          details: err.issues.map(i => ({ path: i.path, message: i.message })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'UNKNOWN_ERROR', message: err?.message ?? 'Algo salió mal' },
      { status: 500 }
    );
  }
}
