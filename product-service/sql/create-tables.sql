CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  price integer
);
CREATE TABLE stocks (
  product_id uuid,
  count integer,
  FOREIGN KEY ("product_id") REFERENCES "products" ("id")
);