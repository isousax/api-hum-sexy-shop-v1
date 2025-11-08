# Guia Rápido - SexyShop Backend API

## 🚀 Setup Rápido

```bash
npm install
wrangler login
wrangler d1 create sexyshop-db
wrangler d1 execute sexyshop-db --file=./schema.sql
wrangler r2 bucket create sexyshop-files
wrangler dev
```

## 📍 Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/products` | ❌ | Listar produtos |
| GET | `/product/:id` | ❌ | Detalhes do produto |
| POST | `/products` | ✅ | Criar produto(s) |
| PUT | `/products/:id` | ✅ | Atualizar produto |
| DELETE | `/products/:id` | ✅ | Deletar produto |
| PATCH | `/products/:id/stock` | ✅ | Atualizar estoque |
| POST | `/checkout` | ✅ | Processar compra |
| PUT | `/upload` | ✅ | Upload arquivo |
| GET | `/file/:key` | ❌ | Servir arquivo |

## 🔑 Autenticação

```bash
# Header obrigatório para endpoints protegidos
X-API-KEY: sua-chave-api
```

## 📦 Exemplos Rápidos

### Listar Produtos
```bash
curl "$API_URL/products?page=1&per_page=20"
```

### Criar Produto
```bash
curl -X POST "$API_URL/products" \
  -H "X-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "prod-1",
    "name": "Produto",
    "slug": "produto",
    "price": 99.90,
    "inStock": true,
    "stockQuantity": 50,
    "images": [],
    "tags": [],
    "specifications": [],
    "materials": [],
    "features": []
  }'
```

### Atualizar Estoque
```bash
curl -X PATCH "$API_URL/products/prod-1/stock" \
  -H "X-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"stockQuantity": 25}'
```

### Processar Checkout
```bash
curl -X POST "$API_URL/checkout" \
  -H "X-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": "prod-1", "quantity": 2}
    ]
  }'
```

### Deletar Produto
```bash
curl -X DELETE "$API_URL/products/prod-1" \
  -H "X-API-KEY: $API_KEY"
```

## 📁 Estrutura de Produto

```json
{
  "id": "prod-123",
  "name": "Nome do Produto",
  "slug": "nome-do-produto",
  "description": "Descrição longa...",
  "shortDescription": "Descrição curta...",
  "price": 99.90,
  "originalPrice": 149.90,
  "category": { "id": "cat-1" },
  "subcategory": "Subcategoria",
  "inStock": true,
  "stockQuantity": 50,
  "sku": "SKU-123",
  "rating": 4.5,
  "reviewCount": 100,
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
    { "label": "Tamanho", "value": "18cm" }
  ],
  "materials": ["Silicone"],
  "features": [
    { "icon": "battery", "label": "Recarregável", "value": "true" }
  ]
}
```

## 🔍 Filtros de Busca

```bash
# Busca por texto
?q=vibrador

# Filtrar por categoria
?category=cat-vibradores

# Filtrar por tag
?tag=discreto

# Filtrar por estoque
?inStock=true

# Paginação
?page=2&per_page=20

# Combinar filtros
?category=cat-vibradores&inStock=true&page=1
```

## ⚙️ Variáveis de Ambiente

```jsonc
{
  "vars": {
    "DNS": "https://seu-dominio.com",
    "WORKER_API_KEY": "sua-chave-secreta"
  }
}
```

## 📊 Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 207 | Multi-Status (sucesso parcial) |
| 400 | Bad Request (dados inválidos) |
| 401 | Unauthorized (API key inválida) |
| 404 | Not Found (recurso não encontrado) |
| 405 | Method Not Allowed |
| 500 | Internal Server Error |

## 🗂️ Arquivos de Documentação

- `API_DOCUMENTATION.md` - Documentação completa da API
- `API_TESTS.md` - Exemplos de testes e cURL
- `IMPROVEMENTS.md` - Melhorias futuras sugeridas
- `SEED_DATABASE.md` - Como popular o banco
- `CHANGELOG.md` - Histórico de mudanças
- `README.md` - Documentação do projeto

## 🧪 Comandos Úteis

```bash
# Desenvolvimento local
wrangler dev

# Deploy produção
wrangler deploy

# Ver logs
wrangler tail

# Executar SQL
wrangler d1 execute sexyshop-db --command="SELECT * FROM products LIMIT 5"

# Executar SQL com arquivo
wrangler d1 execute sexyshop-db --file=./schema.sql

# Listar buckets R2
wrangler r2 bucket list

# Listar databases D1
wrangler d1 list
```

## 🐛 Debug Comum

### Erro: "Não autorizado"
- Verifique se está enviando header `X-API-KEY`
- Confirme que a chave está correta no `wrangler.jsonc`

### Erro: "Produto não encontrado"
- Verifique se o ID/slug está correto
- Confirme que o produto existe no banco

### Erro: "Estoque insuficiente"
- Verifique a quantidade disponível
- Atualize o estoque antes do checkout

### CORS Error
- Verifique se está fazendo OPTIONS preflight
- Confirme headers CORS no index.ts

## 🔗 Links Úteis

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## 💡 Dicas

1. Use `jq` para formatar JSON: `curl ... | jq`
2. Salve API_KEY em variável de ambiente
3. Use scripts para testes automatizados
4. Faça backup antes de mudanças grandes
5. Teste localmente antes de fazer deploy
6. Monitore uso de recursos no dashboard

## 📞 Troubleshooting

**Problema**: Worker não responde
- ✅ Verifique se está deployado: `wrangler deployments list`
- ✅ Veja logs: `wrangler tail`

**Problema**: Banco não encontrado
- ✅ Verifique binding no `wrangler.jsonc`
- ✅ Confirme que database existe: `wrangler d1 list`

**Problema**: Imagens não carregam
- ✅ Verifique binding R2 no `wrangler.jsonc`
- ✅ Confirme que bucket existe: `wrangler r2 bucket list`

---

**Pronto para começar?** 🎉

```bash
wrangler dev
# Acesse http://localhost:8787/products
```
