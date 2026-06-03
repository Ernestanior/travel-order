-- ----------------------------------------------------------
-- MDB Tools - A library for reading MS Access database files
-- Copyright (C) 2000-2011 Brian Bruns and others.
-- Files in libmdb are licensed under LGPL and the utilities under
-- the GPL, see COPYING.LIB and COPYING files respectively.
-- Check out http://mdbtools.sourceforge.net
-- ----------------------------------------------------------

SET client_encoding = 'UTF-8';

CREATE TABLE IF NOT EXISTS "0copy of booking payment data"
 (
	"id"			INTEGER, 
	"receiptno"			VARCHAR (50), 
	"bookno"			VARCHAR (50), 
	"receiptdate"			DATE, 
	"paytype"			VARCHAR (50), 
	"for"			VARCHAR (50), 
	"chequeno"			VARCHAR (50), 
	"visano"			VARCHAR (50), 
	"amountpaid"			NUMERIC(15,2), 
	"paidtext"			VARCHAR (100), 
	"customer"			VARCHAR (100), 
	"payfor"			VARCHAR (255)
);
COMMENT ON COLUMN "0copy of booking payment data"."receiptno" IS 'Primary key, Receipt number';
COMMENT ON COLUMN "0copy of booking payment data"."bookno" IS 'Foreign key, Booking order number';
COMMENT ON COLUMN "0copy of booking payment data"."paytype" IS 'Cash, Cheque, Visa or Nets';
COMMENT ON COLUMN "0copy of booking payment data"."for" IS 'Deposit, Balance or Full';

-- CREATE INDEXES ...
CREATE INDEX "0copy of booking payment data_amountpaid_idx" ON "0copy of booking payment data" ("amountpaid");
CREATE INDEX "0copy of booking payment data_id_idx" ON "0copy of booking payment data" ("id");

CREATE TABLE IF NOT EXISTS "accountant data"
 (
	"id"			INTEGER, 
	"pvno"			VARCHAR (50), 
	"agent"			VARCHAR (200), 
	"paiddate"			DATE, 
	"paymode"			VARCHAR (50)
);
COMMENT ON COLUMN "accountant data"."pvno" IS 'Payment Voucher Number';
COMMENT ON COLUMN "accountant data"."paymode" IS 'Cheque Number';

-- CREATE INDEXES ...
CREATE INDEX "accountant data_id_idx" ON "accountant data" ("id");
ALTER TABLE "accountant data" ADD CONSTRAINT "accountant data_pkey" PRIMARY KEY ("id");

CREATE TABLE IF NOT EXISTS "accountant subdata"
 (
	"id"			INTEGER, 
	"pvno"			VARCHAR (50), 
	"tbfno"			VARCHAR (50), 
	"amount"			NUMERIC(15,2)
);

-- CREATE INDEXES ...
CREATE INDEX "accountant subdata_id_idx" ON "accountant subdata" ("id");
ALTER TABLE "accountant subdata" ADD CONSTRAINT "accountant subdata_pkey" PRIMARY KEY ("id", "tbfno", "amount");

CREATE TABLE IF NOT EXISTS "agree data"
 (
	"agree"			BOOLEAN NOT NULL, 
	"user"			VARCHAR (50), 
	"password"			VARCHAR (50), 
	"password2"			VARCHAR (50), 
	"password3"			VARCHAR (50)
);

-- CREATE INDEXES ...
ALTER TABLE "agree data" ADD CONSTRAINT "agree data_pkey" PRIMARY KEY ("agree");

CREATE TABLE IF NOT EXISTS "booking payment data"
 (
	"id"			INTEGER, 
	"receiptno"			VARCHAR (50), 
	"bookno"			VARCHAR (50), 
	"receiptdate"			DATE, 
	"paytype"			VARCHAR (50), 
	"for"			VARCHAR (50), 
	"chequeno"			VARCHAR (50), 
	"visano"			VARCHAR (50), 
	"amountpaid"			NUMERIC(15,2), 
	"paidtext"			VARCHAR (100), 
	"customer"			VARCHAR (100), 
	"payfor"			VARCHAR (255)
);
COMMENT ON COLUMN "booking payment data"."receiptno" IS 'Primary key, Receipt number';
COMMENT ON COLUMN "booking payment data"."bookno" IS 'Foreign key, Booking order number';
COMMENT ON COLUMN "booking payment data"."paytype" IS 'Cash, Cheque, Visa or Nets';
COMMENT ON COLUMN "booking payment data"."for" IS 'Deposit, Balance or Full';

