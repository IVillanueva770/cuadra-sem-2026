'use client';

import {motion, useReducedMotion} from 'motion/react';
import {staggerContainer, fadeUp} from '@/lib/anim';

interface Props {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper de animación para el dashboard del permisionario.
 * Stagger fade-up sobrio en las cards de KPIs y secciones.
 * Respeta prefers-reduced-motion (renderiza en estado final si está activo).
 */
export default function AnimatedPermiDashboard({children, className}: Props) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

/**
 * Item que se anima dentro de AnimatedPermiDashboard (usa variants del padre).
 */
export function AnimatedPermiItem({children, className}: Props) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

/**
 * Item standalone con animación propia (fade-up independiente, sin stagger padre).
 * Útil para elementos sueltos fuera de un contenedor stagger.
 */
export function FadeUpItem({children, className}: Props) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}
