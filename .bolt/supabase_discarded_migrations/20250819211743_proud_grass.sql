@@ .. @@
 create index if not exists products_slug_idx on products (slug);
 create index if not exists products_active_idx on products (is_active);
 
--- Add isAdmin column to profiles (with default false)
-alter table profiles add column if not exists isAdmin boolean not null default false;
-
 -- Enable RLS on products
 alter table products enable row level security;
 
@@ .. @@
 -- Admin can manage all products (using existing is_admin column)
 create policy if not exists "admin manage products"
   on products for all
-  using ((select is_admin from profiles where id = auth.uid()) = true);
+  to public
+  using (exists (
+    select 1 from profiles 
+    where id = auth.uid() and is_admin = true
+  ));