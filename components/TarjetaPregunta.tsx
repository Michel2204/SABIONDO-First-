"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Categoria, Pregunta } from "@/lib/types";
import IndicadorVidas from "./IndicadorVidas";
import clsx from "clsx";

interface TarjetaPreguntaProps {
  categoria: Categoria;
  pregunta: Pregunta;
  vidas: number;
  onResponder: (correcta: boolean) => void;
  onSiguiente: () => void;
  onSalir: () => void;
}

export default function TarjetaPregunta({
  categoria,
  pregunta,
  vidas,
  onResponder,
  onSiguiente,
  onSalir,
}: TarjetaPreguntaProps) {
  const [seleccion, setSeleccion] = useState<number | null>(null);

  function elegir(i: number) {
    if (seleccion !== null) return;
    setSeleccion(i);
    onResponder(i === pregunta.respuestaCorrecta);
  }

  return (
    <motion.section
      key={pregunta.texto}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center w-full px-2"
    >
      <div className="flex justify-between items-center w-full mb-4">
        <button
          onClick={onSalir}
          className="border-2 border-dorado text-dorado-claro font-heading text-xs rounded-lg px-3 py-1.5"
        >
          ‹ SALIR
        </button>
        <IndicadorVidas vidas={vidas} />
      </div>

      <div
        className="font-display text-sm tracking-widest px-4 py-1.5 rounded-lg text-crema mb-4 flex items-center gap-2 self-start"
        style={{ backgroundColor: categoria.color }}
      >
        <span className="bg-black/25 rounded px-2 py-0.5">{categoria.linea}</span>
        {categoria.nombre}
      </div>

      <div className="bg-crema text-tinta rounded-2xl p-5 w-full border-[3px] border-dorado shadow-chapa relative textura-papel">
  {pregunta.imagenUrl && (
    <img
      src={pregunta.imagenUrl}
      alt=""
      className="w-full h-40 object-cover rounded-xl mb-4 border-2 border-dorado"
    />
  )}
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
            onClick={onSiguiente}
            className="mt-6 font-display text-lg tracking-wide bg-dorado-claro text-tinta rounded-full px-8 py-3 shadow-chapa"
          >
            SEGUIR VIAJE ›
          </motion.button>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
