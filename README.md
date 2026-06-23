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








flowchart TD

    User --> Order

    Category --> Product

    Product --> ProductImage
    Product --> ProductVariant

    Order --> OrderItem
    Order --> Payment

    OrderItem -. référence catalogue .-> Product


```mermaid
erDiagram

    User ||--o{ Order : places

    Category ||--o{ Product : contains
    Category ||--o{ Category : parent_of

    Product ||--o{ ProductImage : has
    Product ||--o{ ProductVariant : has

    Order ||--o{ OrderItem : contains
    Product ||--o{ OrderItem : ordered_as

    Order ||--|| Payment : payment

    User {
        string id
        string email
        string password
        string firstName
        string lastName
        string role
    }

    Category {
        string id
        string name
        string slug
        string parentId
    }

    Product {
        string id
        string name
        string slug
        decimal basePrice
        boolean isActive
        string categoryId
    }

    ProductImage {
        string id
        string productId
        string url
        string alt
        int position
    }

    ProductVariant {
        string id
        string productId
        string type
        string value
        decimal priceOffset
        int stock
        boolean isAvailable
        string colorHex
        int position
    }

    Order {
        string id
        string userId
        string status
        decimal subtotal
        decimal shippingCost
        decimal total
    }

    OrderItem {
        string id
        string orderId
        string productId
        string productName
        string productSlug
        int quantity
        decimal unitPrice
        decimal total
        json variantSnapshot
    }

    Payment {
        string id
        string orderId
        decimal amount
        string currency
        string status
        string method
    }
```