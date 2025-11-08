# Script de População Inicial do Banco

Este documento contém exemplos de como popular o banco de dados com dados iniciais.

## 1. Criar Categorias

```sql
-- Executar via: wrangler d1 execute sexyshop-db --file=./seed-categories.sql

INSERT INTO categories (id, name, slug, "order") VALUES
  ('cat-vibradores', 'Vibradores', 'vibradores', 1),
  ('cat-iniciantes', 'Iniciantes', 'iniciantes', 2),
  ('cat-solo', 'Solo', 'solo', 3),
  ('cat-casais', 'Casais', 'casais', 4),
  ('cat-wellness', 'Wellness', 'wellness', 5),
  ('cat-lubrificantes', 'Lubrificantes', 'lubrificantes', 6),
  ('cat-cosmeticos', 'Cosméticos', 'cosmeticos', 7),
  ('cat-acessorios', 'Acessórios', 'acessorios', 8),
  ('cat-lingerie', 'Lingerie', 'lingerie', 9);
```

Salve como `seed-categories.sql` e execute:
```bash
wrangler d1 execute sexyshop-db --file=./seed-categories.sql
```

## 2. Popular Produtos via API

Use este script Node.js para popular produtos através da API:

```javascript
// populate-products.js
const API_URL = 'https://seu-worker.workers.dev';
const API_KEY = 'sua-chave-api';

const products = [
  {
    id: 'prod-vibrador-001',
    name: 'Vibrador Recarregável Premium',
    slug: 'vibrador-recarregavel-premium',
    description: 'Vibrador de alta qualidade com 10 modos de vibração, recarregável via USB e à prova d\'água. Material em silicone médico hipoalergênico.',
    shortDescription: 'Vibrador premium com 10 modos de vibração',
    price: 149.90,
    originalPrice: 199.90,
    category: { id: 'cat-vibradores' },
    subcategory: 'Vibradores Recarregáveis',
    inStock: true,
    stockQuantity: 50,
    sku: 'VIB-PREM-001',
    rating: 4.8,
    reviewCount: 127,
    cleaningInstructions: 'Lave com água morna e sabão neutro antes e após o uso. Pode usar limpador específico para produtos eróticos.',
    warranty: '6 meses contra defeitos de fabricação',
    images: [
      {
        url: 'https://exemplo.com/vibrador-001-1.jpg',
        alt: 'Vibrador Premium - Vista Frontal',
        isPrimary: true,
        order: 0
      },
      {
        url: 'https://exemplo.com/vibrador-001-2.jpg',
        alt: 'Vibrador Premium - Detalhe',
        isPrimary: false,
        order: 1
      }
    ],
    tags: ['discreto', 'recarregavel', 'silicone', 'impermeavel', 'bestseller'],
    specifications: [
      { label: 'Comprimento', value: '18 cm' },
      { label: 'Diâmetro', value: '3 cm' },
      { label: 'Material', value: 'Silicone Medical Grade' },
      { label: 'Bateria', value: 'Recarregável USB' },
      { label: 'Tempo de Carga', value: '2 horas' },
      { label: 'Autonomia', value: 'Até 3 horas' },
      { label: 'Peso', value: '120g' }
    ],
    materials: ['Silicone Medical Grade', 'ABS'],
    features: [
      { icon: 'battery', label: 'Recarregável USB', value: 'true' },
      { icon: 'waterproof', label: 'À prova d\'água', value: 'true' },
      { icon: 'speed', label: 'Modos de Vibração', value: '10' },
      { icon: 'volume', label: 'Silencioso', value: 'true' }
    ]
  },
  {
    id: 'prod-dildo-001',
    name: 'Dildo Realístico com Ventosa',
    slug: 'dildo-realistico-ventosa',
    description: 'Dildo realístico feito em material flexível com textura que imita a pele. Base com ventosa para uso mãos-livres.',
    shortDescription: 'Dildo realístico com ventosa',
    price: 89.90,
    originalPrice: 129.90,
    category: { id: 'cat-dildos' },
    subcategory: 'Dildos Realísticos',
    inStock: true,
    stockQuantity: 35,
    sku: 'DIL-REAL-001',
    rating: 4.5,
    reviewCount: 89,
    cleaningInstructions: 'Lave com água e sabão antes e após cada uso.',
    warranty: '3 meses',
    images: [
      {
        url: 'https://exemplo.com/dildo-001-1.jpg',
        alt: 'Dildo Realístico',
        isPrimary: true,
        order: 0
      }
    ],
    tags: ['realistico', 'ventosa', 'flexivel'],
    specifications: [
      { label: 'Comprimento Total', value: '20 cm' },
      { label: 'Comprimento Inserível', value: '16 cm' },
      { label: 'Diâmetro', value: '4 cm' },
      { label: 'Material', value: 'PVC Flexível' }
    ],
    materials: ['PVC', 'Ftalatos Free'],
    features: [
      { icon: 'suction', label: 'Base com Ventosa', value: 'true' },
      { icon: 'texture', label: 'Textura Realística', value: 'true' },
      { icon: 'flexible', label: 'Flexível', value: 'true' }
    ]
  },
  {
    id: 'prod-plug-001',
    name: 'Plug Anal Iniciante com Joia',
    slug: 'plug-anal-iniciante-joia',
    description: 'Plug anal para iniciantes com base decorada com joia. Tamanho perfeito para quem está começando.',
    shortDescription: 'Plug anal iniciante com joia decorativa',
    price: 39.90,
    category: { id: 'cat-plug-anal' },
    subcategory: 'Plug Anal Iniciante',
    inStock: true,
    stockQuantity: 100,
    sku: 'PLUG-INI-001',
    rating: 4.7,
    reviewCount: 203,
    cleaningInstructions: 'Lave com água e sabão antes e depois do uso. Seque bem antes de guardar.',
    warranty: '3 meses',
    images: [
      {
        url: 'https://exemplo.com/plug-001-1.jpg',
        alt: 'Plug Anal com Joia',
        isPrimary: true,
        order: 0
      }
    ],
    tags: ['iniciante', 'pequeno', 'joia', 'metal'],
    specifications: [
      { label: 'Comprimento', value: '7 cm' },
      { label: 'Diâmetro', value: '2.5 cm' },
      { label: 'Material', value: 'Aço Inoxidável' },
      { label: 'Peso', value: '80g' }
    ],
    materials: ['Aço Inoxidável', 'Cristal'],
    features: [
      { icon: 'beginner', label: 'Ideal para Iniciantes', value: 'true' },
      { icon: 'metal', label: 'Aço Inoxidável', value: 'true' },
      { icon: 'cold', label: 'Pode ser Aquecido/Resfriado', value: 'true' }
    ]
  },
  {
    id: 'prod-gel-001',
    name: 'Gel Lubrificante à Base D\'água 100ml',
    slug: 'gel-lubrificante-base-agua',
    description: 'Gel lubrificante íntimo à base d\'água, compatível com preservativos e brinquedos eróticos. Fórmula hipoalergênica.',
    shortDescription: 'Gel lubrificante íntimo 100ml',
    price: 24.90,
    category: { id: 'cat-gel-lubrificante' },
    subcategory: 'Gel Base Água',
    inStock: true,
    stockQuantity: 200,
    sku: 'GEL-AGUA-001',
    rating: 4.9,
    reviewCount: 456,
    cleaningInstructions: 'Não necessário - produto de uso único.',
    warranty: 'Não aplicável',
    images: [
      {
        url: 'https://exemplo.com/gel-001-1.jpg',
        alt: 'Gel Lubrificante',
        isPrimary: true,
        order: 0
      }
    ],
    tags: ['lubrificante', 'agua', 'hipoalergenico', 'preservativo-compativel'],
    specifications: [
      { label: 'Volume', value: '100ml' },
      { label: 'Base', value: 'Água' },
      { label: 'Compatibilidade', value: 'Preservativos e Brinquedos' },
      { label: 'Validade', value: '24 meses' }
    ],
    materials: ['Água', 'Glicerina Vegetal'],
    features: [
      { icon: 'droplet', label: 'Base Água', value: 'true' },
      { icon: 'safe', label: 'Hipoalergênico', value: 'true' },
      { icon: 'condom', label: 'Compatível com Preservativos', value: 'true' }
    ]
  },
  {
    id: 'prod-anel-001',
    name: 'Anel Peniano Vibratório',
    slug: 'anel-peniano-vibratorio',
    description: 'Anel peniano elástico com vibrador estimulador de clitóris. Prolonga a ereção e proporciona prazer para ambos.',
    shortDescription: 'Anel peniano com vibração',
    price: 34.90,
    originalPrice: 49.90,
    category: { id: 'cat-aneis-penianos' },
    subcategory: 'Anéis com Vibração',
    inStock: true,
    stockQuantity: 75,
    sku: 'ANEL-VIB-001',
    rating: 4.6,
    reviewCount: 178,
    cleaningInstructions: 'Remova a bateria e lave com água e sabão neutro.',
    warranty: 'Não aplicável (produto descartável)',
    images: [
      {
        url: 'https://exemplo.com/anel-001-1.jpg',
        alt: 'Anel Peniano Vibratório',
        isPrimary: true,
        order: 0
      }
    ],
    tags: ['casal', 'vibrador', 'elastico', 'descartavel'],
    specifications: [
      { label: 'Material', value: 'Silicone Elástico' },
      { label: 'Bateria', value: '3x LR44 (inclusas)' },
      { label: 'Duração da Bateria', value: 'Até 30 minutos' }
    ],
    materials: ['Silicone', 'ABS'],
    features: [
      { icon: 'vibrate', label: 'Vibração', value: 'true' },
      { icon: 'couple', label: 'Para Casal', value: 'true' },
      { icon: 'stretch', label: 'Elástico', value: 'true' }
    ]
  }
];

async function populateProducts() {
  console.log('🌱 Iniciando população do banco de dados...\n');
  
  for (const product of products) {
    try {
      console.log(`📦 Criando produto: ${product.name}...`);
      
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY
        },
        body: JSON.stringify(product)
      });
      
      if (response.ok) {
        console.log(`✅ Produto criado com sucesso: ${product.id}\n`);
      } else {
        const error = await response.text();
        console.error(`❌ Erro ao criar produto ${product.id}:`, error, '\n');
      }
      
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Erro ao criar produto ${product.id}:`, error, '\n');
    }
  }
  
  console.log('🎉 População concluída!');
}

