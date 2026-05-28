-- =====================================================
-- Cuadra — Schema inicial
-- Hackathon PunaTech 2026 · Track Ciudad (SEM Salta)
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- TABLA: permisionarios
-- =====================================================
CREATE TABLE permisionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dni TEXT NOT NULL UNIQUE,
  nombre_completo TEXT NOT NULL,
  qr_code TEXT NOT NULL UNIQUE,
  telefono TEXT,
  email TEXT,
  medio_cobro_tipo TEXT NOT NULL CHECK (medio_cobro_tipo IN ('cuenta_bancaria', 'mp', 'efectivo_sucursal')),
  medio_cobro_datos JSONB,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'baja')),
  fecha_alta TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_baja TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_permisionarios_qr_code ON permisionarios(qr_code);
CREATE INDEX idx_permisionarios_dni ON permisionarios(dni);
CREATE INDEX idx_permisionarios_user_id ON permisionarios(user_id);
CREATE INDEX idx_permisionarios_estado_activo ON permisionarios(estado) WHERE estado = 'activo';
CREATE TRIGGER update_permisionarios_updated_at BEFORE UPDATE ON permisionarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLA: cuadras_habilitadas
-- =====================================================
CREATE TABLE cuadras_habilitadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calle TEXT NOT NULL,
  altura_desde INT NOT NULL,
  altura_hasta INT NOT NULL,
  nombre_display TEXT NOT NULL,
  habilitada_diurno BOOLEAN NOT NULL DEFAULT true,
  habilitada_nocturno BOOLEAN NOT NULL DEFAULT false,
  lat NUMERIC(10, 7),
  lng NUMERIC(10, 7),
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(calle, altura_desde, altura_hasta)
);
CREATE INDEX idx_cuadras_activa ON cuadras_habilitadas(activa) WHERE activa = true;
CREATE TRIGGER update_cuadras_updated_at BEFORE UPDATE ON cuadras_habilitadas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLA: asignaciones_diarias
-- =====================================================
CREATE TABLE asignaciones_diarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permisionario_id UUID NOT NULL REFERENCES permisionarios(id),
  cuadra_id UUID NOT NULL REFERENCES cuadras_habilitadas(id),
  fecha DATE NOT NULL,
  turno TEXT NOT NULL CHECK (turno IN ('diurno', 'nocturno')),
  hora_inicio_real TIMESTAMPTZ,
  hora_fin_real TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(permisionario_id, fecha, turno)
);
CREATE INDEX idx_asignaciones_fecha_turno ON asignaciones_diarias(fecha, turno);
CREATE INDEX idx_asignaciones_permi_fecha ON asignaciones_diarias(permisionario_id, fecha);

-- =====================================================
-- TABLA: tarifas
-- =====================================================
CREATE TABLE tarifas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_vehiculo TEXT NOT NULL CHECK (tipo_vehiculo IN ('auto', 'moto')),
  monto_por_hora NUMERIC(10, 2) NOT NULL,
  monto_por_fraccion_15min NUMERIC(10, 2) NOT NULL,
  descuento_digital_pct NUMERIC(5, 2) NOT NULL DEFAULT 20.0,
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tarifas_tipo_vigencia ON tarifas(tipo_vehiculo, vigente_desde, vigente_hasta);
CREATE TRIGGER update_tarifas_updated_at BEFORE UPDATE ON tarifas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO tarifas (tipo_vehiculo, monto_por_hora, monto_por_fraccion_15min, descuento_digital_pct, vigente_desde) VALUES
('auto', 700, 175, 20.0, '2026-01-01'),
('moto', 300, 75, 20.0, '2026-01-01');

-- =====================================================
-- TABLA: horarios_turnos
-- =====================================================
CREATE TABLE horarios_turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turno TEXT NOT NULL CHECK (turno IN ('diurno', 'nocturno')),
  dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO horarios_turnos (turno, dia_semana, hora_inicio, hora_fin) VALUES
