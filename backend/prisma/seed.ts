// ============================================================
// SEED SCRIPT (prisma/seed.ts)
// ============================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ==========================================================
  // OPTION TYPES
  // ==========================================================

  const taille = await prisma.optionType.create({
    data: { name: "Taille" }
  });

  const couleur = await prisma.optionType.create({
    data: { name: "Couleur" }
  });

  const tissu = await prisma.optionType.create({
    data: { name: "Tissu" }
  });

  // ==========================================================
  // OPTION VALUES
  // ==========================================================

  const sizes = await Promise.all(
    ["S", "M", "L"].map((v) =>
      prisma.optionValue.create({
        data: {
          optionTypeId: taille.id,
          name: v,
          priceOffset: 0,
          stock: 999,
          isAvailable: true
        }
      })
    )
  );

  const colors = await Promise.all(
    [
      { name: "Rouge", price: 2 },
      { name: "Bleu", price: 1 },
      { name: "Noir", price: 0 }
    ].map((v) =>
      prisma.optionValue.create({
        data: {
          optionTypeId: couleur.id,
          name: v.name,
          priceOffset: v.price,
          stock: 999,
          isAvailable: true
        }
      })
    )
  );

  const fabrics = await Promise.all(
    [
      { name: "Coton", cost: 3 },
      { name: "Lin", cost: 5 },
      { name: "Denim", cost: 4 }
    ].map((v) =>
      prisma.optionValue.create({
        data: {
          optionTypeId: tissu.id,
          name: v.name,
          priceOffset: 0,
          stock: 100,
          isAvailable: v.name !== "Denim", // exemple désactivé
          metadata: {
            cost: v.cost
          }
        }
      })
    )
  );

  // ==========================================================
  // CATEGORY
  // ==========================================================

  const category = await prisma.category.create({
    data: {
      name: "T-Shirts",
      slug: "t-shirts"
    }
  });

  // ==========================================================
  // PRODUCT
  // ==========================================================

  const product = await prisma.product.create({
    data: {
      name: "T-Shirt Premium",
      slug: "t-shirt-premium",
      basePrice: 29.99,
      categoryId: category.id,
      isActive: true
    }
  });

  // ==========================================================
  // VARIANTS (simple exemple)
  // ==========================================================

  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      stock: 10,
      sku: "TSHIRT-M-ROUGE-COTON",

      options: {
        create: [
          {
            optionValueId: sizes[1].id // M
          },
          {
            optionValueId: colors[0].id // Rouge
          },
          {
            optionValueId: fabrics[0].id // Coton
          }
        ]
      }
    }
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });