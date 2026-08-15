// Sanitiza erros antes de logar no console do navegador.
// Remove .data (corpo cru da resposta da API, que pode conter PII),
// preservando apenas mensagem + status para diagnóstico.

import { ApiError } from './api';

export function safeError(err: unknown): { message: string; status?: number } {
  if (err instanceof ApiError) {
    return { message: err.message, status: err.status };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  if (typeof err === 'string') {
    return { message: err };
  }
  return { message: 'Unknown error' };
}
