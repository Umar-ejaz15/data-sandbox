import os
import re
import json
from pathlib import Path
from typing import List, Dict, Any

try:
    from pdfminer.high_level import extract_text
except Exception as e:
    extract_text = None


ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / 'scripts'
OUTPUT_JSON = ROOT / 'public' / 'data' / 'population_2023.json'


def infer_table_type(filename: str) -> str:
    m = re.search(r'table[_\- ]?(\d+)', filename, flags=re.IGNORECASE)
    if m:
        return f"table_{m.group(1)}"
    # best-effort fallbacks by common keywords
    name = filename.lower()
    if 'urban' in name:
        return 'table_2'
    return 'table_1'


def clean_cell(value: str) -> str:
    return re.sub(r'\s+', ' ', value).strip()


def split_row(line: str) -> List[str]:
    # Split on 2+ spaces or tabs; keep commas within numbers
    parts = re.split(r'\s{2,}|\t+', line.strip())
    return [clean_cell(p) for p in parts if clean_cell(p)]


def parse_table_lines(lines: List[str], table_type_hint: str = '') -> List[Dict[str, Any]]:
    rows: List[List[str]] = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Skip page headers/footers
        if re.search(r'page\s+\d+|\bgovernment\b|\bstatistics\b', line, re.IGNORECASE):
            continue
        cols = split_row(line)
        # Heuristic: valid data rows usually have at least 2 columns
        if len(cols) >= 2:
            rows.append(cols)

    records: List[Dict[str, Any]] = []
    if not rows:
        return records

    # Try to detect header row by presence of text columns
    header_idx = 0
    for i, r in enumerate(rows[:10]):
        if any(re.search(k, ' '.join(r), re.IGNORECASE) for k in [
            'name', 'administrative', 'unit', 'district', 'area', 'locality', 'urban locality', 'population'
        ]):
            header_idx = i
            break

    header = rows[header_idx]
    data_rows = rows[header_idx + 1:]

    # Cap columns; pad or truncate row cells to header length for stability
    width = len(header)
    header = header[:width]

    for r in data_rows:
        row = (r + [''] * width)[:width]
        rec: Dict[str, Any] = { header[i]: row[i] for i in range(width) }
        records.append(rec)
    return records


def extract_records_from_pdf(pdf_path: Path) -> List[Dict[str, Any]]:
    if extract_text is None:
        raise RuntimeError('pdfminer.six is not available. Install it in your venv to run this script.')

    text = extract_text(str(pdf_path))
    # Split into blocks by double newlines to approximate rows groups
    lines = [ln for block in text.split('\n\n') for ln in block.split('\n')]

    table_type = infer_table_type(pdf_path.name)

    # Try general parser
    records = parse_table_lines(lines, table_type_hint=table_type)

    # Special-case: Table-16 (Functional Limitations & Disability)
    if table_type == 'table_16' and not records:
      # Heuristic: find a header containing Male/Female/Total and then parse following numeric rows
      header_line_idx = -1
      for idx, ln in enumerate(lines[:100]):
          if re.search(r'\bmale\b', ln, re.I) and re.search(r'\bfemale\b', ln, re.I):
              header_line_idx = idx
              break
      if header_line_idx != -1:
          header_cols = split_row(lines[header_line_idx])
          # Normalize header labels
          norm = []
          for h in header_cols:
              hl = h.lower()
              if 'male' in hl and 'per' not in hl:
                  norm.append('Male')
              elif 'female' in hl and 'per' not in hl:
                  norm.append('Female')
              elif 'total' in hl or 'both' in hl:
                  norm.append('Total')
              else:
                  norm.append(h)
          # Collect subsequent lines until blank gap as data rows
          for ln in lines[header_line_idx+1:]:
              if not ln.strip():
                  continue
              cols = split_row(ln)
              if len(cols) < 2:
                  continue
              # Build record with best-effort mapping; pad to header length
              row = (cols + [''] * len(norm))[:len(norm)]
              rec = { norm[i] if i < len(norm) else f'col_{i+1}': row[i] for i in range(len(row)) }
              # First column assumed as Category/Region label
              if 'Category' not in rec and 'Region' not in rec and 'NAME' not in rec:
                  rec['Category'] = row[0]
              records.append(rec)

    # Fallback: if still nothing, capture raw text (helps debug in UI)
    if table_type == 'table_16' and not records:
        snippet = '\n'.join(lines[:80])
        records = [{ 'Category': 'Raw Extract', 'raw_text': snippet }]

    for rec in records:
        rec['table_type'] = table_type
        rec['source_file'] = pdf_path.name
        # Try to preserve existing helpful metadata if present; otherwise leave to app normalization
    return records


def load_existing() -> List[Dict[str, Any]]:
    if OUTPUT_JSON.exists():
        try:
            with open(OUTPUT_JSON, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []


def save_json(records: List[Dict[str, Any]]):
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)


def main():
    existing = load_existing()

    # Index existing by (table_type, source_file, stringified row) to avoid duplicates on re-runs
    seen = set()
    for rec in existing:
        key = (
            rec.get('table_type', ''),
            rec.get('source_file', ''),
            json.dumps({k: rec[k] for k in rec if k not in ('table_type','source_file')}, sort_keys=True)
        )
        seen.add(key)

    new_records: List[Dict[str, Any]] = []
    for root, _, files in os.walk(PDF_DIR):
        for name in files:
            if not name.lower().endswith('.pdf'):
                continue
            pdf_path = Path(root) / name
            try:
                recs = extract_records_from_pdf(pdf_path)
                for rec in recs:
                    key = (
                        rec.get('table_type', ''),
                        rec.get('source_file', ''),
                        json.dumps({k: rec[k] for k in rec if k not in ('table_type','source_file')}, sort_keys=True)
                    )
                    if key not in seen:
                        new_records.append(rec)
                        seen.add(key)
                print(f"Parsed {len(recs)} rows from {pdf_path.name} -> {infer_table_type(pdf_path.name)}")
            except Exception as e:
                print(f"Failed to parse {pdf_path}: {e}")

    if not new_records:
        print('No new records found.')
        return

    output = existing + new_records
    save_json(output)
    print(f"Wrote {len(new_records)} new records. Total: {len(output)} -> {OUTPUT_JSON}")


if __name__ == '__main__':
    main()


