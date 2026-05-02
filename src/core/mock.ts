import type { AgentReceipt } from "./types.js";

/**
 * Three realistic example receipts for development, testing, and documentation.
 */

// ---------------------------------------------------------------------------
// 1. Startup outreach assistant
// ---------------------------------------------------------------------------

export const startupOutreachReceipt: AgentReceipt = {
  id: "rcpt_outreach_001",
  timestamp: "2024-09-12T09:14:32.000Z",
  task:
    "Find 10 relevant angel investors and VC firms for a B2B SaaS startup in the legal-tech space raising a $2M pre-seed round. Draft personalised cold outreach emails for the top 5.",
  status: "completed",
  model: "gpt-4o",
  finalAnswer:
    "Identified 10 investors with legal-tech or legalOps portfolio experience. Drafted 5 personalised cold emails tailored to each investor's stated thesis. Top picks: Bessemer Venture Partners (legal vertical focus), Felicis Ventures (enterprise SaaS), and Village Global (founder network fit).",
  confidenceScore: 82,
  humanReviewRecommended: true,
  sourcesUsed: [
    {
      title: "Bessemer Venture Partners — Portfolio & Thesis",
      url: "https://www.bvp.com/atlas/legal-tech",
      snippet:
        "BVP has invested in Clio, Ironclad, and several other legal-tech companies since 2019.",
      relevance: 0.94,
    },
    {
      title: "Crunchbase: Legal Tech VC Funding 2023–2024",
      url: "https://www.crunchbase.com",
      snippet:
        "Legal tech saw $1.2B in VC investment in 2023, down 18% YoY but with rising pre-seed activity.",
      relevance: 0.81,
    },
    {
      title: "Village Global — Investment Thesis",
      url: "https://www.villageglobal.vc",
      relevance: 0.73,
    },
  ],
  toolCalls: [
    {
      name: "search_investor_database",
      inputSummary: 'Query: "legal tech pre-seed angel investor B2B SaaS"',
      outputSummary: "Returned 47 matching investors; filtered to 10 by thesis alignment score.",
      status: "success",
    },
    {
      name: "fetch_investor_profile",
      inputSummary: "Fetched LinkedIn and portfolio pages for top 10 investors",
      outputSummary: "Retrieved recent investments, check sizes, and stated focus areas for 9/10 profiles (1 private).",
      status: "success",
    },
    {
      name: "draft_email",
      inputSummary: "Generated personalised cold emails for top 5 investors using profile data",
      outputSummary: "5 emails drafted, each under 150 words, referencing a specific portfolio company.",
      status: "success",
    },
  ],
  assumptions: [
    "Raising a $2M pre-seed with a target of 20–25% dilution",
    "Founder has a technical background; assumed no prior VC relationships",
    "US-based investors prioritised unless European legal-tech focus was explicit",
    "Email tone calibrated to warm-but-direct; can be adjusted on request",
  ],
  riskFlags: [
    "Investor contact details may be outdated — verify before sending",
    "Cold email reply rates for pre-seed legal tech average 3–7%; set expectations accordingly",
    "BVP and Felicis may have existing competing portfolio companies — check for conflicts",
  ],
  humanReviewChecklist: [
    "Verify each investor's current fund status (some may be between funds)",
    "Confirm no competing portfolio conflicts before outreach",
    "Personalise email subject lines with a specific mutual connection or recent news",
    "Have a lawyer review any claims made about the product or market size",
  ],
  notes: [
    "3 investors declined to list email publicly — LinkedIn InMail recommended for those",
    "Felicis Ventures is currently in quiet period; consider timing outreach for Q4",
  ],
  metadata: {
    promptTokens: "1842",
    completionTokens: "3204",
    estimatedCostUSD: "0.074",
    sessionId: "sess_abc123",
  },
};

// ---------------------------------------------------------------------------
// 2. Coding assistant — fixing an App Store rejection
// ---------------------------------------------------------------------------

