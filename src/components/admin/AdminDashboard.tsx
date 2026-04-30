'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, LogOut, Star, Eye } from 'lucide-react'
import Link from 'next/link'
import { logout, deleteProduct } from '@/app/actions'
import ProductForm from './ProductForm'
import type { Category, Product } from '@/lib/types'

interface Props {
  products: Product[]
  categories: Category[]
}

export default function AdminDashboard({ products, categories }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleEdit(product: Product) {
    setEditProduct(product)
    setShowForm(true)
  }

  function handleDelete(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    startTransition(async () => { await deleteProduct(id) })
  }

  function handleFormClose() {
    setShowForm(false)
    setEditProduct(null)
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h1 className="font-display italic text-3xl text-rose-deep">Cristina</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-mauve rounded-full hover:bg-petal transition-colors border border-border"
            >
              <Eye className="w-4 h-4" />
              Voir le site
            </Link>
            <button
              onClick={() => { setEditProduct(null); setShowForm(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-deep text-white rounded-full text-sm font-medium hover:bg-plum transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nouveau produit
            </button>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-mauve rounded-full hover:bg-petal transition-colors border border-border"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-border">
              <span className="text-5xl block mb-4">💄</span>
              <p className="font-display italic text-xl text-mauve">Aucun produit pour l&apos;instant</p>
              <p className="text-sm text-mauve mt-1">Cliquez sur &quot;Nouveau produit&quot; pour commencer</p>
            </div>
          ) : (
            products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-petal flex items-center justify-center flex-shrink-0 text-2xl">
                    {product.category?.icon ?? '💄'}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-mauve uppercase tracking-widest">{product.brand}</p>
                  <p className="font-display text-base text-plum truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {product.category && (
                      <span className="text-xs bg-petal text-rose-dark px-2 py-0.5 rounded-full">
                        {product.category.name}
                      </span>
                    )}
                    {product.shades && product.shades.length > 0 && (
                      <span className="text-xs text-mauve">
                        {product.shades.length} teinte{product.shades.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {product.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-gold">
                        <Star className="w-3 h-3 fill-gold" />
                        {product.rating}/5
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(product)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-petal transition-colors text-mauve hover:text-rose-deep"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={isPending}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors text-mauve hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showForm && (
        <ProductForm
          categories={categories}
          product={editProduct ?? undefined}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
