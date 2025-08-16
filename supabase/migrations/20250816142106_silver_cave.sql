/*
  # Add unique constraint to order_number

  1. Database Changes
    - Add unique constraint on `orders.order_number` to prevent duplicate order numbers
    - This ensures each order has a unique identifier for tracking and prevents accidental duplicates

  2. Security
    - Maintains data integrity by preventing duplicate order numbers
    - Supports idempotency in order creation
*/

-- Add unique constraint to order_number if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_order_number_key' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE public.orders 
      ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
  END IF;
END $$;