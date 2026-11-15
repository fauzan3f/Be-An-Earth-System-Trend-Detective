# Ringkasan Temuan Ilmiah — Kalimantan Barat (NO₂ dan AOD)

**Periode analisis:** November 2010–Oktober 2026; 191 bulan dengan kedua parameter lolos QC eksploratif.

## Temuan utama

**NO₂.** Estimasi tren +0,0274 × 10¹⁴ molecules/cm² per tahun, p=0,663. Belum ada bukti cukup untuk menyatakan tren linear jangka panjang yang signifikan.

**AOD.** Estimasi tren −0,00315 per tahun, p=0,590. Tidak signifikan pada keseluruhan periode. Pada subset dengan cakupan area NO₂ ≥30%, tren AOD −0,00511/tahun (p=0,0134), sehingga kesimpulan sensitif terhadap pemilihan periode/subset.

**Keterkaitan.** Korelasi Pearson NO₂–AOD r=0,417; korelasi setelah pengurangan pola musiman r=0,367. Hubungan positif tidak membuktikan sebab-akibat. Signifikansi korelasi belum memperhitungkan autokorelasi.

## Metode

Tren menggunakan regresi OLS dengan efek tetap bulan kalender dan standard error Newey–West HAC (12 lag).

## Keterbatasan yang harus ditampilkan

- NO₂ dirata-ratakan berbobot luas untuk grid Kalimantan Barat yang lolos QC; AOD Giovanni adalah rata-rata bounding box. Cakupan geografis tidak identik.
- Cakupan area NO₂ berubah antarbulan; September–Oktober 2026 kurang dari 2%.
- QC masih eksploratif; nilai kolom NO₂ dan AOD bukan kategori indeks kualitas udara permukaan.
- AOD tidak mendukung heatmap per grid. Interpretasi hotspot NO₂ belum diverifikasi dari GeoJSON bulanan.

## Panduan implementasi

Tampilkan tiga kartu temuan, catatan keterbatasan, dan status eksploratif pada halaman Interpretation. Jangan tampilkan klaim hotspot tertentu sampai analisis grid selesai.
