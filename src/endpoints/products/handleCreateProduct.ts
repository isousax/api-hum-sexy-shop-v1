import { Env } from "../../types";
import { validateApiKeyFromRequest, unauthorizedResponse } from "../../util/auth";

export async function handleCreateProduct(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ message: "Método não permitido" }), { status: 405, headers: { "Content-Type": "application/json" }});
  }

  // Validar API key para operação de criação
  if (!validateApiKeyFromRequest(request, env)) {
    return unauthorizedResponse();
  }

  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ message: "JSON inválido" }), { status: 400, headers: { "Content-Type": "application/json" }});
  }

  // permite receber um produto ou array de produtos
  const products = Array.isArray(body) ? body : [body];

  try {
    for (const p of products) {
      // campos essenciais
      const {
        id,
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
        createdAt,
        updatedAt,
        images = [],
        tags = [],
        specifications = [],
        materials = [],
        features = []
      } = p;

      if (!id || !name || !slug) {
        throw new Error("product must have id, name and slug");
      }

      // upsert product
      // SQLite: use INSERT OR REPLACE or run DELETE+INSERT to preserve foreign keys - prefer REPLACE carefully
      // We'll try INSERT OR REPLACE to update product row (keeps FK cleanup in child tables handled below)
      const upsertSql = `
        INSERT INTO products (
          id, name, slug, description, shortDescription, price, originalPrice,
          category_id, subcategory, inStock, stockQuantity, sku, rating, reviewCount,
          cleaningInstructions, warranty, createdAt, updatedAt
        ) VALUES (
          ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
        )
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name,
          slug=excluded.slug,
          description=excluded.description,
          shortDescription=excluded.shortDescription,
          price=excluded.price,
          originalPrice=excluded.originalPrice,
          category_id=excluded.category_id,
          subcategory=excluded.subcategory,
          inStock=excluded.inStock,
          stockQuantity=excluded.stockQuantity,
          sku=excluded.sku,
          rating=excluded.rating,
          reviewCount=excluded.reviewCount,
          cleaningInstructions=excluded.cleaningInstructions,
          warranty=excluded.warranty,
          createdAt=excluded.createdAt,
          updatedAt=excluded.updatedAt;
      `;

      const category_id = category?.id ?? null;

      await env.DB.prepare(upsertSql)
        .bind(
          id,
          name,
          slug,
          description ?? null,
          shortDescription ?? null,
          price ?? 0,
          originalPrice ?? null,
          category_id,
          subcategory ?? null,
          inStock ? 1 : 0,
          stockQuantity ?? 0,
          sku ?? null,
          rating ?? 0,
          reviewCount ?? 0,
          cleaningInstructions ?? null,
          warranty ?? null,
          createdAt ?? new Date().toISOString(),
          updatedAt ?? new Date().toISOString()
        ).run();

      // limpar dados relacionais antigos
      await env.DB.prepare(`DELETE FROM product_images WHERE product_id = ?`).bind(id).run();
      await env.DB.prepare(`DELETE FROM product_tags WHERE product_id = ?`).bind(id).run();
      await env.DB.prepare(`DELETE FROM product_specifications WHERE product_id = ?`).bind(id).run();
      await env.DB.prepare(`DELETE FROM product_materials WHERE product_id = ?`).bind(id).run();
      await env.DB.prepare(`DELETE FROM product_features WHERE product_id = ?`).bind(id).run();

      // inserir images
      for (const img of images) {
        const iid = img.id ?? `${id}-img-${Math.random().toString(36).slice(2,9)}`;
        await env.DB.prepare(`
          INSERT INTO product_images (id, product_id, url, alt, isPrimary, "order")
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(iid, id, img.url, img.alt ?? null, img.isPrimary ? 1 : 0, img.order ?? 0).run();
      }

      // tags
      for (const t of tags) {
        await env.DB.prepare(`INSERT INTO product_tags (product_id, tag) VALUES (?, ?)`).bind(id, t).run();
      }

      // specifications
      for (const s of specifications) {
        await env.DB.prepare(`INSERT INTO product_specifications (product_id, label, value) VALUES (?, ?, ?)`)
          .bind(id, s.label, s.value).run();
      }

      // materials
      for (const m of materials) {
        await env.DB.prepare(`INSERT INTO product_materials (product_id, material) VALUES (?, ?)`).bind(id, m).run();
      }

      // features (value serialized to string)
      for (const f of features) {
        const value = typeof f.value === "boolean" ? (f.value ? "true" : "false") : (f.value ?? "");
        await env.DB.prepare(`INSERT INTO product_features (product_id, icon, label, value) VALUES (?, ?, ?, ?)`)
          .bind(id, f.icon ?? null, f.label, value).run();
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error("create product error:", err);
    return new Response(JSON.stringify({ message: "Erro ao salvar produto.", error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}
