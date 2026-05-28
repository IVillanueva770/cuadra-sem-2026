import MPTestForm from './MPTestForm';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

export default function MPTestPage() {
  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <header>
        <h1 className="h-l">Cuadra MP Hello World</h1>
        <p className="body-s">
          Validación temprana del Payment Brick MP. Pagá $100 con tarjeta de prueba.
        </p>
      </header>

      <MPTestForm amount={100} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tarjetas de prueba (sandbox)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm font-mono">
          <div>Visa: 4509 9535 6623 3704</div>
          <div>Master: 5031 7557 3453 0604</div>
          <div>CVV: 123 — Venc: 11/30</div>
          <div className="font-bold">Nombre: APRO (para aprobado)</div>
          <div className="text-gray-500">OTHE → rechazado. CONT → pendiente.</div>
        </CardContent>
      </Card>
    </main>
  );
}
