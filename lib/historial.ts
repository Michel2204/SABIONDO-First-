import { supabase } from "./supabaseClient";

export interface HistorialVersus {
  misVictorias: number;
  rivalVictorias: number;
  empates: number;
}

export async function registrarResultado(
  salaId: string,
  juego: string,
  jugador1: string,
  jugador2: string,
  ganadorId: string | null
) {
  const { error } = await supabase.from("historial_partidas").insert({
    sala_id: salaId,
    juego,
    jugador_1: jugador1,
    jugador_2: jugador2,
    ganador_id: ganadorId,
  });

  if (error && error.code !== "23505") {
    console.error("Error registrando historial de partida:", error);
  }
}

export async function obtenerHistorialVersus(
  juego: string,
  usuarioId: string,
  rivalId: string
): Promise<HistorialVersus> {
  const { data, error } = await supabase
    .from("historial_partidas")
    .select("ganador_id")
    .eq("juego", juego)
    .or(
      `and(jugador_1.eq.${usuarioId},jugador_2.eq.${rivalId}),and(jugador_1.eq.${rivalId},jugador_2.eq.${usuarioId})`
    );

  if (error) {
    console.error("Error obteniendo historial versus:", error);
    return { misVictorias: 0, rivalVictorias: 0, empates: 0 };
  }

  let misVictorias = 0;
  let rivalVictorias = 0;
  let empates = 0;

  for (const fila of data ?? []) {
    if (fila.ganador_id === usuarioId) misVictorias++;
    else if (fila.ganador_id === rivalId) rivalVictorias++;
    else empates++;
  }

  return { misVictorias, rivalVictorias, empates };
}