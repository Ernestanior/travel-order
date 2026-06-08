import { PrismaClient } from '@prisma/client'

// 旧数据库（美国）
const oldDbUrl = 'postgresql://neondb_owner:npg_mxyoVWE4hF7Y@ep-little-hat-aq2iyqb1-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'

// 新数据库（新加坡）
const newDbUrl = 'postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'

const oldPrisma = new PrismaClient({
  datasources: { db: { url: oldDbUrl } }
})

const newPrisma = new PrismaClient({
  datasources: { db: { url: newDbUrl } }
})

async function migrateData() {
  console.log('🚀 开始快速数据迁移...\n')
  
  try {
    // 1. 迁移 Customers (批量)
    console.log('👥 迁移客户数据...')
    const customers = await oldPrisma.customer.findMany()
    console.log(`   找到 ${customers.length} 个客户`)
    
    await newPrisma.customer.createMany({
      data: customers,
      skipDuplicates: true
    })
    console.log('   ✅ 客户数据迁移完成\n')
    
    // 2. 迁移 Suppliers (批量)
    console.log('🏢 迁移供应商数据...')
    const suppliers = await oldPrisma.supplier.findMany()
    console.log(`   找到 ${suppliers.length} 个供应商`)
    
    await newPrisma.supplier.createMany({
      data: suppliers,
      skipDuplicates: true
    })
    console.log('   ✅ 供应商数据迁移完成\n')
    
    // 3. 迁移 Booking Orders (仅主表，批量)
    console.log('📦 迁移订单主表数据...')
    const bookings = await oldPrisma.bookingData.findMany()
    console.log(`   找到 ${bookings.length} 个订单`)
    
    const BATCH_SIZE = 100
    for (let i = 0; i < bookings.length; i += BATCH_SIZE) {
      const batch = bookings.slice(i, i + BATCH_SIZE)
      await newPrisma.bookingData.createMany({
        data: batch.map(b => ({
          id: b.id,
          bookno: b.bookno,
          bookdate: b.bookdate,
          customer: b.customer,
          deptdate: b.deptdate,
          depttime: b.depttime,
          deptflt: b.deptflt,
          deptdest: b.deptdest,
          deptdate2: b.deptdate2,
          depttime2: b.depttime2,
          deptflt2: b.deptflt2,
          deptdest2: b.deptdest2,
          arrvdate: b.arrvdate,
          arrvtime: b.arrvtime,
          arrvflt: b.arrvflt,
          arrvdest: b.arrvdest,
          arrvdate2: b.arrvdate2,
          arrvtime2: b.arrvtime2,
          arrvflt2: b.arrvflt2,
          arrvdest2: b.arrvdest2,
          discount: b.discount,
          tourcode: b.tourcode,
          tour: b.tour,
          staff: b.staff,
          status: b.status,
          special: b.special
        })),
        skipDuplicates: true
      })
      console.log(`   已迁移 ${Math.min(i + BATCH_SIZE, bookings.length)}/${bookings.length} 个订单...`)
    }
    console.log('   ✅ 订单主表迁移完成\n')
    
    // 4. 迁移 Items (批量)
    console.log('📋 迁移订单项数据...')
    const items = await oldPrisma.itemData.findMany()
    console.log(`   找到 ${items.length} 个订单项`)
    
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE)
      await newPrisma.itemData.createMany({
        data: batch,
        skipDuplicates: true
      })
      console.log(`   已迁移 ${Math.min(i + BATCH_SIZE, items.length)}/${items.length} 个订单项...`)
    }
    console.log('   ✅ 订单项迁移完成\n')
    
    // 5. 迁移 Passengers (批量)
    console.log('👤 迁移乘客数据...')
    const passengers = await oldPrisma.passengerData.findMany()
    console.log(`   找到 ${passengers.length} 个乘客`)
    
    for (let i = 0; i < passengers.length; i += BATCH_SIZE) {
      const batch = passengers.slice(i, i + BATCH_SIZE)
      await newPrisma.passengerData.createMany({
        data: batch,
        skipDuplicates: true
      })
      console.log(`   已迁移 ${Math.min(i + BATCH_SIZE, passengers.length)}/${passengers.length} 个乘客...`)
    }
    console.log('   ✅ 乘客数据迁移完成\n')
    
    // 6. 迁移 Booking Payments (批量)
    console.log('💰 迁移订单支付数据...')
    const bookingPayments = await oldPrisma.bookingPaymentData.findMany()
    console.log(`   找到 ${bookingPayments.length} 个支付记录`)
    
    for (let i = 0; i < bookingPayments.length; i += BATCH_SIZE) {
      const batch = bookingPayments.slice(i, i + BATCH_SIZE)
      await newPrisma.bookingPaymentData.createMany({
        data: batch,
        skipDuplicates: true
      })
      console.log(`   已迁移 ${Math.min(i + BATCH_SIZE, bookingPayments.length)}/${bookingPayments.length} 个支付记录...`)
    }
    console.log('   ✅ 订单支付数据迁移完成\n')
    
    // 7. 迁移 Exchange Orders (仅主表，批量)
    console.log('💱 迁移 Exchange Orders 主表...')
    const exchanges = await oldPrisma.exchangeData.findMany()
    console.log(`   找到 ${exchanges.length} 个 Exchange Orders`)
    
    for (let i = 0; i < exchanges.length; i += BATCH_SIZE) {
      const batch = exchanges.slice(i, i + BATCH_SIZE)
      await newPrisma.exchangeData.createMany({
        data: batch.map(e => ({
          id: e.id,
          exchangeno: e.exchangeno,
          bookno: e.bookno,
          exchangedate: e.exchangedate,
          supplier: e.supplier,
          status: e.status,
          bookdate: e.bookdate,
          customer: e.customer,
          deptdate: e.deptdate,
          depttime: e.depttime,
          deptflt: e.deptflt,
          deptdest: e.deptdest,
          deptdate2: e.deptdate2,
          depttime2: e.depttime2,
          deptflt2: e.deptflt2,
          deptdest2: e.deptdest2,
          arrvdate: e.arrvdate,
          arrvtime: e.arrvtime,
          arrvflt: e.arrvflt,
          arrvdest: e.arrvdest,
          arrvdate2: e.arrvdate2,
          arrvtime2: e.arrvtime2,
          arrvflt2: e.arrvflt2,
          arrvdest2: e.arrvdest2,
          discount: e.discount,
          tourcode: e.tourcode,
          tour: e.tour,
          staff: e.staff,
          special: e.special
        })),
        skipDuplicates: true
      })
      console.log(`   已迁移 ${Math.min(i + BATCH_SIZE, exchanges.length)}/${exchanges.length} 个 Exchange Orders...`)
    }
    console.log('   ✅ Exchange Orders 主表迁移完成\n')
    
    // 8. 迁移 Exchange Items (批量)
    console.log('📋 迁移 Exchange 项数据...')
    const exchangeItems = await oldPrisma.exchangeItemData.findMany()
    console.log(`   找到 ${exchangeItems.length} 个 Exchange 项`)
    
    for (let i = 0; i < exchangeItems.length; i += BATCH_SIZE) {
      const batch = exchangeItems.slice(i, i + BATCH_SIZE)
      await newPrisma.exchangeItemData.createMany({
        data: batch,
        skipDuplicates: true
      })
      console.log(`   已迁移 ${Math.min(i + BATCH_SIZE, exchangeItems.length)}/${exchangeItems.length} 个 Exchange 项...`)
    }
    console.log('   ✅ Exchange 项迁移完成\n')
    
    // 9. 迁移 Exchange Payments (批量)
    console.log('💰 迁移 Exchange 支付数据...')
    const exchangePayments = await oldPrisma.exchangePaymentData.findMany()
    console.log(`   找到 ${exchangePayments.length} 个 Exchange 支付记录`)
    
    for (let i = 0; i < exchangePayments.length; i += BATCH_SIZE) {
      const batch = exchangePayments.slice(i, i + BATCH_SIZE)
      await newPrisma.exchangePaymentData.createMany({
        data: batch,
        skipDuplicates: true
      })
      console.log(`   已迁移 ${Math.min(i + BATCH_SIZE, exchangePayments.length)}/${exchangePayments.length} 个 Exchange 支付记录...`)
    }
    console.log('   ✅ Exchange 支付数据迁移完成\n')
    
    // 验证
    console.log('🔍 验证迁移结果...')
    const stats = {
      customers: await newPrisma.customer.count(),
      suppliers: await newPrisma.supplier.count(),
      bookings: await newPrisma.bookingData.count(),
      items: await newPrisma.itemData.count(),
      passengers: await newPrisma.passengerData.count(),
      bookingPayments: await newPrisma.bookingPaymentData.count(),
      exchanges: await newPrisma.exchangeData.count(),
      exchangeItems: await newPrisma.exchangeItemData.count(),
      exchangePayments: await newPrisma.exchangePaymentData.count()
    }
    
    console.log('\n📊 新数据库统计:')
    console.log(`   客户: ${stats.customers}`)
    console.log(`   供应商: ${stats.suppliers}`)
    console.log(`   订单: ${stats.bookings}`)
    console.log(`   订单项: ${stats.items}`)
    console.log(`   乘客: ${stats.passengers}`)
    console.log(`   订单支付: ${stats.bookingPayments}`)
    console.log(`   Exchange Orders: ${stats.exchanges}`)
    console.log(`   Exchange 项: ${stats.exchangeItems}`)
    console.log(`   Exchange 支付: ${stats.exchangePayments}`)
    
    console.log('\n✅ 数据迁移完成！')
    
  } catch (error) {
    console.error('❌ 迁移失败:', error)
    throw error
  } finally {
    await oldPrisma.$disconnect()
    await newPrisma.$disconnect()
  }
}

migrateData()
