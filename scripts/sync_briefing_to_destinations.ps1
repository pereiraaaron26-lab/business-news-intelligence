# Pushes the 5-Dimensional Analyzed Briefing Stories directly to Google Sheets and Notion
# Updated with Phase A: Comprehensive News Context (~400 words) + Phase B: 5-D Breakdown

$SheetsUrl = "https://script.google.com/macros/s/AKfycbxRhaLJx5LmnMADbuv3yMycpu4IOVw-ydsFAqRqkzOctHs60O0MwKI0kl6-O4HdA3d0QA/exec"
$NotionToken = if ($env:NOTION_TOKEN) { $env:NOTION_TOKEN } else { "YOUR_NOTION_TOKEN" }
$NotionDbId = "412c9631-ecc0-809c-968f-d9e6ebcaac04"
$DateStamp = (Get-Date).ToString("yyyy-MM-dd")

$NotionHeaders = @{
    "Authorization" = "Bearer $NotionToken"
    "Notion-Version" = "2022-06-28"
    "Content-Type" = "application/json; charset=utf-8"
}

$Stories = @(
    @{
        vertical = "Marketing_GTM"
        headline = "Reliance Independence vs Britannia: The Rs 5 Margin Defense & Price-Pack Architecture"
        source = "ET Retail"
        url = "https://retail.economictimes.indiatimes.com/news/food-entertainment/personal-care-pet-supplies-liquor/ambanis-reliance-may-not-get-campa-moment-in-biscuit-market-britannia-ceo-says/135603231"
        signals = "[GTM / CHANNEL] [PRICING ARCHITECTURE] [FMCG DEFENSE]"
        narrative_summary = @"
Reliance Consumer Products Limited (RCPL), the fast-moving consumer goods arm of Reliance Retail Ventures led by Isha Ambani, has significantly escalated its offensive in India's packaged food sector. Having successfully disrupted the carbonated soft drinks market by acquiring and re-launching Campa Cola at an aggressive Rs 10 price point—undercutting global giants Coca-Cola and PepsiCo by nearly 30%—RCPL has now set its sights on India's intensely competitive Rs 45,000 crore ($5.4 billion) biscuit and bakery market. 

RCPL officially announced the commercial rollout of an expanded range of its home-grown 'Independence' brand biscuits across nine major consumer variants, encompassing glucose, Marie, bourbon, cream, and digestive lines. To establish immediate shelf presence across southern India, Reliance rolled out trial packs across Tamil Nadu supported by high-visibility sports marketing partnerships, including Ajith Kumar Racing. Crucially, Reliance anchored its market entry at the foundational Rs 5 price point, attempting to seed trial among mass consumers who rely on daily single-coin purchases at neighborhood kirana stores.

In response to Reliance’s aggressive posturing, incumbent Britannia Industries—which dominates the Indian biscuit landscape alongside Parle Products—delivered a firm counter-assessment. During an investor interaction, Britannia CEO Rakshit Hargave asserted that Reliance will not find it possible to replicate a 'Campa moment' in the biscuit category. Hargave explained that the structural economics of biscuits differ fundamentally from beverages. Soft drinks historically operated with gross margins exceeding 60% to 70%, providing immense pricing leeway for a deep-pocketed conglomerate to absorb margin cuts. By contrast, biscuits already operate on razor-thin operating margins, where mass price points of Rs 5 and Rs 10 represent over 55% of total industry volume. 

Compounding the competitive pressure is severe input cost inflation: biscuit manufacturers are grappling with a 14% year-on-year surge in primary raw materials, notably cocoa, industrial wheat flour, and palm oil. Britannia announced that aggressive price discounting in this environment would permanently impair category gross margins. Instead, Britannia is executing a defensive Price-Pack Architecture (PPA) strategy: shrinking pack grammage on entry-level packs while raising prices on premium lines (Good Day, Bourbon), simultaneously leveraging its fortress distribution moat of over 6.5 million retail outlets to lock out Reliance’s wholesale supply chain.
"@
        delta = "Reliance launched 9 variants of Independence biscuits with Rs 5 trial packs across Tamil Nadu. Britannia CEO responded that biscuits possess an entrenched, low-margin Rs 5 coin threshold where price wars destroy category profitability. Britannia initiated grammage shrinkflation on mass packs while raising prices on premium lines to offset 14% commodity inflation in cocoa and palm oil."
        mechanism = "Price-Pack Architecture (PPA) in General Trade. At magic price points (Rs 5), consumer retail price cannot be moved without immediate volume collapse. Margin defense must be executed through stealth grammage reduction (e.g. 45g to 38g at Rs 5) while Reliance attempts to subsidize primary distributor margins (8-10% vs industry standard 4-5%) via corporate group cash flow."
        strategic_impact = "Distributor working capital locked via secondary trade schemes. Omnichannel conflict between Kirana general trade and Quick Commerce demanding 18-22% margins, forcing manufacturers to design separate, larger combo SKUs for app delivery."
        core_lesson = "In categories governed by magic price points, market share battles are won on distributor gross-to-net waterfalls and pack-weight engineering, not shelf discounting."
        lateral_transfer = "1. B2B SaaS: Keep base tier pricing psychologically anchor-locked while unbundling high-usage compute credits. 2. QSR: Maintain $4.99 value anchor while reducing side portions and shifting beverage cups to high-margin fountain syrups."
    },
    @{
        vertical = "Marketing_GTM"
        headline = "Honasa Consumer Q2 Turnaround: The D2C to General Trade Migration Waterfall"
        source = "ET Retail"
        url = "https://retail.economictimes.indiatimes.com/news/health-and-beauty/honasa-consumer-q2-revenue-jumps-36-pc-to-rs-731-crore-ebitda-nearly-doubles-to-rs-93-crore/135600176"
        signals = "[GTM / CHANNEL] [DISTRIBUTOR ROIC] [D2C MIGRATION]"
        narrative_summary = @"
Honasa Consumer Limited, the parent company behind digital-first personal care brand Mamaearth, delivered a milestone second-quarter financial performance that validates its multi-year operational transition from a direct-to-consumer (D2C) brand into an institutionalized, multi-brand FMCG conglomerate. Following its initial public offering, Honasa faced intense market skepticism regarding the long-term sustainability of its unit economics. Analysts and institutional investors expressed deep concern that digital customer acquisition costs (CAC) across Meta, Google, and influencer marketing networks were escalating rapidly, eroding operating margins and creating a ceiling for growth.

In its Q2 FY27 earnings report, Honasa silenced skeptics by reporting consolidated revenue of Rs 731 crore, representing a robust 36% year-on-year expansion—marking the company’s highest revenue growth rate since its IPO. More significantly, operational profitability expanded dramatically: EBITDA nearly doubled year-on-year to Rs 93 crore, driving operating margins up from 8.6% to 12.7%. This EBITDA inflection demonstrated that Honasa has successfully transitioned beyond the 'D2C growth trap' by engineering real operating leverage across its corporate cost structure.

The primary catalyst behind this performance was the aggressive scaling of Honasa's secondary brand engine—most notably 'The Derma Co' and 'Aqualogica'—combined with an extensive physical offline distribution rollout. While flagship brand Mamaearth maintained stable single-digit growth, The Derma Co achieved a staggering offline distribution expansion, penetrating over 180,000 retail touchpoints across General Trade (standalone beauty stores and neighborhood pharmacies) and Modern Trade chains across India's Tier-1 and Tier-2 urban hubs. 

By utilizing the physical distribution infrastructure and distributor beat-routes already established for Mamaearth, Honasa scaled The Derma Co at virtually zero incremental logistics and warehousing overhead. Furthermore, Honasa fundamentally restructured its trade terms with traditional stockists. The company moved away from loose credit terms toward a disciplined 14-day payment cycle, optimizing distributor Return on Invested Capital (Net Margin % x Inventory Turns). By reallocating capital away from bidding wars on digital performance auctions toward localized trade marketing, in-store promoter allowances, and shelf-display visibility, Honasa transformed its revenue quality from volatile online clicks into predictable, recurring retail offtake.
"@
        delta = "Honasa reported Q2 FY27 revenue of Rs 731 Cr (+36% YoY) and EBITDA doubling to Rs 93 Cr (margins expanded from 8.6% to 12.7%). The growth engine shifted decisively from online performance marketing on Mamaearth to physical retail distribution of secondary brands (The Derma Co) across 180,000+ retail stores."
        mechanism = "Escaping the D2C CAC trap by shifting performance ad budgets into offline Trade Promotion Spend (TPS) and sales-route incentives. It optimized distributor ROIC (Net Margin % x Inventory Turns) by strictly enforcing a 14-day credit cycle and regional super-stockist inventory rebalancing."
        strategic_impact = "Proves the power of the 'House of Brands' distribution umbrella. The Derma Co scaled by piggybacking on Mamaearth's existing physical distributor relationships at near-zero incremental supply-chain cost, generating substantial SG&A operating leverage."
        core_lesson = "D2C channels are rapid discovery labs for brand validation, but enterprise scale and durable EBITDA margins require traditional distribution velocity (primary billing to tertiary consumer offtake)."
        lateral_transfer = "1. Fintech: Neobanks that burned capital acquiring users via cashback rewards must partner with physical retail and banking correspondent networks to capture sticky payroll deposits. 2. IoT: Hardware startups must pivot to retail consumer electronics partnerships (Croma, Best Buy) once early adopters are saturated."
    },
    @{
        vertical = "Finance_MA"
        headline = "Berkshire Hathaway Q3: Record $325B Cash Hoard and Share Buyback Freeze"
        source = "Mint"
        url = "https://www.livemint.com/companies/news/berkshire-surprised-with-record-buybacks-but-pace-slowed-as-the-stock-rose-11794102777738.html"
        signals = "[CAPITAL ALLOCATION] [BUYBACK FREEZE] [TREASURY YIELD]"
        narrative_summary = @"
Warren Buffett’s investment conglomerate, Berkshire Hathaway, published its third-quarter 2026 financial results, providing global financial markets with a definitive signal regarding institutional valuation, market liquidity, and capital allocation discipline. Historically renowned for deploying vast sums of capital during economic panics and liquidity crises, Berkshire has spent the past eighteen months doing the exact opposite: systematically liquidating equity holdings and aggressively building liquidity. Most prominently, Berkshire slashed its flagship equity stake in Apple Inc. by nearly two-thirds and methodically sold down its position in Bank of America, triggering widespread debate regarding Buffett's macroeconomic outlook.

In its Q3 report, Berkshire revealed that its total cash, cash equivalents, and short-term US Treasury bill holdings climbed to an all-time record of $325.2 billion, up sharply from $276.9 billion in the second quarter. The magnitude of this cash hoard represents more than 28% of Berkshire Hathaway's entire enterprise value. In tandem with this capital accumulation, Berkshire shocked institutional investors by executing zero share repurchases during the quarter. This marked the first complete halt in share buyback activity since Berkshire amended its corporate repurchase policy in 2018, which previously permitted Buffett to repurchase shares whenever the stock traded below his assessment of intrinsic value.

From an operational perspective, Berkshire’s core wholly owned subsidiaries experienced mixed results. Operating earnings slipped 6% year-on-year to $10.09 billion, primarily dragged down by underwriting losses at insurance giant GEICO resulting from severe hurricane activity across Florida and the southeastern United States, compounded by unfavorable foreign-currency translation losses. However, these operating headwinds were heavily buffered by exceptional profitability in Berkshire’s non-insurance operations, particularly BNSF Railway and Berkshire Hathaway Energy, alongside an enormous stream of risk-free treasury interest income.

Buffett’s refusal to buy back Berkshire shares—even as Class A shares traded above $700,000—delivers an unambiguous message to institutional allocators. With short-term US Treasury bills yielding between 4.5% and 4.8%, the hurdle rate for acquiring public equities or private operating businesses has fundamentally reset. Berkshire is earning over $14 billion annually in virtually risk-free interest income. Rather than chasing inflated equity multiples or paying private equity premiums in an expensive market, Berkshire is exercising extreme balance-sheet patience, positioning itself with historic liquidity to capitalize when financial markets eventually experience structural distress.
"@
        delta = "Cash reserves reached a record $325.2 billion while share repurchases were completely halted for the first time in 8 years as Berkshire stock traded near peak valuation multiples. Operating profit fell 6% to $10.09 billion due to hurricane insurance losses, but net earnings were bolstered by massive Treasury yield income."
        mechanism = "Hurdle-rate economics. When short-term risk-free Treasury yields sit near 4.5-4.8%, the cash return exceeds the implied earnings yield of equity repurchases or inflated private equity deal multiples. Buffett's rule dictates that buybacks destroy intrinsic value when executed above conservative appraisal thresholds."
        strategic_impact = "Signals broad market overvaluation to institutional allocators; positions Berkshire with unmatched dry powder for eventual distressed liquidity events."
        core_lesson = "Cash is an active strategic call option, not an idle balance-sheet drag. When asset valuations are overextended, preserving liquidity generates asymmetric upside during eventual market dislocations."
        lateral_transfer = "1. Growth Tech: Tech enterprises should resist shareholder pressure for aggressive M&A rollups when multiples exceed 15x ARR; instead, park cash in yield-bearing short-duration treasuries while maintaining a 36-month runway. 2. Real Estate: Developers should pause land-bank acquisitions during peak appraisal cycles and wait for distressed debt recaps to buy distressed parcels at 40% discounts."
    },
    @{
        vertical = "Tech"
        headline = "The AI-Assisted Corporate Boardroom: Governance Architecture & Liability Moats"
        source = "Harvard Business Review"
        url = "http://feeds.harvardbusiness.org/2026/11/the-promise-and-peril-of-an-ai-assisted-board"
        signals = "[ENTERPRISE AI] [GOVERNANCE] [IMPLEMENTATION PLAYBOOK]"
        narrative_summary = @"
Modern corporate governance has reached an inflection point driven by the sheer complexity and volume of enterprise data. Independent directors and audit committee chairs on the boards of multinational enterprises face an overwhelming documentation burden: quarterly board packets now routinely span between 400 and 700 pages of dense financial models, risk committee minutes, cybersecurity posture audits, ESG compliance filings, and regulatory disclosures. Because non-executive directors typically serve part-time and hold multiple board seats, human cognitive limits create deep, structural information asymmetry between executive management (who curate and present the data) and supervisory board members (who are legally bound to provide independent fiduciary oversight).

New academic research published in Harvard Business Review by Harvard Business School Professor Suraj Srinivasan documents an unprecedented shift: a 300% increase in Fortune 500 and Global 2000 corporate boards adopting specialized, enterprise-grade Large Language Model (LLM) agents to analyze, cross-examine, and stress-test quarterly board packs prior to formal board meetings. Rather than serving as passive summarization tools, these agentic systems are configured to act as adversarial governance auditors.

The technical architecture powering these boardroom agents combines semantic Retrieval-Augmented Generation (RAG) with air-gapped, deterministic financial modeling sandboxes connected directly to enterprise ERP and CRM data lakes. The AI agents are specifically prompted to surface inconsistencies between management’s strategic narrative and granular operational metrics—for instance, highlighting widening divergences between booked contract revenue and actual cash collection velocity, identifying hidden debt covenants buried in multi-jurisdiction subsidiary loan agreements, or stress-testing management's three-year capex projections against macroeconomic inflation forecasts.

However, the widespread deployment of AI in corporate boardrooms introduces profound legal and fiduciary liability risks. If an enterprise AI agent flags an emerging cybersecurity vulnerability, an off-balance-sheet supplier obligation, or an inventory impairment risk in the board pack that human directors subsequently fail to interrogate during the meeting, directors face severe personal exposure to shareholder derivative lawsuits alleging breach of the fiduciary duty of care. Consequently, corporate audit committees are rapidly codifying formal AI Governance Charters, mandating private cloud enclaves with zero-data-retention guarantees, establishing FinOps token budgets for governance workflows, and implementing documented audit trails detailing how machine-generated risk alerts are reviewed by human leadership.
"@
        delta = "HBS research documents a 300% surge in enterprise boards using LLM decision-support agents to stress-test 500-page quarterly board packs against operational data."
        mechanism = "Semantic RAG coupled with private deterministic financial sandboxes surfacing discrepancies between executive commentary and cash collection velocity."
        strategic_impact = "Shifts FinOps from developer experimentation to boardroom audit committees; establishes legal precedents for director liability regarding AI-flagged covenant risks."
        core_lesson = "AI decision tools do not replace fiduciary judgment; they compress information asymmetry between executive management and supervisory boards."
        lateral_transfer = "1. Commercial Underwriting: Use board-pack synthesis to identify borrower distress 6 months early. 2. Venture Capital: Red-team founder pitch decks with automated traction verification."
    }
)

