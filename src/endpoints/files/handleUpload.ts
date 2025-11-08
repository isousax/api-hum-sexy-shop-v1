import { Env } from "../../types";
import { validateApiKey } from "../../util/validateApiKey";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB - ajuste conforme necessário
const ALLOWED_KEY_REGEX = /^[a-zA-Z0-9_\-./]{1,240}$/; // ajustar limite de tamanho

function createJsonHeaders(cache = false) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "PUT, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, X-API-KEY");
  if (cache) headers.set("Cache-Control", "public, max-age=7200");
  return headers;
}

export async function handleUpload(request: Request, env: Env): Promise<Response> {

  const url = new URL(request.url);
  const keyParam = url.searchParams.get("key") || "";

  const apiKey = request.headers.get("X-API-KEY") || "";
  if (!validateApiKey(apiKey, env)) {
    return new Response(JSON.stringify({ message: "API key inválida." }), {
      status: 401,
      headers: createJsonHeaders(),
    });
  }

  // key validation / sanitization
  const key = keyParam.trim();
  if (!key || !ALLOWED_KEY_REGEX.test(key) || key.includes("..") || key.startsWith("/")) {
    return new Response(JSON.stringify({ message: "Chave (key) inválida." }), {
      status: 400,
      headers: createJsonHeaders(),
    });
  }

  // content type
  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.startsWith("image/")) {
    return new Response(JSON.stringify({ message: "Formato não suportado." }), {
      status: 415,
      headers: createJsonHeaders(),
    });
  }

  // check Content-Length header first (if provided)
  const contentLengthHeader = request.headers.get("Content-Length");
  if (contentLengthHeader) {
    const length = Number(contentLengthHeader);
    if (Number.isNaN(length) || length <= 0) {
      return new Response(JSON.stringify({ message: "Content-Length inválido." }), {
        status: 400,
        headers: createJsonHeaders(),
      });
    }
    if (length > MAX_BYTES) {
      return new Response(JSON.stringify({ message: "Arquivo muito grande." }), {
        status: 413,
        headers: createJsonHeaders(),
      });
    }

    //streamar diretamente para R2 (evitando buffer)
    try {
      await env.R2.put(key, request.body as ReadableStream, {
        httpMetadata: { contentType },
      });

      const publicUrl = `https://${env.DNS}/file/${encodeURIComponent(key)}`;
      return new Response(JSON.stringify({ url: publicUrl, key, size: length }), {
        status: 200,
        headers: createJsonHeaders(true),
      });
    } catch (err) {
      console.error("Erro no upload (stream):", err);
      return new Response(JSON.stringify({ message: "Erro inesperado no servidor." }), {
        status: 500,
        headers: createJsonHeaders(),
      });
    }
  }

  // caso não haja Content-Length: ler como ArrayBuffer, mas com validação de limite
  try {
    const buf = await request.arrayBuffer();
    if (buf.byteLength === 0) {
      return new Response(JSON.stringify({ message: "Arquivo vazio." }), {
        status: 400,
        headers: createJsonHeaders(),
      });
    }
    if (buf.byteLength > MAX_BYTES) {
      return new Response(JSON.stringify({ message: "Arquivo muito grande." }), {
        status: 413,
        headers: createJsonHeaders(),
      });
    }

    await env.R2.put(key, buf, {
      httpMetadata: { contentType },
    });

    const publicUrl = `https://${env.DNS}/file/${encodeURIComponent(key)}`;
    return new Response(JSON.stringify({ url: publicUrl, key, size: buf.byteLength }), {
      status: 200,
      headers: createJsonHeaders(true),
    });
  } catch (err) {
    console.error("Erro no upload (buffer):", err);
    return new Response(JSON.stringify({ message: "Upload de arquivo inválido." }), {
      status: 400,
      headers: createJsonHeaders(),
    });
  }
}
