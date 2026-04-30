import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/admin/LoginForm'
import AdminDashboard from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <LoginForm />

  const [{ data: categories }, { data: products }, { data: collections }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('products').select('*, category:categories(*), shades(*)').order('created_at', { ascending: false }),
    supabase.from('collections').select('*, products:collection_products(product_id)').order('created_at', { ascending: false }),
  ])

  const collectionsWithCount = (collections ?? []).map(c => ({
    ...c,
    product_count: c.products?.length ?? 0,
    products: undefined,
  }))

  return (
    <AdminDashboard
      products={products ?? []}
      categories={categories ?? []}
      collections={collectionsWithCount}
    />
  )
}