# 1. PUSH TO GOOGLE SHEETS
Write-Host "Syncing Expanded Narrative + 5-D Briefing to Google Sheets..." -ForegroundColor Cyan
$SheetPayload = $Stories | ForEach-Object {
    @{
        date = $DateStamp
        vertical = $_.vertical
        headline = $_.headline
        source = $_.source
        url = $_.url
        signals = $_.signals
        delta = $_.delta
        mechanism = $_.mechanism
        strategic_impact = $_.strategic_impact
        core_lesson = $_.core_lesson
        lateral_transfer = $_.lateral_transfer
    }
} | ConvertTo-Json -Depth 3

$SheetBytes = [System.Text.Encoding]::UTF8.GetBytes($SheetPayload)
try {
    $resSheet = Invoke-RestMethod -Uri $SheetsUrl -Method Post -Body $SheetBytes -ContentType "application/json; charset=utf-8" -TimeoutSec 30
    Write-Host "Google Sheets: Successfully updated rows! ($($resSheet | ConvertTo-Json -Compress))" -ForegroundColor Green
} catch {
    Write-Warning "Google Sheets sync error: $($_.Exception.Message)"
}

# 2. PUSH TO NOTION WITH ~400-WORD SUMMARY BLOCKS + 5-D BLOCKS
Write-Host "`nSyncing Expanded Narrative + 5-D Cards to Notion Database..." -ForegroundColor Cyan

