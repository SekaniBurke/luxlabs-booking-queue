import { createClient } from "https://esm.sh/@supabase/supabase-js"

export const supabase = createClient(
    'https://bvaykdrhpuknissuuqyi.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2YXlrZHJocHVrbmlzc3V1cXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjYzNjUsImV4cCI6MjA3OTc0MjM2NX0.80kdHjInkQz53VtIN2G4tj4PSK2xiBjPhh2MpJ_JqEI'
);