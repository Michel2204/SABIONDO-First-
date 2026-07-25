import { Pregunta } from "./types";

export const bancoPreguntas: Record<string, Pregunta[]> = {
  "FÚTBOL": [
    {
      texto: "¿Qué selección ganó el Mundial 2022 en Qatar?",
      opciones: ["Argentina", "Francia", "Brasil", "Croacia"],
      respuestaCorrecta: 0,
      imagenUrl: "https://mtgwzagzubnkrnazuoeu.supabase.co/storage/v1/object/public/preguntas-imagenes/argentina-sumo-su-tercera-estrella-el-domingo-en-doha-tras-vencer-a-francia-por-penales-foto-reuters-HSMCRTROSVBFRBSZKOPUMWD6RE.avif"
    },
    {
      texto: "¿En qué ciudad nació Diego Maradona?",
      opciones: ["Rosario", "Lanús", "La Plata", "Avellaneda"],
      respuestaCorrecta: 1,
    },
    {
      texto: "¿Cuántas Copas del Mundo ganó la Selección Argentina en total?",
      opciones: ["2", "3", "4", "1"],
      respuestaCorrecta: 1,
    },
    {
      texto: "¿Cómo se apoda a la Selección Argentina de fútbol?",
      opciones: ["La Roja", "La Celeste", "La Albiceleste", "La Verde"],
      respuestaCorrecta: 2,
    },
    {
      texto: "¿Qué club es conocido como 'el Xeneize'?",
      opciones: ["River Plate", "Racing", "Boca Juniors", "Independiente"],
      respuestaCorrecta: 2,
    },
  ],
  "CUARTETO Y FOLKLORE": [
    {
      texto: "¿En qué provincia nació el cuarteto como género musical?",
      opciones: ["Córdoba", "Salta", "Mendoza", "Chaco"],
      respuestaCorrecta: 0,
    },
    {
      texto: "¿Qué instrumento es central en el folklore norteño?",
      opciones: ["Bandoneón", "Charango", "Saxo", "Arpa celta"],
      respuestaCorrecta: 1,
    },
    {
      texto: "¿Cómo se llama el ritmo de raíz santiagueña bailado en pareja?",
      opciones: ["Chamamé", "Chacarera", "Cumbia", "Malambo"],
      respuestaCorrecta: 1,
    },
    {
      texto: "¿A quién se lo conoce como 'el Potro' del cuarteto?",
      opciones: ["Rodrigo Bueno", "La Mona Jiménez", "Ulises Bueno", "El Chaqueño"],
      respuestaCorrecta: 0,
    },
    {
      texto: "¿De qué provincia es típico el chamamé?",
      opciones: ["Corrientes", "Jujuy", "Neuquén", "San Luis"],
      respuestaCorrecta: 0,
    },
  ],
  "MATES Y ASADO": [
    {
      texto: "¿Cómo se llama el utensilio por el que se toma el mate?",
      opciones: ["Bombilla", "Pava", "Yerbera", "Termo"],
      respuestaCorrecta: 0,
    },
    {
      texto: "¿Qué corte NO es típico de un asado argentino?",
      opciones: ["Vacío", "Chorizo", "Salmón", "Matambre"],
      respuestaCorrecta: 2,
    },
    {
      texto: "¿Cómo se le dice al primer mate, considerado más amargo?",
      opciones: ["El lavado", "El cebado", "El primero", "El bautismo"],
      respuestaCorrecta: 0,
    },
    {
      texto: "¿Qué se usa para avivar el fuego del asado?",
      opciones: ["Un ventilador", "Un abanico o cartón", "Agua", "Nada, se deja solo"],
      respuestaCorrecta: 1,
    },
    {
      texto: "¿Cuál es el nombre del corte que se hace a la parrilla, con hueso, muy popular?",
      opciones: ["Asado de tira", "Bife de lomo", "Peceto", "Colita de cuadril"],
      respuestaCorrecta: 0,
    },
  ],
  "CULTURA POPULAR": [
    {
      texto: "¿Qué palabra usamos comúnmente para decir 'amigo' en Argentina?",
      opciones: ["Bacán", "Compa", "Che", "Mano"],
      respuestaCorrecta: 2,
    },
    {
      texto: "¿Cómo se le dice popularmente a un colectivo?",
      opciones: ["Micro", "Bondi", "Camión", "Buseta"],
      respuestaCorrecta: 1,
    },
    {
      texto: "¿Qué significa 'estar de boludeo'?",
      opciones: ["Trabajar mucho", "Estar sin hacer nada en particular", "Estar enojado", "Estar apurado"],
      respuestaCorrecta: 1,
    },
    {
      texto: "¿Cómo se le dice a la parada de colectivo?",
      opciones: ["Garita", "Terminal", "Andén", "Refugio"],
      respuestaCorrecta: 0,
    },
    {
      texto: "¿Qué es un 'boliche' en Argentina?",
      opciones: ["Un almacén", "Una discoteca", "Un club de fútbol", "Un taxi"],
      respuestaCorrecta: 1,
    },
  ],
  "GEOGRAFÍA E HISTORIA": [
    {
      texto: "¿Cuál es la capital de Argentina?",
      opciones: ["Córdoba", "Rosario", "Buenos Aires", "Mendoza"],
      respuestaCorrecta: 2,
    },
    {
      texto: "¿En qué año se declaró la independencia argentina?",
      opciones: ["1810", "1816", "1820", "1853"],
      respuestaCorrecta: 1,
    },
    {
      texto: "¿Cuál es el punto más alto de Argentina y América?",
      opciones: ["Cerro Torre", "Aconcagua", "Fitz Roy", "Volcán Lanín"],
      respuestaCorrecta: 1,
    },
    {
      texto: "¿Qué río separa Buenos Aires de Uruguay?",
      opciones: ["Río Paraná", "Río de la Plata", "Río Uruguay", "Río Colorado"],
      respuestaCorrecta: 1,
    },
    {
      texto: "¿En qué ciudad se firmó la independencia en 1816?",
      opciones: ["Buenos Aires", "Córdoba", "San Miguel de Tucumán", "Santa Fe"],
      respuestaCorrecta: 2,
    },
  ],
  "CINE Y TELE": [
    {
      texto: "¿Cuál de estas películas argentinas ganó el Oscar?",
      opciones: ["El secreto de sus ojos", "Nueve Reinas", "Relatos Salvajes", "El clan"],
      respuestaCorrecta: 0,
    },
    {
      texto: "¿Cómo se llamaba el ciclo cómico de Diego Capusotto?",
      opciones: ["Peter Capusotto y sus videos", "Grande Pa", "CQC", "Poné a Francella"],
      respuestaCorrecta: 0,
    },
    {
      texto: "¿Quién dirigió 'Nueve Reinas'?",
      opciones: ["Juan José Campanella", "Fabián Bielinsky", "Damián Szifron", "Pablo Trapero"],
      respuestaCorrecta: 1,
    },
    {
      texto: "¿Qué actor argentino protagonizó 'El Marginal'?",
      opciones: ["Juan Minujín", "Ricardo Darín", "Guillermo Francella", "Diego Peretti"],
      respuestaCorrecta: 0,
    },
    {
      texto: "¿Cómo se llama el programa histórico de entrevistas de Susana Giménez?",
      opciones: ["Hola Susana", "Susana Giménez", "Almorzando con Susana", "La noche de Susana"],
      respuestaCorrecta: 1,
    },
  ],
};
