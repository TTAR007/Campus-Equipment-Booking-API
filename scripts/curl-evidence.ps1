param(
  [string]$BaseUrl = 'https://campus-equipment-booking-api.tar127290.workers.dev/api'
)

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')
$transcript = [System.Collections.Generic.List[string]]::new()
$transcript.Add('# Live cURL Test Evidence')
$transcript.Add('')
$transcript.Add("Base API URL: ``$BaseUrl``")
$invariant = [System.Globalization.CultureInfo]::InvariantCulture
$transcript.Add("Run time: $((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm:ss', $invariant)) UTC")
$transcript.Add('Client: curl.exe from PowerShell. Status codes are checked by this script.')
$transcript.Add('')

function Invoke-Case {
  param(
    [string]$Label,
    [string]$Method,
    [string]$Path,
    [int]$Expected,
    [object]$Body = $null
  )

  $url = "$BaseUrl$Path"
  $arguments = @('--silent', '--show-error', '--include', '--max-time', '30',
    '--write-out', "`nCURL_STATUS:%{http_code}", '--request', $Method)
  $command = "curl.exe -i -X $Method `"$url`""
  if ($null -ne $Body) {
    $json = ConvertTo-Json -InputObject $Body -Depth 10 -Compress
    $arguments += @('--header', 'Content-Type: application/json', '--data-raw', $json)
    $command += " -H `"Content-Type: application/json`" --data-raw '$json'"
  }
  $arguments += $url

  $output = & curl.exe @arguments
  if ($LASTEXITCODE -ne 0) { throw "curl.exe failed for $Label with exit code $LASTEXITCODE" }
  $raw = $output -join "`n"
  $match = [regex]::Match($raw, 'CURL_STATUS:(\d{3})\s*$')
  if (-not $match.Success) { throw "Could not read HTTP status for $Label" }
  $status = [int]$match.Groups[1].Value

  $transcript.Add("## $Label — expected $Expected, actual $status")
  $transcript.Add('')
  $transcript.Add('```text')
  $transcript.Add($command)
  $transcript.Add($raw.TrimEnd())
  $transcript.Add('```')
  $transcript.Add('')
  Write-Host "$Label -> $status"
  if ($status -ne $Expected) { throw "Expected $Expected for $Label but received $status" }
  if ($status -eq 204) { return }

  $response = [regex]::Replace($raw, '\s*CURL_STATUS:\d{3}\s*$', '')
  $sections = [regex]::Split($response, '\r?\n\r?\n')
  $bodyText = $sections[-1].Trim()
  if ($bodyText) { return ConvertFrom-Json -InputObject $bodyText }
}

function Iso([datetime]$time) {
  return $time.ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ',
    [System.Globalization.CultureInfo]::InvariantCulture)
}

$start = [datetime]::UtcNow.AddDays(30).AddMinutes((Get-Random -Minimum 0 -Maximum 10000))
$firstStart = Iso $start
$firstEnd = Iso ($start.AddHours(2))
$updatedStart = Iso ($start.AddHours(3))
$updatedEnd = Iso ($start.AddHours(5))
$booking = @{
  equipmentId = 'eq-1'
  borrowerName = 'cURL Evidence Test'
  startAt = $firstStart
  endAt = $firstEnd
  purpose = 'Exam HTTP verification'
}
$bookingId = $null

try {
  Invoke-Case 'List equipment' 'GET' '/equipment' 200 | Out-Null
  Invoke-Case 'List bookings' 'GET' '/bookings' 200 | Out-Null
  $created = Invoke-Case 'Create booking' 'POST' '/bookings' 201 $booking
  $bookingId = $created.id
  if (-not $bookingId) { throw 'Create response did not include a booking ID' }
  Invoke-Case 'Read booking' 'GET' "/bookings/$bookingId" 200 | Out-Null
  Invoke-Case 'Update booking' 'PATCH' "/bookings/$bookingId" 200 @{
    startAt = $updatedStart
    endAt = $updatedEnd
    purpose = 'Updated exam HTTP verification'
  } | Out-Null
  Invoke-Case 'Invalid time range' 'POST' '/bookings' 400 @{
    equipmentId = 'eq-1'; borrowerName = 'Invalid'; startAt = $firstStart
    endAt = $firstStart; purpose = 'Invalid time test'
  } | Out-Null
  Invoke-Case 'Overlapping booking' 'POST' '/bookings' 409 @{
    equipmentId = 'eq-1'; borrowerName = 'Conflict';
    startAt = (Iso ($start.AddHours(4))); endAt = (Iso ($start.AddHours(6)))
    purpose = 'Conflict test'
  } | Out-Null
  Invoke-Case 'Missing equipment' 'POST' '/bookings' 404 @{
    equipmentId = 'does-not-exist'; borrowerName = 'Missing equipment'
    startAt = $firstStart; endAt = $firstEnd; purpose = 'Missing equipment test'
  } | Out-Null
  Invoke-Case 'Missing booking' 'GET' '/bookings/not-found' 404 | Out-Null
} finally {
  if ($bookingId) {
    Invoke-Case 'Delete booking' 'DELETE' "/bookings/$bookingId" 204 | Out-Null
    Invoke-Case 'Confirm deletion' 'GET' "/bookings/$bookingId" 404 | Out-Null
  }
  $outputPath = Join-Path $PSScriptRoot '..\CURL_TEST_EVIDENCE.md'
  [System.IO.File]::WriteAllLines($outputPath, $transcript)
  Write-Output "Saved $outputPath"
}
