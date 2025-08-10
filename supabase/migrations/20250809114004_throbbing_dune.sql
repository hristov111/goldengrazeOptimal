/*
  # Create Support System

  1. New Tables
    - `support_tickets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text, required)
      - `subject` (text, required)
      - `category` (text, enum)
      - `status` (text, enum)
      - `order_number` (text, optional)
      - `priority` (text, enum)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_message_at` (timestamp)
      - `metadata` (jsonb)
    - `support_messages`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references support_tickets)
      - `sender` (text, enum: customer/agent/system)
      - `user_id` (uuid, references auth.users)
      - `body` (text)
      - `attachments` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only see their own tickets and messages
    - Users can create tickets and messages for their own tickets

  3. Triggers
    - Auto-update ticket updated_at on changes
    - Auto-update last_message_at when new message added
*/

-- Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  subject text NOT NULL,
  category text CHECK (category IN ('order','billing','shipping','product','technical','other')) DEFAULT 'other',
  status text NOT NULL CHECK (status IN ('open','pending_customer','resolved','closed')) DEFAULT 'open',
  order_number text,
  priority text CHECK (priority IN ('normal','high')) DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb
);

-- Support Messages
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('customer','agent','system')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text,
  attachments jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_last_message ON public.support_tickets(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON public.support_messages(ticket_id);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Tickets
CREATE POLICY "tickets_select_own"
ON public.support_tickets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "tickets_insert_self"
ON public.support_tickets FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "tickets_update_own"
ON public.support_tickets FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (true);

-- RLS Policies for Messages
CREATE POLICY "messages_select_by_owner"
ON public.support_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets t 
    WHERE t.id = ticket_id AND t.user_id = auth.uid()
  )
);

CREATE POLICY "messages_insert_by_owner"
ON public.support_messages FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.support_tickets t 
    WHERE t.id = ticket_id AND t.user_id = auth.uid()
  )
);

-- Trigger Functions
CREATE OR REPLACE FUNCTION public.touch_support_ticket()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

CREATE OR REPLACE FUNCTION public.bump_last_message()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  UPDATE public.support_tickets 
  SET last_message_at = now() 
  WHERE id = NEW.ticket_id; 
  RETURN NEW; 
END $$;

-- Triggers
DROP TRIGGER IF EXISTS trg_ticket_touch ON public.support_tickets;
CREATE TRIGGER trg_ticket_touch 
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.touch_support_ticket();

DROP TRIGGER IF EXISTS trg_message_bump ON public.support_messages;
CREATE TRIGGER trg_message_bump 
AFTER INSERT ON public.support_messages
FOR EACH ROW EXECUTE FUNCTION public.bump_last_message();