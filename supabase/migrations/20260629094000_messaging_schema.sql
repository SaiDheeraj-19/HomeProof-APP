-- Create conversations table
CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
    renter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create messages table
CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations" 
ON public.conversations FOR SELECT 
USING (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Users can insert conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Users can view messages in their conversations" 
ON public.messages FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.renter_id = auth.uid() OR c.owner_id = auth.uid())
));

CREATE POLICY "Users can send messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);
