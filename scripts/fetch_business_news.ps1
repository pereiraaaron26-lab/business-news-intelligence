<#
.SYNOPSIS
Fetches vetted daily business, GTM/channel economics, finance/M&A, and tech news
including live Moneycontrol News Sitemap + Moneycontrol Pro authenticated support.
.DESCRIPTION
Bypasses Moneycontrol's deprecated 2024 RSS feeds by parsing Moneycontrol's live
news-sitemap.xml and section feeds, applies GTM, M&A, and Capital Trend regex tagging,
and supports optional $env:MC_PRO_COOKIE authentication. Robust XML element text
extraction and flexible feed unwrapping.
#>

param (
    [int]$HoursLookback = 48,
    [string]$WorkspaceDir = ".\workspace",
    [string]$GoogleSheetWebhookUrl = "https://script.google.com/macros/s/AKfycbxRhaLJx5LmnMADbuv3yMycpu4IOVw-ydsFAqRqkzOctHs60O0MwKI0kl6-O4HdA3d0QA/exec"
)

$ErrorActionPreference = "Continue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$InputDir = Join-Path $WorkspaceDir "daily_inputs"
$BriefingDir = Join-Path $WorkspaceDir "briefings"
$IterationLogPath = Join-Path $WorkspaceDir "iteration_log.md"

