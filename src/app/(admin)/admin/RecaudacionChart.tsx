'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

interface DatoGrafico {
  fecha: string;
  recaudacion: number;
}

interface RecaudacionChartProps {
  datos: DatoGrafico[];
}

function formatARSK(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}

export default function RecaudacionChart({datos}: RecaudacionChartProps) {
  if (!datos || datos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
            Recaudación — últimos 21 días
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center h-48 rounded-xl"
            style={{backgroundColor: 'var(--bg-subtle)'}}
          >
            <p className="text-sm" style={{color: 'var(--fg3)'}}>
              Sin datos disponibles aún
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
          Recaudación — últimos 21 días
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={datos} margin={{top: 4, right: 8, left: 0, bottom: 0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="fecha"
              tick={{fontSize: 11, fill: 'var(--fg3)'}}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => {
                const [, m, d] = v.split('-');
                return `${d}/${m}`;
              }}
            />
            <YAxis
              tick={{fontSize: 11, fill: 'var(--fg3)'}}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatARSK}
              width={44}
            />
            <Tooltip
              contentStyle={{
                fontSize: 13,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-2)',
                color: 'var(--fg1)',
              }}
              formatter={(value) => {
                const num = typeof value === 'number' ? value : Number(value ?? 0);
                return new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                  maximumFractionDigits: 0,
                }).format(num);
              }}
              labelFormatter={(label) => {
                if (typeof label !== 'string') return String(label ?? '');
                const [y, m, d] = label.split('-');
                return `${d}/${m}/${y}`;
              }}
            />
            {/* Color primario Cuadra: #145FB0 */}
            <Line
              type="monotone"
              dataKey="recaudacion"
              stroke="#145FB0"
              strokeWidth={2}
              dot={false}
              activeDot={{r: 4, fill: '#145FB0', stroke: 'var(--bg-surface)', strokeWidth: 2}}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
