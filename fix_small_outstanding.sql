-- Fix orders with small outstanding amounts (< $0.02) caused by floating point precision issues
-- This script identifies orders where the outstanding is essentially zero but shows as $0.01 due to rounding

-- First, let's see what orders will be affected
SELECT 
    b.bookno,
    b.customer,
    b.status,
    (SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) as items_total,
    b.discount,
    (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno) as payments_total,
    ((SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) - b.discount) - 
    (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno) as outstanding,
    'Will be set to Close' as action
FROM booking_data b
WHERE 
    -- Outstanding is very small (floating point error range)
    ABS(
        ((SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) - b.discount) - 
        (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno)
    ) > 0 
    AND ABS(
        ((SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) - b.discount) - 
        (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno)
    ) <= 0.02
    AND b.status != 'Close';

-- Uncomment the following lines to actually apply the fix
-- WARNING: This will automatically close orders with outstanding <= $0.02

/*
UPDATE booking_data b
SET status = 'Close'
WHERE 
    -- Outstanding is very small (floating point error range)
    ABS(
        ((SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) - b.discount) - 
        (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno)
    ) > 0 
    AND ABS(
        ((SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) - b.discount) - 
        (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno)
    ) <= 0.02
    AND b.status != 'Close';
*/

-- Similarly for exchange orders
SELECT 
    e.exchangeno,
    e.supplier,
    e.status,
    (SELECT COALESCE(SUM(price), 0) FROM exchange_item_data WHERE exchangeno = e.exchangeno) as items_total,
    (SELECT COALESCE(SUM(amountpaid), 0) FROM exchange_payment_data WHERE exchangeno = e.exchangeno) as payments_total,
    (SELECT COALESCE(SUM(price), 0) FROM exchange_item_data WHERE exchangeno = e.exchangeno) - 
    (SELECT COALESCE(SUM(amountpaid), 0) FROM exchange_payment_data WHERE exchangeno = e.exchangeno) as outstanding,
    'Will be set to Close' as action
FROM exchange_data e
WHERE 
    ABS(
        (SELECT COALESCE(SUM(price), 0) FROM exchange_item_data WHERE exchangeno = e.exchangeno) - 
        (SELECT COALESCE(SUM(amountpaid), 0) FROM exchange_payment_data WHERE exchangeno = e.exchangeno)
    ) > 0 
    AND ABS(
        (SELECT COALESCE(SUM(price), 0) FROM exchange_item_data WHERE exchangeno = e.exchangeno) - 
        (SELECT COALESCE(SUM(amountpaid), 0) FROM exchange_payment_data WHERE exchangeno = e.exchangeno)
    ) <= 0.02
    AND e.status != 'Close';

/*
UPDATE exchange_data e
SET status = 'Close'
WHERE 
    ABS(
        (SELECT COALESCE(SUM(price), 0) FROM exchange_item_data WHERE exchangeno = e.exchangeno) - 
        (SELECT COALESCE(SUM(amountpaid), 0) FROM exchange_payment_data WHERE exchangeno = e.exchangeno)
    ) > 0 
    AND ABS(
        (SELECT COALESCE(SUM(price), 0) FROM exchange_item_data WHERE exchangeno = e.exchangeno) - 
        (SELECT COALESCE(SUM(amountpaid), 0) FROM exchange_payment_data WHERE exchangeno = e.exchangeno)
    ) <= 0.02
    AND e.status != 'Close';
*/
