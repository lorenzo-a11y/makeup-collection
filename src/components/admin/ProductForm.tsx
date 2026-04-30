'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Upload } from 'lucide-react'
import { createProduct, updateProduct, uploadImage } from '@/app/actions'
import type { Category, Product, Shade } from '@/lib/types'

interface ShadeInput {
  name: string
  hex_color: string
}

interface Props {
  categories: Category[]
  product?: Product
  onClose: () => void
}

export default function ProductForm({ categories, product, onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [shades, setShades] = useState<ShadeInput[]>(
    product?.shades?.map(s => ({ name: s.name, hex_color: s.hex_color ?? '#E8A4B8' })) ?? []
  )
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')

  const selectedCategory = categories.find(c => c.id === categoryId)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const result = await uploadImage(fd)
    setUploading(false)
    if (result.error) setError(result.error)
    else setImageUrl(result.url ?? '')
  }

  function addShade() {
    setShades(prev => [...prev, { name: '', hex_color: '#E8A4B8' }])
  }

  function removeShade(i: number) {
    setShades(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateShade(i: number, field: keyof ShadeInput, value: string) {
    setShades(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('image_url', imageUrl)
    formData.set('shades', JSON.stringify(shades.filter(s => s.name.trim())))

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData)
      if (result?.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-plum/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-border flex items-center justify-between z-10">
          <h2 className="font-display text-lg text-plum">
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-petal transition-colors">
            <X className="w-4 h-4 text-mauve" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Nom *</label>
              <input
                name="name"
                defaultValue={product?.name}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                placeholder="Nom du produit"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Marque *</label>
              <input
                name="brand"
                defaultValue={product?.brand}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                placeholder="Charlotte Tilbury..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Catégorie *</label>
              <select
                name="category_id"
                value={categoryId}
                onChange={e => { setCategoryId(e.target.value); setShades([]) }}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 bg-white"
              >
                <option value="">Choisir...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Description</label>
            <textarea
              name="description"
              defaultValue={product?.description ?? ''}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 resize-none"
              placeholder="Notes, avis, comment l'utiliser..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Prix (€)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.price ?? ''}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                placeholder="29.90"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Note (1–5)</label>
              <select
                name="rating"
                defaultValue={product?.rating ?? ''}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 bg-white"
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{'⭐'.repeat(n)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Photo</label>
            <div className="space-y-2">
              {imageUrl && (
                <img src={imageUrl} alt="preview" className="w-full h-32 object-cover rounded-xl" />
              )}
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border hover:border-rose cursor-pointer transition-colors text-sm text-mauve hover:text-rose-deep">
                <Upload className="w-4 h-4" />
                {uploading ? 'Envoi en cours...' : 'Choisir une photo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          {selectedCategory?.has_shades && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-mauve uppercase tracking-widest">Teintes</label>
                <button
                  type="button"
                  onClick={addShade}
                  className="flex items-center gap-1 text-xs text-rose-deep hover:text-plum transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {shades.map((shade, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={shade.hex_color}
                      onChange={e => updateShade(i, 'hex_color', e.target.value)}
                      className="w-9 h-9 rounded-full border-2 border-border cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={shade.name}
                      onChange={e => updateShade(i, 'name', e.target.value)}
                      placeholder="Nom de la teinte"
                      className="flex-1 px-3 py-2 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                    />
                    <button type="button" onClick={() => removeShade(i)} className="text-mauve hover:text-rose-deep transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {shades.length === 0 && (
                  <p className="text-xs text-mauve italic">Aucune teinte — cliquez sur Ajouter</p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || uploading}
            className="w-full py-3 bg-rose-deep text-white rounded-2xl text-sm font-medium hover:bg-plum transition-colors disabled:opacity-60"
          >
            {isPending ? 'Enregistrement...' : product ? 'Mettre à jour' : 'Ajouter le produit'}
          </button>
        </form>
      </div>
    </div>
  )
}
