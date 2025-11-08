import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Get API key and strip quotes if present
let GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Remove quotes if user added them in .env file
if (GEMINI_API_KEY) {
  GEMINI_API_KEY = GEMINI_API_KEY.replace(/^['"]|['"]$/g, '').trim();
}

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

// Initialize Gemini - The client gets the API key from the environment variable `GEMINI_API_KEY`
const ai = GEMINI_API_KEY ? new GoogleGenAI({}) : null;

// Cache population data to avoid reloading on every request
let cachedPopulationData: any = null;

// Load population data
function loadPopulationData() {
  if (cachedPopulationData) {
    console.log('Using cached population data');
    return cachedPopulationData;
  }
  
  try {
    // Try both possible paths
    let filePath = path.join(process.cwd(), 'public', 'data', 'population_2023.json');
    
    if (!fs.existsSync(filePath)) {
      // Try alternative path
      filePath = path.join(process.cwd(), 'public', 'population_2023.json');
    }
    
    if (!fs.existsSync(filePath)) {
      console.error('Population data file not found. Tried:', [
        path.join(process.cwd(), 'public', 'data', 'population_2023.json'),
        path.join(process.cwd(), 'public', 'population_2023.json')
      ]);
      return null;
    }
    
    console.log('Loading population data from:', filePath);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    cachedPopulationData = JSON.parse(fileContents);
    
    // Verify data structure
    if (!cachedPopulationData || !cachedPopulationData.regions) {
      console.error('Invalid population data structure');
      return null;
    }
    
    console.log(`Population data loaded successfully. Found ${cachedPopulationData.regions?.length || 0} regions`);
    return cachedPopulationData;
  } catch (error: any) {
    console.error('Error loading population data:', error);
    console.error('Error details:', error.message);
    return null;
  }
}

// Create system prompt with population data context
function createSystemPrompt(populationData: any) {
  // Use the full data - Gemini 1.5 Flash can handle large contexts
  const dataSummary = JSON.stringify(populationData, null, 2);
  
  // Extract key regions for reference
  const regions = populationData?.regions?.map((r: any) => r.name).filter((n: string) => n !== 'Pakistan').join(', ') || 'Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad';
  
  return `You are an AI assistant specialized in answering questions about Pakistan's 2023 Census data. You have been trained on the complete census dataset and must answer questions based ONLY on this data.

AVAILABLE DATA:
- Complete demographic statistics (population, gender, sex ratios, density, urbanization)
- Education statistics (literacy rates, enrollment, school attendance, dropouts)
- Disability statistics (types: seeing, hearing, walking/climbing, communication, memorization/focus, self-care)
- Housing data (household types: pakka, semi-pakka, kacha)
- Infrastructure (structures: residential, economic, high-rise, under construction)
- Regional data for: ${regions}
- Urban vs Rural breakdowns for all metrics
- Growth rates and trends (2017-2023 comparison)
- Household sizes and population density

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. Answer ONLY using the exact data provided below. Never make up, estimate, or guess numbers.
2. If information is not in the dataset, say: "I can only answer based on the 2023 Pakistan Census data available. That specific information is not included in the dataset."
3. Always format numbers with commas (e.g., 241,499,431 not 241499431).
4. When comparing regions or metrics, use the exact numbers from the data.
5. Be conversational and helpful, but always factual and accurate.
6. If a question is unclear, ask for clarification while staying within census data scope.
7. For percentages, calculate them from the raw numbers in the data when needed.

EXAMPLE QUESTIONS YOU CAN ANSWER:
- "What is the total population of Pakistan?" → Answer: 241,499,431
- "What is the literacy rate in Punjab?" → Use education.literacy_rate from Punjab data
- "Compare urban and rural populations" → Use demographics.urban and demographics.rural
- "What percentage of households are pakka?" → Calculate from housing.pakka / housing.households
- "What is the sex ratio in Sindh?" → Use demographics.sex_ratio from Sindh
- "How many people have disabilities?" → Use disability.disability from total
- "What is the growth rate from 2017 to 2023?" → Use annual_growth_rate_2017_2023
- "Which province has the highest population density?" → Compare density_per_sq_km across provinces

COMPLETE CENSUS DATA (2023):
${dataSummary}

IMPORTANT: This is your ONLY source of information. Every answer must be traceable to this data. Never invent statistics or use external knowledge about Pakistan's census.`;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    if (!ai) {
      console.error('GEMINI_API_KEY is missing. Current env:', {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET',
        NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'SET' : 'NOT SET'
      });
      return NextResponse.json(
        { 
          error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file.',
          details: 'GEMINI_API_KEY environment variable is missing. Make sure to restart your dev server after adding it.'
        },
        { status: 500 }
      );
    }

    console.log('API Key loaded successfully');
    const { message, conversationHistory = [] } = await request.json();
    console.log('Received message:', message?.substring(0, 50) + '...');

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Load population data
    console.log('Loading population data...');
    const populationData = loadPopulationData();
    if (!populationData) {
      console.error('Failed to load population data');
      return NextResponse.json(
        { 
          error: 'Failed to load population data',
          details: 'The population_2023.json file could not be loaded'
        },
        { status: 500 }
      );
    }
    console.log('Population data loaded successfully');

    // Create system prompt with data
    const systemPrompt = createSystemPrompt(populationData);

    // Build the full prompt with conversation history
    let fullPrompt = systemPrompt;
    
    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      const historyText = conversationHistory
        .filter((msg: any) => msg.role && msg.content)
        .map((msg: any) => {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          return `${role}: ${msg.content}`;
        })
        .join('\n\n');
      
      fullPrompt = `${systemPrompt}\n\n\nPrevious conversation:\n${historyText}\n\nUser: ${message.trim()}\nAssistant:`;
    } else {
      // First message - include the system prompt and user message
      fullPrompt = `${systemPrompt}\n\n\nUser: ${message.trim()}\nAssistant:`;
    }

    console.log('Sending message to Gemini...');
    console.log('Message length:', message.trim().length);
    console.log('Full prompt length:', fullPrompt.length);
    
    // Use the new API format
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    
    // Log response structure for debugging
    console.log('Response type:', typeof response);
    console.log('Response keys:', response ? Object.keys(response) : 'null');
    
    // Extract text from response - the new API should have response.text directly
    let text = '';
    try {
      // Try direct access first (as shown in the example)
      if (response && (response as any).text) {
        text = String((response as any).text);
      } else if (response && typeof response === 'object') {
        // Try alternative structures
        if ('candidates' in response && Array.isArray((response as any).candidates) && (response as any).candidates.length > 0) {
          const candidate = (response as any).candidates[0];
          if (candidate && candidate.content) {
            const content = candidate.content;
            if (typeof content === 'string') {
              text = content;
            } else if (content && content.parts && Array.isArray(content.parts)) {
              text = content.parts.map((part: any) => part.text || '').join('');
            }
          }
        }
      }
    } catch (e) {
      console.error('Error extracting text from response:', e);
      text = JSON.stringify(response);
    }
    
    console.log('Received response from Gemini, length:', text?.length || 0);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Empty response from AI',
          details: 'The AI model returned an empty response'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: text,
      success: true 
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    
    // Log the full error for debugging
    if (error.response) {
      console.error('Gemini API response error:', JSON.stringify(error.response, null, 2));
    }
    
    // Check for specific Gemini API errors
    let errorMessage = 'Failed to process chat message';
    let errorDetails = error.message || 'Unknown error';
    
    // Parse Gemini API error messages
    const errorStr = JSON.stringify(error).toLowerCase();
    const errorMsg = error.message?.toLowerCase() || '';
    
    if (errorMsg.includes('api_key') || errorMsg.includes('api key') || errorMsg.includes('invalid api key')) {
      errorMessage = 'Invalid or missing Gemini API key';
      errorDetails = 'Please check your GEMINI_API_KEY in the .env.local file and restart the server';
    } else if (errorMsg.includes('quota') || errorMsg.includes('rate limit') || errorMsg.includes('429')) {
      errorMessage = 'API rate limit exceeded';
      errorDetails = 'Please try again later. You may have exceeded your API quota.';
    } else if (errorMsg.includes('safety') || errorMsg.includes('blocked')) {
      errorMessage = 'Content was blocked by safety filters';
      errorDetails = 'Please rephrase your question';
    } else if (errorMsg.includes('model') || errorMsg.includes('not found') || errorMsg.includes('404')) {
      errorMessage = 'Model not found or unavailable';
      errorDetails = `The model may not be available. Error: ${error.message}`;
    } else if (errorMsg.includes('400') || errorMsg.includes('bad request')) {
      errorMessage = 'Invalid request to Gemini API';
      errorDetails = `The request format may be incorrect. Error: ${error.message}`;
    } else if (errorMsg.includes('500') || errorMsg.includes('internal server')) {
      errorMessage = 'Gemini API server error';
      errorDetails = 'The Gemini API is experiencing issues. Please try again later.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        fullError: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 5).join('\n')
        } : undefined
      },
      { status: 500 }
    );
  }
}

