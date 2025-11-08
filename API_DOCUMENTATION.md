# API Documentation - SexyShop Backend

## Visão Geral

API RESTful para gerenciamento de produtos de e-commerce construída com Cloudflare Workers, D1 (SQLite) e R2 (Storage).

## Autenticação

Endpoints protegidos requerem autenticação via header HTTP:

```
X-API-KEY: <sua-chave-api>
```

A chave API deve ser configurada na variável de ambiente `WORKER_API_KEY`.

## Endpoints

### Produtos

#### 1. Listar Produtos
```http
GET /products
```

**Query Parameters:**
- `q` (string, opcional): Busca por nome, slug ou descrição
- `category` (string, opcional): Filtrar por ID de categoria
- `tag` (string, opcional): Filtrar por tag
- `inStock` (boolean, opcional): Filtrar por disponibilidade
- `page` (number, opcional): Página atual (padrão: 1)
- `per_page` (number, opcional): Itens por página (padrão: 20, máx: 100)

**Resposta:**
```json
{
  "data": [
    {
      "id": "prod-123",
      "name": "Produto Exemplo",
      "slug": "produto-exemplo",
      "price": 99.90,
      "inStock": true,
      "stockQuantity": 50,
      "images": [...],
      "tags": [...],
      ...
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

#### 2. Obter Produto por ID ou Slug
```http
GET /product/:slugOrId
```

**Parâmetros:**
- `slugOrId`: ID do produto (ex: `prod-123`) ou slug (ex: `produto-exemplo`)

**Resposta:**
```json
{
  "data": {
    "id": "prod-123",
    "name": "Produto Exemplo",
    "slug": "produto-exemplo",
    "description": "Descrição completa...",
    "shortDescription": "Descrição curta...",
    "price": 99.90,
    "originalPrice": 149.90,
    "category_id": "cat-1",
    "subcategory": "Subcategoria",
    "inStock": true,
    "stockQuantity": 50,
    "sku": "SKU-123",
    "rating": 4.5,
    "reviewCount": 42,
    "cleaningInstructions": "...",
    "warranty": "6 meses",
    "images": [
      {
        "id": "img-1",
        "url": "https://...",
        "alt": "Imagem do produto",
        "isPrimary": true,
        "order": 0
      }
    ],
    "tags": ["tag1", "tag2"],
    "specifications": [
      { "label": "Tamanho", "value": "Grande" }
    ],
    "materials": ["Silicone", "ABS"],
    "features": [
      { "icon": "battery", "label": "Recarregável", "value": "true" }
    ]
  }
}
```

#### 3. Criar Produtos 🔒
```http
POST /products
X-API-KEY: <sua-chave>
```

**Body:** Aceita um produto ou array de produtos.

```json
{
  "id": "prod-123",
  "name": "Produto Novo",
  "slug": "produto-novo",
  "description": "Descrição...",
  "shortDescription": "Descrição curta...",
  "price": 99.90,
  "originalPrice": 149.90,
  "category": { "id": "cat-1" },
  "subcategory": "Subcategoria",
  "inStock": true,
  "stockQuantity": 100,
  "sku": "SKU-NEW-123",
  "rating": 0,
  "reviewCount": 0,
  "images": [
    {
      "url": "https://...",
      "alt": "Imagem",
      "isPrimary": true,
      "order": 0
    }
  ],
  "tags": ["tag1", "tag2"],
  "specifications": [
    { "label": "Tamanho", "value": "Médio" }
  ],
  "materials": ["Silicone"],
  "features": [
    { "icon": "waterproof", "label": "À prova d'água", "value": "true" }
  ]
}
```

**Resposta:**
```json
{
  "ok": true
}
```

#### 4. Atualizar Produto 🔒
```http
PUT /products/:id
X-API-KEY: <sua-chave>
```

**Body:** Campos a serem atualizados (parcial ou completo).

```json
{
  "name": "Produto Atualizado",
  "price": 89.90,
  "stockQuantity": 75,
  "images": [...]
}
```

**Resposta:**
```json
{
  "ok": true,
  "message": "Produto atualizado com sucesso."
}
```

#### 5. Deletar Produto 🔒
```http
DELETE /products/:id
X-API-KEY: <sua-chave>
```

**Resposta:**
```json
{
  "ok": true,
  "message": "Produto deletado com sucesso.",
  "deletedImages": 3
}
```

**Nota:** Este endpoint também deleta todas as imagens do produto armazenadas no R2.

#### 6. Atualizar Estoque 🔒
```http
PATCH /products/:id/stock
X-API-KEY: <sua-chave>
```

**Body:**
```json
{
  "stockQuantity": 50,
  "inStock": true
}
```

**Comportamento:**
- Se `stockQuantity` for 0, automaticamente marca `inStock` como `false`
- Pelo menos um dos campos deve ser fornecido

**Resposta:**
```json
{
  "ok": true,
  "message": "Estoque atualizado com sucesso.",
  "product": {
    "id": "prod-123",
    "name": "Produto",
    "stockQuantity": 50,
    "inStock": true,
    "updatedAt": "2025-11-08T..."
  }
}
```

### Checkout

#### 7. Processar Compra 🔒
```http
POST /checkout
X-API-KEY: <sua-chave>
```

**Body:**
```json
{
  "items": [
    {
      "productId": "prod-123",
      "quantity": 2
    },
    {
      "productId": "prod-456",
      "quantity": 1
    }
  ]
}
```

**Comportamento:**
- Valida disponibilidade de estoque para cada item
- Reduz a quantidade em estoque
- Marca `inStock` como `false` se estoque chegar a 0
- Processa todos os itens possíveis mesmo se alguns falharem

**Resposta (sucesso total):**
```json
{
  "ok": true,
  "message": "Checkout processado com sucesso.",
  "results": [
    {
      "productId": "prod-123",
      "name": "Produto 1",
      "quantityPurchased": 2,
      "previousStock": 52,
      "newStock": 50,
      "inStock": true
    }
  ]
}
```

**Resposta (sucesso parcial - status 207):**
```json
{
  "ok": false,
  "message": "Checkout processado com alguns erros.",
  "results": [...],
  "errors": [
    {
      "productId": "prod-999",
      "error": "Produto não encontrado."
    },
    {
      "productId": "prod-456",
      "name": "Produto Esgotado",
      "error": "Produto fora de estoque."
    }
  ]
}
```

### Upload de Arquivos

#### 8. Upload de Arquivo 🔒
```http
PUT /upload
X-API-KEY: <sua-chave>
Content-Type: multipart/form-data
```

**Body (FormData):**
- Campo `file`: arquivo a ser enviado

**Resposta:**
```json
{
  "url": "https://{DNS}/file/{key}",
  "key": "{key}"
}
```

#### 9. Servir Arquivo Público
```http
GET /file/:key
```

**Resposta:** Conteúdo do arquivo com headers apropriados de cache.

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `204 No Content`: Requisição bem-sucedida sem conteúdo (CORS preflight)
- `207 Multi-Status`: Operação parcialmente bem-sucedida
- `400 Bad Request`: Dados inválidos ou malformados
- `401 Unauthorized`: API key ausente ou inválida
- `404 Not Found`: Recurso não encontrado
- `405 Method Not Allowed`: Método HTTP não suportado
- `500 Internal Server Error`: Erro no servidor

## CORS

A API suporta CORS com as seguintes configurações:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-API-KEY
```

