// Verbouwplan Leliestraat 27 — Supabase-verbinding.
// Deze URL en anon key zijn bedoeld om publiek in de site te staan (net als bij
// Google Fonts hiervoor); toegang wordt geregeld via Row Level Security-policies
// in Supabase zelf, niet door deze waarden geheim te houden.
//
// De supabase-js library wordt dynamisch geladen (niet als top-level import) zodat
// een trage of tijdelijk onbereikbare CDN niet de hele pagina blokkeert — de
// navigatie en een nette foutmelding blijven dan gewoon werken.

const SUPABASE_URL = "https://dytdshmimhaplbvzdeof.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dGRzaG1pbWhhcGxidnpkZW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODk1MjMsImV4cCI6MjEwNTU2NTUyM30.rPn4-qAz2LWR7fdYkxY8I7RnSmBKmFmJlXSsLu_SXTo";

let clientPromise = null;

export function getSupabase() {
  if (!clientPromise) {
    clientPromise = import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm")
      .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
  }
  return clientPromise;
}
