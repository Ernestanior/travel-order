-- 一键删除测试数据并重置序列
-- 删除 ID 37-41，重置序列使下一个从 37 开始

-- 删除测试数据
DELETE FROM booking_payment_data WHERE id BETWEEN 37 AND 41;

-- 重置序列
ALTER SEQUENCE booking_payment_data_id_seq RESTART WITH 37;

-- 验证结果
SELECT 
    (SELECT MAX(id) FROM booking_payment_data) as max_id,
    (SELECT last_value FROM booking_payment_data_id_seq) as next_id,
    (SELECT COUNT(*) FROM booking_payment_data WHERE id > 36) as records_after_36;
