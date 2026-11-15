"""Analisis spasial NO2 dari 193 GeoJSON QC hasil export_no2_fullstack.py.
Jalankan di Google Colab sesudah Google Drive tersedia.
"""
from pathlib import Path
from collections import defaultdict
import json
import numpy as np
import pandas as pd

ROOT = Path('/content/drive/MyDrive/NASA_Kalbar/no2/exports/fullstack')
GRID = ROOT / 'grid_geojson'
OUT = ROOT / 'spatial_analysis'
OUT.mkdir(parents=True, exist_ok=True)
files = sorted(GRID.glob('no2_grid_????-??.geojson'))
if len(files) != 193:
    raise RuntimeError(f'Perlu 193 GeoJSON, ditemukan {len(files)} di {GRID}')

rows = []
for path in files:
    month = path.stem.replace('no2_grid_', '')
    with path.open(encoding='utf-8') as f:
        data = json.load(f)
    for feat in data.get('features', []):
        p = feat['properties']
        ring = feat['geometry']['coordinates'][0]
        lon = round((ring[0][0] + ring[1][0])/2, 4)
        lat = round((ring[1][1] + ring[2][1])/2, 4)
        v = p.get('no2')
        area = p.get('area_km2')
        rows.append({'date':month,'lat':lat,'lon':lon,
                     'no2':float(v) if v is not None else np.nan,
                     'area_km2':float(area) if area is not None else np.nan,
                     'qc_pass':bool(p.get('qc_pass',False))})

df = pd.DataFrame(rows)
if df.empty:
    raise RuntimeError('Tidak ada fitur grid yang terbaca')
df['valid'] = df['qc_pass'] & np.isfinite(df['no2']) & (df['area_km2'] > 0)
months = sorted(df['date'].unique())
valid_months = [m for m in months if m != '2010-10']
# Kunci grid ditentukan oleh pusat koordinat, bukan index posisi file.
grid = (df.groupby(['lat','lon'],as_index=False)
          .agg(months_present=('date','nunique'),valid_months=('valid','sum'),
               area_km2=('area_km2','max')))
grid['coverage_pct'] = 100*grid['valid_months']/len(valid_months)
# Grid harus diamati pada >=30% bulan agar peta rerata jangka panjang tidak
# didominasi beberapa observasi terpilih; ini QC tambahan eksploratif.
keep = grid.loc[grid.coverage_pct >= 30, ['lat','lon']]
valid = df[df.valid].merge(keep, on=['lat','lon'], how='inner')
summary = (valid.groupby(['lat','lon'],as_index=False)
           .agg(mean_no2=('no2','mean'),median_no2=('no2','median'),
                valid_months=('date','nunique'),area_km2=('area_km2','max')))
summary = summary.merge(grid[['lat','lon','coverage_pct']],on=['lat','lon'])
summary['mean_no2_1e14'] = summary['mean_no2']/1e14
summary = summary.sort_values('mean_no2',ascending=False)
summary.to_csv(OUT/'no2_spatial_grid_summary.csv',index=False)
grid.to_csv(OUT/'no2_spatial_coverage_all_grids.csv',index=False)

# Statistik per bulan tanpa menganggap grid yang tidak lolos QC sebagai nol.
monthly = []
for m, part in df.groupby('date',sort=True):
    good = part[part.valid]
    a = float(good.area_km2.sum())
    total = float(part.area_km2.dropna().sum())
    monthly.append({'date':m,'valid_grids':len(good),
                    'qc_area_pct':100*a/total if total else None,
                    'weighted_mean_no2':float(np.average(good.no2,weights=good.area_km2)) if a else None,
                    'grid_min_no2':float(good.no2.min()) if len(good) else None,
                    'grid_max_no2':float(good.no2.max()) if len(good) else None})
monthly_df = pd.DataFrame(monthly)
monthly_df.to_csv(OUT/'no2_spatial_monthly_summary.csv',index=False)

insights = {
 'status':'exploratory', 'source':'NO2 monthly QC GeoJSON, OMI/Aura OMNO2d v004',
 'months_found':len(files),'months_eligible':len(valid_months),
 'grid_count':len(grid),'grid_coverage_threshold_pct':30,
 'grid_count_meeting_threshold':len(summary),
 'top_5_grid_centers':[{'latitude':float(r.lat),'longitude':float(r.lon),
                         'mean_no2':float(r.mean_no2),'valid_months':int(r.valid_months),
                         'coverage_pct':float(r.coverage_pct)} for r in summary.head(5).itertuples()],
 'limitations':[
  'Pusat grid bukan nama kota/kecamatan; jangan menyebut hotspot administratif tanpa overlay batas wilayah.',
  'Rerata per-grid memakai bulan valid berbeda; bukan peta paparan kontinu.',
  'Cakupan QC rendah dapat menimbulkan bias; interpretasi hotspot harus disertai coverage.',
  'Kolom NO2 satelit bukan konsentrasi permukaan atau indeks kualitas udara.',
  'QC eksploratif, bukan validasi ilmiah final.'
 ]
}
with (OUT/'no2_spatial_findings.json').open('w',encoding='utf-8') as f:
    json.dump(insights,f,ensure_ascii=False,indent=2,allow_nan=False)

print('=== ANALISIS SPASIAL NO2 ===')
print('GeoJSON:',len(files),'Grid:',len(grid))
print('Grid cakupan >=30%:',len(summary))
print('Output:',OUT)
print('Top 5 grid (koordinat pusat, belum dikaitkan ke nama wilayah):')
print(summary[['lat','lon','mean_no2_1e14','valid_months','coverage_pct']].head(5).to_string(index=False))
