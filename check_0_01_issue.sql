-- Check order T100016 for the 0.01 issue
-- This helps diagnose where the 0.01 outstanding comes from

SELECT 
    b.id,
    b.bookno,
    b.customer,
    b.discount,
    -- Items total
    (SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) as items_total,
    -- Payments total
    (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno) as payments_total,
    -- Calculated outstanding (should be 0)
    ((SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) - b.discount) - 
    (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno) as outstanding_raw,
    -- Rounded outstanding (what it should be after fix)
    ROUND(
        (((SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) - b.discount) - 
        (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno))::numeric, 2
    ) as outstanding_rounded
FROM booking_data b
WHERE b.bookno = 'T100016';

-- Check individual items for T100016
SELECT 
    bookno,
    item,
    quantity,
    unitprice,
    price,
    price::numeric(15,2) as price_rounded
FROM item_data 
WHERE bookno = 'T100016';

-- Check individual payments for T100016
SELECT 
    id,
    bookno,
    receiptno,
    receiptdate,
    paytype,
    amountpaid,
    amountpaid::numeric(15,2) as amount_rounded
FROM booking_payment_data 
WHERE bookno = 'T100016';

-- Find all orders with outstanding between 0.001 and 0.01
-- These are likely floating point precision issues
SELECT 
    b.bookno,
    b.customer,
    (SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) as items_total,
    b.discount,
    (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno) as payments_total,
    ((SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) - b.discount) - 
    (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno) as outstanding
FROM booking_data b
WHERE ABS(
    ((SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) - b.discount) - 
    (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno)
) > 0 AND ABS(
    ((SELECT COALESCE(SUM(price), 0) FROM item_data WHERE bookno = b.bookno) - b.discount) - 
    (SELECT COALESCE(SUM(amountpaid), 0) FROM booking_payment_data WHERE bookno = b.bookno)
) < 0.02
ORDER BY b.bookno;
