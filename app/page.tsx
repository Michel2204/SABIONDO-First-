"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ConsolaJuego from "@/components/ConsolaJuego";
import MenuPrincipal from "@/components/MenuPrincipal";
import RuedaCategorias from "@/components/RuedaCategorias";
import TarjetaPregunta from "@/components/TarjetaPregunta";
import PantallaResultado from "@/components/PantallaResultado";
import PantallaCarrera from "@/components/PantallaCarrera";
import PantallaSalas from "@/components/PantallaSalas";
import { obtenerPreguntasClasico } from "@/lib/preguntasApi";
import { useAuth } from "@/lib/useAuth";
import { Sala } from "@/lib/salas";
import { Categoria, Modo, Pantalla, Pregunta } from "@/lib/types";
import PantallaDuelo from "@/components/PantallaDuelo";

const PREGUNTAS_POR_PARTIDA = 6;
const VIDAS_INICIALES = 3;

export default function Home() {
  const { usuario, logueado } = useAuth();
  const [pantalla, setPantalla] = useState<Pantalla>("menu");
  const [, setModo] = useState<Modo>("clasico");
  const [vidas, setVidas] = useState(VIDAS_INICIALES);
  const [puntaje, setPuntaje] = useState(0);
  const [totalRespondidas, setTotalRespondidas] = useState(0);
  const [categoriaActual, setCategoriaActual] = useState<Categoria | null>(null);
  const [preguntaActual, setPreguntaActual] = useState<Pregunta | null>(null);
  const [salaActual, setSalaActual] = useState<Sala | null>(null);

  function iniciarPartida(m: Modo) {
    setModo(m);

    if (m === "carrera") {
      setPantalla("carrera");
      return;
    }

    if (m === "duelo") {
      if (!logueado) {
        alert("Para jugar Duelo 1 vs 1 primero iniciá sesión con Google");
        return;
      }
      setPantalla("salas");
      return;
    }

    setVidas(VIDAS_INICIALES);
    setPuntaje(0);
    setTotalRespondidas(0);
    setPantalla("rueda");
  }

  async function elegirCategoria(categoria: Categoria) {
  const preguntas = await obtenerPreguntasClasico(categoria.nombre);
  const pregunta = preguntas[Math.floor(Math.random() * preguntas.length)];
  setCategoriaActual(categoria);
  setPreguntaActual(pregunta);
  setPantalla("pregunta");
}

  function responder(correcta: boolean) {
    setTotalRespondidas((t) => t + 1);
    if (correcta) {
      setPuntaje((p) => p + 1);
    } else {
      setVidas((v) => v - 1);
    }
  }

  function siguientePregunta() {
    const vidasRestantes = vidas;
    const totalActual = totalRespondidas;
    if (vidasRestantes <= 0 || totalActual >= PREGUNTAS_POR_PARTIDA) {
      setPantalla("resultado");
    } else {
      setPantalla("rueda");
    }
  }

  function salaLista(sala: Sala) {
    setSalaActual(sala);
    setPantalla("duelo");
  }

  function volverAlMenu() {
    setSalaActual(null);
    setPantalla("menu");
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 md:p-6">
      <ConsolaJuego>
        <AnimatePresence mode="wait">
          {pantalla === "menu" && (
            <MenuPrincipal key="menu" onSeleccionarModo={iniciarPartida} />
          )}

          {pantalla === "carrera" && (
            <PantallaCarrera key="carrera" onVolver={volverAlMenu} />
          )}  
            {pantalla === "duelo" && salaActual && usuario && (
              <PantallaDuelo
                key="duelo"
                salaInicial={salaActual}
                usuarioId={usuario.id}
                onSalir={volverAlMenu}
  />
)}

          {pantalla === "salas" && usuario && (
            <PantallaSalas
              key="salas"
              usuarioId={usuario.id}
              onSalaLista={salaLista}
              onVolver={volverAlMenu}
            />
          )}

          {pantalla === "rueda" && (
            <RuedaCategorias
              key="rueda"
              vidas={vidas}
              onCategoriaElegida={elegirCategoria}
              onVolver={volverAlMenu}
            />
          )}

          {pantalla === "pregunta" && categoriaActual && preguntaActual && (
            <TarjetaPregunta
              key="pregunta"
              categoria={categoriaActual}
              pregunta={preguntaActual}
              vidas={vidas}
              onResponder={responder}
              onSiguiente={siguientePregunta}
              onSalir={volverAlMenu}
            />
          )}

          {pantalla === "resultado" && (
            <PantallaResultado
              key="resultado"
              puntaje={puntaje}
              total={totalRespondidas}
              vidas={vidas}
              onJugarDeNuevo={volverAlMenu}
            />
          )}
        </AnimatePresence>
      </ConsolaJuego>
    </main>
  );
}