import { NextRequest, NextResponse } from 'next/server';
import { fetchCensusData, CensusRegion } from '@/lib/fetchCensusData';
import { predictPopulationWithTF, predictMultipleRegionsWithTF } from '@/lib/tfPredictionModel';

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

// Helper function to extract region name from question
function extractRegionFromQuestion(message: string, regions: CensusRegion[]): CensusRegion | null {
  const lowerMessage = message.toLowerCase();
  for (const region of regions) {
    const regionName = region.name.toLowerCase();
    if (lowerMessage.includes(regionName)) {
      return region;
    }
  }
  return null;
}

// Helper function to extract year from question
function extractYearFromQuestion(message: string): number | null {
  const yearMatch = message.match(/\b(20[2-9][0-9]|203[0-9]|204[0-9]|205[0-9])\b/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const censusData = await fetchCensusData();
    const regions = censusData.regions;
    const provinces = regions.filter(r => r.name !== 'Pakistan');

    // Extract region and year from question
    const targetRegion = extractRegionFromQuestion(message, regions);
    const targetYear = extractYearFromQuestion(message) || 2030;
    const yearsToPredict = Math.max(1, Math.min(targetYear - 2023, 20));

    let graphOption: any = null;
    let predictionData: any = null;

    if (targetRegion) {
      // Predict for specific region
      const predictions = await predictPopulationWithTF(targetRegion, yearsToPredict, regions);
      predictionData = predictions;

      // Create ECharts option for line chart
      const years = predictions.map(p => p.year.toString());
      graphOption = createLineChartOption(
        `Projected Population Growth for ${targetRegion.name} (${predictions[0].year}-${predictions[predictions.length - 1].year})`,
        years,
        [
          {
            name: 'Total Population',
            type: 'line',
            data: predictions.map(p => p.total_population),
            smooth: true,
            itemStyle: { color: '#3B82F6' },
            lineStyle: { width: 3 },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
                ]
              }
            }
          },
          {
            name: 'Urban',
            type: 'line',
            data: predictions.map(p => p.urban),
            smooth: true,
            itemStyle: { color: '#10B981' },
            lineStyle: { width: 2 }
          },
          {
            name: 'Rural',
            type: 'line',
            data: predictions.map(p => p.rural),
            smooth: true,
            itemStyle: { color: '#F59E0B' },
            lineStyle: { width: 2 }
          },
          {
            name: 'Literacy Rate',
            type: 'line',
            data: predictions.map(p => p.literacy_rate),
            smooth: true,
            itemStyle: { color: '#8B5CF6' },
            lineStyle: { width: 2, type: 'dashed' },
            yAxisIndex: 1
          }
        ]
      );

      // Add second y-axis for literacy rate
      graphOption.yAxis = [
        {
          type: 'value',
          name: 'Population',
          position: 'left',
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
        {
          type: 'value',
          name: 'Literacy Rate (%)',
          position: 'right',
          axisLabel: {
            formatter: '{value}%',
            color: '#6b7280'
          },
          splitLine: { show: false }
        }
      ];
    } else {
      // Predict for all provinces
      const allPredictions = await predictMultipleRegionsWithTF(provinces, yearsToPredict);

      // Create area chart for multi-region comparison
      const years = Array.from({ length: yearsToPredict }, (_, i) => (2023 + i + 1).toString());
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
      const series = Array.from(allPredictions.entries()).map(([regionName, preds], idx) => ({
        name: regionName,
        type: 'line',
        data: years.map(year => {
          const pred = preds.find(p => p.year.toString() === year);
          return pred ? pred.total_population : null;
        }),
        smooth: true,
        itemStyle: { color: colors[idx % colors.length] },
        lineStyle: { width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: colors[idx % colors.length] + '80' },
              { offset: 1, color: colors[idx % colors.length] + '10' }
            ]
          }
        }
      }));

      graphOption = createLineChartOption(
        `Projected Population Growth by Province (${years[0]}-${years[years.length - 1]})`,
        years,
        series
      );

      predictionData = Array.from(allPredictions.entries()).map(([name, preds]) => ({
        region: name,
        predictions: preds
      }));
    }

    return NextResponse.json({
      success: true,
      graphOption: graphOption,
      predictionData: predictionData
    });

  } catch (error: any) {
    console.error('Prediction API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate predictions',
        details: error.message
      },
      { status: 500 }
    );
  }
}