('diurno', 1, '07:00', '21:00'),
('diurno', 2, '07:00', '21:00'),
('diurno', 3, '07:00', '21:00'),
('diurno', 4, '07:00', '21:00'),
('diurno', 5, '07:00', '21:00'),
('diurno', 6, '07:00', '14:00'),
('nocturno', 0, '22:00', '05:00'),
('nocturno', 1, '22:00', '05:00'),
('nocturno', 2, '22:00', '05:00'),
('nocturno', 3, '22:00', '05:00'),
('nocturno', 4, '22:00', '05:00'),
('nocturno', 5, '22:00', '05:00'),
('nocturno', 6, '22:00', '05:00');

-- =====================================================
-- TABLA: feriados
-- =====================================================
CREATE TABLE feriados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  permite_nocturno BOOLEAN NOT NULL DEFAULT true,
  permite_diurno BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO feriados (fecha, descripcion) VALUES
('2026-01-01', 'Año Nuevo'),
('2026-03-24', 'Día de la Memoria'),
('2026-04-02', 'Día del Veterano de Malvinas'),
('2026-04-03', 'Viernes Santo'),
('2026-05-01', 'Día del Trabajador'),
('2026-05-25', 'Revolución de Mayo'),
('2026-06-17', 'Paso a la Inmortalidad de Güemes'),
('2026-06-20', 'Día de la Bandera'),
('2026-07-09', 'Día de la Independencia'),
('2026-08-17', 'Paso a la Inmortalidad de San Martín'),
('2026-10-12', 'Diversidad Cultural'),
('2026-11-20', 'Soberanía Nacional'),
('2026-12-08', 'Inmaculada Concepción'),
('2026-12-25', 'Navidad');

-- =====================================================
-- TABLA: zonas_nocturnas
-- =====================================================
CREATE TABLE zonas_nocturnas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO zonas_nocturnas (nombre) VALUES
('Paseo Balcarce'),
('Paseo Güemes'),
('Plaza Alvarado');

-- =====================================================
-- TABLA CENTRAL: parking_sessions
-- =====================================================
CREATE TABLE parking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patente TEXT NOT NULL,
  tipo_vehiculo TEXT NOT NULL CHECK (tipo_vehiculo IN ('auto', 'moto')),
  permisionario_id UUID NOT NULL REFERENCES permisionarios(id),
  cuadra_id UUID NOT NULL REFERENCES cuadras_habilitadas(id),
  asignacion_id UUID REFERENCES asignaciones_diarias(id),
  iniciada_a TIMESTAMPTZ NOT NULL DEFAULT now(),
  cubierta_hasta TIMESTAMPTZ NOT NULL,
  duracion_minutos INT NOT NULL,
  monto NUMERIC(10, 2) NOT NULL,
  monto_sin_descuento NUMERIC(10, 2) NOT NULL,
  medio_pago TEXT NOT NULL CHECK (medio_pago IN ('digital_mp', 'efectivo', 'extension_digital')),
  mp_payment_id TEXT,
  mp_payment_status TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'left_early', 'extended_pending', 'rejected')),
  liberada_a TIMESTAMPTZ,
  liberada_por TEXT CHECK (liberada_por IN ('auto_expired', 'conductor', 'permisionario')),
  conductor_email TEXT,
  conductor_telefono TEXT,
  notas_permisionario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_parking_sessions_patente_active
  ON parking_sessions(patente)
  WHERE status = 'active';
CREATE INDEX idx_parking_sessions_permi_iniciada
  ON parking_sessions(permisionario_id, iniciada_a DESC);
CREATE INDEX idx_parking_sessions_patente_status
  ON parking_sessions(patente, status);
CREATE UNIQUE INDEX idx_parking_sessions_mp_payment_id
  ON parking_sessions(mp_payment_id)
  WHERE mp_payment_id IS NOT NULL;
CREATE TRIGGER update_parking_sessions_updated_at BEFORE UPDATE ON parking_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLA: sesiones_extendidas
-- =====================================================
CREATE TABLE sesiones_extendidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_original_id UUID NOT NULL REFERENCES parking_sessions(id),
  permisionario_id UUID NOT NULL REFERENCES permisionarios(id),
  hora_estimada_extension TIMESTAMPTZ NOT NULL,
  duracion_extra_minutos INT NOT NULL,
  monto_extra NUMERIC(10, 2) NOT NULL,
  link_pago_token TEXT NOT NULL UNIQUE,
  link_pago_expira TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired')),
  paid_at TIMESTAMPTZ,
  mp_payment_id TEXT,
  email_enviado_a TEXT,
  email_enviado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sesiones_extendidas_status ON sesiones_extendidas(status);
