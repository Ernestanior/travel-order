import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

interface BookingInvoiceData {
  bookingNumber: string
  date: string
  customerName: string
  address: string
  tel: string
  tourCode: string
  tour: string
  departureDate: string
  departureTime: string
  departureFlight: string
  departureDest: string
  departureDate2?: string
  departureTime2?: string
  departureFlight2?: string
  departureDest2?: string
  arrivalDate: string
  arrivalTime: string
  arrivalFlight: string
  arrivalDest: string
  arrivalDate2?: string
  arrivalTime2?: string
  arrivalFlight2?: string
  arrivalDest2?: string
  staff: string
  special?: string
  includeTerms?: boolean
  items: Array<{
    item: string
    quantity: number
    unitPrice: number
    price: number
  }>
  passengers: Array<{
    name: string
    passport: string
  }>
  totalPrice: number
  discount: number
  payment: number
  balance: number
}

interface ExchangeInvoiceData {
  exchangeNumber: string
  bookingNumber: string
  date: string
  supplier: string
  customer: string
  tourCode: string
  tour: string
  departureDate: string
  departureTime: string
  departureFlight: string
  departureDest: string
  arrivalDate: string
  arrivalTime: string
  arrivalFlight: string
  arrivalDest: string
  items: Array<{
    item: string
    quantity: number
    unitPrice: number
    price: number
  }>
  totalPrice: number
  discount: number
  payment: number
  balance: number
}

interface ReceiptInvoiceData {
  receiptNo: string
  bookingNumber: string
  date: string
  customer: string
  paymentType: string
  for: string
  amount: number
  chequeNo?: string
  visaNo?: string
  paidText: string
}

interface OutstandingReportData {
  beforeDate: string
  orders: Array<{
    bookingNumber: string
    date: string
    customer: string
    staff: string
    outstandingAmount: number
  }>
  totalOutstanding: number
}

// 加载Terms & Conditions图片为base64
async function loadTermsImageAsBase64(): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = function() {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg'))
      } else {
        resolve('')
      }
    }
    img.onerror = function() {
      console.error('Error loading terms image')
      resolve('')
    }
    img.src = '/images/terms-and-conditions.jpg'
  })
}

// 加载logo图片为base64
async function loadLogoAsBase64(): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = function() {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg'))
      } else {
        resolve('')
      }
    }
    img.onerror = function() {
      console.error('Error loading logo')
      resolve('')
    }
    img.src = '/images/travel_logo.jpg'
  })
}

