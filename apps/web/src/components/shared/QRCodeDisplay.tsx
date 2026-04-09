'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface Props {
  value: string
  size?: number
}

export function QRCodeDisplay({ value, size = 320 }: Props) {
  const [dataUrl, setDataUrl] = useState<string>('')

  useEffect(() => {
    if (!value) return
    QRCode.toDataURL(value, { width: size, margin: 2 })
      .then(setDataUrl)
      .catch(console.error)
  }, [value, size])

  function handleDownload() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'session-qr.png'
    a.click()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {dataUrl ? (
        <img src={dataUrl} alt="QR 코드" width={size} height={size} />
      ) : (
        <div
          className="bg-gray-100 flex items-center justify-center text-gray-400 text-sm"
          style={{ width: size, height: size }}
        >
          QR 생성 중...
        </div>
      )}
      <button
        onClick={handleDownload}
        disabled={!dataUrl}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        PNG 다운로드
      </button>
    </div>
  )
}
