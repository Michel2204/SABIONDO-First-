# SABIONDO 🚌

Trivia con identidad argentina: rueda de categorías estilo fileteado porteño, categorías como líneas de colectivo, y esa estética de chapa esmaltada y letrero de destino.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — sistema de diseño con tokens propios (colores de línea, dorado, verde ómnibus)
- **Framer Motion** — animaciones de la rueda, transiciones entre pantallas, micro-interacciones
- **next/font** — tipografías Bebas Neue, Kaushan Script, Fjalla One e Inter, auto-optimizadas y sin flash de carga

## Estructura

```
app/
  layout.tsx        → fuentes + metadata
  page.tsx           → orquesta el estado del juego (menú → rueda → pregunta → resultado)
  globals.css
components/
  ConsolaJuego.tsx        → marco/consola con fileteado y letrero de destino
  FileteEsquina.tsx        → flourish SVG reutilizable
  MenuPrincipal.tsx        → pantalla de modos de juego
  RuedaCategorias.tsx      → rueda giratoria de categorías
  TarjetaPregunta.tsx      → pregunta + opciones
  PantallaResultado.tsx    → resumen final
  IndicadorVidas.tsx
lib/
  types.ts
  categorias.ts       → las 6 categorías (cada una = una línea de colectivo)
  preguntas.ts         → banco de preguntas por categoría
```

## Correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Subir a GitHub

```bash
git init
git add .
git commit -m "SABIONDO: primera versión jugable"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/sabiondo.git
git push -u origin main
```

## Deployar en Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new)
2. Importá el repo de GitHub que acabás de crear
3. Vercel detecta Next.js automáticamente — no hace falta tocar nada de configuración
4. Deploy. Listo, ya tenés URL pública

Cada `git push` a `main` genera un deploy nuevo automáticamente.

## Cómo sumar contenido

- **Más preguntas**: agregá objetos al array correspondiente en `lib/preguntas.ts`
- **Más categorías**: agregá una entrada en `lib/categorias.ts` (con su color) y su array de preguntas en `lib/preguntas.ts` usando el mismo `nombre` como key
- **Sonido**: hay un hook natural en `TarjetaPregunta.tsx` (función `elegir`) para disparar efectos de sonido al responder

## Roadmap sugerido

- [ ] Modo Duelo real con turnos y dos jugadores
- [ ] Modo Contrarreloj con temporizador visible
- [ ] Persistencia de puntajes (Vercel Postgres / Supabase)
- [ ] Sonido y música ambiente
- [ ] Compartir resultado (imagen generada / link)
