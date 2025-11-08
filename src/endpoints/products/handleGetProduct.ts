import { Env } from "../../types";

export async function handleGetProduct(request: Request, env: Env, slugOrId: string): Promise<Response> {
  // detect whether slugOrId is an id (starts with 'prod-') or slug - your routing decides
  const isId = slugOrId.startsWith("prod-");

  const productSql = isId
    ? `SELECT * FROM products WHERE id = ? LIMIT 1`
    : `SELECT * FROM products WHERE slug = ? LIMIT 1`;

  const prodRes = await env.DB.prepare(productSql).bind(slugOrId).all();
  const row = prodRes.results?.[0];
  if (!row) {
    return new Response(JSON.stringify({ message: "Produto não encontrado." }), { status: 404, headers: { "Content-Type": "application/json" }});
  }
  const pid = row.id;

  // fetch related rows
  const [imagesRes, tagsRes, specsRes, matsRes, featsRes] = await Promise.all([
    env.DB.prepare(`SELECT * FROM product_images WHERE product_id = ? ORDER BY "order" ASC`).bind(pid).all(),
    env.DB.prepare(`SELECT tag FROM product_tags WHERE product_id = ?`).bind(pid).all(),
    env.DB.prepare(`SELECT label, value FROM product_specifications WHERE product_id = ?`).bind(pid).all(),
    env.DB.prepare(`SELECT material FROM product_materials WHERE product_id = ?`).bind(pid).all(),
    env.DB.prepare(`SELECT icon, label, value FROM product_features WHERE product_id = ?`).bind(pid).all(),
  ]);

  const product = {
    ...row,
    images: imagesRes.results || [],
    tags: (tagsRes.results || []).map((t:any) => t.tag),
    specifications: specsRes.results || [],
    materials: (matsRes.results || []).map((m:any) => m.material),
    features: featsRes.results || [],
  };

  return new Response(JSON.stringify({ data: product }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=240" }});
}