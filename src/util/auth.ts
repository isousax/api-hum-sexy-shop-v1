import { Env } from "../types";

/**
 * Extrai e valida a API key do header X-API-KEY
 */
export function validateApiKeyFromRequest(request: Request, env: Env): boolean {
  const apiKey = request.headers.get("X-API-KEY");
  if (!apiKey) {
    return false;
  }
  return apiKey === env.WORKER_API_KEY;
}

/**
 * Retorna uma resposta de erro 401 Unauthorized
 */
export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ message: "Não autorizado. API key inválida ou ausente." }),
    { 
      status: 401, 
      headers: { "Content-Type": "application/json" }
    }
  );
}
