
// LaunchPad - Supabase Client

const { createClient } = window.supabase;

window.supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("LaunchPad connected to Supabase successfully!");
