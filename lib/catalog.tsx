import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { getCatalog } from './api'
import type { Product, Store } from './types'

type CatalogContextValue = { products: Product[]; stores: Store[]; loading: boolean; error: string | null; refresh: () => Promise<void> }
const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getCatalog()
      setProducts(response.products)
      setStores(response.stores)
      setError(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Catalog unavailable')
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { refresh() }, [refresh])
  const value = useMemo(() => ({ products, stores, loading, error, refresh }), [products, stores, loading, error, refresh])
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const value = useContext(CatalogContext)
  if (!value) throw new Error('useCatalog must be used inside CatalogProvider')
  return value
}
