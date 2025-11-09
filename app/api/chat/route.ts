import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fetchCensusData, CensusRegion } from '@/lib/fetchCensusData';

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
function createSystemPrompt(populationData: any, isPredictionMode: boolean = false) {
  // Use the full data - Gemini 1.5 Flash can handle large contexts
  const dataSummary = JSON.stringify(populationData, null, 2);
  
  // Extract key regions for reference
  const regions = populationData?.regions?.map((r: any) => r.name).filter((n: string) => n !== 'Pakistan').join(', ') || 'Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad';
  
  const basePrompt = `You are an AI assistant specialized in answering questions about Pakistan's 2023 Census data. You have been trained on the complete census dataset and must answer questions based ONLY on this data.

AVAILABLE DATA:
- Complete demographic statistics (population, gender, sex ratios, density, urbanization)
- Education statistics (literacy rates, enrollment, school attendance, dropouts)
- Disability statistics (types: seeing, hearing, walking/climbing, communication, memorization/focus, self-care)
- Housing data (household types: pakka, semi-pakka, kacha)
- Infrastructure (structures: residential, economic, high-rise, under construction)
- Regional data for: ${regions}
- Urban vs Rural breakdowns for all metrics
- Growth rates and trends (2017-2023 comparison)
- Household sizes and population density`;

  if (isPredictionMode) {
    return `${basePrompt}

PREDICTION MODE ENABLED:
You are now in PREDICTION MODE. When users ask about future trends, predictions, or forecasts, you should:
1. Provide forecasts for population, literacy rates, urbanization, and other metrics based on historical data trends
2. Explain the predictions clearly with context about growth trends
3. Format predictions with appropriate timeframes (e.g., "By 2030", "Over the next 10 years")
4. Mention that predictions are based on historical trends and current growth rates
5. Be clear that these are projections based on current data patterns
6. DO NOT mention technical details like "TensorFlow.js", "neural network models", or "machine learning" - just present the predictions naturally

EXAMPLE PREDICTION QUESTIONS:
- "Predict Pakistan's population in 2030" → Forecast population growth based on historical trends
- "What will be the literacy rate in Punjab by 2035?" → Predict literacy improvement based on trends
- "Forecast urban population growth" → Project urbanization trends using historical data

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. For prediction questions, use the prediction data provided in the response
2. Always format numbers with commas (e.g., 241,499,431 not 241499431)
3. Be conversational and helpful, but always factual and accurate
4. Present predictions naturally without technical jargon
5. Include relevant context about historical trends
6. NEVER mention "TensorFlow", "neural network", "machine learning", or similar technical terms
7. ALWAYS provide a detailed text response explaining the data, even when graphs are shown
8. Reference the graph in your response (e.g., "As shown in the chart below" or "The visualization illustrates")
9. Provide insights and analysis, not just raw numbers

COMPLETE CENSUS DATA (2023):
${dataSummary}

IMPORTANT: In prediction mode, you will receive prediction data. Use this data to answer questions about future trends. Present it naturally without technical details.`;
  }
  
  return `${basePrompt}

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. Answer ONLY using the exact data provided below. Never make up, estimate, or guess numbers.
2. If information is not in the dataset, say: "I can only answer based on the 2023 Pakistan Census data available. That specific information is not included in the dataset."
3. Always format numbers with commas (e.g., 241,499,431 not 241499431).
4. When comparing regions or metrics, use the exact numbers from the data.
5. Be conversational and helpful, but always factual and accurate.
6. If a question is unclear, ask for clarification while staying within census data scope.
7. For percentages, calculate them from the raw numbers in the data when needed.
8. NEVER mention technical terms like "TensorFlow", "neural network", "machine learning", "AI models", or similar jargon. Just present the data naturally.
9. When presenting predictions, say things like "Based on current trends" or "Projected based on historical data" instead of technical methodology.
10. ALWAYS provide a detailed text response explaining the data, even when graphs are shown.
11. Reference the graph in your response (e.g., "As shown in the chart below" or "The visualization illustrates").
12. Provide insights and analysis, not just raw numbers. Explain what the data means.
13. When graphs are displayed, mention key findings from the visualization in your text response.
14. NEVER output JSON, code blocks, or structured data formats. Only provide natural language text responses.
15. NEVER include chart.js, recharts, or any chart library configuration in your response. Just describe the data in text.

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

// Helper function to detect if a question is about predictions
function isPredictionQuestion(message: string): boolean {
  const predictionKeywords = [
    'predict', 'forecast', 'future', 'will be', 'by 2030', 'by 2035', 'by 2040',
    'next 5 years', 'next 10 years', 'next decade', 'projection', 'trend',
    'growth forecast', 'estimate future', 'upcoming', 'coming years'
  ];
  const lowerMessage = message.toLowerCase();
  return predictionKeywords.some(keyword => lowerMessage.includes(keyword));
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
    const { message, conversationHistory = [], predictionMode = false } = await request.json();
    console.log('Received message:', message?.substring(0, 50) + '...');
    console.log('Prediction mode:', predictionMode);

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

    // Handle prediction mode and generate graphs
    let graphOption: any = null;
    let predictionContext = '';

    // Check question types for graph generation
    const isComparisonQuestion = /\b(compare|comparison|vs|versus|across|between)\b/i.test(message);
    const isDataQuestion = /\b(how many|what is|what percentage|show|display|graph|chart)\b/i.test(message);
    const lowerMessage = message.toLowerCase();
    
    // More keywords that should trigger graphs
    // In prediction mode, always show graphs for data questions. Otherwise, show graphs for most questions
    const shouldShowGraph = isPredictionQuestion(message) ? false : // Prediction graphs handled separately
      (predictionMode && (isComparisonQuestion || isDataQuestion || /\b(population|literacy|education|disability|housing|urban|rural|gender|sex ratio|density|growth|enrollment|household|pakka|kacha|structure|province|region)\b/i.test(message))) ||
      (!predictionMode && (isComparisonQuestion || 
      isDataQuestion || 
      /\b(population|literacy|education|disability|housing|urban|rural|gender|sex ratio|density|growth|enrollment|household|pakka|kacha|structure|province|region)\b/i.test(message) ||
      Math.random() > 0.15)); // 85% chance to show graph for any question

    // Helper function to create ECharts option for line chart (predictions)
    function createLineChartOption(title: string, xAxisData: string[], series: any[]) {
      return {
        backgroundColor: 'transparent',
        title: {
          text: title,
          left: 'center',
          textStyle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
          formatter: (params: any) => {
            let result = `<div style="padding: 8px;"><strong>${params[0].axisValue}</strong><br/>`;
            params.forEach((param: any) => {
              if (param.seriesName.includes('Rate') || param.seriesName.includes('%')) {
                result += `${param.seriesName}: ${param.value.toFixed(1)}%<br/>`;
              } else if (typeof param.value === 'number' && param.value > 1000) {
                result += `${param.seriesName}: ${(param.value / 1_000_000).toFixed(2)}M<br/>`;
              } else {
                result += `${param.seriesName}: ${param.value.toLocaleString()}<br/>`;
              }
            });
            result += '</div>';
            return result;
          },
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderColor: '#3B82F6',
          borderWidth: 2,
          textStyle: { color: '#fff', fontSize: 13 }
        },
        legend: {
          data: series.map(s => s.name),
          top: 35,
          textStyle: { fontSize: 12, fontWeight: '600', color: '#1f2937' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: { color: '#6b7280', fontSize: 11 },
          axisLine: { lineStyle: { color: '#e5e7eb' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: number) => {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
              return value.toString();
            },
            color: '#6b7280'
          },
          splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
        },
        series: series
      };
    }

    // Helper function to create ECharts option for bar chart
    function createBarChartOption(title: string, xAxisData: string[], series: any[]) {
      return {
        backgroundColor: 'transparent',
        title: {
          text: title,
          left: 'center',
          textStyle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            let result = `<div style="padding: 8px;"><strong>${params[0].name}</strong><br/>`;
            params.forEach((param: any) => {
              if (param.seriesName.includes('Rate') || param.seriesName.includes('%')) {
                result += `${param.seriesName}: ${param.value.toFixed(1)}%<br/>`;
              } else if (typeof param.value === 'number' && param.value > 1000) {
                result += `${param.seriesName}: ${(param.value / 1_000_000).toFixed(2)}M<br/>`;
              } else {
                result += `${param.seriesName}: ${param.value.toLocaleString()}<br/>`;
              }
            });
            result += '</div>';
            return result;
          },
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderColor: '#3B82F6',
          borderWidth: 2,
          textStyle: { color: '#fff', fontSize: 13 }
        },
        legend: {
          data: series.map(s => s.name),
          top: 35,
          textStyle: { fontSize: 12, fontWeight: '600', color: '#1f2937' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: { 
            rotate: 45,
            fontSize: 11,
            color: '#6b7280'
          },
          axisLine: { lineStyle: { color: '#e5e7eb' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: number) => {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
              return value.toString();
            },
            color: '#6b7280'
          },
          splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
        },
        series: series
      };
    }

    try {
      const censusData = await fetchCensusData();
      const regions = censusData.regions;
      const provinces = regions.filter(r => r.name !== 'Pakistan');

      if (isPredictionQuestion(message)) {
        // Prediction graphs are handled by separate API endpoint
        // Just add context note for the AI
        predictionContext = `\n\nNOTE: A prediction graph will be displayed separately showing future trends.`;
      } else if (shouldShowGraph) {
        // Generate graphs for various question types
        console.log('Generating graph for question...');
        
        // Determine graph type based on question content
        if (lowerMessage.includes('literacy') || lowerMessage.includes('education') || lowerMessage.includes('enrollment') || lowerMessage.includes('school')) {
          const regionNames = provinces.map(r => r.name);
          graphOption = createBarChartOption(
            'Literacy and Education Metrics by Province',
            regionNames,
            [
              {
                name: 'Literacy Rate',
                type: 'bar',
                data: provinces.map(r => r.education.total.literacy_rate),
                itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Primary Enrollment',
                type: 'bar',
                data: provinces.map(r => r.education.total.enrolment_primary),
                itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Matric Enrollment',
                type: 'bar',
                data: provinces.map(r => r.education.total.enrolment_matric),
                itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] }
              }
            ]
          );
        } else if (lowerMessage.includes('population') || lowerMessage.includes('density') || lowerMessage.includes('growth rate')) {
          const regionNames = provinces.map(r => r.name);
          graphOption = createBarChartOption(
            'Population and Growth Metrics by Province',
            regionNames,
            [
              {
                name: 'Population',
                type: 'bar',
                data: provinces.map(r => r.demographics.total_population),
                itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Density (per sq km)',
                type: 'bar',
                data: provinces.map(r => r.demographics.density_per_sq_km),
                itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Growth Rate (%)',
                type: 'bar',
                data: provinces.map(r => r.demographics.annual_growth_rate_2017_2023),
                itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] }
              }
            ]
          );
        } else if (lowerMessage.includes('disability') || lowerMessage.includes('seeing') || lowerMessage.includes('hearing') || lowerMessage.includes('walking') || lowerMessage.includes('communication')) {
          const regionNames = provinces.map(r => r.name);
          graphOption = createBarChartOption(
            'Disability Statistics by Province',
            regionNames,
            [
              {
                name: 'Total Disability',
                type: 'bar',
                data: provinces.map(r => r.disability.total.disability),
                itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Seeing',
                type: 'bar',
                data: provinces.map(r => r.disability.total.seeing),
                itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Hearing',
                type: 'bar',
                data: provinces.map(r => r.disability.total.hearing),
                itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Walking/Climbing',
                type: 'bar',
                data: provinces.map(r => r.disability.total.walking_climbing),
                itemStyle: { color: '#8B5CF6', borderRadius: [4, 4, 0, 0] }
              }
            ]
          );
        } else if (lowerMessage.includes('housing') || lowerMessage.includes('household') || lowerMessage.includes('pakka') || lowerMessage.includes('kacha') || lowerMessage.includes('semi-pakka')) {
          const regionNames = provinces.map(r => r.name);
          graphOption = createBarChartOption(
            'Housing Types by Province',
            regionNames,
            [
              {
                name: 'Pakka',
                type: 'bar',
                data: provinces.map(r => r.housing.total.pakka),
                itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Semi-Pakka',
                type: 'bar',
                data: provinces.map(r => r.housing.total.semi_pakka),
                itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Kacha',
                type: 'bar',
                data: provinces.map(r => r.housing.total.kacha),
                itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] }
              }
            ]
          );
        } else if (lowerMessage.includes('urban') || lowerMessage.includes('rural')) {
          const regionNames = provinces.map(r => r.name);
          graphOption = createBarChartOption(
            'Urban vs Rural Population by Province',
            regionNames,
            [
              {
                name: 'Urban',
                type: 'bar',
                data: provinces.map(r => r.demographics.urban.population),
                itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Rural',
                type: 'bar',
                data: provinces.map(r => r.demographics.rural.population),
                itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }
              }
            ]
          );
        } else if (lowerMessage.includes('sex ratio') || lowerMessage.includes('gender') || lowerMessage.includes('male') || lowerMessage.includes('female') || lowerMessage.includes('transgender')) {
          const regionNames = provinces.map(r => r.name);
          graphOption = createBarChartOption(
            'Gender Distribution by Province',
            regionNames,
            [
              {
                name: 'Male',
                type: 'bar',
                data: provinces.map(r => r.demographics.male),
                itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Female',
                type: 'bar',
                data: provinces.map(r => r.demographics.female),
                itemStyle: { color: '#EC4899', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Transgender',
                type: 'bar',
                data: provinces.map(r => r.demographics.transgender),
                itemStyle: { color: '#8B5CF6', borderRadius: [4, 4, 0, 0] }
              }
            ]
          );
        } else if (lowerMessage.includes('structure') || lowerMessage.includes('building') || lowerMessage.includes('residential') || lowerMessage.includes('economic') || lowerMessage.includes('high-rise')) {
          const regionNames = provinces.map(r => r.name);
          graphOption = createBarChartOption(
            'Building Structures by Province',
            regionNames,
            [
              {
                name: 'Residential',
                type: 'bar',
                data: provinces.map(r => r.structures.total.residential),
                itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Economic',
                type: 'bar',
                data: provinces.map(r => r.structures.total.economic),
                itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'High-Rise',
                type: 'bar',
                data: provinces.map(r => r.structures.total.high_rise),
                itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Under Construction',
                type: 'bar',
                data: provinces.map(r => r.structures.total.under_construction),
                itemStyle: { color: '#8B5CF6', borderRadius: [4, 4, 0, 0] }
              }
            ]
          );
        } else {
          // Default: show comprehensive population overview
          const regionNames = provinces.map(r => r.name);
          graphOption = createBarChartOption(
            'Population Overview by Province',
            regionNames,
            [
              {
                name: 'Total Population',
                type: 'bar',
                data: provinces.map(r => r.demographics.total_population),
                itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Urban',
                type: 'bar',
                data: provinces.map(r => r.demographics.urban.population),
                itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }
              },
              {
                name: 'Rural',
                type: 'bar',
                data: provinces.map(r => r.demographics.rural.population),
                itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] }
              }
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('Error generating graph:', error);
      // Continue without graph - will still provide text response
    }

    // Create system prompt with data
    const systemPrompt = createSystemPrompt(populationData, predictionMode || isPredictionQuestion(message));

    // Build the full prompt with conversation history
    let fullPrompt = systemPrompt;
    
    // Add prediction context if available
    if (predictionContext) {
      fullPrompt += predictionContext;
    }
    
    // Add note about graph if available
    if (graphOption) {
      fullPrompt += `\n\nIMPORTANT: A graph/chart will be displayed with this response showing the data visually. Make sure to:
1. Reference the graph in your response (e.g., "As shown in the chart below" or "The visualization illustrates")
2. Explain what the graph shows
3. Highlight key insights from the data
4. Provide detailed analysis, not just numbers`;
    }
    
    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      const historyText = conversationHistory
        .filter((msg: any) => msg.role && msg.content)
        .map((msg: any) => {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          return `${role}: ${msg.content}`;
        })
        .join('\n\n');
      
      fullPrompt = `${fullPrompt}\n\n\nPrevious conversation:\n${historyText}\n\nUser: ${message.trim()}\nAssistant:`;
    } else {
      // First message - include the system prompt and user message
      fullPrompt = `${fullPrompt}\n\n\nUser: ${message.trim()}\nAssistant:`;
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

    // Clean the response - remove any JSON structures, code blocks, or chart configurations
    let cleanedText = text;
    
    // Remove JSON objects (like chart.js configs)
    cleanedText = cleanedText.replace(/\{[\s\S]*?"type"\s*:\s*"pie"[\s\S]*?\}/g, '');
    cleanedText = cleanedText.replace(/\{[\s\S]*?"type"\s*:\s*"line"[\s\S]*?\}/g, '');
    cleanedText = cleanedText.replace(/\{[\s\S]*?"type"\s*:\s*"bar"[\s\S]*?\}/g, '');
    cleanedText = cleanedText.replace(/\{[\s\S]*?"graph"[\s\S]*?\}/g, '');
    cleanedText = cleanedText.replace(/\{[\s\S]*?"data"[\s\S]*?"labels"[\s\S]*?\}/g, '');
    
    // Remove code blocks that might contain JSON
    cleanedText = cleanedText.replace(/```[\s\S]*?```/g, '');
    cleanedText = cleanedText.replace(/`[\s\S]*?`/g, '');
    
    // Remove standalone JSON-like structures
    cleanedText = cleanedText.replace(/\{\s*"[\s\S]*?"\s*\}/g, '');
    
    // Clean up multiple newlines
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
    
    // Trim whitespace
    cleanedText = cleanedText.trim();

    return NextResponse.json({ 
      message: cleanedText,
      success: true,
      graphOption: graphOption || null
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

