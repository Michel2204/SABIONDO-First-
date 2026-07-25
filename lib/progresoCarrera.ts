export const NIVEL_MAX = 100;

const KEY_NIVEL = "sabiondo_nivel_carrera";

export function cargarProgresoCarrera(): number {
  if (typeof window === "undefined") return 1;
  const guardado = localStorage.getItem(KEY_NIVEL);
  const nivel = guardado !== null ? parseInt(guardado, 10) : 1;
  return Number.isFinite(nivel) && nivel >= 1 ? nivel : 1;
}

export function guardarProgresoCarrera(nivel: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_NIVEL, String(nivel));
}
