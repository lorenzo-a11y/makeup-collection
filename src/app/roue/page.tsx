import { createClient } from '@/lib/supabase/server'
import RoueClient from '@/components/RoueClient'

export const revalidate = 60

const MAKEUP_ID = 'aaaaaaaa-0000-0000-0000-000000000001'

export default async function RouePage() {
  const supabase = await createClient()

  const { data: subCategories } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', MAKEUP_ID)
    .order('name')

  const subIds = (subCategories ?? []).map(c => c.id)

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*), shades(*)')
    .eq('is_empty', false)
    .in('category_id', [MAKEUP_ID, ...subIds])

  return <RoueClient products={products ?? []} categories={subCategories ?? []} />
}
