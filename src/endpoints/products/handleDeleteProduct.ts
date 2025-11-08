import { Env } from "../../types";
import { validateApiKeyFromRequest, unauthorizedResponse } from "../../util/auth";

export async function handleDeleteProduct(request: Request, env: Env, productId: string): Promise<Response> {
  // Validar API key
  if (!validateApiKeyFromRequest(request, env)) {
    return unauthorizedResponse();
  }

  try {
    // Buscar o produto e suas imagens antes de deletar
    const productRes = await env.DB.prepare(`SELECT id FROM products WHERE id = ? LIMIT 1`)
      .bind(productId)
      .first();

    if (!productRes) {
      return new Response(
        JSON.stringify({ message: "Produto não encontrado." }),
        { status: 404, headers: { "Content-Type": "application/json" }}
      );
    }

    // Buscar todas as imagens do produto para deletar do R2
    const imagesRes = await env.DB.prepare(`SELECT url FROM product_images WHERE product_id = ?`)
      .bind(productId)
      .all();

    // Deletar imagens do R2
    const deletePromises: Promise<void>[] = [];
    for (const img of (imagesRes.results || [])) {
      const url = (img as any).url;
      // Extrair a chave do R2 da URL
      // Assumindo URLs no formato: https://{DNS}/file/{key}
      const match = url.match(/\/file\/(.+)$/);
      if (match && match[1]) {
        const key = match[1];
        deletePromises.push(env.R2.delete(key));
      }
    }

    // Aguardar todas as deleções do R2
    await Promise.all(deletePromises);

    // Deletar o produto do banco (CASCADE vai deletar relacionamentos)
    await env.DB.prepare(`DELETE FROM products WHERE id = ?`)
      .bind(productId)
      .run();

    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: "Produto deletado com sucesso.",
        deletedImages: deletePromises.length 
      }),
      { status: 200, headers: { "Content-Type": "application/json" }}
    );

  } catch (err) {
    console.error("delete product error:", err);
    return new Response(
      JSON.stringify({ message: "Erro ao deletar produto.", error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" }}
    );
  }
}
