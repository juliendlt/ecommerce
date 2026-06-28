export function formatPrice(price: number | string): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
    Number(price)
  )
}

export function computeFinalPrice(
  basePrice: number,
  selectedOptions: Record<string, import('./api').OptionValue>
): number {
  const offsets = Object.values(selectedOptions).reduce(
    (sum, opt) => sum + Number(opt.priceOffSet),
    0
  )
  return Number(basePrice) + offsets
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    PAID: 'Payée',
    PROCESSING: 'En préparation',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
    REFUNDED: 'Remboursée',
  }
  return labels[status] ?? status
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: '#8B7355',
    PAID: '#C9A87C',
    PROCESSING: '#C9A87C',
    SHIPPED: '#a8b5a0',
    DELIVERED: '#7a9e7e',
    CANCELLED: '#c47a6a',
    REFUNDED: '#8B7355',
  }
  return colors[status] ?? '#8B7355'
}
