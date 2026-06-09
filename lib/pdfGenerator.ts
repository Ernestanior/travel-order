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

export function generateBookingInvoicePDF(data: BookingInvoiceData) {
  const doc = new jsPDF()
  
  // Company watermark (optional - commented out for now)
  // doc.setFontSize(60)
  // doc.setTextColor(200, 200, 200)
  // doc.text('SAMPLE', 105, 150, { align: 'center', angle: 45 })
  
  // Reset color
  doc.setTextColor(0, 0, 0)
  
  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('BOOKING INVOICE', 105, 20, { align: 'center' })
  
  // Booking number and date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Booking Invoice: ${data.bookingNumber}`, 150, 30, { align: 'right' })
  doc.text(`Date: ${data.date}`, 150, 36, { align: 'right' })
  
  // Customer information
  let y = 45
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(data.customerName, 20, y)
  y += 6
  if (data.address) {
    doc.text(data.address, 20, y)
    y += 6
  }
  doc.text(`Telephone: ${data.tel}`, 20, y)
  
  // Tour information
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Tour Information:', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(`Tour: ${data.tour}`, 20, y)
  if (data.tourCode) {
    y += 6
    doc.text(`Tour Code: ${data.tourCode}`, 20, y)
  }
  
  // Flight details
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Departure Date 1:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.departureDate || '', 55, y)
  y += 6
  doc.text(`Time 1: ${data.departureTime || ''}`, 20, y)
  doc.text(`Flight 1: ${data.departureFlight || ''}`, 80, y)
  doc.text(`Destination 1: ${data.departureDest || ''}`, 130, y)
  
  if (data.departureDate2) {
    y += 6
    doc.text(`Time 2: ${data.departureTime2 || ''}`, 20, y)
    doc.text(`Flight 2: ${data.departureFlight2 || ''}`, 80, y)
    doc.text(`Destination 2: ${data.departureDest2 || ''}`, 130, y)
  }
  
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('Arrival Date 1:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.arrivalDate || '', 55, y)
  y += 6
  doc.text(`Time 1: ${data.arrivalTime || ''}`, 20, y)
  doc.text(`Flight 1: ${data.arrivalFlight || ''}`, 80, y)
  doc.text(`Destination 1: ${data.arrivalDest || ''}`, 130, y)
  
  if (data.arrivalDate2) {
    y += 6
    doc.text(`Time 2: ${data.arrivalTime2 || ''}`, 20, y)
    doc.text(`Flight 2: ${data.arrivalFlight2 || ''}`, 80, y)
    doc.text(`Destination 2: ${data.arrivalDest2 || ''}`, 130, y)
  }
  
  if (data.staff) {
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.text('Attended By:', 20, y)
    doc.setFont('helvetica', 'normal')
    doc.text(data.staff, 55, y)
  }
  
  // Items table
  y += 10
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
    headStyles: { fillColor: [100, 100, 100] },
    styles: { fontSize: 9 },
  })
  
  // Passengers
  const finalY = (doc as any).lastAutoTable.finalY || y + 40
  y = finalY + 10
  
  if (data.passengers.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.text('Passengers:', 20, y)
    doc.setFont('helvetica', 'normal')
    y += 6
    
    const passengerRows = data.passengers.map(p => [p.name, p.passport])
    autoTable(doc, {
      startY: y,
      head: [['Name', 'Passport']],
      body: passengerRows,
      theme: 'grid',
      headStyles: { fillColor: [100, 100, 100] },
      styles: { fontSize: 9 },
    })
    
    y = (doc as any).lastAutoTable.finalY + 10
  }
  
  // Financial summary
  const rightX = 150
  doc.setFont('helvetica', 'bold')
  doc.text('Total Price:', rightX, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text(`$${data.totalPrice.toFixed(2)}`, 190, y, { align: 'right' })
  
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Discount:', rightX, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text(`$${data.discount.toFixed(2)}`, 190, y, { align: 'right' })
  
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Payment:', rightX, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text(`$${data.payment.toFixed(2)}`, 190, y, { align: 'right' })
  
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Balance:', rightX, y, { align: 'right' })
  doc.text(`$${data.balance.toFixed(2)}`, 190, y, { align: 'right' })
  
  // Save the PDF
  doc.save(`Booking_Invoice_${data.bookingNumber}.pdf`)
}

export function generateExchangeInvoicePDF(data: ExchangeInvoiceData) {
  const doc = new jsPDF()
  
  doc.setTextColor(0, 0, 0)
  
  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('EXCHANGE ORDER INVOICE', 105, 20, { align: 'center' })
  
  // Exchange number and date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Exchange #: ${data.exchangeNumber}`, 150, 30, { align: 'right' })
  doc.text(`Booking #: ${data.bookingNumber}`, 150, 36, { align: 'right' })
  doc.text(`Date: ${data.date}`, 150, 42, { align: 'right' })
  
  // Supplier information
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
  
  // Tour information
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Tour:', 20, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.tour, 50, y)
  
  // Flight details
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Departure:', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(`Date: ${data.departureDate || ''}`, 20, y)
  doc.text(`Time: ${data.departureTime || ''}`, 70, y)
  doc.text(`Flight: ${data.departureFlight || ''}`, 120, y)
  y += 6
  doc.text(`Destination: ${data.departureDest || ''}`, 20, y)
  
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Arrival:', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(`Date: ${data.arrivalDate || ''}`, 20, y)
  doc.text(`Time: ${data.arrivalTime || ''}`, 70, y)
  doc.text(`Flight: ${data.arrivalFlight || ''}`, 120, y)
  y += 6
  doc.text(`Destination: ${data.arrivalDest || ''}`, 20, y)
  
  // Items table
  y += 10
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
    headStyles: { fillColor: [100, 100, 100] },
    styles: { fontSize: 9 },
  })
  
  // Financial summary
  const finalY = (doc as any).lastAutoTable.finalY || y + 40
  y = finalY + 10
  
  const rightX = 150
  doc.setFont('helvetica', 'bold')
  doc.text('Total Price:', rightX, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text(`$${data.totalPrice.toFixed(2)}`, 190, y, { align: 'right' })
  
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Discount:', rightX, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text(`$${data.discount.toFixed(2)}`, 190, y, { align: 'right' })
  
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Payment:', rightX, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text(`$${data.payment.toFixed(2)}`, 190, y, { align: 'right' })
  
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Balance:', rightX, y, { align: 'right' })
  doc.text(`$${data.balance.toFixed(2)}`, 190, y, { align: 'right' })
  
  // Save the PDF
  doc.save(`Exchange_Invoice_${data.exchangeNumber}.pdf`)
}

export function generateReceiptPDF(data: ReceiptInvoiceData) {
  const doc = new jsPDF()
  
  doc.setTextColor(0, 0, 0)
  
  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT RECEIPT', 105, 30, { align: 'center' })
  
  // Receipt information
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Receipt No: ${data.receiptNo}`, 105, 45, { align: 'center' })
  doc.text(`Booking No: ${data.bookingNumber}`, 105, 52, { align: 'center' })
  doc.text(`Date: ${data.date}`, 105, 59, { align: 'center' })
  
  // Divider line
  doc.setLineWidth(0.5)
  doc.line(20, 65, 190, 65)
  
  // Customer and payment details
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
  
  // Amount box
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
  
  // Footer
  y += 40
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Thank you for your payment', 105, y, { align: 'center' })
  
  // Save the PDF
  doc.save(`Receipt_${data.receiptNo}.pdf`)
}
