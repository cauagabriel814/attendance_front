import '@testing-library/jest-dom';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './msw-server';

// Inicia o servidor MSW antes de todos os testes
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reseta handlers após cada teste
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Para o servidor após todos os testes
afterAll(() => server.close());
