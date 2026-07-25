export const VIDAS_MAX = 5;
export const TIEMPO_REGEN_MS = 2 * 60 * 1000 + 30 * 1000; // 2:30

export interface EstadoVidas {
  vidas: number;
  // timestamp (ms) en que se suma la próxima vida. null si vidas === VIDAS_MAX
  proximaVidaEn: number | null;
}

const KEY_VIDAS = "sabiondo_vidas";
const KEY_PROXIMA = "sabiondo_proxima_vida";

/**
 * Lee el estado guardado y resuelve vidas que se regeneraron mientras
 * la app estaba cerrada (ej. el usuario esperó 5 min sin tener la app abierta).
 */
export function cargarEstadoVidas(): EstadoVidas {
  if (typeof window === "undefined") {
    return { vidas: VIDAS_MAX, proximaVidaEn: null };
  }

  const vidasGuardadas = localStorage.getItem(KEY_VIDAS);
  const proximaGuardada = localStorage.getItem(KEY_PROXIMA);

  let vidas = vidasGuardadas !== null ? parseInt(vidasGuardadas, 10) : VIDAS_MAX;
  if (!Number.isFinite(vidas)) vidas = VIDAS_MAX;
  vidas = Math.min(VIDAS_MAX, Math.max(0, vidas));

  let proximaVidaEn = proximaGuardada !== null ? parseInt(proximaGuardada, 10) : null;
  if (proximaVidaEn !== null && !Number.isFinite(proximaVidaEn)) proximaVidaEn = null;

  if (proximaVidaEn !== null && vidas < VIDAS_MAX) {
    const ahora = Date.now();
    if (ahora >= proximaVidaEn) {
      const vidasGanadas = Math.floor((ahora - proximaVidaEn) / TIEMPO_REGEN_MS) + 1;
      vidas = Math.min(VIDAS_MAX, vidas + vidasGanadas);
      proximaVidaEn = vidas < VIDAS_MAX ? proximaVidaEn + vidasGanadas * TIEMPO_REGEN_MS : null;
    }
  }

  const estado = { vidas, proximaVidaEn };
  guardarEstadoVidas(estado);
  return estado;
}

export function guardarEstadoVidas(estado: EstadoVidas) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_VIDAS, String(estado.vidas));
  if (estado.proximaVidaEn !== null) {
    localStorage.setItem(KEY_PROXIMA, String(estado.proximaVidaEn));
  } else {
    localStorage.removeItem(KEY_PROXIMA);
  }
}
