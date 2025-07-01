import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
console.log("GEMINI_API_KEY:", GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const modelGemini = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
const model = new Supabase.ai.Session("gte-small");
Deno.serve(async (req) => {
  try {
    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }
    const { search } = await req.json();
    if (!search) {
      return new Response("Please provide a search param!", {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      });
    }
    // Generate embedding for search term.
    const embedding = await model.run(search, {
      mean_pool: true,
      normalize: true,
    });
    // Query embeddings.
    const { data: result, error } = await supabase
      .rpc("query_products_embedding", {
        embeddingparam: JSON.stringify(embedding),
        match_threshold: 0.8,
      })
      .select("name, description")
      .limit(3);
    if (error) {
      console.log("Error querying products:", error);
      throw error;
    }
    const prompt = `
    You are a chatbot that helps users find products. Given the search term "${search}", please provide a list of relevant products in markdown format. Each product should include the following information:
    
    - **Name**: The name of the product.
    - **Description**: A brief description of the product.
    
    Format the response as a markdown list, with each product on a new line. For example:
    
    - **Product 1 Name**: Description of product 1.
    - **Product 2 Name**: Description of product 2.
    
    Make sure to include only the top 3 products at max that match the search term. Only include the products that are relevant and you may discard the products that are irrelevant.

    **Search Results:**
    ${JSON.stringify(result)}
  `;
    const { response } = await modelGemini.generateContent(prompt);
    return Response.json(
      {
        search,
        response: response.text(),
      },
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error in catch:", error);
    return Response.json(
      {
        error,
      },
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
}); /* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Run `supabase functions serve`
  3. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/search' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"search":"vehicles"}'

*/
