export interface Categoria {
  id: string;
  linea: string;
  nombre: string;
  color: string;
  colorOscuro: string;
}

export interface Pregunta {
  texto: string;
  opciones: string[];
  respuestaCorrecta: number;
  imagenUrl?: string;
}

export type Pantalla =
  | "menu"
  | "rueda"
  | "pregunta"
  | "resultado"
  | "carrera"
  | "salas"
  | "duelo"
  | "ahorcado-dificultad"
  | "ahorcado";

export type Modo = "clasico" | "duelo" | "contrarreloj" | "carrera" | "ahorcado";
