"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "./supabaseClient";
import { EstadoVidas, TIEMPO_REGEN_MS, VIDAS_MAX } from "./vidasCarrera";
import { cargarEstadoVidasClasico, guardarEstadoVidasClasico } from "./vidasClasico";

interface FilaUsuarioClasico {
  id: string;
  vidas_clasico: number;
  proxima_vida_clasico_at: string | null;
}

function resolverRegeneracion(vidas: number, proximaVidaEnMs: number | null) {
  if (proximaVidaEnMs === null || vidas >= VIDAS_MAX) {
    return { vidas, proximaVidaEn: proximaVidaEnMs };
  }
  const ahora = Date.now();
  if (ahora < proximaVidaEnMs) return { vidas, proximaVidaEn: proximaVidaEnMs };

  const vidasGanadas = Math.floor((ahora - proximaVidaEnMs) / TIEMPO_REGEN_MS) + 1;
  const nuevasVidas = Math.min(VIDAS_MAX, vidas + vidasGanadas);
  const nuevaProxima = nuevasVidas < VIDAS_MAX ? proximaVidaEnMs + vidasGanadas * TIEMPO_REGEN_MS : null;
  return { vidas: nuevasVidas, proximaVidaEn: nuevaProxima };
}

export function useVidasClasico() {
  const { usuario, cargado: authCargado, logueado } = useAuth();
  const [estado, setEstado] = useState<EstadoVidas>({ vidas: VIDAS_MAX, proximaVidaEn: null });
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    if (!authCargado) return;
    let cancelado = false;
    setCargado(false);

    async function cargar() {
      if (logueado && usuario) {
        const { data, error } = await supabase
          .from("usuarios")
          .select("id, vidas_clasico, proxima_vida_clasico_at")
          .eq("id", usuario.id)
          .maybeSingle<FilaUsuarioClasico>();

        if (cancelado) return;

        if (error) {
          console.error("Error cargando vidas de Clásico:", error);
          return;
        }

        if (!data || data.vidas_clasico === null || data.vidas_clasico === undefined) {
          const { error: errorInit } = await supabase
            .from("usuarios")
            .update({ vidas_clasico: VIDAS_MAX, proxima_vida_clasico_at: null })
            .eq("id", usuario.id);
          if (errorInit) console.error("Error inicializando vidas de Clásico:", errorInit);
          if (!cancelado) {
            setEstado({ vidas: VIDAS_MAX, proximaVidaEn: null });
            setCargado(true);
          }
          return;
        }

        const proximaMs = data.proxima_vida_clasico_at ? new Date(data.proxima_vida_clasico_at).getTime() : null;
        const resuelto = resolverRegeneracion(data.vidas_clasico, proximaMs);

        if (resuelto.vidas !== data.vidas_clasico || resuelto.proximaVidaEn !== proximaMs) {
          const { error: errorUpdate } = await supabase
            .from("usuarios")
            .update({
              vidas_clasico: resuelto.vidas,
              proxima_vida_clasico_at: resuelto.proximaVidaEn ? new Date(resuelto.proximaVidaEn).toISOString() : null,
            })
            .eq("id", usuario.id);
          if (errorUpdate) console.error("Error actualizando regeneración de vidas de Clásico:", errorUpdate);
        }

        if (!cancelado) {
          setEstado({ vidas: resuelto.vidas, proximaVidaEn: resuelto.proximaVidaEn });
          setCargado(true);
        }
      } else {
        const estadoVidas = cargarEstadoVidasClasico();
        if (!cancelado) {
          setEstado(estadoVidas);
          setCargado(true);
        }
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [authCargado, logueado, usuario]);

  useEffect(() => {
    if (!cargado || estado.vidas >= VIDAS_MAX || estado.proximaVidaEn === null) return;

    const id = setInterval(() => {
      setEstado((actual) => {
        if (actual.proximaVidaEn === null || Date.now() < actual.proximaVidaEn) return actual;
        const vidas = Math.min(VIDAS_MAX, actual.vidas + 1);
        const proximaVidaEn = vidas < VIDAS_MAX ? Date.now() + TIEMPO_REGEN_MS : null;
        const nuevo = { vidas, proximaVidaEn };

        if (logueado && usuario) {
          supabase
            .from("usuarios")
            .update({
              vidas_clasico: vidas,
              proxima_vida_clasico_at: proximaVidaEn ? new Date(proximaVidaEn).toISOString() : null,
            })
            .eq("id", usuario.id)
            .then(({ error }) => {
              if (error) console.error("Error regenerando vida de Clásico:", error);
            });
        } else {
          guardarEstadoVidasClasico(nuevo);
        }

        return nuevo;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [cargado, estado.vidas, estado.proximaVidaEn, logueado, usuario]);

  const perderVida = useCallback(() => {
    setEstado((actual) => {
      const vidas = Math.max(0, actual.vidas - 1);
      const proximaBase = actual.proximaVidaEn ?? Date.now() + TIEMPO_REGEN_MS;
      const proximaVidaEn = vidas < VIDAS_MAX ? proximaBase : null;
      const nuevo = { vidas, proximaVidaEn };

      if (logueado && usuario) {
        supabase
          .from("usuarios")
          .update({
            vidas_clasico: vidas,
            proxima_vida_clasico_at: proximaVidaEn ? new Date(proximaVidaEn).toISOString() : null,
          })
          .eq("id", usuario.id)
          .then(({ error }) => {
            if (error) console.error("Error guardando vida perdida de Clásico:", error);
          });
      } else {
        guardarEstadoVidasClasico(nuevo);
      }

      return nuevo;
    });
  }, [logueado, usuario]);

  return { vidas: estado.vidas, proximaVidaEn: estado.proximaVidaEn, cargado, perderVida };
}