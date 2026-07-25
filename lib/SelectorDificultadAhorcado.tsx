"use client";

import { motion } from "framer-motion";
import { DificultadAhorcado } from "@/lib/ahorcadoApi";

interface SelectorDificultadAhorcadoProps {
  onElegir: (dificultad: DificultadAhorcado) => void;
  onVolver: () => void;
}

const opciones: { valor: DificultadAhorcado; titulo: string; clase: string }[] = [
  {
    valor: "facil",
    titulo: "FÁCIL",
    clase: "from-linea-verde to-[#28512f] shadow-[0_4px_0_#1a3620]",
  },
  {
    valor: "media",
    titulo: "MEDIA",
    clase: "from-dorado to-[#a9791f] shadow-[0_4px_0_#7a5716]",
  },
  {
    valor: "dificil",
    titulo: "DIFÍCIL",
    clase: "from-linea-rojo to-[#7a2119] shadow-[0_4px_0_#5a1811]",
  },
];

export default function SelectorDificultadAhorcado({
  onElegir,
  onVolver,
}: SelectorDificultadAhorcadoProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center w-full px-2"
    >
      <div className="flex justify-between items-center w-full mb-4">
        <button
          onClick={onVolver}
          className="border-2 border-dorado text-dorado-claro font-heading text-xs rounded-lg px-3 py-1.5"
        >
          ‹ VOLVER
        </button>
      </div>

      <span className="text-5xl mb-3">🔤</span>
      <h2 className="font-display text-3xl text-crema mb-2 text-center">AHORCADO</h2>
      <p className="font-body text-crema/70 text-sm mb-8 text-center">
        elegí la dificultad de la palabra
      </p>

      <div className="flex flex-col gap-3.5 w-full">
        {opciones.map((op, i) => (
          <motion.button
            key={op.valor}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.35 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={() => onElegir(op.valor)}
            className={`bg-gradient-to-b ${op.clase} rounded-2xl px-5 py-4 flex items-center justify-center text-crema border border-black/10`}
          >
            <span className="font-heading text-lg tracking-wide">{op.titulo}</span>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
