import jsPDF from 'jspdf'
import { formatCFA, formatNumber } from './calculations'

export const generatePDF = (doc, settings) => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 15
  let y = 0

  const bleu = [30, 58, 95]
  const bleuClair = [240, 245, 255]
  const gris = [100, 100, 100]
  const noir = [30, 30, 30]
  const blanc = [255, 255, 255]

  // ── HEADER ──────────────────────────────────────────
  pdf.setFillColor(...bleu)
  pdf.rect(0, 0, W, 40, 'F')

  if (settings.logo) {
    try {
      pdf.addImage(settings.logo, 'PNG', margin, 8, 30, 24)
    } catch {
      pdf.setTextColor(...blanc)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text(settings.companyName, margin, 22)
    }
  } else {
    pdf.setTextColor(...blanc)
    pdf.setFontSize(13)
    pdf.setFont('helvetica', 'bold')
    pdf.text(settings.companyName, margin, 18)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`IFU: ${settings.ifu}  |  RCCM: ${settings.rccm}`, margin, 25)
    pdf.text(`Tél: ${settings.phone}  |  ${settings.address}`, margin, 31)
  }

  const title = doc.type === 'facture' ? 'FACTURE' : 'PRO FORMA'
  pdf.setTextColor(...blanc)
  pdf.setFontSize(26)
  pdf.setFont('helvetica', 'bold')
  pdf.text(title, W - margin, 18, { align: 'right' })
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`N° ${doc.number}`, W - margin, 26, { align: 'right' })
  pdf.text(`Date : ${doc.date}`, W - margin, 32, { align: 'right' })
  pdf.text(`Validité : ${doc.validity} jours`, W - margin, 38, { align: 'right' })

  y = 48

  // ── ÉMETTEUR + CLIENT ────────────────────────────────
  pdf.setFillColor(...bleuClair)
  pdf.roundedRect(margin, y, 85, 38, 3, 3, 'F')
  pdf.setTextColor(...bleu)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text('ÉMETTEUR', margin + 4, y + 7)
  pdf.setTextColor(...noir)
  pdf.setFont('helvetica', 'normal')
  pdf.text(settings.companyName, margin + 4, y + 14)
  pdf.text(`IFU : ${settings.ifu}`, margin + 4, y + 20)
  pdf.text(`RCCM : ${settings.rccm}`, margin + 4, y + 26)
  pdf.text(`Tél : ${settings.phone}`, margin + 4, y + 32)

  pdf.setFillColor(...bleuClair)
  pdf.roundedRect(W - margin - 85, y, 85, 38, 3, 3, 'F')
  pdf.setTextColor(...bleu)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('CLIENT', W - margin - 81, y + 7)
  pdf.setTextColor(...noir)
  pdf.setFont('helvetica', 'normal')
  pdf.text(doc.clientName || '—', W - margin - 81, y + 14)
  if (doc.clientAddress) pdf.text(doc.clientAddress, W - margin - 81, y + 20)
  if (doc.clientPhone) pdf.text(`Tél : ${doc.clientPhone}`, W - margin - 81, y + 26)
  if (doc.clientEmail) pdf.text(doc.clientEmail, W - margin - 81, y + 32)

  y += 46

  // ── TABLEAU ──────────────────────────────────────────
  const colWidths = [10, 85, 28, 18, 34]
  const colX = [margin]
  colWidths.forEach((w, i) => { if (i > 0) colX.push(colX[i - 1] + colWidths[i - 1]) })

  pdf.setFillColor(...bleu)
  pdf.rect(margin, y, W - margin * 2, 9, 'F')
  pdf.setTextColor(...blanc)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  const headers = ['N°', 'DÉSIGNATION', 'P.U (FCFA)', 'QTÉ', 'MONTANT (FCFA)']
  const aligns = ['center', 'left', 'right', 'center', 'right']
  headers.forEach((h, i) => {
    if (aligns[i] === 'center') pdf.text(h, colX[i] + colWidths[i] / 2, y + 6, { align: 'center' })
    else if (aligns[i] === 'right') pdf.text(h, colX[i] + colWidths[i] - 2, y + 6, { align: 'right' })
    else pdf.text(h, colX[i] + 2, y + 6)
  })

  y += 9

  pdf.setFont('helvetica', 'normal')
  doc.lines.forEach((line, index) => {
    if (!line.designation && !line.pu) return
    const rowH = 8
    const bg = index % 2 === 0 ? [255, 255, 255] : [248, 250, 252]
    pdf.setFillColor(...bg)
    pdf.rect(margin, y, W - margin * 2, rowH, 'F')
    pdf.setTextColor(...noir)
    pdf.setFontSize(8)

    const montant = (parseFloat(line.pu) || 0) * (parseFloat(line.qty) || 0)
    const vals = [
      String(index + 1),
      line.designation,
      formatNumber(parseFloat(line.pu) || 0),
      String(line.qty),
      formatNumber(montant),
    ]
    vals.forEach((v, i) => {
      if (aligns[i] === 'center') pdf.text(v, colX[i] + colWidths[i] / 2, y + 5.5, { align: 'center' })
      else if (aligns[i] === 'right') pdf.text(v, colX[i] + colWidths[i] - 2, y + 5.5, { align: 'right' })
      else pdf.text(v, colX[i] + 2, y + 5.5)
    })

    pdf.setDrawColor(220, 220, 220)
    pdf.line(margin, y + rowH, W - margin, y + rowH)
    y += rowH
  })

  y += 6

  // ── TOTAUX ───────────────────────────────────────────
  const totX = W - margin - 80
  const totW = 80

  const totLines = [
    { label: 'Sous-total', value: formatCFA(doc.subtotal) },
    ...(doc.discountAmount > 0
      ? [{ label: 'Remise', value: `- ${formatCFA(doc.discountAmount)}`, red: true }]
      : []),
    { label: 'Total HT', value: formatCFA(doc.totalHT) },
    ...(doc.applyTVA
      ? [{ label: 'TVA (18%)', value: formatCFA(doc.tva) }]
      : []),
  ]

  totLines.forEach((tl) => {
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    if (tl.red) {
      pdf.setTextColor(200, 50, 50)
    } else {
      pdf.setTextColor(...gris)
    }
    pdf.text(tl.label, totX + 2, y + 5)
    pdf.text(tl.value, totX + totW - 2, y + 5, { align: 'right' })
    y += 7
  })

  pdf.setFillColor(...bleu)
  pdf.roundedRect(totX, y, totW, 12, 2, 2, 'F')
  pdf.setTextColor(...blanc)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.text('TOTAL TTC', totX + 3, y + 8)
  pdf.text(formatCFA(doc.totalTTC), totX + totW - 3, y + 8, { align: 'right' })

  y += 20

  // ── MODALITÉS ────────────────────────────────────────
  pdf.setFillColor(...bleuClair)
  pdf.roundedRect(margin, y, 90, 22, 3, 3, 'F')
  pdf.setTextColor(...bleu)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text('MODALITÉS DE PAIEMENT', margin + 4, y + 7)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...noir)
  pdf.text('• 70% à la commande', margin + 4, y + 13)
  pdf.text('• 30% à la livraison', margin + 4, y + 19)

  if (doc.notes) {
    pdf.setTextColor(...gris)
    pdf.setFontSize(7.5)
    pdf.setFont('helvetica', 'italic')
    pdf.text(doc.notes, W - margin - 85, y + 7, { maxWidth: 85 })
  }

  y += 30

  // ── FOOTER ───────────────────────────────────────────
  pdf.setFillColor(...bleu)
  pdf.rect(0, 282, W, 15, 'F')
  pdf.setTextColor(...blanc)
  pdf.setFontSize(7.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text(
    `IFU : ${settings.ifu}  |  RCCM : ${settings.rccm}  |  Tél : ${settings.phone}  |  ${settings.address}`,
    W / 2, 291, { align: 'center' }
  )
  pdf.setFontSize(7)
  pdf.setTextColor(180, 200, 230)
  pdf.text(
    "Ce document est émis à titre informatif et ne constitue pas une facture définitive.",
    W / 2, 296, { align: 'center' }
  )

  pdf.save(`${doc.number}.pdf`)
}