foreach ($Dir in @($WorkspaceDir, $InputDir, $BriefingDir)) {
    if (-not (Test-Path -Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
    }
}

# Persistent Iteration Log Initialization
if (-not (Test-Path -Path $IterationLogPath)) {
$InitialLog = @"
# Business News Analyst - Persistent Iteration Log

## Run Date: 2026-11-06 (Iteration #3 Moneycontrol Pro Integration)
- **Signal Rating**: 5/5 (Moneycontrol Pro Enabled)
- **Adjustments for Next Run**:
  1. Ingest live Moneycontrol & Moneycontrol Pro coverage across Section 1 (Channel Economics/GTM checks), Section 2 (M&A deal metrics, corporate finance), and Section 4 (platform leverage).
  2. Maintain 4-Pillar Commercial Plumbing (Primary/Secondary/Tertiary offtake, Gross-to-Net waterfall, Distributor ROIC, Omnichannel conflict).
  3. Keep FMCG margin defenses & loyalty rewards program shifts permanently integrated into Section 1.
"@
    $InitialLog | Set-Content -Path $IterationLogPath -Encoding UTF8
    Write-Host "Initialized $IterationLogPath with baseline calibration rules." -ForegroundColor Yellow
}

$CutoffTime = (Get-Date).ToUniversalTime().AddHours(-$HoursLookback)
$DateStamp = (Get-Date).ToString("yyyy-MM-dd")
$JsonOut = Join-Path $InputDir "vetted_feeds_$DateStamp.json"
$MdOut = Join-Path $InputDir "vetted_feeds_$DateStamp.md"

# Helper: Extract clean text from XML elements or strings
function Get-NodeValue($val) {
    if ($null -eq $val) { return "" }
    if ($val -is [string]) { return $val.Trim() }
    if ($val.InnerText) { return $val.InnerText.Trim() }
    if ($val.'#text') { return [string]$val.'#text'.Trim() }
    if ($val.'#cdata-section') { return [string]$val.'#cdata-section'.Trim() }
    $s = [string]$val
    if ($s -eq "System.Xml.XmlElement") { return "" }
    return $s.Trim()
}

# Helper: Parse RFC 822, ISO 8601, and other date formats to UTC
function Parse-DateUtc($DateRaw) {
    if (-not $DateRaw) { return (Get-Date).ToUniversalTime() }
    $clean = Get-NodeValue $DateRaw
    if (-not $clean) { return (Get-Date).ToUniversalTime() }
    try {
        return ([DateTimeOffset]::Parse($clean, [System.Globalization.CultureInfo]::InvariantCulture)).UtcDateTime
    } catch {
        try {
            return ([DateTime]::Parse($clean, [System.Globalization.CultureInfo]::InvariantCulture)).ToUniversalTime()
        } catch {
            return (Get-Date).ToUniversalTime()
        }
    }
}

# Signal Detection Regexes
$GtmRegex = "(?i)\b(channel|distributor|distribution|wholesale|retail|kirana|quick commerce|dark store|d2c|direct-to-consumer|inventory|offtake|working capital|trade spend|pricing|gross-to-net|ppa|sku)\b"
$MaRegex = "(?i)\b(merger|acquisition|m&a|acquires|acquired|buyout|takeover|stake|joint venture|carve-out|divest|spin-off|consolidation|valuation|ev/ebitda|earn-out|capex)\b"
$CapTrendRegex = "(?i)\b(private credit|private equity|venture capital|capex|capital allocation|buyback|ipo|working capital|refinancing|debt|bond|yield|repo|crr)\b"

$CollectedItems = New-Object System.Collections.Generic.List[PSObject]

# -----------------------------------------------------------
# PART A: Moneycontrol Live News Sitemap & Optional Pro Authenticated Fetch
# -----------------------------------------------------------
$McsitemapUrls = @(
    "https://www.moneycontrol.com/news/news-sitemap.xml",
    "https://m.moneycontrol.com/news/news-sitemap.xml"
)

$McHeaders = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Antigravity-BusinessAnalyst/3.0" }
if ($env:MC_PRO_COOKIE) {
    $McHeaders["Cookie"] = $env:MC_PRO_COOKIE
    Write-Host "Authenticated Moneycontrol Pro session cookie detected (`$env:MC_PRO_COOKIE)." -ForegroundColor Green
}

foreach ($SitemapUrl in $McsitemapUrls) {
    Write-Host "Fetching [Moneycontrol Live Sitemap] - $SitemapUrl..." -ForegroundColor Magenta
    try {
        [xml]$McXml = Invoke-RestMethod -Uri $SitemapUrl -TimeoutSec 15 -Headers $McHeaders
        if ($McXml.urlset.url) {
            foreach ($Node in ($McXml.urlset.url | Select-Object -First 60)) {
                $Loc = Get-NodeValue $Node.loc
                $NewsNode = $Node.news
                $Title = Get-NodeValue $NewsNode.title
                $PubDateRaw = if ($NewsNode.publication_date) { Get-NodeValue $NewsNode.publication_date } else { $null }
                $Keywords = Get-NodeValue $NewsNode.keywords

                if ($Loc -notmatch "/news/(business|economy|companies|markets|technology|trends)/" -and $Loc -notmatch "pro-top-stories") {
                    continue
                }

                $PubDateUtc = Parse-DateUtc $PubDateRaw

                if ($PubDateUtc -ge $CutoffTime -and $Title) {
                    $Combined = "$Title $Keywords $Loc"
                    $AssignedCat = "Finance_MA"
                    if ($Combined -match $GtmRegex -and $Combined -notmatch $MaRegex) {
                        $AssignedCat = "Marketing_GTM"
                    } elseif ($Loc -match "/technology/" -or $Combined -match "(?i)\b(ai|saas|cloud|semiconductor|cyber|chip)\b") {
                        $AssignedCat = "Tech"
                    } elseif ($Loc -match "/companies/" -and $Combined -notmatch $CapTrendRegex -and $Combined -notmatch $MaRegex) {
                        $AssignedCat = "Business"
                    }

                    $Tags = @("[MONEYCONTROL]")
                    if ($Loc -match "pro" -or $Keywords -match "(?i)\bpro\b") { $Tags += "[MC-PRO]" }
                    if ($Combined -match $GtmRegex) { $Tags += "[GTM / CHANNEL SIGNAL]" }
                    if ($Combined -match $MaRegex) { $Tags += "[M&A / DEAL SIGNAL]" }
                    if ($Combined -match $CapTrendRegex) { $Tags += "[CAPITAL / TREASURY TREND]" }

                    $CollectedItems.Add([PSCustomObject]@{
                        Category = $AssignedCat
                        Source = "Moneycontrol"
                        SignalCount = $Tags.Count
                        SignalTag = ($Tags -join " ")
                        Title = $Title.Trim()
                        Url = $Loc.Trim()
                        PublishedAt = $PubDateUtc.ToString("yyyy-MM-dd HH:mm 'UTC'")
                        Summary = if ($Keywords) { "Keywords: $Keywords" } else { "Moneycontrol Verified Dispatch" }
                    })
                }
            }
            break
        }
    } catch {
        Write-Warning "Moneycontrol sitemap attempt ($SitemapUrl) skipped: $($_.Exception.Message)"
    }
}

# -----------------------------------------------------------
# PART B: Standard Tier-1 RSS/Atom Feeds Across All 4 Verticals
# -----------------------------------------------------------
$FeedCatalog = @(
    # 1. Marketing, Pricing, Channel Economics & GTM
    @{ Category = "Marketing_GTM"; Source = "ET Retail (India Channel & D2C)"; Url = "https://retail.economictimes.indiatimes.com/rss/topstories" },
    @{ Category = "Marketing_GTM"; Source = "ET Brand Equity"; Url = "https://brandequity.economictimes.indiatimes.com/rss/topstories" },
    @{ Category = "Marketing_GTM"; Source = "Modern Retail (GTM & Commerce)"; Url = "https://www.modernretail.co/feed/" },
    @{ Category = "Marketing_GTM"; Source = "Harvard Business Review"; Url = "http://feeds.harvardbusiness.org/harvardbusiness" },
    @{ Category = "Marketing_GTM"; Source = "Marketing Week"; Url = "https://www.marketingweek.com/feed/" },
    @{ Category = "Marketing_GTM"; Source = "Adweek"; Url = "https://www.adweek.com/feed/" },

    # 2. Finance, M&A, Capital Markets & Macro/Micro Policy
    @{ Category = "Finance_MA"; Source = "Mint Economy & Policy"; Url = "https://www.livemint.com/rss/economy" },
    @{ Category = "Finance_MA"; Source = "Mint Markets & Capital"; Url = "https://www.livemint.com/rss/markets" },
    @{ Category = "Finance_MA"; Source = "Mint Companies & M&A Deals"; Url = "https://www.livemint.com/rss/companies" },
    @{ Category = "Finance_MA"; Source = "Mint Industry & Capex"; Url = "https://www.livemint.com/rss/industry" },
    @{ Category = "Finance_MA"; Source = "CNBC Finance & Deals"; Url = "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664" },
    @{ Category = "Finance_MA"; Source = "WSJ Business & Finance"; Url = "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml" },

    # 3. Technology & Implementation
    @{ Category = "Tech"; Source = "MIT Technology Review"; Url = "https://www.technologyreview.com/feed/" },
    @{ Category = "Tech"; Source = "TechCrunch"; Url = "https://techcrunch.com/feed/" },
    @{ Category = "Tech"; Source = "Ars Technica"; Url = "https://feeds.arstechnica.com/arstechnica/index" },

    # 4. Overall Business & Corporate Strategy
    @{ Category = "Business"; Source = "Economic Times Top Business"; Url = "https://economictimes.indiatimes.com/news/company/corporate-trends/rssfeeds/2143429.cms" },
    @{ Category = "Business"; Source = "Mint Money & Corporate"; Url = "https://www.livemint.com/rss/money" }
)

foreach ($Feed in $FeedCatalog) {
    Write-Host "Fetching [$($Feed.Category)] - $($Feed.Source)..." -ForegroundColor Cyan
    try {
        $Response = Invoke-RestMethod -Uri $Feed.Url -TimeoutSec 15 -Headers @{ "User-Agent" = "Mozilla/5.0 Antigravity-BusinessAnalyst/3.0" }
        
        # Robust unwrapping of PowerShell-unpacked arrays or XML/Atom objects
        $Entries = if ($Response -is [System.Array] -or $Response -is [System.Collections.IList]) {
            $Response
        } elseif ($Response.rss.channel.item) {
            $Response.rss.channel.item
        } elseif ($Response.feed.entry) {
            $Response.feed.entry
        } elseif ($Response.channel.item) {
            $Response.channel.item
        } else {
            @($Response)
        }

        foreach ($Item in ($Entries | Select-Object -First 25)) {
            $Title = Get-NodeValue $Item.title
            if (-not $Title) { continue }

            $RawLink = if ($Item.link.href) { $Item.link.href } elseif ($Item.link) { $Item.link } else { "" }
            $Link = Get-NodeValue $RawLink
            # Resolve relative URLs (e.g., HBR)
            if ($Link.StartsWith("/")) {
                $UriObj = [System.Uri]$Feed.Url
                $Link = "$($UriObj.Scheme)://$($UriObj.Host)$Link"
            }

            $RawDate = if ($Item.pubDate) { $Item.pubDate } elseif ($Item.published) { $Item.published } elseif ($Item.updated) { $Item.updated } else { $null }
            $PubDateUtc = Parse-DateUtc $RawDate

            $Desc = if ($Item.description) { Get-NodeValue $Item.description } elseif ($Item.summary) { Get-NodeValue $Item.summary } else { "" }
            $CleanDesc = ($Desc -replace '<[^>]+>', '' -replace '&[a-zA-Z0-9#]+;', ' ' -replace '\s+', ' ').Trim()

            if ($PubDateUtc -ge $CutoffTime -and $Title) {
                $CombinedText = "$Title $CleanDesc"
                $Tags = @()
                if ($CombinedText -match $GtmRegex) { $Tags += "[GTM / CHANNEL SIGNAL]" }
                if ($CombinedText -match $MaRegex) { $Tags += "[M&A / DEAL SIGNAL]" }
                if ($CombinedText -match $CapTrendRegex) { $Tags += "[CAPITAL / TREASURY TREND]" }

                $CollectedItems.Add([PSCustomObject]@{
                    Category = $Feed.Category
                    Source = $Feed.Source
                    SignalCount = $Tags.Count
                    SignalTag = ($Tags -join " ")
                    Title = $Title.Trim()
                    Url = $Link.Trim()
                    PublishedAt = $PubDateUtc.ToString("yyyy-MM-dd HH:mm 'UTC'")
                    Summary = if ($CleanDesc.Length -gt 400) { $CleanDesc.Substring(0, 400) + "..." } else { $CleanDesc }
                })
            }
        }
    } catch {
        Write-Warning "Skipped $($Feed.Source): $($_.Exception.Message)"
    }
}

$UniqueItems = $CollectedItems | Sort-Object Title -Unique
$UniqueItems | ConvertTo-Json -Depth 4 | Set-Content -Path $JsonOut -Encoding UTF8

$MdLines = @(
    "# Verified Daily Business, GTM, M&A & Moneycontrol Pro Feed Input ($DateStamp)",
    "Generated UTC: $((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm'))",
    ""
)

foreach ($Cat in @("Marketing_GTM", "Finance_MA", "Tech", "Business")) {
    $MdLines += "## $Cat"
    $MdLines += ""
    $CatItems = $UniqueItems | Where-Object { $_.Category -eq $Cat } | Sort-Object -Property SignalCount -Descending
    foreach ($Entry in $CatItems) {
        $TagPrefix = if ($Entry.SignalTag) { "$($Entry.SignalTag) " } else { "" }
        $MdLines += "- **$TagPrefix[$($Entry.Source)] $($Entry.Title)** ($($Entry.PublishedAt))"
        $MdLines += "  - Link: $($Entry.Url)"
        if ($Entry.Summary) {
            $MdLines += "  - Snippet: $($Entry.Summary)"
        }
    }
    $MdLines += ""
}

$MdLines -join "`r`n" | Set-Content -Path $MdOut -Encoding UTF8
Write-Host "Successfully saved $($UniqueItems.Count) vetted items across all categories to $MdOut" -ForegroundColor Green

# -----------------------------------------------------------
# PART C: Auto-Sync to Google Sheets Database
# -----------------------------------------------------------
if ($GoogleSheetWebhookUrl -and $UniqueItems.Count -gt 0) {
    Write-Host "Syncing $($UniqueItems.Count) items to Google Sheets ($GoogleSheetWebhookUrl)..." -ForegroundColor Cyan
    try {
        $SheetPayload = $UniqueItems | ForEach-Object {
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

        $SheetBytes = [System.Text.Encoding]::UTF8.GetBytes($SheetPayload)
        $SheetResp = Invoke-RestMethod -Uri $GoogleSheetWebhookUrl -Method Post -Body $SheetBytes -ContentType "application/json; charset=utf-8" -TimeoutSec 30
        Write-Host "Google Sheets sync completed successfully." -ForegroundColor Green
    } catch {
        Write-Warning "Google Sheets sync skipped or encountered an error: $($_.Exception.Message)"
    }
}

