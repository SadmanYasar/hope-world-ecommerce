

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


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_permission" AS ENUM (
    'products.delete',
    'orders.delete',
    'products.create',
    'products.read',
    'products.update',
    'AR.create',
    'AR.read',
    'AR.update',
    'AR.delete',
    'orders.create',
    'orders.update',
    'orders.read',
    'category.create',
    'category.read',
    'category.update',
    'category.delete',
    'review.create',
    'review.read',
    'review.update',
    'review.delete'
);


ALTER TYPE "public"."app_permission" OWNER TO "postgres";


CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'moderator',
    'customer'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_user_role"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  -- Check if the user already has a role
  if not exists(select 1 from public.user_roles where user_id = new.id) then
    insert into public.user_roles (user_id, role)
    values (new.id, 'Customer');
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."add_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."authorize"("permission" "public"."app_permission") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
    bind_permissions INT;
    user_role public.app_role;
    local_permission public.app_permission; -- Declare a local variable
BEGIN
    -- Assign the argument to the local variable
    local_permission := permission;

    -- Fetch user role once and store it to reduce number of calls
    SELECT (auth.jwt() ->> 'user_role')::public.app_role INTO user_role;

    SELECT COUNT(*)
    INTO bind_permissions
    FROM public.role_permissions
    WHERE role_permissions.permission = local_permission -- Use the local variable
      AND role_permissions.role = user_role;

    RETURN bind_permissions > 0;
END;
$$;


ALTER FUNCTION "public"."authorize"("permission" "public"."app_permission") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_order_from_stripe"("p_user_id" "uuid", "p_stripe_session_id" "text", "p_total_amount" integer, "p_items" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product RECORD;
  v_order_product_id UUID;
  v_result JSONB;
  v_created_products JSONB[] := '{}';
  v_current_date TEXT;
BEGIN
  -- Get current date
  v_current_date := to_char(NOW(), 'MM/DD/YYYY');
  
  -- Validate inputs
  IF p_user_id IS NULL OR p_stripe_session_id IS NULL OR p_total_amount IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Missing required parameters'
    );
  END IF;

  -- Check if order already exists (prevent duplicate processing)
  SELECT id INTO v_order_id
  FROM orders 
  WHERE stripe_session_id = p_stripe_session_id;
  
  IF v_order_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order already exists',
      'order_id', v_order_id
    );
  END IF;

  -- Validate that all products exist and get their current prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, price INTO v_product
    FROM products 
    WHERE id = (v_item->>'id')::UUID 
    AND visible = true;
    
    IF v_product.id IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Product not found or not available: ' || (v_item->>'id')
      );
    END IF;
    
    -- Validate quantity
    IF (v_item->>'quantity')::INTEGER <= 0 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Invalid quantity for product: ' || (v_item->>'id')
      );
    END IF;
  END LOOP;

  -- Create the order with status as an array of JSONB objects
  INSERT INTO orders (
    user_id,
    stripe_session_id,
    total_amount,
    status,
    created_at
  ) VALUES (
    p_user_id,
    p_stripe_session_id,
    p_total_amount,
    jsonb_build_array(
      jsonb_build_object(
        'date', v_current_date,
        'status', 'Ordered'
      ),
      jsonb_build_object(
        'status', 'Dispatched'
      ),
      jsonb_build_object(
        'status', 'In Transit'
      ),
      jsonb_build_object(
        'status', 'Delivered'
      )
    ),
    NOW()
  ) RETURNING id INTO v_order_id;

  -- Create order_products entries
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Get current product price
    SELECT id, price INTO v_product
    FROM products 
    WHERE id = (v_item->>'id')::UUID;
    
    -- Insert order_product
    INSERT INTO order_products (
      order_id,
      product_id,
      quantity,
      price_at_time
    ) VALUES (
      v_order_id,
      v_product.id,
      (v_item->>'quantity')::INTEGER,
      (v_product.price * 100)::INTEGER  -- Convert to cents
    ) RETURNING id INTO v_order_product_id;
    
    -- Build response data
    v_created_products := v_created_products || jsonb_build_object(
      'order_product_id', v_order_product_id,
      'product_id', v_product.id,
      'quantity', (v_item->>'quantity')::INTEGER,
      'price_at_time', (v_product.price * 100)::INTEGER
    );
  END LOOP;

  -- Build success response
  v_result := jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'stripe_session_id', p_stripe_session_id,
    'total_amount', p_total_amount,
    'products_count', jsonb_array_length(p_items),
    'created_products', v_created_products
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error details
    RAISE LOG 'Error in create_order_from_stripe: % %', SQLERRM, SQLSTATE;
    
    -- Return error response
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Database error occurred: ' || SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;


