"use client";

import { motion } from "framer-motion";

interface EsperaVidasProps {
  msRestantes: number;
  onVolver: () => void;
}

function formatearTiempo(ms: number) {
  const totalSeg = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${seg.toString().padStart(2, "0")}`;
}

export default function EsperaVidas({ msRestantes, onVolver }: EsperaVidasProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center w-full px-2 flex-1 justify-center text-center"
    >
      <span className="text-5xl mb-3">🚌💤</span>
      <p className="font-script text-2xl text-dorado-claro mb-1">te quedaste sin vidas, che</p>
      <p className="font-body text-crema/70 text-sm mb-8">esperá y te sumamos una gratis</p>

      <div
        className="font-display text-6xl text-crema mb-8"
        style={{ textShadow: "3px 3px 0 #b5342a" }}
      >
        {formatearTiempo(msRestantes)}
      </div>

      <button
        onClick={onVolver}
        className="border-2 border-dorado text-dorado-claro font-heading text-xs rounded-lg px-4 py-2"
      >
        ‹ VOLVER AL MENÚ
      </button>
    </motion.section>
  );
}
