import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

export const revalidate = 60

export default async function CollectionsPage() {
  const supabase = await createClient()
  const { data: collections } = await supabase
    .from('collections')
    .select('*, collection_products(product_id)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-border hover:bg-petal transition-colors text-mauve">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display italic text-3xl text-rose-deep">Mes Looks</h1>
            <p className="text-sm text-mauve">{collections?.length ?? 0} look{(collections?.length ?? 0) > 1 ? 's' : ''}</p>
          </div>
        </div>

        {!collections || collections.length === 0 ? (
          <div className="text-center py-24">
            <Sparkles className="w-10 h-10 text-rose mx-auto mb-4" />
            <p className="font-display italic text-xl text-mauve">Aucun look pour l&apos;instant</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {collections.map(col => (
              <Link key={col.id} href={`/collections/${col.id}`} className="group">
                <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  {col.cover_image_url ? (
                    <div className="overflow-hidden h-48">
                      <img
                        src={col.cover_image_url}
                        alt={col.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-petal flex items-center justify-center">
                      <span className="text-6xl">✨</span>
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="font-display text-lg text-plum mb-1">{col.name}</h2>
                    {col.description && <p className="text-sm text-mauve mb-2 line-clamp-2">{col.description}</p>}
                    <p className="text-xs text-mauve">
                      {col.collection_products?.length ?? 0} produit{(col.collection_products?.length ?? 0) > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