-- CREATE INDEXES ...
CREATE INDEX "booking payment data_amountpaid_idx" ON "booking payment data" ("amountpaid");
CREATE INDEX "booking payment data_id_idx" ON "booking payment data" ("id");

CREATE TABLE IF NOT EXISTS "customer data"
 (
	"customer"			VARCHAR (200), 
	"address"			VARCHAR (255), 
	"tel"			VARCHAR (50), 
	"fax"			VARCHAR (50)
);
COMMENT ON COLUMN "customer data"."customer" IS 'Name of customer';

-- CREATE INDEXES ...
ALTER TABLE "customer data" ADD CONSTRAINT "customer data_pkey" PRIMARY KEY ("customer", "tel");

CREATE TABLE IF NOT EXISTS "dollar data"
 (
	"num"			NUMERIC(15,2), 
	"numtext"			VARCHAR (50)
);

-- CREATE INDEXES ...
CREATE INDEX "dollar data_num_idx" ON "dollar data" ("num");
CREATE INDEX "dollar data_numtext_idx" ON "dollar data" ("numtext");
ALTER TABLE "dollar data" ADD CONSTRAINT "dollar data_pkey" PRIMARY KEY ("num");

CREATE TABLE IF NOT EXISTS "exchange item data"
 (
	"exchangeno"			VARCHAR (50), 
	"item"			VARCHAR (50), 
	"quantity"			INTEGER, 
	"price"			NUMERIC(15,2), 
	"unitprice"			NUMERIC(15,2)
);

-- CREATE INDEXES ...
CREATE INDEX "exchange item data_exchange item dataexchangeno_idx" ON "exchange item data" ("exchangeno");
ALTER TABLE "exchange item data" ADD CONSTRAINT "exchange item data_pkey" PRIMARY KEY ("exchangeno", "item");

CREATE TABLE IF NOT EXISTS "exchange payment list"
 (
	"typeid"			INTEGER, 
	"paymenttype"			VARCHAR (50)
);

-- CREATE INDEXES ...
ALTER TABLE "exchange payment list" ADD CONSTRAINT "exchange payment list_pkey" PRIMARY KEY ("typeid");
CREATE INDEX "exchange payment list_typeid_idx" ON "exchange payment list" ("typeid");

CREATE TABLE IF NOT EXISTS "hotel voucher data"
 (
	"voucherno"			VARCHAR (50), 
	"bookno"			VARCHAR (50), 
	"exchangeno"			VARCHAR (50), 
	"hotel"			VARCHAR (100), 
	"htel"			VARCHAR (50), 
	"guest"			VARCHAR (50), 
	"adult"			INTEGER, 
	"cwb"			INTEGER, 
	"cnb"			INTEGER, 
	"single"			INTEGER, 
	"twin"			INTEGER, 
	"triple"			INTEGER, 
	"other"			INTEGER, 
	"checkin"			DATE, 
	"checkout"			DATE, 
	"remarks"			TEXT, 
	"amount"			NUMERIC(15,2), 
	"operator"			VARCHAR (50)
);
COMMENT ON COLUMN "hotel voucher data"."hotel" IS 'Name of Hotel';
COMMENT ON COLUMN "hotel voucher data"."htel" IS 'Hotel Telephone';
COMMENT ON COLUMN "hotel voucher data"."guest" IS 'Guest Name';
COMMENT ON COLUMN "hotel voucher data"."adult" IS '# of adult';
COMMENT ON COLUMN "hotel voucher data"."cwb" IS '# child with bed';
COMMENT ON COLUMN "hotel voucher data"."cnb" IS '# child with no bed';
COMMENT ON COLUMN "hotel voucher data"."checkin" IS 'Check in date';
COMMENT ON COLUMN "hotel voucher data"."checkout" IS 'Check out date';

-- CREATE INDEXES ...
ALTER TABLE "hotel voucher data" ADD CONSTRAINT "hotel voucher data_pkey" PRIMARY KEY ("voucherno");

CREATE TABLE IF NOT EXISTS "item data"
 (
	"bookno"			VARCHAR (50), 
	"item"			VARCHAR (50), 
	"quantity"			INTEGER, 
	"price"			NUMERIC(15,2), 
	"exchangeno"			VARCHAR (50), 
	"unitprice"			NUMERIC(15,2)
);
COMMENT ON COLUMN "item data"."bookno" IS 'Foreign key, Booking order number';

