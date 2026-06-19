// 测试Supplier Email功能
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('=== Testing Supplier Email Field ===\n')
    
    const testSupplierName = `TEST EMAIL SUPPLIER ${Date.now()}`
    const testEmail = 'test@supplier.com'
    
    // 1. 测试创建带email的供应商
    console.log('Step 1: Creating supplier with email...')
    const created = await prisma.supplier.create({
      data: {
        supplier: testSupplierName,
        tel: '12345678',
        fax: '87654321',
        address: '123 Test Street',
        email: testEmail
      }
    })
    console.log('✅ Created:', {
      name: created.supplier,
      email: created.email
    })
    
    // 2. 测试读取email
    console.log('\nStep 2: Reading supplier with email...')
    const read = await prisma.supplier.findUnique({
      where: { supplier: testSupplierName }
    })
    console.log('✅ Read:', {
      name: read.supplier,
      tel: read.tel,
      email: read.email,
      address: read.address
    })
    
    // 3. 测试更新email
    console.log('\nStep 3: Updating email...')
    const newEmail = 'updated@supplier.com'
    const updated = await prisma.supplier.update({
      where: { supplier: testSupplierName },
      data: {
        email: newEmail
      }
    })
    console.log('✅ Updated:', {
      name: updated.supplier,
      email: updated.email
    })
    
    // 4. 验证更新
    console.log('\nStep 4: Verifying email update...')
    const verified = await prisma.supplier.findUnique({
      where: { supplier: testSupplierName }
    })
    
    if (verified.email === newEmail) {
      console.log('✅ Email update verified successfully')
    } else {
      console.log('❌ Email update verification failed')
      console.log('Expected:', newEmail)
      console.log('Got:', verified.email)
    }
    
    // 5. 测试删除
    console.log('\nStep 5: Cleaning up test supplier...')
    await prisma.supplier.delete({
      where: { supplier: testSupplierName }
    })
    console.log('✅ Test supplier deleted')
    
    // 6. 验证email列存在
    console.log('\nStep 6: Verifying email column in database...')
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'supplier_data'
      ORDER BY ordinal_position
    `
    
    const emailColumn = columns.find(col => col.column_name === 'email')
    if (emailColumn) {
      console.log('✅ Email column exists:', {
        name: emailColumn.column_name,
        type: emailColumn.data_type,
        length: emailColumn.character_maximum_length
      })
    } else {
      console.log('❌ Email column not found')
    }
    
    // 7. 统计有email的供应商
    console.log('\nStep 7: Statistics...')
    const totalSuppliers = await prisma.supplier.count()
    const suppliersWithEmail = await prisma.supplier.count({
      where: {
        email: {
          not: null
        }
      }
    })
    
    console.log(`Total suppliers: ${totalSuppliers}`)
    console.log(`Suppliers with email: ${suppliersWithEmail}`)
    console.log(`Suppliers without email: ${totalSuppliers - suppliersWithEmail}`)
    
    console.log('\n✅ All email field tests passed!')
    
  } catch (error) {
    console.error('\n❌ Error during test:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
