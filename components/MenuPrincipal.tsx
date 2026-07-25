"use client";

import { motion } from "framer-motion";
import { Modo } from "@/lib/types";
import BotonGoogle from "./BotonGoogle";

interface MenuPrincipalProps {
  onSeleccionarModo: (modo: Modo) => void;
}

const modos: { modo: Modo; titulo: string; linea: string; clase: string }[] = [
  {
    modo: "carrera",
    titulo: "MODO CARRERA",
    linea: "100",
    clase: "from-linea-naranja to-[#8f491f] shadow-[0_4px_0_#6b3717]",
  },
  {
    modo: "clasico",
    titulo: "MODO CLÁSICO",
    linea: "60",
    clase: "from-linea-rojo to-[#7a2119] shadow-[0_4px_0_#5a1811]",
  },
  {
    modo: "duelo",
    titulo: "DUELO 1 vs 1",
    linea: "152",
    clase: "from-linea-azul to-[#1c4166] shadow-[0_4px_0_#123049]",
  },
  {
    modo: "contrarreloj",
    titulo: "CONTRARRELOJ",
    linea: "39",
    clase: "from-linea-verde to-[#28512f] shadow-[0_4px_0_#1a3620]",
  },
];

export default function MenuPrincipal({ onSeleccionarModo }: MenuPrincipalProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center w-full px-2"
    >
      <div className="w-full flex justify-end">
        <BotonGoogle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mt-2 mb-2"
      >
        <span className="font-script text-dorado-claro text-lg block -rotate-2 -mb-1.5">
          che, ¿sabés o no sabés?
        </span>
        <h1
          className="font-display text-6xl md:text-7xl tracking-wide text-crema leading-none"
          style={{
            textShadow: "3px 3px 0 #d9a441, -1px -1px 0 #b5342a",
          }}
        >
          SABIONDO
        </h1>
        <span className="font-script text-dorado-claro text-base block mt-1 opacity-90">
          el juego de preguntas a la criolla
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, rotate: -6, y: -6 }}
        animate={{ opacity: 1, rotate: -1.5, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-crema text-tinta font-display text-sm tracking-widest px-4 py-1 rounded border-2 border-tinta mt-4"
      >
        EDICIÓN DE COLECCIÓN
      </motion.div>

      <div className="flex flex-col gap-3.5 w-full mt-8">
        {modos.map((m, i) => (
          <motion.button
            key={m.modo}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.1, duration: 0.35 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={() => onSeleccionarModo(m.modo)}
            className={`bg-gradient-to-b ${m.clase} rounded-2xl px-5 py-4 flex items-center justify-between text-crema border border-black/10`}
          >
            <span className="font-heading text-lg tracking-wide">{m.titulo}</span>
            <span className="font-display bg-crema text-tinta rounded-lg px-3 py-0.5 text-xl min-w-[42px] text-center">
              {m.linea}
            </span>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.9 }}
        className="font-body text-[11px] text-crema mt-auto pt-10 text-center"
      >
        hecho con fileteado y mucho amor porteño
      </motion.p>
    </motion.section>
  );
}
