"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sala,
  crearSalaPublica,
  crearSalaPrivada,
  listarSalasPublicas,
  unirseSalaPublica,
  unirsePorCodigo,
  buscarRival,
} from "@/lib/salas";

interface PantallaSalasProps {
  usuarioId: string;
  onSalaLista: (sala: Sala) => void;
  onVolver: () => void;
}

export default function PantallaSalas({ usuarioId, onSalaLista, onVolver }: PantallaSalasProps) {
  const [salasPublicas, setSalasPublicas] = useState<Sala[]>([]);
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarSalas();
  }, []);

  async function cargarSalas() {
    try {
      const salas = await listarSalasPublicas();
      setSalasPublicas(salas);
    } catch {
      setError("No se pudieron cargar las salas");
    }
  }

  async function manejarBuscarRival() {
    setCargando(true);
    setError(null);
    try {
      const sala = await buscarRival(usuarioId);
      onSalaLista(sala);
    } catch {
      setError("No se pudo buscar rival, probá de nuevo");
    } finally {
      setCargando(false);
    }
  }

  async function manejarCrearPrivada() {
    setCargando(true);
    setError(null);
    try {
      const sala = await crearSalaPrivada(usuarioId);
      onSalaLista(sala);
    } catch {
      setError("No se pudo crear la sala privada");
    } finally {
      setCargando(false);
    }
  }

  async function manejarUnirsePublica(salaId: string) {
    setCargando(true);
    setError(null);
    try {
      const sala = await unirseSalaPublica(salaId, usuarioId);
      onSalaLista(sala);
    } catch {
      setError("Esa sala ya no está disponible");
      cargarSalas();
    } finally {
      setCargando(false);
    }
  }

  async function manejarUnirsePorCodigo() {
    if (codigoIngresado.trim().length !== 6) {
      setError("El código tiene que tener 6 caracteres");
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const sala = await unirsePorCodigo(codigoIngresado);
      onSalaLista(sala);
    } catch {
      setError("Código inválido o la sala ya no está disponible");
    } finally {
      setCargando(false);
    }
  }

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

      <h2 className="font-display text-3xl text-crema mb-6 text-center">DUELO 1 vs 1</h2>

      {error && (
        <p className="font-body text-linea-rojo text-sm mb-4 text-center">{error}</p>
      )}

      <motion.button
        onClick={manejarBuscarRival}
        disabled={cargando}
        whileHover={{ scale: cargando ? 1 : 1.02 }}
        whileTap={{ scale: cargando ? 1 : 0.97 }}
        className="w-full bg-gradient-to-b from-linea-verde to-[#28512f] rounded-2xl px-5 py-4 text-crema font-heading text-lg tracking-wide mb-3 disabled:opacity-50"
      >
        {cargando ? "BUSCANDO..." : "⚡ BUSCAR RIVAL RÁPIDO"}
      </motion.button>

      <button
        onClick={manejarCrearPrivada}
        disabled={cargando}
        className="w-full border-2 border-dorado text-dorado-claro font-heading text-sm rounded-xl px-5 py-3 mb-6 disabled:opacity-50"
      >
        CREAR SALA PRIVADA
      </button>

      <div className="w-full flex gap-2 mb-8">
        <input
          value={codigoIngresado}
          onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
          maxLength={6}
          placeholder="CÓDIGO"
          className="flex-1 bg-crema text-tinta font-heading text-center tracking-[4px] rounded-xl px-3 py-2.5 uppercase"
        />
        <button
          onClick={manejarUnirsePorCodigo}
          disabled={cargando}
          className="bg-dorado-claro text-tinta font-heading text-sm rounded-xl px-4 disabled:opacity-50"
        >
          UNIRSE
        </button>
      </div>

      <div className="w-full">
        <p className="font-heading text-[11px] tracking-widest text-dorado-claro mb-2">
          SALAS PÚBLICAS ESPERANDO
        </p>

        {salasPublicas.length === 0 && (
          <p className="font-body text-crema/50 text-sm text-center py-4">
            no hay salas esperando ahora
          </p>
        )}

        <div className="flex flex-col gap-2">
          {salasPublicas.map((sala) => (
            <button
              key={sala.id}
              onClick={() => manejarUnirsePublica(sala.id)}
              disabled={cargando}
              className="w-full bg-omnibus border border-dorado/60 rounded-xl px-4 py-3 flex justify-between items-center text-crema disabled:opacity-50"
            >
              <span className="font-body text-sm">
                sala #{sala.id.slice(0, 6)}
              </span>
              <span className="font-heading text-xs text-dorado-claro">UNIRSE ›</span>
            </button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}