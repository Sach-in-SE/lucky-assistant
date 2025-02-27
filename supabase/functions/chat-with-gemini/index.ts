
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_MODEL = "gemini-pro"
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`

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

    console.log(`Sending request to Gemini API (${GEMINI_MODEL}) with prompt:`, prompt)
    
    // Add API key as URL parameter
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
        maxOutputTokens: 800,
      }
    };
    
    console.log('Sending payload to Gemini API')
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    console.log('Gemini API response status:', response.status)
    
    if (!response.ok) {
      let errorMessage = `Status: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.text()
        console.error('Gemini API error response:', errorData)
        errorMessage += ` - Details: ${errorData}`
      } catch (e) {
        console.error('Could not read error response body:', e)
      }
      throw new Error(`Failed to get response from Gemini API: ${errorMessage}`)
    }

    const data = await response.json()
    console.log('Received response from Gemini API')

    // Handle the response format from Gemini API
    let generatedText = ""
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      generatedText = data.candidates[0].content.parts[0].text || ""
      console.log('Successfully extracted generated text')
    } else {
      console.error('Unexpected response format:', JSON.stringify(data).substring(0, 500))
      throw new Error('Unexpected response format from Gemini API')
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