CREATE INDEX idx_sesiones_extendidas_token ON sesiones_extendidas(link_pago_token);

-- =====================================================
-- TABLA: liquidaciones_permisionario
-- =====================================================
CREATE TABLE liquidaciones_permisionario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permisionario_id UUID NOT NULL REFERENCES permisionarios(id),
  periodo_desde DATE NOT NULL,
  periodo_hasta DATE NOT NULL,
  total_sesiones INT NOT NULL,
  monto_recaudado_digital NUMERIC(10, 2) NOT NULL DEFAULT 0,
  monto_recaudado_efectivo NUMERIC(10, 2) NOT NULL DEFAULT 0,
  monto_comision_permisionario NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  metodo_pago_usado TEXT,
  fecha_pago TIMESTAMPTZ,
  referencia_pago TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(permisionario_id, periodo_desde, periodo_hasta)
);
CREATE INDEX idx_liquidaciones_permi_status ON liquidaciones_permisionario(permisionario_id, status);
CREATE TRIGGER update_liquidaciones_updated_at BEFORE UPDATE ON liquidaciones_permisionario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLA: conciliaciones_efectivo
-- =====================================================
CREATE TABLE conciliaciones_efectivo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permisionario_id UUID NOT NULL REFERENCES permisionarios(id),
  asignacion_id UUID NOT NULL REFERENCES asignaciones_diarias(id),
  total_efectivo_recaudado NUMERIC(10, 2) NOT NULL,
  saldo_a_rendir NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'rendido', 'failed')),
  metodo_rendicion TEXT,
  referencia_rendicion TEXT,
  rendido_at TIMESTAMPTZ,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conciliaciones_status_permi ON conciliaciones_efectivo(permisionario_id, status);

-- =====================================================
-- TABLA: metricas_diarias
-- =====================================================
CREATE TABLE metricas_diarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permisionario_id UUID NOT NULL REFERENCES permisionarios(id),
  fecha DATE NOT NULL,
  sesiones_total INT NOT NULL DEFAULT 0,
  sesiones_digital INT NOT NULL DEFAULT 0,
  sesiones_efectivo INT NOT NULL DEFAULT 0,
  recaudacion_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  recaudacion_digital NUMERIC(10, 2) NOT NULL DEFAULT 0,
  recaudacion_efectivo NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ratio_digital NUMERIC(5, 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(permisionario_id, fecha)
);
CREATE INDEX idx_metricas_fecha ON metricas_diarias(fecha DESC);
CREATE INDEX idx_metricas_permi_fecha ON metricas_diarias(permisionario_id, fecha DESC);

-- =====================================================
-- TABLA: webhook_events
-- =====================================================
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'mercadopago',
  event_type TEXT NOT NULL,
  payment_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);
CREATE INDEX idx_webhook_events_payment ON webhook_events(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed) WHERE processed = false;

-- =====================================================
-- TABLA: config_sistema
-- =====================================================
CREATE TABLE config_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT NOT NULL UNIQUE,
  valor JSONB NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

INSERT INTO config_sistema (clave, valor, descripcion) VALUES
('tolerancia_minutos', '5', 'Tolerancia post-expiración de sesión'),
('minutos_min_antes_fin_turno', '10', 'Minutos antes de fin de turno donde se bloquea registro nuevo (D21)'),
('saldo_favor_enabled', 'false', 'Habilita saldo a favor por patente (D13, off por default)'),
('telefono_soporte', '"147"', 'Línea ciudadana Muni'),
('email_soporte', '"estacionamientomedido@municipalidadsalta.gob.ar"', 'Email oficial Muni');

-- =====================================================
-- FUNCIONES SQL
-- =====================================================

