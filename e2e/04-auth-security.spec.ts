import { test, expect } from '@playwright/test';

/**
 * Cenário 4: Segurança — credenciais inválidas e proteção de rotas
 */

test.describe('Segurança e autenticação', () => {
  test('login com credenciais inválidas exibe mensagem de erro', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-mail/i).fill('inexistente@teste.com');
    await page.getByLabel(/senha/i).fill('SenhaErrada@123');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByRole('alert')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/e-mail ou senha inválidos/i)).toBeVisible();
    // Permanece na tela de login
    await expect(page).toHaveURL('/login');
  });

  test('login admin com credenciais inválidas exibe mensagem de erro', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/e-mail da empresa/i).fill('admin_invalido@teste.com');
    await page.getByLabel(/senha/i).fill('SenhaErrada@123');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByRole('alert')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/e-mail ou senha inválidos/i)).toBeVisible();
    await expect(page).toHaveURL('/admin/login');
  });

  test('rota protegida /ponto redireciona para /login sem autenticação', async ({ page }) => {
    await page.goto('/ponto');
    await expect(page).toHaveURL('/login');
  });

  test('rota protegida /admin/dashboard redireciona para /admin/login sem autenticação', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/admin/login');
  });

  test('rota protegida /admin/funcionarios redireciona sem autenticação', async ({ page }) => {
    await page.goto('/admin/funcionarios');
    await expect(page).toHaveURL('/admin/login');
  });

  test('funcionário não pode acessar dashboard admin', async ({ page, request }) => {
    // Simula login como funcionário e tenta ir para rota de company
    await page.goto('/login');
    // Injeta session de employee no localStorage
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'emp-token');
      localStorage.setItem('refreshToken', 'emp-refresh');
      localStorage.setItem('userType', 'employee');
      localStorage.setItem(
        'employeeData',
        JSON.stringify({
          id: 'e1', name: 'Func', email: 'f@f.com',
          entryTime: '08:00', exitTime: '17:00',
          role: 'Dev', overtimeAllowed: false, lateToleranceAllowed: false,
        }),
      );
    });

    await page.goto('/admin/dashboard');
    // Deve redirecionar para /ponto (área do employee)
    await expect(page).toHaveURL('/ponto');
  });

  test('CNPJ inválido no cadastro exibe erro de validação', async ({ page }) => {
    await page.goto('/admin/cadastro');
    await page.getByLabel(/CNPJ/i).fill('00.000.000/0000-00');
    await page.getByLabel(/e-mail/i).fill('teste@teste.com');
    await page.getByRole('button', { name: /cadastrar empresa/i }).click();
    await expect(page.getByText(/cnpj inválido/i)).toBeVisible({ timeout: 5_000 });
  });
});
