import { Env } from "./types";

import { handleUpload } from "./endpoints/files/handleUpload";
import { handlePublicFile } from "./endpoints/files/handlePublicFile";

import { handleCreateProduct } from "./endpoints/products/handleCreateProduct";
import { handleListProducts } from "./endpoints/products/handleListProducts";
import { handleGetProduct } from "./endpoints/products/handleGetProduct";
import { handleUpdateProduct } from "./endpoints/products/handleUpdateProduct";
import { handleDeleteProduct } from "./endpoints/products/handleDeleteProduct";
import { handleUpdateStock } from "./endpoints/products/handleUpdateStock";
import { handleCheckout } from "./endpoints/products/handleCheckout";


export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    //========== Products Endpoints ==========
    if (pathname === "/products" && request.method === "POST") {
      return handleCreateProduct(request, env);
    }

    if (pathname === "/products" && request.method === "GET") {
      return handleListProducts(request, env);
    }

    if (pathname.startsWith("/product/") && request.method === "GET") {
      const slugOrId = decodeURIComponent(pathname.replace("/product/", ""));
      return handleGetProduct(request, env, slugOrId);
    }

    // PUT /products/:id - Atualizar produto (requer API key)
    if (pathname.match(/^\/products\/[^/]+$/) && request.method === "PUT") {
      const productId = decodeURIComponent(pathname.replace("/products/", ""));
      return handleUpdateProduct(request, env, productId);
    }

    // DELETE /products/:id - Deletar produto (requer API key)
    if (pathname.startsWith("/products/") && request.method === "DELETE") {
      const productId = decodeURIComponent(pathname.replace("/products/", ""));
      return handleDeleteProduct(request, env, productId);
    }

    // PATCH /products/:id/stock - Atualizar estoque (requer API key)
    if (pathname.match(/^\/products\/[^/]+\/stock$/) && request.method === "PATCH") {
      const productId = decodeURIComponent(pathname.split("/")[2]);
      return handleUpdateStock(request, env, productId);
    }

    // POST /checkout - Processar compra (requer API key)
    if (pathname === "/checkout" && request.method === "POST") {
      return handleCheckout(request, env);
    }
    // =======================================

    // ========== Files Endpoints ============
    if (request.method === "PUT" && pathname === "/upload") {
      return await handleUpload(request, env);
    }

    if (request.method === "GET" && pathname.startsWith("/file/")) {
      const key = pathname.replace("/file/", "");
      return await handlePublicFile(request, key, env);
    }
    // =======================================

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-API-KEY",
        },
      });
    }

    return new Response(
      JSON.stringify({ message: "Recurso não encontrado." }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  },
};
