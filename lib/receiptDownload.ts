'use client'

import { formatCurrency } from '@/lib/utils'
import type { AdminReceipt } from '@/app/admin/receipts/page'
import { getReceiptItems } from '@/app/admin/receipts/page'

/**
 * Renders an AdminReceipt to an in-memory high-DPI HTMLCanvasElement.
 */
export function renderReceiptToCanvas(receipt: AdminReceipt): HTMLCanvasElement {
  const scale = 2 // 2x retina
  const width = 740 * scale

  const items = getReceiptItems(receipt).filter((it) => it.enabled !== false)
  const hasNotes = Boolean(receipt.notes && receipt.notes.trim())

  // Dynamic height calculation
  const baseHeight = 390 + items.length * 36 + (hasNotes ? 65 : 0)
  const height = Math.round(baseHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  // Fill white background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)

  const padX = 32 * scale
  const rightX = width - padX
  let currY = 30 * scale

  // Helper for rounded rectangle
  const drawRoundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill?: string,
    stroke?: string,
    strokeWidth = 1 * scale
  ) => {
    ctx.beginPath()
    if (typeof (ctx as any).roundRect === 'function') {
      ;(ctx as any).roundRect(x, y, w, h, r)
    } else {
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
    }
    if (fill) {
      ctx.fillStyle = fill
      ctx.fill()
    }
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = strokeWidth
      ctx.stroke()
    }
  }

  // Helper for drawing status pills
  const drawPill = (
    centerX: number,
    centerY: number,
    text: string,
    bgColor: string,
    borderColor: string,
    textColor: string
  ) => {
    ctx.font = `bold ${10 * scale}px system-ui, -apple-system, sans-serif`
    const metrics = ctx.measureText(text)
    const tw = metrics.width
    const th = 12 * scale
    const pw = 9 * scale
    const ph = 4 * scale
    const x0 = centerX - tw / 2 - pw
    const y0 = centerY - th / 2 - ph
    const x1 = tw + pw * 2
    const y1 = th + ph * 2

    drawRoundRect(x0, y0, x1, y1, y1 / 2, bgColor, borderColor, 1 * scale)

    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, centerX, centerY)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
  }

  // 1. Header (Branding & Receipt #)
  // Logo icon
  drawRoundRect(padX, currY, 32 * scale, 32 * scale, 8 * scale, '#1B2A4A')
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${14 * scale}px system-ui, -apple-system, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('SD', padX + 16 * scale, currY + 16 * scale)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  // Brand text
  ctx.font = `bold ${18 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#1B2A4A'
  ctx.fillText('SourceDelivery', padX + 40 * scale, currY + 18 * scale)
  const sdw = ctx.measureText('SourceDelivery').width
  ctx.fillStyle = '#6B2737'
  ctx.fillText('Pro', padX + 40 * scale + sdw, currY + 18 * scale)

  ctx.font = `normal ${11 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#64748B'
  ctx.fillText('Commercial Freight Billing & Electronic Clearing Statement', padX + 40 * scale, currY + 32 * scale)

  // Official Receipt label and Number
  ctx.font = `bold ${10 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#94A3B8'
  const offLbl = 'OFFICIAL RECEIPT'
  const offW = ctx.measureText(offLbl).width
  ctx.fillText(offLbl, rightX - offW, currY + 10 * scale)

  ctx.font = `bold ${15 * scale}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  ctx.fillStyle = '#1B2A4A'
  const numW = ctx.measureText(receipt.receiptNumber).width
  ctx.fillText(receipt.receiptNumber, rightX - numW, currY + 28 * scale)

  // Status Badge
  const st = receipt.status || 'PAID'
  const isPaid = st === 'PAID'
  drawPill(
    rightX - 26 * scale,
    currY + 44 * scale,
    st,
    isPaid ? '#D1FAE5' : st === 'PARTIALLY_PAID' ? '#FEF3C7' : '#FFE4E6',
    isPaid ? '#86EFAC' : st === 'PARTIALLY_PAID' ? '#FCD34D' : '#FDA4AF',
    isPaid ? '#065F46' : st === 'PARTIALLY_PAID' ? '#92400E' : '#9F1239'
  )

  currY += 60 * scale
  // Divider line
  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 1 * scale
  ctx.beginPath()
  ctx.moveTo(padX, currY)
  ctx.lineTo(rightX, currY)
  ctx.stroke()

  currY += 18 * scale

  // 2. Billing & Telemetry Cards
  const cardGap = 16 * scale
  const cardW = (rightX - padX - cardGap) / 2
  const cardH = 100 * scale

  // Left card: Customer
  drawRoundRect(padX, currY, cardW, cardH, 14 * scale, '#F8FAFC', '#F1F5F9', 1 * scale)
  const cPad = 14 * scale
  ctx.font = `bold ${10 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#94A3B8'
  ctx.fillText('BILLED TO (CUSTOMER)', padX + cPad, currY + 20 * scale)

  ctx.font = `bold ${14 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#1B2A4A'
  ctx.fillText(receipt.customerName || 'Direct Shipper', padX + cPad, currY + 40 * scale)

  ctx.font = `normal ${12 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#475569'
  ctx.fillText(receipt.customerEmail || 'customer@sourcedeliverypro.com', padX + cPad, currY + 60 * scale)

  ctx.fillStyle = '#94A3B8'
  ctx.fillText('Verified Logistics Customer', padX + cPad, currY + 80 * scale)

  // Right card: Telemetry
  const c2X = padX + cardW + cardGap
  drawRoundRect(c2X, currY, cardW, cardH, 14 * scale, '#F8FAFC', '#F1F5F9', 1 * scale)
  ctx.font = `bold ${10 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#94A3B8'
  ctx.fillText('CONSIGNMENT TELEMETRY', c2X + cPad, currY + 20 * scale)

  ctx.font = `normal ${12 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#475569'
  ctx.fillText('Tracking Number: ', c2X + cPad, currY + 38 * scale)
  const awbLblW = ctx.measureText('Tracking Number: ').width

  ctx.font = `bold ${12 * scale}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  ctx.fillStyle = '#6B2737'
  ctx.fillText(receipt.trackingNumber || 'N/A', c2X + cPad + awbLblW, currY + 38 * scale)

  ctx.font = `normal ${12 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#475569'
  ctx.fillText(`Payment Method: ${receipt.paymentMethod || 'Zelle Direct Transfer'}`, c2X + cPad, currY + 56 * scale)

  ctx.font = `normal ${12 * scale}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  ctx.fillText(`Tx Ref: ${receipt.paymentRef || 'N/A'}`, c2X + cPad, currY + 74 * scale)

  ctx.font = `normal ${12 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#94A3B8'
  ctx.fillText(`Date Issued: ${receipt.createdDate || 'Recent'}`, c2X + cPad, currY + 90 * scale)

  currY += cardH + 22 * scale

  // 3. Line Items Table
  const tblLeft = padX
  const tblAmtRight = rightX - 85 * scale
  const tblStCenter = rightX - 38 * scale

  // Header
  ctx.font = `bold ${10 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#64748B'
  ctx.fillText('DESCRIPTION & FREIGHT BREAKDOWN', tblLeft, currY)

  const hdrAmt = 'AMOUNT (USD)'
  const hdrAmtW = ctx.measureText(hdrAmt).width
  ctx.fillText(hdrAmt, tblAmtRight - hdrAmtW, currY)

  const hdrSt = 'STATUS'
  const hdrStW = ctx.measureText(hdrSt).width
  ctx.fillText(hdrSt, tblStCenter - hdrStW / 2, currY)

  currY += 16 * scale
  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 1 * scale
  ctx.beginPath()
  ctx.moveTo(padX, currY)
  ctx.lineTo(rightX, currY)
  ctx.stroke()

  currY += 10 * scale

  // Rows
  let computedSum = 0
  for (const it of items) {
    const rowCenterY = currY + 11 * scale
    const isItemPaid = (it.status || 'PAID') === 'PAID'
    computedSum += Number(it.amount) || 0

    ctx.font = `normal ${12 * scale}px system-ui, -apple-system, sans-serif`
    ctx.fillStyle = '#334155'
    ctx.fillText(it.description, tblLeft, currY + 14 * scale)

    ctx.font = `500 ${13 * scale}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
    ctx.fillStyle = '#1E293B'
    const amtText = formatCurrency(it.amount)
    const amtW = ctx.measureText(amtText).width
    ctx.fillText(amtText, tblAmtRight - amtW, currY + 14 * scale)

    drawPill(
      tblStCenter,
      rowCenterY,
      isItemPaid ? 'Paid' : 'Not Paid',
      isItemPaid ? '#D1FAE5' : '#FFE4E6',
      isItemPaid ? '#86EFAC' : '#FDA4AF',
      isItemPaid ? '#065F46' : '#9F1239'
    )

    currY += 28 * scale
    ctx.strokeStyle = '#F1F5F9'
    ctx.lineWidth = 1 * scale
    ctx.beginPath()
    ctx.moveTo(padX, currY)
    ctx.lineTo(rightX, currY)
    ctx.stroke()

    currY += 8 * scale
  }

  // Table Total Footer
  currY += 2 * scale
  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 2 * scale
  ctx.beginPath()
  ctx.moveTo(padX, currY)
  ctx.lineTo(rightX, currY)
  ctx.stroke()

  currY += 16 * scale
  const footCenterY = currY + 10 * scale

  ctx.font = `bold ${14 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#1B2A4A'
  ctx.fillText('Total Amount Paid', tblLeft, currY + 14 * scale)

  ctx.font = `bold ${16 * scale}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  ctx.fillStyle = '#059669'
  const totText = formatCurrency(receipt.total ?? computedSum)
  const totW = ctx.measureText(totText).width
  ctx.fillText(totText, tblAmtRight - totW, currY + 14 * scale)

  drawPill(
    tblStCenter,
    footCenterY,
    st,
    isPaid ? '#D1FAE5' : st === 'PARTIALLY_PAID' ? '#FEF3C7' : '#FFE4E6',
    isPaid ? '#86EFAC' : st === 'PARTIALLY_PAID' ? '#FCD34D' : '#FDA4AF',
    isPaid ? '#065F46' : st === 'PARTIALLY_PAID' ? '#92400E' : '#9F1239'
  )

  currY += 34 * scale

  // 4. Notes
  if (hasNotes) {
    currY += 10 * scale
    drawRoundRect(padX, currY, rightX - padX, 48 * scale, 10 * scale, '#F8FAFC', '#E2E8F0', 1 * scale)
    ctx.font = `bold ${10 * scale}px system-ui, -apple-system, sans-serif`
    ctx.fillStyle = '#334155'
    ctx.fillText('Special Operational Notes:', padX + 12 * scale, currY + 16 * scale)

    ctx.font = `normal ${11 * scale}px system-ui, -apple-system, sans-serif`
    ctx.fillStyle = '#475569'
    ctx.fillText(String(receipt.notes).slice(0, 110), padX + 12 * scale, currY + 34 * scale)

    currY += 58 * scale
  }

  // 5. Verification Footer
  currY += 14 * scale
  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 1 * scale
  ctx.beginPath()
  ctx.moveTo(padX, currY)
  ctx.lineTo(rightX, currY)
  ctx.stroke()

  currY += 20 * scale
  ctx.font = `bold ${11 * scale}px system-ui, -apple-system, sans-serif`
  ctx.fillStyle = '#047857'
  ctx.fillText('✓  Digitally Authenticated & Recorded in SourceDeliveryPro Ledger', padX, currY)

  return canvas
}

/**
 * Downloads the receipt as a high-resolution PNG image.
 */
export function downloadReceiptAsImage(receipt: AdminReceipt) {
  try {
    const canvas = renderReceiptToCanvas(receipt)
    const dataUrl = canvas.toDataURL('image/png')
    const filename = `Receipt-${receipt.receiptNumber || 'SDP'}.png`

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.error('Failed to download receipt as image:', err)
  }
}

/**
 * Encodes JPEG binary into standard PDF 1.4 stream structure.
 */
function buildPdfFromJpeg(jpegBuffer: Uint8Array, imgWidth: number, imgHeight: number): Uint8Array {
  // A4 page dimensions in points (72 points/inch)
  const pageWidth = 595.28
  const pageHeight = 841.89
  const margin = 36 // 0.5 inch margins
  const availWidth = pageWidth - margin * 2
  const availHeight = pageHeight - margin * 2

  const ratio = Math.min(availWidth / imgWidth, availHeight / imgHeight)
  const renderWidth = imgWidth * ratio
  const renderHeight = imgHeight * ratio

  const x = margin + (availWidth - renderWidth) / 2
  const y = pageHeight - margin - renderHeight

  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n`

  const streamContent = `q\n${renderWidth.toFixed(2)} 0 0 ${renderHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im1 Do\nQ\n`
  const obj4 = `4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}endstream\nendobj\n`

  const obj5Header = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBuffer.length} >>\nstream\n`
  const obj5Footer = '\nendstream\nendobj\n'

  const header = '%PDF-1.4\n'
  const offsets: number[] = []

  let currentOffset = header.length
  offsets.push(currentOffset)
  currentOffset += obj1.length

  offsets.push(currentOffset)
  currentOffset += obj2.length

  offsets.push(currentOffset)
  currentOffset += obj3.length

  offsets.push(currentOffset)
  currentOffset += obj4.length

  offsets.push(currentOffset)
  currentOffset += obj5Header.length + jpegBuffer.length + obj5Footer.length

  const xrefOffset = currentOffset

  let xref = 'xref\n0 6\n0000000000 65535 f \n'
  for (const off of offsets) {
    xref += String(off).padStart(10, '0') + ' 00000 n \n'
  }

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`

  const encoder = new TextEncoder()
  const pHeader = encoder.encode(header)
  const pObj1 = encoder.encode(obj1)
  const pObj2 = encoder.encode(obj2)
  const pObj3 = encoder.encode(obj3)
  const pObj4 = encoder.encode(obj4)
  const pObj5H = encoder.encode(obj5Header)
  const pObj5F = encoder.encode(obj5Footer)
  const pXref = encoder.encode(xref)
  const pTrailer = encoder.encode(trailer)

  const totalLen =
    pHeader.length +
    pObj1.length +
    pObj2.length +
    pObj3.length +
    pObj4.length +
    pObj5H.length +
    jpegBuffer.length +
    pObj5F.length +
    pXref.length +
    pTrailer.length

  const out = new Uint8Array(totalLen)
  let pos = 0

  const append = (buf: Uint8Array) => {
    out.set(buf, pos)
    pos += buf.length
  }

  append(pHeader)
  append(pObj1)
  append(pObj2)
  append(pObj3)
  append(pObj4)
  append(pObj5H)
  append(jpegBuffer)
  append(pObj5F)
  append(pXref)
  append(pTrailer)

  return out
}

/**
 * Downloads the receipt as a formatted PDF file.
 */
export async function downloadReceiptAsPdf(receipt: AdminReceipt): Promise<void> {
  try {
    const canvas = renderReceiptToCanvas(receipt)

    // Convert canvas to JPEG blob
    const jpegBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95)
    })

    if (!jpegBlob) {
      // Fallback: download as image if JPEG conversion fails
      downloadReceiptAsImage(receipt)
      return
    }

    const arrayBuffer = await jpegBlob.arrayBuffer()
    const jpegBytes = new Uint8Array(arrayBuffer)
    const pdfBytes = buildPdfFromJpeg(jpegBytes, canvas.width, canvas.height)

    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const filename = `Receipt-${receipt.receiptNumber || 'SDP'}.pdf`

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => URL.revokeObjectURL(url), 5000)
  } catch (err) {
    console.error('Failed to download receipt as PDF:', err)
  }
}

/**
 * Generates the receipt PDF as a Base64-encoded string (for email attachments).
 */
export async function generateReceiptPdfBase64(receipt: AdminReceipt): Promise<string | null> {
  try {
    const canvas = renderReceiptToCanvas(receipt)
    const jpegBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95)
    })
    if (!jpegBlob) return null

    const arrayBuffer = await jpegBlob.arrayBuffer()
    const jpegBytes = new Uint8Array(arrayBuffer)
    const pdfBytes = buildPdfFromJpeg(jpegBytes, canvas.width, canvas.height)

    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < pdfBytes.length; i += chunkSize) {
      const chunk = pdfBytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode.apply(null, chunk as unknown as number[])
    }
    return btoa(binary)
  } catch (err) {
    console.error('Failed to generate receipt PDF base64:', err)
    return null
  }
}
