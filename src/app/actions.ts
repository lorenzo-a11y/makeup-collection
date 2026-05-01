'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Shade } from '@/lib/types'

export async function login(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  revalidatePath('/admin')
  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/')
  redirect('/')
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const shadesJson = formData.get('shades') as string
  const shades: Pick<Shade, 'name' | 'hex_color'>[] = shadesJson ? JSON.parse(shadesJson) : []
  const priceRaw = formData.get('price') as string
  const ratingRaw = formData.get('rating') as string

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: formData.get('name') as string,
      brand: formData.get('brand') as string,
      category_id: formData.get('category_id') as string,
      description: (formData.get('description') as string) || null,
      image_url: (formData.get('image_url') as string) || null,
      price: priceRaw ? parseFloat(priceRaw) : null,
      rating: ratingRaw ? parseInt(ratingRaw) : null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  if (shades.length > 0) {
    await supabase.from('shades').insert(
      shades.map(s => ({ product_id: product.id, name: s.name, hex_color: s.hex_color }))
    )
  }

  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const shadesJson = formData.get('shades') as string
  const shades: Pick<Shade, 'name' | 'hex_color'>[] = shadesJson ? JSON.parse(shadesJson) : []
  const priceRaw = formData.get('price') as string
  const ratingRaw = formData.get('rating') as string

  const { error } = await supabase
    .from('products')
    .update({
      name: formData.get('name') as string,
      brand: formData.get('brand') as string,
      category_id: formData.get('category_id') as string,
      description: (formData.get('description') as string) || null,
      image_url: (formData.get('image_url') as string) || null,
      price: priceRaw ? parseFloat(priceRaw) : null,
      rating: ratingRaw ? parseInt(ratingRaw) : null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  await supabase.from('shades').delete().eq('product_id', id)
  if (shades.length > 0) {
    await supabase.from('shades').insert(
      shades.map(s => ({ product_id: id, name: s.name, hex_color: s.hex_color }))
    )
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/collections')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  await supabase.from('shades').delete().eq('product_id', id)
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/collections')
  return { success: true }
}

export async function toggleFavorite(id: string, value: boolean) {
  const supabase = await createClient()
  await supabase.from('products').update({ is_favorite: value }).eq('id', id)
  revalidatePath('/')
}

export async function toggleVoyage(id: string, value: boolean) {
  const supabase = await createClient()
  await supabase.from('products').update({ in_voyage: value }).eq('id', id)
  revalidatePath('/')
  revalidatePath('/voyage')
}

export async function clearVoyage() {
  const supabase = await createClient()
  await supabase.from('products').update({ in_voyage: false }).eq('in_voyage', true)
  revalidatePath('/')
  revalidatePath('/voyage')
}

export async function toggleEmpty(id: string, value: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }
  await supabase.from('products').update({ is_empty: value }).eq('id', id)
  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

export async function uploadImage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const file = formData.get('file') as File
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, file, { contentType: file.type })

  if (error) return { error: error.message }

  const { data } = supabase.storage.from('product-images').getPublicUrl(filename)
  return { url: data.publicUrl }
}

// ─── Collections ──────────────────────────────────────────────

export async function createCollection(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const { data, error } = await supabase
    .from('collections')
    .insert({
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      cover_image_url: (formData.get('cover_image_url') as string) || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  const productIds: string[] = JSON.parse((formData.get('product_ids') as string) || '[]')
  if (productIds.length > 0) {
    await supabase.from('collection_products').insert(
      productIds.map(pid => ({ collection_id: data.id, product_id: pid }))
    )
  }

  revalidatePath('/collections')
  revalidatePath('/admin')
  return { success: true }
}

export async function updateCollection(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const { error } = await supabase
    .from('collections')
    .update({
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      cover_image_url: (formData.get('cover_image_url') as string) || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  const productIds: string[] = JSON.parse((formData.get('product_ids') as string) || '[]')
  await supabase.from('collection_products').delete().eq('collection_id', id)
  if (productIds.length > 0) {
    await supabase.from('collection_products').insert(
      productIds.map(pid => ({ collection_id: id, product_id: pid }))
    )
  }

  revalidatePath('/collections')
  revalidatePath(`/collections/${id}`)
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteCollection(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const { error } = await supabase.from('collections').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/collections')
  revalidatePath('/admin')
  return { success: true }
}
