"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EstadoVidas,
  TIEMPO_REGEN_MS,
  VIDAS_MAX,
  cargarEstadoVidas,
  guardarEstadoVidas,
} from "./vidasCarrera";

export function useVidasCarrera() {
  const [estado, setEstado] = useState<EstadoVidas>({ vidas: VIDAS_MAX, proximaVidaEn: null });
  const [cargado, setCargado] = useState(false);

  // Carga inicial (solo existe localStorage en el cliente)
  useEffect(() => {
    setEstado(cargarEstadoVidas());
    setCargado(true);
  }, []);

  // Timer: cuando faltan vidas, revisa cada segundo si ya toca sumar una
  useEffect(() => {
    if (!cargado || estado.vidas >= VIDAS_MAX || estado.proximaVidaEn === null) return;

    const id = setInterval(() => {
      setEstado((actual) => {
        if (actual.proximaVidaEn === null || Date.now() < actual.proximaVidaEn) return actual;
        const vidas = Math.min(VIDAS_MAX, actual.vidas + 1);
        const nuevo: EstadoVidas = {
          vidas,
          proximaVidaEn: vidas < VIDAS_MAX ? Date.now() + TIEMPO_REGEN_MS : null,
        };
        guardarEstadoVidas(nuevo);
        return nuevo;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [cargado, estado.vidas, estado.proximaVidaEn]);

  const perderVida = useCallback(() => {
    setEstado((actual) => {
      const vidas = Math.max(0, actual.vidas - 1);
      const proximaVidaEn = actual.proximaVidaEn ?? Date.now() + TIEMPO_REGEN_MS;
      const nuevo: EstadoVidas = { vidas, proximaVidaEn: vidas < VIDAS_MAX ? proximaVidaEn : null };
      guardarEstadoVidas(nuevo);
      return nuevo;
    });
  }, []);

  return { vidas: estado.vidas, proximaVidaEn: estado.proximaVidaEn, cargado, perderVida };
}
