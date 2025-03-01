
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

const TOGETHER_API_KEY = "343084b5b60711aacaa2995ffd57bd11478a7d4970b7743c7174ac6972c05cb4";
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Parse request body
    const { message } = await req.json();
    console.log("Received message:", message);

    // Generate a more natural, conversational response using Together.ai
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
          {
            role: 'system',
            content: 'You are Lucky, a friendly and helpful assistant. Keep your responses natural, casual, and conversational. Avoid formal language or introducing yourself in every message. Respond as if you are having a natural conversation with a friend. Be helpful but sound human.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    console.log("Together.ai API response:", data);
    
    let aiResponse = "";
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      aiResponse = data.choices[0].message.content || "";
    } else {
      throw new Error('Unexpected response format from Together.ai API');
    }

    // Store the conversation in the database
    const { error } = await supabaseClient
      .from('chats')
      .insert({
        user_message: message,
        ai_response: aiResponse,
        model_used: 'mistralai/Mixtral-8x7B-Instruct-v0.1'
      });

    if (error) {
      console.error("Error storing chat in database:", error);
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      },
    );

  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      },
    );
  }
});
