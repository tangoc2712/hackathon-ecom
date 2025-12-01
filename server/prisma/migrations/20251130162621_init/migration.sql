-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "full_name" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN,
    "img_url" VARCHAR(255),
    "role_id" INTEGER,
    "date_of_birth" DATE,
    "job" TEXT,
    "gender" TEXT,
    "uid" TEXT,
    "photo_url" TEXT,
    "provider" TEXT,
    "role" TEXT DEFAULT 'user',

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" UUID NOT NULL,
    "sku" TEXT,
    "name" TEXT,
    "description" TEXT,
    "price" DECIMAL,
    "currency" CHAR(1),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN,
    "sale_price" DECIMAL,
    "category_id" INTEGER,
    "product_url" VARCHAR(255),
    "stock" INTEGER DEFAULT 0,
    "photos" TEXT[],
    "colors" JSONB DEFAULT '[]',
    "sizes" TEXT[],
    "materials" TEXT,
    "care" TEXT,
    "photo_public_id" TEXT,
    "featured" BOOLEAN DEFAULT false,
    "category_name" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "orders" (
    "order_id" UUID NOT NULL,
    "user_id" TEXT,
    "status" TEXT,
    "order_total" DECIMAL(12,2),
    "currency" CHAR(3) DEFAULT 'USD',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "shipping_info" JSONB,
    "subtotal" DECIMAL DEFAULT 0,
    "tax" DECIMAL DEFAULT 0,
    "shipping_charges" DECIMAL DEFAULT 0,
    "discount" DECIMAL DEFAULT 0,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "order_item_id" UUID NOT NULL,
    "order_id" UUID,
    "product_id" UUID,
    "quantity" INTEGER,
    "unit_price" DECIMAL(12,2),
    "total_price" DECIMAL(12,2),

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "users"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;
