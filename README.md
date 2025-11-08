# SexyShop Backend API

API RESTful para gerenciamento de e-commerce construída com Cloudflare Workers, D1 (SQLite) e R2 (Storage).

## 🚀 Tecnologias

- **Cloudflare Workers** - Edge computing
- **D1** - SQLite distribuído
- **R2** - Object storage (imagens)
- **TypeScript** - Type safety

## 📋 Funcionalidades

- ✅ CRUD completo de produtos
- ✅ Upload e gerenciamento de imagens (R2)
- ✅ Sistema de estoque com validação
- ✅ Processamento de checkout
- ✅ Autenticação via API Key
- ✅ Filtros e paginação
- ✅ Relacionamentos (tags, especificações, materiais, features)

## 🔧 Configuração

### 1. Pré-requisitos

- Node.js 18+
- Conta na Cloudflare
- Wrangler CLI instalado globalmente: `npm install -g wrangler`

### 2. Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd sexyshopBackend

# Instale as dependências
npm install

# Autentique no Cloudflare
wrangler login
```

### 3. Configurar Bindings

#### D1 Database

```bash
# Criar database D1
wrangler d1 create sexyshop-db

# Executar schema
wrangler d1 execute sexyshop-db --file=./schema.sql
```

Atualize `wrangler.jsonc` com o database_id retornado.

#### R2 Bucket

```bash
# Criar bucket R2
wrangler r2 bucket create sexyshop-files
```

Atualize `wrangler.jsonc` com o bucket name.

### 4. Variáveis de Ambiente

Configure no Cloudflare Dashboard ou via `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "DNS": "https://seu-dominio.com",
    "WORKER_API_KEY": "sua-chave-secreta-aqui"
  }
}
```

### 5. Deploy

```bash
# Deploy para produção
wrangler deploy

# Ou para development
wrangler dev
```

## 📚 Documentação

Veja a documentação completa da API em [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Endpoints Principais

#### Públicos
- `GET /products` - Lista produtos com filtros
- `GET /product/:slugOrId` - Detalhes de um produto
- `GET /file/:key` - Serve arquivo público

#### Protegidos (requer X-API-KEY)
- `POST /products` - Criar produtos
- `PUT /products/:id` - Atualizar produto
- `DELETE /products/:id` - Deletar produto + imagens
- `PATCH /products/:id/stock` - Atualizar estoque
- `POST /checkout` - Processar compra
- `PUT /upload` - Upload de arquivo

## 🗂️ Estrutura do Projeto

```
sexyshopBackend/
├── src/
│   ├── index.ts                    # Router principal
│   ├── types.ts                    # TypeScript types
│   ├── endpoints/
│   │   ├── products/
│   │   │   ├── handleCreateProduct.ts
│   │   │   ├── handleListProducts.ts
│   │   │   ├── handleGetProduct.ts
│   │   │   ├── handleUpdateProduct.ts
│   │   │   ├── handleDeleteProduct.ts
│   │   │   ├── handleUpdateStock.ts
│   │   │   └── handleCheckout.ts
│   │   └── files/
│   │       ├── handleUpload.ts
│   │       └── handlePublicFile.ts
│   └── util/
│       ├── auth.ts                 # Autenticação via X-API-KEY (checkout simples)
│       └── validateApiKey.ts
├── schema.sql                      # Schema do banco
├── wrangler.jsonc                  # Configuração Cloudflare
├── API_DOCUMENTATION.md            # Documentação completa
└── IMPROVEMENTS.md                 # Melhorias sugeridas
```

## 🧪 Desenvolvimento Local

```bash
# Iniciar servidor local
wrangler dev

# Executar migrations
wrangler d1 execute sexyshop-db --local --file=./schema.sql

# Ver logs
wrangler tail
```

## 📊 Modelo de Dados

### Principais Entidades

- **products** - Informações principais do produto
- **product_images** - Imagens do produto
- **product_tags** - Tags/categorias
- **product_specifications** - Especificações técnicas
- **product_materials** - Materiais de composição
- **product_features** - Features/características
- **categories** - Categorias de produtos

Veja `schema.sql` para detalhes completos.

## 🔒 Segurança

- Todos endpoints de modificação protegidos por API Key
- Validação de payloads
- Prepared statements para prevenir SQL injection
- CORS configurado apropriadamente

## 📈 Melhorias Futuras

Veja [IMPROVEMENTS.md](./IMPROVEMENTS.md) para lista completa de melhorias sugeridas:

- Validação com Zod
- Rate limiting
- Logs estruturados
- Cache com KV
- Webhooks
- Soft delete
- Testes automatizados
- E muito mais...

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para dúvidas e suporte:
- Abra uma issue no GitHub
- Consulte a [documentação do Cloudflare Workers](https://developers.cloudflare.com/workers/)
- Veja a [documentação do D1](https://developers.cloudflare.com/d1/)

---

Desenvolvido com ❤️ usando Cloudflare Workers
