<#
.SYNOPSIS
Master runner for Business News Intelligence:
1. Fetches and vets daily business news across all 4 verticals.
2. Syncs structured ledger rows to Google Sheets.
3. Formats and publishes executive cards to Notion.
4. Builds structured JSON & web application data for GitHub Pages.
#>

param (
    [int]$HoursLookback = 48,
    [int]$NotionSyncLimit = 25,
    [switch]$SkipFetch = $false
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  DAILY BUSINESS INTELLIGENCE PIPELINE AUTOMATION" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: News Extraction & 5-D Lens Vetting
if (-not $SkipFetch) {
    Write-Host "`n[Step 1/4] Fetching and analyzing live news feeds..." -ForegroundColor Yellow
    powershell.exe -ExecutionPolicy Bypass -File .\scripts\fetch_business_news.ps1 -HoursLookback $HoursLookback
} else {
    Write-Host "`n[Step 1/4] Skipping fetch, using existing daily input files." -ForegroundColor Yellow
}

# Step 2: Push to Google Sheets (Central Database)
Write-Host "`n[Step 2/4] Syncing structured ledger to Google Sheets..." -ForegroundColor Yellow
powershell.exe -ExecutionPolicy Bypass -File .\scripts\sync_to_sheets.ps1 -Limit 50

# Step 3: Push to Notion (Reading Interface)
Write-Host "`n[Step 3/4] Formatting and publishing cards to Notion..." -ForegroundColor Yellow
powershell.exe -ExecutionPolicy Bypass -File .\scripts\sync_to_notion.ps1 -Limit $NotionSyncLimit

# Step 4: Build Web App Data (GitHub Pages Web Portal)
Write-Host "`n[Step 4/4] Compiling briefings for GitHub Pages Web Portal..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    node .\scripts\build_web_data.js
    Copy-Item -Path ".\index.html", ".\styles.css", ".\app.js" -Destination ".\docs" -Force -ErrorAction SilentlyContinue
    Copy-Item -Path ".\index.html", ".\styles.css", ".\app.js" -Destination ".\web" -Force -ErrorAction SilentlyContinue
    Write-Host "Web app updated in root, /docs, and /web!" -ForegroundColor Green
} else {
    Write-Warning "Node.js not found in PATH; skipping web compilation."
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  PIPELINE COMPLETE: Sheets, Notion & Web are in sync!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
