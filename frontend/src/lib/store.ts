import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Product, OptionValue } from './api'

// ─── Auth Store ──────────────────────────────────────────────
interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null })
      },
      isAuthenticated: () => !!get().token,
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
)

// ─── Cart Store ───────────────────────────────────────────────
export interface CartItem {
  id: string // unique: productId + JSON(options)
  productId: string
  productName: string
  productSlug: string
  image?: string
  quantity: number
  unitPrice: number
  selectedOptions: Record<string, OptionValue> // groupId → chosen OptionValue
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

function buildCartItemId(productId: string, options: Record<string, OptionValue>) {
  const key = Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v.id}`)
    .join('|')
  return `${productId}_${key}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const id = buildCartItemId(item.productId, item.selectedOptions)
        set((state) => {
          const existing = state.items.find((i) => i.id === id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            }
          }
          return { items: [...state.items, { ...item, id }] }
        })
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }))
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    { name: 'cart-store' }
  )
)
