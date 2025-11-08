PRAGMA foreign_keys = ON;

-- categorias (opcional: pode popular com os dados mockados)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  "order" INTEGER DEFAULT 0
);

-- tabela principal de produtos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  shortDescription TEXT,
  price REAL NOT NULL DEFAULT 0,
  originalPrice REAL,
  category_id TEXT,
  subcategory TEXT,
  inStock INTEGER NOT NULL DEFAULT 1, -- 0 false, 1 true
  stockQuantity INTEGER DEFAULT 0,
  sku TEXT,
  rating REAL DEFAULT 0,
  reviewCount INTEGER DEFAULT 0,
  cleaningInstructions TEXT,
  warranty TEXT,
  createdAt TEXT,
  updatedAt TEXT,
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- imagens (ordem e primary marker)
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  isPrimary INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- tags (simples)
CREATE TABLE IF NOT EXISTS product_tags (
  product_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY(product_id, tag),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- especificações (label/value)
CREATE TABLE IF NOT EXISTS product_specifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- materiais (lista simples)
CREATE TABLE IF NOT EXISTS product_materials (
  product_id TEXT NOT NULL,
  material TEXT NOT NULL,
  PRIMARY KEY(product_id, material),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- features (icon, label, value stored como TEXT)
CREATE TABLE IF NOT EXISTS product_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  icon TEXT,
  label TEXT NOT NULL,
  value TEXT, -- armazenar 'true'|'false'|'string' conforme for
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON product_tags(tag);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
