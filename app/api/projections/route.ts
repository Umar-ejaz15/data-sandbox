import { NextResponse } from 'next/server';
import { getTransformedPopulationData } from '@/lib/fetchData';
import { forecastMultipleProvinces, generateTrendData } from '@/lib/aiForecast';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const years = parseInt(searchParams.get('years') || '10');
    const province = searchParams.get('province');

    const { provinces, national } = await getTransformedPopulationData();
    
    if (province && province !== 'all') {
      const provinceData = provinces.find(p => p.province === province) || national;
      if (!provinceData) {
        return NextResponse.json(
          { error: 'Province not found' },
          { status: 404 }
        );
      }
      
      const forecasts = forecastMultipleProvinces([provinceData], years);
      const trend = generateTrendData(provinceData, forecasts.get(provinceData.province) || []);
      
      return NextResponse.json({
        province: provinceData.province,
        current: provinceData,
        forecasts: Array.from(forecasts.values())[0],
        trend
      });
    }

    // Return forecasts for all provinces
    const allProvinces = national ? [national, ...provinces] : provinces;
    const forecasts = forecastMultipleProvinces(allProvinces, years);
    
    const result: any = {};
    for (const prov of allProvinces) {
      const provForecasts = forecasts.get(prov.province) || [];
      result[prov.province] = {
        current: prov,
        forecasts: provForecasts,
        trend: generateTrendData(prov, provForecasts)
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating projections:', error);
    return NextResponse.json(
      { error: 'Failed to generate projections' },
      { status: 500 }
    );
  }
}

