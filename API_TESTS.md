# Testes da API - Exemplos com cURL

## Configuração

```bash
# Defina suas variáveis de ambiente
export API_URL="https://seu-worker.workers.dev"
export API_KEY="sua-chave-api-aqui"
```

## 1. Listar Produtos (Público)

```bash
# Listar todos os produtos
curl -X GET "$API_URL/products"

# Com paginação
curl -X GET "$API_URL/products?page=1&per_page=10"

# Com filtros
curl -X GET "$API_URL/products?category=cat-1&inStock=true"

# Busca por texto
curl -X GET "$API_URL/products?q=vibrador"

# Filtrar por tag
curl -X GET "$API_URL/products?tag=discreto"
```

## 2. Obter Produto por ID ou Slug (Público)

```bash
# Por ID
curl -X GET "$API_URL/product/prod-123"

# Por slug
curl -X GET "$API_URL/product/vibrador-exemplo"
```

## 3. Criar Produto (Protegido)

```bash
curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "id": "prod-test-001",
    "name": "Vibrador de Teste",
    "slug": "vibrador-de-teste",
    "description": "Descrição completa do produto de teste",
    "shortDescription": "Descrição curta",
    "price": 99.90,
    "originalPrice": 149.90,
    "category": { "id": "cat-1" },
    "subcategory": "Vibradores",
    "inStock": true,
    "stockQuantity": 50,
    "sku": "TEST-001",
    "rating": 4.5,
    "reviewCount": 10,
    "cleaningInstructions": "Lave com água e sabão neutro",
    "warranty": "6 meses",
    "images": [
      {
        "url": "https://example.com/image1.jpg",
        "alt": "Imagem principal",
        "isPrimary": true,
        "order": 0
      },
      {
        "url": "https://example.com/image2.jpg",
        "alt": "Imagem secundária",
        "isPrimary": false,
        "order": 1
      }
    ],
    "tags": ["discreto", "recarregavel", "silicone"],
    "specifications": [
      { "label": "Tamanho", "value": "18cm" },
      { "label": "Diâmetro", "value": "3cm" },
      { "label": "Material", "value": "Silicone Medical Grade" }
    ],
    "materials": ["Silicone", "ABS"],
    "features": [
      { "icon": "battery", "label": "Recarregável USB", "value": "true" },
      { "icon": "waterproof", "label": "À prova d'\''água", "value": "true" },
      { "icon": "speed", "label": "10 Modos de Vibração", "value": "10" }
    ]
  }'
```

## 4. Criar Múltiplos Produtos (Protegido)

```bash
curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '[
    {
      "id": "prod-test-002",
      "name": "Produto 2",
      "slug": "produto-2",
      "price": 79.90,
      "inStock": true,
      "stockQuantity": 30,
      "images": [],
      "tags": [],
      "specifications": [],
      "materials": [],
      "features": []
    },
    {
      "id": "prod-test-003",
      "name": "Produto 3",
      "slug": "produto-3",
      "price": 129.90,
      "inStock": true,
      "stockQuantity": 20,
      "images": [],
      "tags": [],
      "specifications": [],
      "materials": [],
      "features": []
    }
  ]'
```

## 5. Atualizar Produto (Protegido)

```bash
# Atualização parcial
curl -X PUT "$API_URL/products/prod-test-001" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "name": "Vibrador de Teste Atualizado",
    "price": 89.90,
    "stockQuantity": 45
  }'

# Atualização completa
curl -X PUT "$API_URL/products/prod-test-001" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "name": "Nome Completamente Novo",
    "slug": "slug-novo",
    "description": "Nova descrição",
    "price": 119.90,
    "inStock": true,
    "stockQuantity": 100,
    "images": [
      {
        "url": "https://example.com/nova-imagem.jpg",
        "alt": "Nova imagem",
        "isPrimary": true,
        "order": 0
      }
    ],
    "tags": ["novo", "atualizado"]
  }'
```

## 6. Atualizar Estoque (Protegido)

```bash
# Atualizar quantidade
curl -X PATCH "$API_URL/products/prod-test-001/stock" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "stockQuantity": 75
  }'

# Marcar como fora de estoque
curl -X PATCH "$API_URL/products/prod-test-001/stock" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "inStock": false
  }'

# Atualizar ambos
curl -X PATCH "$API_URL/products/prod-test-001/stock" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "stockQuantity": 100,
    "inStock": true
  }'

# Zerar estoque (automaticamente marca inStock=false)
curl -X PATCH "$API_URL/products/prod-test-001/stock" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "stockQuantity": 0
  }'
```

## 7. Processar Checkout (Protegido)

