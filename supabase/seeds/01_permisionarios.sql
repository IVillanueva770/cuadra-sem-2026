-- 15 permisionarios con nombres reales tipo Salta
-- (mezcla de apellidos del NOA, jubilados típicos)

INSERT INTO permisionarios (dni, nombre_completo, qr_code, telefono, email, medio_cobro_tipo, medio_cobro_datos, estado) VALUES
-- Cuenta bancaria (más jóvenes con onboarding digital)
('20184567', 'María Cristina Aramayo', 'CUADRA-001', '+5493874123456', 'mc.aramayo@gmail.com', 'cuenta_bancaria', '{"cbu":"0000000000000000000001","alias":"ARAMAYO.SALTA"}', 'activo'),
('22345678', 'Juan Carlos Tolaba', 'CUADRA-002', '+5493874234567', NULL, 'cuenta_bancaria', '{"cbu":"0000000000000000000002","alias":"TOLABA.JUAN"}', 'activo'),
('14523678', 'Rosa Elena Cardozo', 'CUADRA-003', '+5493874345678', NULL, 'cuenta_bancaria', '{"cbu":"0000000000000000000003","alias":"CARDOZO.ROSA"}', 'activo'),
-- Cuenta MP propia (algunos lo manejan)
('11234567', 'José Luis Cruz', 'CUADRA-004', '+5493874456789', 'jose.cruz.51@gmail.com', 'mp', '{"mp_email":"jose.cruz.51@gmail.com"}', 'activo'),
('15678901', 'Marta Susana Burgos', 'CUADRA-005', '+5493874567890', NULL, 'mp', '{"mp_email":"martaburgos@hotmail.com"}', 'activo'),
-- Efectivo en sucursal (la mayoría de los más mayores)
('8123456', 'Hugo Daniel Yapura', 'CUADRA-006', '+5493874678901', NULL, 'efectivo_sucursal', NULL, 'activo'),
('9234567', 'Norma Beatriz Sosa', 'CUADRA-007', '+5493874789012', NULL, 'efectivo_sucursal', NULL, 'activo'),
('10345678', 'Antonio Ramón Velázquez', 'CUADRA-008', '+5493874890123', NULL, 'efectivo_sucursal', NULL, 'activo'),
('7456789', 'Carmen Rosa Quipildor', 'CUADRA-009', '+5493874901234', NULL, 'efectivo_sucursal', NULL, 'activo'),
('11890123', 'Ramón Alberto Choque', 'CUADRA-010', '+5493874012345', NULL, 'efectivo_sucursal', NULL, 'activo'),
('12345678', 'Estela Mary Lamas', 'CUADRA-011', '+5493874123455', NULL, 'efectivo_sucursal', NULL, 'activo'),
('13456789', 'Domingo Felipe Salva', 'CUADRA-012', '+5493874234566', NULL, 'efectivo_sucursal', NULL, 'activo'),
('14567890', 'Lucía Magdalena Vilte', 'CUADRA-013', '+5493874345677', NULL, 'efectivo_sucursal', NULL, 'activo'),
('15678902', 'Raúl Enrique Aban', 'CUADRA-014', '+5493874456788', NULL, 'efectivo_sucursal', NULL, 'activo'),
-- Uno suspendido (para mostrar estados distintos en admin)
('16789012', 'Carlos Alberto Maidana', 'CUADRA-015', '+5493874567899', NULL, 'efectivo_sucursal', NULL, 'suspendido');
