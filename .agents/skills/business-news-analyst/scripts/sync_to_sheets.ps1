param (
    [string]$JsonPath = ".\workspace\daily_inputs\vetted_feeds_$(Get-Date -Format 'yyyy-MM-dd').json",
    [string]$WebhookUrl = "https://script.google.com/macros/s/AKfycbxRhaLJx5LmnMADbuv3yMycpu4IOVw-ydsFAqRqkzOctHs60O0MwKI0kl6-O4HdA3d0QA/exec",
    [int]$Limit = 50
)

if (-not (Test-Path $JsonPath)) {
    Write-Error "JSON file not found at $JsonPath"
    exit 1
}

$raw = Get-Content $JsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
Write-Host "Loaded $($raw.Count) items from $JsonPath"

$itemsToPush = if ($Limit -gt 0) { $raw | Select-Object -First $Limit } else { $raw }

$payload = $itemsToPush | ForEach-Object {
    @{
        date = (Get-Date).ToString("yyyy-MM-dd")
        vertical = $_.Category
        headline = $_.Title
        source = $_.Source
        url = $_.Url
        signals = $_.SignalTag
        delta = $_.Summary
        mechanism = ""
        strategic_impact = ""
        core_lesson = ""
        lateral_transfer = ""
    }
} | ConvertTo-Json -Depth 3

$bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)

Write-Host "Posting $($itemsToPush.Count) items to Google Sheets webhook..." -ForegroundColor Cyan
try {
    $res = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $bytes -ContentType "application/json; charset=utf-8" -TimeoutSec 30
    Write-Host "Google Sheets response: $($res | ConvertTo-Json -Compress)" -ForegroundColor Green
    Write-Host "Successfully synced $($itemsToPush.Count) items to your Google Sheet!" -ForegroundColor Green
} catch {
    Write-Error "Failed to post to Google Sheets: $($_.Exception.Message)"
}
