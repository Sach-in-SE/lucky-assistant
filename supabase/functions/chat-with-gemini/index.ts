
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key is not configured')
      throw new Error('Gemini API key is not configured')
    }

    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      console.error('Invalid or missing prompt')
      throw new Error('Invalid or missing prompt')
    }

    console.log('Sending request to Gemini API with prompt:', prompt)
    
    // Add API key as URL parameter (Google's recommended approach)
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };
    
    console.log('Request payload:', JSON.stringify(payload));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error response:', errorData)
      throw new Error(`Failed to get response from Gemini API: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Received response from Gemini API:', JSON.stringify(data).substring(0, 300) + '...');

    // Handle the response format from Gemini API
    let generatedText = "";
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      generatedText = data.candidates[0].content.parts[0].text || "";
    } else {
      console.error('Unexpected response format:', JSON.stringify(data));
      throw new Error('Unexpected response format from Gemini API');
    }

    return new Response(
      JSON.stringify({ generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in chat-with-gemini function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
