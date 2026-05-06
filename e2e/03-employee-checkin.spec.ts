import { test, expect } from '@playwright/test';
import { generateCnpj } from './helpers';

const API = 'http://127.0.0.1:3000/api/v1';

/**
 * Cenário 3: Login do funcionário → check-in → check-out
 */

async function createVerifiedEmployee(request: typeof test.prototype['request']) {
  const compEmail = `emp_comp_${Date.now()}@e2e.com`;
  const password = 'SenhaForte@123';

  // 1. Empresa
  const compRes = await request.post(`${API}/companies/register`, {
    data: {
      email: compEmail,
      ownerName: 'Empresa do Func',
      cnpj: generateCnpj(),
      ownerBirthDate: '1980-01-01',
      allowOvertime: true,
      maxOvertimeHours: 2,
      maxEmployees: 10,
      password,
    },
  });
  const { companyId } = await compRes.json() as { companyId: string };

  const cTokRes = await request.get(`${API}/test-utils/company-token/${companyId}`);
  const { token: cToken } = await cTokRes.json() as { token: string };
  await request.post(`${API}/companies/verify-email`, { data: { token: cToken } });

  const loginRes = await request.post(`${API}/companies/login`, {
    data: { email: compEmail, password },
  });
  const { accessToken } = await loginRes.json() as { accessToken: string };

  // 2. Cargo
  const roleRes = await request.post(`${API}/roles`, {
    data: { name: `Dev ${Date.now()}`, permissions: [] },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const { id: roleId } = await roleRes.json() as { id: string };

  // 3. Funcionário
  const now = new Date();
  const entryTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const exitHour = (now.getHours() + 1) % 24;
  const exitTime = `${String(exitHour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const empEmail = `func_${Date.now()}@e2e.com`;
  const empPassword = 'SenhaEmp@123';

  const empRes = await request.post(`${API}/employees`, {
    data: {
      name: 'Func E2E',
      email: empEmail,
      cpf: '529.982.247-25',
      birthDate: '1995-05-10',
      roleId,
      entryTime,
      exitTime,
      lateToleranceAllowed: false,
      overtimeAllowed: false,
      password: empPassword,
    },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const { employeeId } = await empRes.json() as { employeeId: string };

  // 4. Verifica e-mail do funcionário
  const eTokRes = await request.get(`${API}/test-utils/employee-token/${employeeId}`);
  const { token: eToken } = await eTokRes.json() as { token: string };
  await request.post(`${API}/employees/verify-email`, { data: { token: eToken } });

  return { empEmail, empPassword };
}

test.describe('Ponto do funcionário', () => {
  test('funcionário pode fazer login e acessar a tela de ponto', async ({ page, request }) => {
    const { empEmail, empPassword } = await createVerifiedEmployee(request);

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /portal do funcionário/i })).toBeVisible();

    await page.getByLabel(/e-mail/i).fill(empEmail);
    await page.getByLabel(/senha/i).fill(empPassword);
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL('/ponto', { timeout: 10_000 });
    await expect(page.getByRole('button', { name: /registrar entrada/i })).toBeVisible();
  });

  test('funcionário pode registrar check-in', async ({ page, request }) => {
    const { empEmail, empPassword } = await createVerifiedEmployee(request);

    await page.goto('/login');
    await page.getByLabel(/e-mail/i).fill(empEmail);
    await page.getByLabel(/senha/i).fill(empPassword);
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL('/ponto', { timeout: 10_000 });

    const checkInBtn = page.getByRole('button', { name: /registrar entrada/i });
    await expect(checkInBtn).toBeEnabled();
    await checkInBtn.click();

    // Após check-in, botão de entrada deve desabilitar e saída deve habilitar
    await expect(page.getByRole('button', { name: /registrar entrada/i })).toBeDisabled({ timeout: 8_000 });
    await expect(page.getByRole('button', { name: /registrar saída/i })).toBeEnabled({ timeout: 8_000 });
  });

  test('funcionário não pode fazer check-out antes do check-in', async ({ page, request }) => {
    const { empEmail, empPassword } = await createVerifiedEmployee(request);

    await page.goto('/login');
    await page.getByLabel(/e-mail/i).fill(empEmail);
    await page.getByLabel(/senha/i).fill(empPassword);
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL('/ponto', { timeout: 10_000 });

    // Botão de saída deve estar desabilitado sem check-in
    const checkOutBtn = page.getByRole('button', { name: /registrar saída/i });
    await expect(checkOutBtn).toBeDisabled();
  });
});