-- CREATE INDEXES ...
ALTER TABLE "item data" ADD CONSTRAINT "item data_pkey" PRIMARY KEY ("bookno", "item");

CREATE TABLE IF NOT EXISTS "item list"
 (
	"itemsn"			VARCHAR (50), 
	"itemdesc"			VARCHAR (50)
);

-- CREATE INDEXES ...
ALTER TABLE "item list" ADD CONSTRAINT "item list_pkey" PRIMARY KEY ("itemsn");

CREATE TABLE IF NOT EXISTS "old exchange data"
 (
	"id"			INTEGER, 
	"exchangeno"			VARCHAR (50), 
	"bookno"			VARCHAR (50), 
	"exchangedate"			DATE, 
	"supplier"			VARCHAR (200), 
	"status"			VARCHAR (50), 
	"bookdate"			DATE, 
	"customer"			VARCHAR (200), 
	"deptdate"			DATE, 
	"depttime"			VARCHAR (50), 
	"deptflt"			VARCHAR (50), 
	"deptdest"			VARCHAR (50), 
	"deptdate2"			DATE, 
	"depttime2"			VARCHAR (50), 
	"deptflt2"			VARCHAR (50), 
	"deptdest2"			VARCHAR (50), 
	"arrvdate"			DATE, 
	"arrvtime"			VARCHAR (50), 
	"arrvflt"			VARCHAR (50), 
	"arrvdest"			VARCHAR (50), 
	"arrvdate2"			DATE, 
	"arrvtime2"			VARCHAR (50), 
	"arrvflt2"			VARCHAR (50), 
	"arrvdest2"			VARCHAR (50), 
	"discount"			NUMERIC(15,2), 
	"tourcode"			VARCHAR (50), 
	"tour"			VARCHAR (50), 
	"staff"			VARCHAR (100), 
	"special"			VARCHAR (255)
);
COMMENT ON COLUMN "old exchange data"."exchangeno" IS 'Primary key, exchange order number';
COMMENT ON COLUMN "old exchange data"."bookno" IS 'Foreign key, Booking order number';
COMMENT ON COLUMN "old exchange data"."exchangedate" IS 'Date of Exchange';
COMMENT ON COLUMN "old exchange data"."supplier" IS 'Name of supplier';
COMMENT ON COLUMN "old exchange data"."bookdate" IS 'Date of Booking';
COMMENT ON COLUMN "old exchange data"."customer" IS 'Name of customer';
COMMENT ON COLUMN "old exchange data"."deptdate" IS 'Departure date';
COMMENT ON COLUMN "old exchange data"."depttime" IS 'Departure time';
COMMENT ON COLUMN "old exchange data"."deptflt" IS 'Departure flight';
COMMENT ON COLUMN "old exchange data"."arrvdate" IS 'Arrival date';
COMMENT ON COLUMN "old exchange data"."arrvtime" IS 'Arrival time';
COMMENT ON COLUMN "old exchange data"."arrvflt" IS 'Arrival flight';
COMMENT ON COLUMN "old exchange data"."staff" IS 'Name of staff attending the customer';
COMMENT ON COLUMN "old exchange data"."special" IS 'Special instruction';

-- CREATE INDEXES ...
CREATE INDEX "old exchange data_id_idx" ON "old exchange data" ("id");
CREATE INDEX "old exchange data_tourcode_idx" ON "old exchange data" ("tourcode");

CREATE TABLE IF NOT EXISTS "passenger data"
 (
	"bookno"			VARCHAR (50), 
	"paxname"			VARCHAR (50), 
	"passport"			VARCHAR (50), 
	"exchangeno"			VARCHAR (50)
);
COMMENT ON COLUMN "passenger data"."bookno" IS 'Foreign key, Booking order number';
COMMENT ON COLUMN "passenger data"."paxname" IS 'Name of passenger';
COMMENT ON COLUMN "passenger data"."passport" IS 'Passport number';

-- CREATE INDEXES ...
ALTER TABLE "passenger data" ADD CONSTRAINT "passenger data_pkey" PRIMARY KEY ("bookno", "paxname");

CREATE TABLE IF NOT EXISTS "pay list"
 (
	"payid"			INTEGER, 
	"pay type"			VARCHAR (50)
);