populateProducts();
```

Salve como `populate-products.js` e execute:
```bash
node populate-products.js
```

## 3. Popular via cURL (Alternativa)

Se preferir usar cURL diretamente:

```bash
#!/bin/bash
API_URL="https://seu-worker.workers.dev"
API_KEY="sua-chave-api"

# Produto 1
curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "id": "prod-vibrador-001",
    "name": "Vibrador Recarregável Premium",
    "slug": "vibrador-recarregavel-premium",
    "price": 149.90,
    "originalPrice": 199.90,
    "category": { "id": "cat-vibradores" },
    "inStock": true,
    "stockQuantity": 50,
    "sku": "VIB-PREM-001",
    "images": [],
    "tags": ["discreto", "recarregavel"],
    "specifications": [
      { "label": "Comprimento", "value": "18 cm" }
    ],
    "materials": ["Silicone"],
    "features": [
      { "icon": "battery", "label": "Recarregável", "value": "true" }
    ]
  }'

# Adicione mais produtos...
```

## 4. Verificar População

Após popular, verifique os dados:

```bash
# Listar produtos
curl "$API_URL/products"

# Verificar produto específico
curl "$API_URL/product/prod-vibrador-001"

# Verificar contagem
curl "$API_URL/products?per_page=1" | jq '.meta.total'
```

## 5. Popular Localmente (Development)

Para popular o banco local durante desenvolvimento:

```bash
# Iniciar worker local
wrangler dev

# Em outro terminal, executar script
API_URL="http://localhost:8787" API_KEY="sua-chave-api" node populate-products.js
```

## 6. Dados de Teste Mínimos

Se só precisa de dados para teste:

```sql
-- Categoria
INSERT INTO categories (id, name, slug, "order") VALUES
  ('cat-test', 'Teste', 'teste', 1);

-- Produto mínimo via API
curl -X POST "http://localhost:8787/products" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test-key" \
  -d '{
    "id": "prod-test",
    "name": "Produto de Teste",
    "slug": "produto-teste",
    "price": 99.90,
    "inStock": true,
    "stockQuantity": 10,
    "images": [],
    "tags": [],
    "specifications": [],
    "materials": [],
    "features": []
  }'
```

## 7. Backup e Restore

### Backup
```bash
# Exportar dados
wrangler d1 execute sexyshop-db --command="SELECT * FROM products" --json > products-backup.json
```

### Restore
Use o script de população com os dados do backup.

## Observações

- Sempre configure as categorias primeiro
- IDs devem ser únicos
- Slugs devem ser únicos
- URLs de imagens devem ser válidas ou usar placeholder
- Para produção, usar imagens reais no R2 bucket
- Ajuste os valores conforme sua necessidade
