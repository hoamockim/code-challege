# inventory

Express.js + PostgreSQL inventory API structured with **Clean Architecture**.

## Architecture

```
src/
├── domain/                 # Enterprise business rules (innermost)
│   ├── entities/           # Core models
│   ├── repositories/       # Repository contracts (interfaces)
│   └── errors/             # Domain errors
├── application/            # Application business rules
│   ├── use-cases/          # Interactors / use cases
│   ├── dtos/               # Data transfer objects
│   └── mappers/            # Entity ↔ DTO mapping
├── infrastructure/         # Frameworks & drivers (outermost)
│   ├── config/             # Env / app config
│   ├── database/
│   │   ├── schema.ts       # Drizzle tables
│   │   ├── db.ts           # Drizzle client
│   │   └── postgres/       # Pool
│   ├── repositories/
│   │   ├── category/       # Category queries
│   │   └── product/        # Product queries
│   └── di/                 # Dependency injection wiring
├── presentation/           # Interface adapters
│   └── http/               # Express controllers, routes, middleware, swagger
├── shared/                 # Cross-cutting shared modules
│   ├── pagination/         # Pagination helpers + meta types
│   └── http/               # HTTP status constants
└── main.ts                 # Composition root / entry point

tests/
└── unit/                   # Unit tests (use cases, domain, validators)
```

**Dependency rule:** inner layers never import outer layers.
Domain ← Application ← Presentation / Infrastructure ← `main.ts`

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env (already present as .env for local) or:
cp .env.example .env

# 3. Start PostgreSQL and apply Drizzle migrations
npm run db:up

# 4. Start API in watch mode
npm run dev
```

Server: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api-docs`  
OpenAPI JSON: `http://localhost:3000/api-docs.json`

**Demo walkthrough (CRUD end-to-end):** see [DEMO.md](./DEMO.md)

## Scripts

| Script                | Description                    |
|-----------------------|--------------------------------|
| `npm run dev`         | Start with hot reload          |
| `npm run build`       | Compile TypeScript to `dist/`  |
| `npm start`           | Run compiled app               |
| `npm test`            | Run unit tests                 |
| `npm run test:watch`  | Vitest watch mode              |
| `npm run test:coverage` | Unit tests + coverage report |
| `npm run db:up`       | Start Postgres and apply Drizzle migrations |
| `npm run db:down`     | Stop Postgres                  |
| `npm run db:generate` | Generate a migration from `schema.ts` |
| `npm run db:migrate`  | Apply pending Drizzle migrations |

## Swagger

Swagger is served by the API itself. `createApp` calls `setupSwagger`, which mounts Swagger UI and the OpenAPI document on the running server:

| Resource | Path |
|----------|------|
| Swagger UI | `http://localhost:3000/api-docs` |
| OpenAPI 3.0 JSON | `http://localhost:3000/api-docs.json` |

The spec is built in `src/presentation/http/swagger/` and covers **Health**, **Categories**, and **Products**. Open the UI after `npm run dev` to try the same routes documented below.

## API

### Health

```
GET /health
```

### Categories

| Method | Path                  | Description         |
|--------|-----------------------|---------------------|
| POST   | `/api/categories`     | Create category     |
| GET    | `/api/categories`     | List / search / page|
| GET    | `/api/categories/:id` | Get category        |
| PATCH  | `/api/categories/:id` | Update category     |
| DELETE | `/api/categories/:id` | Soft-delete category|

```bash
curl -i -X POST http://localhost:3000/api/categories \
  -H 'Content-Type: application/json' \
  -d '{"name":"Electronics","description":"Devices and accessories"}'
```

Deleting a category returns `409` if active products still reference it.

### Products (inventory)

| Method | Path               | Description              |
|--------|--------------------|--------------------------|
| POST   | `/api/products`    | Create product           |
| GET    | `/api/products`    | List / filter / paginate |
| GET    | `/api/products/:id`| Get product              |
| PATCH  | `/api/products/:id`| Update product           |
| DELETE | `/api/products/:id`| Soft-delete product      |

**Create** (requires an existing `categoryId`)

```bash
curl -i -X POST http://localhost:3000/api/products \
  -H 'Content-Type: application/json' \
  -d '{"sku":"KB-001","name":"Mechanical Keyboard","categoryId":"<category-uuid>","description":"Wireless keyboard","priceCents":12000,"stockQuantity":8,"lowStockThreshold":5}'
```

**List / filter / sort / paginate**

| Query param | Type | Description |
|-------------|------|-------------|
| `categoryId` | uuid | Filter by category |
| `sku` | string | Partial SKU (ILIKE) |
| `name` | string | Partial name (ILIKE) |
| `search` | string | Partial match on name **or** SKU |
| `lowStock` | `true`/`false` | At/below threshold vs above |
| `minPriceCents` | int ≥ 0 | Inclusive min price |
| `maxPriceCents` | int ≥ 0 | Inclusive max price |
| `minStockQuantity` | int ≥ 0 | Inclusive min stock |
| `maxStockQuantity` | int ≥ 0 | Inclusive max stock |
| `sortBy` | enum | `createdAt` (default), `updatedAt`, `name`, `sku`, `priceCents`, `stockQuantity`, `categoryId` |
| `sortOrder` | enum | `asc` \| `desc` (default `desc`) |
| `page` | int ≥ 1 | Page number (default `1`) |
| `limit` | 1–100 | Page size (default `20`) |

```bash
curl 'http://localhost:3000/api/products?categoryId=<category-uuid>&lowStock=false&sortBy=priceCents&sortOrder=asc&page=1&limit=10'
curl 'http://localhost:3000/api/products?sku=KB&name=Keyboard&search=mech'
```

Pagination response shape:

```json
{
  "data": [ /* products */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Get / update / delete**

```bash
curl http://localhost:3000/api/products/<id>
curl -X PATCH http://localhost:3000/api/products/<id> \
  -H 'Content-Type: application/json' \
  -d '{"stockQuantity":3}'
curl -i -X DELETE http://localhost:3000/api/products/<id>
```

### Response codes

- `201` created · `200` read/updated · `204` soft-deleted
- `400` invalid payload/filter · `404` unknown ID · `409` duplicate SKU/name or category in use

### Design notes

- Products reference categories via `categoryId` (FK); responses include `{ categoryId, category: { id, name } }`.
- `priceCents` uses integer minor currency units (no floating-point money).
- `isLowStock` is computed as `stockQuantity <= lowStockThreshold`.
- DELETE is a **soft delete** (`deleted_at`); soft-deleted rows are excluded from list/get/update.
- SKU / category name uniqueness applies only to active rows (partial unique indexes).

## Adding a new feature

1. **Domain** — entity + repository interface
2. **Application** — use case(s) + DTO/mapper
3. **Infrastructure** — Postgres repository implementation
4. **Presentation** — validator, controller, routes
5. **DI** — wire dependencies in `infrastructure/di/container.ts`
6. **Tests** — unit tests under `tests/unit/`
