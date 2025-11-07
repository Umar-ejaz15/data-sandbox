# Pakistan Population Census 2023 Dashboard

A comprehensive web application for visualizing and analyzing Pakistan's 2023 Population Census data. This dashboard provides interactive charts, demographic insights, urbanization trends, and population projections.

## Features

- 📊 **Interactive Visualizations**: Bar charts, line charts, pie charts, and heatmaps
- 📈 **Population Projections**: AI-powered forecasts for the next 10 years
- 🏙️ **Urbanization Trends**: Track urban vs rural population changes
- 📍 **Province-wise Analysis**: Detailed breakdown by province
- 💾 **Data Export**: Export data as JSON or CSV
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for PDF extraction)
- Java (required for tabula-py PDF extraction)

## Setup Instructions

### 1. Install Python Dependencies

First, install the Python packages needed for PDF extraction:

```bash
cd scripts
pip install -r requirements.txt
```

**Note**: `tabula-py` requires Java to be installed on your system. Make sure Java is installed and accessible in your PATH.

### 2. Extract Data from PDFs

Run the Python script to extract data from the PDF files:

```bash
cd scripts
python extract_pbs_data.py
```

This will:
- Read all `table_1*.pdf` files from the `scripts` directory
- Extract table data from each PDF
- Save the extracted data to `public/data/population_2023.json`

### 3. Install Node.js Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the dashboard.

## Project Structure

```
data-sandbox/
├── app/
│   ├── api/              # API routes for data and projections
│   ├── components/       # React components
│   │   ├── Demographics.tsx
│   │   ├── Heatmaps.tsx
│   │   ├── HeroSection.tsx
│   │   ├── InsightsPanel.tsx
│   │   ├── PopulationMap.tsx
│   │   ├── TrendPredictions.tsx
│   │   └── UrbanizationTrends.tsx
│   ├── hooks/            # Custom React hooks
│   └── page.tsx          # Main dashboard page
├── lib/
│   ├── aiForecast.ts     # Population forecasting logic
│   ├── fetchData.ts      # Data fetching utilities
│   ├── transformData.ts  # Data transformation utilities
│   └── constants.ts      # Constants and configuration
├── scripts/
│   ├── extract_pbs_data.py  # PDF extraction script
│   └── table_1_*.pdf        # PDF files to extract
├── store/
│   └── useAppStore.ts    # Zustand state management
└── public/
    └── data/
        └── population_2023.json  # Extracted census data
```

## Usage

### Dashboard Sections

1. **Overview**: Key insights, population map, and export tools
2. **Demographics**: Population by province, gender distribution, urban/rural breakdown
3. **Urbanization Trends**: Urbanization rates and forecasted trends
4. **Projections**: 10-year population growth forecasts

### Data Export

Click the "Export JSON" or "Export CSV" buttons in the Overview section to download the data.

## Technologies Used

- **Next.js 16**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **ECharts**: Data visualization
- **Zustand**: State management
- **Python**: PDF data extraction
- **tabula-py**: PDF table extraction

## Troubleshooting

### PDF Extraction Issues

If the PDF extraction fails:
1. Ensure Java is installed: `java -version`
2. Check that all PDF files are in the `scripts` directory
3. Verify PDF files are not corrupted or password-protected

### Data Not Loading

If the dashboard shows "Loading..." indefinitely:
1. Check that `public/data/population_2023.json` exists
2. Verify the JSON file is valid
3. Check browser console for errors

## Future Enhancements

- [ ] Interactive map visualization with geographic boundaries
- [ ] District-level detailed analysis
- [ ] Historical census data comparison
- [ ] Advanced filtering and search
- [ ] Real-time data updates

## License

This project is for educational and research purposes.
