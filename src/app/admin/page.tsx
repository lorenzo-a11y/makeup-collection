import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/admin/LoginForm'
import AdminDashboard from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <LoginForm />

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('products')
      .select('*, category:categories(*), shades(*)')
      .order('created_at', { ascending: false }),
  ])

  return (
    <AdminDashboard
      products={products ?? []}
      categories={categories ?? []}
    />
  )
}
