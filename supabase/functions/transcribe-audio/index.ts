
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { audioUrl } = await req.json();
    console.log('Received audio URL:', audioUrl);

    if (!audioUrl) {
      throw new Error('No audio URL provided');
    }

    // Download audio file from Supabase storage
    console.log('Downloading audio file...');
    const audioResponse = await fetch(audioUrl);
    
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio file: ${audioResponse.statusText}`);
    }

    const audioBlob = await audioResponse.blob();
    console.log('Audio file downloaded, size:', audioBlob.size);

    // Prepare form data for OpenAI
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    console.log('Sending audio to OpenAI for transcription...');

    // Send to OpenAI Whisper API
    const openAIResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await openAIResponse.json();
    console.log('Transcription completed successfully');

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
