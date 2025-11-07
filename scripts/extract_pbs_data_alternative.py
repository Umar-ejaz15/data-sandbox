# Alternative PDF extraction script using pdfplumber (no Java required)
import pdfplumber
import pandas as pd
import glob
import json
import os
from pathlib import Path

# Get the script directory and find PDFs
script_dir = Path(__file__).parent
pdfs = glob.glob(str(script_dir / "table_1*.pdf"))

if not pdfs:
    print("No PDF files found in scripts directory")
    exit(1)

print(f"Found {len(pdfs)} PDF files")

all_data = []

for pdf in pdfs:
    print(f"Processing {os.path.basename(pdf)}...")
    try:
        # Determine province/region from filename
        filename = os.path.basename(pdf).lower()
        if "national" in filename:
            region = "National"
            region_type = "country"
        elif "punjab" in filename:
            region = "Punjab"
            region_type = "province"
        elif "sindh" in filename:
            region = "Sindh"
            region_type = "province"
        elif "balochistan" in filename:
            region = "Balochistan"
            region_type = "province"
        elif "kp" in filename or "khyber" in filename:
            region = "Khyber Pakhtunkhwa"
            region_type = "province"
        elif "islamabad" in filename:
            region = "Islamabad"
            region_type = "capital"
        else:
            region = "Unknown"
            region_type = "unknown"
        
        # Extract tables from PDF using pdfplumber
        with pdfplumber.open(pdf) as pdf_doc:
            for page_num, page in enumerate(pdf_doc.pages):
                tables = page.extract_tables()
                
                for table_idx, table in enumerate(tables):
                    if not table or len(table) < 2:
                        continue
                    
                    # First row as headers
                    headers = [str(cell).strip() if cell else f"col_{i}" 
                              for i, cell in enumerate(table[0])]
                    
                    # Process data rows
                    for row in table[1:]:
                        if not row or all(not cell for cell in row):
                            continue
                        
                        # Create record
                        record = {}
                        for i, header in enumerate(headers):
                            value = row[i] if i < len(row) else None
                            # Clean the value
                            if value:
                                value = str(value).strip()
                            record[header] = value
                        
                        # Add metadata
                        record['source_file'] = os.path.basename(pdf)
                        record['region'] = region
                        record['region_type'] = region_type
                        record['page'] = page_num + 1
                        record['table_index'] = table_idx
                        
                        all_data.append(record)
                        
    except Exception as e:
        print(f"Error processing {pdf}: {str(e)}")
        import traceback
        traceback.print_exc()
        continue

# Save to JSON
output_path = script_dir.parent / "public" / "data" / "population_2023.json"
output_path.parent.mkdir(parents=True, exist_ok=True)

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(all_data, f, indent=2, ensure_ascii=False, default=str)

print(f"Extracted {len(all_data)} records")
print(f"Data saved to {output_path}")

