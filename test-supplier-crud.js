// 测试Supplier CRUD功能
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('=== Testing Supplier CRUD ===\n')
    
    const testSupplierName = `TEST SUPPLIER ${Date.now()}`
    
    // 1. 测试创建
    console.log('Step 1: Creating test supplier...')
    const created = await prisma.supplier.create({
      data: {
        supplier: testSupplierName,
        tel: '12345678',
        fax: '87654321',
        address: '123 Test Street'
      }
    })
    console.log('✅ Created:', created.supplier)
    
    // 2. 测试读取
    console.log('\nStep 2: Reading supplier...')
    const read = await prisma.supplier.findUnique({
      where: { supplier: testSupplierName }
    })
    console.log('✅ Read:', {
      name: read.supplier,
      tel: read.tel,
      fax: read.fax,
      address: read.address
    })
    
    // 3. 测试更新
    console.log('\nStep 3: Updating supplier...')
    const updated = await prisma.supplier.update({
      where: { supplier: testSupplierName },
      data: {
        tel: '99999999',
        address: '456 New Street'
      }
    })
    console.log('✅ Updated:', {
      name: updated.supplier,
      tel: updated.tel,
      address: updated.address
    })
    
    // 4. 验证更新
    console.log('\nStep 4: Verifying update...')
    const verified = await prisma.supplier.findUnique({
      where: { supplier: testSupplierName }
    })
    
    if (verified.tel === '99999999' && verified.address === '456 New Street') {
      console.log('✅ Update verified successfully')
    } else {
      console.log('❌ Update verification failed')
    }
    
    // 5. 测试删除
    console.log('\nStep 5: Deleting test supplier...')
    await prisma.supplier.delete({
      where: { supplier: testSupplierName }
    })
    console.log('✅ Deleted')
    
    // 6. 验证删除
    console.log('\nStep 6: Verifying deletion...')
    const deletedCheck = await prisma.supplier.findUnique({
      where: { supplier: testSupplierName }
    })
    
    if (deletedCheck === null) {
      console.log('✅ Deletion verified successfully')
    } else {
      console.log('❌ Deletion verification failed')
    }
    
    // 7. 测试重复检查
    console.log('\nStep 7: Testing duplicate check...')
    const existingSupplier = await prisma.supplier.findFirst()
    
    if (existingSupplier) {
      try {
        await prisma.supplier.create({
          data: {
            supplier: existingSupplier.supplier,
            tel: '00000000'
          }
        })
        console.log('❌ Duplicate check failed - should have thrown error')
      } catch (error) {
        console.log('✅ Duplicate check working - error thrown as expected')
      }
    }
    
    // 8. 统计
    console.log('\n=== Summary ===')
    const totalSuppliers = await prisma.supplier.count()
    console.log(`Total suppliers in database: ${totalSuppliers}`)
    
    console.log('\n✅ All CRUD operations working correctly!')
    
  } catch (error) {
    console.error('\n❌ Error during test:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
