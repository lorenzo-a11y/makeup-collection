'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'

interface Props {
  onDetected: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let stopped = false

    async function start() {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        const back = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'))
        const deviceId = back?.deviceId ?? devices[0]?.deviceId

        if (!deviceId) {
          setError('Aucune caméra trouvée.')
          setLoading(false)
          return
        }

        await reader.decodeFromVideoDevice(deviceId, videoRef.current!, (result, err) => {
          if (stopped) return
          if (result) {
            stopped = true
            onDetected(result.getText())
          }
        })
        setLoading(false)
      } catch {
        setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
        setLoading(false)
      }
    }

    start()

    return () => {
      stopped = true
      BrowserMultiFormatReader.releaseAllStreams()
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <p className="text-white text-sm font-medium">Pointez vers le code-barre</p>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

        {/* Viseur */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-72 h-28">
            <div className="absolute inset-0 border-2 border-white/40 rounded-lg" />
            <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-rose rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-rose rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-rose rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-rose rounded-br-lg" />
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {error ? (
        <div className="p-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : (
        <p className="p-4 text-center text-white/50 text-xs">
          Codes EAN-13, UPC-A supportés
        </p>
      )}
    </div>
  )
}
