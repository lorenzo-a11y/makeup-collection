import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Gallery from '@/components/Gallery'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: collection }, { data: categories }, { data: productLinks }] = await Promise.all([
    supabase.from('collections').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
    supabase.from('collection_products').select('product_id').eq('collection_id', id),
  ])

  if (!collection) notFound()

  const productIds = productLinks?.map(l => l.product_id) ?? []

  const { data: products } = productIds.length > 0
    ? await supabase
        .from('products')
        .select('*, category:categories(*), shades(*)')
        .in('id', productIds)
    : { data: [] }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header de la collection */}
      <div className="relative">
        {collection.cover_image_url && (
          <div className="h-56 overflow-hidden">
            <img src={collection.cover_image_url} alt={collection.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
        <div className={`${collection.cover_image_url ? 'absolute bottom-0 left-0 right-0 p-6 text-white' : 'p-6'}`}>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-sm mb-3 hover:opacity-80 transition-opacity"
            style={{ color: collection.cover_image_url ? 'white' : undefined }}
          >
            <ArrowLeft className="w-4 h-4" /> Mes Looks
          </Link>
          <h1 className={`font-display italic text-3xl sm:text-4xl ${collection.cover_image_url ? 'text-white' : 'text-rose-deep'}`}>
            {collection.name}
          </h1>
          {collection.description && (
            <p className={`text-sm mt-1 ${collection.cover_image_url ? 'text-white/80' : 'text-mauve'}`}>
              {collection.description}
            </p>
          )}
        </div>
      </div>

      <Gallery products={products ?? []} categories={categories ?? []} />
    </div>
  )
}