CREATE OR REPLACE FUNCTION verificar_patente_activa(p_patente TEXT)
RETURNS TABLE (
  sesion_id UUID,
  cubierta_hasta TIMESTAMPTZ,
  permisionario_nombre TEXT,
  cuadra_nombre TEXT
) LANGUAGE sql STABLE AS $$
  SELECT
    ps.id,
    ps.cubierta_hasta,
    p.nombre_completo,
    c.nombre_display
  FROM parking_sessions ps
  JOIN permisionarios p ON ps.permisionario_id = p.id
  JOIN cuadras_habilitadas c ON ps.cuadra_id = c.id
  WHERE ps.patente = p_patente
    AND ps.status = 'active'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION expirar_sesiones_vencidas()
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
  count_expired INT;
BEGIN
  WITH updated AS (
    UPDATE parking_sessions
    SET
      status = 'expired',
      liberada_a = cubierta_hasta,
      liberada_por = 'auto_expired'
    WHERE status = 'active'
      AND cubierta_hasta < now() - interval '5 minutes'
    RETURNING 1
  )
  SELECT COUNT(*) INTO count_expired FROM updated;

  RETURN COALESCE(count_expired, 0);
END;
$$;

CREATE OR REPLACE FUNCTION calcular_metricas_diarias(p_fecha DATE)
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
  count_rows INT;
BEGIN
  INSERT INTO metricas_diarias (
    permisionario_id, fecha,
    sesiones_total, sesiones_digital, sesiones_efectivo,
    recaudacion_total, recaudacion_digital, recaudacion_efectivo,
    ratio_digital
  )
  SELECT
    permisionario_id,
    p_fecha,
    COUNT(*),
    COUNT(*) FILTER (WHERE medio_pago = 'digital_mp'),
    COUNT(*) FILTER (WHERE medio_pago = 'efectivo'),
    SUM(monto),
    SUM(monto) FILTER (WHERE medio_pago = 'digital_mp'),
    SUM(monto) FILTER (WHERE medio_pago = 'efectivo'),
    CASE WHEN COUNT(*) > 0
      THEN COUNT(*) FILTER (WHERE medio_pago = 'digital_mp')::NUMERIC / COUNT(*)
      ELSE 0
    END
  FROM parking_sessions
  WHERE DATE(iniciada_a) = p_fecha
    AND status IN ('active', 'expired', 'left_early')
  GROUP BY permisionario_id
  ON CONFLICT (permisionario_id, fecha) DO UPDATE SET
    sesiones_total = EXCLUDED.sesiones_total,
    sesiones_digital = EXCLUDED.sesiones_digital,
    sesiones_efectivo = EXCLUDED.sesiones_efectivo,
    recaudacion_total = EXCLUDED.recaudacion_total,
    recaudacion_digital = EXCLUDED.recaudacion_digital,
    recaudacion_efectivo = EXCLUDED.recaudacion_efectivo,
    ratio_digital = EXCLUDED.ratio_digital;

  GET DIAGNOSTICS count_rows = ROW_COUNT;
  RETURN count_rows;
END;
$$;

-- =====================================================
-- VISTAS
-- =====================================================
CREATE VIEW vista_dashboard_muni AS
SELECT
  DATE(iniciada_a) AS fecha,
  COUNT(*) AS sesiones_dia,
  SUM(monto) AS recaudacion_dia,
  COUNT(*) FILTER (WHERE medio_pago = 'digital_mp') AS digital_count,
  COUNT(*) FILTER (WHERE medio_pago = 'efectivo') AS efectivo_count,
  COUNT(DISTINCT permisionario_id) AS permisionarios_activos
FROM parking_sessions
WHERE iniciada_a >= now() - interval '30 days'
GROUP BY DATE(iniciada_a)
ORDER BY fecha DESC;

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE parking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can verify patente" ON parking_sessions
  FOR SELECT USING (true);

CREATE POLICY "Permisionario inserts own sessions" ON parking_sessions
  FOR INSERT WITH CHECK (
    permisionario_id IN (SELECT id FROM permisionarios WHERE user_id = auth.uid())
  );

CREATE POLICY "Permisionario updates own sessions" ON parking_sessions
  FOR UPDATE USING (
    permisionario_id IN (SELECT id FROM permisionarios WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can view active permisionarios" ON permisionarios
  FOR SELECT USING (estado = 'activo');

CREATE POLICY "Permisionario sees own metrics" ON metricas_diarias
  FOR SELECT USING (
    permisionario_id IN (SELECT id FROM permisionarios WHERE user_id = auth.uid())
  );
