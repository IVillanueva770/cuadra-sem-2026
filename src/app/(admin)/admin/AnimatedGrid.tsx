'use client';

import {motion, useReducedMotion} from 'motion/react';
import {staggerContainer, fadeUp} from '@/lib/anim';

interface Props {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper client que anima sus hijos directos con stagger+fadeUp sobrio.
 * Si prefers-reduced-motion, renderiza sin animación (estado final directo).
 */
export default function AnimatedGrid({children, className}: Props) {
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
 * Item animado para usar dentro de AnimatedGrid.
 */
export function AnimatedItem({children, className}: Props) {
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
