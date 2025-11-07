# Enhanced PDF extraction script for Table-1 and Table-2 at all levels
import pdfplumber
import pandas as pd
import glob
import json
import os
from pathlib import Path

# Get the script directory and find PDFs
script_dir = Path(__file__).parent
table1_pdfs = glob.glob(str(script_dir / "table_1*.pdf"))
table2_pdfs = glob.glob(str(script_dir / "table_2*.pdf"))

all_pdfs = table1_pdfs + table2_pdfs

if not all_pdfs:
    print("No PDF files found in scripts directory")
    exit(1)

print(f"Found {len(all_pdfs)} PDF files ({len(table1_pdfs)} Table-1, {len(table2_pdfs)} Table-2)")

all_data = []

for pdf in all_pdfs:
    print(f"Processing {os.path.basename(pdf)}...")
    try:
        # Determine table type, region, and level from filename
        filename = os.path.basename(pdf).lower()
        
        # Determine table type
        if "table_1" in filename or "table-1" in filename:
            table_type = "table_1"
        elif "table_2" in filename or "table-2" in filename:
            table_type = "table_2"
        else:
            table_type = "unknown"
        
        # Determine region
        if "national" in filename:
            region = "National"
            region_type = "country"
            level = "national"
        elif "punjab" in filename:
            region = "Punjab"
            region_type = "province"
            if "district" in filename:
                level = "district"
            else:
                level = "province"
        elif "sindh" in filename:
            region = "Sindh"
            region_type = "province"
            if "district" in filename:
                level = "district"
            else:
                level = "province"
        elif "balochistan" in filename:
            region = "Balochistan"
            region_type = "province"
            if "district" in filename:
                level = "district"
            else:
                level = "province"
        elif "kp" in filename or "khyber" in filename:
            region = "Khyber Pakhtunkhwa"
            region_type = "province"
            if "district" in filename:
                level = "district"
            else:
                level = "province"
        elif "islamabad" in filename:
            region = "Islamabad"
            region_type = "capital"
            level = "district"
        else:
            region = "Unknown"
            region_type = "unknown"
            level = "unknown"
        
        # Extract tables from PDF using pdfplumber
        pdf_doc = pdfplumber.open(pdf)
        
        # Process each page and extract tables
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
                    record['table_type'] = table_type
                    record['region'] = region
                    record['region_type'] = region_type
                    record['level'] = level
                    record['page'] = page_num + 1
                    record['table_index'] = table_idx
                    
                    all_data.append(record)
        
        pdf_doc.close()
                
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

# Print summary
table1_count = sum(1 for r in all_data if r.get('table_type') == 'table_1')
table2_count = sum(1 for r in all_data if r.get('table_type') == 'table_2')
print(f"Summary: {table1_count} Table-1 records, {table2_count} Table-2 records")
