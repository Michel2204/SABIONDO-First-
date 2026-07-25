"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useSala } from "@/lib/useSala";
import { finalizarSala, Sala } from "@/lib/salas";
import {
  DificultadAhorcado,
  EstadoAhorcado,
  MAX_ERRORES,
  obtenerPalabraAleatoria,
  palabraCompleta,
} from "@/lib/ahorcadoApi";
import { supabase } from "@/lib/supabaseClient";

const ALFABETO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

interface PantallaAhorcadoProps {
  salaInicial: Sala;
  usuarioId: string;
  dificultad: DificultadAhorcado; // elegida en el lobby antes de crear la sala
  onSalir: () => void;
}

export default function PantallaAhorcado({ salaInicial, usuarioId, dificultad, onSalir }: PantallaAhorcadoProps) {
  const { sala, rivalConectado, cargado } = useSala(salaInicial.id, usuarioId);
  const salaActual = sala ?? salaInicial;
  const esCreador = salaActual.creador_id === usuarioId;
  const estadoJuego = salaActual.estado_juego as EstadoAhorcado | null;

  const [inicializando, setInicializando] = useState(false);

  // Solo el creador elige la palabra inicial, una vez que el rival ya está en la sala
  useEffect(() => {
    if (!estadoJuego?.palabra && esCreador && rivalConectado && !inicializando) {
      setInicializando(true);
      obtenerPalabraAleatoria(dificultad).then(async (palabra) => {
        const nuevoEstado: EstadoAhorcado = {
          palabra,
          dificultad,
          letrasProbadas: [],
          errores: 0,
          turno: salaActual.creador_id, // arranca el creador
        };
        await supabase.from("salas").update({ estado_juego: nuevoEstado }).eq("id", salaActual.id);
      });
    }
  }, [estadoJuego?.palabra, esCreador, rivalConectado, inicializando, dificultad, salaActual]);

  if (!cargado || !rivalConectado) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-lg font-semibold">Esperando al rival…</p>
        {salaActual.codigo && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm opacity-70">Compartí este código:</p>
            <span className="text-3xl font-bold tracking-widest">{salaActual.codigo}</span>
          </div>
        )}
        <button onClick={onSalir} className="mt-4 rounded-full px-6 py-2 text-sm underline opacity-70">
          Cancelar
        </button>
      </div>
    );
  }

  if (!estadoJuego?.palabra) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="font-body text-crema/60 text-sm">preparando la palabra...</span>
      </div>
    );
  }

  const { palabra, letrasProbadas, errores, turno } = estadoJuego;
  const esMiTurno = turno === usuarioId;
  const gano = palabraCompleta(palabra, letrasProbadas);
  const perdio = errores >= MAX_ERRORES;
  const terminado = gano || perdio;

  async function elegirLetra(letra: string) {
    if (!esMiTurno || terminado || letrasProbadas.includes(letra)) return;

    const acierto = palabra.includes(letra);
    const nuevoEstado: EstadoAhorcado = {
      ...estadoJuego,
      letrasProbadas: [...letrasProbadas, letra],
      errores: acierto ? errores : errores + 1,
      turno: esCreador ? salaActual.oponente_id! : salaActual.creador_id, // pasa el turno siempre, acierte o no
    };

    await supabase.from("salas").update({ estado_juego: nuevoEstado }).eq("id", salaActual.id);

    const seCompleto = palabraCompleta(palabra, nuevoEstado.letrasProbadas);
    if (seCompleto || nuevoEstado.errores >= MAX_ERRORES) {
      await finalizarSala(salaActual.id);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4 max-w-xl mx-auto">
      <div className="flex justify-between items-center w-full">
        <button onClick={onSalir} className="border-2 border-dorado text-dorado-claro font-heading text-xs rounded-lg px-3 py-1.5">
          ‹ SALIR
        </button>
        <span className="font-heading text-xs uppercase tracking-widest text-crema/60">
          {dificultad} · errores: {errores}/{MAX_ERRORES}
        </span>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {palabra.split("").map((letra, i) => (
          <span
            key={i}
            className="w-8 h-10 flex items-center justify-center border-b-2 border-dorado font-heading text-xl text-crema"
          >
            {letrasProbadas.includes(letra) || terminado ? letra : ""}
          </span>
        ))}
      </div>

      {!terminado && (
        <p className="font-body text-sm text-crema/80">
          {esMiTurno ? "Tu turno — elegí una letra" : "Turno del rival, esperá..."}
        </p>
      )}

      <div className="grid grid-cols-7 gap-1.5">
        {ALFABETO.map((letra) => {
          const usada = letrasProbadas.includes(letra);
          const acierto = usada && palabra.includes(letra);
          return (
            <button
              key={letra}
              disabled={usada || !esMiTurno || terminado}
              onClick={() => elegirLetra(letra)}
              className={clsx(
                "w-8 h-8 rounded-md font-heading text-sm border-2 transition-colors",
                !usada && "bg-omnibus border-dorado text-crema disabled:opacity-40",
                usada && acierto && "bg-linea-verde border-dorado-claro text-crema",
                usada && !acierto && "bg-linea-rojo border-dorado-claro text-crema"
              )}
            >
              {letra}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {terminado && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mt-4"
          >
            <p className={clsx("text-2xl font-bold", gano ? "text-green-500" : "text-red-500")}>
              {gano ? "¡La adivinaron! 🎉" : `Se les acabaron los intentos 😅 (era "${palabra}")`}
            </p>
            <button
              onClick={onSalir}
              className="font-display text-lg tracking-wide bg-dorado-claro text-tinta rounded-full px-8 py-3 shadow-chapa"
            >
              VOLVER AL MENÚ
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}