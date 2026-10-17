import re
import json
import pandas as pd
from openpyxl import load_workbook

pattern = re.compile(r'^\s*=IMAGE\(\s*"([^"]+)"', re.IGNORECASE)

def extract_url(v):
    if isinstance(v, str):
        m = pattern.match(v)
        return m.group(1) if m else v
    return v

wb = load_workbook("ACNHItemData.xlsx")  # data_only=False (default) keeps formulas

sheets = {}
for ws in wb.worksheets[1:]:             # skip the first tab
    rows = list(ws.values)
    if rows:
        sheets[ws.title] = pd.DataFrame(rows[1:], columns=rows[0]).map(extract_url)  # applymap on pandas < 2.1

print(len(sheets))  # expect 40

combined = {name: df.to_dict(orient="records") for name, df in sheets.items()}
with open("itemdata.json", "w") as f:
    json.dump(combined, f, indent=2, default=str)