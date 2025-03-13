const isLocal = process.env.NODE_ENV === 'development';

export const SUPABASE_URL = isLocal ? 'http://127.0.0.1:54321' : process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;