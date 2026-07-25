"use client";

import { motion } from "framer-motion";

interface PantallaResultadoProps {
  puntaje: number;
  total: number;
  vidas: number;
  onJugarDeNuevo: () => void;
}

export default function PantallaResultado({
  puntaje,
  total,
  vidas,
  onJugarDeNuevo,
}: PantallaResultadoProps) {
  let frase = "la próxima la sacás";
  if (vidas <= 0) frase = "te quedaste sin vidas, pibe";
  else if (total > 0 && puntaje / total >= 0.7) frase = "¡qué genio, che!";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center w-full px-2 flex-1 justify-center"
    >
      <motion.p
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="font-script text-2xl text-dorado-claro"
      >
        {frase}
      </motion.p>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 140 }}
        className="font-display text-8xl md:text-9xl text-crema my-2"
        style={{ textShadow: "3px 3px 0 #b5342a" }}
      >
        {puntaje}
      </motion.div>

      <p className="font-body text-crema/70 text-sm mb-8 text-center">
        respuestas correctas sobre {total}
      </p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onJugarDeNuevo}
        className="w-full bg-gradient-to-b from-linea-rojo to-[#7a2119] rounded-2xl px-5 py-4 flex items-center justify-between text-crema shadow-[0_4px_0_#5a1811]"
      >
        <span className="font-heading text-lg tracking-wide">JUGAR DE NUEVO</span>
        <span className="font-display bg-crema text-tinta rounded-lg px-3 py-0.5 text-xl">↻</span>
      </motion.button>
    </motion.section>
  );
}