export const appStoreRejectionReceipt: AgentReceipt = {
  id: "rcpt_appstore_002",
  timestamp: "2024-10-03T14:55:01.000Z",
  task:
    "Our iOS app was rejected by Apple with guideline 5.1.1 (Data Collection and Storage — Privacy Policy). Diagnose the issue, propose a fix, and generate a compliant privacy policy draft.",
  status: "completed",
  model: "claude-3-5-sonnet-20241022",
  finalAnswer:
    "Root cause: The app collects device identifiers and usage analytics but the App Store listing links to a dead privacy policy URL (404). Secondary issue: the in-app privacy disclosure doesn't enumerate analytics data collection as required by 5.1.1. Fixes applied: (1) updated Info.plist NSPrivacyUsageDescription strings, (2) generated a GDPR/CCPA-compliant privacy policy draft, (3) added an in-app privacy disclosure screen triggered on first launch.",
  confidenceScore: 91,
  humanReviewRecommended: true,
  sourcesUsed: [
    {
      title: "Apple App Store Review Guidelines — 5.1.1",
      url: "https://developer.apple.com/app-store/review/guidelines/#data-collection-and-storage",
      snippet:
        "Apps must include a privacy policy and must disclose all data collected, how it is used, and with whom it is shared.",
      relevance: 1.0,
    },
    {
      title: "Apple Privacy Nutrition Labels — Required Disclosures",
      url: "https://developer.apple.com/app-store/app-privacy-details/",
      snippet:
        "Developers must provide information about some of their privacy practices in App Store Connect.",
      relevance: 0.92,
    },
    {
      title: "GDPR Article 13 — Information to be provided",
      url: "https://gdpr-info.eu/art-13-gdpr/",
      relevance: 0.78,
    },
  ],
  toolCalls: [
    {
      name: "fetch_url",
      inputSummary: "Fetched the privacy policy URL from the App Store listing",
      outputSummary: "HTTP 404 — page not found. The linked URL is broken.",
      status: "error",
    },
    {
      name: "read_file",
      inputSummary: "Read Info.plist to inspect NSPrivacyUsageDescription keys",
      outputSummary:
        "Found 2 missing keys: NSUserTrackingUsageDescription and NSLocationWhenInUseUsageDescription. Existing descriptions are vague and non-compliant.",
      status: "success",
    },
    {
      name: "write_file",
      inputSummary: "Updated Info.plist with compliant usage description strings",
      outputSummary: "4 keys updated with plain-language descriptions meeting Apple's standards.",
      status: "success",
    },
    {
      name: "generate_document",
      inputSummary:
        "Generated privacy policy covering: data collected, purpose, retention, third-party sharing, GDPR/CCPA rights",
      outputSummary: "1,240-word privacy policy draft saved to /docs/privacy-policy.md",
      status: "success",
    },
  ],
  assumptions: [
    "App uses Firebase Analytics and Apple's own analytics framework",
    "App is distributed in the EU and US — both GDPR and CCPA apply",
    "No biometric data is collected based on code review",
    "App targets users aged 13+ (COPPA exemption applies)",
  ],
  riskFlags: [
    "Privacy policy must be hosted at a stable, publicly accessible URL before resubmission",
    "If the app uses third-party SDKs, their data collection must also be disclosed",
    "Legal counsel should review the privacy policy before it goes live",
  ],
  humanReviewChecklist: [
    "Host the privacy policy at a permanent URL and update the App Store listing",
    "Review all third-party SDKs for undisclosed data collection",
    "Test the first-launch privacy disclosure screen on a physical device",
    "Recheck App Store Connect privacy nutrition labels against the updated policy",
    "Have a lawyer sign off on the GDPR/CCPA compliance claims",
  ],
  notes: [
    "Apple's review team typically re-reviews within 24–48 hours after a fix submission",
    "Consider using a privacy-as-a-service tool (e.g. Iubenda, Termly) for ongoing compliance",
  ],
  metadata: {
    promptTokens: "2610",
    completionTokens: "4088",
    estimatedCostUSD: "0.031",
    appBundleId: "com.example.myapp",
    rejectionCode: "5.1.1",
  },
};

// ---------------------------------------------------------------------------
// 3. Research assistant — summarising a topic
// ---------------------------------------------------------------------------

