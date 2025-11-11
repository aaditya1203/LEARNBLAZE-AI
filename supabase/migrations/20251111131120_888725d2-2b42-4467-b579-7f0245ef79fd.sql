-- Create table for shared content
CREATE TABLE public.shared_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.content_history(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_content ENABLE ROW LEVEL SECURITY;

-- Users can view content shared with them
CREATE POLICY "Users can view shared content"
ON public.shared_content
FOR SELECT
USING (auth.uid() = shared_with OR auth.uid() = shared_by);

-- Users can share their own content
CREATE POLICY "Users can share own content"
ON public.shared_content
FOR INSERT
WITH CHECK (auth.uid() = shared_by);

-- Users can delete shares they created
CREATE POLICY "Users can delete own shares"
ON public.shared_content
FOR DELETE
USING (auth.uid() = shared_by);