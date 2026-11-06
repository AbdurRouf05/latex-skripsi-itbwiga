# Buka DOCX di Microsoft Word, perbarui semua field (daftar isi, tabel, gambar, nomor halaman),
# simpan, dan ekspor PDF untuk pemeriksaan.
# Pemakaian: pwsh -File word_update_fields.ps1 <input.docx> <output.pdf>
param([string]$Docx, [string]$Pdf)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open((Resolve-Path $Docx).Path, $false, $false)
    # Matikan permintaan "update fields" saat dibuka, karena field langsung diperbarui di sini
    $doc.Fields.Update() | Out-Null
    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $doc.Repaginate()
    foreach ($toc in $doc.TablesOfContents) { $toc.UpdatePageNumbers() }
    $doc.Save()
    $doc.ExportAsFixedFormat($Pdf, 17)  # 17 = wdExportFormatPDF
    "Halaman: " + $doc.ComputeStatistics(2)
    $doc.Close($false)
}
finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
