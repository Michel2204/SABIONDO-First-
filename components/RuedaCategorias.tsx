"use client";

import { useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { categorias } from "@/lib/categorias";
import { Categoria } from "@/lib/types";
import IndicadorVidas from "./IndicadorVidas";

interface RuedaCategoriasProps {
  vidas: number;
  onCategoriaElegida: (categoria: Categoria) => void;
  onVolver: () => void;
}

export default function RuedaCategorias({
  vidas,
  onCategoriaElegida,
  onVolver,
}: RuedaCategoriasProps) {
  const [girando, setGirando] = useState(false);
  const controls = useAnimationControls();
  const n = categorias.length;
  const porcion = 360 / n;

  const gradient = `conic-gradient(${categorias
    .map((c, i) => `${c.color} ${i * porcion}deg ${(i + 1) * porcion}deg`)
    .join(", ")})`;

  async function girar() {
    if (girando) return;
    setGirando(true);

    const idx = Math.floor(Math.random() * n);
    const vueltasExtra = 5 * 360;
    const offset = porcion * idx + porcion / 2;
    const anguloFinal = vueltasExtra + (360 - offset);

    await controls.start({
      rotate: anguloFinal,
      transition: { duration: 4.2, ease: [0.15, 0.85, 0.15, 1] },
    });

    setGirando(false);
    onCategoriaElegida(categorias[idx]);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center w-full px-2"
    >
      <div className="flex justify-between items-center w-full mb-1">
        <button
          onClick={onVolver}
          className="border-2 border-dorado text-dorado-claro font-heading text-xs rounded-lg px-3 py-1.5"
        >
          ‹ VOLVER
        </button>
        <IndicadorVidas vidas={vidas} />
      </div>

      <p className="font-script text-crema text-xl my-5 text-center">
        girá la rueda y elegí tu línea...
      </p>

      <div className="relative w-64 h-64 md:w-72 md:h-72 mx-auto">
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
          style={{
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "22px solid #f0c664",
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.4))",
          }}
        />

        <motion.div
          animate={controls}
          initial={{ rotate: 0 }}
          className="w-full h-full rounded-full border-[6px] border-dorado-claro relative"
          style={{
            background: gradient,
            boxShadow: "0 0 0 4px #140f0c, 0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {categorias.map((c, i) => {
            const mid = porcion * i + porcion / 2;
            return (
              <div
                key={c.id}
                className="absolute top-1/2 left-1/2 font-heading text-crema"
                style={{
                  width: "110px",
                  transformOrigin: "0 0",
                  transform: `rotate(${mid}deg) translate(4px, -1px)`,
                  fontSize: "13px",
                  textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
                }}
              >
                {c.linea}
              </div>
            );
          })}
        </motion.div>

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-[3px] border-dorado-claro bg-tinta flex items-center justify-center text-center z-10"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          <span className="text-dorado-claro text-[10px] leading-tight">SABIONDO</span>
        </div>
      </div>

      <motion.button
        onClick={girar}
        disabled={girando}
        whileHover={{ scale: girando ? 1 : 1.04 }}
        whileTap={{ scale: girando ? 1 : 0.96 }}
        className="mt-8 font-display text-2xl tracking-widest bg-dorado-claro text-tinta rounded-full px-10 py-3.5 shadow-chapa disabled:opacity-50"
      >
        {girando ? "GIRANDO..." : "¡DALE, GIRÁ!"}
      </motion.button>
    </motion.section>
  );
}
