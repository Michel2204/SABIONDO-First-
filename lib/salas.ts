import { supabase } from "./supabaseClient";

export type TipoSala = "publica" | "privada";
export type EstadoSala = "esperando" | "en_curso" | "finalizada";
export type Juego = "trivia" | "ajedrez" | "damas" | "ahorcado"; // CAMBIO: nuevo tipo

export interface Sala {
  id: string;
  codigo: string | null;
  tipo: TipoSala;
  estado: EstadoSala;
  creador_id: string;
  oponente_id: string | null;
  categoria_id: string | null;
  semilla: number;
  puntaje_creador: number;
  puntaje_oponente: number;
  creado_en: string;
  juego: Juego;          // CAMBIO: nuevo campo
  estado_juego: unknown; // CAMBIO: nuevo campo, cada juego lo tipa al leerlo
}

function generarCodigo(): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return codigo;
}

// CAMBIO: función nueva, arma el estado inicial según el juego
function estadoInicialPorJuego(juego: Juego): unknown {
  switch (juego) {
    case "ahorcado":
      return { palabra: null, letrasProbadas: [], erroresPorJugador: {}, arriesgoUsado: {}, revanchaSolicitada: {}, turno: null };
    case "damas":
      return { tablero: null, turno: null }; // se completa en la Fase J3
    case "ajedrez":
      return { fen: null, turno: null }; // se completa en la Fase J4
    default:
      return null; // trivia sigue usando sus columnas propias
  }
}

export async function crearSalaPublica(
  creadorId: string,
  juego: Juego = "trivia", // CAMBIO: nuevo parámetro
  categoriaId?: string
) {
  const { data, error } = await supabase
    .from("salas")
    .insert({
      tipo: "publica",
      creador_id: creadorId,
      categoria_id: categoriaId ?? null,
      juego,                                     // CAMBIO
      estado_juego: estadoInicialPorJuego(juego), // CAMBIO
    })
    .select()
    .single<Sala>();

  if (error) throw error;
  return data;
}

export async function crearSalaPrivada(
  creadorId: string,
  juego: Juego = "trivia", // CAMBIO: nuevo parámetro
  categoriaId?: string
) {
  const codigo = generarCodigo();
  const { data, error } = await supabase
    .from("salas")
    .insert({
      tipo: "privada",
      codigo,
      creador_id: creadorId,
      categoria_id: categoriaId ?? null,
      juego,                                     // CAMBIO
      estado_juego: estadoInicialPorJuego(juego), // CAMBIO
    })
    .select()
    .single<Sala>();

  if (error) throw error;
  return data;
}

export async function listarSalasPublicas(juego: Juego = "trivia"): Promise<Sala[]> { // CAMBIO: nuevo parámetro
  const { data, error } = await supabase
    .from("salas")
    .select()
    .eq("tipo", "publica")
    .eq("estado", "esperando")
    .eq("juego", juego) // CAMBIO
    .order("creado_en", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function buscarRival(
  usuarioId: string,
  juego: Juego = "trivia", // CAMBIO: nuevo parámetro (antes era categoriaId)
  categoriaId?: string
): Promise<Sala> {
  const disponibles = await listarSalasPublicas(juego); // CAMBIO
  const salaLibre = disponibles.find((s) => s.creador_id !== usuarioId);

  if (salaLibre) return unirseSalaPublica(salaLibre.id, usuarioId);
  return crearSalaPublica(usuarioId, juego, categoriaId); // CAMBIO: orden correcto
}

export async function unirseSalaPublica(salaId: string, usuarioId: string): Promise<Sala> {
  const { data, error } = await supabase
    .from("salas")
    .update({ oponente_id: usuarioId, estado: "en_curso" })
    .eq("id", salaId)
    .eq("estado", "esperando")
    .select()
    .single<Sala>();

  if (error) throw error;
  return data;
}

export async function unirsePorCodigo(codigo: string): Promise<Sala> {
  const { data, error } = await supabase.rpc("unirse_por_codigo", {
    codigo_ingresado: codigo.trim().toUpperCase(),
  });

  if (error) throw error;
  return data as Sala;
}

export async function actualizarPuntaje(salaId: string, esCreador: boolean, puntaje: number) {
  const campo = esCreador ? "puntaje_creador" : "puntaje_oponente";
  const { error } = await supabase.from("salas").update({ [campo]: puntaje }).eq("id", salaId);
  if (error) throw error;
}

export async function finalizarSala(salaId: string) {
  const { error } = await supabase.from("salas").update({ estado: "finalizada" }).eq("id", salaId);
  if (error) throw error;
}