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

/** Mezcla el orden del array completo (Fisher-Yates), sin tocar el pool original */
function mezclarPool(pool: Pregunta[]): Pregunta[] {
  const copia = [...pool];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function obtenerDificultad(nivel: number): "FÁCIL" | "MEDIA" | "DIFÍCIL" {
  if (nivel <= 33) return "FÁCIL";
  if (nivel <= 66) return "MEDIA";
  return "DIFÍCIL";
}

export function dificultadKeyPorNivel(nivel: number): "facil" | "media" | "dificil" {
  if (nivel <= 33) return "facil";
  if (nivel <= 66) return "media";
  return "dificil";
}

/**
 * Devuelve la pregunta correspondiente al nivel (1-100) a partir de un pool
 * ya traído de Supabase. El pool se mezcla una sola vez (memoizado por
 * referencia) para variar el orden de aparición entre partidas, y en cada
 * "vuelta" adicional se vuelve a mezclar para no repetir siempre la misma
 * secuencia.
 */
const cachePoolMezclado = new WeakMap<Pregunta[], Pregunta[][]>();

export function obtenerPreguntaDePool(nivel: number, pool: Pregunta[]): Pregunta {
  const indiceBase = indiceBasePorNivel(nivel);
  const vuelta = Math.floor(indiceBase / pool.length);
  const indice = indiceBase % pool.length;

  let vueltas = cachePoolMezclado.get(pool);
  if (!vueltas) {
    vueltas = [mezclarPool(pool)];
    cachePoolMezclado.set(pool, vueltas);
  }
  while (vueltas.length <= vuelta) {
    vueltas.push(mezclarPool(pool));
  }

  const base = vueltas[vuelta][indice];
  return vuelta === 0 ? base : mezclarOpciones(base);
}