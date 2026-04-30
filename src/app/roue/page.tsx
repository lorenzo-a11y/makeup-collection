import { createClient } from '@/lib/supabase/server'
import RoueClient from '@/components/RoueClient'

export const revalidate = 60

export default async function RouePage() {
  const supabase = await createClient()
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, category:categories(*), shades(*)').eq('is_empty', false),
    supabase.from('categories').select('*').order('name'),
  ])

  return <RoueClient products={products ?? []} categories={categories ?? []} />
}
