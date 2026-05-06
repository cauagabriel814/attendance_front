import { test, expect } from '@playwright/test';
import { generateCnpj } from './helpers';

const API = 'http://127.0.0.1:3000/api/v1';

/**
 * Cenário 1: Cadastro e verificação de empresa
 */
test.describe('Cadastro de empresa', () => {
  test('exibe o formulário de cadastro corretamente', async ({ page }) => {
    await page.goto('/admin/cadastro');
    await expect(page.getByRole('heading', { name: /cadastro de empresa/i })).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/CNPJ/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /cadastrar empresa/i })).toBeVisible();
  });

  test('exibe erros de validação para campos inválidos', async ({ page }) => {
    await page.goto('/admin/cadastro');
    await page.getByRole('button', { name: /cadastrar empresa/i }).click();
    await expect(page.getByText(/e-mail inválido/i)).toBeVisible();
  });

  test('cadastra empresa com dados válidos e redireciona para mensagem de sucesso', async ({ page, request }) => {
    const email = `empresa_${Date.now()}@e2e-teste.com`;

    await page.goto('/admin/cadastro');

    await page.getByLabel(/e-mail/i).fill(email);
    await page.getByLabel(/nome do responsável/i).fill('João Admin E2E');
    const cnpj = generateCnpj();
    await page.getByLabel(/CNPJ/i).fill(cnpj);
    await page.getByLabel(/data de nascimento do responsável/i).fill('1985-06-15');
    await page.getByLabel(/máx. de funcionários/i).fill('10');
    await page.getByLabel('Senha', { exact: true }).fill('SenhaForte@123');
    await page.getByLabel(/confirmar senha/i).fill('SenhaForte@123');

    await page.getByRole('button', { name: /cadastrar empresa/i }).click();

    await expect(page.getByText(/empresa cadastrada/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/verifique seu e-mail/i)).toBeVisible();
  });

  test('fluxo completo: cadastro → verificação de e-mail → login', async ({ page, request }) => {
    const email = `empresa_full_${Date.now()}@e2e-teste.com`;
    const password = 'SenhaForte@123';

    // 1. Cadastra via API
    const regRes = await request.post(`${API}/companies/register`, {
      data: {
        email,
        ownerName: 'Admin Full E2E',
        cnpj: generateCnpj(),
        ownerBirthDate: '1985-06-15',
        allowOvertime: false,
        maxEmployees: 20,
        password,
      },
    });
    expect(regRes.ok()).toBeTruthy();
    const { companyId } = await regRes.json() as { companyId: string };

    // 2. Obtém token de verificação via test-utils
    const tokenRes = await request.get(`${API}/test-utils/company-token/${companyId}`);
    const { token } = await tokenRes.json() as { token: string };
    expect(token).toBeTruthy();

    // 3. Verifica o e-mail via página
    await page.goto(`/empresa/verificar-email?token=${token}`);
    await expect(page.getByText(/e-mail confirmado/i)).toBeVisible({ timeout: 10_000 });

    // 4. Faz login
    await page.getByRole('link', { name: /ir para o login/i }).click();
    await expect(page).toHaveURL('/admin/login');

    await page.getByLabel(/e-mail da empresa/i).fill(email);
    await page.getByLabel(/senha/i).fill(password);
    await page.getByRole('button', { name: /entrar/i }).click();

    // 5. Verifica redirect para dashboard
    await expect(page).toHaveURL('/admin/dashboard', { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});