## Modelo de Dados

### Produto

```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  category_id?: string;
  subcategory?: string;
  inStock: boolean;
  stockQuantity: number;
  sku?: string;
  rating: number;
  reviewCount: number;
  cleaningInstructions?: string;
  warranty?: string;
  createdAt: string;
  updatedAt: string;
  images: Image[];
  tags: string[];
  specifications: Specification[];
  materials: string[];
  features: Feature[];
}

interface Image {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
}

interface Specification {
  label: string;
  value: string;
}

interface Feature {
  icon?: string;
  label: string;
  value: string; // "true", "false", ou outro valor
}
```

## Observações Importantes

### D1 (SQLite) Limitations

- **Sem suporte a transações**: O Cloudflare D1 não suporta `BEGIN`, `COMMIT`, `ROLLBACK`
- **Foreign Keys**: CASCADE DELETE funciona automaticamente para limpar relacionamentos
- **Prepared Statements**: Sempre use `.prepare()` e `.bind()` para evitar SQL injection

### R2 Storage

- URLs de imagens seguem o padrão: `https://{DNS}/file/{key}`
- Ao deletar produtos, as imagens são automaticamente removidas do R2
- Cache de arquivos públicos: `Cache-Control: public, max-age=31536000`

### Performance

- Query de listagem usa paginação (máximo 100 itens por página)
- Queries em batch para buscar relacionamentos (images, tags, etc.)
- Cache headers configurados para respostas GET de produtos

## Exemplo de Uso

### JavaScript/TypeScript

```typescript
// Listar produtos
const response = await fetch('https://api.example.com/products?page=1&per_page=20');
const { data, meta } = await response.json();

// Criar produto (requer API key)
const newProduct = await fetch('https://api.example.com/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'sua-chave-api'
  },
  body: JSON.stringify({ ... })
});

// Processar checkout (requer API key)
const checkout = await fetch('https://api.example.com/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'sua-chave-api'
  },
  body: JSON.stringify({
    items: [
      { productId: 'prod-123', quantity: 2 }
    ]
  })
});
```

## Variáveis de Ambiente

Configure as seguintes variáveis no Cloudflare Workers:

- `WORKER_API_KEY`: Chave API para autenticação
- `DNS`: Domínio base para URLs de arquivos
- `R2`: Binding do R2 bucket
- `DB`: Binding do D1 database

---

**Legenda:**
- 🔒 = Requer autenticação via X-API-KEY
