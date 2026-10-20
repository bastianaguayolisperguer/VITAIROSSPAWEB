param(
  [Parameter(Mandatory = $true)][int]$Port,
  [Parameter(Mandatory = $true)][string]$ProfileName,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

$ErrorActionPreference = 'Stop'
$edgePath = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$profileRoot = [IO.Path]::GetFullPath((Join-Path ([IO.Path]::GetTempPath()) $ProfileName))
$tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())

if (-not $profileRoot.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Profile path escaped the temporary directory: $profileRoot"
}
if (Test-Path -LiteralPath $profileRoot) {
  throw "Clean Lighthouse profile already exists: $profileRoot"
}

New-Item -ItemType Directory -Path $profileRoot | Out-Null
$arguments = @(
  '--headless=new',
  "--remote-debugging-port=$Port",
  "--user-data-dir=$profileRoot",
  '--disable-extensions',
  '--disable-component-extensions-with-background-pages',
  '--disable-background-networking',
  '--no-first-run',
  '--no-default-browser-check'
)

$edge = Start-Process -FilePath $edgePath -ArgumentList $arguments -WindowStyle Hidden -PassThru
try {
  $ready = $false
  foreach ($attempt in 1..60) {
    try {
      Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/json/version" -TimeoutSec 1 | Out-Null
      $ready = $true
      break
    } catch {
      Start-Sleep -Milliseconds 250
    }
  }
  if (-not $ready) { throw "Edge did not expose CDP on port $Port" }

  & npx --no-install lighthouse 'http://127.0.0.1:4173/?preview=v3.4.2' `
    "--port=$Port" `
    '--output=json' `
    "--output-path=$OutputPath" `
    '--only-categories=performance,accessibility,best-practices,seo' `
    '--form-factor=mobile' `
    '--screenEmulation.mobile=true' `
    '--screenEmulation.width=412' `
    '--screenEmulation.height=823' `
    '--screenEmulation.deviceScaleFactor=1.75' `
    '--throttling-method=simulate' `
    '--quiet'
  if ($LASTEXITCODE -ne 0) { throw "Lighthouse exited with code $LASTEXITCODE" }
} finally {
  Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" |
    Where-Object { $_.CommandLine -and $_.CommandLine.Contains("--user-data-dir=$profileRoot") } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}
