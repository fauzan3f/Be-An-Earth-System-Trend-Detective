# NO₂ Analysis Handoff — NASA Giovanni OMNO2d V004

**Status:** Preliminary (bisa diintegrasikan untuk dashboard; bukan validasi ilmiah penuh).

## Data dan cakupan
- Variabel: `ColumnAmountNO2TropCloudScreened`, tropospheric vertical column, molecules/cm².
- OMI Aura / NASA Giovanni; 2010-10-31 sampai 2026-10-31.
- Bounding box permintaan: 108°E–114°E, 3.5°S–2.5°N. Tidak sama dengan batas administratif Kalimantan Barat.
- Dari 193 bulan, 190 bulan memenuhi minimal 20 hari valid; bulan yang tidak memenuhi kriteria tidak digunakan dalam regresi utama.
- 5817 baris harian; 168 nilai kosong dan 33 nilai negatif yang tetap dipertahankan.

## Metode
Rata-rata bulanan dari nilai area-average harian yang tersedia. Model OLS menggunakan waktu (tahun) dan dummy bulan, dengan standard error HAC/Newey–West (12 lag). Ini bukan regresi spasial dan tidak mengontrol seluruh faktor instrumental.

## Hasil utama
- Slope: **5.3573e+12 molecules/cm²/tahun** (estimasi positif).
- P-value HAC: **0.256775**.
- 95% CI: **[-3.9016e+12, 1.4616e+13] molecules/cm²/tahun**.
- Kesimpulan: **tidak signifikan** pada alpha 0,05; tidak cukup bukti tren linear nonnol.

## Validasi
Uji ambang hari valid 15/20/25 dan pembandingan minimal 20 hari vs coverage ≥80% mempertahankan arah slope positif dan status tidak signifikan. Lihat CSV masing-masing untuk angka lengkap.

## Catatan kualitas dan keterbatasan
- Fill value (~−1.26765×10³⁰) diperlakukan sebagai missing. Nilai negatif yang valid **tidak dibuang** sesuai README OMNO2 Collection 4 Version 5.0 (bagian 4.4).
- Produk OMNO2d Level-3 sudah menggunakan screening dan weighted averages (bagian 6.3); Giovanni CSV area-average tidak menyediakan quality flags dan `Weight` per grid untuk pemeriksaan independen.
- Row anomaly OMI dan perubahan pola pengambilan sampel dapat memengaruhi tren jangka panjang (bagian 2.4, 4.4, 6.4).
- Persentase coverage dalam audit adalah proporsi hari kalender dengan nilai area-average tersedia, **bukan** cakupan spasial atau persentase piksel valid.
- Jangan menyebut hasil sebagai konsentrasi NO₂ permukaan, bukti sebab-akibat, atau hotspot lokal.
- File `no2_trend_analysis.csv` sebelumnya menggunakan garis tren regresi sederhana; **jangan labeli garis itu sebagai fit model HAC musiman**.

## Kontrak integrasi
- `no2_dashboard_timeseries.csv`: `date` (YYYY-MM-DD, awal bulan UTC), `no2_mean` (molecules/cm²), `valid_days`, `coverage_pct`.
- `no2_insight.json`: metadata, trend, confidence interval, validation, limitations.
- Dashboard: tampilkan p-value, CI, periode, satuan, dan label **Tidak signifikan**; hindari klaim 'NO₂ pasti naik'.

## Langkah riset berikutnya
Jika tujuan proyek mengharuskan menjawab **di mana**, unduh data grid OMNO2d untuk analisis spasial dengan pemeriksaan `Weight`, bukan hanya CSV rata-rata wilayah.
