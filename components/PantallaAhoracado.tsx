"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useSala } from "@/lib/useSala";
import { finalizarSala, Sala } from "@/lib/salas";
import {
  DificultadAhorcado,
  EstadoAhorcado,
  MAX_ERRORES,
  obtenerPalabraAleatoria,
  palabraCompleta,
} from "@/lib/ahorcadoApi";
import { supabase } from "@/lib/supabaseClient";

const ALFABETO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

function normalizarPalabra(palabra: string) {
  return palabra
    .toUpperCase()
    .normalize("NFD")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0300-\u036f]/g, "") // saca los tildes, deja la Ñ intacta
    .replace(/Ü/g, "U"); // opcional: si no querés diéresis tampoco
}

interface PantallaAhorcadoProps {
  salaInicial: Sala;
  usuarioId: string;
  nombreJugador: string; // nombre visible del usuario logueado (para mostrar quién ganó)
  dificultad: DificultadAhorcado; // elegida en el lobby antes de crear la sala
  onSalir: () => void;
  onNuevaBusqueda: () => void; // cuando alguien no quiere revancha: vuelve a buscar sala, misma dificultad
}

export default function PantallaAhorcado({
  salaInicial,
  usuarioId,
  nombreJugador,
  dificultad,
  onSalir,
  onNuevaBusqueda,
}: PantallaAhorcadoProps) {
  const { sala, rivalConectado, cargado } = useSala(salaInicial.id, usuarioId);
  const salaActual = sala ?? salaInicial;
  const esCreador = salaActual.creador_id === usuarioId;
  const rivalId = esCreador ? salaActual.oponente_id : salaActual.creador_id;
  const estadoJuego = salaActual.estado_juego as EstadoAhorcado | null;

  const [inicializando, setInicializando] = useState(false);
  const [arriesgando, setArriesgando] = useState(false);
  const [palabraArriesgada, setPalabraArriesgada] = useState("");
  const [enviandoArriesgo, setEnviandoArriesgo] = useState(false);
  const [pidiendoRevancha, setPidiendoRevancha] = useState(false);
  const [reiniciandoRevancha, setReiniciandoRevancha] = useState(false);

  // Solo el creador elige la palabra inicial, una vez que el rival ya está en la sala
  useEffect(() => {
    if (!estadoJuego?.palabra && esCreador && rivalConectado && !inicializando) {
      setInicializando(true);
      obtenerPalabraAleatoria(dificultad).then(async (palabra) => {
        const nuevoEstado: EstadoAhorcado = {
          palabra: normalizarPalabra(palabra),
          dificultad,
          letrasProbadas: [],
          erroresPorJugador: {
            [salaActual.creador_id]: 0,
            [salaActual.oponente_id!]: 0,
          },
          arriesgoUsado: {
            [salaActual.creador_id]: false,
            [salaActual.oponente_id!]: false,
          },
          revanchaSolicitada: {},
          turno: salaActual.creador_id, // arranca el creador
          ganadorId: null,
          ganadorNombre: null,
        };
        await supabase.from("salas").update({ estado_juego: nuevoEstado }).eq("id", salaActual.id);
      });
    }
  }, [estadoJuego?.palabra, esCreador, rivalConectado, inicializando, dificultad, salaActual]);

  if (!cargado || !rivalConectado) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-lg font-semibold">Esperando al rival…</p>
        {salaActual.codigo && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm opacity-70">Compartí este código:</p>
            <span className="text-3xl font-bold tracking-widest">{salaActual.codigo}</span>
          </div>
        )}
        <button onClick={onSalir} className="mt-4 rounded-full px-6 py-2 text-sm underline opacity-70">
          Cancelar
        </button>
      </div>
    );
  }

  if (!estadoJuego?.palabra) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="font-body text-crema/60 text-sm">preparando la palabra...</span>
      </div>
    );
  }

  const { palabra, letrasProbadas, turno } = estadoJuego;
  const erroresPorJugador = estadoJuego.erroresPorJugador ?? {};
  const arriesgoUsado = estadoJuego.arriesgoUsado ?? {};
  const revanchaSolicitada = estadoJuego.revanchaSolicitada ?? {};
  const ganadorIdActual = estadoJuego.ganadorId ?? null;
  const ganadorNombreActual = estadoJuego.ganadorNombre ?? null;
  const misErrores = erroresPorJugador[usuarioId] ?? 0;
  const erroresRival = rivalId ? erroresPorJugador[rivalId] ?? 0 : 0;
  const yoEliminado = misErrores >= MAX_ERRORES;
  const rivalEliminado = erroresRival >= MAX_ERRORES;
  const yoArriesgoUsado = arriesgoUsado[usuarioId] ?? false;
  const rivalArriesgoUsado = rivalId ? arriesgoUsado[rivalId] ?? false : false;
  const yoQuieroRevancha = revanchaSolicitada[usuarioId] ?? false;
  const rivalQuiereRevancha = rivalId ? revanchaSolicitada[rivalId] ?? false : false;
  const ambosQuierenRevancha = yoQuieroRevancha && rivalQuiereRevancha;

  const esMiTurno = turno === usuarioId;
  const gano = palabraCompleta(palabra, letrasProbadas);
  const ambosEliminados = yoEliminado && rivalEliminado;
  const terminado = gano || ambosEliminados;

  const letrasUnicasPalabra = Array.from(new Set(palabra.split("")));
  const letrasAcertadas = letrasUnicasPalabra.filter((l) => letrasProbadas.includes(l));
  const porcentajeRevelado = letrasAcertadas.length / letrasUnicasPalabra.length;
  const alcanzoPorcentajeMinimo = porcentajeRevelado >= 0.2;

  const puedeArriesgar =
    esMiTurno && !terminado && !yoEliminado && !yoArriesgoUsado && !!rivalId && alcanzoPorcentajeMinimo;

  // Cuando los dos jugadores pidieron revancha, el creador arma la ronda nueva
  // (evita que los dos disparen el reinicio al mismo tiempo y choquen).
  useEffect(() => {
    if (terminado && ambosQuierenRevancha && esCreador && !reiniciandoRevancha && rivalId) {
      setReiniciandoRevancha(true);
      obtenerPalabraAleatoria(dificultad).then(async (palabraNueva) => {
        const nuevoEstado: EstadoAhorcado = {
          palabra: normalizarPalabra(palabraNueva),
          dificultad,
          letrasProbadas: [],
          erroresPorJugador: {
            [salaActual.creador_id]: 0,
            [salaActual.oponente_id!]: 0,
          },
          arriesgoUsado: {
            [salaActual.creador_id]: false,
            [salaActual.oponente_id!]: false,
          },
          revanchaSolicitada: {},
          turno: salaActual.creador_id,
          ganadorId: null,
          ganadorNombre: null,
        };
        await supabase
          .from("salas")
          .update({ estado: "en_curso", estado_juego: nuevoEstado })
          .eq("id", salaActual.id);
        setReiniciandoRevancha(false);
        setPidiendoRevancha(false);
      });
    }
  }, [terminado, ambosQuierenRevancha, esCreador, reiniciandoRevancha, rivalId, dificultad, salaActual]);

  async function elegirLetra(letra: string) {
    if (!esMiTurno || terminado || yoEliminado || letrasProbadas.includes(letra) || !rivalId) return;

    const acierto = palabra.includes(letra);
    const misErroresNuevo = acierto ? misErrores : misErrores + 1;
    const yoQuedoEliminado = misErroresNuevo >= MAX_ERRORES;
    const nuevasLetrasProbadas = [...letrasProbadas, letra];
    const seCompleto = palabraCompleta(palabra, nuevasLetrasProbadas);

    const nuevoErroresPorJugador = {
      ...erroresPorJugador,
      [usuarioId]: misErroresNuevo,
    };

    // Pasa el turno al rival, salvo que el rival ya esté eliminado y yo no —
    // en ese caso sigo jugando solo.
    const siguienteTurno = rivalEliminado && !yoQuedoEliminado ? usuarioId : rivalId;

    const nuevoEstado: EstadoAhorcado = {
      ...estadoJuego,
      palabra,
      dificultad,
      letrasProbadas: nuevasLetrasProbadas,
      erroresPorJugador: nuevoErroresPorJugador,
      arriesgoUsado,
      revanchaSolicitada,
      turno: siguienteTurno,
      ganadorId: seCompleto ? usuarioId : ganadorIdActual,
      ganadorNombre: seCompleto ? nombreJugador : ganadorNombreActual,
    };

    await supabase.from("salas").update({ estado_juego: nuevoEstado }).eq("id", salaActual.id);

    const quedanAmbosEliminados = yoQuedoEliminado && rivalEliminado;
    if (seCompleto || quedanAmbosEliminados) {
      await finalizarSala(salaActual.id);
    }
  }

  async function arriesgarPalabra() {
    if (!puedeArriesgar || !rivalId || enviandoArriesgo) return;
    const intento = normalizarPalabra(palabraArriesgada.trim());
    if (!intento) return;

    setEnviandoArriesgo(true);
    const acierto = intento === palabra;
    const nuevoArriesgoUsado = { ...arriesgoUsado, [usuarioId]: true };

    if (acierto) {
      const todasLasLetras = Array.from(new Set(palabra.split("")));
      const nuevasLetrasProbadas = Array.from(new Set([...letrasProbadas, ...todasLasLetras]));

      const nuevoEstado: EstadoAhorcado = {
        ...estadoJuego,
        palabra,
        dificultad,
        letrasProbadas: nuevasLetrasProbadas,
        erroresPorJugador,
        arriesgoUsado: nuevoArriesgoUsado,
        revanchaSolicitada,
        turno,
        ganadorId: usuarioId,
        ganadorNombre: nombreJugador,
      };

      await supabase.from("salas").update({ estado_juego: nuevoEstado }).eq("id", salaActual.id);
      await finalizarSala(salaActual.id);
    } else {
      const nuevoErroresPorJugador = { ...erroresPorJugador, [usuarioId]: MAX_ERRORES };
      const siguienteTurno = rivalEliminado ? usuarioId : rivalId;

      const nuevoEstado: EstadoAhorcado = {
        ...estadoJuego,
        palabra,
        dificultad,
        letrasProbadas,
        erroresPorJugador: nuevoErroresPorJugador,
        arriesgoUsado: nuevoArriesgoUsado,
        revanchaSolicitada,
        turno: siguienteTurno,
      };

      await supabase.from("salas").update({ estado_juego: nuevoEstado }).eq("id", salaActual.id);

      if (rivalEliminado) {
        // yo también quedé en MAX_ERRORES recién: los dos afuera, se cierra la partida
        await finalizarSala(salaActual.id);
      }
    }

    setPalabraArriesgada("");
    setArriesgando(false);
    setEnviandoArriesgo(false);
  }

  async function pedirRevancha() {
    if (!rivalId || pidiendoRevancha || yoQuieroRevancha) return;
    setPidiendoRevancha(true);
    const nuevoEstado: EstadoAhorcado = {
      ...estadoJuego,
      palabra,
      dificultad,
      letrasProbadas,
      erroresPorJugador,
      arriesgoUsado,
      turno,
      ganadorId: ganadorIdActual,
      ganadorNombre: ganadorNombreActual,
      revanchaSolicitada: { ...revanchaSolicitada, [usuarioId]: true },
    };
    await supabase.from("salas").update({ estado_juego: nuevoEstado }).eq("id", salaActual.id);
  }

  let mensajeFinal = "";
  if (gano) {
    mensajeFinal = ganadorNombreActual ? `¡${ganadorNombreActual} ganó! 🎉` : "¡La adivinaron! 🎉";
  } else if (ambosEliminados) {
    mensajeFinal = `Se les acabaron los intentos a los dos 😅 (era "${palabra}")`;
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4 max-w-xl mx-auto">
      <div className="flex justify-between items-center w-full">
        <button onClick={onSalir} className="border-2 border-dorado text-dorado-claro font-heading text-xs rounded-lg px-3 py-1.5">
          ‹ SALIR
        </button>
        <span className="font-heading text-xs uppercase tracking-widest text-crema/60">
          {dificultad}
        </span>
      </div>

      <div className="flex justify-between w-full text-xs font-heading uppercase tracking-widest">
        <span className={clsx(yoEliminado ? "text-linea-rojo" : "text-crema/70")}>
          vos: {misErrores}/{MAX_ERRORES} {yoEliminado && "· eliminado"} {!yoEliminado && yoArriesgoUsado && "· arriesgó"}
        </span>
        <span className={clsx(rivalEliminado ? "text-linea-rojo" : "text-crema/70")}>
          rival: {erroresRival}/{MAX_ERRORES} {rivalEliminado && "· eliminado"} {!rivalEliminado && rivalArriesgoUsado && "· arriesgó"}
        </span>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {palabra.split("").map((letra, i) => (
          <span
            key={i}
            className="w-8 h-10 flex items-center justify-center border-b-2 border-dorado font-heading text-xl text-crema"
          >
            {letrasProbadas.includes(letra) || terminado ? letra : ""}
          </span>
        ))}
      </div>

      {!terminado && (
        <p className="font-body text-sm text-crema/80">
          {yoEliminado
            ? "Te quedaste sin intentos — esperá a ver si tu rival la adivina."
            : esMiTurno
            ? "Tu turno — elegí una letra"
            : "Turno del rival, esperá..."}
        </p>
      )}

      <div className="grid grid-cols-7 gap-1.5">
        {ALFABETO.map((letra) => {
          const usada = letrasProbadas.includes(letra);
          const acierto = usada && palabra.includes(letra);
          return (
            <button
              key={letra}
              disabled={usada || !esMiTurno || terminado || yoEliminado}
              onClick={() => elegirLetra(letra)}
              className={clsx(
                "w-8 h-8 rounded-md font-heading text-sm border-2 transition-colors",
                !usada && "bg-omnibus border-dorado text-crema disabled:opacity-40",
                usada && acierto && "bg-linea-verde border-dorado-claro text-crema",
                usada && !acierto && "bg-linea-rojo border-dorado-claro text-crema"
              )}
            >
              {letra}
            </button>
          );
        })}
      </div>

      {esMiTurno && !terminado && !yoEliminado && !yoArriesgoUsado && !alcanzoPorcentajeMinimo && !!rivalId && (
        <p className="font-body text-[11px] text-crema/40 text-center mt-1">
          Necesitás descubrir al menos el 20% de la palabra para poder arriesgar
        </p>
      )}

      {puedeArriesgar && (
        <div className="w-full flex flex-col items-center gap-2 mt-2">
          {!arriesgando ? (
            <button
              onClick={() => setArriesgando(true)}
              className="font-heading text-xs uppercase tracking-widest border-2 border-linea-violeta text-linea-violeta rounded-lg px-4 py-2"
            >
              🎯 Arriesgar la palabra (una sola vez)
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full max-w-xs">
              <input
                value={palabraArriesgada}
                onChange={(e) => setPalabraArriesgada(e.target.value.toUpperCase())}
                placeholder="ESCRIBÍ LA PALABRA"
                autoFocus
                className="w-full bg-crema text-tinta font-heading text-center tracking-widest rounded-xl px-3 py-2 uppercase"
              />
              <div className="flex gap-2">
                <button
                  onClick={arriesgarPalabra}
                  disabled={enviandoArriesgo || !palabraArriesgada.trim()}
                  className="bg-linea-violeta text-crema font-heading text-xs rounded-lg px-4 py-2 disabled:opacity-50"
                >
                  CONFIRMAR
                </button>
                <button
                  onClick={() => {
                    setArriesgando(false);
                    setPalabraArriesgada("");
                  }}
                  className="border border-dorado/60 text-dorado-claro font-heading text-xs rounded-lg px-4 py-2"
                >
                  CANCELAR
                </button>
              </div>
              <p className="font-body text-[11px] text-crema/50 text-center">
                Si acertás, ganás al toque. Si fallás, perdés todos tus intentos.
              </p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {terminado && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mt-4"
          >
            <p className={clsx("text-2xl font-bold", gano ? "text-green-500" : "text-red-500")}>
              {mensajeFinal}
            </p>

            {reiniciandoRevancha ? (
              <p className="font-body text-sm text-crema/70">Armando la revancha...</p>
            ) : yoQuieroRevancha ? (
              <p className="font-body text-sm text-crema/70">
                Esperando a que tu rival acepte la revancha...
              </p>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {rivalQuiereRevancha && (
                  <p className="font-body text-xs text-linea-violeta text-center">
                    Tu rival quiere revancha 👀
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={pedirRevancha}
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
        )}
      </AnimatePresence>
    </div>
  );
}