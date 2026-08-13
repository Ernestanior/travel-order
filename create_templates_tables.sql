-- 创建订单模板表
CREATE TABLE IF NOT EXISTS booking_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  customer VARCHAR(200) NOT NULL,
  tel VARCHAR(50) NOT NULL,
  address VARCHAR(255),
  email VARCHAR(255),
  discount DECIMAL(15, 2) DEFAULT 0,
  staff VARCHAR(100),
  tourcode VARCHAR(50),
  tour VARCHAR(50),
  special VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建模板项目表
CREATE TABLE IF NOT EXISTS booking_template_items (
  id SERIAL PRIMARY KEY,
  "templateId" INTEGER NOT NULL,
  item VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL,
  unitprice DECIMAL(15, 2) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  FOREIGN KEY ("templateId") REFERENCES booking_templates(id) ON DELETE CASCADE
);

-- 创建模板乘客表
CREATE TABLE IF NOT EXISTS booking_template_passengers (
  id SERIAL PRIMARY KEY,
  "templateId" INTEGER NOT NULL,
  paxname VARCHAR(50) NOT NULL,
  passport VARCHAR(50),
  birthdate DATE,
  passport_expiry_date DATE,
  FOREIGN KEY ("templateId") REFERENCES booking_templates(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_booking_template_items_templateId ON booking_template_items("templateId");
CREATE INDEX IF NOT EXISTS idx_booking_template_passengers_templateId ON booking_template_passengers("templateId");
