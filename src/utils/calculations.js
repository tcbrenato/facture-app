export const calculateLine = (pu, qty) => {
  const price = parseFloat(pu) || 0
  const quantity = parseFloat(qty) || 0
  return price * quantity
}

export const calculateTotals = (lines, discount = 0, discountType = 'fixed', applyTVA = true) => {
  const subtotal = lines.reduce((sum, line) => {
    return sum + calculateLine(line.pu, line.qty)
  }, 0)

  let discountAmount = 0
  if (discountType === 'percent') {
    discountAmount = (subtotal * parseFloat(discount || 0)) / 100
  } else {
    discountAmount = parseFloat(discount || 0)
  }

  const totalHT = subtotal - discountAmount
  const tva = applyTVA ? totalHT * 0.18 : 0
  const totalTTC = totalHT + tva

  return {
    subtotal,
    discountAmount,
    totalHT,
    tva,
    totalTTC,
    applyTVA,
  }
}

export const formatCFA = (amount) => {
  const num = Math.round(parseFloat(amount) || 0)
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA'
}

export const formatNumber = (amount) => {
  const num = Math.round(parseFloat(amount) || 0)
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const generateDocNumber = (type, documents) => {
  const prefix = type === 'facture' ? 'FAC' : 'PF'
  const year = new Date().getFullYear()
  const existing = documents.filter((d) => d.type === type)
  const num = String(existing.length + 1).padStart(3, '0')
  return `${prefix}-${year}-${num}`
}