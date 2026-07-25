import { Pregunta } from "./types";

function indiceBasePorNivel(nivel: number): number {
  if (nivel <= 33) return nivel - 1;
  if (nivel <= 66) return nivel - 34;
  return nivel - 67;
}

/** Mezcla el orden de las opciones manteniendo cuál es la correcta */
function mezclarOpciones(p: Pregunta): Pregunta {
  const opciones = p.opciones.map((texto, i) => ({ texto, esCorrecta: i === p.respuestaCorrecta }));
  for (let i = opciones.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
  }
  return {
    texto: p.texto,
    opciones: opciones.map((o) => o.texto),
    respuestaCorrecta: opciones.findIndex((o) => o.esCorrecta),
  };
}

export function obtenerDificultad(nivel: number): "FÁCIL" | "MEDIA" | "DIFÍCIL" {
  if (nivel <= 33) return "FÁCIL";
  if (nivel <= 66) return "MEDIA";
  return "DIFÍCIL";
}

/** Igual que obtenerDificultad pero en el formato que espera la columna `dificultad` de Supabase */
export function dificultadKeyPorNivel(nivel: number): "facil" | "media" | "dificil" {
  if (nivel <= 33) return "facil";
  if (nivel <= 66) return "media";
  return "dificil";
}

/**
 * Devuelve la pregunta correspondiente al nivel (1-100) a partir de un pool
 * ya traído de Supabase (ver obtenerPoolCarrera en preguntasApi.ts).
 * Si el nivel supera el tamaño del pool, vuelve a recorrerlo mezclando el
 * orden de las opciones para que no se sienta idéntica.
 */
export function obtenerPreguntaDePool(nivel: number, pool: Pregunta[]): Pregunta {
  const indiceBase = indiceBasePorNivel(nivel);
  const indice = indiceBase % pool.length;
  const vuelta = Math.floor(indiceBase / pool.length);
  const base = pool[indice];
  return vuelta === 0 ? base : mezclarOpciones(base);
}