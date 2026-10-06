$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$project = Split-Path $PSScriptRoot -Parent
$source = Join-Path $project 'CURL_TEST_EVIDENCE.md'
$destination = Join-Path $project 'CURL_RESULTS_IMAGE.png'
$raw = Get-Content $source -Raw -Encoding UTF8
$runTime = [regex]::Match($raw, 'Run time: ([^\r\n]+)').Groups[1].Value
$baseUrl = [regex]::Match($raw, 'Base API URL: `([^`]+)`').Groups[1].Value
$matches = [regex]::Matches($raw, '(?ms)^## (.+?) — expected (\d+), actual (\d+)\r?\n\r?\n```text\r?\n(.*?)\r?\n```')
if ($matches.Count -lt 5) { throw 'Expected at least five captured curl cases' }

function Wrap-Text([string]$value, [int]$limit) {
  $pieces = [System.Collections.Generic.List[string]]::new()
  while ($value.Length -gt $limit) {
    $cut = $value.LastIndexOf(' ', [Math]::Min($limit, $value.Length - 1))
    if ($cut -lt [Math]::Floor($limit / 2)) { $cut = $limit }
    $pieces.Add($value.Substring(0, $cut).TrimEnd())
    $value = $value.Substring($cut).TrimStart()
  }
  if ($value) { $pieces.Add($value) }
  return $pieces.ToArray()
}

$cases = [System.Collections.Generic.List[object]]::new()
foreach ($item in $matches) {
  $lines = $item.Groups[4].Value -split '\r?\n'
  $command = $lines[0]
  $status = ($lines | Where-Object { $_ -match '^HTTP/' } | Select-Object -Last 1)
  $body = ($lines | Where-Object { $_ -match '^(\{|\[)' } | Select-Object -Last 1)
  if (-not $body) { $body = '(empty response body)' }
  $displayLines = [System.Collections.Generic.List[string]]::new()
  foreach ($line in (Wrap-Text $command 130)) { $displayLines.Add($line) }
  $displayLines.Add($status)
  foreach ($line in (Wrap-Text $body 130)) { $displayLines.Add($line) }
  $cases.Add([pscustomobject]@{
    Name = $item.Groups[1].Value
    Expected = $item.Groups[2].Value
    Actual = $item.Groups[3].Value
    Lines = $displayLines
  })
}

$width = 2300
$lineHeight = 32
$headerHeight = 205
$caseGap = 18
$casePadding = 22
$caseTitleHeight = 42
$height = $headerHeight
foreach ($case in $cases) {
  $height += $casePadding * 2 + $caseTitleHeight + $case.Lines.Count * $lineHeight + $caseGap
}
$height += 38

$bitmap = [System.Drawing.Bitmap]::new($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$background = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(12, 18, 28))
$panel = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(23, 33, 47))
$white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(230, 237, 244))
$muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(150, 166, 182))
$green = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(84, 214, 151))
$border = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(49, 68, 86), 2)
$titleFont = [System.Drawing.Font]::new('Segoe UI', 34, [System.Drawing.FontStyle]::Bold)
$subtitleFont = [System.Drawing.Font]::new('Segoe UI', 21)
$caseFont = [System.Drawing.Font]::new('Segoe UI', 23, [System.Drawing.FontStyle]::Bold)
$codeFont = [System.Drawing.Font]::new('Consolas', 20)

try {
  $graphics.FillRectangle($background, 0, 0, $width, $height)
  $graphics.DrawString('Live Cloudflare API test results', $titleFont, $white, 58, 38)
  $graphics.DrawString("curl.exe run: $runTime", $subtitleFont, $muted, 60, 92)
  $graphics.DrawString("Base API URL: $baseUrl", $subtitleFont, $muted, 60, 126)
  $graphics.DrawString('Image rendered from the actual curl.exe transcript in CURL_TEST_EVIDENCE.md',
    $subtitleFont, $muted, 60, 160)

  $y = $headerHeight
  foreach ($case in $cases) {
    $panelHeight = $casePadding * 2 + $caseTitleHeight + $case.Lines.Count * $lineHeight
    $graphics.FillRectangle($panel, 46, $y, $width - 92, $panelHeight)
    $graphics.DrawRectangle($border, 46, $y, $width - 92, $panelHeight)
    $graphics.DrawString($case.Name, $caseFont, $white, 70, $y + $casePadding - 2)
    $graphics.DrawString("PASS  $($case.Actual)", $caseFont, $green, $width - 245, $y + $casePadding - 2)
    $textY = $y + $casePadding + $caseTitleHeight
    foreach ($line in $case.Lines) {
      $brush = if ($line -match '^HTTP/') { $green } else { $white }
      $graphics.DrawString($line, $codeFont, $brush, 72, $textY)
      $textY += $lineHeight
    }
    $y += $panelHeight + $caseGap
  }
  $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  $graphics.Dispose()
  $bitmap.Dispose()
  $background.Dispose(); $panel.Dispose(); $white.Dispose(); $muted.Dispose(); $green.Dispose()
  $border.Dispose(); $titleFont.Dispose(); $subtitleFont.Dispose(); $caseFont.Dispose(); $codeFont.Dispose()
}
Write-Output "Saved $destination"