export async function generateBookingInvoicePDF(data: BookingInvoiceData) {
  const doc = new jsPDF()
  
  // 加载logo
  const logoBase64 = await loadLogoAsBase64()
  
  // 公司信息
  const companyInfo = {
    name: 'TRAVEL GSH PTE LTD',
    address: '101 Upper Cross Street, People\'s Park Centre',
    address2: '#B1-17M Singapore 058357',
    phone: 'Tel: +65 63569300',
    email: 'Email: jessie@travelgsh.com',
    gst: 'GST/Co. Reg No: 199205400K'
  }
  
  // Logo (左上角)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 15, 10, 35, 35)
    } catch (error) {
      console.error('Error adding logo to PDF:', error)
    }
  }
  
  // 公司信息 (logo右边)
  const textStartX = logoBase64 ? 55 : 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(companyInfo.name, textStartX, 18)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(companyInfo.address, textStartX, 24)
  doc.text(companyInfo.address2, textStartX, 28)
  doc.text(companyInfo.phone + ' | ' + companyInfo.email, textStartX, 32)
  doc.text(companyInfo.gst, textStartX, 36)
  
  // BOOKING INVOICE 标题 (右上角)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('BOOKING INVOICE', 200, 20, { align: 'right' })
  
  // Invoice Number and Date (右上角)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice Number: ${data.bookingNumber}`, 200, 28, { align: 'right' })
  doc.text(`Date: ${data.date}`, 200, 34, { align: 'right' })
  
  let y = 50
  
  // Bill To
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', 15, y)
  doc.setFont('helvetica', 'normal')
  y += 5
  doc.text(data.customerName, 15, y)
  y += 5
  if (data.address) {
    doc.text(`Address: ${data.address}`, 15, y)
  }
  y += 5
  doc.text(`Telephone: ${data.tel}`, 15, y)
  
  y += 10
  
  // Tour Information
  doc.setFont('helvetica', 'bold')
  doc.text('Tour Information:', 15, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`Tour: ${data.tour || 'N/A'}`, 15, y)
  
  y += 10
  
  // Flight Information Box
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  const boxY = y
  const boxHeight = 25
  doc.rect(15, boxY, 180, boxHeight)
  
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Departure Date 1:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.departureDate || '-', 60, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Time 1:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.departureTime || '-', 40, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Flight 1:', 80, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.departureFlight || '-', 100, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Destination 1:', 130, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.departureDest || '-', 160, y)
  
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Arrival Date 1:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.arrivalDate || '-', 60, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Time 1:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.arrivalTime || '-', 40, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Flight 1:', 80, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.arrivalFlight || '-', 100, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Destination 1:', 130, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.arrivalDest || '-', 160, y)
  
  y = boxY + boxHeight + 10
  
  // Items Table
  const itemRows = data.items.map(item => [
    item.item,
    item.quantity.toString(),
    `$${item.unitPrice.toFixed(2)}`,
    `$${item.price.toFixed(2)}`
  ])
  
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Quantity', 'Price', 'Amount']],
    body: itemRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [100, 100, 100],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' }
    }
  })
  
  y = (doc as any).lastAutoTable.finalY + 10
  
  // Passengers Table
  if (data.passengers.length > 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Passengers:', 15, y)
    y += 5
    
    const passengerRows = data.passengers.map(p => [p.name, p.passport || '-'])
    autoTable(doc, {
      startY: y,
      head: [['Name', 'Passport']],
      body: passengerRows,
      theme: 'grid',
      headStyles: { 
        fillColor: [100, 100, 100],
        fontSize: 9,
        fontStyle: 'bold'
      },
      styles: { fontSize: 9 }
    })
    
    y = (doc as any).lastAutoTable.finalY + 10
  }
  
  // Special Instruction (如果有)
  if (data.special && data.special.trim()) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Special Instruction:', 15, y)
    y += 5
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    // 处理多行文本
    const specialLines = doc.splitTextToSize(data.special, 180)
    doc.text(specialLines, 15, y)
    
    y += (specialLines.length * 5) + 10
  }
  
  // Notes Section (左下角)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Notes', 15, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text('Bank: Maybank', 15, y)
  y += 4
  doc.text('Name: TRAVEL GSH PTE LTD Pte Ltd', 18, y)
  y += 4
  doc.text('Account: 0417-100-3306', 15, y)
  y += 4
  doc.text('Paynow : UEN 199540', 15, y)
  
  // Financial Summary (右下角)
  const rightX = 140
  let summaryY = (doc as any).lastAutoTable.finalY + 10
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Total Price:', rightX, summaryY)
  doc.text(`$${data.totalPrice.toFixed(2)}`, 190, summaryY, { align: 'right' })
  
  summaryY += 5
  doc.text('Discount:', rightX, summaryY)
  doc.text(`$${data.discount.toFixed(2)}`, 190, summaryY, { align: 'right' })
  
  summaryY += 5
  doc.text('Payment:', rightX, summaryY)
  doc.text(`$${data.payment.toFixed(2)}`, 190, summaryY, { align: 'right' })
  
  summaryY += 5
  doc.text('Balance:', rightX, summaryY)
  doc.text(`$${data.balance.toFixed(2)}`, 190, summaryY, { align: 'right' })
  
  // Attended By (底部)
  y += 20
  if (y > 270) {
    doc.addPage()
    y = 20
  }
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Attended By:', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.staff || 'N/A', 50, y)
  
  // Terms & Conditions (如果开关开启)
  if (data.includeTerms) {
    // 添加新页面用于 Terms & Conditions
    doc.addPage()
    
    let tcY = 15
    const leftMargin = 15
    const rightMargin = 195
    const col1Width = 65
    const col2Width = 60
    const col3Width = 55
    
    // 标题
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('TERMS & CONDITIONS', 105, tcY, { align: 'center' })
    
    tcY += 12
    
    // 左栏 - TRAVEL DOCUMENTS
    let leftY = tcY
    const col1X = leftMargin
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('TRAVEL DOCUMENTS', col1X, leftY)
    
    leftY += 5
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    
    const travelDocsText = `It is the passenger's responsibility to ensure that they have a valid international passport with the minimum six months validity from the date of departure. Our tour vouchers must be presented to the hotels and will be endorsed on the passport at the point of embarkation.

Relevant visas and vaccinations may be required. Ample times must be given to us for application of visas prior to departure. Please note that he issuance of visa is subject to approval by the respective foreign embassies and we will not be held responsible in the event of rejection.

You are responsible for your own eligibility of all permits for National Service including those who are on Reservist and National Servicemen.`
    
    const travelLines = doc.splitTextToSize(travelDocsText, col1Width)
    doc.text(travelLines, col1X, leftY)
    leftY += travelLines.length * 3.5
    
    leftY += 5
    
    // 中文段落占位
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    const chineseText = `[Chinese Text - Best viewed in image format]
Passport & visa requirements for smooth travel.
Tour vouchers must be presented to hotels.
Visas & vaccinations arranged in advance.
Non-refundable if visa rejected or entry denied.
Military personnel arrange own exit permits.`
    
    const chineseLines = doc.splitTextToSize(chineseText, col1Width)
    doc.text(chineseLines, col1X, leftY)
    leftY += chineseLines.length * 3.5
    
    leftY += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text('Yours faithfully,', col1X, leftY)
    leftY += 4
    doc.setFont('helvetica', 'bold')
    doc.text('Travel GSH Pte Ltd', col1X, leftY)
    
    // 中栏 - CANCELLATION CHARGE
    let midY = tcY
    const col2X = col1X + col1Width + 5
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('CANCELLATION CHARGE', col2X, midY)
    
    midY += 5
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    
    const cancellationText = `Once payment paid is non-refundable. Once ticket is issued 100% of the tour/ticket fare will be charged. During peak season, school holiday, eve and public holiday, no cancellation could be made. 100% of the tour price would be charged.

I/on behalf of the passengers at stated have read, understood and agreed to be bound by the Terms and Conditions printed overleaf. I undertake to bring the attention and notice of the above mentioned to the said Terms and Conditions.`
    
    const cancelLines = doc.splitTextToSize(cancellationText, col2Width)
    doc.text(cancelLines, col2X, midY)
    
    // 右栏 - Travel Insurance Question
    let rightY = tcY
    const col3X = col2X + col2Width + 5
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const questionLines = doc.splitTextToSize('Do you wish to purchase the travel insurance from us?', col3Width)
    doc.text(questionLines, col3X, rightY)
    rightY += questionLines.length * 4
    
    rightY += 3
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    
    // Checkbox 1
    doc.rect(col3X, rightY, 3, 3)
    doc.setFont('helvetica', 'bold')
    doc.text('Yes', col3X + 5, rightY + 2.5)
    doc.setFont('helvetica', 'normal')
    const option1 = doc.splitTextToSize('I wish to purchase such travel insurance through the travel agent.', col3Width - 6)
    doc.text(option1, col3X + 5, rightY + 6)
    rightY += 6 + (option1.length * 3.5)
    
    rightY += 3
    
    // Checkbox 2
    doc.rect(col3X, rightY, 3, 3)
    doc.setFont('helvetica', 'bold')
    doc.text('Yes', col3X + 5, rightY + 2.5)
    doc.setFont('helvetica', 'normal')
    const option2Text = `I wish to purchase such travel insurance myself with reference to the Board's list of insurers at
https://www.sib.gov.sg/business-focus-areas/general-insurance/documents/TravelInsurance.pdf`
    const option2 = doc.splitTextToSize(option2Text, col3Width - 6)
    doc.text(option2, col3X + 5, rightY + 6)
    rightY += 6 + (option2.length * 3)
    
    rightY += 3
    
    // Checkbox 3
    doc.rect(col3X, rightY, 3, 3)
    doc.setFont('helvetica', 'bold')
    doc.text('No', col3X + 5, rightY + 2.5)
    doc.setFont('helvetica', 'normal')
    const option3Text = `Reasons include "I will purchase such travel insurance later", "I have already purchased such travel insurance" or "I do not wish to be insured"`
    const option3 = doc.splitTextToSize(option3Text, col3Width - 6)
    doc.text(option3, col3X + 5, rightY + 6)
    
    // 底部签名栏
    const bottomY = 260
    doc.setLineWidth(0.5)
    doc.line(leftMargin, bottomY, 90, bottomY)
    doc.line(110, bottomY, rightMargin, bottomY)
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Authorised Signature', leftMargin, bottomY + 5)
    doc.text('Signature:', 110, bottomY + 5)
    doc.text('Date:', 170, bottomY + 5)
    
    // 注释
    doc.setFontSize(6)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 100, 100)
    doc.text('Note: Chinese characters displayed as placeholder. For perfect display, add image to /public/images/terms-and-conditions.jpg', leftMargin, 285)
    doc.setTextColor(0, 0, 0)
  }
  
  // Save
  doc.save(`Booking_Invoice_${data.bookingNumber}.pdf`)
}

