# Tatafil — Stack Next.js + Express + PostgreSQL

## Prérequis
- Node.js 20+
- Docker Desktop
- Git

## Lancement local

### 1. Base de données (Docker)
```bash
docker compose up -d
```

### 2. Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## URLs
- Frontend : http://localhost:3000
- Backend  : http://localhost:3001
- API Health : http://localhost:3001/api/health
- Prisma Studio : npx prisma studio (depuis backend/)

## Comptes de démo (après seed)
- Admin  : admin@boutique.fr / admin1234
- Client : client@example.fr / user1234






erDiagram

  USER ||--o{ ORDER : places

  CATEGORY ||--o{ PRODUCT : contains

  PRODUCT ||--o{ PRODUCT_VARIANT : has
  PRODUCT ||--o{ PRODUCT_IMAGE : has

  ORDER ||--o{ ORDER_ITEM : contains
  PRODUCT ||--o{ ORDER_ITEM : referenced_by
  ORDER ||--|| PAYMENT : has

  %% =========================
  %% VARIANTS SYSTEM
  %% =========================

  OPTION_TYPE ||--o{ OPTION_VALUE : defines

  PRODUCT_VARIANT ||--o{ PRODUCT_VARIANT_OPTION : includes
  OPTION_VALUE ||--o{ PRODUCT_VARIANT_OPTION : used_in

  %% =========================
  %% ENTITIES
  %% =========================

  USER {
    string id
    string email
  }

  PRODUCT {
    string id
    string name
    decimal basePrice
  }

  PRODUCT_VARIANT {
    string id
    int stock
    boolean isActive
  }

  OPTION_TYPE {
    string id
    string name  "Taille, Couleur, Tissu"
  }

  OPTION_VALUE {
    string id
    string name  "S, M, L, Lin, Rouge"
    boolean isAvailable
    decimal priceOffset
    int stock
  }

  PRODUCT_VARIANT_OPTION {
    string id
  }

  ORDER {
    string id
    string status
  }

  ORDER_ITEM {
    string id
    int quantity
    decimal unitPrice
  }

  PAYMENT {
    string id
    string status
  }

  CATEGORY {
    string id
    string name
  }

  PRODUCT_IMAGE {
    string id
    string url
  }