"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import ConsolaJuego from "@/components/ConsolaJuego";
import MenuPrincipal from "@/components/MenuPrincipal";
import RuedaCategorias from "@/components/RuedaCategorias";
import TarjetaPregunta from "@/components/TarjetaPregunta";
import PantallaResultado from "@/components/PantallaResultado";
import PantallaCarrera from "@/components/PantallaCarrera";
import PantallaSalas from "@/components/PantallaSalas";
import PantallaAhorcado from "@/components/PantallaAhoracado";
import SelectorDificultadAhorcado from "@/components/SelectorDificultadAhorcado";
import EsperaVidas from "@/components/EsperaVidas";
import { obtenerPreguntasClasico } from "@/lib/preguntasApi";
import { useAuth } from "@/lib/useAuth";
import { usePerfilJuego } from "@/lib/usePerfilJuego";
import { VIDAS_MAX } from "@/lib/vidasCarrera";
import { Sala } from "@/lib/salas";
import { Categoria, Modo, Pantalla, Pregunta } from "@/lib/types";
import { DificultadAhorcado } from "@/lib/ahorcadoApi";
import PantallaDuelo from "@/components/PantallaDuelo";

const PREGUNTAS_POR_PARTIDA = 6;

export default function Home() {
  const { usuario, logueado } = useAuth();
  const { vidas, proximaVidaEn, nivel, cargado: perfilCargado, perderVida, avanzarNivel } = usePerfilJuego();

  const [pantalla, setPantalla] = useState<Pantalla>("menu");
  const [modo, setModo] = useState<Modo>("clasico");
  const [puntaje, setPuntaje] = useState(0);
  const [totalRespondidas, setTotalRespondidas] = useState(0);
  const [categoriaActual, setCategoriaActual] = useState<Categoria | null>(null);
  const [preguntaActual, setPreguntaActual] = useState<Pregunta | null>(null);
  const [salaActual, setSalaActual] = useState<Sala | null>(null);
  const [dificultadAhorcado, setDificultadAhorcado] = useState<DificultadAhorcado>("facil");
  const [ahora, setAhora] = useState(Date.now());

  // Tick del reloj de espera de vidas, compartido por Clásico y Carrera
  useEffect(() => {
    if (!perfilCargado || vidas >= VIDAS_MAX || proximaVidaEn === null) return;
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [perfilCargado, vidas, proximaVidaEn]);

  const sinVidas = perfilCargado && vidas <= 0;
  const msRestantes = proximaVidaEn ? proximaVidaEn - ahora : 0;

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

    if (m === "ahorcado") {
      if (!logueado) {
        alert("Para jugar Ahorcado primero iniciá sesión con Google");
        return;
      }
      setPantalla("ahorcado-dificultad");
      return;
    }

    setPuntaje(0);
    setTotalRespondidas(0);
    setPantalla("rueda");
  }

  function elegirDificultadAhorcado(dificultad: DificultadAhorcado) {
    setDificultadAhorcado(dificultad);
    setPantalla("salas");
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
      perderVida();
    }
  }

  function siguientePregunta() {
    const totalActual = totalRespondidas;
    if (vidas <= 0 || totalActual >= PREGUNTAS_POR_PARTIDA) {
      setPantalla("resultado");
    } else {
      setPantalla("rueda");
    }
  }

  function salaLista(sala: Sala) {
    setSalaActual(sala);
    setPantalla(modo === "ahorcado" ? "ahorcado" : "duelo");
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
            <PantallaCarrera
              key="carrera"
              vidas={vidas}
              proximaVidaEn={proximaVidaEn}
              ahora={ahora}
              nivel={nivel}
              cargado={perfilCargado}
              perderVida={perderVida}
              avanzarNivel={avanzarNivel}
              onVolver={volverAlMenu}
            />
          )}

          {pantalla === "ahorcado-dificultad" && (
            <SelectorDificultadAhorcado
              key="ahorcado-dificultad"
              onElegir={elegirDificultadAhorcado}
              onVolver={volverAlMenu}
            />
          )}

          {pantalla === "duelo" && salaActual && usuario && (
            <PantallaDuelo
              key="duelo"
              salaInicial={salaActual}
              usuarioId={usuario.id}
              onSalir={volverAlMenu}
            />
          )}

          {pantalla === "ahorcado" && salaActual && usuario && (
            <PantallaAhorcado
              key="ahorcado"
              salaInicial={salaActual}
              usuarioId={usuario.id}
              dificultad={dificultadAhorcado}
              onSalir={volverAlMenu}
            />
          )}

          {pantalla === "salas" && usuario && (
            <PantallaSalas
              key="salas"
              usuarioId={usuario.id}
              juego={modo === "ahorcado" ? "ahorcado" : "trivia"}
              onSalaLista={salaLista}
              onVolver={volverAlMenu}
            />
          )}

          {pantalla === "rueda" && (
            sinVidas ? (
              <EsperaVidas key="espera-clasico-rueda" msRestantes={msRestantes} onVolver={volverAlMenu} />
            ) : (
              <RuedaCategorias
                key="rueda"
                vidas={vidas}
                onCategoriaElegida={elegirCategoria}
                onVolver={volverAlMenu}
              />
            )
          )}

          {pantalla === "pregunta" && categoriaActual && preguntaActual && (
            sinVidas ? (
              <EsperaVidas key="espera-clasico-pregunta" msRestantes={msRestantes} onVolver={volverAlMenu} />
            ) : (
              <TarjetaPregunta
                key="pregunta"
                categoria={categoriaActual}
                pregunta={preguntaActual}
                vidas={vidas}
                onResponder={responder}
                onSiguiente={siguientePregunta}
                onSalir={volverAlMenu}
              />
            )
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