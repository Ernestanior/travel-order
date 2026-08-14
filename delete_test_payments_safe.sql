-- ========================================
-- 安全删除测试 Payment 数据并重置序列
-- ========================================
-- 用途：删除 ID 37-41 的测试数据，重置序列使下一个从 37 开始
-- 
-- 使用方法：
-- 1. 先运行 STEP 1 确认要删除的数据
-- 2. 如果确认无误，再运行 STEP 2 删除数据
-- 3. 运行 STEP 3 重置序列
-- 4. 运行 STEP 4 验证结果
-- ========================================

-- ========================================
-- STEP 1: 查看要删除的数据（确认用）
-- ========================================
-- 运行这个查询，确认这些是测试数据
SELECT 
    id, 
    receiptno, 
    bookno, 
    receiptdate, 
    customer, 
    paytype,
    amountpaid
FROM booking_payment_data
WHERE id BETWEEN 37 AND 41
ORDER BY id;

-- ========================================
-- STEP 2: 删除测试数据
-- ========================================
-- ⚠️ 警告：这将永久删除数据！确认 STEP 1 的结果后再执行

-- 开始事务（如果出错可以回滚）
BEGIN;

-- 删除 ID 37-41 的记录
DELETE FROM booking_payment_data
WHERE id BETWEEN 37 AND 41;

-- 查看删除的行数
-- 应该显示 "DELETE 5" （如果删除了 5 条记录）

-- 如果确认无误，提交事务
COMMIT;

-- 如果发现错误，想要撤销删除，运行：
-- ROLLBACK;

-- ========================================
-- STEP 3: 重置序列
-- ========================================
-- 将序列重置到 36，这样下一个 ID 将是 37

-- 方法 1：直接重置（推荐）
ALTER SEQUENCE booking_payment_data_id_seq RESTART WITH 37;

-- 或者方法 2：使用 setval
-- SELECT setval('booking_payment_data_id_seq', 36, true);

-- ========================================
-- STEP 4: 验证结果
-- ========================================

-- 4.1 查看当前最大的 ID（应该是 36）
SELECT MAX(id) as current_max_id FROM booking_payment_data;

-- 4.2 查看序列的当前值（应该是 36 或准备生成 37）
SELECT last_value, is_called FROM booking_payment_data_id_seq;

-- 4.3 查看 ID 36 之后是否还有记录（应该没有）
SELECT id, receiptno, bookno, customer
FROM booking_payment_data
WHERE id > 36
ORDER BY id;

-- 4.4 查看总记录数
SELECT COUNT(*) as total_records FROM booking_payment_data;

-- 4.5 查看最近的几条记录（确认连续性）
SELECT id, receiptno, bookno, customer, receiptdate
FROM booking_payment_data
ORDER BY id DESC
LIMIT 10;

-- ========================================
-- STEP 5: 测试新记录（可选）
-- ========================================
-- 如果想测试下一个 ID 是否真的是 37，可以在应用中创建一个新的 payment
-- 或者运行下面的测试插入（记得测试后删除）

-- 测试插入（确保下一个 ID 是 37）
/*
INSERT INTO booking_payment_data (
    receiptno, 
    bookno, 
    receiptdate, 
    customer, 
    paytype, 
    amountpaid
) VALUES (
    'TEST37', 
    'T100999', 
    CURRENT_DATE, 
    'TEST_CUSTOMER', 
    'Cash', 
    1.00
) RETURNING id;
-- 这应该返回 id = 37

-- 如果测试成功，删除测试记录
DELETE FROM booking_payment_data WHERE receiptno = 'TEST37';
*/

-- ========================================
-- 完成！
-- ========================================
-- 现在下一个 payment 的 ID 将从 37 开始
