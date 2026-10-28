export interface SpeakingCategory {
  id: string;
  section: "general_culture" | "professional";
  icon: string;
  title: string;
  subTitle: string;
  levelBadge: string;
  allowedScope: string;
  scenarioId: string;
  defaultPersonaId: string;
  questionPool: string[];
}

export const SPEAKING_CATEGORIES: SpeakingCategory[] = [
  // =========================================================================
  // 1. 🌍 GENERAL CULTURE (Genel Kültür)
  // =========================================================================
  {
    id: "kids",
    section: "general_culture",
    icon: "🦊",
    title: "Kids & Fairy Tales",
    subTitle: "Kids Stories • A1",
    levelBadge: "A1",
    allowedScope: "Animals, fairy tales, favorite toys, simple games, pets, and family",
    scenarioId: "casual_sparky",
    defaultPersonaId: "sparky",
    questionPool: [
      "What is your favorite animal, and why do you like it so much?",
      "Do you like stories about friendly dragons or talking forest animals?",
      "What was the happiest game you played today?",
      "If you had a superpower for one day, what would you do?",
      "Which color makes you feel like smiling the most?",
      "Tell me about a delicious sweet treat you love eating on weekends!",
      "Do you have a pet or a stuffed animal friend at home?",
      "What is the best bedtime fairy tale you have ever heard?",
    ],
  },
  {
    id: "daily_life",
    section: "general_culture",
    icon: "☕",
    title: "Daily Life & Basics",
    subTitle: "Everyday Routines • A1-A2",
    levelBadge: "A1-A2",
    allowedScope: "Everyday routines, morning habits, breakfast, weather, coffee, hobbies, and simple weekend plans",
    scenarioId: "casual_coffee",
    defaultPersonaId: "leo",
    questionPool: [
      "What did you have for breakfast this morning?",
      "How is the weather outside today, and does it change your plans?",
      "What is your favorite way to spend a quiet Sunday afternoon?",
      "Do you prefer tea or coffee when starting your busy morning?",
      "How do you usually travel to work or school every day?",
      "What is your favorite homemade meal to cook or eat?",
      "Do you enjoy waking up early, or are you more of a night owl?",
      "What is one little routine that always puts you in a good mood?",
    ],
  },
  {
    id: "adventure",
    section: "general_culture",
    icon: "🏔️",
    title: "Adventure & Culture",
    subTitle: "Travel & Exploration • B1-B2",
    levelBadge: "B1-B2",
    allowedScope: "Travel journeys, historic cities, outdoor sports, cultural traditions, festivals, and unforgettable vacations",
    scenarioId: "casual_travel",
    defaultPersonaId: "alex",
    questionPool: [
      "What is the most breathtaking natural place you have ever visited?",
      "If you could take a one-month backpack journey anywhere, which country would you pick?",
      "Have you ever tried an outdoor sport like rafting, skiing, or hiking steep trails?",
      "What cultural festival or local tradition do you find most fascinating?",
      "Do you prefer exploring busy historic capitals or relaxing near quiet coastal towns?",
      "What is an unexpected travel misadventure that turned into a great story?",
      "How does learning about another country's customs change your perspective on life?",
      "Which historic landmark in the world would you love to see with your own eyes?",
    ],
  },
  {
    id: "science_mystery",
    section: "general_culture",
    icon: "🔬",
    title: "Science & Mystery",
    subTitle: "Philosophy & Mind • C1",
    levelBadge: "C1",
    allowedScope: "Artificial intelligence, space exploration, philosophical dilemmas, neuroscience, and unexplained mysteries",
    scenarioId: "story_ai_future",
    defaultPersonaId: "alex",
    questionPool: [
      "Do you believe artificial intelligence will eventually surpass human creative intuition?",
      "Should humanity prioritize deep ocean exploration or colonizing the Moon and Mars?",
      "What unexplained scientific mystery or cosmological paradox intrigues you the most?",
      "How do emerging digital technologies challenge our traditional definitions of personal privacy?",
      "If time travel allowed you to observe Earth 500 years in the future, would you go?",
      "Can ethical consciousness ever be genuinely replicated in algorithmic silicon circuits?",
      "What technological breakthrough do you anticipate will transform human health this century?",
      "How does subconscious cognitive bias shape the way societies accept scientific discoveries?",
    ],
  },

  // =========================================================================
  // 2. 💼 PROFESSIONAL & SPECIALIZED (Meslekler & Sektörel)
  // =========================================================================
  {
    id: "project_controls",
    section: "professional",
    icon: "📊",
    title: "Project Controls & EVM",
    subTitle: "AACE / P6 / Claims • C1",
    levelBadge: "C1 Corporate",
    allowedScope: "Earned Value Management (EVM), SPI/CPI metrics, Primavera P6 schedules, critical path delay analysis, and mitigation plans",
    scenarioId: "project_control",
    defaultPersonaId: "sarah",
    questionPool: [
      "Our SPI dropped to 0.86 due to procurement delays. What is your schedule variance recovery plan?",
      "How do you identify whether a contractor's delay claim represents concurrent delay on the critical path?",
      "When CPI is 0.92 and SPI is 1.05, what does this indicate about resource burn rate and cost efficiency?",
      "What quantitative metrics do you present to the executive board when reporting schedule contingency drawdown?",
      "How do you validate a contractor's Time Impact Analysis (TIA) following an excusable delay event?",
      "In an EPC contract, how should baseline schedule revisions be formally baselined and audited?",
      "What proactive early-warning indicators do you track in Primavera P6 before milestone slippage occurs?",
      "How do you calculate Estimate at Completion (EAC) when future work will perform at the budgeted rate?",
    ],
  },
  {
    id: "contract_claims",
    section: "professional",
    icon: "⚖️",
    title: "Contract Claims & FIDIC",
    subTitle: "Disputes & EOT • C1",
    levelBadge: "C1 Legal",
    allowedScope: "FIDIC Yellow/Red Book, Clause 8.4 Extension of Time (EOT), liquidated damages, demurrage, dispute adjudication, and claims",
    scenarioId: "contract_claims",
    defaultPersonaId: "mr_harrison",
    questionPool: [
      "The contractor submitted an EOT notice citing adverse physical conditions. How do you assess Clause 8.4 entitlement?",
      "Under what contractual criteria can an Employer lawfully deduct delay damages without formal dispute notice?",
      "How do you defend against a cumulative disruption claim when baseline productivity data is disputed?",
      "What evidence must the contractor furnish to substantiate a claim for prolongation costs under FIDIC?",
      "How does the prevention principle impact the Employer's right to enforce liquidated damages?",
      "What are the procedural consequences if a party fails to issue a notice of dissatisfaction within 28 days of a DAB decision?",
      "How do you distinguish between force majeure relief and compensable employer-risk events in port logistics?",
      "What legal safeguards should be included when drafting an amicable settlement agreement for disputed variations?",
    ],
  },
  {
    id: "medical",
    section: "professional",
    icon: "🏥",
    title: "Medical & Healthcare",
    subTitle: "Clinical Cases & OET • C1",
    levelBadge: "C1 Clinical",
    allowedScope: "Emergency triage protocols, differential diagnosis, patient anamnesis, clinical pharmacology, and hospital crisis management",
    scenarioId: "problem_site_delay",
    defaultPersonaId: "sarah",
    questionPool: [
      "A 58-year-old patient presents with acute chest tightness and dyspnea. What is your immediate diagnostic triage protocol?",
      "How do you manage patient communication when delivering a difficult chronic prognosis with empathy?",
      "What differential diagnoses must be excluded when evaluating acute neurological deficit symptoms?",
      "How do you balance aggressive antibiotic stewardship against urgent sepsis resuscitation protocols?",
      "What clinical indicators determine whether an ICU patient should be transitioned to mechanical weaning?",
      "How do multidisciplinary oncology boards reconcile divergent surgical versus immunotherapy recommendations?",
      "In an emergency department surge, what criteria guide ethical resource prioritization during bed shortages?",
      "What pharmacological interactions must be monitored when prescribing novel anticoagulants in elderly patients?",
    ],
  },
  {
    id: "corporate_finance",
    section: "professional",
    icon: "📈",
    title: "Corporate Finance & Banking",
    subTitle: "EBITDA & Covenants • C1",
    levelBadge: "C1 Finance",
    allowedScope: "EBITDA margins, debt covenants, working capital optimization, cash flow forecasting, M&A due diligence, and liquidity",
    scenarioId: "corporate_finance",
    defaultPersonaId: "mr_harrison",
    questionPool: [
      "Our debt-to-EBITDA covenant threshold is tightening to 3.8x. What liquidity preservation strategy do you advise?",
      "How should we adjust our CapEx allocation to offset inflation-driven working capital deterioration?",
      "In a rising interest rate environment, what hedging instruments best protect our floating-rate debt portfolio?",
      "How do you conduct sensitivity analysis on free cash flow when modeling downside macroeconomic scenarios?",
      "What due diligence red flags would prompt you to discount the enterprise valuation of a target acquisition?",
      "How do you defend deferred tax asset recoverability during an external auditor review under IFRS?",
      "When evaluating capital return policies, how do you decide between special dividends and share buyback programs?",
      "What strategies do you deploy to optimize Days Sales Outstanding (DSO) across international trading subsidiaries?",
    ],
  },
];