ALTER FUNCTION "public"."create_order_from_stripe"("p_user_id" "uuid", "p_stripe_session_id" "text", "p_total_amount" integer, "p_items" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$declare
    claims jsonb;
    user_role public.app_role;
  begin
    -- Fetch the user role in the user_roles table using LEFT JOIN
    select ur.role into user_role
    from public.user_roles ur
    where ur.user_id = (event->>'user_id')::uuid;

    claims := event->'claims';

    if user_role is not null then
        -- Set the claim
        claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    else
        claims := jsonb_set(claims, '{user_role}', '"customer"');
    end if;

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified or original event
    return event;
  end;$$;


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "embedding" "extensions"."vector"(384),
    "images" "text",
    "category" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "visible" boolean DEFAULT true
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON COLUMN "public"."products"."category" IS 'Product category';



CREATE OR REPLACE FUNCTION "public"."query_products_embedding"("embeddingparam" "extensions"."vector", "match_threshold" double precision) RETURNS SETOF "public"."products"
    LANGUAGE "plpgsql"
    AS $$begin
  return query
  select *
  from products

  -- The inner product is negative, so we negate match_threshold
  where products.embedding <#> embeddingparam < -match_threshold

  -- Our embeddings are normalized to length 1, so cosine similarity
  -- and inner product will produce the same query results.
  -- Using inner product which can be computed faster.
  --
  -- For the different distance functions, see https://github.com/pgvector/pgvector
  order by products.embedding <#> embeddingparam;
end;$$;


ALTER FUNCTION "public"."query_products_embedding"("embeddingparam" "extensions"."vector", "match_threshold" double precision) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ARCollectible" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "image" "text"
);


ALTER TABLE "public"."ARCollectible" OWNER TO "postgres";


ALTER TABLE "public"."ARCollectible" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."ARCollectible_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "text" "text"
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."categories" IS 'product categories';



ALTER TABLE "public"."categories" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."order_products" (
    "id" bigint NOT NULL,
    "order_id" bigint,
    "product_id" bigint,
    "quantity" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "price_at_time" integer
);


ALTER TABLE "public"."order_products" OWNER TO "postgres";


ALTER TABLE "public"."order_products" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."order_products_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "embedding" "extensions"."vector",
    "user_id" "uuid",
    "stripe_session_id" "text",
    "total_amount" integer,
    "status" "jsonb"[]
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


ALTER TABLE "public"."orders" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."orders_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."products" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."products_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text",
    "first_name" "text",
    "avatar_url" "text",
    "last_name" "text",
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "rating" integer,
    "comment" "text",
    "product_id" bigint
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


ALTER TABLE "public"."reviews" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."reviews_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" bigint NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "permission" "public"."app_permission" NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."role_permissions" IS 'Application permissions for each role.';



ALTER TABLE "public"."role_permissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."role_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role"
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_roles" IS 'Application roles for each user.';



