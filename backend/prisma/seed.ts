import { PrismaClient, Role, OrderStatus, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ==========================================================
  // USERS
  // ==========================================================

  const password = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: {},
    create: {
      email: 'admin@shop.com',
      password,
      firstName: 'Admin',
      lastName: 'System',
      role: Role.ADMIN,
    },
  })

  const customer = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.CUSTOMER,
    },
  })

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const clothing = await prisma.category.create({
    data: {
      name: 'Vêtements',
      slug: 'vetements',
      description: 'Collection textile',
    },
  })

  const accessories = await prisma.category.create({
    data: {
      name: 'Accessoires',
      slug: 'accessoires',
    },
  })

  const home = await prisma.category.create({
    data: {
      name: 'Maison',
      slug: 'maison',
    },
  })

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  const tshirt = await prisma.product.create({
    data: {
      name: 'T-Shirt Premium',
      slug: 'tshirt-premium',
      description: 'T-shirt coton bio',
      basePrice: 29.99,
      categoryId: clothing.id,

      images: {
        create: [
          {
            url: 'https://picsum.photos/600/600?1',
            alt: 'T-Shirt Premium',
          },
        ],
      },

      variants: {
        create: [
          {
            type: 'Couleur',
            value: 'Rouge',
            colorHex: '#FF0000',
            stock: 15,
          },
          {
            type: 'Couleur',
            value: 'Bleu',
            colorHex: '#0000FF',
            stock: 10,
          },
          {
            type: 'Taille',
            value: 'M',
            stock: 20,
          },
          {
            type: 'Taille',
            value: 'L',
            stock: 12,
          },
        ],
      },
    },
  })

  const mug = await prisma.product.create({
    data: {
      name: 'Mug Minimaliste',
      slug: 'mug-minimaliste',
      description: 'Mug céramique 330ml',
      basePrice: 14.90,
      categoryId: home.id,

      images: {
        create: [
          {
            url: 'https://picsum.photos/600/600?2',
            alt: 'Mug',
          },
        ],
      },

      variants: {
        create: [
          {
            type: 'Couleur',
            value: 'Blanc',
            stock: 30,
          },
          {
            type: 'Couleur',
            value: 'Noir',
            stock: 20,
          },
        ],
      },
    },
  })

  const cap = await prisma.product.create({
    data: {
      name: 'Casquette Classic',
      slug: 'casquette-classic',
      description: 'Casquette ajustable',
      basePrice: 19.90,
      categoryId: accessories.id,

      images: {
        create: [
          {
            url: 'https://picsum.photos/600/600?3',
            alt: 'Casquette',
          },
        ],
      },

      variants: {
        create: [
          {
            type: 'Couleur',
            value: 'Noir',
            stock: 25,
          },
          {
            type: 'Couleur',
            value: 'Beige',
            stock: 18,
          },
        ],
      },
    },
  })

  // ==========================================================
  // ORDER
  // ==========================================================

  const order = await prisma.order.create({
    data: {
      userId: customer.id,

      status: OrderStatus.PAID,

      subtotal: 31.99,
      shippingCost: 4.99,
      total: 36.98,

      shipAddress: '10 Rue de Paris',
      shipCity: 'Paris',
      shipPostal: '75001',
      shipCountry: 'France',

      items: {
        create: [
          {
            productId: tshirt.id,

            productName: tshirt.name,
            productSlug: tshirt.slug,

            quantity: 1,

            unitPrice: 31.99,
            total: 31.99,

            variantSnapshot: [
              {
                type: 'Couleur',
                value: 'Rouge',
                priceOffset: 2,
              },
              {
                type: 'Taille',
                value: 'M',
                priceOffset: 0,
              },
            ],
          },
        ],
      },
    },
  })

  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: 36.98,
      currency: 'eur',
      status: PaymentStatus.SUCCEEDED,
      method: 'card',
      paidAt: new Date(),
      stripePaymentId: 'pi_demo_123456',
      stripeSessionId: 'cs_demo_123456',
    },
  })

  console.log('✅ Seed completed')
  console.log({
    admin: admin.email,
    customer: customer.email,
    products: 3,
  })
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })