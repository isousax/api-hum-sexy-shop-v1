import { Env } from "../../types";
import { validateApiKeyFromRequest, unauthorizedResponse } from "../../util/auth";

export async function handleUpdateProduct(request: Request, env: Env, productId: string): Promise<Response> {
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

  try {
    // Verificar se o produto existe
    const existingProduct = await env.DB.prepare(`SELECT id FROM products WHERE id = ? LIMIT 1`)
      .bind(productId)
      .first();

    if (!existingProduct) {
      return new Response(
        JSON.stringify({ message: "Produto não encontrado." }),
        { status: 404, headers: { "Content-Type": "application/json" }}
      );
    }

    // Campos que podem ser atualizados
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      originalPrice,
      category,
      subcategory,
      inStock,
      stockQuantity,
      sku,
      rating,
      reviewCount,
      cleaningInstructions,
      warranty,
      images,
      tags,
      specifications,
      materials,
      features
    } = body;

    // Atualizar campos principais do produto
    const updates: string[] = [];
    const binds: any[] = [];

    if (name !== undefined) { updates.push("name = ?"); binds.push(name); }
    if (slug !== undefined) { updates.push("slug = ?"); binds.push(slug); }
    if (description !== undefined) { updates.push("description = ?"); binds.push(description); }
    if (shortDescription !== undefined) { updates.push("shortDescription = ?"); binds.push(shortDescription); }
    if (price !== undefined) { updates.push("price = ?"); binds.push(price); }
    if (originalPrice !== undefined) { updates.push("originalPrice = ?"); binds.push(originalPrice); }
    if (category?.id !== undefined) { updates.push("category_id = ?"); binds.push(category.id); }
    if (subcategory !== undefined) { updates.push("subcategory = ?"); binds.push(subcategory); }
    if (inStock !== undefined) { updates.push("inStock = ?"); binds.push(inStock ? 1 : 0); }
    if (stockQuantity !== undefined) { updates.push("stockQuantity = ?"); binds.push(stockQuantity); }
    if (sku !== undefined) { updates.push("sku = ?"); binds.push(sku); }
    if (rating !== undefined) { updates.push("rating = ?"); binds.push(rating); }
    if (reviewCount !== undefined) { updates.push("reviewCount = ?"); binds.push(reviewCount); }
    if (cleaningInstructions !== undefined) { updates.push("cleaningInstructions = ?"); binds.push(cleaningInstructions); }
    if (warranty !== undefined) { updates.push("warranty = ?"); binds.push(warranty); }

    updates.push("updatedAt = ?");
    binds.push(new Date().toISOString());
    binds.push(productId);

    if (updates.length > 1) { // > 1 porque updatedAt sempre está presente
      const updateSql = `UPDATE products SET ${updates.join(", ")} WHERE id = ?`;
      await env.DB.prepare(updateSql).bind(...binds).run();
    }

    // Atualizar relações se fornecidas
    if (images !== undefined && Array.isArray(images)) {
      await env.DB.prepare(`DELETE FROM product_images WHERE product_id = ?`).bind(productId).run();
      for (const img of images) {
        const iid = img.id ?? `${productId}-img-${Math.random().toString(36).slice(2,9)}`;
        await env.DB.prepare(`
          INSERT INTO product_images (id, product_id, url, alt, isPrimary, "order")
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(iid, productId, img.url, img.alt ?? null, img.isPrimary ? 1 : 0, img.order ?? 0).run();
      }
    }

    if (tags !== undefined && Array.isArray(tags)) {
      await env.DB.prepare(`DELETE FROM product_tags WHERE product_id = ?`).bind(productId).run();
      for (const t of tags) {
        await env.DB.prepare(`INSERT INTO product_tags (product_id, tag) VALUES (?, ?)`).bind(productId, t).run();
      }
    }

    if (specifications !== undefined && Array.isArray(specifications)) {
      await env.DB.prepare(`DELETE FROM product_specifications WHERE product_id = ?`).bind(productId).run();
      for (const s of specifications) {
        await env.DB.prepare(`INSERT INTO product_specifications (product_id, label, value) VALUES (?, ?, ?)`)
          .bind(productId, s.label, s.value).run();
      }
    }

    if (materials !== undefined && Array.isArray(materials)) {
      await env.DB.prepare(`DELETE FROM product_materials WHERE product_id = ?`).bind(productId).run();
      for (const m of materials) {
        await env.DB.prepare(`INSERT INTO product_materials (product_id, material) VALUES (?, ?)`).bind(productId, m).run();
      }
    }

    if (features !== undefined && Array.isArray(features)) {
      await env.DB.prepare(`DELETE FROM product_features WHERE product_id = ?`).bind(productId).run();
      for (const f of features) {
        const value = typeof f.value === "boolean" ? (f.value ? "true" : "false") : (f.value ?? "");
        await env.DB.prepare(`INSERT INTO product_features (product_id, icon, label, value) VALUES (?, ?, ?, ?)`)
          .bind(productId, f.icon ?? null, f.label, value).run();
      }
    }

    return new Response(
      JSON.stringify({ ok: true, message: "Produto atualizado com sucesso." }),
      { status: 200, headers: { "Content-Type": "application/json" }}
    );

  } catch (err) {
    console.error("update product error:", err);
    return new Response(
      JSON.stringify({ message: "Erro ao atualizar produto.", error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" }}
    );
  }
}
