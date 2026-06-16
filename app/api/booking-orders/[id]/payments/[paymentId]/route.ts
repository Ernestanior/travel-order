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
