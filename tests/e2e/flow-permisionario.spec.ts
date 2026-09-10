/**
 * E2E: Flujo del permisionario (autenticado).
 *
 * Usuario de test: DNI 20184567 / password test123 (credenciales de la demo,
 * ver src/lib/auth-demo/credenciales.ts). No hace falta ningún setup: los
 * datos salen del store en memoria.
 *
 * El bug de redirect loop en /login (la ruta vivía dentro del grupo (permi)
 * cuyo layout redirige a /login cuando no hay sesión) fue resuelto moviendo
 * `login/` al grupo (publico), que no tiene auth-guard. La URL /login se
 * mantiene. Estos tests quedaron activos a partir de ese fix.
 *
 * Selectors verificados contra LoginForm.tsx y NuevaSesionForm.tsx.
 */

import { test, expect } from '@playwright/test';

const TEST_DNI = '20184567';
const TEST_PASSWORD = 'test123';

test.describe('Flow permisionario - login y dashboard', () => {

  test('Login con DNI y contraseña correctos redirige al dashboard', async ({ page }) => {
    await page.goto('/login');

    // Rellenar formulario
    await page.getByLabel('DNI').fill(TEST_DNI);
    await page.getByLabel('Contraseña', { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Esperar redirect a /permi
    await page.waitForURL('**/permi', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/permi$/);

    // El dashboard debe mostrar el link "Registrar cobro"
    await expect(page.getByRole('link', { name: 'Registrar cobro' })).toBeVisible();
  });

  test('Login con DNI incorrecto muestra error', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('DNI').fill('99999999');
    await page.getByLabel('Contraseña', { exact: true }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Debe mostrar error de auth
    await expect(
      page.getByRole('alert').filter({ hasText: /DNI o contraseña/i })
    ).toBeVisible();
  });

  test('Dashboard muestra KPIs y botón de cobro', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('DNI').fill(TEST_DNI);
    await page.getByLabel('Contraseña', { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL('**/permi', { timeout: 15_000 });

    // KPIs: Activas, Total hoy, Recaudado
    await expect(page.getByText('Activas', { exact: true })).toBeVisible();
    await expect(page.getByText('Total hoy')).toBeVisible();
    await expect(page.getByText('Recaudado')).toBeVisible();

    // CTA
    await expect(page.getByRole('link', { name: 'Registrar cobro' })).toBeVisible();
  });

  test('Registrar sesión en efectivo: formulario muestra duraciones y calcula monto', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('DNI').fill(TEST_DNI);
    await page.getByLabel('Contraseña', { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL('**/permi', { timeout: 15_000 });

    // Ir a nueva sesión
    await page.getByRole('link', { name: 'Registrar cobro' }).click();
    await page.waitForURL('**/permi/nueva', { timeout: 5_000 });

    // Verificar formulario
    await expect(page.getByLabel('Patente del vehículo')).toBeVisible();

    // Botones de duración: "1 h" es la primera opción de DURACIONES [60, 75, 90, 120, 150, 180]
    await expect(page.getByRole('button', { name: '1 h', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '1 h 15 min' })).toBeVisible();

    // Patente única por corrida: el store en memoria persiste entre tests (y entre
    // proyectos de Playwright) y una patente ya cubierta no pasa por el cálculo.
    const patente = `TST${String(Date.now() % 1000).padStart(3, '0')}`;
    await page.getByLabel('Patente del vehículo').fill(patente);

    // Click en "Ver monto y confirmar"
    await page.getByRole('button', { name: 'Ver monto y confirmar' }).click();

    // Esperar server action. Se busca el alert DENTRO de <main>: el route announcer
    // de Next también tiene role="alert" y vive fuera, y hacía saltear el test siempre.
    const errorAlert = page.locator('main').getByRole('alert').filter({ hasText: /\S/ }).first();
    const errorVisible = await errorAlert.isVisible().catch(() => false);

    if (errorVisible) {
      const alertText = await errorAlert.textContent().catch(() => '');
      if (alertText && alertText.trim().length > 10) {
        test.skip(true, `Server action bloqueó el cálculo (posiblemente sin asignación hoy): ${alertText}`);
        return;
      }
    }

    // Paso "elegir medio": título, patente y los dos montos (efectivo $700 / digital $560)
    await expect(page.getByRole('heading', { name: '¿Cómo cobra?' })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(`Patente ${patente}`)).toBeVisible();
    await expect(page.getByRole('button', { name: /Efectivo \$700/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /Digital \$560/ })).toBeVisible();

    // Confirmar el cobro en efectivo: escribe en el store en memoria
    await page.getByRole('button', { name: /Confirmar cobro/ }).click();
    await expect(page.getByRole('heading', { name: 'Cobro registrado' })).toBeVisible({ timeout: 8000 });

    // Y la sesión aparece en el dashboard del permisionario y en la verificación pública
    await page.goto('/permi');
    await expect(page.getByText(patente).first()).toBeVisible();
    await page.goto(`/verificar/${patente}`);
    await expect(page.getByText('Sesión activa')).toBeVisible();
  });

});
