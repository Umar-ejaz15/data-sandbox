import { NextResponse } from 'next/server';
import { getTransformedPopulationData } from '@/lib/fetchData';
import { forecastMultipleProvinces, generateTrendData } from '@/lib/aiForecast';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const years = parseInt(searchParams.get('years') || '10');

    const { provinces, national } = await getTransformedPopulationData();
    const allProvinces = national ? [national, ...provinces] : provinces;
    
    const forecasts = forecastMultipleProvinces(allProvinces, years);
    
    const trends: any = {};
    for (const prov of allProvinces) {
      const provForecasts = forecasts.get(prov.province) || [];
      trends[prov.province] = generateTrendData(prov, provForecasts);
    }

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}

