// 预订订单
export interface BookingOrder {
  id: string
  bookingNumber: string
  date: string
  customerId: string
  customerName: string
  address?: string
  tel?: string
  fax?: string
  tourCode?: string
  tour?: string
  // 航班信息
  departureDate?: string
  departureTime?: string
  departureFlight?: string
  departureDest?: string
  depart2Date?: string
  depart2Time?: string
  depart2Flight?: string
  depart2Dest?: string
  arrivalDate?: string
  arrivalTime?: string
  arrivalFlight?: string
  arrivalDest?: string
  arrival2Date?: string
  arrival2Time?: string
  arrival2Flight?: string
  arrival2Dest?: string
  // 乘客信息
  passengers: Passenger[]
  passengerNames?: string // 乘客姓名文本
  // 财务信息
  discount: number
  staff?: string
  bookingTotalAmount: number
  // Item Data
  items: BookingItem[]
  totalCost: number
  paid: number
  outstanding: number
  receipts: Receipt[]
  specialInstruction?: string
  status: 'Open' | 'Close'
}

// 预订项目（如机票、税费等）
export interface BookingItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  note?: string // 如 "Subject to change"
}

// 换票订单
export interface ExchangeOrder {
  id: string
  exchangeNumber: string
  bookingNumber: string
  date: string
  supplierId: string
  supplierName: string
  supplierAddress?: string
  supplierTel?: string
  supplierFax?: string
  // 预订数据
  bookingDate?: string
  tour?: string
  // 航班信息
  departureDate?: string
  departureTime?: string
  departureFlight?: string
  departureDest?: string
  depart2Date?: string
  depart2Time?: string
  depart2Flight?: string
  depart2Dest?: string
  arrivalDate?: string
  arrivalTime?: string
  arrivalFlight?: string
  arrivalDest?: string
  arrival2Date?: string
  arrival2Time?: string
  arrival2Flight?: string
  arrival2Dest?: string
  // 乘客信息
  passengers: Passenger[]
  // 财务信息
  eoDiscount: number
  totalAmount: number
  items: ExchangeItem[]
  receipts: Receipt[]
  specialInstruction?: string
  status: 'Open' | 'Close'
  // 列表显示字段
  agent?: string
  deptDate?: string
  arvDate?: string
  totalCost: number
  paid: number
  outstanding: number
}

// 乘客信息
export interface Passenger {
  id: string
  name: string
  dateOfBirth?: string
}

// 换票项目
export interface ExchangeItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

// 收据
export interface Receipt {
  id: string
  receiptNumber: string
  date: string
  type: string
  paid: number
  balanceAmt: number
}

// 客户
export interface Customer {
  id: string
  name: string
  address?: string
  tel?: string
  fax?: string
  email?: string
}

// 供应商
export interface Supplier {
  id: string
  name: string
  telephone?: string
  fax?: string
  address?: string
}

// 报表选项
export type ReportType =
  | 'booking-inquiry'
  | 'exchange-inquiry'
  | 'outstanding-before-departure'
  | 'outstanding-by-passenger'
  | 'passenger-inquiry'
  | 'receipt-inquiry'
  | 'receipt-transactions'
  | 'printing-receipt'
  | 'printing-booking'
  | 'printing-eo'
  | 'profit-report'
  | 'by-customer'
  | 'closed-booking'
