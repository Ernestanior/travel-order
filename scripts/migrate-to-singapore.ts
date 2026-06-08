import { PrismaClient } from '@prisma/client'

// 旧数据库（美国）
const oldDbUrl = 'postgresql://neondb_owner:npg_mxyoVWE4hF7Y@ep-little-hat-aq2iyqb1-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'

// 新数据库（新加坡）
const newDbUrl = 'postgresql://neondb_owner:npg_paBHUe5x8Tsb@ep-bold-art-aomz20xv-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'

const oldPrisma = new PrismaClient({
  datasources: {
    db: {
      url: oldDbUrl
    }
  }
})

const newPrisma = new PrismaClient({
  datasources: {
    db: {
      url: newDbUrl
    }
  }
})

async function migrateData() {
  console.log('🚀 开始数据迁移...\n')
  
  try {
    // 1. 先同步新数据库的结构
    console.log('📋 第一步：同步数据库结构')
    console.log('请手动运行: DATABASE_URL="新数据库URL" npx prisma db push')
    console.log('按回车继续...\n')
    
    // 2. 迁移 Customers
    console.log('👥 迁移客户数据...')
    const customers = await oldPrisma.customer.findMany()
    console.log(`   找到 ${customers.length} 个客户`)
    
    for (const customer of customers) {
      await newPrisma.customer.upsert({
        where: { customer: customer.customer },
        update: {},
        create: customer
      })
    }
    console.log('   ✅ 客户数据迁移完成\n')
    
    // 3. 迁移 Suppliers
    console.log('🏢 迁移供应商数据...')
    const suppliers = await oldPrisma.supplier.findMany()
    console.log(`   找到 ${suppliers.length} 个供应商`)
    
    for (const supplier of suppliers) {
      await newPrisma.supplier.upsert({
        where: { supplier: supplier.supplier },
        update: {},
        create: supplier
      })
    }
    console.log('   ✅ 供应商数据迁移完成\n')
    
    // 4. 迁移 Booking Orders
    console.log('📦 迁移订单数据...')
    const bookings = await oldPrisma.bookingData.findMany({
      include: {
        items: true,
        passengers: true,
        payments: true
      }
    })
    console.log(`   找到 ${bookings.length} 个订单`)
    
    let bookingCount = 0
    for (const booking of bookings) {
      // 创建主订单
      await newPrisma.bookingData.create({
        data: {
          id: booking.id,
          bookno: booking.bookno,
          bookdate: booking.bookdate,
          customer: booking.customer,
          deptdate: booking.deptdate,
          depttime: booking.depttime,
          deptflt: booking.deptflt,
          deptdest: booking.deptdest,
          deptdate2: booking.deptdate2,
          depttime2: booking.depttime2,
          deptflt2: booking.deptflt2,
          deptdest2: booking.deptdest2,
          arrvdate: booking.arrvdate,
          arrvtime: booking.arrvtime,
          arrvflt: booking.arrvflt,
          arrvdest: booking.arrvdest,
          arrvdate2: booking.arrvdate2,
          arrvtime2: booking.arrvtime2,
          arrvflt2: booking.arrvflt2,
          arrvdest2: booking.arrvdest2,
          discount: booking.discount,
          tourcode: booking.tourcode,
          tour: booking.tour,
          staff: booking.staff,
          status: booking.status,
          special: booking.special
        }
      })
      
      // 创建关联的 Items
      if (booking.items.length > 0) {
        await newPrisma.itemData.createMany({
          data: booking.items.map(item => ({
            bookno: item.bookno,
            item: item.item,
            quantity: item.quantity,
            price: item.price,
            unitprice: item.unitprice,
            exchangeno: item.exchangeno
          }))
        })
      }
      
      // 创建关联的 Passengers
      if (booking.passengers.length > 0) {
        await newPrisma.passengerData.createMany({
          data: booking.passengers.map(p => ({
            bookno: p.bookno,
            paxname: p.paxname,
            passport: p.passport,
            birthdate: p.birthdate,
            exchangeno: p.exchangeno
          }))
        })
      }
      
      // 创建关联的 Payments
      if (booking.payments.length > 0) {
        await newPrisma.bookingPaymentData.createMany({
          data: booking.payments.map(payment => ({
            id: payment.id,
            receiptno: payment.receiptno,
            bookno: payment.bookno,
            receiptdate: payment.receiptdate,
            paytype: payment.paytype,
            for: payment.for,
            chequeno: payment.chequeno,
            visano: payment.visano,
            amountpaid: payment.amountpaid,
            paidtext: payment.paidtext,
            customer: payment.customer,
            payfor: payment.payfor
          }))
        })
      }
      
      bookingCount++
      if (bookingCount % 10 === 0) {
        console.log(`   已迁移 ${bookingCount}/${bookings.length} 个订单...`)
      }
    }
    console.log(`   ✅ 订单数据迁移完成 (${bookings.length} 个订单)\n`)
    
    // 5. 迁移 Exchange Orders
    console.log('💱 迁移 Exchange Orders...')
    const exchanges = await oldPrisma.exchangeData.findMany({
      include: {
        items: true,
        payments: true
      }
    })
    console.log(`   找到 ${exchanges.length} 个 Exchange Orders`)
    
    let exchangeCount = 0
    for (const exchange of exchanges) {
      // 创建主 Exchange Order
      await newPrisma.exchangeData.create({
        data: {
          id: exchange.id,
          exchangeno: exchange.exchangeno,
          bookno: exchange.bookno,
          exchangedate: exchange.exchangedate,
          supplier: exchange.supplier,
          status: exchange.status,
          bookdate: exchange.bookdate,
          customer: exchange.customer,
          deptdate: exchange.deptdate,
          depttime: exchange.depttime,
          deptflt: exchange.deptflt,
          deptdest: exchange.deptdest,
          deptdate2: exchange.deptdate2,
          depttime2: exchange.depttime2,
          deptflt2: exchange.deptflt2,
          deptdest2: exchange.deptdest2,
          arrvdate: exchange.arrvdate,
          arrvtime: exchange.arrvtime,
          arrvflt: exchange.arrvflt,
          arrvdest: exchange.arrvdest,
          arrvdate2: exchange.arrvdate2,
          arrvtime2: exchange.arrvtime2,
          arrvflt2: exchange.arrvflt2,
          arrvdest2: exchange.arrvdest2,
          discount: exchange.discount,
          tourcode: exchange.tourcode,
          tour: exchange.tour,
          staff: exchange.staff,
          special: exchange.special
        }
      })
      
      // 创建关联的 Items
      if (exchange.items.length > 0) {
        await newPrisma.exchangeItemData.createMany({
          data: exchange.items.map(item => ({
            exchangeno: item.exchangeno,
            item: item.item,
            quantity: item.quantity,
            price: item.price,
            unitprice: item.unitprice
          }))
        })
      }
      
      // 创建关联的 Payments
      if (exchange.payments.length > 0) {
        await newPrisma.exchangePaymentData.createMany({
          data: exchange.payments.map(payment => ({
            id: payment.id,
            exchangeno: payment.exchangeno,
            bookno: payment.bookno,
            receiptdate: payment.receiptdate,
            paytype: payment.paytype,
            chequeno: payment.chequeno,
            amountpaid: payment.amountpaid,
            remarks: payment.remarks,
            issue: payment.issue,
            paidtext: payment.paidtext
          }))
        })
      }
      
      exchangeCount++
      if (exchangeCount % 10 === 0) {
        console.log(`   已迁移 ${exchangeCount}/${exchanges.length} 个 Exchange Orders...`)
      }
    }
    console.log(`   ✅ Exchange Orders 迁移完成 (${exchanges.length} 个)\n`)
    
    // 6. 验证数据
    console.log('🔍 验证迁移结果...')
    const newCustomersCount = await newPrisma.customer.count()
    const newSuppliersCount = await newPrisma.supplier.count()
    const newBookingsCount = await newPrisma.bookingData.count()
    const newExchangesCount = await newPrisma.exchangeData.count()
    const newPassengersCount = await newPrisma.passengerData.count()
    const newItemsCount = await newPrisma.itemData.count()
    
    console.log('\n📊 迁移统计:')
    console.log(`   客户: ${customers.length} → ${newCustomersCount}`)
    console.log(`   供应商: ${suppliers.length} → ${newSuppliersCount}`)
    console.log(`   订单: ${bookings.length} → ${newBookingsCount}`)
    console.log(`   Exchange Orders: ${exchanges.length} → ${newExchangesCount}`)
    console.log(`   乘客: ${newPassengersCount}`)
    console.log(`   订单项: ${newItemsCount}`)
    
    console.log('\n✅ 数据迁移完成！')
    console.log('\n下一步:')
    console.log('1. 更新 .env 文件使用新数据库')
    console.log('2. 测试应用是否正常工作')
    console.log('3. 在 Vercel 更新环境变量')
    console.log('4. 删除旧的美国数据库')
    
  } catch (error) {
    console.error('❌ 迁移失败:', error)
    throw error
  } finally {
    await oldPrisma.$disconnect()
    await newPrisma.$disconnect()
  }
}

migrateData()
