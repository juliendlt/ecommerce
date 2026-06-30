const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erreur réseau' }))
    throw new Error(err.message || 'Erreur réseau')
  }
  return res.json()
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Products
export const productsApi = {
  getAll: () => request<Product[]>('/products'),
  getBySlug: (slug: string) => request<Product>(`/products/${slug}`),
}

// Categories
export const categoriesApi = {
  getAll: () => request<Category[]>('/categories'),
  getBySlug: (slug: string) => request<CategoryWithProducts>(`/categories/${slug}`),
}

// Orders
export const ordersApi = {
  create: (data: CreateOrderPayload) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => request<Order[]>('/orders'),
  getById: (id: string) => request<Order>(`/orders/${id}`),
}

// Payments
export const paymentsApi = {
  createCheckout: (orderId: string) =>
    request<{ url: string }>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),
}

// User
export const userApi = {
  getMe: () => request<User>('/users/me'),
  updateMe: (data: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>) =>
    request<User>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
}

// Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'ADMIN'
  createdAt?: string
}

export interface OptionValue {
  id: string
  label: string
  type: string
  priceOffSet: number
  isAvailable: boolean
}

export interface ProductOptionGroup {
  id: string
  position: number
  values: OptionValue[]
}

export interface ProductImage {
  id: string
  url: string
  alt?: string
  position: number
  optionValueId?: string
}

export interface Product {
  id: string
  slug: string
  name: string
  shortDescription?: string
  description?: string
  basePrice: number
  isActive: boolean
  category: Category
  images: ProductImage[]
  optionGroups: ProductOptionGroup[]
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface CategoryWithProducts extends Category {
  products: Product[]
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productSlug: string
  quantity: number
  unitPrice: number
  total: number
  optionsSnapshot?: Record<string, string>
}

export interface Order {
  id: string
  status: string
  subtotal: number
  shippingCost: number
  total: number
  createdAt: string
  items: OrderItem[]
  payment?: { status: string; paidAt?: string }
}

export interface CreateOrderPayload {
  items: {
    productId: string
    productName: string
    productSlug: string
    quantity: number
    unitPrice: number
    optionsSnapshot?: Record<string, string>
  }[]
  shipping?: {
    address: string
    city: string
    postal: string
    country: string
  }
}

// ─── Admin APIs ───────────────────────────────────────────────

// Admin — Products
export const adminProductsApi = {
  getAll: () => request<Product[]>('/products'),
  create: (data: {
    name: string; slug: string; shortDescription?: string
    description?: string; basePrice: number; categoryId: string
  }) => request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{
    name: string; slug: string; shortDescription: string
    description: string; basePrice: number; categoryId: string; isActive: boolean
  }>) => request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  disable: (id: string) =>
    request<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),
}

// Admin — Categories
export const adminCategoriesApi = {
  getAll: () => request<Category[]>('/categories'),
  create: (data: { name: string; slug: string }) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; slug?: string }) =>
    request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ message: string }>(`/categories/${id}`, { method: 'DELETE' }),
}

// Admin — Options
// Note: /options backend filtre isAvailable:true — on récupère les actives puis
// on fusionne avec l'état local pour afficher les désactivées après toggle.
export const adminOptionsApi = {
  getAll: () => request<OptionValue[]>('/options'),
  create: (data: { label: string; type: string; priceOffSet: number }) =>
    request<OptionValue>('/options', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: {
    label?: string; type?: string; priceOffSet?: number; isAvailable?: boolean
  }) => request<OptionValue>(`/options/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  disable: (id: string) =>
    request<{ message: string }>(`/options/${id}`, { method: 'DELETE' }),
}

// Admin — Images (multipart/form-data)
export const adminImagesApi = {
  upload: async (data: {
    file: File; productId: string; alt?: string
    position: number; optionValueId?: string
  }): Promise<ProductImage> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const form = new FormData()
    form.append('image', data.file)
    form.append('productId', data.productId)
    form.append('position', String(data.position))
    if (data.alt) form.append('alt', data.alt)
    if (data.optionValueId) form.append('optionValueId', data.optionValueId)
    const res = await fetch(`${BASE_URL}/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erreur upload' }))
      throw new Error(err.message || 'Erreur upload')
    }
    return res.json()
  },
  getByProduct: (productId: string) =>
    request<ProductImage[]>(`/images/product/${productId}`),
  update: (id: string, data: { alt?: string; position?: number; optionValueId?: string }) =>
    request<ProductImage>(`/images/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ message: string }>(`/images/${id}`, { method: 'DELETE' }),
}

// Admin — Option Groups (lier des options existantes à un produit)
export const adminOptionGroupsApi = {
  attach: (productId: string, position: number, optionValueIds: string[]) =>
    request<ProductOptionGroup>('/options/attach', {
      method: 'POST',
      body: JSON.stringify({ productId, position, optionValueIds }),
    }),
  delete: (groupId: string) =>
    request<{ message: string }>(`/options/groups/${groupId}`, { method: 'DELETE' }),
}

// Admin — Orders
export const adminOrdersApi = {
  getAll: () => request<AdminOrder[]>('/orders/admin/all'),
  updateStatus: (id: string, status: string) =>
    request<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}

// Admin — Types
export interface AdminOrder extends Order {
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: string
  orders?: Order[]
}
