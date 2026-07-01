import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ToastContainer } from '@/components/ui/Toast'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 68 }}>
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </div>
      <ToastContainer />
    </>
  )
}