-- CREATE INDEXES ...
CREATE INDEX "pay list_payid_idx" ON "pay list" ("payid");
ALTER TABLE "pay list" ADD CONSTRAINT "pay list_pkey" PRIMARY KEY ("payid");

CREATE TABLE IF NOT EXISTS "payment list"
 (
	"typeid"			INTEGER, 
	"paymenttype"			VARCHAR (50)
);

-- CREATE INDEXES ...
ALTER TABLE "payment list" ADD CONSTRAINT "payment list_pkey" PRIMARY KEY ("typeid");
CREATE INDEX "payment list_typeid_idx" ON "payment list" ("typeid");

CREATE TABLE IF NOT EXISTS "refund data (not in use)"
 (
	"rid"			INTEGER, 
	"refundno"			INTEGER, 
	"bookno"			VARCHAR (50)
);

-- CREATE INDEXES ...
ALTER TABLE "refund data (not in use)" ADD CONSTRAINT "refund data (not in use)_pkey" PRIMARY KEY ("rid");
CREATE INDEX "refund data (not in use)_rid_idx" ON "refund data (not in use)" ("rid");

CREATE TABLE IF NOT EXISTS "refund subdata"
 (
	"refundno"			INTEGER, 
	"bookno"			VARCHAR (50), 
	"submitdate"			TIMESTAMP WITHOUT TIME ZONE, 
	"agent"			VARCHAR (50), 
	"amt"			NUMERIC(15,2), 
	"status"			VARCHAR (50), 
	"returnamt"			NUMERIC(15,2), 
	"refundamt"			NUMERIC(15,2), 
	"closeamt"			NUMERIC(15,2)
);

-- CREATE INDEXES ...
ALTER TABLE "refund subdata" ADD CONSTRAINT "refund subdata_pkey" PRIMARY KEY ("refundno", "agent");

CREATE TABLE IF NOT EXISTS "report list"
 (
	"reportno"			VARCHAR (50), 
	"reportlist"			VARCHAR (50)
);

-- CREATE INDEXES ...
ALTER TABLE "report list" ADD CONSTRAINT "report list_pkey" PRIMARY KEY ("reportno");

CREATE TABLE IF NOT EXISTS "supplier data"
 (
	"supplier"			VARCHAR (200), 
	"address"			VARCHAR (255), 
	"tel"			VARCHAR (50), 
	"fax"			VARCHAR (50)
);
COMMENT ON COLUMN "supplier data"."supplier" IS 'Name of supplier/company name';

-- CREATE INDEXES ...
ALTER TABLE "supplier data" ADD CONSTRAINT "supplier data_pkey" PRIMARY KEY ("supplier");

CREATE TABLE IF NOT EXISTS "booking data"
 (
	"id"			INTEGER, 
	"bookno"			VARCHAR (50), 
	"bookdate"			DATE, 
	"customer"			VARCHAR (200), 
	"deptdate"			DATE, 
	"depttime"			VARCHAR (50), 
	"deptflt"			VARCHAR (50), 
	"deptdest"			VARCHAR (50), 
	"deptdate2"			DATE, 
	"depttime2"			VARCHAR (50), 
	"deptflt2"			VARCHAR (50), 
	"deptdest2"			VARCHAR (50), 
	"arrvdate"			DATE, 
	"arrvtime"			VARCHAR (50), 
	"arrvflt"			VARCHAR (50), 
	"arrvdest"			VARCHAR (50), 
	"arrvdate2"			DATE, 
	"arrvtime2"			VARCHAR (50), 
	"arrvflt2"			VARCHAR (50), 
	"arrvdest2"			VARCHAR (50), 
	"discount"			NUMERIC(15,2), 
	"tourcode"			VARCHAR (50), 
	"tour"			VARCHAR (50), 
	"staff"			VARCHAR (100), 
	"status"			VARCHAR (50), 
	"special"			VARCHAR (255)
);
COMMENT ON COLUMN "booking data"."bookno" IS 'Primary key, Booking order number';
COMMENT ON COLUMN "booking data"."bookdate" IS 'Date of booking';
COMMENT ON COLUMN "booking data"."customer" IS 'Name of customer';
COMMENT ON COLUMN "booking data"."deptdate" IS 'Departure date';
COMMENT ON COLUMN "booking data"."depttime" IS 'Departure time';
COMMENT ON COLUMN "booking data"."deptflt" IS 'Departure flight';
COMMENT ON COLUMN "booking data"."arrvdate" IS 'Arrival date';
COMMENT ON COLUMN "booking data"."arrvtime" IS 'Arrival time';
COMMENT ON COLUMN "booking data"."arrvflt" IS 'Arrival flight';
COMMENT ON COLUMN "booking data"."staff" IS 'Name of staff attending the customer';
COMMENT ON COLUMN "booking data"."special" IS 'Special instruction';

