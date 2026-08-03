-- 添加 display_no 字段到 booking_data 表
-- 这个字段用于显示给客户的连续订单号，不会跳号

-- 1. 添加 display_no 列（可为空，因为现有数据需要后续填充）
ALTER TABLE booking_data 
ADD COLUMN IF NOT EXISTS display_no VARCHAR(50);

-- 2. 创建唯一索引（确保 display_no 不重复）
CREATE UNIQUE INDEX IF NOT EXISTS booking_data_display_no_key 
ON booking_data(display_no) 
WHERE display_no IS NOT NULL;

-- 3. 添加注释
COMMENT ON COLUMN booking_data.display_no IS '显示给客户的连续订单号，格式：T100001, T100002...，保证连续不跳号';

-- 注意：现有数据的 display_no 填充将在单独的脚本中执行
