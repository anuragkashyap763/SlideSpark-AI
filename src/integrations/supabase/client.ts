import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ybpnugmcnslbylhqaxvb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicG51Z21jbnNsYnlsaHFheHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDcyNzMsImV4cCI6MjA3NzY4MzI3M30.lhYt_F9AEvdk2o4yBp1-avoqDQKRmMU_FwBv8uNtvL4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
