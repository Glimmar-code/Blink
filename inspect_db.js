import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jhwgifrlxwspoedxjaly.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impod2dpZnJseHdzcG9lZHhqYWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMjQ3NDUsImV4cCI6MjA5NjcwMDc0NX0.-R9ITzT_lTptU8VuzRTy8co_ZZeegsUp5YkDJg1fITk";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase.from("posts").insert({
    author_id: "6cfec578-97a7-4d51-8873-97ac36195055",
    content: "Test post content",
  }).select();

  console.log("Insert simple result with UUID:", { data, error: error?.message });
}

main();
