-- Cuadras del microcentro de Salta (calles reales)
-- Mix de calles habilitadas diurno + 3 zonas nocturnas (Balcarce, Güemes, Plaza Alvarado)

INSERT INTO cuadras_habilitadas (calle, altura_desde, altura_hasta, nombre_display, habilitada_diurno, habilitada_nocturno, lat, lng) VALUES
-- Diurno solo (microcentro estándar)
('Caseros', 700, 799, 'Caseros 700', true, false, -24.7867, -65.4115),
('Caseros', 800, 899, 'Caseros 800', true, false, -24.7868, -65.4118),
('Caseros', 900, 999, 'Caseros 900', true, false, -24.7869, -65.4121),
('Mitre', 100, 199, 'Mitre 100', true, false, -24.7900, -65.4108),
('Mitre', 200, 299, 'Mitre 200', true, false, -24.7898, -65.4111),
('España', 400, 499, 'España 400', true, false, -24.7901, -65.4080),
('España', 500, 599, 'España 500', true, false, -24.7900, -65.4083),
('Florida', 100, 199, 'Florida 100', true, false, -24.7890, -65.4100),
('Florida', 200, 299, 'Florida 200', true, false, -24.7891, -65.4103),
('Pueyrredón', 100, 199, 'Pueyrredón 100', true, false, -24.7910, -65.4097),
('Pueyrredón', 200, 299, 'Pueyrredón 200', true, false, -24.7911, -65.4100),
-- Piloto QR 2024 (referencia)
('Rivadavia', 800, 899, 'Rivadavia 800', true, false, -24.7878, -65.4070),
('Leguizamón', 700, 799, 'Leguizamón 700', true, false, -24.7860, -65.4145),
('Gorriti', 100, 199, 'Gorriti 100', true, false, -24.7895, -65.4090),
-- Zona Balcarce (nocturno)
('Balcarce', 800, 899, 'Balcarce 800', false, true, -24.7820, -65.4080),
('Balcarce', 900, 999, 'Balcarce 900', false, true, -24.7818, -65.4082),
('Balcarce', 1000, 1099, 'Balcarce 1000', false, true, -24.7815, -65.4085),
-- Zona Güemes (nocturno)
('Güemes', 700, 799, 'Güemes 700', true, true, -24.7950, -65.4120),
('Güemes', 800, 899, 'Güemes 800', true, true, -24.7948, -65.4123),
-- Zona Plaza Alvarado (nocturno)
('Alvarado', 600, 699, 'Alvarado 600', true, true, -24.7910, -65.4060),
('Alvarado', 700, 799, 'Alvarado 700', true, true, -24.7912, -65.4063);
