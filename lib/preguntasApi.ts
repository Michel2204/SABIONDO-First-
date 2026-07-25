import { supabase } from "./supabaseClient";
import { Pregunta } from "./types";

interface FilaPregunta {
  texto: string;
  opciones: string[];
  respuesta_correcta: number;
  imagen_url: string | null;
}

function filaAPregunta(fila: FilaPregunta): Pregunta {
  return {
    texto: fila.texto,
    opciones: fila.opciones,
    respuestaCorrecta: fila.respuesta_correcta,
    imagenUrl: fila.imagen_url ?? undefined,
  };
}

const COLUMNAS = "texto, opciones, respuesta_correcta, imagen_url";

export async function obtenerPreguntasClasico(categoria: string): Promise<Pregunta[]> {
  const { data, error } = await supabase
    .from("preguntas")
    .select(COLUMNAS)
    .eq("modo", "clasico")
    .eq("categoria", categoria)
    .eq("estado", "aprobada");
  if (error) throw error;
  return (data ?? []).map(filaAPregunta);
}

export async function obtenerTodasClasico(): Promise<Pregunta[]> {
  const { data, error } = await supabase
    .from("preguntas")
    .select(COLUMNAS)
    .eq("modo", "clasico")
    .eq("estado", "aprobada");
  if (error) throw error;
  return (data ?? []).map(filaAPregunta);
}

export async function obtenerPoolCarrera(
  dificultad: "facil" | "media" | "dificil"
): Promise<Pregunta[]> {
  const { data, error } = await supabase
    .from("preguntas")
    .select(COLUMNAS)
    .eq("modo", "carrera")
    .eq("dificultad", dificultad)
    .eq("estado", "aprobada");
  if (error) throw error;
  return (data ?? []).map(filaAPregunta);
}