export const researchSummaryReceipt: AgentReceipt = {
  id: "rcpt_research_003",
  timestamp: "2024-11-20T18:30:44.000Z",
  task:
    "Summarise the current state of research on GLP-1 receptor agonists (e.g. semaglutide / Ozempic) for non-diabetic weight loss. Include efficacy data, side effects, long-term unknowns, and insurance coverage landscape in the US.",
  status: "warning",
  model: "gpt-4o",
  finalAnswer:
    "GLP-1 receptor agonists demonstrate strong clinical efficacy for weight loss in non-diabetic adults: the STEP trials showed 14.9% average body weight reduction with semaglutide 2.4mg over 68 weeks. Common side effects are gastrointestinal (nausea 44%, vomiting 24%) and generally transient. Long-term cardiovascular outcomes appear positive (SELECT trial). Key unknowns: muscle mass loss, rebound weight gain on discontinuation, and 5+ year safety data. US insurance coverage remains inconsistent — Medicare Part D explicitly excludes weight-loss drugs, and most commercial plans require documented BMI ≥30 or comorbidities.",
  confidenceScore: 74,
  humanReviewRecommended: true,
  sourcesUsed: [
    {
      title: "STEP 1 Trial — Semaglutide 2.4mg for Weight Management (NEJM, 2021)",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
      snippet:
        "Participants receiving semaglutide had a mean weight loss of 14.9% from baseline vs 2.4% with placebo at week 68.",
      relevance: 0.98,
    },
    {
      title: "SELECT Cardiovascular Outcomes Trial (NEJM, 2023)",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2307563",
      snippet:
        "Semaglutide reduced the risk of major adverse cardiovascular events by 20% in non-diabetic adults with overweight or obesity.",
      relevance: 0.91,
    },
    {
      title: "FDA Prescribing Information — Wegovy (semaglutide injection 2.4mg)",
      url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/215256s000lbl.pdf",
      relevance: 0.88,
    },
    {
      title: "KFF Health Policy — Insurance Coverage for Obesity Drugs",
      url: "https://www.kff.org/health-costs/issue-brief/coverage-and-use-of-anti-obesity-medications-among-adults/",
      snippet:
        "As of 2024, 42% of large employer plans cover GLP-1 drugs for obesity, up from 27% in 2022.",
      relevance: 0.83,
    },
  ],
  toolCalls: [
    {
      name: "search_pubmed",
      inputSummary: 'Search: "semaglutide weight loss non-diabetic RCT" filtered to 2020–2024',
      outputSummary: "Retrieved 38 papers; selected 6 high-impact RCTs and meta-analyses for synthesis.",
      status: "success",
    },
    {
      name: "fetch_url",
      inputSummary: "Fetched FDA prescribing information PDF for Wegovy",
      outputSummary: "Extracted safety, contraindications, and dosing schedule from 42-page document.",
      status: "success",
    },
    {
      name: "search_web",
      inputSummary: 'Search: "GLP-1 Medicare Medicaid insurance coverage 2024"',
      outputSummary: "Found KFF analysis and CMS guidance confirming Part D exclusion for weight-loss indications.",
      status: "success",
    },
  ],
  assumptions: [
    "Focus is on semaglutide as the most widely studied GLP-1 agonist; tirzepatide data is referenced but not the primary focus",
    "US insurance landscape only — international coverage varies significantly",
    "Clinical data is from peer-reviewed trials; not synthesising social media or patient forums",
    "User is asking for a general overview, not personalised medical advice",
  ],
  riskFlags: [
    "Medical research evolves rapidly — verify all statistics against the latest publications before citing",
    "This is a research summary, not medical advice — do not use to guide individual treatment decisions",
    "Insurance coverage data reflects mid-2024 landscape and changes frequently",
    "Long-term (5+ year) safety data does not yet exist for this drug class at weight-loss doses",
  ],
  humanReviewChecklist: [
    "Verify STEP trial statistics against the original NEJM publication",
    "Check for any FDA safety communications issued after November 2024",
    "Confirm current CMS guidance on Part D coverage for anti-obesity medications",
    "Have a licensed physician review before sharing in a medical or clinical context",
  ],
  notes: [
    "The SELECT trial enrolled only adults with pre-existing cardiovascular disease — generalisation to broader populations is limited",
    "Muscle mass loss (lean mass reduction) is an emerging concern not yet addressed in long-term guidelines",
  ],
  metadata: {
    promptTokens: "3102",
    completionTokens: "2876",
    estimatedCostUSD: "0.059",
    searchDepth: "deep",
    citationStyle: "inline",
  },
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const exampleReceipts: AgentReceipt[] = [
  startupOutreachReceipt,
  appStoreRejectionReceipt,
  researchSummaryReceipt,
];
