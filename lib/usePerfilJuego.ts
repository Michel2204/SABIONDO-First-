"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "./supabaseClient";
import { EstadoVidas, TIEMPO_REGEN_MS, VIDAS_MAX, cargarEstadoVidas, guardarEstadoVidas } from "./vidasCarrera";
import { cargarProgresoCarrera, guardarProgresoCarrera } from "./progresoCarrera";

interface EstadoPerfil {
  vidas: number;
  proximaVidaEn: number | null;
  nivel: number;
  gemas: number;
}

interface FilaUsuario {
  id: string;
  vidas: number;
  proxima_vida_at: string | null;
  progreso_carrera: number;
  gemas: number;
}

/** Aplica la regeneración de vidas que pudo haber pasado mientras no mirábamos el reloj */
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

/**
 * Reemplaza a useVidasCarrera + progresoCarrera.
 * - Si hay sesión de Google: lee/escribe la fila del usuario en la tabla `usuarios` de Supabase.
 * - Si no hay sesión: sigue funcionando 100% con localStorage, como antes.
 *
 * Nota: si el usuario juega primero sin loguearse y después inicia sesión, el progreso
 * guardado en localStorage NO se migra automáticamente a Supabase (queda como mejora futura).
 */
export function usePerfilJuego() {
  const { usuario, cargado: authCargado, logueado } = useAuth();
  const [estado, setEstado] = useState<EstadoPerfil>({
    vidas: VIDAS_MAX,
    proximaVidaEn: null,
    nivel: 1,
    gemas: 0,
  });
  const [cargado, setCargado] = useState(false);

  // Carga inicial
  useEffect(() => {
    if (!authCargado) return;
    let cancelado = false;
    setCargado(false);

    async function cargar() {
      if (logueado && usuario) {
        const { data, error } = await supabase
          .from("usuarios")
          .select("id, vidas, proxima_vida_at, progreso_carrera, gemas")
          .eq("id", usuario.id)
          .maybeSingle<FilaUsuario>();

        if (cancelado) return;

        if (error) {
          console.error("Error cargando perfil de usuario:", error);
          // No pisamos el progreso real: si falla la consulta, no reseteamos vidas.
          // Simplemente no marcamos como "cargado" para que la pantalla espere,
          // en vez de arrancar de cero con datos falsos.
          return;
        }

        if (!data) {
          // Primera vez real que este usuario entra: crea su fila con valores iniciales
          await supabase.from("usuarios").upsert({
            id: usuario.id,
            vidas: VIDAS_MAX,
            proxima_vida_at: null,
            progreso_carrera: 1,
            gemas: 0,
          });
          if (!cancelado) {
            setEstado({ vidas: VIDAS_MAX, proximaVidaEn: null, nivel: 1, gemas: 0 });
            setCargado(true);
          }
          return;
        }

        const proximaMs = data.proxima_vida_at ? new Date(data.proxima_vida_at).getTime() : null;
        const resuelto = resolverRegeneracion(data.vidas, proximaMs);

        if (resuelto.vidas !== data.vidas || resuelto.proximaVidaEn !== proximaMs) {
          await supabase
            .from("usuarios")
            .update({
              vidas: resuelto.vidas,
              proxima_vida_at: resuelto.proximaVidaEn ? new Date(resuelto.proximaVidaEn).toISOString() : null,
            })
            .eq("id", usuario.id);
        }

        if (!cancelado) {
          setEstado({
            vidas: resuelto.vidas,
            proximaVidaEn: resuelto.proximaVidaEn,
            nivel: data.progreso_carrera,
            gemas: data.gemas,
          });
          setCargado(true);
        }
      } else {
        const estadoVidas: EstadoVidas = cargarEstadoVidas();
        const nivel = cargarProgresoCarrera();
        if (!cancelado) {
          setEstado({ vidas: estadoVidas.vidas, proximaVidaEn: estadoVidas.proximaVidaEn, nivel, gemas: 0 });
          setCargado(true);
        }
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [authCargado, logueado, usuario]);

  // Timer: revisa cada segundo si toca sumar una vida (sirve para ambos modos)
  useEffect(() => {
    if (!cargado || estado.vidas >= VIDAS_MAX || estado.proximaVidaEn === null) return;

    const id = setInterval(() => {
      setEstado((actual) => {
        if (actual.proximaVidaEn === null || Date.now() < actual.proximaVidaEn) return actual;
        const vidas = Math.min(VIDAS_MAX, actual.vidas + 1);
        const proximaVidaEn = vidas < VIDAS_MAX ? Date.now() + TIEMPO_REGEN_MS : null;
        const nuevo = { ...actual, vidas, proximaVidaEn };

        if (logueado && usuario) {
          supabase
            .from("usuarios")
            .update({ vidas, proxima_vida_at: proximaVidaEn ? new Date(proximaVidaEn).toISOString() : null })
            .eq("id", usuario.id);
        } else {
          guardarEstadoVidas({ vidas, proximaVidaEn });
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
      const nuevo = { ...actual, vidas, proximaVidaEn };

      if (logueado && usuario) {
        supabase
          .from("usuarios")
          .update({ vidas, proxima_vida_at: proximaVidaEn ? new Date(proximaVidaEn).toISOString() : null })
          .eq("id", usuario.id);
      } else {
        guardarEstadoVidas({ vidas, proximaVidaEn });
      }

      return nuevo;
    });
  }, [logueado, usuario]);

  const avanzarNivel = useCallback(
    (nuevoNivel: number) => {
      setEstado((actual) => ({ ...actual, nivel: nuevoNivel }));

      if (logueado && usuario) {
        supabase.from("usuarios").update({ progreso_carrera: nuevoNivel }).eq("id", usuario.id);
      } else {
        guardarProgresoCarrera(nuevoNivel);
      }
    },
    [logueado, usuario]
  );

  return {
    vidas: estado.vidas,
    proximaVidaEn: estado.proximaVidaEn,
    nivel: estado.nivel,
    gemas: estado.gemas,
    cargado,
    perderVida,
    avanzarNivel,
  };
}