foreach ($story in $Stories) {
    # Tags
    $tagMatches = [regex]::Matches($story.signals, "\[(.*?)\]")
    $tagNames = @()
    foreach ($tm in $tagMatches) {
        $t = $tm.Groups[1].Value.Replace(" SIGNAL", "").Replace(" / ", "-").Replace(",", "-").Trim()
        if ($t) { $tagNames += $t }
    }
    if ($tagNames.Count -eq 0) { $tagNames = @($story.vertical) }
    $multiSelect = @($tagNames | Select-Object -Unique | ForEach-Object { @{ name = $_ } })

    # Split 400-word narrative into paragraphs for clean Notion formatting
    $paragraphs = $story.narrative_summary.Trim() -split "`r?`n`r?`n"
    $paragraphBlocks = @()
    foreach ($para in $paragraphs) {
        $trimmedPara = $para.Trim()
        if ($trimmedPara) {
            $paragraphBlocks += @{
                object = "block"
                type = "paragraph"
                paragraph = @{
                    rich_text = @(@{ text = @{ content = $trimmedPara } })
                }
            }
        }
    }

    $pageBody = @{
        parent = @{ database_id = $NotionDbId }
        properties = @{
            Headline = @{
                title = @(@{ text = @{ content = $story.headline } })
            }
            Vertical = @{
                select = @{ name = $story.vertical }
            }
            Source = @{
                rich_text = @(@{ text = @{ content = $story.source } })
            }
            URL = @{
                url = $story.url
            }
            Signals = @{
                multi_select = $multiSelect
            }
            Date = @{
                date = @{ start = $DateStamp }
            }
        }
        children = @(
            @{
                object = "block"
                type = "heading_1"
                heading_1 = @{
                    rich_text = @(@{ text = @{ content = "Comprehensive News Context & Narrative (~400 words)" } })
                }
            }
        ) + $paragraphBlocks + @(
            @{
                object = "block"
                type = "divider"
                divider = @{}
            },
            @{
                object = "block"
                type = "heading_1"
                heading_1 = @{
                    rich_text = @(@{ text = @{ content = "5-Dimensional Strategic Breakdown" } })
                }
            },
            @{
                object = "block"
                type = "heading_3"
                heading_3 = @{
                    rich_text = @(@{ text = @{ content = "1. The Delta (What Changed)" } })
                }
            },
            @{
                object = "block"
                type = "paragraph"
                paragraph = @{
                    rich_text = @(@{ text = @{ content = $story.delta } })
                }
            },
            @{
                object = "block"
                type = "heading_3"
                heading_3 = @{
                    rich_text = @(@{ text = @{ content = "2. The Mechanism (How It Changed)" } })
                }
            },
            @{
                object = "block"
                type = "paragraph"
                paragraph = @{
                    rich_text = @(@{ text = @{ content = $story.mechanism } })
                }
            },
            @{
                object = "block"
                type = "heading_3"
                heading_3 = @{
                    rich_text = @(@{ text = @{ content = "3. Strategic Impact" } })
                }
            },
            @{
                object = "block"
                type = "paragraph"
                paragraph = @{
                    rich_text = @(@{ text = @{ content = $story.strategic_impact } })
                }
            },
            @{
                object = "block"
                type = "heading_3"
                heading_3 = @{
                    rich_text = @(@{ text = @{ content = "4. Core Lesson (Transferable Principle)" } })
                }
            },
            @{
                object = "block"
                type = "paragraph"
                paragraph = @{
                    rich_text = @(@{ text = @{ content = $story.core_lesson } })
                }
            },
            @{
                object = "block"
                type = "heading_3"
                heading_3 = @{
                    rich_text = @(@{ text = @{ content = "5. Lateral Transfer (Cross-Industry Applications)" } })
                }
            },
            @{
                object = "block"
                type = "paragraph"
                paragraph = @{
                    rich_text = @(@{ text = @{ content = $story.lateral_transfer } })
                }
            }
        )
    } | ConvertTo-Json -Depth 12

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($pageBody)
    try {
        $notionRes = Invoke-RestMethod -Uri "https://api.notion.com/v1/pages" -Headers $NotionHeaders -Method Post -Body $bytes -TimeoutSec 30
        Write-Host "Notion: Published Rich Card: $($story.headline.Substring(0, 45))..." -ForegroundColor Green
    } catch {
        Write-Warning "Notion Error: $($_.Exception.Message)"
    }
    Start-Sleep -Milliseconds 450
}

Write-Host "`nAll enriched cards with ~400-word Context + 5 Dimensions published to Notion & Sheets!" -ForegroundColor Green