-- CREATE INDEXES ...
CREATE INDEX "booking data_id_idx" ON "booking data" ("id");
CREATE INDEX "booking data_tourcode_idx" ON "booking data" ("tourcode");

CREATE TABLE IF NOT EXISTS "exchange data"
 (
	"id"			INTEGER, 
	"exchangeno"			VARCHAR (50), 
	"bookno"			VARCHAR (50), 
	"exchangedate"			DATE, 
	"supplier"			VARCHAR (200), 
	"status"			VARCHAR (50), 
	"bookdate"			DATE, 
	"customer"			VARCHAR (200), 
	"deptdate"			DATE, 
	"depttime"			VARCHAR (50), 
	"deptflt"			VARCHAR (50), 
	"deptdest"			VARCHAR (50), 
	"deptdate2"			DATE, 
	"depttime2"			VARCHAR (50), 
	"deptflt2"			VARCHAR (50), 
	"deptdest2"			VARCHAR (50), 
	"arrvdate"			DATE, 
	"arrvtime"			VARCHAR (50), 
	"arrvflt"			VARCHAR (50), 
	"arrvdest"			VARCHAR (50), 
	"arrvdate2"			DATE, 
	"arrvtime2"			VARCHAR (50), 
	"arrvflt2"			VARCHAR (50), 
	"arrvdest2"			VARCHAR (50), 
	"discount"			NUMERIC(15,2), 
	"tourcode"			VARCHAR (50), 
	"tour"			VARCHAR (50), 
	"staff"			VARCHAR (100), 
	"special"			VARCHAR (255)
);
COMMENT ON COLUMN "exchange data"."exchangeno" IS 'Primary key, exchange order number';
COMMENT ON COLUMN "exchange data"."bookno" IS 'Foreign key, Booking order number';
COMMENT ON COLUMN "exchange data"."exchangedate" IS 'Date of Exchange';
COMMENT ON COLUMN "exchange data"."supplier" IS 'Name of supplier';
COMMENT ON COLUMN "exchange data"."bookdate" IS 'Date of Booking';
COMMENT ON COLUMN "exchange data"."customer" IS 'Name of customer';
COMMENT ON COLUMN "exchange data"."deptdate" IS 'Departure date';
COMMENT ON COLUMN "exchange data"."depttime" IS 'Departure time';
COMMENT ON COLUMN "exchange data"."deptflt" IS 'Departure flight';
COMMENT ON COLUMN "exchange data"."arrvdate" IS 'Arrival date';
COMMENT ON COLUMN "exchange data"."arrvtime" IS 'Arrival time';
COMMENT ON COLUMN "exchange data"."arrvflt" IS 'Arrival flight';
COMMENT ON COLUMN "exchange data"."staff" IS 'Name of staff attending the customer';
COMMENT ON COLUMN "exchange data"."special" IS 'Special instruction';

-- CREATE INDEXES ...
CREATE INDEX "exchange data_id_idx" ON "exchange data" ("id");
CREATE INDEX "exchange data_tourcode_idx" ON "exchange data" ("tourcode");

CREATE TABLE IF NOT EXISTS "exchange payment data"
 (
	"exchangeno"			VARCHAR (50), 
	"bookno"			VARCHAR (50), 
	"receiptdate"			DATE, 
	"paytype"			VARCHAR (50), 
	"chequeno"			VARCHAR (50), 
	"amountpaid"			NUMERIC(15,2), 
	"remarks"			VARCHAR (255), 
	"issue"			VARCHAR (50), 
	"paidtext"			VARCHAR (100)
);
COMMENT ON COLUMN "exchange payment data"."exchangeno" IS 'Primary key, Exchange order number';
COMMENT ON COLUMN "exchange payment data"."bookno" IS 'Foreign key, Booking order number';
COMMENT ON COLUMN "exchange payment data"."paytype" IS 'Cash, Cheque, Visa or Nets';

-- CREATE INDEXES ...
CREATE INDEX "exchange payment data_amountpaid_idx" ON "exchange payment data" ("amountpaid");


-- CREATE Relationships ...
-- relationships are not implemented for postgres
