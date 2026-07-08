import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// DELETE /api/booking-orders/[id]/payments/[paymentId] - Delete a payment
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const params = await context.params
    console.log('Delete payment request:', params)
    
    const bookingId = parseInt(params.id)
    const paymentId = parseInt(params.paymentId)

    console.log('Parsed IDs:', { bookingId, paymentId })

    if (isNaN(bookingId) || isNaN(paymentId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    // Get booking to verify it exists
    const booking = await prisma.bookingData.findUnique({
      where: { id: bookingId },
      select: { bookno: true }
    })

    console.log('Found booking:', booking)

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify the payment belongs to this booking
    const payment = await prisma.bookingPaymentData.findUnique({
      where: { id: paymentId }
    })

    console.log('Found payment:', payment)

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.bookno !== booking.bookno) {
      console.log('Payment bookno:', payment.bookno, 'Booking bookno:', booking.bookno)
      return NextResponse.json({ error: 'Payment does not belong to this booking' }, { status: 403 })
    }

    // Delete the payment
    await prisma.bookingPaymentData.delete({
      where: { id: paymentId }
    })

    console.log('Payment deleted successfully:', paymentId)

    return NextResponse.json({ 
      message: 'Payment deleted successfully',
      id: paymentId 
    })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json({ 
      error: 'Failed to delete payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT /api/booking-orders/[id]/payments/[paymentId] - Update payment amount
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()
    console.log('Update payment request:', params, body)
    
    const bookingId = parseInt(params.id)
    const paymentId = parseInt(params.paymentId)

    if (isNaN(bookingId) || isNaN(paymentId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const amount = parseFloat(body.amount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Get booking to verify it exists
    const booking = await prisma.bookingData.findUnique({
      where: { id: bookingId },
      select: { bookno: true }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify the payment belongs to this booking
    const payment = await prisma.bookingPaymentData.findUnique({
      where: { id: paymentId }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.bookno !== booking.bookno) {
      return NextResponse.json({ error: 'Payment does not belong to this booking' }, { status: 403 })
    }

    // Update the payment amount
    const updatedPayment = await prisma.bookingPaymentData.update({
      where: { id: paymentId },
      data: { amountpaid: amount }
    })

    console.log('Payment updated successfully:', updatedPayment)

    // Recalculate outstanding and update status if needed
    const fullBooking = await prisma.bookingData.findUnique({
      where: { id: bookingId },
      include: {
        items: true,
        payments: true
      }
    })
    
    if (fullBooking) {
      const totalCost = fullBooking.items.reduce((sum, item) => 
        sum + Number(item.price || 0), 0
      )
      const discount = Number(fullBooking.discount || 0)
      const paid = fullBooking.payments.reduce((sum, payment) => 
        sum + Number(payment.amountpaid || 0), 0
      )
      const totalAfterDiscount = Math.round((totalCost - discount) * 100) / 100
      const outstanding = Math.round((totalAfterDiscount - paid) * 100) / 100
      
      // 如果outstanding <= 0，自动设置status为Close，否则设置为Open
      const newStatus = outstanding <= 0.001 ? 'Close' : 'Open'
      await prisma.bookingData.update({
        where: { id: bookingId },
        data: { status: newStatus }
      })
    }

    return NextResponse.json({ 
      message: 'Payment updated successfully',
      payment: updatedPayment
    })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ 
      error: 'Failed to update payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
