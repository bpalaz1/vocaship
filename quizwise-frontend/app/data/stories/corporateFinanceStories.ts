import { Story } from "./types";

export const corporateFinanceStories: Story[] = [
  // ==========================================
  // LEVEL A (A1-A2, ~120-150 kelime, 2-3 dk)
  // ==========================================
  {
    id: "fin-01-department-budget",
    title: "Monthly Department Operating Budget Preparation",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    topic: "Aylık Departman Bütçesi",
    desc: "Pazarlama departmanı yöneticisinin aylık operasyonel giderleri, yazılım lisanslarını ve personel bütçesini planlaması.",
    content: "At the start of each fiscal quarter, Marketing Manager Thomas prepares the operating expense budget for his digital advertising team. Working closely with corporate financial analysts, Thomas compiles an Excel spreadsheet categorizing every planned expenditure for the upcoming quarter.\n\nHe allocates forty thousand dollars for paid social media campaigns, fifteen thousand dollars for cloud software subscriptions, and ten thousand dollars for graphic design contractor fees. Thomas reviews the previous quarter's actual spending, noting that travel expenses exceeded the forecast by ten percent. To prevent future budget deficits, he sets aside a five percent contingency reserve. Submitting a realistic operating budget ensures that the marketing team achieves its customer acquisition goals without exceeding corporate financial limits.",
    target_words: ["expenditure", "allocates", "contingency", "deficits"],
    target_vocabulary: [
      { word: "expenditure", phonetic: "/ɪkˈspen.dɪ.tʃər/", turkish_meaning: "masraf, harcama kalemi", context_sentence: "He categorized each planned expenditure for the upcoming quarter." },
      { word: "allocates", phonetic: "/ˈæl.ə.keɪts/", turkish_meaning: "tahsis eder, paylaştırır", context_sentence: "The budget allocates funding across advertising channels." },
      { word: "contingency", phonetic: "/kənˈtɪn.dʒən.si/", turkish_meaning: "beklenmedik durum payı, ihtiyat akçesi", context_sentence: "He preserved a five percent contingency reserve for unexpected costs." },
      { word: "deficits", phonetic: "/ˈdef.ɪ.sɪts/", turkish_meaning: "bütçe açıkları", context_sentence: "Accurate forecasting prevents quarterly budget deficits." },
    ],
    comprehension_questions: [
      {
        question: "How much did Thomas allocate for paid social media campaigns?",
        options: ["Five hundred dollars", "Forty thousand dollars", "One million dollars", "Ten dollars"],
        correct_answer_index: 1,
        explanation: "The spreadsheet allocates $40,000 specifically for paid social media advertising."
      },
      {
        question: "Why did Thomas include a five percent contingency reserve in the budget?",
        options: ["To buy lottery tickets", "To protect against unexpected expenses and prevent budget deficits", "To pay for holiday parties only", "Because the computer added it automatically"],
        correct_answer_index: 1,
        explanation: "Contingency reserves provide a financial cushion for unanticipated cost fluctuations."
      },
      {
        question: "Which expense category exceeded its forecast in the previous quarter?",
        options: ["Coffee supplies", "Travel expenses exceeded the forecast by ten percent", "Office rent", "Printer paper"],
        correct_answer_index: 1,
        explanation: "Thomas observed that previous travel expenses had overrun projections by 10%."
      },
    ],
  },
  {
    id: "fin-02-invoice-reconciliation",
    title: "Accounts Payable Invoice Reconciliation",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 138,
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    topic: "Fatura Mutabakatı (3-Way Match)",
    desc: "Muhasebe uzmanının gelen satıcı faturasını satınalma siparişi ve mal kabul tutanağı ile eşleştirmesi.",
    content: "Junior Accountant Maria sits at her desk conducting the weekly accounts payable reconciliation for an industrial manufacturing firm. Before she approves vendor invoices for automated bank wire disbursement, she performs a standard three-way matching procedure.\n\nShe compares the vendor’s billing invoice against the original approved Purchase Order (PO) and the warehouse Receiving Report. Today, a supplier billed twelve thousand dollars for sixty electric motors. However, the warehouse dock slip confirmed that only fifty motors arrived, with ten units backordered. Maria immediately flags the invoice discrepancy in the accounting software and contacts the supplier for a credit memo. This rigorous matching process prevents unauthorized overpayments and ensures financial accountability.",
    target_words: ["reconciliation", "disbursement", "discrepancy", "backordered"],
    target_vocabulary: [
      { word: "reconciliation", phonetic: "/ˌrek.ənˌsɪl.iˈeɪ.ʃən/", turkish_meaning: "mutabakat, hesap denkleştirme", context_sentence: "Weekly invoice reconciliation ensures financial balance accuracy." },
      { word: "disbursement", phonetic: "/dɪsˈbɜːs.mənt/", turkish_meaning: "ödeme çıkışı, tediye", context_sentence: "She approved verified invoices for automated wire disbursement." },
      { word: "discrepancy", phonetic: "/dɪˈskrep.ən.si/", turkish_meaning: "tutarsızlık, uyumsuzluk", context_sentence: "She flagged a quantity discrepancy between the invoice and delivery slip." },
      { word: "backordered", phonetic: "/ˈbækˌɔː.dəd/", turkish_meaning: "stokta olmadığı için sonraya ertelenmiş", context_sentence: "Ten missing motor units were backordered for future delivery." },
    ],
    comprehension_questions: [
      {
        question: "What accounting control procedure does Maria execute before approving supplier payments?",
        options: ["A three-way matching procedure comparing invoice, purchase order, and receiving report", "Calling the bank manager personally", "Flipping a coin", "Paying all invoices immediately without checking"],
        correct_answer_index: 0,
        explanation: "Maria uses the three-way match control comparing the invoice, PO, and warehouse receipt."
      },
      {
        question: "What discrepancy did Maria discover on the supplier's motor invoice?",
        options: ["The invoice was written in French", "The supplier billed for 60 motors, but only 50 had physically arrived", "The motors were the wrong color", "The price was zero"],
        correct_answer_index: 1,
        explanation: "The vendor invoiced for 60 units, whereas the warehouse only received 50 items."
      },
      {
        question: "What document did Maria request from the supplier to rectify the billing error?",
        options: ["A gift voucher", "A formal credit memo", "A personal check", "A brand new catalog"],
        correct_answer_index: 1,
        explanation: "Maria contacted the vendor to issue a credit memo for the 10 unfulfilled units."
      },
    ],
  },
  {
    id: "fin-03-corporate-expenses",
    title: "Corporate Expense Card Audit and Reimbursement",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    topic: "Şirket Gider Kartı Denetimi",
    desc: "İç denetim uzmanının çalışanların şirket kredi kartı harcamalarını fiş ve şirket politikalarına göre denetlemesi.",
    content: "Financial Auditor Kevin audits monthly corporate credit card statements for regional sales executives. Company policy allows employees to charge legitimate client entertaining, business hotel accommodation, and commercial airline tickets. However, all expense entries must be substantiated with itemized merchant receipts submitted through the digital expense application.\n\nToday, Kevin identifies an unapproved transaction: a sales representative submitted a four-hundred-dollar receipt for a luxury spa visit during a client conference. Because wellness treatments violate the corporate travel and entertainment policy, Kevin rejects the line item. The employee is required to reimburse the corporate account via payroll deduction. Consistent expense audits maintain fiscal discipline and protect company capital from personal misuse.",
    target_words: ["substantiated", "itemized", "reimburse", "deduction"],
    target_vocabulary: [
      { word: "substantiated", phonetic: "/səbˈstæn.ʃi.eɪ.tɪd/", turkish_meaning: "belgelenmiş, kanıtlanmış", context_sentence: "All corporate charges must be substantiated with itemized receipts." },
      { word: "itemized", phonetic: "/ˈaɪ.tə.maɪzd/", turkish_meaning: "ayrıntılı dökümlü", context_sentence: "An itemized receipt details each specific restaurant dish purchased." },
      { word: "reimburse", phonetic: "/ˌriː.ɪmˈbɜːs/", turkish_meaning: "geri ödemek, tazmin etmek", context_sentence: "The employee had to reimburse the company for personal expenses." },
      { word: "deduction", phonetic: "/dɪˈdʌk.ʃən/", turkish_meaning: "kesinti (maaş bordrosundan)", context_sentence: "The unapproved cost was resolved through a payroll deduction." },
    ],
    comprehension_questions: [
      {
        question: "What must employees submit to validate corporate credit card charges?",
        options: ["A verbal telephone promise", "Itemized merchant receipts submitted through the digital app", "A handwritten letter", "Nothing at all"],
        correct_answer_index: 1,
        explanation: "Corporate policy mandates itemized merchant receipts for every transaction."
      },
      {
        question: "Why did Kevin reject the sales representative's $400 spa charge?",
        options: ["It was paid in cash", "Luxury wellness spa visits violate corporate travel and entertainment policies", "The receipt was printed in blue ink", "The conference was canceled"],
        correct_answer_index: 1,
        explanation: "Personal luxury wellness services are non-allowable expenses under travel guidelines."
      },
      {
        question: "How did the employee pay back the non-compliant expenditure?",
        options: ["Through a payroll deduction", "By giving away office supplies", "By working on Sunday", "By washing the company car"],
        correct_answer_index: 0,
        explanation: "The unauthorized charge was reimbursed back to the company via a payroll deduction."
      },
    ],
  },
  {
    id: "fin-04-fx-currency-conversion",
    title: "Foreign Exchange Spot Transaction and Currency Conversion",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 142,
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    topic: "Döviz Bozdurma İşlemi",
    desc: "Yurtdışı tedarikçiye ödeme yapmak için hazine uzmanının spot kur üzerinden euro satın alması ve kur farkı.",
    content: "Treasury Analyst Laura manages daily cash balances for an import corporation based in New York. The company needs to settle a seventy-thousand-euro invoice from an Italian textile supplier by tomorrow afternoon. Because the firm’s operating bank accounts are held primarily in US dollars, Laura must execute a foreign exchange spot conversion.\n\nShe checks the live foreign exchange market feed on her financial terminal, observing a spot exchange rate of 1.08 dollars per euro. At this rate, purchasing seventy thousand euros will cost seventy-five thousand six hundred US dollars. Laura requests competitive quotes from two authorized commercial banks to secure the tightest bid-ask spread. Executing spot currency transactions efficiently helps multinational corporations minimize transaction fees and navigate everyday foreign exchange volatility.",
    target_words: ["treasury", "conversion", "spread", "volatility"],
    target_vocabulary: [
      { word: "treasury", phonetic: "/ˈtreʒ.ər.i/", turkish_meaning: "hazine, nakit yönetimi birimi", context_sentence: "The corporate treasury team monitors foreign cash flows." },
      { word: "conversion", phonetic: "/kənˈvɜː.ʒən/", turkish_meaning: "döviz dönüştürme, kambiyo", context_sentence: "She executed a spot conversion from US dollars into euros." },
      { word: "spread", phonetic: "/spred/", turkish_meaning: "alım-satım kur farkı (bid-ask spread)", context_sentence: "Securing a tight bid-ask spread saves corporate funds." },
      { word: "volatility", phonetic: "/ˌvɒl.əˈtɪl.ə.ti/", turkish_meaning: "oynaklık, dalgalanma", context_sentence: "Active treasury management mitigates exchange rate volatility." },
    ],
    comprehension_questions: [
      {
        question: "How many euros did Laura need to purchase for the Italian textile invoice?",
        options: ["One thousand euros", "Seventy thousand euros", "Five million euros", "Ten euros"],
        correct_answer_index: 1,
        explanation: "The company needed to settle an Italian supplier invoice of 70,000 euros."
      },
      {
        question: "What live spot exchange rate was observed on the financial terminal?",
        options: ["$2.00 per euro", "1.08 US dollars per euro", "$0.50 per euro", "Equal one-to-one"],
        correct_answer_index: 1,
        explanation: "The live spot exchange rate was 1.08 dollars per euro."
      },
      {
        question: "Why did Laura request quotes from two different banks?",
        options: ["To open two credit cards", "To secure the narrowest bid-ask spread and minimize fees", "To borrow money", "To check which bank was closer"],
        correct_answer_index: 1,
        explanation: "Comparing multiple bank quotes ensures the tightest spread and lowest transaction costs."
      },
    ],
  },
  {
    id: "fin-05-high-yield-deposit",
    title: "Corporate High-Yield Deposit and Cash Yield",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 138,
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    topic: "Tasarruf Hesabı ve Faiz Getirisi",
    desc: "Şirketin atıl duran 2 milyon dolarlık nakdini risksiz vadeli mevduat hesabında değerlendirerek faiz geliri elde etmesi.",
    content: "Corporate Treasurer Mark noticed that the company held two million dollars of idle surplus liquidity sitting in a non-interest-bearing checking account following a profitable holiday sales season. Because this capital was not needed for payroll or inventory purchases for the next ninety days, Mark decided to optimize cash yield.\n\nHe contacted the corporate banking relationship manager and transferred the two million dollars into a ninety-day term deposit certificate offering an annual percentage yield of five percent. Over the three-month duration, this risk-free cash deposit will generate twenty-five thousand dollars in interest income for the business. Professional treasurers always ensure that idle cash balances work productively while maintaining liquidity to meet future operational liabilities.",
    target_words: ["liquidity", "surplus", "certificate", "liabilities"],
    target_vocabulary: [
      { word: "liquidity", phonetic: "/lɪˈkwɪd.ə.ti/", turkish_meaning: "likidite, nakit mevcudu", context_sentence: "Treasurers balance daily liquidity needs with investment returns." },
      { word: "surplus", phonetic: "/ˈsɜː.pləs/", turkish_meaning: "fazlalık, nakit fazlası", context_sentence: "Idle cash surplus was invested into a term deposit account." },
      { word: "certificate", phonetic: "/səˈtɪf.ɪ.kət/", turkish_meaning: "mevduat sertifikası (CD)", context_sentence: "He purchased a 90-day bank deposit certificate yielding 5%." },
      { word: "liabilities", phonetic: "/ˌlaɪ.əˈbɪl.ə.tiz/", turkish_meaning: "yükümlülükler, borçlar", context_sentence: "Sufficient liquidity must be preserved to satisfy short-term liabilities." },
    ],
    comprehension_questions: [
      {
        question: "How much idle surplus cash did Mark transfer into a high-yield term deposit?",
        options: ["Fifty dollars", "Two million dollars", "Ten thousand dollars", "One hundred million dollars"],
        correct_answer_index: 1,
        explanation: "Mark moved two million dollars of surplus cash into the deposit account."
      },
      {
        question: "What annual percentage yield (APY) did the term deposit account offer?",
        options: ["Zero percent", "Five percent per year", "Twenty-five percent", "One percent"],
        correct_answer_index: 1,
        explanation: "The ninety-day certificate offered an annual percentage yield of 5%."
      },
      {
        question: "How much interest income will the two-million-dollar deposit earn over ninety days?",
        options: ["Five dollars", "Twenty-five thousand dollars", "Two million dollars", "Zero dollars"],
        correct_answer_index: 1,
        explanation: "At 5% annual interest over 90 days (one quarter), the yield equals $25,000."
      },
    ],
  },

  // ==========================================
  // LEVEL B (B1-B2, ~230-280 kelime, 4-5 dk)
  // ==========================================
  {
    id: "fin-06-free-cash-flow-crunch",
    title: "Free Cash Flow Crunch and Working Capital Optimization",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    topic: "Serbest Nakit Akışı Dar Boğazı",
    desc: "Satışları %40 artmasına rağmen nakit döngüsü uzadığı için nakit krizi yaşayan imalat şirketinde işletme sermayesi optimizasyonu.",
    content: "During the executive committee meeting of a high-growth industrial machinery manufacturer, Chief Financial Officer Marcus presented an alarming liquidity paradox. Although top-line recognized revenues had surged forty percent year-over-year, the company’s operating cash flow had turned negative $6.2 million, triggering a severe free cash flow crunch that exhausted its revolving credit line. Marcus explained that the company was suffering from classic overtrading: rapid revenue growth was trapping excessive capital inside unproductive working capital cycles.\n\nAnalyzing working capital metrics, Marcus demonstrated that Days Sales Outstanding (DSO) had drifted from forty-five days to seventy-two days because regional sales executives had granted lenient sixty-day credit terms to close enterprise contracts. Concurrently, Days Sales of Inventory (DSI) had expanded to eighty-five days due to precautionary over-purchasing of raw steel sheets. With Days Payables Outstanding (DPO) locked at thirty days, the firm’s Cash Conversion Cycle (CCC) had lengthened to an unsustainable one hundred and twenty-seven days.\n\nTo restore positive free cash flow without raising expensive emergency equity, Marcus launched a working capital turnaround plan. He instituted dynamic early-payment discounts (2/10 Net 30), offering enterprise clients a two percent discount if invoices were settled within ten days, immediately accelerating accounts receivable collections. He also mandated just-in-time inventory replenishment to trim warehouse buffer stock by thirty percent and negotiated forty-five-day supplier payment terms. Within four months, the Cash Conversion Cycle shrank by thirty-eight days, liberating $11 million in organic liquidity.",
    target_words: ["liquidity", "overtrading", "lenient", "replenishment"],
    target_vocabulary: [
      { word: "liquidity", phonetic: "/lɪˈkwɪd.ə.ti/", turkish_meaning: "likidite, nakit akışı", context_sentence: "Rapid unfinanced expansion triggered a severe corporate liquidity crunch." },
      { word: "overtrading", phonetic: "/ˌəʊ.vəˈtreɪ.dɪŋ/", turkish_meaning: "aşırı büyüme sonucu sermaye yetersizliği (overtrading)", context_sentence: "Overtrading occurs when sales growth outpaces available operating cash." },
      { word: "lenient", phonetic: "/ˈliː.ni.ənt/", turkish_meaning: "esnek, gevşek, hoşgörülü (vade şartları)", context_sentence: "Sales managers offered lenient credit terms to boost sales figures." },
      { word: "replenishment", phonetic: "/rɪˈplen.ɪʃ.mənt/", turkish_meaning: "yeniden tedarik etme, stok ikmali", context_sentence: "Just-in-time replenishment reduced bloated warehouse inventory." },
    ],
    comprehension_questions: [
      {
        question: "Why was the company experiencing a cash shortage despite rapid 40% sales growth?",
        options: ["Someone stole money from the safe", "The company suffered from overtrading, where working capital got trapped in receivables and inventory", "Customer demand dropped to zero", "Taxes increased by 90%"],
        correct_answer_index: 1,
        explanation: "Overtrading trapped operating cash in prolonged receivables and inventory holding cycles."
      },
      {
        question: "To how many days had the company's Cash Conversion Cycle (CCC) expanded?",
        options: ["Five days", "One hundred and twenty-seven days", "Ten days", "Three hundred days"],
        correct_answer_index: 1,
        explanation: "The Cash Conversion Cycle reached an unsustainable 127 days."
      },
      {
        question: "What incentive did Marcus introduce to speed up receivables collection from customers?",
        options: ["Free airline tickets", "A 2/10 Net 30 prompt-payment discount offering 2% off for bills paid within 10 days", "Threatening customers with lawsuits immediately", "Doubling all invoice prices"],
        correct_answer_index: 1,
        explanation: "He introduced a 2% early-settlement discount for payments made within ten days."
      },
    ],
  },
  {
    id: "fin-07-debt-covenants-violation",
    title: "Debt Covenant Violation Warning and Waiver Request",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    topic: "Borç Kovenantları İhlal Riski",
    desc: "Şirketin kredi sözleşmesindeki kaldıraç oranı (Net Debt/EBITDA) sınırını aşması ve banka konsorsiyumundan muafiyet (waiver) talebi.",
    content: "Following an unexpected surge in global raw material costs and factory retooling expenditures, Corporate Treasurer Gregory conducted a covenant compliance sensitivity forecast for the company’s $250 million syndicated credit facility. Under Clause 18 of the Senior Credit Agreement, the corporation was legally bound to maintain two quarterly financial maintenance covenants: a maximum Net Debt to EBITDA leverage ratio of 3.50x, and a minimum Interest Coverage Ratio (EBITDA divided by net interest expense) of 4.00x.\n\nGregory’s fourth-quarter rolling forecast revealed that projected full-year EBITDA would contract to $48 million, while net debt had expanded to $182 million following warehouse acquisitions. Running the ratios produced an impending leverage breach: the Net Debt to EBITDA ratio was modeled to reach 3.79x at fiscal year-end, violating the contractual 3.50x ceiling. Defaulting on a financial covenant represents a technical event of default, empowering syndicate lenders to accelerate the loan, demand immediate repayment of principal, and seize pledged collateral assets.\n\nRather than waiting for the official quarterly compliance certificate deadline, Gregory initiated a proactive lender engagement strategy. Collaborating with investment bankers, he prepared a comprehensive turnaround presentation demonstrating that the EBITDA compression was temporary. Gregory drafted a formal Covenant Waiver and Amendment Request, offering to pay a twenty-five basis point waiver fee ($625,000) and accept a temporary fifty basis point interest margin step-up in exchange for the syndicate raising the leverage ceiling to 4.00x for two quarters. Reassured by the transparency, the banking consortium executed the waiver, averting catastrophic loan acceleration.",
    target_words: ["syndicated", "covenants", "compression", "collateral"],
    target_vocabulary: [
      { word: "syndicated", phonetic: "/ˈsɪn.dɪ.keɪ.tɪd/", turkish_meaning: "sendikasyon (birden fazla bankanın ortaklaşa verdiği kredi)", context_sentence: "The firm secured a $250 million syndicated bank credit facility." },
      { word: "covenants", phonetic: "/ˈkʌv.ə.nənts/", turkish_meaning: "kredi kovenantları, finansal taahhüt oranları", context_sentence: "Financial covenants restrict maximum leverage ratios to protect lenders." },
      { word: "compression", phonetic: "/kəmˈpreʃ.ən/", turkish_meaning: "daralma, baskı altında küçülme (kâr/EBITDA)", context_sentence: "Input cost inflation caused severe quarterly EBITDA compression." },
      { word: "collateral", phonetic: "/kəˈlæt.ər.əl/", turkish_meaning: "teminat, rehin gösterilen varlıklar", context_sentence: "Default allows commercial lenders to seize pledged corporate collateral." },
    ],
    comprehension_questions: [
      {
        question: "What maximum Net Debt to EBITDA leverage ratio was mandated under the credit agreement?",
        options: ["1.00x", "3.50x", "10.0x", "Zero"],
        correct_answer_index: 1,
        explanation: "The senior credit facility stipulated a maximum leverage covenant ratio of 3.50x."
      },
      {
        question: "What leverage ratio did Gregory's financial forecast project for fiscal year-end?",
        options: ["2.00x", "3.79x, violating the contractual ceiling", "50x", "1.50x"],
        correct_answer_index: 1,
        explanation: "The forecast projected a covenant breach at 3.79x, exceeding the 3.50x limit."
      },
      {
        question: "How did Gregory successfully convince the banking syndicate to grant a waiver?",
        options: ["He hid the financial reports", "He proactively engaged lenders with a turnaround plan, paying a waiver fee and temporary interest step-up", "He closed the company bank accounts", "He sued the lenders in court"],
        correct_answer_index: 1,
        explanation: "Gregory acted proactively with a turnaround model, offering a waiver fee and temporary margin increase."
      },
    ],
  },
  {
    id: "fin-08-ipo-prospectus-valuation",
    title: "Initial Public Offering (IPO) Prospectus and Valuation Multiples",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    topic: "Halka Arz (IPO) İzahnamesi ve Değerleme",
    desc: "Yazılım şirketinin borsa kotasyonu öncesi S-1 izahnamesindeki ARR büyümesi, net kuralı (Rule of 40) ve çarpan analizi.",
    content: "In the glass conference rooms of an investment banking headquarters in Manhattan, Equity Research Analyst Claire scrutinized the preliminary S-1 registration statement (prospectus) for CloudMatrix, a enterprise software-as-a-service (SaaS) provider preparing for an Initial Public Offering (IPO) on the Nasdaq exchange. The syndicate underwriters needed to determine an optimal indicative price range before launching the nationwide institutional investor roadshow.\n\nClaire conducted rigorous valuation multiple benchmarking against comparable publicly traded SaaS peers. CloudMatrix reported an Annual Recurring Revenue (ARR) of $180 million with a stellar seventy-two percent subscription gross margin and a Dollar-Based Net Retention Rate (NRR) of one hundred and twenty-four percent, indicating that existing enterprise clients expanded their spending by twenty-four percent each year. Furthermore, CloudMatrix satisfied the software industry's coveted 'Rule of 40' benchmark: combining a thirty-five percent year-over-year revenue growth rate with a seven percent free cash flow margin, totaling forty-two percent.\n\nWhile traditional industrial corporations are valued using EV/EBITDA multiples, Claire established that high-growth subscription software companies are benchmarked against forward Enterprise Value to Revenue (EV/Forward Revenue) ratios. Comparable peers with similar growth and retention profiles traded at a median multiple of 9.5x forward revenues. Applying this valuation multiple to CloudMatrix’s projected forward twelve-month ARR of $230 million yielded an implied enterprise valuation of approximately $2.18 billion. Factoring in an 'IPO discount' of fifteen percent to stimulate secondary market demand, the underwriting syndicate established an initial indicative price band of twenty-two to twenty-five dollars per share.",
    target_words: ["prospectus", "benchmarking", "recurring", "underwriters"],
    target_vocabulary: [
      { word: "prospectus", phonetic: "/prəˈspek.təs/", turkish_meaning: "halka arz izahnamesi (S-1 belgesi)", context_sentence: "The preliminary prospectus detailed company financials and business risk factors." },
      { word: "benchmarking", phonetic: "/ˈbentʃ.mɑː.kɪŋ/", turkish_meaning: "kıyaslama, emsal sektör analizi", context_sentence: "Claire performed peer valuation benchmarking across comparable software firms." },
      { word: "recurring", phonetic: "/rɪˈkɜː.rɪŋ/", turkish_meaning: "tekrarlayan (ARR, abonelik geliri)", context_sentence: "High annual recurring revenue provides predictable subscription cash flows." },
      { word: "underwriters", phonetic: "/ˈʌn.dəˌraɪ.tərz/", turkish_meaning: "halka arz konsorsiyum liderleri, yükleniciler", context_sentence: "Investment banking underwriters priced the initial public offering shares." },
    ],
    comprehension_questions: [
      {
        question: "What software industry benchmark did CloudMatrix achieve by totaling 42 percent?",
        options: ["The Rule of Three", "The Rule of 40 (revenue growth rate plus cash flow margin)", "The Rule of 100", "The Zero Margin Rule"],
        correct_answer_index: 1,
        explanation: "The Rule of 40 combines revenue growth (35%) and free cash flow margin (7%) to score 42%."
      },
      {
        question: "What valuation multiple is standardly applied to evaluate high-growth SaaS subscription businesses?",
        options: ["Price to book value of real estate", "Enterprise Value to Forward Revenue (EV/Forward Revenue)", "Cost of physical machinery", "Inventory liquidation price"],
        correct_answer_index: 1,
        explanation: "High-growth SaaS firms without mature net earnings are valued on forward EV/Revenue multiples."
      },
      {
        question: "Why did the underwriting syndicate apply a fifteen percent 'IPO discount' to the initial valuation?",
        options: ["Because the company was failing", "To incentivize institutional investor demand and foster secondary market trading momentum", "To pay government penalties", "Because of poor accounting"],
        correct_answer_index: 1,
        explanation: "An IPO discount is standardly applied to attract institutional buyers and support aftermarket performance."
      },
    ],
  },
  {
    id: "fin-09-internal-audit-shrinkage",
    title: "Internal Audit Inventory Shrinkage and Reconciliation",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    topic: "İç Denetim ve Stok Sayım Tutarsızlığı",
    desc: "Yıl sonu fiziki stok sayımında ortaya çıkan 1.8 milyon dolarlık stok açığı ve iç kontrol sistemlerinin güçlendirilmesi.",
    content: "During the mandatory year-end financial closing for a national consumer electronics retail chain, Internal Audit Director Samuel conducted a physical-to-perpetual inventory reconciliation across twelve distribution hubs. Comparing the perpetual inventory sub-ledger inside the ERP system against blind physical barcode scanning counts revealed an alarming variance: an aggregate inventory shrinkage deficit of $1.8 million, representing 2.4 percent of total Cost of Goods Sold (COGS), far exceeding the acceptable retail industry tolerance threshold of 0.75 percent.\n\nSamuel organized an investigative audit task force to diagnose the structural root causes of the discrepancy. Reviewing inventory tracking logs, the audit team ruled out clerical entry errors. Instead, they discovered severe deficiencies in internal operational controls at the central logistics warehouse in Dallas. High-value microprocessors and smartphones were being received at the loading dock without undergoing mandatory barcode serial-number scanning, allowing pallets of merchandise to bypass security surveillance.\n\nFurthermore, unmonitored employee access to the secure returns staging cage enabled significant employee pilferage, while unauthorized write-offs were being executed in the software system by floor supervisors without secondary managerial authorization. Samuel immediately reported the material weakness to the Board Audit Committee. He mandated the installation of biometric security turnstiles, segregated conflicting duties between warehouse receiving and inventory write-off approvals, and booked a non-cash inventory valuation write-down on the balance sheet, establishing robust internal governance under Sarbanes-Oxley compliance standards.",
    target_words: ["perpetual", "shrinkage", "deficiencies", "segregated"],
    target_vocabulary: [
      { word: "perpetual", phonetic: "/pəˈpetʃ.u.əl/", turkish_meaning: "sürekli, aralıksız (sürekli envanter sistemi)", context_sentence: "The perpetual inventory ledger tracked real-time stock balances." },
      { word: "shrinkage", phonetic: "/ˈʃrɪŋ.kɪdʒ/", turkish_meaning: "fire, stok kaybı (hırsızlık/hasar nedeniyle açılan fark)", context_sentence: "Unexplained inventory shrinkage reached $1.8 million across the retail chain." },
      { word: "deficiencies", phonetic: "/dɪˈfɪʃ.ən.siz/", turkish_meaning: "eksiklikler, iç kontrol zaafiyetleri", context_sentence: "Internal audits exposed severe control deficiencies in warehouse receiving." },
      { word: "segregated", phonetic: "/ˈseɡ.rɪ.ɡeɪ.tɪd/", turkish_meaning: "ayrıştırılmış (görevler ayrılığı ilkesi)", context_sentence: "Management segregated conflicting duties between receiving and accounting." },
    ],
    comprehension_questions: [
      {
        question: "What total dollar value of inventory shrinkage was uncovered during the physical count?",
        options: ["One thousand dollars", "$1.8 million (2.4 percent of total COGS)", "Fifty million dollars", "Zero dollars"],
        correct_answer_index: 1,
        explanation: "The physical audit revealed a $1.8 million inventory shrinkage variance."
      },
      {
        question: "What control breakdown permitted merchandise to disappear from the central warehouse?",
        options: ["A computer virus erased all files", "Goods bypassed dock barcode scanning and supervisors executed unauthorized inventory write-offs", "Flooding washed away shipping containers", "The warehouse roof collapsed"],
        correct_answer_index: 1,
        explanation: "Weaknesses included un-scanned loading dock arrivals and unauthorized supervisor inventory write-downs."
      },
      {
        question: "What governance reform did Samuel implement to eliminate conflicting duties?",
        options: ["Firing all security guards", "Segregating duties between warehouse receiving staff and inventory write-off authorizations", "Stopping all inventory counts forever", "Paying workers in cash"],
        correct_answer_index: 1,
        explanation: "Samuel separated duties between receiving and write-off approval under Sarbanes-Oxley internal control rules."
      },
    ],
  },
  {
    id: "fin-10-gross-margin-pricing",
    title: "Gross Margin Compression and Dynamic Pricing Elasticity",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    topic: "Brüt Kâr Marjı ve Fiyat Esnekliği",
    desc: "Enflasyon ortamında hammadde ve nakliye maliyetlerinin artması karşısında fiyat esnekliği (price elasticity) analizi.",
    content: "During an inflationary economic cycle characterized by soaring ocean container freight rates and semiconductor component shortages, Commercial Finance Director Danielle presented a troubling gross profit analysis for an automotive electronics manufacturer. Over consecutive quarters, the company's gross profit margin had compressed precipitously from thirty-two percent down to twenty-four percent, despite sales volume remaining stable at three hundred thousand units annually.\n\nDanielle demonstrated that raw bill-of-materials (BOM) input costs had surged eighteen percent, while logistics carrier surcharges added an extra four percent to Cost of Goods Sold. Because the company had maintained static consumer retail prices throughout the year, every inflationary cost increase had directly eroded corporate profit margins. The executive board hesitated to raise prices, fearing that price hikes would alienate retail customers and trigger market share losses to low-cost Asian competitors.\n\nTo resolve this commercial dilemma, Danielle conducted an econometric price elasticity of demand analysis across the firm's product catalog. She discovered that entry-level basic sensors were highly price-elastic (elasticity coefficient of -2.4), meaning price increases would cause sharp volume collapses. Conversely, premium integrated telemetry control units exhibited inelastic demand (elasticity coefficient of -0.6) due to proprietary software patents and high customer switching costs. Danielle executed a differentiated dynamic pricing overhaul: holding entry-level prices steady while implementing an immediate twelve percent price increase across inelastic premium product lines, successfully recovering four hundred basis points of gross margin without sacrificing sales volume.",
    target_words: ["compressed", "surcharges", "elasticity", "differentiated"],
    target_vocabulary: [
      { word: "compressed", phonetic: "/kəmˈprest/", turkish_meaning: "daralmış, baskılanmış (kâr marjı)", context_sentence: "Rising raw material costs compressed gross profit margins by eight percent." },
      { word: "surcharges", phonetic: "/ˈsɜː.tʃɑː.dʒɪz/", turkish_meaning: "ek ücretler, zam farkları", context_sentence: "Carrier fuel surcharges added unexpected expenses to shipping costs." },
      { word: "elasticity", phonetic: "/ˌiː.læsˈtɪs.ə.ti/", turkish_meaning: "esneklik (fiyat talep esnekliği)", context_sentence: "Price elasticity determines how sales volume reacts to price revisions." },
      { word: "differentiated", phonetic: "/ˌdɪf.əˈren.ʃi.eɪ.tɪd/", turkish_meaning: "farklılaştırılmış, kademeli", context_sentence: "A differentiated pricing strategy protected overall gross margins." },
    ],
    comprehension_questions: [
      {
        question: "By how much had the company's gross profit margin contracted due to inflation?",
        options: ["From 32% down to 24%", "By 90%", "It increased by 50%", "Zero change"],
        correct_answer_index: 0,
        explanation: "Rising material and shipping costs compressed gross margins from 32% down to 24%."
      },
      {
        question: "What did Danielle's price elasticity analysis reveal regarding premium telemetry units?",
        options: ["Customers would stop buying them completely", "Demand was inelastic (-0.6), meaning price increases would not significantly harm sales volume", "The product was illegal", "They cost zero to manufacture"],
        correct_answer_index: 1,
        explanation: "Premium units had an inelastic coefficient (-0.6), allowing price increases with minimal volume loss."
      },
      {
        question: "How did Danielle's pricing overhaul successfully restore profit margins?",
        options: ["She increased prices on everything by 100%", "She held elastic entry-level prices steady while raising prices by 12% on inelastic premium lines", "She fired the marketing team", "She closed the factory"],
        correct_answer_index: 1,
        explanation: "A differentiated pricing strategy protected volume on elastic goods while recovering margin on inelastic products."
      },
    ],
  },

  // ==========================================
  // LEVEL C (C1-C2, ~330-380 kelime, 5-6 dk)
  // ==========================================
  {
    id: "fin-11-ma-due-diligence-ebitda",
    title: "Cross-Border M&A Due Diligence and Quality of Earnings EBITDA Normalization",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    topic: "Şirket Satın Alma (M&A) ve EBITDA Düzeltmeleri",
    desc: "1.2 milyar dolarlık şirket satın almasında Quality of Earnings (QoE) incelemesi ve normalleştirilmiş FAVÖK.",
    content: "In cross-border corporate mergers and acquisitions (M&A), the enterprise purchase price is overwhelmingly benchmarked against a negotiated valuation multiple applied to the target company's earnings before interest, taxes, depreciation, and amortization (EBITDA). When a private equity consortium structured a $1.2 billion acquisition bid for a European industrial automation enterprise, Senior M&A Transaction Services Partner Eleanor was retained to lead the financial and accounting Due Diligence investigation, preparing a comprehensive Quality of Earnings (QoE) audit.\n\nThe target company’s management presentation aggressively reported an adjusted EBITDA of $115 million, claiming an enterprise valuation multiple of 10.4x. However, Eleanor’s forensic transactional audit scrutinized underlying revenue recognition policies, aggressive capitalization of software development expenditures, and non-recurring income credits embedded within the audited statutory accounts.\n\nEleanor’s audit team unmasked multiple material EBITDA distortions requiring downward normalization adjustments. First, the target had recognized $14 million in non-recurring gains from the sale of an idle manufacturing plant as recurring operating income. Second, management had capitalized $8 million of routine operational software maintenance expenditures under intangible assets, artificially suppressing operating expenses. Third, Eleanor uncovered an aggressive bill-and-hold accounting arrangement that recognized $11 million in premature revenue for machinery still stored inside the target’s warehouses.\n\nApplying standardized Quality of Earnings adjustments, Eleanor reduced the normalized, sustainable run-rate EBITDA from $115 million down to $82 million—a substantial downward revision of $33 million. Presenting this normalized EBITDA bridge to the buyer's investment committee radically reshaped the deal dynamics. Armed with Eleanor’s forensic analysis, the private equity buyer successfully renegotiated the acquisition valuation down from $1.2 billion to $852 million, shaving nearly $350 million off the purchase consideration and demonstrating how rigorous due diligence averts catastrophic transactional overpayment.",
    target_words: ["amortization", "diligence", "normalization", "distortions"],
    target_vocabulary: [
      { word: "amortization", phonetic: "/əˌmɔː.tɪˈzeɪ.ʃən/", turkish_meaning: "itfa, amortisman (maddi olmayan duran varlıklar için)", context_sentence: "EBITDA strips out non-cash depreciation and amortization charges." },
      { word: "diligence", phonetic: "/ˈdɪl.ɪ.dʒəns/", turkish_meaning: "derin inceleme, durum tespiti (Due Diligence)", context_sentence: "Financial due diligence uncovers hidden balance sheet liabilities." },
      { word: "normalization", phonetic: "/ˌnɔː.mə.laɪˈzeɪ.ʃən/", turkish_meaning: "normalleştirme (bir defalık gelir/giderleri arındırma)", context_sentence: "QoE normalization adjustments isolate sustainable core operating earnings." },
      { word: "distortions", phonetic: "/dɪˈstɔː.ʃənz/", turkish_meaning: "çarpıtmalar, muhasebe yanılsamaları", context_sentence: "Forensic audits eliminated aggressive earnings distortions." },
    ],
    comprehension_questions: [
      {
        question: "What financial report was prepared by Eleanor to assess the true operating earnings of the acquisition target?",
        options: ["A simple tax form", "A Quality of Earnings (QoE) due diligence report", "A marketing brochure", "A customer survey"],
        correct_answer_index: 1,
        explanation: "Eleanor conducted a Quality of Earnings (QoE) investigation to verify sustainable normalized EBITDA."
      },
      {
        question: "What major earnings distortions did Eleanor's team uncover in the target's reported financials?",
        options: ["Underpaying workers", "Classifying one-off factory sale gains as recurring income and improper capitalization of software costs", "Using counterfeit money", "Printing too many receipts"],
        correct_answer_index: 1,
        explanation: "Distortions included non-recurring asset sale gains and improper capitalization of operating software expenses."
      },
      {
        question: "By how much did the buyer reduce the acquisition purchase price following the QoE audit?",
        options: ["By five thousand dollars", "By nearly $350 million (renegotiated down to $852 million)", "By zero dollars", "The buyer doubled the price"],
        correct_answer_index: 1,
        explanation: "Normalized EBITDA dropped to $82 million, reducing the purchase price by approximately $350 million."
      },
    ],
  },
  {
    id: "fin-12-fx-hedging-derivatives",
    title: "Currency Derivatives and Cross-Currency Hedging Strategy",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    topic: "Türev Araçlarla Kur Riski Yönetimi",
    desc: "Uluslararası havacılık şirketinde uçak alımlarında forward sözleşmeler ve cross-currency swap ile kur riskinden korunma.",
    content: "Multinational corporations operating across diverse currency jurisdictions face substantial balance sheet translation and cash flow transaction risks driven by foreign exchange volatility. When a European commercial aerospace conglomerate secured a $3.6 billion contract to manufacture sixty long-range passenger aircraft for a North American carrier, Corporate Treasurer Henrik confronted a monumental structural currency mismatch. While contract revenues were denominated in US dollars payable over five years, seventy percent of direct manufacturing expenses—including titanium aerostructures and assembly plant labor—were incurred in euros.\n\nIf the US dollar were to depreciate significantly against the euro during the multi-year production window, the manufacturer’s operating profit margin would be completely wiped out by currency translation losses. Henrik designed an institutional currency risk hedging program governed by International Financial Reporting Standards (IFRS 9) cash flow hedge accounting rules.\n\nHenrik structured a layered portfolio of financial derivative instruments. For near-term receivables falling due within twelve months, he locked in fixed forward conversion rates utilizing FX Outright Forward contracts, neutralizing foreign exchange variance on $800 million of anticipated dollar cash inflows. For long-term capital flows extending out to Year 5, Henrik executed Cross-Currency Interest Rate Swaps (CCIRS) with a syndicate of global investment banks, effectively exchanging fixed-rate US dollar revenue obligations into synthetic floating-rate euro debt matching the corporation's internal euro cost structure.\n\nAdditionally, to preserve upside participation in the event of dollar appreciation, Henrik purchased out-of-the-money FX collar option structures—combining bought put options with sold call options to establish an exchange rate floor while capping premium expenses at zero net cost. Under IFRS 9 criteria, Henrik demonstrated high hedge effectiveness, enabling the corporation to recognize fair-value derivative gains directly within Other Comprehensive Income (OCI) on the balance sheet rather than creating turbulent quarterly profit-and-loss volatility, insulating operating margins against macroeconomic currency shocks.",
    target_words: ["jurisdictions", "conglomerate", "receivables", "derivatives"],
    target_vocabulary: [
      { word: "jurisdictions", phonetic: "/ˌdʒʊə.rɪsˈdɪk.ʃənz/", turkish_meaning: "ülkeler, yasal para birimi alanları", context_sentence: "Global operations span volatile international currency jurisdictions." },
      { word: "conglomerate", phonetic: "/kənˈɡlɒm.ər.ət/", turkish_meaning: "holding, çok sektörlü büyük şirket", context_sentence: "The aerospace conglomerate managed multi-billion-dollar foreign sales." },
      { word: "receivables", phonetic: "/rɪˈsiː.və.bəlz/", turkish_meaning: "alacaklar (gelecekte tahsil edilecek nakit)", context_sentence: "Forward contracts hedged dollar-denominated aircraft receivables." },
      { word: "derivatives", phonetic: "/dɪˈrɪv.ə.tɪvz/", turkish_meaning: "türev finansal araçlar (forward, swap, opsiyon)", context_sentence: "Henrik utilized currency derivatives to lock in exchange rates." },
    ],
    comprehension_questions: [
      {
        question: "What structural currency mismatch threatened the European aerospace manufacturer's profit margin?",
        options: ["Revenues were in US dollars while 70% of manufacturing costs were incurred in euros", "Workers demanded payment in gold", "The company only had checking accounts in yen", "Airplanes are sold without contracts"],
        correct_answer_index: 0,
        explanation: "The company collected revenues in US dollars but incurred the vast majority of its manufacturing costs in euros."
      },
      {
        question: "What financial derivatives did Henrik utilize for multi-year cash flow exposure?",
        options: ["Lottery tickets", "Cross-Currency Interest Rate Swaps (CCIRS) and FX Forward contracts", "Commodity grain futures", "Bank overdrafts"],
        correct_answer_index: 1,
        explanation: "Henrik utilized FX Outright Forwards for near-term cash and Cross-Currency Swaps for long-term flows."
      },
      {
        question: "Under IFRS 9 hedge accounting, where are qualifying derivative fair-value gains recorded?",
        options: ["In petty cash", "In Other Comprehensive Income (OCI) on the balance sheet to prevent P&L volatility", "In the CEO's personal account", "As taxable revenue immediately"],
        correct_answer_index: 1,
        explanation: "IFRS 9 allows cash flow hedge gains to bypass the income statement and accumulate within equity (OCI)."
      },
    ],
  },
  {
    id: "fin-13-lbo-debt-restructuring",
    title: "Leveraged Buyout (LBO) Senior Tranche Debt Restructuring",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    topic: "Kaldıraçlı Satın Alma (LBO) ve Borç Yapılandırması",
    desc: "Özel sermaye fonunun LBO ile satın aldığı şirkette faiz artışları sonrası borç dilimlerini yeniden yapılandırması.",
    content: "In private equity transactions, a Leveraged Buyout (LBO) utilizes a high proportion of debt financing (frequently sixty to eighty percent of the acquisition capital structure) to maximize equity returns on invested capital. Three years following a $2.8 billion sponsor-backed LBO of a global packaging manufacturer, Private Equity Operating Partner Victoria confronted an acute capital structure crisis. The original transaction had been engineered during an ultra-low interest rate regime, financed through an aggressive capital stack: $1.4 billion in floating-rate Senior Secured Term Loan B (TLB), $500 million in senior unsecured high-yield notes, and $300 million in mezzanine mezzanine subordinated debt.\n\nWhen central banks initiated rapid monetary tightening, the benchmark Secured Overnight Financing Rate (SOFR) escalated by five hundred basis points. The annual interest burden on the unhedged floating-rate Term Loan B ballooned from $42 million to nearly $115 million annually. This interest surge consumed ninety-five percent of the company’s operating cash flow, suffocating capital expenditures and threatening a debt service coverage ratio (DSCR) default.\n\nVictoria led an exhaustive comprehensive debt restructuring negotiation across the capital stack. She recognized that while the business possessed strong underlying gross operating profitability, the debt burden was mathematically unsustainable. Rather than pursuing judicial bankruptcy under Chapter 11, Victoria structured an out-of-court consensual recapitalization.\n\nShe negotiated an amend-and-extend agreement with the senior credit syndicate: the lenders agreed to extend the maturity of the Term Loan B by three years in exchange for a twenty-five basis point margin increase. Crucially, Victoria executed a debt-for-equity swap with the mezzanine bondholders: exchanging $300 million of high-interest mezzanine notes for a thirty percent common equity stake in the restructured entity. Furthermore, the private equity sponsor injected $150 million of fresh junior preferred equity to pay down revolving credit lines. The restructuring extinguished $300 million of balance sheet principal debt and slashed annual interest expenses by $38 million, restoring financial viability.",
    target_words: ["subordinated", "tightening", "recapitalization", "mezzanine"],
    target_vocabulary: [
      { word: "subordinated", phonetic: "/səˈbɔː.dɪ.neɪ.tɪd/", turkish_meaning: "ikincil, rüçhansız (tasfiyede sonra gelen borç)", context_sentence: "Subordinated mezzanine debt ranks behind senior secured bank loans." },
      { word: "tightening", phonetic: "/ˈtaɪ.tən.ɪŋ/", turkish_meaning: "parasal sıkılaşma (faiz artışı)", context_sentence: "Central bank monetary tightening escalated variable loan debt costs." },
      { word: "recapitalization", phonetic: "/ˌriːˌkæp.ɪ.təl.aɪˈzeɪ.ʃən/", turkish_meaning: "sermaye yapısını yeniden düzenleme", context_sentence: "The consensual recapitalization extinguished hundreds of millions in debt." },
      { word: "mezzanine", phonetic: "/ˈmez.ə.niːn/", turkish_meaning: "mezanin finansman (borç ile özkaynak arası hibrit borç)", context_sentence: "Mezzanine lenders exchanged debt notes for common equity shares." },
    ],
    comprehension_questions: [
      {
        question: "What macroeconomic factor precipitated the financial crisis in the leveraged buyout (LBO) company?",
        options: ["Global central bank interest rate hikes that dramatically increased floating-rate debt service costs", "A complete collapse in customer sales", "Loss of all factory machinery", "Currency hyperinflation"],
        correct_answer_index: 0,
        explanation: "Rising interest rates drove the floating-rate Term Loan B interest burden from $42 million to $115 million."
      },
      {
        question: "What financial transaction was executed with the mezzanine bondholders to relieve debt pressure?",
        options: ["Paying them in cash immediately", "A debt-for-equity swap exchanging $300 million of debt for 30% common equity", "Tearing up their certificates", "Filing for criminal prosecution"],
        correct_answer_index: 1,
        explanation: "Mezzanine lenders converted $300 million of debt into 30% common equity, eliminating interest payments."
      },
      {
        question: "How did the private equity sponsor support the consensual restructuring plan?",
        options: ["By selling all factory land", "By injecting $150 million of fresh junior preferred equity capital", "By taking all money out of the bank", "By abandoning the company"],
        correct_answer_index: 1,
        explanation: "The sponsor contributed $150 million in new preferred equity to pay down short-term credit facilities."
      },
    ],
  },
  {
    id: "fin-14-qualified-audit-opinion",
    title: "Independent Audit: Justifying a Qualified Audit Opinion",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    topic: "Bağımsız Denetim ve Şartlı Görüş",
    desc: "Uluslararası denetim firmasının bilançoda yer alan 45 milyon dolarlık şüpheli alacak nedeniyle şartlı görüş (qualified opinion) yayınlaması.",
    content: "In statutory corporate governance and independent financial auditing, an auditor's report represents the definitive professional opinion regarding whether a corporation’s financial statements present a true and fair view in accordance with International Financial Reporting Standards (IFRS). Senior Audit Partner Jonathan directed the annual external audit of a publicly traded logistics conglomerate. As the audit approached the statutory filing deadline, an irreconcilable valuation impasse erupted between the audit team and executive management.\n\nDuring substantive balance sheet testing, Jonathan’s team audited a $45 million trade receivable owed by a foreign state-owned postal operator that was currently undergoing severe sovereign debt restructuring. Under IFRS 9 (Financial Instruments), reporting entities must calculate and recognize an Expected Credit Loss (ECL) allowance reflecting probability-weighted default risks. While objective macroeconomic indicators and credit default swap spreads dictated that the receivable had suffered severe credit impairment requiring an eighty percent write-down ($36 million allowance), management adamantly refused to record the provision, claiming the sovereign debtor would settle in full.\n\nManagement pressured the audit firm, threatening to terminate the multi-million-dollar auditing engagement if Jonathan refused to issue an unqualified ('clean') audit opinion. Jonathan stood firm, upholding professional skepticism and auditor independence governed by the International Standards on Auditing (ISA 705). Jonathan evaluated the audit materiality: while the $36 million unrecorded allowance was material to net income, it was not pervasive to the financial statements as a whole, meaning the rest of the accounts (fixed assets, operating revenues, liabilities) were reliably substantiated.\n\nConsequently, Jonathan rejected management’s demands and issued a formal Qualified Audit Opinion ('Except For' opinion). In the 'Basis for Qualified Opinion' paragraph, Jonathan explicitly documented the unrecorded $36 million expected credit loss, explaining that except for the effects of this specific overstatement of receivables and net income, the financial statements presented fairly. The publication of the qualified report signaled to capital markets that auditor integrity remains the indispensable safeguard of market transparency.",
    target_words: ["statutory", "unqualified", "materiality", "pervasive"],
    target_vocabulary: [
      { word: "statutory", phonetic: "/ˈstætʃ.ʊ.tər.i/", turkish_meaning: "yasal, mevzuat gereği zorunlu", context_sentence: "Public companies must publish annual statutory audited accounts." },
      { word: "unqualified", phonetic: "/ʌnˈkwɒl.ɪ.faɪd/", turkish_meaning: "şartsız, olumlu (temiz denetim raporu)", context_sentence: "Management demanded an unqualified audit opinion despite missing provisions." },
      { word: "materiality", phonetic: "/məˌtɪə.riˈæl.ə.ti/", turkish_meaning: "önemlilik (denetimde kararları etkileyebilecek büyüklük)", context_sentence: "The unrecorded credit loss significantly exceeded audit materiality thresholds." },
      { word: "pervasive", phonetic: "/pəˈveɪ.sɪv/", turkish_meaning: "yaygın (tüm mali tabloları temelden sakatlayan)", context_sentence: "Because the misstatement was material but not pervasive, a qualified opinion was issued." },
    ],
    comprehension_questions: [
      {
        question: "Why did Audit Partner Jonathan refuse to issue an unqualified ('clean') audit opinion?",
        options: ["The company forgot to pay the audit fee", "Management refused to book an objective $36 million Expected Credit Loss allowance on an impaired receivable", "The financial report was typed in the wrong font", "The auditors arrived late"],
        correct_answer_index: 1,
        explanation: "Management improperly refused to book a mandatory $36 million credit loss provision on sovereign debt."
      },
      {
        question: "Under ISA 705, why did the auditor issue a 'Qualified Opinion' rather than an 'Adverse Opinion'?",
        options: ["The misstatement was material to earnings but not pervasive across the entire financial statements", "Qualified opinions are faster to write", "The management begged for it", "Adverse opinions are illegal"],
        correct_answer_index: 0,
        explanation: "A qualified opinion is rendered when a misstatement is material to specific items but not pervasive to the whole balance sheet."
      },
      {
        question: "What is an auditor's professional obligation when client executives threaten termination over accounting disagreements?",
        options: ["Obey the executives immediately", "Maintain independence and professional skepticism, adhering strictly to auditing standards", "Resign without telling anyone", "Change the numbers to make management happy"],
        correct_answer_index: 1,
        explanation: "Auditing standards mandate unwavering independence and professional skepticism despite commercial pressure."
      },
    ],
  },
  {
    id: "fin-15-inverted-yield-curve",
    title: "Central Bank Monetary Policy and Yield Curve Inversion",
    category: "finance_accounting",
    categoryName: "Finans & Muhasebe",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    topic: "Tersine Dönen Getiri Eğrisi (Yield Curve)",
    desc: "Merkez bankasının enflasyonu düşürmek için faiz artırması sonrası 10 yıllık ve 2 yıllık tahvil faizlerinin tersine dönmesi ve resesyon tahmini.",
    content: "In macroeconomics and fixed-income portfolio management, the shape of the sovereign government bond yield curve serves as the financial markets' most reliable predictive barometer of macroeconomic business cycles. At a global investment fund managing $40 billion in sovereign debt securities, Chief Macroeconomic Strategist Nathan analyzed the fixed-income market reaction following an aggressive seventy-five basis point rate hike by the Federal Reserve to combat persistent core inflation.\n\nUnder normal macroeconomic conditions, the yield curve exhibits an upward-sloping geometry: investors demand higher yields (term premium) to lock up capital in long-duration debt instruments to compensate for inflation uncertainty and duration risk over ten, twenty, or thirty years. However, following the central bank’s hawkish monetary policy announcement, the secondary sovereign bond market experienced an extreme structural anomaly: a severe inversion of the two-year versus ten-year Treasury yield curve (the benchmark 2s10s spread).\n\nAs short-term policy interest rates were pushed higher, the yield on two-year Treasury notes surged to 4.85 percent. Concurrently, institutional investors—anticipating that aggressive monetary tightening would inevitably crush aggregate economic demand and trigger a future recession—rushed to buy long-duration paper, bidding up prices and driving the ten-year Treasury bond yield down to 3.75 percent. This dynamic produced a negative yield spread of minus one hundred and ten basis points—the deepest yield curve inversion witnessed in four decades.\n\nNathan delivered an urgent strategic macro advisory to the fund’s asset allocation committee. Econometric historical analysis established that every single modern economic recession over the past sixty years was preceded by a sustained 2s10s yield curve inversion within a six-to-eighteen-month lag window. In response, Nathan executed an immediate defensive reallocation: reducing exposure to high-yield cyclical corporate credit and industrial equities, while reallocating five billion dollars into ultra-safe short-duration Treasury bills and defensive healthcare utilities, insulating institutional capital before the impending macroeconomic contraction.",
    target_words: ["macroeconomics", "inversion", "hawkish", "contraction"],
    target_vocabulary: [
      { word: "macroeconomics", phonetic: "/ˌmæk.rəʊ.iː.kəˈnɒm.ɪks/", turkish_meaning: "makroekonomi", context_sentence: "Macroeconomics studies aggregate national interest rates and inflation trends." },
      { word: "inversion", phonetic: "/ɪnˈvɜː.ʒən/", turkish_meaning: "tersine dönme (kısa vadeli faizin uzun vadeli faizi aşması)", context_sentence: "Yield curve inversion is historically the most reliable recession predictor." },
      { word: "hawkish", phonetic: "/ˈhɔː.kɪʃ/", turkish_meaning: "şahin (sıkı para politikasını ve faiz artışını savunan)", context_sentence: "The central bank adopted a hawkish policy stance to combat high inflation." },
      { word: "contraction", phonetic: "/kənˈtræk.ʃən/", turkish_meaning: "ekonomik daralma, küçülme", context_sentence: "The fund adopted defensive allocations prior to the macroeconomic contraction." },
    ],
    comprehension_questions: [
      {
        question: "What physical shape does a healthy, normal government bond yield curve have?",
        options: ["An upward-sloping curve where long-term yields exceed short-term yields", "A downward vertical cliff", "A completely flat line at zero", "A zig-zag shape"],
        correct_answer_index: 0,
        explanation: "Normally, investors demand a term premium, making long-term interest rates higher than short-term rates."
      },
      {
        question: "What does an inverted 2s10s Treasury yield curve historically signify to financial markets?",
        options: ["Immediate stock market boom", "A highly reliable leading indicator forecasting an economic recession within 6 to 18 months", "That interest rates will never change", "That gold has lost all value"],
        correct_answer_index: 1,
        explanation: "Historically, sustained yield curve inversions have preceded every modern economic recession."
      },
      {
        question: "How did Nathan reposition the $40 billion portfolio following the severe curve inversion?",
        options: ["By borrowing maximum debt", "By shifting $5 billion into short-duration Treasury bills and defensive sectors while reducing cyclical exposure", "By closing the investment fund", "By purchasing foreign real estate"],
        correct_answer_index: 1,
        explanation: "Nathan defensively reallocated into short-duration Treasuries and defensive utilities to guard against recession."
      },
    ],
  },
];

export const CORPORATE_FINANCE_STORIES = corporateFinanceStories;
export const FINANCE_ACCOUNTING_STORIES = corporateFinanceStories;
