# Controle de Ponto — Frontend

Interface web para o sistema de controle de ponto eletrônico, com portal do funcionário e portal administrativo.

## Tecnologias

- **React 19** + TypeScript + Vite 8
- **Tailwind CSS v4**
- **React Router v7** com rotas protegidas por tipo de usuário
- **TanStack Query v5** para gerenciamento de estado do servidor
- **Axios** com interceptor de refresh token automático
- **React Hook Form** + **Zod** para validação de formulários
- **Recharts** para gráficos do dashboard
- **Vitest** + **Testing Library** + **MSW** para testes
- **Playwright** para testes E2E
- **Nginx** para servir em produção

## Funcionalidades

### Portal do Funcionário
- Login com e-mail e senha
- Verificação de e-mail
- Tela de ponto: check-in / check-out com status em tempo real
- Histórico de registros paginado

### Portal Administrativo
- Cadastro e login da empresa
- Gestão de funcionários (cadastrar, desativar)
- Gestão de cargos e permissões
- Dashboard com métricas: presença, pontualidade, horas extras, rankings e tendência diária

## Pré-requisitos

- Node.js 20+
- Backend rodando (ver repositório `attendance_back`)

## Configuração local

```bash
# 1. Instale as dependências
npm install

# 2. Configure a URL da API
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse em `http://localhost:5173`

## Testes

```bash
# Unitários
npm test

# Com cobertura
npm run test:coverage

# E2E (requer app rodando)
npm run test:e2e
```

7 testes unitários passando

## Build de produção

```bash
npm run build
```

## Deploy (EasyPanel)

O repositório contém o `Dockerfile` com build multi-stage (Node → Nginx).
Configure o build arg no EasyPanel:

```
VITE_API_URL=https://seu-dominio-da-api/api/v1
```
