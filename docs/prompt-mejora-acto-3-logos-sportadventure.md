# Prompt: Mejora del Acto 3 — Carrusel Horizontal de Marcas

## Contexto del proyecto

- **Stack:** Next.js App Router, React 19, TypeScript estricto, `framer-motion` disponible.
- **Archivo a modificar:** `components/experiences/sportadventure/sportadventure-home.tsx`
- El componente es una landing scroll-driven. El `scrollYProgress` viene de `useScroll()` (ventana) y va de `0` a `1` en un canvas de `700vh`.
- El Acto 3 actual ocupa el rango `scrollYProgress [0.61, 0.66, 0.75, 0.80]` con `a3Opacity`.

## Problema actual

Algunos logos (KTM naranja/negro, Can-Am negro, Super Soco negro) sobre fondo negro puro son invisibles con el filtro `grayscale(100%) brightness(180%) opacity(0.5)`. La grilla estática no tiene animación.

## Lo que se debe construir — Acto 3 nuevo

### Layout: Carrusel horizontal infinito con scroll-linked parallax

- En lugar de una grilla estática, los logos deben desfilar horizontalmente en **dos filas** que se mueven en **direcciones opuestas** (fila 1 va a la izquierda, fila 2 va a la derecha) a medida que el usuario scrollea.
- Usar `useTransform(scrollYProgress, [0.61, 0.80], [0, -600])` para la fila 1 y `[0, 600]` para la fila 2 — aplicar como `x` en `motion.div`.
- Cada fila debe contener los logos duplicados (`[...logos, ...logos]`) para dar sensación de infinito.

### Estado visual de los logos (estado base)

- Fondo del contenedor del logo: `rgba(255,255,255,0.06)` — un chip sutil grisáceo oscuro que da visibilidad a logos negros.
- Filtro base: `grayscale(100%) opacity(0.65) brightness(1.4)` — **no** usar `brightness(180%)` que quema logos claros.
- Border: `1px solid rgba(255,255,255,0.08)` con `border-radius: 12px`.
- Padding: `20px 28px`.

### Hover — animación hiper-premium

Al hacer hover sobre un logo individual debe ocurrir **todo esto simultáneamente** usando `motion.div` con `whileHover`:

1. `filter: none` — aparece el color real del logo
2. `y: -10` — flota hacia arriba (spring: `stiffness: 400`, `damping: 20`)
3. `scale: 1.08` — crece sutilmente
4. `backgroundColor: "rgba(255,255,255,0.1)"` — el chip se ilumina
5. `boxShadow: "0 20px 60px rgba(255,106,0,0.25), 0 0 0 1px rgba(255,106,0,0.3)"` — aura naranja

### Copy y estructura

- Mantener el texto **"No somos una marca."** / **"Somos todas."** centrado y animado entrando con `initial={{ opacity: 0, y: 30 }}` y `whileInView={{ opacity: 1, y: 0 }}` con `viewport={{ once: true, amount: 0.5 }}`.
- El copy debe entrar **antes** que los logos (delay: 0), y los logos hacer entrada escalonada con `staggerChildren: 0.04` usando variantes.

### Logos disponibles

```typescript
const LOGO_MAP: Record<string, string> = {
  ktm: "/logos/ktm.webp",
  husqvarna: "/logos/husqvarna.webp",
  gasgas: "/logos/gasgas.webp",
  aprilia: "/logos/aprila.webp",
  "moto-morini": "/logos/morini.webp",
  cfmoto: "/logos/cfmoto.webp",
  "can-am": "/logos/canam.webp",
  "royal-enfield": "/logos/royal.png",
  vespa: "/logos/vespa.png",
  piaggio: "/logos/piaggio.webp",
  "qj-motor": "/logos/qjmotor.webp",
  "super-soco": "/logos/supersoco.webp",
};
```

Distribuir **6 logos en fila 1** y **6 en fila 2**.

## Restricciones técnicas obligatorias

- **No usar GSAP** (solo framer-motion).
- **No agregar imports** nuevos fuera de framer-motion.
- **No modificar nada** fuera del bloque `{/* ── ACT 3: Constelación de Marcas ──────────────────────────────── */}` en el componente.
- `a3Opacity` ya existe como motion value — usarla para envolver todo el Act 3 en el `motion.div` padre (no cambiar sus rangos).
- El `overflow: hidden` del sticky viewport ya existe — no modificarlo.
- TypeScript estricto: no `any`, no casting innecesario. Correr `ReadLints` al final.

## Criterio de éxito

- Todos los logos son legibles en estado base (incluidos los oscuros).
- El carrusel se mueve con el scroll de forma fluida y en direcciones opuestas entre filas.
- El hover se siente muy animado: color real, lift vertical, escala y glow naranja.
- El Act 1 y el resto de actos no se rompen.
