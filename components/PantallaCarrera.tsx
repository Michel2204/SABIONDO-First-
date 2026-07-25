"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { NIVEL_MAX } from "@/lib/progresoCarrera";
import { obtenerPreguntaDePool, obtenerDificultad, dificultadKeyPorNivel } from "@/lib/preguntasCarrera";
import { obtenerPoolCarrera } from "@/lib/preguntasApi";
import { Pregunta } from "@/lib/types";
import IndicadorVidas from "@/components/IndicadorVidas";
import EsperaVidas from "@/components/EsperaVidas";
import { useEffect } from "react";

interface PantallaCarreraProps {
  vidas: number;
  proximaVidaEn: number | null;
  ahora: number;
  nivel: number;
  cargado: boolean;
  perderVida: () => void;
  avanzarNivel: (nuevoNivel: number) => void;
  onVolver: () => void;
}

export default function PantallaCarrera({
  vidas,
  proximaVidaEn,
  ahora,
  nivel,
  cargado,
  perderVida,
  avanzarNivel,
  onVolver,
}: PantallaCarreraProps) {
  const [seleccion, setSeleccion] = useState<number | null>(null);

  const [pool, setPool] = useState<Pregunta[] | null>(null);
  const dificultadKey = dificultadKeyPorNivel(nivel);

  useEffect(() => {
    let cancelado = false;
    setPool(null);
    obtenerPoolCarrera(dificultadKey).then((p) => {
      if (!cancelado) setPool(p);
    });
    return () => { cancelado = true; };
  }, [dificultadKey]);

  const pregunta = useMemo(
    () => (pool ? obtenerPreguntaDePool(nivel, pool) : null),
    [nivel, pool]
  );

  if (!cargado || !pregunta) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="font-body text-crema/60 text-sm">cargando...</span>
      </div>
    );
  }

  if (nivel > NIVEL_MAX) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center w-full px-2 flex-1 justify-center text-center"
      >
        <span className="text-5xl mb-3">🏆</span>
        <p className="font-script text-2xl text-dorado-claro mb-2">¡recorriste toda la línea!</p>
        <p className="font-body text-crema/70 text-sm mb-8">
          llegaste a la pregunta {NIVEL_MAX} de {NIVEL_MAX}
        </p>
        <button
          onClick={onVolver}
          className="font-display text-lg tracking-wide bg-dorado-claro text-tinta rounded-full px-8 py-3 shadow-chapa"
        >
          VOLVER AL MENÚ
        </button>
      </motion.section>
    );
  }

  if (vidas <= 0) {
    const msRestantes = proximaVidaEn ? proximaVidaEn - ahora : 0;
    return <EsperaVidas msRestantes={msRestantes} onVolver={onVolver} />;
  }

  const dificultad = obtenerDificultad(nivel);

  const elegir = (i: number) => {
    if (seleccion !== null) return;
    setSeleccion(i);
    if (i !== pregunta.respuestaCorrecta) {
      perderVida();
    }
  };

  const siguiente = () => {
    const esCorrecta = seleccion === pregunta.respuestaCorrecta;
    const nuevoNivel = esCorrecta ? nivel + 1 : nivel;
    avanzarNivel(nuevoNivel);
    setSeleccion(null);
  };

  return (
    <motion.section
      key={nivel}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center w-full px-2"
    >
      <div className="flex justify-between items-center w-full mb-4">
        <button
          onClick={onVolver}
          className="border-2 border-dorado text-dorado-claro font-heading text-xs rounded-lg px-3 py-1.5"
        >
          ‹ SALIR
        </button>
        <IndicadorVidas vidas={vidas} total={5} />
      </div>

      <div className="w-full mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-heading text-[11px] tracking-widest text-dorado-claro">
            PARADA {nivel} / {NIVEL_MAX}
          </span>
          <span className="font-heading text-[10px] tracking-widest uppercase text-crema/60">
            {dificultad}
          </span>
        </div>
        <div className="w-full h-1.5 bg-tinta/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-dorado-claro"
            initial={false}
            animate={{ width: `${(nivel / NIVEL_MAX) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="bg-crema text-tinta rounded-2xl p-5 w-full border-[3px] border-dorado shadow-chapa relative textura-papel">
        <p className="font-heading text-lg leading-snug relative z-10">{pregunta.texto}</p>

        <div className="flex flex-col gap-2.5 mt-5 relative z-10">
          {pregunta.opciones.map((op, i) => {
            const esCorrecta = i === pregunta.respuestaCorrecta;
            const esElegida = i === seleccion;
            const mostrar = seleccion !== null;

            return (
              <motion.button
                key={i}
                disabled={seleccion !== null}
                onClick={() => elegir(i)}
                whileHover={seleccion === null ? { scale: 1.015 } : {}}
                whileTap={seleccion === null ? { scale: 0.98 } : {}}
                className={clsx(
                  "font-body font-semibold text-left text-[15px] rounded-xl px-4 py-3 border-2 transition-colors",
                  !mostrar && "bg-omnibus border-dorado text-crema",
                  mostrar && esCorrecta && "bg-linea-verde border-dorado-claro text-crema",
                  mostrar &&
                    esElegida &&
                    !esCorrecta &&
                    "bg-linea-rojo border-dorado-claro text-crema",
                  mostrar && !esCorrecta && !esElegida && "bg-omnibus/40 border-dorado/40 text-crema/60"
                )}
              >
                {op}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {seleccion !== null && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={siguiente}
            className="mt-6 font-display text-lg tracking-wide bg-dorado-claro text-tinta rounded-full px-8 py-3 shadow-chapa"
          >
            SEGUIR VIAJE ›
          </motion.button>
        )}
      </AnimatePresence>
    </motion.section>
  );
}