'use client';

import {useEffect, useState} from 'react';
import {motion} from 'motion/react';
import SesionItem from './SesionItem';
import Paginador from '@/components/cuadra/Paginador';

interface Sesion {
  id: string;
  patente: string;
  tipo_vehiculo: 'auto' | 'moto';
  monto: number;
  medio_pago: string;
  status: string;
  iniciada_a: string;
  cubierta_hasta: string;
}

const POR_PAGINA = 6;

export default function AnterioresList({sesiones}: {sesiones: Sesion[]}) {
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(sesiones.length / POR_PAGINA));

  // Si la lista cambia (realtime) y la página queda fuera de rango, volvemos al inicio.
  useEffect(() => {
    if (pagina > totalPaginas) setPagina(1);
  }, [totalPaginas, pagina]);

  const visibles = sesiones.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <>
      {/* key={pagina} → cada cambio de página entra con un fade suave (sin salto brusco) */}
      <motion.div
        key={pagina}
        className="space-y-3"
        initial={{opacity: 0, y: 6}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.2, ease: [0.2, 0.7, 0.2, 1]}}
      >
        {visibles.map((s) => (
          <SesionItem key={s.id} sesion={s} />
        ))}
      </motion.div>

      <div className="mt-3">
        <Paginador
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          onCambio={setPagina}
          totalItems={sesiones.length}
          porPagina={POR_PAGINA}
          etiqueta="sesiones"
        />
      </div>
    </>
  );
}
