"use client";

import { motion } from "framer-motion";

interface IndicadorVidasProps {
  vidas: number;
  total?: number;
}

export default function IndicadorVidas({ vidas, total = 3 }: IndicadorVidasProps) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: total }).map((_, i) => {
        const activa = i < vidas;
        return (
          <motion.span
            key={i}
            initial={false}
            animate={{
              scale: activa ? 1 : 0.85,
              opacity: activa ? 1 : 0.25,
            }}
            transition={{ duration: 0.25 }}
            className="text-lg leading-none"
            style={{ color: "#f0c664" }}
          >
            ●
          </motion.span>
        );
      })}
    </div>
  );
}
