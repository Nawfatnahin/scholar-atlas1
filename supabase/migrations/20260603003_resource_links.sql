CREATE TABLE public.resource_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'link'
    CHECK (type IN ('link', 'gdrive', 'youtube', 'pdf', 'notes', 'other')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.resource_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own resource_links"
  ON public.resource_links FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_resource_links_subject ON public.resource_links(subject_id);
