import { Env } from "../../types";

const ALLOWED_KEY_REGEX = /^[a-zA-Z0-9_\-./]{1,240}$/;
const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, If-None-Match"
};

export async function handlePublicFile(
  request: Request,
  key: string,
  env: Env
): Promise<Response> {

  if (!key || !key.trim() || key.includes("..") || key.startsWith("/") || !ALLOWED_KEY_REGEX.test(key)) {
    return new Response(JSON.stringify({ message: "Chave de arquivo inválida." }), {
      status: 400,
      headers: JSON_HEADERS
    });
  }

  try {
    const object = await env.R2.get(key);
    if (!object) {
      return new Response(JSON.stringify({ message: "Arquivo não encontrado." }), {
        status: 404,
        headers: JSON_HEADERS
      });
    }

    const contentType = object.httpMetadata?.contentType || "application/octet-stream";

    // Headers de resposta (binário)
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=7200"); // 2 horas
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, If-None-Match");
    headers.set("X-Content-Type-Options", "nosniff");

    // GET -> retornar o stream/buffer
    // object.body aqui é um ReadableStream — Response aceita isso diretamente
    return new Response(object.body, { status: 200, headers });
  } catch (err) {
    console.error("Erro ao buscar arquivo:", err, { key });
    return new Response(JSON.stringify({ message: "Erro ao acessar o arquivo." }), {
      status: 500,
      headers: JSON_HEADERS
    });
  }
}