```bash
# Checkout com sucesso
curl -X POST "$API_URL/checkout" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "items": [
      {
        "productId": "prod-test-001",
        "quantity": 2
      },
      {
        "productId": "prod-test-002",
        "quantity": 1
      }
    ]
  }'

# Checkout com produto inexistente (retorna erros)
curl -X POST "$API_URL/checkout" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "items": [
      {
        "productId": "prod-inexistente",
        "quantity": 1
      }
    ]
  }'

# Checkout com estoque insuficiente
curl -X POST "$API_URL/checkout" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "items": [
      {
        "productId": "prod-test-001",
        "quantity": 999999
      }
    ]
  }'
```

## 8. Upload de Arquivo (Protegido)

```bash
# Upload de imagem
curl -X PUT "$API_URL/upload" \
  -H "X-API-KEY: $API_KEY" \
  -F "file=@/caminho/para/imagem.jpg"

# A resposta retorna a URL da imagem
# Use essa URL no campo "url" dos produtos
```

## 9. Acessar Arquivo Público

```bash
# Baixar/visualizar arquivo
curl -X GET "$API_URL/file/nome-do-arquivo.jpg"

# Ou simplesmente abra no navegador:
# https://seu-worker.workers.dev/file/nome-do-arquivo.jpg
```

## 10. Deletar Produto (Protegido)

```bash
# Deletar produto (também deleta imagens do R2)
curl -X DELETE "$API_URL/products/prod-test-001" \
  -H "X-API-KEY: $API_KEY"
```

## 11. Testes de Erro

### Sem API Key (deve retornar 401)
```bash
curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -d '{"id": "test", "name": "Test", "slug": "test"}'
```

### API Key Inválida (deve retornar 401)
```bash
curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: chave-invalida" \
  -d '{"id": "test", "name": "Test", "slug": "test"}'
```

### JSON Inválido (deve retornar 400)
```bash
curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{invalid json}'
```

### Produto Não Encontrado (deve retornar 404)
```bash
curl -X GET "$API_URL/product/produto-inexistente"
```

### Método Não Permitido (deve retornar 404)
```bash
curl -X POST "$API_URL/product/prod-123"
```

## 12. Testes CORS (Preflight)

```bash
curl -X OPTIONS "$API_URL/products" \
  -H "Origin: https://exemplo.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-API-KEY" \
  -v
```

## Scripts de Teste Automatizado

### Bash Script Completo

```bash
#!/bin/bash

API_URL="https://seu-worker.workers.dev"
API_KEY="sua-chave-api"

echo "🧪 Iniciando testes da API..."

# Teste 1: Criar produto
echo "📝 Criando produto de teste..."
PRODUCT_ID="prod-test-$(date +%s)"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d "{
    \"id\": \"$PRODUCT_ID\",
    \"name\": \"Produto Teste\",
    \"slug\": \"produto-teste-$(date +%s)\",
    \"price\": 99.90,
    \"inStock\": true,
    \"stockQuantity\": 50,
    \"images\": [],
    \"tags\": [],
    \"specifications\": [],
    \"materials\": [],
    \"features\": []
  }")
echo "✅ Produto criado: $CREATE_RESPONSE"

# Teste 2: Listar produtos
echo "📋 Listando produtos..."
LIST_RESPONSE=$(curl -s -X GET "$API_URL/products")
echo "✅ Produtos listados"

# Teste 3: Obter produto
echo "🔍 Buscando produto criado..."
GET_RESPONSE=$(curl -s -X GET "$API_URL/product/$PRODUCT_ID")
echo "✅ Produto encontrado: $GET_RESPONSE"

# Teste 4: Atualizar estoque
echo "📦 Atualizando estoque..."
STOCK_RESPONSE=$(curl -s -X PATCH "$API_URL/products/$PRODUCT_ID/stock" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{"stockQuantity": 25}')
echo "✅ Estoque atualizado: $STOCK_RESPONSE"

# Teste 5: Processar checkout
echo "🛒 Processando checkout..."
CHECKOUT_RESPONSE=$(curl -s -X POST "$API_URL/checkout" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d "{
    \"items\": [
      {\"productId\": \"$PRODUCT_ID\", \"quantity\": 5}
    ]
  }")
echo "✅ Checkout processado: $CHECKOUT_RESPONSE"

# Teste 6: Deletar produto
echo "🗑️  Deletando produto..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/products/$PRODUCT_ID" \
  -H "X-API-KEY: $API_KEY")
echo "✅ Produto deletado: $DELETE_RESPONSE"

echo ""
echo "🎉 Todos os testes concluídos!"
```

Salve como `test-api.sh` e execute:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Observações

- Substitua `$API_URL` e `$API_KEY` pelos valores corretos
- Use `jq` para formatar respostas JSON: `curl ... | jq`
- Para debug verbose, adicione `-v` ao comando curl
- Para ver apenas headers, use `-I` ao invés de `-X GET`
