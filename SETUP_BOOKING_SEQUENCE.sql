-- ===============================================
-- Booking Order 序列号设置脚本
-- 用途：确保订单号严格按顺序生成，支持并发
-- ===============================================

-- 1. 查看当前最大的订单ID
SELECT MAX(id) as max_id, COUNT(*) as total_bookings FROM booking_data;

-- 2. 创建序列（从当前最大ID + 1开始）
-- 注意：需要先执行上面的查询，获取max_id，然后替换下面的 100001
CREATE SEQUENCE IF NOT EXISTS booking_number_seq
  START WITH 100001        -- 起始值（根据实际情况调整）
  INCREMENT BY 1           -- 每次递增1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;                 -- 缓存值，1表示不缓存（最安全）

-- 3. 如果序列已存在，重置到正确的值
-- 先查询当前最大ID，然后执行：
-- SELECT setval('booking_number_seq', (SELECT COALESCE(MAX(id), 100000) FROM booking_data) + 1);

-- 4. 测试序列
SELECT nextval('booking_number_seq') as next_booking_number;
SELECT currval('booking_number_seq') as current_value;

-- 5. 查看序列信息
SELECT * FROM booking_number_seq;

-- ===============================================
-- 如果需要删除序列（谨慎使用）
-- DROP SEQUENCE IF EXISTS booking_number_seq;
-- ===============================================

-- ===============================================
-- 自动设置起始值的完整脚本（推荐使用这个）
-- ===============================================
DO $$
DECLARE
    max_booking_id INTEGER;
BEGIN
    -- 获取当前最大ID
    SELECT COALESCE(MAX(id), 100000) INTO max_booking_id FROM booking_data;
    
    -- 删除旧序列（如果存在）
    DROP SEQUENCE IF EXISTS booking_number_seq;
    
    -- 创建新序列，从max_id + 1开始
    EXECUTE format('CREATE SEQUENCE booking_number_seq START WITH %s INCREMENT BY 1 CACHE 1', max_booking_id + 1);
    
    -- 输出信息
    RAISE NOTICE 'Booking number sequence created, starting from: %', max_booking_id + 1;
END $$;

-- 验证
SELECT nextval('booking_number_seq') as next_number;
SELECT setval('booking_number_seq', currval('booking_number_seq') - 1); -- 回退一位（因为测试用掉了一个）
