'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, LogOut, Star, Eye, Archive, ArchiveRestore } from 'lucide-react'
import Link from 'next/link'
import { logout, deleteProduct, toggleEmpty, deleteCollection } from '@/app/actions'
import ProductForm from './ProductForm'
import CollectionForm from './CollectionForm'
import type { Category, Collection, Product } from '@/lib/types'

interface Props {
  products: Product[]
  categories: Category[]
  collections: Collection[]
}

export default function AdminDashboard({ products, categories, collections }: Props) {
  const [tab, setTab] = useState<'produits' | 'collections'>('produits')
  const [showProductForm, setShowProductForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [showCollectionForm, setShowCollectionForm] = useState(false)
  const [editCollection, setEditCollection] = useState<Collection | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDeleteProduct(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    startTransition(async () => { await deleteProduct(id) })
  }

  function handleToggleEmpty(id: string, current: boolean) {
    startTransition(async () => { await toggleEmpty(id, !current) })
  }

  function handleDeleteCollection(id: string) {
    if (!confirm('Supprimer ce look ?')) return
    startTransition(async () => { await deleteCollection(id) })
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="font-display italic text-3xl text-rose-deep">Cristina</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="flex items-center gap-1.5 px-4 py-2 text-sm text-mauve rounded-full hover:bg-petal transition-colors border border-border">
              <Eye className="w-4 h-4" /> Voir le site
            </Link>
            {tab === 'produits' ? (
              <button
                onClick={() => { setEditProduct(null); setShowProductForm(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-deep text-white rounded-full text-sm font-medium hover:bg-plum transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Nouveau produit
              </button>
            ) : (
              <button
                onClick={() => { setEditCollection(null); setShowCollectionForm(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-deep text-white rounded-full text-sm font-medium hover:bg-plum transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Nouveau look
              </button>
            )}
            <form action={logout}>
              <button type="submit" className="flex items-center gap-1.5 px-4 py-2 text-sm text-mauve rounded-full hover:bg-petal transition-colors border border-border">
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </form>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1 border border-border w-fit">
          {(['produits', 'collections'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-rose-deep text-white shadow-sm' : 'text-mauve hover:text-plum'
              }`}
            >
              {t === 'collections' ? 'Looks' : 'Produits'}
            </button>
          ))}
        </div>

        {/* Liste produits */}
        {tab === 'produits' && (
          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-border">
                <span className="text-5xl block mb-4">💄</span>
                <p className="font-display italic text-xl text-mauve">Aucun produit pour l&apos;instant</p>
              </div>
            ) : products.map(product => (
              <div key={product.id} className={`bg-white rounded-2xl border border-border p-4 flex items-center gap-4 ${product.is_empty ? 'opacity-60' : ''}`}>
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-14 h-14 rounded-xl bg-petal flex items-center justify-center flex-shrink-0 text-2xl">{product.category?.icon ?? '💄'}</div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-mauve uppercase tracking-widest">{product.brand}</p>
                    {product.is_empty && <span className="text-xs bg-border text-mauve px-2 py-0.5 rounded-full">Épuisé</span>}
                  </div>
                  <p className="font-display text-base text-plum truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {product.category && <span className="text-xs bg-petal text-rose-dark px-2 py-0.5 rounded-full">{product.category.name}</span>}
                    {product.shades && product.shades.length > 0 && <span className="text-xs text-mauve">{product.shades.length} teinte{product.shades.length > 1 ? 's' : ''}</span>}
                    {product.rating && <span className="flex items-center gap-0.5 text-xs text-gold"><Star className="w-3 h-3 fill-gold" />{product.rating}/5</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleEmpty(product.id, product.is_empty)}
                    disabled={isPending}
                    title={product.is_empty ? 'Marquer comme disponible' : 'Marquer comme épuisé'}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-petal transition-colors text-mauve hover:text-rose-deep"
                  >
                    {product.is_empty ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setEditProduct(product); setShowProductForm(true) }}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-petal transition-colors text-mauve hover:text-rose-deep"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={isPending}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors text-mauve hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Liste collections/looks */}
        {tab === 'collections' && (
          <div className="space-y-3">
            {collections.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-border">
                <span className="text-5xl block mb-4">✨</span>
                <p className="font-display italic text-xl text-mauve">Aucun look pour l&apos;instant</p>
                <p className="text-sm text-mauve mt-1">Crée ton premier look !</p>
              </div>
            ) : collections.map(col => (
              <div key={col.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4">
                {col.cover_image_url
                  ? <img src={col.cover_image_url} alt={col.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-14 h-14 rounded-xl bg-petal flex items-center justify-center flex-shrink-0 text-2xl">✨</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base text-plum truncate">{col.name}</p>
                  <p className="text-xs text-mauve">{col.product_count ?? 0} produit{(col.product_count ?? 0) > 1 ? 's' : ''}</p>
                  {col.description && <p className="text-xs text-mauve truncate">{col.description}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditCollection(col); setShowCollectionForm(true) }}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-petal transition-colors text-mauve hover:text-rose-deep"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(col.id)}
                    disabled={isPending}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors text-mauve hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showProductForm && (
        <ProductForm
          categories={categories}
          brands={Array.from(new Set(products.map(p => p.brand))).sort()}
          product={editProduct ?? undefined}
          onClose={() => { setShowProductForm(false); setEditProduct(null) }}
        />
      )}
      {showCollectionForm && (
        <CollectionForm
          products={products}
          collection={editCollection ?? undefined}
          onClose={() => { setShowCollectionForm(false); setEditCollection(null) }}
        />
      )}
    </div>
  )
}
