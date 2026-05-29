import type {Variants} from 'motion/react';

// Entrada sobria: fade + slide-up corto. Acorde al DS Cuadra (sin bounce).
export const fadeUp: Variants = {
  hidden: {opacity: 0, y: 8},
  show: {opacity: 1, y: 0, transition: {duration: 0.2, ease: [0.4, 0, 0.2, 1]}},
};

// Contenedor con stagger para listas de cards.
export const staggerContainer: Variants = {
  hidden: {},
  show: {transition: {staggerChildren: 0.05, delayChildren: 0.02}},
};
