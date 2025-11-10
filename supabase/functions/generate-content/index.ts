import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, subject, difficulty, outputType } = await req.json();
    console.log('Generating content:', { topic, subject, difficulty, outputType });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Construct the system prompt based on output type
    let systemPrompt = '';
    
    if (outputType === 'notes') {
      systemPrompt = `You are an expert educational content creator. Create comprehensive, well-structured study notes on the given topic.
Format the notes with clear headings, subheadings, bullet points, and explanations.
Include key concepts, definitions, and examples where appropriate.
Adjust the complexity based on the difficulty level (${difficulty}).
Make the content engaging and easy to understand for ${difficulty} level students.`;
    } else if (outputType === 'quiz') {
      systemPrompt = `You are an expert quiz creator. Generate a quiz with 5-10 multiple-choice questions about the given topic.
Format each question as:
Question: [question text]
A) [option]
B) [option]
C) [option]
D) [option]
Correct Answer: [letter]
Explanation: [brief explanation]

Adjust difficulty based on ${difficulty} level.
Make questions thought-provoking and educational.`;
    } else if (outputType === 'summary') {
      systemPrompt = `You are an expert at creating concise, informative summaries.
Create a clear summary of the given topic that captures the essential points.
Use simple language and organize information logically.
Adjust depth based on ${difficulty} level.
Make it comprehensive yet concise.`;
    } else if (outputType === 'explanation') {
      systemPrompt = `You are an expert educator who excels at explaining complex concepts simply.
Provide a clear, step-by-step explanation of the given topic.
Use analogies and examples where helpful.
Break down complex ideas into digestible parts.
Adjust complexity based on ${difficulty} level.
Make it engaging and easy to follow.`;
    } else {
      systemPrompt = `You are an expert educational content creator.
Create high-quality educational content about the given topic.
Adjust complexity based on ${difficulty} level.
Make it engaging, accurate, and well-structured.`;
    }

    const userPrompt = `Subject: ${subject}\nTopic: ${topic}\n\nCreate ${outputType} for this topic at ${difficulty} difficulty level.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Content generated successfully');

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in generate-content function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});