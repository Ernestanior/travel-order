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

// 加载logo图片为base64
async function getLogoBase64(): Promise<string> {
  try {
    // 在生产环境中，logo应该放在public文件夹
    // 这里我们使用一个简单的占位符
    return '' // 如果无法加载logo，返回空字符串
  } catch (error) {
    console.error('Error loading logo:', error)
    return ''
  }
}

export function generateBookingInvoicePDF(data: BookingInvoiceData) {
  const doc = new jsPDF()
  
  // 公司信息
  const companyInfo = {
    name: 'Travel GSH',
    address: '101 Upper Cross Street, People\'s Park Centre',
    address2: '#1-17V Singapore 058357',
    phone: 'Tel: +65 63569300',
    email: 'Email: jessie@travelgsh.com',
    gst: 'GST/Co. Reg No: 199205400K'
  }
  
  // Logo区域 (如果有logo)
  // doc.addImage(logoBase64, 'JPEG', 15, 10, 30, 30)
  
  // 公司信息 (左上角，logo旁边)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(companyInfo.name, 15, 15)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(companyInfo.address, 15, 21)
  doc.text(companyInfo.address2, 15, 26)
  doc.text(companyInfo.phone + ' | ' + companyInfo.email, 15, 31)
  doc.text(companyInfo.gst, 15, 36)
  
  // BOOKING INVOICE 标题 (右上角)
  doc.setFontSize(18)
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
    y += 5
  }
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
  
  // Notes Section (左下角)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Notes', 15, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text('Bank: Maybank', 15, y)
  y += 4
  doc.text('Name: Travel GSH Pte Ltd', 15, y)
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
  
  // Save
  doc.save(`Booking_Invoice_${data.bookingNumber}.pdf`)
}

export function generateExchangeInvoicePDF(data: ExchangeInvoiceData) {
  const doc = new jsPDF()
  
  // 类似的格式，但标题改为 EXCHANGE ORDER INVOICE
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('EXCHANGE ORDER INVOICE', 105, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Exchange #: ${data.exchangeNumber}`, 150, 30, { align: 'right' })
  doc.text(`Booking #: ${data.bookingNumber}`, 150, 36, { align: 'right' })
  doc.text(`Date: ${data.date}`, 150, 42, { align: 'right' })
  
  let y = 50
  doc.setFont('helvetica', 'bold')
  doc.text('Supplier:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.supplier, 50, y)
  
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('Customer:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.customer, 50, y)
  
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Tour:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.tour, 50, y)
  
  y += 15
  
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
    headStyles: { fillColor: [100, 100, 100] }
  })
  
  const finalY = (doc as any).lastAutoTable.finalY + 10
  const rightX = 150
  
  doc.setFont('helvetica', 'bold')
  doc.text('Total:', rightX, finalY)
  doc.text(`$${data.totalPrice.toFixed(2)}`, 190, finalY, { align: 'right' })
  
  doc.save(`Exchange_Invoice_${data.exchangeNumber}.pdf`)
}

export function generateReceiptPDF(data: ReceiptInvoiceData) {
  const doc = new jsPDF()
  
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT RECEIPT', 105, 30, { align: 'center' })
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Receipt No: ${data.receiptNo}`, 105, 45, { align: 'center' })
  doc.text(`Booking No: ${data.bookingNumber}`, 105, 52, { align: 'center' })
  doc.text(`Date: ${data.date}`, 105, 59, { align: 'center' })
  
  doc.setLineWidth(0.5)
  doc.line(20, 65, 190, 65)
  
  let y = 75
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Received From:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.customer, 60, y)
  
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Payment Type:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.paymentType, 60, y)
  
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('For:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.for, 60, y)
  
  if (data.chequeNo) {
    y += 10
    doc.setFont('helvetica', 'bold')
    doc.text('Cheque No:', 20, y)
    doc.setFont('helvetica', 'normal')
    doc.text(data.chequeNo, 60, y)
  }
  
  if (data.visaNo) {
    y += 10
    doc.setFont('helvetica', 'bold')
    doc.text('Visa No:', 20, y)
    doc.setFont('helvetica', 'normal')
    doc.text(data.visaNo, 60, y)
  }
  
  y += 20
  doc.setLineWidth(1)
  doc.rect(20, y, 170, 25)
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Amount Paid:', 25, y + 10)
  doc.setFontSize(18)
  doc.text(`$${data.amount.toFixed(2)}`, 185, y + 10, { align: 'right' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(data.paidText || '', 25, y + 20)
  
  y += 40
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Thank you for your payment', 105, y, { align: 'center' })
  
  doc.save(`Receipt_${data.receiptNo}.pdf`)
}
