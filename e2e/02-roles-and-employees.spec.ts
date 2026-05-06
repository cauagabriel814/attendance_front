import { test, expect } from '@playwright/test';
import { generateCnpj } from './helpers';

const API = 'http://127.0.0.1:3000/api/v1';

/**
 * Cenário 2: Cadastro de cargo e funcionário (admin autenticado)
 */

// ─── Fixture: empresa autenticada ─────────────────────────────────────────────

async function setupAuthenticatedCompany(request: typeof test.prototype['request']) {
  const email = `empresa_setup_${Date.now()}@e2e-teste.com`;
  const password = 'SenhaForte@123';

  const regRes = await request.post(`${API}/companies/register`, {
    data: {
      email,
      ownerName: 'Setup Admin',
      cnpj: generateCnpj(),
      ownerBirthDate: '1985-06-15',
      allowOvertime: false,
      maxEmployees: 20,
      password,
    },
  });
  const { companyId } = await regRes.json() as { companyId: string };

  const tokenRes = await request.get(`${API}/test-utils/company-token/${companyId}`);
  const { token } = await tokenRes.json() as { token: string };
  await request.post(`${API}/companies/verify-email`, { data: { token } });

  const loginRes = await request.post(`${API}/companies/login`, {
    data: { email, password },
  });
  const { accessToken } = await loginRes.json() as { accessToken: string; refreshToken: string };

  return { accessToken, email, password, companyId };
}

test.describe('Gestão de cargos e funcionários', () => {
  test('admin pode criar um cargo novo', async ({ page, request }) => {
    const { accessToken, email, password } = await setupAuthenticatedCompany(request);

    // Injeta tokens no localStorage antes de navegar
    await page.goto('/admin/login');
    await page.evaluate(
      ([token, emp, pwd]) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', 'mock-refresh');
        localStorage.setItem('userType', 'company');
        localStorage.setItem(
          'companyData',
          JSON.stringify({ id: 'c1', email: emp, ownerName: 'Setup Admin', allowOvertime: false, maxEmployees: 20, emailVerified: true, isActive: true, createdAt: '' }),
        );
        void pwd; // unused
      },
      [accessToken, email, password],
    );

    await page.goto('/admin/cargos');
    await expect(page.getByRole('heading', { name: /cargos/i })).toBeVisible();

    // Cria novo cargo
    await page.getByRole('button', { name: /\+ novo cargo/i }).click();
    await page.getByPlaceholder(/analista de rh/i).fill('Desenvolvedor E2E');
    await page.getByRole('button', { name: /criar/i }).click();

    // Verifica que o cargo aparece na tabela
    await expect(page.getByText('Desenvolvedor E2E')).toBeVisible({ timeout: 8_000 });
  });

  test('admin pode cadastrar um funcionário', async ({ page, request }) => {
    const { accessToken, email } = await setupAuthenticatedCompany(request);

    // Cria um cargo via API
    const roleRes = await request.post(`${API}/roles`, {
      data: { name: `Cargo E2E ${Date.now()}`, permissions: [] },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const role = await roleRes.json() as { id: string; name: string };

    // Injeta session
    await page.goto('/admin/login');
    await page.evaluate(
      ([token, emp]) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', 'mock-r');
        localStorage.setItem('userType', 'company');
        localStorage.setItem(
          'companyData',
          JSON.stringify({ id: 'c1', email: emp, ownerName: 'Setup Admin', allowOvertime: false, maxEmployees: 20, emailVerified: true, isActive: true, createdAt: '' }),
        );
      },
      [accessToken, email],
    );

    await page.goto('/admin/funcionarios');
    await expect(page.getByRole('heading', { name: /funcionários/i })).toBeVisible();

    // Abre modal
    await page.getByRole('button', { name: /\+ cadastrar funcionário/i }).click();
    await expect(page.getByRole('heading', { name: /cadastrar funcionário/i })).toBeVisible();

    // Preenche o formulário
    const empEmail = `func_${Date.now()}@e2e.com`;
    await page.getByLabel(/nome completo/i).fill('Maria E2E');
    await page.getByLabel(/e-mail/i).fill(empEmail);
    await page.getByLabel(/cpf/i).fill('529.982.247-25');
    await page.getByLabel(/data de nascimento/i).fill('1995-03-20');
    await page.getByLabel(/cargo/i).selectOption({ label: role.name });
    await page.getByLabel(/horário de entrada/i).fill('08:00');
    await page.getByLabel(/horário de saída/i).fill('17:00');
    await page.getByLabel(/senha temporária/i).fill('SenhaTemp@123');

    await page.getByRole('button', { name: /^cadastrar$/i }).click();

    // Verifica mensagem de sucesso
    await expect(page.getByText(/funcionário cadastrado/i)).toBeVisible({ timeout: 10_000 });
  });
});
