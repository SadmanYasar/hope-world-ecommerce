import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Database } from "../_shared/database.types.ts";

const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const model = new Supabase.ai.Session('gte-small')

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json()
  const { description, id } = payload.record

  // Check if description has changed.
  if (description === payload?.old_record?.description) {
    return new Response("ok - no change");
  }

  // Generate embedding.
  const embedding = await model.run(description, {
    mean_pool: true,
    normalize: true,
  })

  // Store in database.
  const { error } = await supabase
    .from('products')
    .update({ embedding: JSON.stringify(embedding) })
    .eq('id', id)
  if (error) console.warn(error.message)

  return new Response('ok')
})
