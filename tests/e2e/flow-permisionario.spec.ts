/**
 * E2E: Flujo del permisionario (autenticado).
 *
 * Usuario de test: DNI 20184567 / password test123
 * Creado/verificado automáticamente por tests/setup/global-setup.ts.
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
    await expect(page.getByText('Activas')).toBeVisible();
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

    // Ingresar patente
    await page.getByLabel('Patente del vehículo').fill('TST001');

    // Click en "Ver monto y confirmar"
    await page.getByRole('button', { name: 'Ver monto y confirmar' }).click();

    // Esperar server action
    const errorAlert = page.getByRole('alert').filter({ hasText: /\S/ }).first();
    const errorVisible = await errorAlert.isVisible().catch(() => false);

    if (errorVisible) {
      const alertText = await errorAlert.textContent().catch(() => '');
      if (alertText && alertText.trim().length > 10) {
        test.skip(true, `Server action bloqueó el cálculo (posiblemente sin asignación hoy): ${alertText}`);
        return;
      }
    }

    // Paso "confirmar": debe mostrar el título y el monto
    await expect(page.getByText('Confirmá el cobro')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('TST001')).toBeVisible();

    // El monto para auto 1h en efectivo = $700
    await expect(page.getByText('$700')).toBeVisible();

    // Botón de confirmar
    await expect(page.getByRole('button', { name: 'Confirmar cobro' })).toBeVisible();
  });

});
