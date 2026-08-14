-- 删除测试的 payment 数据 (ID 37-41)
-- 警告：这将永久删除这些数据，请确保这些是测试数据

-- 1. 查看要删除的数据（可选，用于确认）
SELECT id, receiptno, bookno, receiptdate, customer, amountpaid
FROM booking_payment_data
WHERE id BETWEEN 37 AND 41
ORDER BY id;

-- 2. 删除 ID 37-41 的记录
DELETE FROM booking_payment_data
WHERE id BETWEEN 37 AND 41;

-- 3. 重置序列，使下一个 ID 从 37 开始
-- 首先检查当前序列名称
SELECT pg_get_serial_sequence('booking_payment_data', 'id');

-- 重置序列到 36（下一个将是 37）
SELECT setval(pg_get_serial_sequence('booking_payment_data', 'id'), 36, true);

-- 4. 验证：查看当前最大 ID 和序列值
SELECT MAX(id) as max_id FROM booking_payment_data;
SELECT last_value FROM booking_payment_data_id_seq;

-- 5. 显示剩余的 payment 记录数量
SELECT COUNT(*) as total_payments FROM booking_payment_data;
