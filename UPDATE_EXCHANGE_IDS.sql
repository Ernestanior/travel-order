-- 为 Exchange Order ID 添加 'E' 前缀
-- 执行此脚本前请先备份数据库！

-- 1. 更新 ExchangeData 表
UPDATE "ExchangeData"
SET exchangeno = 'E' || exchangeno
WHERE exchangeno NOT LIKE 'E%';

-- 2. 更新 ExchangeItemData 表
UPDATE "ExchangeItemData"
SET exchangeno = 'E' || exchangeno
WHERE exchangeno NOT LIKE 'E%';

-- 3. 更新 ExchangePaymentData 表
UPDATE "ExchangePaymentData"
SET exchangeno = 'E' || exchangeno
WHERE exchangeno NOT LIKE 'E%';

-- 验证更新结果
SELECT 'ExchangeData' as table_name, COUNT(*) as count 
FROM "ExchangeData" 
WHERE exchangeno LIKE 'E%'
UNION ALL
SELECT 'ExchangeItemData', COUNT(*) 
FROM "ExchangeItemData" 
WHERE exchangeno LIKE 'E%'
UNION ALL
SELECT 'ExchangePaymentData', COUNT(*) 
FROM "ExchangePaymentData" 
WHERE exchangeno LIKE 'E%';
