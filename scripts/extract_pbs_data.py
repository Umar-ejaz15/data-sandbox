# Enhanced PDF extraction script for PBS Tables 1–11 at all levels
import pdfplumber
import pandas as pd
import glob
import json
import os
import re
from pathlib import Path

# Get the script directory and find PDFs
script_dir = Path(__file__).parent

# Collect PDFs for table_1 ... table_11 (handle case variations and hyphen/underscore)
pdf_patterns = [
    str(script_dir / f"table_{i}*.pdf") for i in range(1, 12)
]
pdf_patterns += [
    str(script_dir / f"Table_{i}*.pdf") for i in range(1, 12)
]
all_pdfs = []
for pattern in pdf_patterns:
    all_pdfs.extend(glob.glob(pattern))

if not all_pdfs:
    print("No PDF files found in scripts directory")
    exit(1)

print(f"Found {len(all_pdfs)} PDF files for Tables 1–11")

all_data = []

for pdf in all_pdfs:
    print(f"Processing {os.path.basename(pdf)}...")
    try:
        # Determine table type, region, and level from filename
        filename = os.path.basename(pdf).lower()
        
        # Determine table type dynamically (supports table_1 .. table_11)
        m = re.search(r"table[-_]?([0-9]{1,2})", filename)
        if m:
            table_num = int(m.group(1))
            if 1 <= table_num <= 11:
                table_type = f"table_{table_num}"
            else:
                table_type = "unknown"
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
                
                # First row as headers (do not include in data rows)
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

# Save outputs
data_dir = script_dir.parent / "public" / "data"
data_dir.mkdir(parents=True, exist_ok=True)

# 1) Combined dataset for all tables
combined_path = data_dir / "census_tables.json"
with open(combined_path, 'w', encoding='utf-8') as f:
    json.dump(all_data, f, indent=2, ensure_ascii=False, default=str)

# 2) Per-table datasets (table_1.json ... table_11.json)
for t in range(1, 12):
    t_key = f"table_{t}"
    subset = [r for r in all_data if r.get('table_type') == t_key]
    out = data_dir / f"{t_key}.json"
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(subset, f, indent=2, ensure_ascii=False, default=str)

# 3) Backward-compatible file for existing frontend (Table-1 and Table-2 only)
backcompat = [r for r in all_data if r.get('table_type') in ("table_1", "table_2")]
backcompat_path = data_dir / "population_2023.json"
with open(backcompat_path, 'w', encoding='utf-8') as f:
    json.dump(backcompat, f, indent=2, ensure_ascii=False, default=str)

# 4) Optional per-level splits per table
for t in range(1, 12):
    t_key = f"table_{t}"
    subset = [r for r in all_data if r.get('table_type') == t_key]
    if not subset:
        continue
    for lvl in ("national", "province", "district"):
        lvl_subset = [r for r in subset if r.get('level') == lvl]
        if lvl_subset:
            out = data_dir / f"{t_key}_{lvl}.json"
            with open(out, 'w', encoding='utf-8') as f:
                json.dump(lvl_subset, f, indent=2, ensure_ascii=False, default=str)

print(f"Extracted {len(all_data)} records")
print(f"Saved combined to {combined_path}")
print(f"Saved per-table JSONs and level splits under {data_dir}")

# Print summary counts
summary = {}
for r in all_data:
    t = r.get('table_type') or 'unknown'
    summary[t] = summary.get(t, 0) + 1
print("Summary counts by table:", summary)
