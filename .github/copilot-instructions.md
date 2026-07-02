# 🚀 WebSpeed CMS Framework - Developer & AI Guide (GEMINI.md)

Welcome to the **WebSpeed CMS** project directory. This document serves as the developer handbook, detailing the framework architecture, strict TypeScript guidelines, database design, and CLI references.

Sync changes here across the following locations:
- (project root)/AGENTS.md
- (project root)/GEMINI.md
- (project root)/CLAUDE.md
- (project root)/.kiro/steering/project-rules.md
- (project root)/.cursorrules
- (project root)/.windsurfrules
- (project root)/.github/copilot-instructions.md

---

## 🏛️ System Architecture

WebSpeed is a modern, high-performance web framework and CMS built on Node.js and Express, configured with strict Type Safety.

```mermaid
graph TD
    Client[Web Browser / API Client] -->|HTTP Request| Server[Express Server / appExporter.ts]
    Server -->|Routing Middleware| RoutingIndex[lib/routingControllers/index.ts]
    RoutingIndex -->|Matches Path| Controller[RoutingController / CustomController]
    Controller -->|Uses context| RouteContext[RouteContext]
    RouteContext -->|Fetches Data| Models[ActiveRecord Models / DatabaseModel]
    Models -->|Queries| QueryBuilder[DatabaseQueryBuilder]
    QueryBuilder -->|Executes CRUD| Connection[dbConnection Manager]
    Connection -->|Active Driver| Drivers[DiskStorage / MongoDB / MySQL Drivers]
```

### 1. The Database Layer
* **`DatabaseDriver`**: Abstract base class defining asynchronous signatures for all CRUD drivers: `connect()`, `disconnect()`, `read()`, `write()`, `delete()`, and `update()`.
* **`DiskStorageDriver`**: A local JSON file-based database. Perfect for local dev/testing without external database servers.
* **`MongoDbDriver`**: Live integration using the official `mongodb` client.
* **`MySqlDriver`**: Live integration using `mysql2/promise`, designed with a dynamic JSON-column schema.
* **`DatabaseConnection`**: Exposes the active driver instance globally based on variables defined in `env.ts` (`DB_DRIVER`).

### 2. ActiveRecord Models & Query Builder
* **`DatabaseModel`**: The base ActiveRecord model class. Properties mapped to fields are saved via `__saveToDatabase()`. It includes static query hooks.
* **`DatabaseQueryBuilder`**: Provides chainable query building (`.where()`, `.limit()`, `.offset()`, `.get()`, `.first()`, `.delete()`, `.update()`).

### 3. Routing & Controllers
* **`RoutingController`**: A controller wrapper that mounts automatically on its `slug` and registers default handlers.
* **`RouteContext`**: An operational context wrapper for the request and response objects, extending them with:
  * `.json(data, status)` for clean REST API responses.
  * `.render(templatePath, data)` for view interpolation (`{{variable}}`).

---

## 🔒 TypeScript Strictness & Type Safety Guidelines

To keep the codebase at the strictest level of Type Safety, developers and AI agents must follow these rules:

### 1. No Arbitrary Class Fields (Use `declare`)
Under the ESNext target transpiler, uninitialized property declarations (e.g., `title?: string;`) compile to `this.title = void 0;`, overwriting parameters copied during `super()`. 
**Rule:** Always use the `declare` modifier for database-mapped fields in models:
```typescript
class Task extends DatabaseModel {
    readonly __collection = 'tasks';
    declare title?: string;       // Correct: type-only declaration
    declare completed?: boolean;  // Correct: type-only declaration
}
```

### 2. Eliminate `any` in Favour of Generics
When returning lists of models, ensure generics are used to preserve type-safe autocomplete suggestions:
```typescript
// QueryBuilder correctly returns typed array instances
async get(): Promise<T[]> { ... }
```

### 3. Strict Compiler Settings
The [tsconfig.json](file:///workspaces/webspeed-framework/tsconfig.json) is configured with `"strict": true` and `"ignoreDeprecations": "6.0"`. Run type checking regularly using:
```bash
npx tsc --noEmit
```

---

## 🛠️ CLI Tool (`cli.ts`)

WebSpeed features an Artisan-like CLI utility:
* **`npx ts-node cli.ts serve`**: Starts the HTTP and WebSocket servers.
* **`npx ts-node cli.ts make:controller <name>`**: Generates a new routing controller and registers it automatically in `index.ts`.
* **`npx ts-node cli.ts make:model <name>`**: Generates a new ActiveRecord model class.
* **`npx ts-node cli.ts db:seed`**: Seeds the active database with initial mockup users.

---

## 🧪 Running Examples & E2E Tests

The project includes pre-configured examples:
1. **CMS Blog Website**: Serves static assets, handles custom views, and renders blog posts.
2. **Task REST API**: High-performance CRUD API endpoints.

To run the automated E2E integration test suite, execute:
```bash
npx ts-node test-e2e.ts
```
The test suite launches the server, executes standard HTTP CRUD operations, checks database persistence, asserts HTML rendering values, and shuts down safely.
