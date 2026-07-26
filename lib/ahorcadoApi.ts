import { supabase } from "./supabaseClient";

export type DificultadAhorcado = "facil" | "media" | "dificil";

export interface EstadoAhorcado {
  palabra: string;
  dificultad: DificultadAhorcado;
  letrasProbadas: string[];
  erroresPorJugador: Record<string, number>; // usuarioId -> cantidad de errores
  arriesgoUsado: Record<string, boolean>; // usuarioId -> si ya usó su intento de arriesgar la palabra
  turno: string; // usuarioId de quien le toca adivinar
  ganadorId?: string | null;
  ganadorNombre?: string | null;
  revanchaSolicitada?: Record<string, boolean>; // usuarioId -> si pidio revancha
}

const MAX_ERRORES = 6;

export async function obtenerPalabraAleatoria(dificultad: DificultadAhorcado): Promise<string> {
  const { data, error } = await supabase
    .from("palabras_ahorcado")
    .select("palabra")
    .eq("dificultad", dificultad)
    .eq("estado", "aprobada");

  if (error) throw error;
  if (!data || data.length === 0) throw new Error(`No hay palabras cargadas para dificultad ${dificultad}`);

  const elegida = data[Math.floor(Math.random() * data.length)];
  return elegida.palabra.toUpperCase();
}

export function palabraCompleta(palabra: string, letrasProbadas: string[]): boolean {
  return palabra.split("").every((letra) => letrasProbadas.includes(letra));
}

export { MAX_ERRORES };