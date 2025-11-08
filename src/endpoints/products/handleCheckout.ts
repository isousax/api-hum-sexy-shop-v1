import { Env } from "../../types";
import { validateApiKeyFromRequest, unauthorizedResponse } from "../../util/auth";

interface CheckoutItem {
  productId: string;
  quantity: number;
}

interface CheckoutRequest {
  items: CheckoutItem[];
}

export async function handleCheckout(request: Request, env: Env): Promise<Response> {
  // Validar API key
  if (!validateApiKeyFromRequest(request, env)) {
    return unauthorizedResponse();
  }

  let body: CheckoutRequest;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ message: "JSON inválido" }),
      { status: 400, headers: { "Content-Type": "application/json" }}
    );
  }

  const { items } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return new Response(
      JSON.stringify({ message: "Forneça um array 'items' com pelo menos um produto." }),
      { status: 400, headers: { "Content-Type": "application/json" }}
    );
  }

  // Validar formato dos itens
  for (const item of items) {
    if (!item.productId || typeof item.productId !== "string") {
      return new Response(
        JSON.stringify({ message: "Cada item deve ter um 'productId' válido." }),
        { status: 400, headers: { "Content-Type": "application/json" }}
      );
    }
    if (!item.quantity || typeof item.quantity !== "number" || item.quantity <= 0) {
      return new Response(
        JSON.stringify({ message: "Cada item deve ter uma 'quantity' > 0." }),
        { status: 400, headers: { "Content-Type": "application/json" }}
      );
    }
  }

  try {
    const results: any[] = [];
    const errors: any[] = [];

    for (const item of items) {
      const { productId, quantity } = item;

      // Buscar produto atual
      const productRes = await env.DB.prepare(
        `SELECT id, name, stockQuantity, inStock FROM products WHERE id = ? LIMIT 1`
      ).bind(productId).first();

      if (!productRes) {
        errors.push({ productId, error: "Produto não encontrado." });
        continue;
      }

      const product = productRes as any;

      // Verificar se está em estoque
      if (!product.inStock) {
        errors.push({ productId, name: product.name, error: "Produto fora de estoque." });
        continue;
      }

      const currentStock = Number(product.stockQuantity || 0);

      // Verificar se há quantidade suficiente
      if (currentStock < quantity) {
        errors.push({ 
          productId, 
          name: product.name, 
          error: `Estoque insuficiente. Disponível: ${currentStock}, solicitado: ${quantity}.` 
        });
        continue;
      }

      // Calcular novo estoque
      const newStock = currentStock - quantity;
      const newInStock = newStock > 0 ? 1 : 0;

      // Atualizar estoque
      await env.DB.prepare(
        `UPDATE products SET stockQuantity = ?, inStock = ?, updatedAt = ? WHERE id = ?`
      ).bind(newStock, newInStock, new Date().toISOString(), productId).run();

      results.push({
        productId,
        name: product.name,
        quantityPurchased: quantity,
        previousStock: currentStock,
        newStock,
        inStock: newStock > 0
      });
    }

    const statusCode = errors.length > 0 ? (results.length > 0 ? 207 : 400) : 200;

    return new Response(
      JSON.stringify({ 
        ok: errors.length === 0,
        message: errors.length === 0 
          ? "Checkout processado com sucesso." 
          : "Checkout processado com alguns erros.",
        results,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: statusCode, headers: { "Content-Type": "application/json" }}
    );

  } catch (err) {
    console.error("checkout error:", err);
    return new Response(
      JSON.stringify({ message: "Erro ao processar checkout.", error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" }}
    );
  }
}
