"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useSala } from "@/lib/useSala";
import { actualizarPuntaje, finalizarSala, Sala } from "@/lib/salas";
import { obtenerTodasClasico } from "@/lib/preguntasApi"; // CAMBIO: reemplaza el import de bancoPreguntas
import { Pregunta } from "@/lib/types";

const PREGUNTAS_POR_DUELO = 6;

interface PantallaDueloProps {
  salaInicial: Sala;
  usuarioId: string;
  onSalir: () => void;
}

/** RNG determinístico: con la misma semilla, los dos jugadores ven el mismo orden */
function mulberry32(semilla: number) {
  let s = semilla;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// CAMBIO: ahora recibe `todas` por parámetro en vez de leerlo de bancoPreguntas
function generarPreguntasDuelo(semilla: number, todas: Pregunta[], cantidad: number): Pregunta[] {
  const rand = mulberry32(semilla);
  const copia = [...todas];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, cantidad);
}

export default function PantallaDuelo({ salaInicial, usuarioId, onSalir }: PantallaDueloProps) {
  const { sala, rivalConectado, cargado, enviarRespuesta } = useSala(salaInicial.id, usuarioId);
  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [miPuntaje, setMiPuntaje] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const [mostrarCorreccion, setMostrarCorreccion] = useState(false);

  // CAMBIO: se fetchea una sola vez al montar la pantalla, no depende del nivel/sala
  const [todas, setTodas] = useState<Pregunta[] | null>(null);
  useEffect(() => {
    let cancelado = false;
    obtenerTodasClasico().then((p) => { if (!cancelado) setTodas(p); });
    return () => { cancelado = true; };
  }, []);

  const salaActual = sala ?? salaInicial;
  const esCreador = salaActual.creador_id === usuarioId;
  const rivalPuntaje = esCreador ? salaActual.puntaje_oponente : salaActual.puntaje_creador;

  // Mismo orden de preguntas para los dos jugadores, gracias a la semilla guardada en la sala
  const preguntas = useMemo(
    () => (todas ? generarPreguntasDuelo(salaActual.semilla, todas, PREGUNTAS_POR_DUELO) : []),
    [salaActual.semilla, todas] // CAMBIO: agregado `todas` a las dependencias
  );

  const preguntaActual: Pregunta | undefined = preguntas[indice];

  function elegirRespuesta(opcionIndex: number) {
    if (seleccion !== null || !preguntaActual) return;

    setSeleccion(opcionIndex);
    setMostrarCorreccion(true);

    const acerto = opcionIndex === preguntaActual.respuestaCorrecta;
    const nuevoPuntaje = acerto ? miPuntaje + 1 : miPuntaje;

    if (acerto) {
      setMiPuntaje(nuevoPuntaje);
      enviarRespuesta(esCreador, nuevoPuntaje);
      actualizarPuntaje(salaActual.id, esCreador, nuevoPuntaje).catch(() => {});
    }

    setTimeout(() => {
      setMostrarCorreccion(false);
      setSeleccion(null);

      if (indice + 1 < preguntas.length) {
        setIndice((i) => i + 1);
      } else {
        setTerminado(true);
        finalizarSala(salaActual.id).catch(() => {});
      }
    }, 1200);
  }

  // --- Esperando al rival ---
  if (!cargado || !todas) { // CAMBIO: agregado `|| !todas`
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-lg">Cargando duelo…</p>
      </div>
    );
  }

  if (salaActual.estado === "esperando" || !rivalConectado) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-lg font-semibold">Esperando al rival…</p>
        {salaActual.codigo && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm opacity-70">Compartí este código:</p>
            <span className="text-3xl font-bold tracking-widest">{salaActual.codigo}</span>
          </div>
        )}
        <button
          onClick={onSalir}
          className="mt-4 rounded-full px-6 py-2 text-sm underline opacity-70 hover:opacity-100"
        >
          Cancelar
        </button>
      </div>
    );
  }

  // --- Esperando que el rival termine sus preguntas ---
  if (terminado && salaActual.estado !== "finalizada") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-lg font-semibold">Ya respondiste todo 🎉</p>
        <p className="opacity-70">Esperando que tu rival termine…</p>
        <p className="text-sm opacity-50">Tu puntaje: {miPuntaje}</p>
      </div>
    );
  }

  // --- Resultado final ---
  if (terminado && salaActual.estado === "finalizada") {
    const resultado =
      miPuntaje > rivalPuntaje ? "ganaste" : miPuntaje < rivalPuntaje ? "perdiste" : "empate";

    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <h2
          className={clsx("text-3xl font-bold", {
            "text-green-500": resultado === "ganaste",
            "text-red-500": resultado === "perdiste",
            "text-yellow-500": resultado === "empate",
          })}
        >
          {resultado === "ganaste" && "¡Ganaste! 🏆"}
          {resultado === "perdiste" && "Perdiste 😅"}
          {resultado === "empate" && "¡Empate!"}
        </h2>
        <div className="flex gap-8 text-lg">
          <span>Vos: {miPuntaje}</span>
          <span>Rival: {rivalPuntaje}</span>
        </div>
        <button
          onClick={onSalir}
          className="rounded-full bg-red-600 px-6 py-2 text-white font-semibold hover:bg-red-700"
        >
          Volver al menú
        </button>
      </div>
    );
  }

  // --- Pregunta en curso ---
  if (!preguntaActual) return null;

  return (
    <div className="flex flex-col gap-6 py-8 px-4 max-w-xl mx-auto">
      <div className="flex justify-between text-sm opacity-70">
        <span>Pregunta {indice + 1} / {preguntas.length}</span>
        <span>Vos: {miPuntaje} · Rival: {rivalPuntaje}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={indice}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-4"
        >
          <h3 className="text-xl font-bold">{preguntaActual.texto}</h3>

          <div className="flex flex-col gap-3">
            {preguntaActual.opciones.map((opcion, i) => {
              const esCorrecta = i === preguntaActual.respuestaCorrecta;
              const esElegida = i === seleccion;

              return (
                <button
                  key={i}
                  onClick={() => elegirRespuesta(i)}
                  disabled={seleccion !== null}
                  className={clsx(
                    "rounded-xl border px-4 py-3 text-left transition-colors",
                    !mostrarCorreccion && "hover:bg-neutral-800",
                    mostrarCorreccion && esCorrecta && "bg-green-600 border-green-500 text-white",
                    mostrarCorreccion && esElegida && !esCorrecta && "bg-red-600 border-red-500 text-white",
                    !mostrarCorreccion && "border-neutral-700"
                  )}
                >
                  {opcion}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}