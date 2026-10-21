# Checks this kit: first SHA256SUMS itself against its pinned hash, then every listed file against
# SHA256SUMS, then that the folder holds no file SHA256SUMS does not list.
# Run:  powershell -ExecutionPolicy Bypass -File verify.ps1
# The pin lives outside this folder, so a changed file cannot pass by also changing its own SHA256SUMS line:
#   the local kit:     ..\README.md          (the line "v1.0/SHA256SUMS sha256: <64 hex>")
#   the website repo:  ..\..\tools\lint.mjs  (KITS: { dir: 'v1.0', SUMS_SHA: '<64 hex>' })
# Only the website repo's pin has a history (git). A local copy outside git is checked for accidents
# here; to prove it is the real kit, compare it with brand/v1.0/ in the repo (diff -r), or compare its
# README pin with SUMS_SHA in tools/lint.mjs on the repo's main branch.
$ErrorActionPreference = 'Stop'
$root = (Get-Item -LiteralPath (Split-Path -Parent $MyInvocation.MyCommand.Path)).FullName.TrimEnd('\')
$ver = Split-Path -Leaf $root
$bad = 0; $n = 0

$sumsHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root 'SHA256SUMS')).Hash.ToLower()
$pin = $null; $pinFrom = $null
$readme = Join-Path (Split-Path -Parent $root) 'README.md'
if (Test-Path -LiteralPath $readme) {
  $t = Get-Content -Raw -LiteralPath $readme
  if ($t -match ([regex]::Escape("$ver/SHA256SUMS sha256: ") + '([0-9a-f]{64})')) { $pin = $Matches[1]; $pinFrom = $readme }
}
if (-not $pin) {
  $lint = Join-Path (Split-Path -Parent (Split-Path -Parent $root)) 'tools\lint.mjs'
  if (Test-Path -LiteralPath $lint) {
    $t = Get-Content -Raw -LiteralPath $lint
    if ($t -match ([regex]::Escape("dir: '$ver', SUMS_SHA: '") + '([0-9a-f]{64})')) { $pin = $Matches[1]; $pinFrom = $lint }
  }
}
if (-not $pin) { Write-Host "NO PIN   no pinned hash for $ver/SHA256SUMS in ..\README.md or ..\..\tools\lint.mjs. SHA256SUMS is $sumsHash."; $bad++ }
elseif ($pin -ne $sumsHash) { Write-Host "PIN      SHA256SUMS is $sumsHash, but the pin in $pinFrom is $pin"; $bad++ }

# Exact (case-sensitive) paths: on the website a path differing only in case is a different file.
$listed = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::Ordinal)
foreach ($line in Get-Content -LiteralPath (Join-Path $root 'SHA256SUMS')) {
  if ($line -notmatch '^([0-9a-f]{64}) [ *](.+)$') { continue }
  $want = $Matches[1]; $rel = $Matches[2]; $n++; [void]$listed.Add($rel)
  $p = Join-Path $root ($rel -replace '/', '\')
  if (-not (Test-Path -LiteralPath $p)) { Write-Host "MISSING  $rel"; $bad++; continue }
  $got = (Get-FileHash -Algorithm SHA256 -LiteralPath $p).Hash.ToLower()
  if ($got -ne $want) { Write-Host "CHANGED  $rel"; $bad++ }
}

# Every file in the folder, hidden ones included, must be SHA256SUMS itself or listed in it.
# The read-only attribute stops overwriting a file, not adding one, so this is the only guard here
# against an extra file (a "spark-tile-final.svg" dropped into masters/).
$extra = 0
foreach ($f in Get-ChildItem -LiteralPath $root -Recurse -File -Force) {
  $rel = $f.FullName.Substring($root.Length + 1) -replace '\\', '/'
  if ($rel -ceq 'SHA256SUMS') { continue }
  if (-not $listed.Contains($rel)) { Write-Host "UNLISTED $rel"; $bad++; $extra++ }
}

if ($bad) {
  $fix = "$ver must never change: restore it from the website repo (setukansara-ops/vigyaan-ai-website, folder brand/$ver/, which holds every file) or its git history"
  if ($extra) { $fix += ", and delete each UNLISTED file (it is not part of $ver)" }
  Write-Host "$bad problem(s) in $n listed files, the folder and the pin. $fix."; exit 1
}
Write-Host "ALL OK (SHA256SUMS matches its pin in $pinFrom; $n files match SHA256SUMS; no unlisted file)"