ALTER TABLE "public"."user_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."ARCollectible"
    ADD CONSTRAINT "ARCollectible_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_products"
    ADD CONSTRAINT "order_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_stripe_session_id_key" UNIQUE ("stripe_session_id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_permission_key" UNIQUE ("role", "permission");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



CREATE INDEX "idx_order_id" ON "public"."order_products" USING "btree" ("order_id");



CREATE INDEX "idx_product_id" ON "public"."order_products" USING "btree" ("product_id");



CREATE INDEX "products_embedding_idx" ON "public"."products" USING "hnsw" ("embedding" "extensions"."vector_ip_ops");



CREATE OR REPLACE TRIGGER "on_product_insert_or_update" AFTER INSERT OR UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://nmhbfjasjdgbnozcmsri.supabase.co/functions/v1/generate-embedding', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taGJmamFzamRnYm5vemNtc3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MDcxNzcsImV4cCI6MjA0OTk4MzE3N30.8FaTs3bQyhGsKwiqQiBVHiIufHcjS2P4KC8to4VwTo4"}', '{}', '5000');



ALTER TABLE ONLY "public"."order_products"
    ADD CONSTRAINT "order_products_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."order_products"
    ADD CONSTRAINT "order_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_fkey" FOREIGN KEY ("category") REFERENCES "public"."categories"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."ARCollectible" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Add Authorized Create" ON "public"."products" FOR INSERT TO "authenticated" WITH CHECK ("public"."authorize"('products.create'::"public"."app_permission"));



CREATE POLICY "Add authorized delete" ON "public"."ARCollectible" FOR DELETE TO "authenticated" USING ("public"."authorize"('AR.delete'::"public"."app_permission"));



CREATE POLICY "Add authorized update" ON "public"."ARCollectible" FOR UPDATE TO "authenticated" USING ("public"."authorize"('AR.update'::"public"."app_permission"));



CREATE POLICY "Allow Authorized Create" ON "public"."categories" FOR INSERT TO "authenticated" WITH CHECK ("public"."authorize"('category.create'::"public"."app_permission"));



CREATE POLICY "Allow Authorized Create" ON "public"."reviews" FOR INSERT TO "authenticated" WITH CHECK ("public"."authorize"('review.create'::"public"."app_permission"));



CREATE POLICY "Allow Authorized Delete" ON "public"."categories" FOR DELETE TO "authenticated" USING ("public"."authorize"('category.delete'::"public"."app_permission"));



CREATE POLICY "Allow Authorized Delete" ON "public"."reviews" FOR DELETE TO "authenticated" USING ("public"."authorize"('review.delete'::"public"."app_permission"));



CREATE POLICY "Allow Authorized Update" ON "public"."categories" FOR UPDATE TO "authenticated" USING ("public"."authorize"('category.update'::"public"."app_permission"));



CREATE POLICY "Allow Authorized Update" ON "public"."reviews" FOR UPDATE TO "authenticated" USING ("public"."authorize"('review.update'::"public"."app_permission"));



CREATE POLICY "Allow auth admin to read user roles" ON "public"."user_roles" FOR SELECT TO "supabase_auth_admin" USING (true);



CREATE POLICY "Allow authorized create" ON "public"."ARCollectible" FOR INSERT TO "authenticated" WITH CHECK ("public"."authorize"('AR.create'::"public"."app_permission"));



CREATE POLICY "Authorised Delete" ON "public"."products" FOR DELETE TO "authenticated" USING ("public"."authorize"('products.delete'::"public"."app_permission"));



CREATE POLICY "Authorized Update" ON "public"."products" FOR UPDATE TO "authenticated" USING ("public"."authorize"('products.update'::"public"."app_permission"));



CREATE POLICY "Enable read access for all users" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."ARCollectible" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";










































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."add_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."authorize"("permission" "public"."app_permission") TO "anon";
GRANT ALL ON FUNCTION "public"."authorize"("permission" "public"."app_permission") TO "authenticated";
GRANT ALL ON FUNCTION "public"."authorize"("permission" "public"."app_permission") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_order_from_stripe"("p_user_id" "uuid", "p_stripe_session_id" "text", "p_total_amount" integer, "p_items" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_order_from_stripe"("p_user_id" "uuid", "p_stripe_session_id" "text", "p_total_amount" integer, "p_items" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_order_from_stripe"("p_user_id" "uuid", "p_stripe_session_id" "text", "p_total_amount" integer, "p_items" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";










































GRANT ALL ON TABLE "public"."ARCollectible" TO "anon";
GRANT ALL ON TABLE "public"."ARCollectible" TO "authenticated";
GRANT ALL ON TABLE "public"."ARCollectible" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ARCollectible_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ARCollectible_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ARCollectible_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."order_products" TO "anon";
GRANT ALL ON TABLE "public"."order_products" TO "authenticated";
GRANT ALL ON TABLE "public"."order_products" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_products_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_products_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_products_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON SEQUENCE "public"."orders_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."orders_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."orders_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON SEQUENCE "public"."reviews_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reviews_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reviews_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "service_role";
GRANT ALL ON TABLE "public"."user_roles" TO "supabase_auth_admin";



GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
