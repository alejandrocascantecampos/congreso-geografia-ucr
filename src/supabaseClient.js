import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssadfbndvcckdxoybotm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzYWRmYm5kdmNja2R4b3lib3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDI3MDEsImV4cCI6MjA2NzgxODcwMX0.lOLBiN_WhJW-GkFfkD6mTKg2S-oG-I-sGY8hp_TFT98';

export const supabase = createClient(supabaseUrl, supabaseKey);
