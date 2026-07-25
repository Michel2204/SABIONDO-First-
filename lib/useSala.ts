"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { Sala } from "./salas";

interface RespuestaPayload {
  jugadorId: string;
  esCreador: boolean;
  puntaje: number;
}

export function useSala(salaIdInicial: string, usuarioId: string) {
  const [sala, setSala] = useState<Sala | null>(null);
  const [rivalConectado, setRivalConectado] = useState(false);
  const [cargado, setCargado] = useState(false);
  const canalRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function iniciar() {
      // 1) Trae el estado actual de la sala
      const { data } = await supabase
        .from("salas")
        .select()
        .eq("id", salaIdInicial)
        .single<Sala>();

      if (cancelado || !data) return;
      setSala(data);
      setCargado(true);

      // 2) Se suscribe al canal de esta sala puntual
      const canal = supabase.channel(`sala:${salaIdInicial}`, {
        config: { presence: { key: usuarioId } },
      });

      // Escucha cambios de la fila en la base (cuando se une el rival, cambia estado, etc.)
      canal.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "salas", filter: `id=eq.${salaIdInicial}` },
        (payload) => {
          setSala(payload.new as Sala);
        }
      );

      // Escucha respuestas del rival transmitidas en vivo (no pasan por la base)
      canal.on("broadcast", { event: "respuesta" }, ({ payload }) => {
        const { esCreador, puntaje } = payload as RespuestaPayload;
        setSala((actual) =>
          actual
            ? {
                ...actual,
                puntaje_creador: esCreador ? puntaje : actual.puntaje_creador,
                puntaje_oponente: esCreador ? actual.puntaje_oponente : puntaje,
              }
            : actual
        );
      });

      // Presence: sabe si el rival está conectado en este momento
      canal.on("presence", { event: "sync" }, () => {
        const estado = canal.presenceState();
        const conectados = Object.keys(estado);
        setRivalConectado(conectados.some((id) => id !== usuarioId));
      });

      canal.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await canal.track({ usuarioId, en: Date.now() });
        }
      });

      canalRef.current = canal;
    }

    iniciar();

    return () => {
      cancelado = true;
      if (canalRef.current) {
        supabase.removeChannel(canalRef.current);
        canalRef.current = null;
      }
    };
  }, [salaIdInicial, usuarioId]);

  /** Avisa al rival en vivo cuánto vas puntuando, sin esperar a la base */
  const enviarRespuesta = useCallback(
    (esCreador: boolean, puntaje: number) => {
      canalRef.current?.send({
        type: "broadcast",
        event: "respuesta",
        payload: { jugadorId: usuarioId, esCreador, puntaje } as RespuestaPayload,
      });
    },
    [usuarioId]
  );

  return { sala, rivalConectado, cargado, enviarRespuesta };
}