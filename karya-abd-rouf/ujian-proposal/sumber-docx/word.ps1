$p = Join-Path $PSScriptRoot "..\Proposal_Skripsi_ABD_ROUF.docx"
$pdf = Join-Path $env:TEMP "Proposal_Skripsi_ABD_ROUF_cek.pdf"
$w = New-Object -ComObject Word.Application
$w.Visible = $false; $w.DisplayAlerts = 0
try {
  $d = $w.Documents.Open($p)
  $d.Fields.Update() | Out-Null
  foreach ($t in $d.TablesOfContents) { $t.Update() }
  foreach ($t in $d.TablesOfContents) { $f = $t.Range.Find; $f.Execute([string][char]11, $false, $false, $false, $false, $false, $true, 0, $false, " ", 2) | Out-Null }
  $d.Save()
  $d.ExportAsFixedFormat($pdf, 17)
  "pages: " + $d.ComputeStatistics(2)
  foreach ($h in @("BAB I","BAB II","BAB III","DAFTAR PUSTAKA","LAMPIRAN")) {
    $r = $d.Content; $f = $r.Find
    if ($f.Execute($h + [char]11) -or $f.Execute($h)) { "$h -> page " + $r.Information(3) }
  }
  $d.Close()
} finally { $w.Quit() }