export async function generateExchangeInvoicePDF(data: ExchangeInvoiceData) {
  const doc = new jsPDF()
  
  // 加载logo
  const logoBase64 = await loadLogoAsBase64()
  
  // 公司信息
  const companyInfo = {
    name: 'TRAVEL GSH PTE LTD',
    address: '101 Upper Cross Street, People\'s Park Centre',
    address2: '#B1-17M Singapore 058357',
    phone: 'Tel: +65 63569300',
    email: 'Email: jessie@travelgsh.com',
    gst: 'GST/Co. Reg No: 199205400K'
  }
  
  // Logo (左上角)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 15, 10, 35, 35)
    } catch (error) {
      console.error('Error adding logo to PDF:', error)
    }
  }
  
  // 公司信息 (logo右边)
  const textStartX = logoBase64 ? 55 : 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(companyInfo.name, textStartX, 18)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(companyInfo.address, textStartX, 24)
  doc.text(companyInfo.address2, textStartX, 28)
  doc.text(companyInfo.phone + ' | ' + companyInfo.email, textStartX, 32)
  doc.text(companyInfo.gst, textStartX, 36)
  
  // EXCHANGE ORDER INVOICE 标题 (右上角)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('EXCHANGE ORDER INVOICE', 200, 20, { align: 'right' })
  
  // Invoice Number and Date (右上角)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Exchange #: ${data.exchangeNumber}`, 200, 28, { align: 'right' })
  doc.text(`Booking #: ${data.bookingNumber}`, 200, 34, { align: 'right' })
  doc.text(`Date: ${data.date}`, 200, 40, { align: 'right' })
  
  let y = 50
  
  // Supplier and Customer Info
  doc.setFont('helvetica', 'bold')
  doc.text('Supplier:', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.supplier, 50, y)
  
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Customer:', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.customer, 50, y)
  
  y += 10
  
  // Tour Information
  doc.setFont('helvetica', 'bold')
  doc.text('Tour Information:', 15, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`Tour: ${data.tour || 'N/A'}`, 15, y)
  
  y += 10
  
  // Flight Information Box
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  const boxY = y
  const boxHeight = 20
  doc.rect(15, boxY, 180, boxHeight)
  
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Departure Date:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.departureDate || '-', 60, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Time:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.departureTime || '-', 40, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Flight:', 80, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.departureFlight || '-', 100, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Destination:', 130, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.departureDest || '-', 160, y)
  
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Arrival Date:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.arrivalDate || '-', 60, y)
  
  y = boxY + boxHeight + 10
  
  // Items Table
  const itemRows = data.items.map(item => [
    item.item,
    item.quantity.toString(),
    `$${item.unitPrice.toFixed(2)}`,
    `$${item.price.toFixed(2)}`
  ])
  
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Quantity', 'Price', 'Amount']],
    body: itemRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [100, 100, 100],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' }
    }
  })
  
  y = (doc as any).lastAutoTable.finalY + 10
  
  // Notes Section (左下角)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Notes', 15, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text('Bank: Maybank', 15, y)
  y += 4
  doc.text('Name: TRAVEL GSH PTE LTD Pte Ltd', 18, y)
  y += 4
  doc.text('Account: 0417-100-3306', 15, y)
  y += 4
  doc.text('Paynow : UEN 199540', 15, y)
  
  // Financial Summary (右下角)
  const rightX = 140
  let summaryY = (doc as any).lastAutoTable.finalY + 10
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Total:', rightX, summaryY)
  doc.text(`$${data.totalPrice.toFixed(2)}`, 190, summaryY, { align: 'right' })
  
  doc.save(`Exchange_Invoice_${data.exchangeNumber}.pdf`)
}

