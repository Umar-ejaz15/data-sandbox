import { NextResponse } from 'next/server';
import { getTransformedPopulationData } from '@/lib/fetchData';

export async function GET() {
  try {
    const data = await getTransformedPopulationData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching population data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch population data' },
      { status: 500 }
    );
  }
}

