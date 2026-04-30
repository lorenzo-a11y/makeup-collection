import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Gallery from '@/components/Gallery'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: { user } }, { data: categories }, { data: products }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('products')
      .select('*, category:categories(*), shades(*)')
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="min-h-screen">
      <Header />
      <Gallery
        products={products ?? []}
        categories={categories ?? []}
        isAdmin={!!user}
      />
    </div>
  )
}
