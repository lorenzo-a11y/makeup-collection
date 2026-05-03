import { createClient } from '@/lib/supabase/server'
import OutilsClient from './OutilsClient'

export const revalidate = 60

export default async function OutilsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*), shades(*)')
    .eq('is_empty', false)
    .order('created_at', { ascending: false })

  return <OutilsClient products={products ?? []} />
}
