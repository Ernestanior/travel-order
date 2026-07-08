-- ⚠️ 重要：执行此脚本前请先备份数据库！
-- 此脚本用于修复 Payment Receipt 序列号
-- 目的：将 RI00008 改为 RI00005，让序列从 06 继续

-- 步骤说明：
-- 1. 将 ID=8 的记录改为 ID=5
-- 2. 重置 autoincrement 序列为 5
-- 3. 下次创建 Payment 时会从 ID=6 开始

BEGIN;

-- 检查当前数据
SELECT 
  id,
  receiptno,
  bookno,
  receiptdate,
  amountpaid
FROM booking_payment_data
ORDER BY id;

-- 第一步：临时禁用触发器（如果有）
-- PostgreSQL 不需要这步，但保险起见

-- 第二步：将 ID=8 改为 ID=5
-- 注意：需要先确认 ID=5 不存在
DO $$
BEGIN
  -- 检查 ID=5 是否已存在
  IF EXISTS (SELECT 1 FROM booking_payment_data WHERE id = 5) THEN
    RAISE EXCEPTION 'ID=5 already exists! Cannot proceed.';
  END IF;
  
  -- 检查 ID=8 是否存在
  IF NOT EXISTS (SELECT 1 FROM booking_payment_data WHERE id = 8) THEN
    RAISE EXCEPTION 'ID=8 does not exist! Please check your data.';
  END IF;
  
  -- 更新 ID: 8 -> 5
  UPDATE booking_payment_data 
  SET id = 5 
  WHERE id = 8;
  
  RAISE NOTICE 'Successfully updated ID from 8 to 5';
END $$;

-- 第三步：重置序列
-- 将 autoincrement 序列设置为当前最大 ID
DO $$
DECLARE
  max_id INTEGER;
  seq_name TEXT;
BEGIN
  -- 获取表的序列名称
  SELECT pg_get_serial_sequence('booking_payment_data', 'id') INTO seq_name;
  
  -- 获取当前最大的 id
  SELECT COALESCE(MAX(id), 0) INTO max_id FROM booking_payment_data;
  
  -- 重置序列为当前最大值
  -- 使用 true 参数表示下次 nextval() 会返回 max_id + 1
  EXECUTE format('SELECT setval(%L, %s, true)', seq_name, max_id);
  
  RAISE NOTICE 'Sequence reset to %. Next ID will be: %', max_id, max_id + 1;
END $$;

-- 验证结果
SELECT 
  id,
  receiptno,
  bookno,
  receiptdate,
  amountpaid
FROM booking_payment_data
ORDER BY id;

-- 检查序列当前值
SELECT 
  sequencename,
  last_value as "Current Value",
  last_value + 1 as "Next Value"
FROM pg_sequences 
WHERE sequencename LIKE '%booking_payment_data%';

-- 如果一切正常，提交事务
-- 如果有问题，可以执行 ROLLBACK; 回滚

COMMIT;

-- 使用说明：
-- 1. 先备份数据库！
-- 2. 在 PostgreSQL 中执行此脚本
-- 3. 检查输出，确认修改正确
-- 4. 如果有问题，从备份恢复

-- 测试（可选）：
-- 插入一条新记录，验证 ID 是否为 6
-- INSERT INTO booking_payment_data (receiptno, bookno, receiptdate, amountpaid, paytype)
-- VALUES ('RI00006', 'T100001', CURRENT_DATE, 100.00, 'Cash');
