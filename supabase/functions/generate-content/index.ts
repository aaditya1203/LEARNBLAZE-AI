import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { topic, subject, difficulty, outputType } = await req.json();
    console.log('Generating content:', { topic, subject, difficulty, outputType });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Construct the system prompt based on output type
    let systemPrompt = `You are an expert educational content creator. Always format your responses in clean Markdown.`;
    let userPrompt = '';
    
    if (outputType === 'notes') {
      systemPrompt += ` Create comprehensive, well-structured study notes.`;
      userPrompt = `Create detailed educational notes about "${topic}" for ${subject} at ${difficulty} level.

Format with:
- Clear ## headings for main sections
- **Bold** for key concepts
- Bullet points for lists
- Examples in > blockquotes
- Code blocks where relevant
- Include a mermaid diagram if it helps visualize concepts (wrap in \`\`\`mermaid blocks)

Make it comprehensive and well-organized.`;
    } else if (outputType === 'quiz') {
      systemPrompt += ` Generate educational quizzes with questions and answers.`;
      userPrompt = `Create a quiz about "${topic}" for ${subject} at ${difficulty} level.

Include:
- 10 questions (mix of multiple-choice, true/false, and short answer)
- Use **bold** for questions
- Number each question clearly
- Format multiple choice as A), B), C), D)
- Add an answer key at the end in a markdown table
- Include difficulty tags and explanations

Make it engaging and educational.`;
    } else if (outputType === 'summary') {
      systemPrompt += ` Create concise, informative summaries.`;
      userPrompt = `Create a summary about "${topic}" for ${subject} at ${difficulty} level.

Format with:
- ## Main heading
- Key points in bullet format
- **Bold** for important terms
- A mermaid flowchart if it helps show concept flow
- Brief but comprehensive

Capture essential points clearly.`;
    } else if (outputType === 'explanation') {
      systemPrompt += ` Explain complex concepts in simple, clear terms.`;
      userPrompt = `Provide a detailed explanation about "${topic}" for ${subject} at ${difficulty} level.

Format with:
- Clear ## headings for sections
- Step-by-step breakdown
- Real-world examples in blockquotes
- A mermaid diagram to visualize the concept
- **Bold** for key terms
- Use analogies where helpful

Make it easy to understand and engaging.`;
    } else if (outputType === 'flashcards') {
      systemPrompt += ` Create effective flashcards for learning.`;
      userPrompt = `Create 15 flashcards about "${topic}" for ${subject} at ${difficulty} level.

Format each as:
### Card [number]
**Q:** [question]
**A:** [answer]

Group related concepts and use clear, concise language.`;
    } else if (outputType === 'lessonplan') {
      systemPrompt += ` Create structured lesson plans.`;
      userPrompt = `Create a lesson plan about "${topic}" for ${subject} at ${difficulty} level.

Format with:
- ## Main sections (Objectives, Materials, Activities, Assessment)
- Bullet points for each item
- Time estimates in **bold**
- A mermaid gantt chart showing lesson timeline
- Clear learning outcomes

Make it practical and comprehensive.`;
    } else {
      userPrompt = `Create educational content about "${topic}" for ${subject} at ${difficulty} level. Format in clean Markdown with headings, lists, and proper formatting.`;
    }

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