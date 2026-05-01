'use client'

import { useState, useTransition, useMemo, useRef, lazy, Suspense } from 'react'
import { Plus, X, Upload, ScanBarcode, Loader2, ChevronUp, ChevronDown } from 'lucide-react'
import { createProduct, updateProduct, uploadImage } from '@/app/actions'
import type { Category, Product, Shade } from '@/lib/types'

const BarcodeScanner = lazy(() => import('@/components/BarcodeScanner'))

interface ShadeInput {
  name: string
  hex_color: string
}

interface Props {
  categories: Category[]
  brands: string[]
  product?: Product
  onClose: () => void
}

export default function ProductForm({ categories, brands, product, onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [shades, setShades] = useState<ShadeInput[]>(
    product?.shades?.map(s => ({ name: s.name, hex_color: s.hex_color ?? '#E8A4B8' })) ?? []
  )
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [productName, setProductName] = useState(product?.name ?? '')
  const [brand, setBrand] = useState(product?.brand ?? '')
  const [brandOpen, setBrandOpen] = useState(false)
  const brandRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLFormElement>(null)

  function scroll(dir: 'up' | 'down') {
    scrollRef.current?.scrollBy({ top: dir === 'down' ? 120 : -120, behavior: 'smooth' })
  }

  const filteredBrands = useMemo(
    () => brands.filter(b => b.toLowerCase().includes(brand.toLowerCase()) && b !== brand),
    [brands, brand]
  )

  const mainCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories])
  const selectedCategory = categories.find(c => c.id === categoryId)

  function getSubCategories(parentId: string) {
    return categories.filter(c => c.parent_id === parentId)
  }

  async function handleBarcodeDetected(barcode: string) {
    setScanning(false)
    setLookingUp(true)
    try {
      const res = await fetch(`https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`)
      const data = await res.json()
      if (data.status === 1) {
        const p = data.product
        const name = p.product_name_fr || p.product_name || ''
        const b = p.brands?.split(',')[0]?.trim() || ''
        if (name) setProductName(name)
        if (b) setBrand(b)
        if (!name && !b) setError('Produit trouvé mais sans nom — remplis manuellement.')
      } else {
        setError('Produit non trouvé dans la base Open Beauty Facts.')
      }
    } catch {
      setError('Erreur lors de la recherche du produit.')
    } finally {
      setLookingUp(false)
    }
  }

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

  function addShade() { setShades(prev => [...prev, { name: '', hex_color: '#E8A4B8' }]) }
  function removeShade(i: number) { setShades(prev => prev.filter((_, idx) => idx !== i)) }
  function updateShade(i: number, field: keyof ShadeInput, value: string) {
    setShades(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('name', productName)
    formData.set('brand', brand)
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
    <>
      {scanning && (
        <Suspense fallback={null}>
          <BarcodeScanner
            onDetected={handleBarcodeDetected}
            onClose={() => setScanning(false)}
          />
        </Suspense>
      )}

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-plum/40 backdrop-blur-sm" />
        <div
          className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <h2 className="font-display text-lg text-plum">
              {product ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-petal transition-colors">
              <X className="w-4 h-4 text-mauve" />
            </button>
          </div>

          {/* Boutons scroll mobile — cachés sur desktop */}
          <div className="sm:hidden absolute right-3 bottom-24 z-10 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => scroll('up')}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-border text-mauve active:scale-95 transition-transform"
              aria-label="Remonter"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('down')}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-border text-mauve active:scale-95 transition-transform"
              aria-label="Descendre"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <form ref={scrollRef} onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 pb-20 sm:pb-6">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-mauve uppercase tracking-widest">Nom *</label>
                  <button
                    type="button"
                    onClick={() => setScanning(true)}
                    disabled={lookingUp}
                    className="flex items-center gap-1 text-xs text-rose-deep hover:text-plum transition-colors disabled:opacity-50"
                  >
                    {lookingUp ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Recherche...</>
                    ) : (
                      <><ScanBarcode className="w-3.5 h-3.5" /> Scanner le code-barre</>
                    )}
                  </button>
                </div>
                <input
                  name="name"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                  placeholder="Nom du produit"
                />
              </div>
              <div className="relative" ref={brandRef}>
                <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Marque *</label>
                <input
                  name="brand"
                  value={brand}
                  onChange={e => { setBrand(e.target.value); setBrandOpen(true) }}
                  onFocus={() => setBrandOpen(true)}
                  onBlur={() => setTimeout(() => setBrandOpen(false), 150)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                  placeholder="Charlotte Tilbury..."
                  autoComplete="off"
                />
                {brandOpen && filteredBrands.length > 0 && (
                  <ul className="absolute z-50 w-full mt-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {filteredBrands.map(b => (
                      <li
                        key={b}
                        onMouseDown={() => { setBrand(b); setBrandOpen(false) }}
                        className="px-4 py-2.5 text-sm text-plum hover:bg-petal cursor-pointer transition-colors"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
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
                  {mainCategories.map(main => {
                    const subs = getSubCategories(main.id)
                    if (subs.length === 0) {
                      return <option key={main.id} value={main.id}>{main.icon} {main.name}</option>
                    }
                    return (
                      <optgroup key={main.id} label={`${main.icon} ${main.name}`}>
                        {subs.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.icon} {sub.name}</option>
                        ))}
                      </optgroup>
                    )
                  })}
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
                  <img src={imageUrl} alt="preview" className="w-full h-40 object-contain rounded-xl bg-petal" />
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
                  <button type="button" onClick={addShade} className="flex items-center gap-1 text-xs text-rose-deep hover:text-plum transition-colors">
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
    </>
  )
}