export async function generateReceiptPDF(data: ReceiptInvoiceData) {
  const doc = new jsPDF()
  
  // 加载logo
  const logoBase64 = await loadLogoAsBase64()
  
  // 公司信息
  const companyInfo = {
    address: '101 Upper Cross Street, People\'s Park Centre',
    address2: 'B1-17M Singapore 058357',
    phone: 'Tel: +65 63569300',
    email: 'Email: jessie@travelgsh.com',
    gst: 'GST/Co. Reg No: 199205400K'
  }
  
  // Logo (左上角)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 20, 15, 40, 40)
    } catch (error) {
      console.error('Error adding logo to PDF:', error)
    }
  }
  
  // 公司信息 (logo右边)
  const textStartX = logoBase64 ? 65 : 20
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(companyInfo.address, textStartX, 20)
  doc.text(companyInfo.address2, textStartX, 25)
  doc.text(companyInfo.phone + ' | ' + companyInfo.email, textStartX, 30)
  doc.text(companyInfo.gst, textStartX, 35)
  
  // Payment Receipt 标题
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Payment Receipt', 20, 70)
  
  // Receipt details
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Receipt No : ${data.receiptNo}`, 20, 80)
  doc.text(`Booking No: ${data.bookingNumber}`, 20, 87)
  doc.text(`Date  :  ${data.date}`, 20, 94)
  
  // 横线
  doc.setLineWidth(0.5)
  doc.line(20, 100, 190, 100)
  
  let y = 115
  
  // Payment details
  doc.setFont('helvetica', 'bold')
  doc.text('Received From', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`: ${data.customer}`, 60, y)
  
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Payment For', 20, y)
  doc.setFont('helvetica', 'normal')
  const paymentFor = data.for || 'Tour'
  doc.text(`: ${paymentFor}`, 60, y)
  
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Departure Date', 20, y)
  doc.setFont('helvetica', 'normal')
  // Try to extract date from "for" field, otherwise use booking date
  const departureMatch = data.for ? data.for.match(/\d{2}-\d{2}-\d{4}/) : null
  const departureDate = departureMatch ? departureMatch[0] : (data.date || '-')
  doc.text(`: ${departureDate}`, 60, y)
  
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Payment Type', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`: ${data.paymentType}`, 60, y)
  
  y += 25
  
  // Amount Paid Box
  doc.setLineWidth(2)
  doc.rect(20, y, 170, 30)
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Amount Paid:', 25, y + 18)
  
  doc.setFontSize(18)
  doc.text(`$${data.amount.toFixed(2)}`, 185, y + 18, { align: 'right' })
  
  y += 45
  
  // Thank you message
  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  doc.text('Thank you for your payment', 105, y, { align: 'center' })
  
  doc.save(`Receipt_${data.receiptNo}.pdf`)
}

export async function generateOutstandingReportPDF(data: OutstandingReportData) {
  const doc = new jsPDF()
  
  // Set up the document
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  
  // Title
  const title = `Booking Report Before This Date    ${data.beforeDate}`
  doc.text(title, 105, 20, { align: 'center' })
  
  // Prepare table data
  const tableRows = data.orders.map(order => [
    order.bookingNumber,
    order.date,
    order.customer,
    order.staff,
    `$${order.outstandingAmount.toFixed(2)}`
  ])
  
  // Add table
  autoTable(doc, {
    startY: 35,
    head: [['Booking', 'Date', 'Customer', 'Handling Staff', 'Outstanding Amount']],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      fontSize: 10
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'left' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 60, halign: 'left' },
      3: { cellWidth: 35, halign: 'center' },
      4: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 15, right: 15 }
  })
  
  // Add total at the bottom
  const finalY = (doc as any).lastAutoTable.finalY + 10
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL :', 105, finalY, { align: 'center' })
  doc.text(`$${data.totalOutstanding.toFixed(2)}`, 150, finalY, { align: 'right' })
  
  // Save the PDF
  const formattedDate = data.beforeDate.replace(/\//g, '-')
  doc.save(`Outstanding_Report_Before_${formattedDate}.pdf`)
}
