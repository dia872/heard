// Shared CORS headers for Edge Functions. Mobile clients don't strictly
// need CORS, but having it explicit keeps the door open for a web build
// later and stops Supabase's default OPTIONS handling from confusing
// browser-based dev tools.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
