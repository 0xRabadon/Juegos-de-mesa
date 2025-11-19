import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'comments.json');

// Funcion para revisar si existe el archivo o no
async function ensureFileExists() {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify([]));
  }
}

//obtener comentarios
export async function GET() {
  await ensureFileExists();
  const data = await fs.readFile(filePath, 'utf8');
  const comments = JSON.parse(data);
  return Response.json(comments);
}

//agregar comentarios
export async function POST(request) {
  const body = await request.json();
  await ensureFileExists();

  const data = await fs.readFile(filePath, 'utf8');
  const comments = JSON.parse(data);

  const newComment = {
    id: Date.now(),
    text: body.text,
    created_at: new Date().toISOString(),
  };

  comments.unshift(newComment); // añade al principio
  await fs.writeFile(filePath, JSON.stringify(comments, null, 2));

  return Response.json(newComment, { status: 201 });
} 
