# 🧵 Base de données — Site e-commerce couture

## Stack

- **ORM** : Prisma
- **Base de données** : PostgreSQL
- **Langage du seed** : TypeScript

---

## Structure des tables

```
users
categories
products
  └── product_images
  └── product_option_groups  ←→  option_values  (table centrale)
orders
  └── order_items
  └── payments
```

---

## Tables

### `users`
Utilisateurs du site. Rôle `CUSTOMER` (défaut) ou `ADMIN`.

| Champ | Type | Notes |
|-------|------|-------|
| id | cuid | |
| email | String | unique |
| password | String | hashé (bcrypt) |
| firstName / lastName | String | |
| role | Enum | `CUSTOMER` \| `ADMIN` |

---

### `categories`
Regroupe les produits (ex: Accessoires, Maison, Enfants).

| Champ | Type | Notes |
|-------|------|-------|
| id | cuid | |
| name | String | |
| slug | String | unique |

---

### `products`
Cœur du catalogue. Un produit = une création de couture.

| Champ | Type | Notes |
|-------|------|-------|
| id | cuid | |
| slug | String | unique, utilisé dans les URLs |
| name | String | |
| shortDescription | String? | pour les cards |
| description | String? | page produit complète |
| basePrice | Decimal | prix de base avant surcoût options |
| isActive | Boolean | masqué si false |
| categoryId | FK | → `categories` |

---

### `product_images`
Images d'un produit, ordonnées par `position`.

| Champ | Type | Notes |
|-------|------|-------|
| id | cuid | |
| productId | FK | → `products` |
| url | String | |
| alt | String? | texte alternatif |
| position | Int | ordre d'affichage |

---

### `option_values` — 🔑 Base centralisée

**Table centrale de toutes tes valeurs d'options.** Tissus, couleurs, finitions, tailles… tout est ici.

| Champ | Type | Notes |
|-------|------|-------|
| id | cuid | |
| label | String | ex: `"Liberty Betsy"`, `"Doré"` |
| type | String | ex: `"tissu"`, `"couleur"`, `"finition"`, `"taille"` |
| priceOffSet | Decimal | surcoût à ajouter au `basePrice` (0 si aucun) |
| isAvailable | Boolean | `false` = indisponible sur **tous les produits** qui l'utilisent |

> ✅ Passer `isAvailable = false` sur un tissu en rupture le retire automatiquement de tous les produits sans aucune autre modification.

---

### `product_option_groups`
Groupe d'options **par produit**. Chaque groupe est un choix présenté au client (ex: "Choix du tissu", "Couleur des finitions").

| Champ | Type | Notes |
|-------|------|-------|
| id | cuid | |
| productId | FK | → `products` |
| position | Int | ordre d'affichage des groupes |
| values | Relation N:N | → `option_values` |

> Un même `OptionValue` peut être utilisé dans plusieurs groupes de plusieurs produits différents.

**Exemple :**
```
Tablier de cuisine
  └── Groupe 0 (position 0) → Coton rayé marine, Liberty Betsy, Lin naturel

Gigoteuse bébé
  └── Groupe 0 (position 0) → Velours terracotta, Coton rayé marine, Liberty Betsy
  └── Groupe 1 (position 1) → S (0-2 ans), M (2-4 ans), L (4-6 ans)
```

---

### `orders`

| Champ | Type | Notes |
|-------|------|-------|
| id | cuid | |
| userId | FK | → `users` |
| status | Enum | voir ci-dessous |
| subtotal | Decimal | |
| shippingCost | Decimal | |
| total | Decimal | subtotal + shippingCost |
| shipAddress / shipCity / shipPostal / shipCountry | String? | adresse de livraison |

**Statuts possibles :**
`PENDING` → `PAID` → `PROCESSING` → `SHIPPED` → `DELIVERED`
`PENDING` → `CANCELLED`
`PAID` → `REFUNDED`

---

### `order_items`
Snapshot immuable de l'achat. **Ne dépend pas du produit live** — l'historique reste stable même si le produit est modifié.

| Champ | Type | Notes |
|-------|------|-------|
| id | cuid | |
| orderId | FK | → `orders` |
| productId | FK | → `products` (référence souple) |
| productName / productSlug | String | snapshot du nom au moment de l'achat |
| quantity | Int | |
| unitPrice | Decimal | prix unitaire au moment de l'achat |
| total | Decimal | unitPrice × quantity |
| optionsSnapshot | Json? | choix du client au moment de la commande |

**Format de `optionsSnapshot` :**
```json
{
  "Tissu": "Liberty Betsy",
  "Finition": "Doré"
}
```

---

### `payments`
Paiement lié à une commande (relation 1:1).

| Champ | Type | Notes |
|-------|------|-------|
| id | cuid | |
| orderId | FK unique | → `orders` |
| stripePaymentId | String? unique | `pi_...` |
| stripeSessionId | String? unique | `cs_...` |
| amount | Decimal | |
| currency | String | défaut `"eur"` |
| status | Enum | `PENDING` \| `SUCCEEDED` \| `FAILED` \| `REFUNDED` |
| method | String? | ex: `"card"` |
| paidAt | DateTime? | null si pas encore payé |

---

## Installation & lancement

### 1. Prérequis

```bash
npm install
npm install -D ts-node @types/node
npm install bcryptjs
npm install -D @types/bcryptjs
```

### 2. Variables d'environnement

Créer un fichier `.env` à la racine :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/couture_db"
```

### 3. Appliquer le schéma

```bash
# Première fois
npx prisma migrate dev --name init

# Ou si tu veux juste synchroniser sans migration
npx prisma db push
```

### 4. Lancer le seed

Ajouter dans `package.json` :

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Puis :

```bash
npx prisma db seed
```

### 5. Explorer les données

```bash
npx prisma studio
```

---

## Comptes de test (seed)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@couture.fr | password123 |
| Client | client@example.fr | password123 |

---

## Logique métier importante

### Calcul du prix final

```
prix final = product.basePrice + somme des optionValue.priceOffSet choisis
```

Exemple :
- Tote bag : `28.00` (base)
- Velours côtelé terracotta : `+2.50` (offset)
- **Total : 30.50 €**

### Rendre un tissu indisponible

```typescript
await prisma.optionValue.update({
  where: { id: "..." },
  data: { isAvailable: false },
});
```

➡️ Le tissu disparaît immédiatement de tous les produits qui l'utilisent, sans aucune autre modification.

### Ajouter un nouveau tissu au catalogue

```typescript
const nouveauTissu = await prisma.optionValue.create({
  data: { label: "Soie sauvage ivoire", type: "tissu", priceOffSet: 5.0, isAvailable: true },
});

// L'attribuer à un groupe d'un produit existant
await prisma.productOptionGroup.update({
  where: { id: "groupe_id" },
  data: { values: { connect: { id: nouveauTissu.id } } },
});
```