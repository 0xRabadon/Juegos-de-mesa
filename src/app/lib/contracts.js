import { z } from 'zod';

// 1. DEFINICIÓN DE ENTRADA
export const JuegoCreateInput = z.object({
  id: z.string().optional().nullable(),
  imagen: z.string().nullable().optional(),

  nombre: z.string().min(1, 'nombre es requerido'),

  jugadores: z.object({
    min: z.coerce.number().int().positive(),
    max: z.coerce.number().int().positive(),
  }).refine(v => v.max >= v.min, {
    message: 'jugadores.max debe ser >= jugadores.min',
    path: ['max'],
  }),

  autor: z.string().min(1, 'autor es requerido'),
  ilustrador: z.string().min(1, 'ilustrador es requerido'),
  creacion: z.coerce.string().min(4, 'año de creación inválido'),
  genero: z.string().min(1, 'género es requerido'),
  complejidad: z.string().min(1, 'complejidad es requerida'),
  edificio: z.string().min(1, 'edificio es requerido'),

  tiempo: z.object({
    min: z.coerce.number().int().positive(),
    max: z.coerce.number().int().positive(),
  }).refine(v => v.max >= v.min, {
    message: 'tiempo.max debe ser >= tiempo.min',
    path: ['max'],
  }),

  tags: z.array(z.string().min(1)).default([]),
  desc: z.preprocess(
    v => Array.isArray(v) ? v : (typeof v === 'string' ? [v] : []),
    z.array(z.string().min(1)).min(1, 'al menos 1 párrafo de descripción')
  ),
}).passthrough(); 

// 2. DEFINICIÓN DE SALIDA (LO QUE VE EL FRONTEND)
export const JuegoDTO = z.object({
  id: z.string().nullable().optional(),
  imagen: z.string().nullable(), // <--- Campo clave para la imagen
  
  nombre: z.string(),
  jugadores: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }),
  autor: z.string(),
  ilustrador: z.string(),
  creacion: z.string(),                
  genero: z.string(),
  complejidad: z.enum(['baja', 'media', 'alta']), 
  edificio: z.string(),
  tiempo: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }),
  tags: z.array(z.string()),
  desc: z.array(z.string()),
});

// --- FUNCIONES AUXILIARES ---
function normTexto(s) {
  return String(s ?? '').trim();
}

function normComplejidad(s) {
  const v = normTexto(s).toLowerCase();
  if (['baja', 'low', 'facil', 'fácil'].includes(v)) return 'baja';
  if (['media', 'medio', 'intermedia', 'normal'].includes(v)) return 'media';
  if (['alta', 'difícil', 'dificil', 'hard'].includes(v)) return 'alta';
  return 'media'; 
}

// 3. FUNCIÓN DE CONVERSIÓN
export function toJuegoDTO(input) {
  const data = JuegoCreateInput.parse(input);

  const dto = {
    id: data.id ?? null,
    imagen: data.imagen ?? null, // <--- Asignación de imagen

    nombre: normTexto(data.nombre),

    jugadores: {
      min: Number(data.jugadores.min),
      max: Number(data.jugadores.max),
    },

    autor: normTexto(data.autor),
    ilustrador: normTexto(data.ilustrador),
    creacion: String(data.creacion),        
    genero: normTexto(data.genero),
    complejidad: normComplejidad(data.complejidad),
    edificio: normTexto(data.edificio),

    tiempo: {
      min: Number(data.tiempo.min),
      max: Number(data.tiempo.max),
    },

    tags: (data.tags ?? []).map(t => normTexto(t)).filter(Boolean),
    desc: (data.desc ?? []).map(p => normTexto(p)).filter(Boolean),
  };

  return JuegoDTO.parse(dto);
}