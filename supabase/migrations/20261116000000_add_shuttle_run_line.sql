ALTER TABLE public.conditie_scores
ADD COLUMN shuttle_run_line text
CHECK (shuttle_run_line IN ('Geel', 'Blauw'));
