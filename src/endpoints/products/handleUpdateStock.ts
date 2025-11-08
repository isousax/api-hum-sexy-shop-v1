import { Env } from "../../types";
import { validateApiKeyFromRequest, unauthorizedResponse } from "../../util/auth";

export async function handleUpdateStock(request: Request, env: Env, productId: string): Promise<Response> {
  // Validar API key
  if (!validateApiKeyFromRequest(request, env)) {
    return unauthorizedResponse();
  }

  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ message: "JSON inválido" }),
      { status: 400, headers: { "Content-Type": "application/json" }}
    );
  }

  const { stockQuantity, inStock } = body;

  // Validar que pelo menos um campo foi fornecido
  if (stockQuantity === undefined && inStock === undefined) {
    return new Response(
      JSON.stringify({ message: "Forneça pelo menos 'stockQuantity' ou 'inStock'." }),
      { status: 400, headers: { "Content-Type": "application/json" }}
    );
  }

  try {
    // Verificar se o produto existe
    const productRes = await env.DB.prepare(`SELECT id, stockQuantity, inStock FROM products WHERE id = ? LIMIT 1`)
      .bind(productId)
      .first();

    if (!productRes) {
      return new Response(
        JSON.stringify({ message: "Produto não encontrado." }),
        { status: 404, headers: { "Content-Type": "application/json" }}
      );
    }

    // Construir query de atualização dinamicamente
    const updates: string[] = [];
    const binds: any[] = [];

    if (stockQuantity !== undefined) {
      if (typeof stockQuantity !== "number" || stockQuantity < 0) {
        return new Response(
          JSON.stringify({ message: "'stockQuantity' deve ser um número >= 0." }),
          { status: 400, headers: { "Content-Type": "application/json" }}
        );
      }
      updates.push("stockQuantity = ?");
      binds.push(stockQuantity);

      // Se stockQuantity for 0, automaticamente marcar como sem estoque
      if (stockQuantity === 0 && inStock === undefined) {
        updates.push("inStock = ?");
        binds.push(0);
      }
    }

    if (inStock !== undefined) {
      if (typeof inStock !== "boolean") {
        return new Response(
          JSON.stringify({ message: "'inStock' deve ser um booleano." }),
          { status: 400, headers: { "Content-Type": "application/json" }}
        );
      }
      updates.push("inStock = ?");
      binds.push(inStock ? 1 : 0);
    }

    updates.push("updatedAt = ?");
    binds.push(new Date().toISOString());

    binds.push(productId);

    const updateSql = `UPDATE products SET ${updates.join(", ")} WHERE id = ?`;
    await env.DB.prepare(updateSql).bind(...binds).run();

    // Buscar produto atualizado
    const updatedProduct = await env.DB.prepare(`SELECT id, name, stockQuantity, inStock, updatedAt FROM products WHERE id = ? LIMIT 1`)
      .bind(productId)
      .first();

    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: "Estoque atualizado com sucesso.",
        product: updatedProduct
      }),
      { status: 200, headers: { "Content-Type": "application/json" }}
    );

  } catch (err) {
    console.error("update stock error:", err);
    return new Response(
      JSON.stringify({ message: "Erro ao atualizar estoque.", error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" }}
    );
  }
}
