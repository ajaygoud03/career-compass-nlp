// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbscvppredvhdtujvmfx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBic2N2cHByZWR2aGR0dWp2bWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkxODEsImV4cCI6MjA2ODE2NTE4MX0.kvTH4avOmvKLIQwtlrS0LHZBTj0wN5pJQ5Y4V6BAdYY\';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
