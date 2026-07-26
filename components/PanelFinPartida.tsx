"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { registrarResultado, obtenerHistorialVersus, HistorialVersus } from "@/lib/historial";

interface PanelFinPartidaProps {
  juego: string;
  salaId: string;
  usuarioId: string;
  rivalId: string | null;
  miNombre: string;
  rivalNombre: string;
  mensaje: string;
  ganoYo: boolean;
  empate: boolean;
  yoQuieroRevancha: boolean;
  rivalQuiereRevancha: boolean;
  reiniciandoRevancha: boolean;
  onPedirRevancha: () => void;
  onNuevaBusqueda: () => void;
  onSalir: () => void;
}

export default function PanelFinPartida({
  juego,
  salaId,
  usuarioId,
  rivalId,
  miNombre,
  rivalNombre,
  mensaje,
  ganoYo,
  empate,
  yoQuieroRevancha,
  rivalQuiereRevancha,
  reiniciandoRevancha,
  onPedirRevancha,
  onNuevaBusqueda,
  onSalir,
}: PanelFinPartidaProps) {
  const [historial, setHistorial] = useState<HistorialVersus | null>(null);
  const yaRegistrado = useRef(false);

  useEffect(() => {
    if (yaRegistrado.current || !rivalId) return;
    yaRegistrado.current = true;
    const ganadorId = empate ? null : ganoYo ? usuarioId : rivalId;
    registrarResultado(salaId, juego, usuarioId, rivalId, ganadorId);
  }, [salaId, juego, usuarioId, rivalId, ganoYo, empate]);

  useEffect(() => {
    if (!rivalId) return;
    let cancelado = false;
    const id = setTimeout(async () => {
      const datos = await obtenerHistorialVersus(juego, usuarioId, rivalId);
      if (!cancelado) setHistorial(datos);
    }, 400);
    return () => {
      cancelado = true;
      clearTimeout(id);
    };
  }, [juego, usuarioId, rivalId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 mt-4"
    >
      <p className={clsx("text-2xl font-bold", empate ? "text-crema" : ganoYo ? "text-green-500" : "text-red-500")}>
        {mensaje}
      </p>

      {historial && rivalId && (
        <p className="font-body text-xs text-crema/60 text-center">
          Contra {rivalNombre}: le ganaste {historial.misVictorias} · te ganó {historial.rivalVictorias}
          {historial.empates > 0 ? ` · empataron ${historial.empates}` : ""}
        </p>
      )}

      {reiniciandoRevancha ? (
        <p className="font-body text-sm text-crema/70">Armando la revancha...</p>
      ) : yoQuieroRevancha ? (
        <p className="font-body text-sm text-crema/70">
          Esperando a que {rivalNombre} acepte la revancha...
        </p>
      ) : (
        <div className="flex flex-col items-center gap-3">
          {rivalQuiereRevancha && (
            <p className="font-body text-xs text-linea-violeta text-center">
              {rivalNombre} quiere revancha 👀
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onPedirRevancha}
              className="font-display text-base tracking-wide bg-linea-violeta text-crema rounded-full px-6 py-3 shadow-chapa"
            >
              🔁 REVANCHA
            </button>
            <button
              onClick={onNuevaBusqueda}
              className="font-display text-base tracking-wide bg-dorado-claro text-tinta rounded-full px-6 py-3 shadow-chapa"
            >
              BUSCAR OTRO RIVAL
            </button>
          </div>
          <button onClick={onSalir} className="font-body text-xs underline text-crema/50 mt-1">
            volver al menú principal
          </button>
        </div>
      )}
    </motion.div>
  );
}