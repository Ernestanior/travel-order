-- 添加乘客出生日期字段的迁移
-- 这个操作是安全的，不会删除或修改任何现有数据

-- 给 passenger_data 表添加 birthdate 列
ALTER TABLE passenger_data 
ADD COLUMN birthdate DATE NULL;

-- 说明：
-- 1. 所有现有记录的 birthdate 将是 NULL（空值）
-- 2. 所有其他字段（paxname, passport 等）不受影响
-- 3. 可以随时为现有或新记录填写出生日期
-- 4. birthdate 是可选的，可以不填
