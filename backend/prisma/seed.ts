import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================
  // CLEAN (order matters — children before parents)
  // ============================================================
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productOptionGroup.deleteMany();
  await prisma.optionValue.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleaned existing data");

  // ============================================================
  // USERS
  // ============================================================
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@couture.fr",
      password: hashedPassword,
      firstName: "Marie",
      lastName: "Dupont",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "client@example.fr",
      password: hashedPassword,
      firstName: "Sophie",
      lastName: "Martin",
      role: "CUSTOMER",
    },
  });

  console.log("👤 Users created");

  // ============================================================
  // CATEGORIES
  // ============================================================
  const catAccessoires = await prisma.category.create({
    data: { name: "Accessoires", slug: "accessoires" },
  });

  const catMaison = await prisma.category.create({
    data: { name: "Maison", slug: "maison" },
  });

  const catEnfants = await prisma.category.create({
    data: { name: "Enfants", slug: "enfants" },
  });

  console.log("🗂️  Categories created");

  // ============================================================
  // OPTION VALUES — BASE CENTRALISÉE
  // ============================================================

  // Tissus
  const libertyFleurs = await prisma.optionValue.create({
    data: { label: "Liberty Betsy", type: "tissu", priceOffSet: 0, isAvailable: true },
  });
  const waxBleu = await prisma.optionValue.create({
    data: { label: "Wax bleu nuit", type: "tissu", priceOffSet: 0, isAvailable: true },
  });
  const linNaturel = await prisma.optionValue.create({
    data: { label: "Lin naturel", type: "tissu", priceOffSet: 0, isAvailable: false }, // rupture
  });
  const cotonRaye = await prisma.optionValue.create({
    data: { label: "Coton rayé marine", type: "tissu", priceOffSet: 0, isAvailable: true },
  });
  const veloursCote = await prisma.optionValue.create({
    data: { label: "Velours côtelé terracotta", type: "tissu", priceOffSet: 2.5, isAvailable: true },
  });
  const imprimeLeopard = await prisma.optionValue.create({
    data: { label: "Imprimé léopard", type: "tissu", priceOffSet: 1.5, isAvailable: true },
  });

  // Couleurs de finitions (fils, boutons…)
  const finitionDore = await prisma.optionValue.create({
    data: { label: "Doré", type: "finition", priceOffSet: 0, isAvailable: true },
  });
  const finitionArgent = await prisma.optionValue.create({
    data: { label: "Argenté", type: "finition", priceOffSet: 0, isAvailable: true },
  });
  const finitionNoir = await prisma.optionValue.create({
    data: { label: "Noir", type: "finition", priceOffSet: 0, isAvailable: true },
  });

  // Tailles
  const tailleS = await prisma.optionValue.create({
    data: { label: "S (0-2 ans)", type: "taille", priceOffSet: 0, isAvailable: true },
  });
  const tailleM = await prisma.optionValue.create({
    data: { label: "M (2-4 ans)", type: "taille", priceOffSet: 0, isAvailable: true },
  });
  const tailleL = await prisma.optionValue.create({
    data: { label: "L (4-6 ans)", type: "taille", priceOffSet: 0, isAvailable: true },
  });

  console.log("🎨 Option values created");

  // ============================================================
  // PRODUCTS
  // ============================================================

  // --- Pochette zippée ---
  const pochette = await prisma.product.create({
    data: {
      slug: "pochette-zippee",
      name: "Pochette zippée",
      shortDescription: "Petite pochette zippée faite main, idéale pour les essentiels.",
      description:
        "Cousue à la main avec soin, cette pochette zippée est parfaite pour ranger vos essentiels. Doublée intérieurement, avec une fermeture éclair robuste. Dimensions : 20 × 12 cm.",
      basePrice: 18.0,
      isActive: true,
      categoryId: catAccessoires.id,
      images: {
        create: [
          { url: "https://placehold.co/600x400?text=Pochette+1", alt: "Pochette zippée Liberty", position: 0 },
          { url: "https://placehold.co/600x400?text=Pochette+2", alt: "Pochette zippée Wax", position: 1 },
        ],
      },
    },
  });

  await prisma.productOptionGroup.create({
    data: {
      productId: pochette.id,
      position: 0,
      values: { connect: [{ id: libertyFleurs.id }, { id: waxBleu.id }, { id: linNaturel.id }] },
    },
  });

  await prisma.productOptionGroup.create({
    data: {
      productId: pochette.id,
      position: 1,
      values: { connect: [{ id: finitionDore.id }, { id: finitionArgent.id }] },
    },
  });

  // --- Tablier de cuisine ---
  const tablier = await prisma.product.create({
    data: {
      slug: "tablier-cuisine",
      name: "Tablier de cuisine",
      shortDescription: "Tablier de cuisine ajustable, fait main.",
      description:
        "Tablier réglable avec poche centrale et lanières longues pour nouer dans le dos. Tissu traité anti-taches léger. Taille unique adulte.",
      basePrice: 34.0,
      isActive: true,
      categoryId: catMaison.id,
      images: {
        create: [
          { url: "https://placehold.co/600x400?text=Tablier+1", alt: "Tablier coton rayé", position: 0 },
        ],
      },
    },
  });

  await prisma.productOptionGroup.create({
    data: {
      productId: tablier.id,
      position: 0,
      values: { connect: [{ id: cotonRaye.id }, { id: libertyFleurs.id }, { id: linNaturel.id }] },
    },
  });

  // --- Tote bag ---
  const toteBag = await prisma.product.create({
    data: {
      slug: "tote-bag-couture",
      name: "Tote bag couture",
      shortDescription: "Grand sac cabas doublé, solide et stylé.",
      description:
        "Tote bag spacieux entièrement doublé, avec poche intérieure zippée. Anses longues pour porter à l'épaule. Dimensions : 38 × 40 cm.",
      basePrice: 28.0,
      isActive: true,
      categoryId: catAccessoires.id,
      images: {
        create: [
          { url: "https://placehold.co/600x400?text=Tote+1", alt: "Tote bag imprimé léopard", position: 0 },
        ],
      },
    },
  });

  await prisma.productOptionGroup.create({
    data: {
      productId: toteBag.id,
      position: 0,
      values: { connect: [{ id: imprimeLeopard.id }, { id: waxBleu.id }, { id: veloursCote.id }] },
    },
  });

  await prisma.productOptionGroup.create({
    data: {
      productId: toteBag.id,
      position: 1,
      values: { connect: [{ id: finitionNoir.id }, { id: finitionDore.id }] },
    },
  });

  // --- Gigoteuse bébé ---
  const gigoteuse = await prisma.product.create({
    data: {
      slug: "gigoteuse-bebe",
      name: "Gigoteuse bébé",
      shortDescription: "Gigoteuse douce et chaude pour les tout-petits.",
      description:
        "Gigoteuse entièrement faite main, doublée polaire. Fermeture éclair sur le côté pour faciliter le change. Disponible en 3 tailles.",
      basePrice: 42.0,
      isActive: true,
      categoryId: catEnfants.id,
      images: {
        create: [
          { url: "https://placehold.co/600x400?text=Gigoteuse+1", alt: "Gigoteuse velours terracotta", position: 0 },
        ],
      },
    },
  });

  await prisma.productOptionGroup.create({
    data: {
      productId: gigoteuse.id,
      position: 0,
      values: { connect: [{ id: veloursCote.id }, { id: cotonRaye.id }, { id: libertyFleurs.id }] },
    },
  });

  await prisma.productOptionGroup.create({
    data: {
      productId: gigoteuse.id,
      position: 1,
      values: { connect: [{ id: tailleS.id }, { id: tailleM.id }, { id: tailleL.id }] },
    },
  });

  console.log("🛍️  Products created");

  // ============================================================
  // SAMPLE ORDER
  // ============================================================
  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      status: "PAID",
      subtotal: 46.0,
      shippingCost: 4.9,
      total: 50.9,
      shipAddress: "12 rue des Lilas",
      shipCity: "Lyon",
      shipPostal: "69003",
      shipCountry: "FR",
      items: {
        create: [
          {
            productId: pochette.id,
            productName: "Pochette zippée",
            productSlug: "pochette-zippee",
            quantity: 1,
            unitPrice: 18.0,
            total: 18.0,
            optionsSnapshot: { Tissu: "Liberty Betsy", Finition: "Doré" },
          },
          {
            productId: tablier.id,
            productName: "Tablier de cuisine",
            productSlug: "tablier-cuisine",
            quantity: 1,
            unitPrice: 34.0,
            total: 34.0,
            optionsSnapshot: { Tissu: "Coton rayé marine" },
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      stripePaymentId: "pi_seed_example_001",
      stripeSessionId: "cs_seed_example_001",
      amount: 50.9,
      currency: "eur",
      status: "SUCCEEDED",
      method: "card",
      paidAt: new Date(),
    },
  });

  console.log("🧾 Sample order + payment created");
  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });