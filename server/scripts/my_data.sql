--
-- PostgreSQL database dump
--

\restrict 38QbPjtdyqC7yqhBdLDbpap7uAGaOBu7COHLwrmRkWliEylTSOTihs3f7hSvFfT

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg12+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg12+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id uuid NOT NULL,
    code text NOT NULL,
    amount numeric(65,30) NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    order_item_id uuid NOT NULL,
    order_id uuid,
    product_id uuid,
    quantity integer,
    unit_price numeric(12,2),
    total_price numeric(12,2)
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id uuid NOT NULL,
    user_id text,
    status text,
    order_total numeric(12,2),
    currency character(3) DEFAULT 'USD'::bpchar,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    shipping_info jsonb,
    subtotal numeric DEFAULT 0,
    tax numeric DEFAULT 0,
    shipping_charges numeric DEFAULT 0,
    discount numeric DEFAULT 0
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    product_id uuid NOT NULL,
    sku text,
    name text,
    description text,
    price numeric,
    currency character(1),
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean,
    sale_price numeric,
    category_id integer,
    product_url character varying(255),
    stock integer DEFAULT 0,
    photos text[],
    colors jsonb DEFAULT '[]'::jsonb,
    sizes text[],
    materials text,
    care text,
    photo_public_id text,
    featured boolean DEFAULT false,
    category_name text
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id uuid NOT NULL,
    email text NOT NULL,
    password_hash text,
    full_name text,
    phone text,
    address text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean,
    img_url character varying(255),
    role_id integer,
    date_of_birth date,
    job text,
    gender text,
    uid text,
    photo_url text,
    provider text,
    role text DEFAULT 'user'::text,
    city text,
    country text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    category_id integer NOT NULL,
    name text NOT NULL,
    parent_category_id integer,
    type text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    img_url text
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c8e7c2ca-0832-4a4d-b03c-fc4d74598fe2	7a1de42af8ef483b6e930f4da8da2c8ce00bd8caa4faabcc3a18b7b42d728d63	2025-11-30 16:26:21.846366+00	20251130162621_init	\N	\N	2025-11-30 16:26:21.809116+00	1
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, amount, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (order_item_id, order_id, product_id, quantity, unit_price, total_price) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (order_id, user_id, status, order_total, currency, created_at, updated_at, shipping_info, subtotal, tax, shipping_charges, discount) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (product_id, sku, name, description, price, currency, created_at, updated_at, is_active, sale_price, category_id, product_url, stock, photos, colors, sizes, materials, care, photo_public_id, featured, category_name) FROM stdin;
9726506a-32ac-4704-8f43-5586a15e7e8d	\N	AIRism Cotton T-Shirt	Shop unisex AIRism Cotton T-Shirt | Long Sleeve at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:37:07.188+00	2025-11-30 16:37:07.188+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/465193/item/usgoods_30_465193_3x4.jpg,https://api.fastretailing.com/ugc/v1/uq/gl/OFFICIAL_IMAGES/250910003028_official_styling_130016286_c-300-400}	[]	{S,M,L,XL}	\N	\N	scraped_1764520627183	t	men
3f8fb312-efcc-4e73-8dde-38528fbb0b82	\N	Waffle T-Shirt	Shop men's Waffle T-Shirt | Long Sleeve at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:37:15.075+00	2025-11-30 16:37:15.075+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/484780/item/goods_01_484780_3x4.jpg}	[]	{S,M,L,XL}	\N	\N	scraped_1764520635061	t	men
a90d84cd-5705-4d05-bed2-d8940c96b4ac	\N	HEATTECH Extra Warm Cashmere Blend Turtleneck	Shop men's HEATTECH Extra Warm Cashmere Blend Turtleneck at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:37:21.882+00	2025-11-30 16:37:21.882+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/481442/item/usgoods_30_481442_3x4.jpg}	[]	{S,M,L,XL}	\N	\N	scraped_1764520641881	f	men
0ac44b39-e248-4290-84c2-69620ab43454	\N	HEATTECH Extra Warm Cashmere Blend T-Shirt	Shop men's HEATTECH Extra Warm Cashmere Blend T-Shirt at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:37:30.144+00	2025-11-30 16:37:30.144+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/481441/item/usgoods_38_481441_3x4.jpg,https://api.fastretailing.com/ugc/v1/uq/gl/OFFICIAL_IMAGES/250910003029_official_styling_130016295_c-300-400,https://api.fastretailing.com/ugc/v1/uq/gl/OFFICIAL_IMAGES/250910003029_official_styling_130016296_c-300-400}	[]	{S,M,L,XL}	\N	\N	scraped_1764520650142	f	men
b99882be-e7ba-4044-8abb-a4c0d76b901e	\N	Soft Brushed T-Shirt	Shop men's Soft Brushed T-Shirt | Long Sleeve at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:37:36.374+00	2025-11-30 16:37:36.374+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/450179/item/usgoods_37_450179_3x4.jpg,https://api.fastretailing.com/ugc/v1/uq/gl/OFFICIAL_IMAGES/250910003029_official_styling_130016293_c-300-400,https://api.fastretailing.com/ugc/v1/uq/gl/OFFICIAL_IMAGES/250910003029_official_styling_130016299_c-300-400,https://api.fastretailing.com/ugc/v1/uq/gl/OFFICIAL_IMAGES/250910003029_official_styling_130016300_c-300-400,https://api.fastretailing.com/ugc/v1/uq/gl/OFFICIAL_IMAGES/250910003029_official_styling_130016302_c-300-400}	[]	{S,M,L,XL}	\N	\N	scraped_1764520656372	f	men
20d8febc-a3f8-48ac-85bb-a65de0dcd9c5	\N	Waffle T-Shirt	Shop women's Waffle T-Shirt | Long-Sleeve at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:37:59.309+00	2025-11-30 16:37:59.309+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/449860/item/usgoods_00_449860_3x4.jpg}	[]	{S,M,L,XL}	\N	\N	scraped_1764520679302	t	women
3740ee59-a789-4698-b96a-4e29f97f3a17	\N	Soft Ribbed T-Shirt	Shop women's Soft Ribbed T-Shirt | Long Sleeve | Striped at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:38:12.808+00	2025-11-30 16:38:12.808+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/480036/item/usgoods_01_480036_3x4.jpg}	[]	{S,M,L,XL}	\N	\N	scraped_1764520692803	t	women
318fa6da-a8bd-474a-8a9c-4f25991eb3f8	\N	Soft Ribbed Raglan T-Shirt	Shop women's Soft Ribbed Raglan T-Shirt | Long Sleeve at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:38:22.478+00	2025-11-30 16:38:22.478+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/476855/item/usgoods_58_476855_3x4.jpg}	[]	{S,M,L,XL}	\N	\N	scraped_1764520702475	f	women
9edfebf5-7721-41c3-8a30-2234a151b284	\N	Ribbed High Neck T-Shirt	Shop women's Ribbed High Neck T-Shirt at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:38:29.386+00	2025-11-30 16:38:29.386+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/479588/item/usgoods_03_479588_3x4.jpg}	[]	{S,M,L,XL}	\N	\N	scraped_1764520709385	f	women
5771a9f7-db83-4832-8897-edeefdec789d	\N	Ribbed High Neck T-Shirt	Shop women's Ribbed High Neck T-Shirt | Striped at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:38:35.896+00	2025-11-30 16:38:35.896+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/481026/item/usgoods_69_481026_3x4.jpg}	[]	{S,M,L,XL}	\N	\N	scraped_1764520715895	f	women
eb08ee3f-d752-4573-b6ab-825d95d7e32a	\N	HEATTECH Ultra Warm T-Shirt	Shop kids HEATTECH Ultra Warm T-Shirt at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:38:59.247+00	2025-11-30 16:38:59.247+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/470366/item/usgoods_09_470366_3x4.jpg}	[]	{S,M,L,XL}	\N	\N	scraped_1764520739245	t	kids
2c2a8851-ec63-4647-b7e9-5765acd2dee5	\N	Fleece T-Shirt	Shop kids Fleece T-Shirt | Long Sleeve at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:39:06.212+00	2025-11-30 16:39:06.212+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/481213/item/usgoods_01_481213_3x4.jpg}	[]	{S,M,L,XL}	\N	\N	scraped_1764520746211	t	kids
9beeedb1-5885-4fda-b694-01d2ebbbb0a1	\N	HEATTECH Cotton T-Shirt	Shop kids HEATTECH Cotton T-Shirt | Extra Warm at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:39:11.951+00	2025-11-30 16:39:11.951+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/470362/item/usgoods_08_470362_3x4.jpg}	[]	{S,M,L,XL}	\N	\N	scraped_1764520751950	f	kids
e11d5066-6d6c-4161-b451-87e42852b8aa	\N	Fleece T-Shirt	Shop kids Fleece T-Shirt | Striped | Long Sleeve at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:39:16.742+00	2025-11-30 16:39:16.742+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/482987/item/usgoods_69_482987_3x4.jpg}	[]	{S,M,L,XL}	\N	\N	scraped_1764520756741	f	kids
7ec714ea-7114-4b24-82d1-005f2a3163e8	\N	AIRism Cotton T-Shirt	Shop kids AIRism Cotton T-Shirt | Long Sleeve at UNIQLO US. Read customer reviews, explore styling ideas, and more.	2990	\N	2025-11-30 16:39:23.808+00	2025-11-30 16:39:23.808+00	\N	\N	\N	\N	100	{https://image.uniqlo.com/UQ/ST3/us/imagesgoods/474832/item/usgoods_68_474832_3x4.jpg}	[]	{S,M,L,XL}	\N	\N	scraped_1764520763807	f	kids
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, password_hash, full_name, phone, address, created_at, updated_at, is_active, img_url, role_id, date_of_birth, job, gender, uid, photo_url, provider, role) FROM stdin;
86cae1f1-bd73-4b1f-b483-4a3c7e3406e2	test@example.com	\N	Test User	\N	\N	2025-11-30 16:52:38.131+00	2025-11-30 16:52:38.131+00	\N	\N	\N	2025-11-30	\N	male	test_user_uid	https://via.placeholder.com/150	test	admin
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: coupons_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX coupons_code_key ON public.coupons USING btree (code);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_uid_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_uid_key ON public.users USING btree (uid);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(uid) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 38QbPjtdyqC7yqhBdLDbpap7uAGaOBu7COHLwrmRkWliEylTSOTihs3f7hSvFfT

