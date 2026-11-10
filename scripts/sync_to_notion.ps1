param (
    [string]$JsonPath = ".\workspace\daily_inputs\vetted_feeds_$(Get-Date -Format 'yyyy-MM-dd').json",
    [string]$NotionToken = if ($env:NOTION_TOKEN) { $env:NOTION_TOKEN } else { "YOUR_NOTION_TOKEN" },
    [string]$DatabaseId = "412c9631-ecc0-809c-968f-d9e6ebcaac04",
    [int]$Limit = 20
)

if (-not (Test-Path $JsonPath)) {
    $fallback = Get-ChildItem ".\workspace\daily_inputs\vetted_feeds_*.json" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($fallback) {
        Write-Warning "File not found at $JsonPath. Falling back to most recent: $($fallback.FullName)"
        $JsonPath = $fallback.FullName
    } else {
        Write-Error "JSON file not found at $JsonPath and no fallback found in .\workspace\daily_inputs\"
        exit 1
    }
}

$raw = Get-Content $JsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$items = @(if ($Limit -gt 0) { $raw | Select-Object -First $Limit } else { $raw })

$headers = @{
    "Authorization" = "Bearer $NotionToken"
    "Notion-Version" = "2022-06-28"
    "Content-Type" = "application/json; charset=utf-8"
}

Write-Host "Syncing $($items.Count) items to Notion database ($DatabaseId)..." -ForegroundColor Cyan
$successCount = 0

foreach ($item in $items) {
    # Sanitize title (Notion limit 2000 chars)
    $cleanTitle = if ($item.Title) { $item.Title.Trim() } else { "Untitled Dispatch" }
    if ($cleanTitle.Length -gt 1800) { $cleanTitle = $cleanTitle.Substring(0, 1800) }

    # Sanitize tags (No commas allowed in Notion select/multi-select)
    $tagNames = @()
    if ($item.SignalTag) {
        $matches = [regex]::Matches($item.SignalTag, "\[(.*?)\]")
        foreach ($m in $matches) {
            $t = $m.Groups[1].Value.Replace(" SIGNAL", "").Replace(" / ", "-").Replace(",", "-").Trim()
            if ($t -and $t -ne "MONEYCONTROL" -and $t -notmatch "MC-PRO") {
                $tagNames += $t
            }
        }
    }
    if ($tagNames.Count -eq 0) { $tagNames = @($item.Category.Replace(",", "-")) }
    $multiSelect = @($tagNames | Select-Object -Unique | ForEach-Object {
        $n = $_.Trim()
        if ($n.Length -gt 90) { $n = $n.Substring(0, 90) }
        @{ name = $n }
    })

    # Sanitize summary for paragraph block
    $cleanSummary = if ($item.Summary) { $item.Summary.Trim() } else { "No additional summary provided." }
    if ($cleanSummary.Length -gt 1800) { $cleanSummary = $cleanSummary.Substring(0, 1800) + "..." }

    $cleanUrl = if ($item.Url -match "^https?://") { $item.Url.Trim() } else { "https://antigravity.google" }
    $cleanSource = if ($item.Source) { $item.Source.Trim() } else { "Verified Dispatch" }

    $pageBody = @{
        parent = @{ database_id = $DatabaseId }
        properties = @{
            Headline = @{
                title = @(
                    @{ text = @{ content = $cleanTitle } }
                )
            }
            Vertical = @{
                select = @{ name = $item.Category.Replace(",", "-") }
            }
            Source = @{
                rich_text = @(
                    @{ text = @{ content = $cleanSource } }
                )
            }
            URL = @{
                url = $cleanUrl
            }
            Signals = @{
                multi_select = $multiSelect
            }
            Date = @{
                date = @{ start = (Get-Date).ToString("yyyy-MM-dd") }
            }
        }
        children = @(
            @{
                object = "block"
                type = "heading_2"
                heading_2 = @{
                    rich_text = @(@{ text = @{ content = "Executive Summary" } })
                }
            },
            @{
                object = "block"
                type = "paragraph"
                paragraph = @{
                    rich_text = @(@{ text = @{ content = $cleanSummary } })
                }
            },
            @{
                object = "block"
                type = "heading_3"
                heading_3 = @{
                    rich_text = @(@{ text = @{ content = "Metadata & Signal Details" } })
                }
            },
            @{
                object = "block"
                type = "bulleted_list_item"
                bulleted_list_item = @{
                    rich_text = @(
                        @{ text = @{ content = "Source: " }; annotations = @{ bold = $true } },
                        @{ text = @{ content = "$cleanSource (Published: $($item.PublishedAt))" } }
                    )
                }
            },
            @{
                object = "block"
                type = "bulleted_list_item"
                bulleted_list_item = @{
                    rich_text = @(
                        @{ text = @{ content = "Category: " }; annotations = @{ bold = $true } },
                        @{ text = @{ content = "$($item.Category)" } }
                    )
                }
            }
        )
    } | ConvertTo-Json -Depth 10

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($pageBody)
    try {
        $res = Invoke-RestMethod -Uri "https://api.notion.com/v1/pages" -Headers $headers -Method Post -Body $bytes -TimeoutSec 30
        $successCount++
        $shortTitle = if ($cleanTitle.Length -gt 45) { $cleanTitle.Substring(0, 45) + "..." } else { $cleanTitle }
        Write-Host "[$successCount/$($items.Count)] Created: $shortTitle" -ForegroundColor Green
    } catch {
        Write-Warning "Failed creating page for '$cleanTitle': $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Red
        }
    }
    Start-Sleep -Milliseconds 350
}

Write-Host "Successfully synced $successCount items to Notion!" -ForegroundColor Green
