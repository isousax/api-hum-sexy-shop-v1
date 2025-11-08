import { Env } from "../../types";

export async function handleListProducts(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const category = url.searchParams.get("category") || "";
  const tag = url.searchParams.get("tag") || "";
  const inStock = url.searchParams.get("inStock");
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const per_page = Math.min(100, Math.max(1, Number(url.searchParams.get("per_page") || 20)));
  const offset = (page - 1) * per_page;

  // base query with filters
  const whereClauses: string[] = [];
  const binds: any[] = [];

  if (q) {
    whereClauses.push("(name LIKE ? OR slug LIKE ? OR description LIKE ?)");
    const term = `%${q}%`;
    binds.push(term, term, term);
  }
  if (category) {
    whereClauses.push("category_id = ?");
    binds.push(category);
  }
  if (inStock === "true" || inStock === "false") {
    whereClauses.push("inStock = ?");
    binds.push(inStock === "true" ? 1 : 0);
  }
  if (tag) {
    // join via EXISTS on product_tags
    whereClauses.push("EXISTS (SELECT 1 FROM product_tags t WHERE t.product_id = products.id AND t.tag = ?)");
    binds.push(tag);
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // count total
  const countSql = `SELECT COUNT(1) as total FROM products ${where}`;
  const countRes = await env.DB.prepare(countSql).bind(...binds).all();
  const total = Number(countRes.results?.[0]?.total ?? 0);

  // fetch products
  const sql = `
    SELECT id, name, slug, shortDescription, price, originalPrice, inStock, stockQuantity, sku, rating, reviewCount, category_id, subcategory
    FROM products
    ${where}
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
  `;
  const rows = await env.DB.prepare(sql).bind(...binds, per_page, offset).all();
  const products = (rows.results ?? []) as Array<{ id: string; [key: string]: any }>;

  // fetch related arrays for products (images, tags, specs) in batch
  const ids = products.map((r) => r.id);
  const resultProducts: any[] = [];

  if (ids.length > 0) {
    // images
    const questionMarks = ids.map(() => "?").join(",");
    const imagesRes = await env.DB.prepare(`SELECT * FROM product_images WHERE product_id IN (${questionMarks}) ORDER BY "order" ASC`).bind(...ids).all();
    const tagsRes = await env.DB.prepare(`SELECT * FROM product_tags WHERE product_id IN (${questionMarks})`).bind(...ids).all();
    const specsRes = await env.DB.prepare(`SELECT * FROM product_specifications WHERE product_id IN (${questionMarks})`).bind(...ids).all();
    const matsRes = await env.DB.prepare(`SELECT * FROM product_materials WHERE product_id IN (${questionMarks})`).bind(...ids).all();
    const featsRes = await env.DB.prepare(`SELECT * FROM product_features WHERE product_id IN (${questionMarks})`).bind(...ids).all();

    const imagesByProduct: Record<string, any[]> = {};
    (imagesRes.results || []).forEach((img: any) => {
      imagesByProduct[img.product_id] = imagesByProduct[img.product_id] || [];
      imagesByProduct[img.product_id].push(img);
    });

    const tagsByProduct: Record<string, string[]> = {};
    (tagsRes.results || []).forEach((t: any) => {
      tagsByProduct[t.product_id] = tagsByProduct[t.product_id] || [];
      tagsByProduct[t.product_id].push(t.tag);
    });

    const specsByProduct: Record<string, any[]> = {};
    (specsRes.results || []).forEach((s: any) => {
      specsByProduct[s.product_id] = specsByProduct[s.product_id] || [];
      specsByProduct[s.product_id].push({ label: s.label, value: s.value });
    });

    const matsByProduct: Record<string, string[]> = {};
    (matsRes.results || []).forEach((m: any) => {
      matsByProduct[m.product_id] = matsByProduct[m.product_id] || [];
      matsByProduct[m.product_id].push(m.material);
    });

    const featsByProduct: Record<string, any[]> = {};
    (featsRes.results || []).forEach((f: any) => {
      featsByProduct[f.product_id] = featsByProduct[f.product_id] || [];
      featsByProduct[f.product_id].push({ icon: f.icon, label: f.label, value: f.value });
    });

    for (const r of products) {
      resultProducts.push({
        ...r,
        images: imagesByProduct[r.id] ?? [],
        tags: tagsByProduct[r.id] ?? [],
        specifications: specsByProduct[r.id] ?? [],
        materials: matsByProduct[r.id] ?? [],
        features: featsByProduct[r.id] ?? [],
      });
    }
  }

  return new Response(JSON.stringify({
    data: resultProducts,
    meta: {
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page)
    }
  }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" }});
}
