'use client'

import { useState, useTransition } from 'react'
import { X, Upload, Search } from 'lucide-react'
import { createCollection, updateCollection, uploadImage } from '@/app/actions'
import type { Collection, Product } from '@/lib/types'

interface Props {
  products: Product[]
  collection?: Collection
  onClose: () => void
}

export default function CollectionForm({ products, collection, onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [coverUrl, setCoverUrl] = useState(collection?.cover_image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(collection?.products?.map(p => p.id) ?? [])
  )

  const filtered = products.filter(p =>
    `${p.name} ${p.brand}`.toLowerCase().includes(search.toLowerCase())
  )

  function toggleProduct(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const result = await uploadImage(fd)
    setUploading(false)
    if (result.error) setError(result.error)
    else setCoverUrl(result.url ?? '')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('cover_image_url', coverUrl)
    formData.set('product_ids', JSON.stringify(Array.from(selectedIds)))

    startTransition(async () => {
      const result = collection
        ? await updateCollection(collection.id, formData)
        : await createCollection(formData)
      if (result?.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-plum/40 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <h2 className="font-display text-lg text-plum">
            {collection ? 'Modifier le look' : 'Nouveau look'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-petal transition-colors">
            <X className="w-4 h-4 text-mauve" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Nom du look *</label>
            <input
              name="name"
              defaultValue={collection?.name}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
              placeholder="Mon look soirée..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Description</label>
            <textarea
              name="description"
              defaultValue={collection?.description ?? ''}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 resize-none"
              placeholder="Pour les soirées romantiques..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Photo de couverture</label>
            {coverUrl && <img src={coverUrl} alt="cover" className="w-full h-32 object-cover rounded-xl bg-petal mb-2" />}
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border hover:border-rose cursor-pointer transition-colors text-sm text-mauve hover:text-rose-deep">
              <Upload className="w-4 h-4" />
              {uploading ? 'Envoi...' : 'Choisir une photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-mauve uppercase tracking-widest">
                Produits ({selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''})
              </label>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mauve" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose"
              />
            </div>
            <div className="max-h-52 overflow-y-auto space-y-1 rounded-xl border border-border p-2">
              {filtered.map(p => (
                <label key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-petal cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="accent-rose-deep"
                  />
                  {p.image_url
                    ? <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-8 h-8 rounded-lg bg-petal flex items-center justify-center flex-shrink-0 text-sm">{p.category?.icon ?? '💄'}</div>
                  }
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-plum truncate">{p.name}</span>
                    <span className="text-xs text-mauve">{p.brand}</span>
                  </span>
                </label>
              ))}
              {filtered.length === 0 && <p className="text-xs text-mauve text-center py-4">Aucun produit trouvé</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || uploading}
            className="w-full py-3 bg-rose-deep text-white rounded-2xl text-sm font-medium hover:bg-plum transition-colors disabled:opacity-60"
          >
            {isPending ? 'Enregistrement...' : collection ? 'Mettre à jour' : 'Créer le look'}
          </button>
        </form>
      </div>
    </div>
  )
}
