-- 快速修复：将 Payment ID 8 改为 ID 5
-- ⚠️ 执行前请确保已备份数据库！

-- 查看修改前的数据
\echo '=== 修改前的数据 ==='
SELECT id, receiptno, bookno, TO_CHAR(receiptdate, 'DD-MM-YYYY') as date, amountpaid 
FROM booking_payment_data 
ORDER BY id;

-- 执行修改
\echo ''
\echo '=== 开始修改... ==='

-- 1. 更新 ID: 8 -> 5
UPDATE booking_payment_data 
SET id = 5 
WHERE id = 8;

-- 2. 更新 Receipt Number: RI00008 -> RI00005
UPDATE booking_payment_data 
SET receiptno = 'RI00005' 
WHERE id = 5;

-- 3. 重置序列到 5，下次从 6 开始
SELECT setval(
  pg_get_serial_sequence('booking_payment_data', 'id'),
  5,
  true
);

-- 查看修改后的数据
\echo ''
\echo '=== 修改后的数据 ==='
SELECT id, receiptno, bookno, TO_CHAR(receiptdate, 'DD-MM-YYYY') as date, amountpaid 
FROM booking_payment_data 
ORDER BY id;

-- 验证序列
\echo ''
\echo '=== 序列状态 ==='
SELECT 
  'Current Value' as description,
  last_value as value
FROM pg_sequences 
WHERE sequencename LIKE '%booking_payment_data%'
UNION ALL
SELECT 
  'Next Value' as description,
  last_value + 1 as value
FROM pg_sequences 
WHERE sequencename LIKE '%booking_payment_data%';

\echo ''
\echo '=== 修复完成！ ==='
\echo '下次创建 Payment 将从 ID=6, RI00006 开始'
