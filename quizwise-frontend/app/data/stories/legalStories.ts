import { Story } from "./types";

export const legalStories: Story[] = [
  // ==========================================
  // LEVEL A (A1-A2, ~120-150 kelime, 2-3 dk)
  // ==========================================
  {
    id: "legal-01-nda-signing",
    title: "Signing a Mutual Non-Disclosure Agreement",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    topic: "Gizlilik Sözleşmesi (NDA)",
    desc: "İki teknoloji girişimi arasında potansiyel ortaklık öncesi ticari sırları ve müşteri verilerini koruyan gizlilik sözleşmesi.",
    content: "Before two software companies begin discussing a potential merger, their corporate attorneys prepare a mutual Non-Disclosure Agreement, commonly known as an NDA. This legally binding legal contract ensures that neither party will disclose proprietary trade secrets, software code, or confidential customer financial records to outside third parties.\n\nThe contract specifies a strict confidentiality period of three years. It also defines what constitutes protected confidential information and outlines specific exceptions, such as data that is already publicly available. Corporate Counsel Karen reviews the signatures on both sides. By executing this protective agreement first, both executive teams can openly share technical innovations and strategic business models without risking their valuable intellectual property.",
    target_words: ["proprietary", "confidential", "constitutes", "executing"],
    target_vocabulary: [
      { word: "proprietary", phonetic: "/prəˈpraɪə.tər.i/", turkish_meaning: "mülkiyete tabi, tescilli ticari sır", context_sentence: "The company closely guards its proprietary algorithms." },
      { word: "confidential", phonetic: "/ˌkɒn.fɪˈden.ʃəl/", turkish_meaning: "gizli, mahrem", context_sentence: "Customer financial records are strictly confidential." },
      { word: "constitutes", phonetic: "/ˈkɒn.stɪ.tʃuːts/", turkish_meaning: "oluşturur, teşkil eder", context_sentence: "The agreement defines what constitutes protected information." },
      { word: "executing", phonetic: "/ˈek.sɪ.kjuː.tɪŋ/", turkish_meaning: "imzalayarak yürürlüğe koyma", context_sentence: "Executing the NDA protects both parties before negotiations." },
    ],
    comprehension_questions: [
      {
        question: "What is the primary purpose of a mutual Non-Disclosure Agreement (NDA)?",
        options: ["To buy office furniture", "To legally prevent the disclosure of confidential trade secrets to third parties", "To hire employees without pay", "To register a patent with the government"],
        correct_answer_index: 1,
        explanation: "An NDA binds parties to keep proprietary business information and trade secrets confidential."
      },
      {
        question: "How long does the confidentiality obligation last in this agreement?",
        options: ["One single day", "Three years", "Fifty years", "Two weeks"],
        correct_answer_index: 1,
        explanation: "The contract specifies a confidentiality duration of three years."
      },
      {
        question: "What type of information is typically exempt from NDA protection?",
        options: ["Information that is already publicly known", "Secret computer passwords", "Customer credit cards", "Private financial statements"],
        correct_answer_index: 0,
        explanation: "Data already in the public domain is standardly excluded from confidentiality obligations."
      },
    ],
  },
  {
    id: "legal-02-copyright-warning",
    title: "Copyright Infringement Cease and Desist Letter",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 138,
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    topic: "Telif Hakkı Uyarısı",
    desc: "İzinsiz kullanılan bir logo ve ticari marka için fikri mülkiyet avukatının gönderdiği yasal ihtar mektubu.",
    content: "Graphic Designer Mark discovered that an online retail company was using his original copyrighted illustration on their merchandise without permission or payment. Mark consulted an intellectual property attorney, who promptly drafted a formal Cease and Desist letter. The letter identified Mark as the exclusive author and registered copyright owner of the artwork.\n\nThe formal notice gave the infringing business seven business days to remove the unauthorized graphics from their digital storefront and destroy all printed inventory. Furthermore, the letter requested an accounting of all profits earned from past sales. Serving a Cease and Desist notice is often the first legal step, warning wrongdoers to stop unlawful activity before costly federal copyright lawsuits are filed.",
    target_words: ["infringing", "exclusive", "unauthorized", "accounting"],
    target_vocabulary: [
      { word: "infringing", phonetic: "/ɪnˈfrɪn.dʒɪŋ/", turkish_meaning: "ihlal eden (hakkı çiğneyen)", context_sentence: "The infringing website copied the copyrighted logo without a license." },
      { word: "exclusive", phonetic: "/ɪkˈskluː.sɪv/", turkish_meaning: "münhasır, tek elden", context_sentence: "The author retains exclusive rights to duplicate the artwork." },
      { word: "unauthorized", phonetic: "/ʌnˈɔː.θər.aɪzd/", turkish_meaning: "yetkisiz, izinsiz", context_sentence: "They removed all unauthorized merchandise from shelves." },
      { word: "accounting", phonetic: "/əˈkaʊn.tɪŋ/", turkish_meaning: "hesap dökümü, gelir beyanı", context_sentence: "The lawyer demanded an accounting of all commercial sales." },
    ],
    comprehension_questions: [
      {
        question: "What legal document did the attorney send to the retail company?",
        options: ["A wedding invitation", "A formal Cease and Desist letter", "A bankruptcy notice", "A tax bill"],
        correct_answer_index: 1,
        explanation: "The lawyer served a formal Cease and Desist letter demanding the cessation of copyright infringement."
      },
      {
        question: "How many business days did the notice grant to remove the unauthorized graphics?",
        options: ["Seven business days", "Thirty calendar days", "One hour", "Six months"],
        correct_answer_index: 0,
        explanation: "The letter gave the infringing business seven business days to comply."
      },
      {
        question: "Why is a Cease and Desist letter sent before initiating a court trial?",
        options: ["To buy the company", "To warn the infringer and offer a chance to resolve the issue before costly litigation", "To change the copyright law", "To close down the internet"],
        correct_answer_index: 1,
        explanation: "It provides formal legal notice, giving the infringer an opportunity to cure the breach before court action."
      },
    ],
  },
  {
    id: "legal-03-commercial-lease",
    title: "Key Terms of a Commercial Lease Agreement",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    topic: "Ticari Kira Sözleşmesi",
    desc: "Bir kahve dükkanı sahibinin alışveriş merkezinde kiraladığı işyeri için depozito ve bakım şartlarını incelemesi.",
    content: "Emma is opening a new neighborhood bakery and must negotiate a commercial lease with the property management firm. Unlike residential apartment leases, commercial property contracts place significant maintenance responsibilities directly upon the tenant. The draft lease specifies a five-year term with a fixed monthly base rent of three thousand dollars.\n\nIn addition, the contract contains a Triple Net clause, requiring Emma to pay her proportional share of real estate taxes, building hazard insurance, and common area maintenance. Emma's lawyer carefully reviews the security deposit clause, ensuring the two-month deposit will be held in an interest-bearing escrow account. Understanding these contractual clauses protects small business owners from unexpected maintenance expenses and arbitrary rent increases.",
    target_words: ["residential", "proportional", "escrow", "arbitrary"],
    target_vocabulary: [
      { word: "residential", phonetic: "/ˌrez.ɪˈden.ʃəl/", turkish_meaning: "konut tipi, mesken", context_sentence: "Commercial leases differ fundamentally from residential rental agreements." },
      { word: "proportional", phonetic: "/prəˈpɔː.ʃən.əl/", turkish_meaning: "orantılı, payına düşen", context_sentence: "The tenant pays a proportional share of property insurance." },
      { word: "escrow", phonetic: "/ˈes.krəʊ/", turkish_meaning: "emanet/bloke hesap", context_sentence: "The security deposit was deposited into an escrow bank account." },
      { word: "arbitrary", phonetic: "/ˈɑː.bɪ.trər.i/", turkish_meaning: "keyfi, tek taraflı", context_sentence: "Fixed terms protect tenants from arbitrary rent hikes." },
    ],
    comprehension_questions: [
      {
        question: "How long is the initial term of Emma's bakery commercial lease?",
        options: ["One month", "Five years", "Twenty years", "Six months"],
        correct_answer_index: 1,
        explanation: "The agreement specifies an initial term of five years."
      },
      {
        question: "What does a 'Triple Net' lease clause require the tenant to pay?",
        options: ["Only the water bill", "Base rent plus proportional shares of property taxes, insurance, and maintenance", "Three times the rent during holidays", "No rent at all"],
        correct_answer_index: 1,
        explanation: "A Triple Net lease obligates the tenant to pay taxes, property insurance, and common maintenance."
      },
      {
        question: "Where will Emma's security deposit be securely held?",
        options: ["In the landlord's personal pocket", "In an interest-bearing escrow account", "Under the floorboards", "In a foreign bank"],
        correct_answer_index: 1,
        explanation: "The contract dictates that the deposit be preserved in an interest-bearing escrow account."
      },
    ],
  },
  {
    id: "legal-04-employment-offer",
    title: "Employment Offer Letter and Restrictive Covenants",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 142,
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    topic: "İş Teklif Mektubu ve Şartlar",
    desc: "Yazılım mühendisine sunulan iş teklifinde rekabet etmeme ve fikri mülkiyet devri maddelerinin analizi.",
    content: "Software Engineer Thomas received a formal employment offer letter for a senior developer position at a financial technology corporation. The letter outlines his annual base compensation, medical benefits, stock option grants, and paid annual leave. However, Thomas's attorney advises him to read the attached restrictive covenants carefully.\n\nThe contract includes a non-compete clause, prohibiting Thomas from working for direct market competitors within a fifty-mile radius for twelve months following departure. It also includes an intellectual property assignment clause, stating that all patents and software algorithms written using company equipment belong exclusively to the employer. Thomas negotiates to narrow the non-compete scope before signing, ensuring his future professional mobility remains protected while accepting his exciting career advancement.",
    target_words: ["compensation", "covenants", "prohibiting", "mobility"],
    target_vocabulary: [
      { word: "compensation", phonetic: "/ˌkɒm.penˈseɪ.ʃən/", turkish_meaning: "ücret, maaş ve yan haklar", context_sentence: "His compensation package included performance bonuses and stock options." },
      { word: "covenants", phonetic: "/ˈkʌv.ə.nənts/", turkish_meaning: "taahhütler, bağlayıcı sözleşme maddeleri", context_sentence: "The employment contract contained restrictive post-employment covenants." },
      { word: "prohibiting", phonetic: "/prəˈhɪb.ɪ.tɪŋ/", turkish_meaning: "yasaklayan, men eden", context_sentence: "A non-compete clause prohibited working for immediate industry rivals." },
      { word: "mobility", phonetic: "/məʊˈbɪl.ə.ti/", turkish_meaning: "hareket kabiliyeti, mesleki serbestlik", context_sentence: "He narrowed the clause to protect his future career mobility." },
    ],
    comprehension_questions: [
      {
        question: "What restriction does a 'non-compete clause' place on an employee?",
        options: ["You cannot take a vacation", "You cannot work for direct competitors in a specified region for a set period after leaving", "You must wear a suit every day", "You cannot speak to your family"],
        correct_answer_index: 1,
        explanation: "Non-compete covenants restrict former employees from working with direct rivals for a designated period."
      },
      {
        question: "Who owns the software code created on company computers under the IP assignment clause?",
        options: ["The employee exclusively", "The employer exclusively", "The public domain", "The software store"],
        correct_answer_index: 1,
        explanation: "The intellectual property assignment clause transfers ownership of inventions to the employer."
      },
      {
        question: "What did Thomas do before signing the formal job offer?",
        options: ["He tore up the contract", "He negotiated to narrow the geographic and duration scope of the non-compete clause", "He gave away his computer", "He asked for five years of advance pay"],
        correct_answer_index: 1,
        explanation: "Thomas successfully negotiated to reduce the restrictive scope of the non-compete clause."
      },
    ],
  },
  {
    id: "legal-05-consumer-rights",
    title: "Consumer Statutory Warranty and Refund Rights",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 138,
    coverImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    topic: "Tüketici İade Hakları",
    desc: "Arızalı çıkan elektronik ürün için tüketicinin yasal garanti ve tam bedel iadesi hakkını kullanması.",
    content: "When Clara purchased a brand-new laptop, the screen began flickering and went completely black after three days. When she returned to the retail electronics store with her receipt, the store clerk pointed to a sign claiming: 'All sales are final; no cash refunds.' However, Clara knew her statutory consumer protection rights under commercial law.\n\nUnder statutory warranty regulations, goods sold by professional merchants must be of satisfactory quality and fit for their intended purpose. Store policies cannot override mandatory statutory rights enacted by parliament. Clara calmly requested to speak with the store manager, presenting her invoice and citing consumer legislation. Recognizing their legal liability, the manager immediately processed a full monetary refund, demonstrating how consumer awareness upholds fair business practices.",
    target_words: ["statutory", "warranty", "override", "legislation"],
    target_vocabulary: [
      { word: "statutory", phonetic: "/ˈstætʃ.ʊ.tər.i/", turkish_meaning: "kanuni, yasadan doğan", context_sentence: "Consumers possess statutory rights that cannot be waived." },
      { word: "warranty", phonetic: "/ˈwɒr.ən.ti/", turkish_meaning: "garanti taahhüdü", context_sentence: "All new appliances carry an implied statutory warranty of quality." },
      { word: "override", phonetic: "/ˌəʊ.vəˈraɪd/", turkish_meaning: "geçersiz kılmak, hükümsüz bırakmak", context_sentence: "Private retail store policies cannot override statutory consumer laws." },
      { word: "legislation", phonetic: "/ˌledʒ.ɪˈsleɪ.ʃən/", turkish_meaning: "mevzuat, kanunlar bütünü", context_sentence: "Consumer protection legislation guarantees repair, replacement, or refund." },
    ],
    comprehension_questions: [
      {
        question: "What did the retail store clerk claim when Clara brought back the defective laptop?",
        options: ["'We will give you free coffee'", "'All sales are final; no cash refunds'", "'We will double your money'", "'You bought the wrong model'"],
        correct_answer_index: 1,
        explanation: "The clerk cited an internal store policy claiming all sales were final with no refunds."
      },
      {
        question: "Can an internal store policy override mandatory statutory consumer law?",
        options: ["Yes, store policies always win", "No, private retail policies cannot override statutory legislation", "Only on weekends", "Only if written in red ink"],
        correct_answer_index: 1,
        explanation: "Statutory rights granted by law strictly supersede private merchant policies."
      },
      {
        question: "What resolution did the store manager provide after Clara cited consumer legislation?",
        options: ["He called security", "He processed an immediate full monetary refund", "He gave her a discount coupon for candy", "He kept the laptop without paying"],
        correct_answer_index: 1,
        explanation: "The manager acknowledged the legal requirement and provided a complete cash refund."
      },
    ],
  },

  // ==========================================
  // LEVEL B (B1-B2, ~230-280 kelime, 4-5 dk)
  // ==========================================
  {
    id: "legal-06-breach-of-contract-notice",
    title: "Formal Notice of Material Breach of Contract",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    topic: "Sözleşme İhlali ve İhtar Süreci",
    desc: "Yazılım teslimatını geciktiren yükleniciye gönderilen 30 günlük fesih öncesi düzeltme (cure) ihtarı.",
    content: "In commercial contract administration, serving a formal Notice of Material Breach constitutes a decisive procedural prerequisite before initiating contract termination or damages litigation. On the Global Enterprise Resource Planning (ERP) Implementation project, client corporate counsel Evelyn reviewed the vendor's chronic delivery defaults. Under Clause 14.2 of the Master Services Agreement, the software vendor was contractually obligated to deliver the finalized inventory management module by September 30. By November 15, the vendor had failed to deliver functional code, causing severe disruption to the client's nationwide distribution centers.\n\nEvelyn drafted a formal Notice of Default and Demand to Cure. The notice detailed the specific contractual covenants breached, accompanied by forensic audit logs demonstrating that fifty-eight critical software tickets remained unresolved. Pursuant to the contract’s dispute provisions, Evelyn established a strict thirty-day cure period. The notice stated unequivocally that if the vendor failed to remedy all material defects and deploy an operational module within thirty calendar days, the client would exercise its contractual right to terminate for default.\n\nServing this notice via certified courier created an indisputable contemporaneous evidentiary record. It put the vendor on formal notice that continuing non-performance would result in legal action to recover advance milestone payments, consequential damages, and the excess reprocurement costs incurred in hiring a replacement software vendor. Confronted with formal termination exposure, the vendor immediately mobilized senior executive engineering teams to rectify the defects.",
    target_words: ["prerequisite", "chronic", "covenants", "rectify"],
    target_vocabulary: [
      { word: "prerequisite", phonetic: "/ˌpriːˈrek.wɪ.zɪt/", turkish_meaning: "ön şart, zorunlu ön koşul", context_sentence: "Serving a formal breach notice is a prerequisite to contractual termination." },
      { word: "chronic", phonetic: "/ˈkrɒn.ɪk/", turkish_meaning: "süregelen, kronikleşmiş", context_sentence: "The vendor suffered from chronic delivery delays." },
      { word: "covenants", phonetic: "/ˈkʌv.ə.nənts/", turkish_meaning: "sözleşmesel yükümlülükler", context_sentence: "The letter cited multiple breached covenants in the services agreement." },
      { word: "rectify", phonetic: "/ˈrek.tɪ.faɪ/", turkish_meaning: "düzeltmek, telafi etmek", context_sentence: "The vendor had thirty days to rectify the software defects." },
    ],
    comprehension_questions: [
      {
        question: "What contractual document did Evelyn issue to the defaulting software vendor?",
        options: ["A termination of lease", "A formal Notice of Default and Demand to Cure", "A bonus award letter", "A trademark registration"],
        correct_answer_index: 1,
        explanation: "Evelyn drafted and served a formal Notice of Default giving a 30-day window to cure the breach."
      },
      {
        question: "How much time was granted under the contractual cure period to remedy the software defects?",
        options: ["Twenty-four hours", "Thirty calendar days", "One full year", "Three business days"],
        correct_answer_index: 1,
        explanation: "The agreement provided a strict thirty-day cure period to correct the non-performance."
      },
      {
        question: "What remedy could the client pursue if the vendor failed to cure the material breach?",
        options: ["Immediate contract termination, recovery of advance payments, and reprocurement damages", "Lowering software prices", "Hiring the vendor's staff", "Writing a negative online review"],
        correct_answer_index: 0,
        explanation: "Failure to cure permits termination for cause, reimbursement of advances, and excess reprocurement costs."
      },
    ],
  },
  {
    id: "legal-07-liquidated-damages",
    title: "Liquidated Damages versus the Penalty Doctrine",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 265,
    coverImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    topic: "Cezai Şart ve Tazminat Değerlendirmesi",
    desc: "Gecikme cezalarının sözleşmelerde geçerli olabilmesi için tazminat niteliğinde olması, ceza (penalty) olmaması kuralı.",
    content: "When a commercial contractor fails to achieve completion by the agreed milestone date, employers frequently invoke liquidated damages clauses to deduct financial sums without proving actual losses in court. However, in common law jurisdictions, courts draw a rigorous legal distinction between an enforceable liquidated damages clause and an unenforceable penalty clause. Senior Construction Litigator Michael addressed this exact issue when defending a structural steel contractor against a $12 million delay assessment on an automotive manufacturing plant.\n\nThe project owner had inserted a clause assessing $50,000 for each calendar day of delay. Michael filed a motion seeking summary determination, arguing that the clause operated as an unlawful penalty intended to terrorize the contractor in terrorem, rather than a genuine pre-estimate of loss. Under the governing legal standard established in the landmark Cavendish Square Holding ruling, a contractual provision is an unenforceable penalty if it imposes a detriment out of all proportion to any legitimate commercial interest of the innocent party.\n\nMichael presented contemporaneous internal emails from the owner’s negotiation files, proving that the $50,000 daily figure was arbitrarily selected without conducting any economic loss assessment or factoring in rental losses. Furthermore, the automotive factory could not have commenced operations anyway due to delayed environmental permits held by the owner. The commercial judge agreed, striking down the liquidated damages clause as an unenforceable penalty, restricting the owner to claiming only actual, proven consequential losses.",
    target_words: ["jurisdictions", "enforceable", "detriment", "arbitrarily"],
    target_vocabulary: [
      { word: "jurisdictions", phonetic: "/ˌdʒʊə.rɪsˈdɪk.ʃənz/", turkish_meaning: "hukuk sistemleri, yargı yetkisi alanları", context_sentence: "Common law jurisdictions maintain strict rules against punitive penalties." },
      { word: "enforceable", phonetic: "/ɪnˈfɔː.sə.bəl/", turkish_meaning: "hukuken icra edilebilir, geçerli", context_sentence: "Pre-estimated damages clauses are legally enforceable in court." },
      { word: "detriment", phonetic: "/ˈdet.rɪ.mənt/", turkish_meaning: "zarar, orantısız külfet", context_sentence: "The clause imposed an extravagant detriment out of all proportion to loss." },
      { word: "arbitrarily", phonetic: "/ˌɑː.bɪˈtrer.əl.i/", turkish_meaning: "keyfi olarak, hesapsızca", context_sentence: "The daily penalty rate was chosen arbitrarily without financial modeling." },
    ],
    comprehension_questions: [
      {
        question: "What legal distinction do common law courts enforce regarding delay compensation clauses?",
        options: ["Contracts cannot be written in English", "Liquidated damages must represent a genuine pre-estimate of loss rather than an unlawful punitive penalty", "All delay clauses are automatically illegal", "Damages must be paid in gold coins"],
        correct_answer_index: 1,
        explanation: "Courts enforce pre-estimated liquidated damages but strike down clauses intended purely as punitive penalties."
      },
      {
        question: "Under the Cavendish Square standard, when does a contractual clause become an unenforceable penalty?",
        options: ["If the contract is longer than ten pages", "When it imposes a detriment out of all proportion to the innocent party's legitimate interest", "When signed on a holiday", "If the parties are foreign"],
        correct_answer_index: 1,
        explanation: "A clause is an unenforceable penalty if the detriment is extravagant and disproportionate to legitimate interests."
      },
      {
        question: "Why did the judge strike down the $50,000 per day liquidated damages provision?",
        options: ["The contractor was bankrupt", "It was arbitrarily chosen without economic justification while the plant could not operate anyway", "The steel was delivered early", "The judge forgot to read the contract"],
        correct_answer_index: 1,
        explanation: "Evidence proved the amount was picked arbitrarily without economic basis, making it an unlawful penalty."
      },
    ],
  },
  {
    id: "legal-08-force-majeure-declaration",
    title: "Force Majeure Declaration in Global Supply Chains",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    topic: "Mücbir Sebep (Force Majeure) Beyanı",
    desc: "Süveyş Kanalı'nın tıkanması ve savaş nedeniyle tedarik zinciri kesintisinde mücbir sebep maddesinin işletilmesi.",
    content: "When an international maritime canal was blocked by a grounded mega-container vessel and concurrent regional geopolitical conflicts shuttered shipping lanes, Industrial Components Manufacturer Apex faced an unprecedented logistical breakdown. Apex was contractually obligated under an international sales contract to deliver two hundred specialized power transformers to a European utility within sixty days, subject to severe default penalties for late delivery.\n\nIn-house Legal Director Patricia scrutinized the Master Supply Agreement’s Force Majeure clause. Under governing commercial principles, successfully invoking force majeure requires meeting three rigorous criteria: the disruptive event must be beyond the reasonable control of the affected party; it could not have been foreseen or prevented at the time of contract execution; and it renders performance legally or physically impossible, rather than merely more commercially expensive.\n\nPatricia drafted a formal Notice of Force Majeure Event. She detailed the physical blockage of the maritime transit corridor and included maritime tracking logs showing that alternative maritime shipping via the Cape of Good Hope added forty-five sailing days. Crucially, Patricia established that Apex had exercised all reasonable mitigation measures: exploring air-cargo charters, querying alternative component suppliers, and re-routing undamaged shipments. By providing prompt statutory notice and proving that performance had become physically frustrated, Patricia secured an eight-week contractual delivery extension, completely relieving Apex from contractual default liabilities.",
    target_words: ["geopolitical", "criteria", "frustrated", "mitigation"],
    target_vocabulary: [
      { word: "geopolitical", phonetic: "/ˌdʒiː.əʊ.pəˈlɪt.ɪ.kəl/", turkish_meaning: "jeopolitik", context_sentence: "Geopolitical conflict closed strategic international maritime straits." },
      { word: "criteria", phonetic: "/kraɪˈtɪə.ri.ə/", turkish_meaning: "kriterler, yasal ölçütler", context_sentence: "The event satisfied all three legal criteria for force majeure." },
      { word: "frustrated", phonetic: "/frʌsˈtreɪ.tɪd/", turkish_meaning: "ifa imkansızlığına uğramış (hukuken ifası imkansız)", context_sentence: "Physical delivery was frustrated by complete canal closure." },
      { word: "mitigation", phonetic: "/ˌmɪt.ɪˈɡeɪ.ʃən/", turkish_meaning: "zararı azaltma, hafifletme tedbirleri", context_sentence: "The affected supplier proved exhaustive mitigation efforts." },
    ],
    comprehension_questions: [
      {
        question: "What three legal criteria must be demonstrated to successfully invoke force majeure?",
        options: ["Event beyond control, unforeseeable at signing, and rendering performance impossible rather than just more expensive", "Heavy rainfall, lost keys, and bank holiday closures", "Changing mind about prices, forgetting delivery dates, and employee turnover", "Government change, tax hike, and currency drop"],
        correct_answer_index: 0,
        explanation: "Force majeure requires an uncontrollable, unforeseeable event making performance impossible, not just costlier."
      },
      {
        question: "Why did simply being more expensive not qualify as force majeure on its own?",
        options: ["Commercial contracts expect suppliers to bear economic market price fluctuations", "Money does not exist in commercial law", "Canals are always free", "All shipping is free"],
        correct_answer_index: 0,
        explanation: "Mere commercial hardship or increased cost does not excuse performance under force majeure."
      },
      {
        question: "What outcome did Patricia achieve for Apex through the formal notice?",
        options: ["The company went bankrupt", "An eight-week contractual delivery extension without delay liabilities", "The cancellation of all sales", "A fine from the United Nations"],
        correct_answer_index: 1,
        explanation: "Apex obtained an excused eight-week extension, shielding it from contractual delay penalties."
      },
    ],
  },
  {
    id: "legal-09-ip-licensing-assignment",
    title: "Exclusive Intellectual Property Licensing and Assignment",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    topic: "Fikri Mülkiyet Lisans Devri",
    desc: "Biyoteknoloji patentinin küresel ilaç şirketine münhasır lisans devri ve telif (royalty) yapısı.",
    content: "When university-incubated biotech startup GeneCraft patented a breakthrough molecular delivery mechanism for messenger RNA therapies, multinational pharmaceutical giants sought commercial access. IP Attorney Julian represented the startup in structuring an Exclusive Global Patent License and Technology Transfer Agreement with a global pharmaceutical corporation. In IP transactions, distinguishing between an absolute assignment of ownership and an exclusive license is of paramount legal significance.\n\nGeneCraft refused to assign (permanently sell) the underlying patent title, choosing instead to grant an exclusive, worldwide commercial license restricted to oncology and autoimmune therapeutic fields. This legal architecture allowed GeneCraft to retain underlying patent ownership while licensing rights for infectious diseases to other pharmaceutical developers. Julian structured a multi-tiered compensation framework: an upfront non-refundable execution fee of $15 million, milestone payments tied to successful FDA Phase II and Phase III clinical trials, and an eight percent running royalty on gross commercial net sales.\n\nTo safeguard the patent against commercial shelving, Julian inserted robust diligence covenants. The licensee was contractually obligated to spend a minimum of $20 million annually on clinical research and achieve first commercial sale within five years. If the licensee failed to meet these developmental milestones, the license would automatically convert from exclusive to non-exclusive, or terminate entirely, reverting all proprietary commercial rights back to GeneCraft.",
    target_words: ["incubated", "assignment", "paramount", "diligence"],
    target_vocabulary: [
      { word: "incubated", phonetic: "/ˈɪŋ.kjə.beɪ.tɪd/", turkish_meaning: "kuluçkalanmış, üniversitede geliştirilmiş", context_sentence: "The startup was incubated within a university research park." },
      { word: "assignment", phonetic: "/əˈsaɪn.mənt/", turkish_meaning: "mülkiyet devri, temlik", context_sentence: "An assignment transfers full legal ownership of the patent." },
      { word: "paramount", phonetic: "/ˈpær.ə.maʊnt/", turkish_meaning: "en üstün, hayati önemde", context_sentence: "Protecting underlying patent title was of paramount importance." },
      { word: "diligence", phonetic: "/ˈdɪl.ɪ.dʒəns/", turkish_meaning: "özen yükümlülüğü (ticari geliştirme şartı)", context_sentence: "Diligence covenants prevented the licensee from shelving the technology." },
    ],
    comprehension_questions: [
      {
        question: "What is the key legal difference between a patent assignment and a patent license?",
        options: ["An assignment permanently transfers ownership, while a license merely grants permission to use the patent", "A license is only for software", "An assignment is free, while a license is expensive", "There is no difference"],
        correct_answer_index: 0,
        explanation: "Assignment permanently transfers legal title, whereas licensing grants permission while ownership is retained."
      },
      {
        question: "What financial structure did Julian establish for GeneCraft?",
        options: ["Only a one-dollar payment", "An upfront $15 million fee, clinical milestone payments, and an eight percent running royalty on sales", "A trade for company shares only", "A monthly salary for all students"],
        correct_answer_index: 1,
        explanation: "The agreement included an upfront fee, clinical trial milestone payments, and ongoing net sales royalties."
      },
      {
        question: "How did the contract protect GeneCraft against the buyer 'shelving' the patent without development?",
        options: ["By suing the government", "By including diligence covenants requiring minimum R&D spending or risking loss of exclusivity", "By calling the police", "By taking back the patent every weekend"],
        correct_answer_index: 1,
        explanation: "Commercial diligence clauses required minimum annual R&D investment or the license revoked exclusivity."
      },
    ],
  },
  {
    id: "legal-10-mou-binding-status",
    title: "Enforceability of Memorandums of Understanding (MOU)",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    topic: "Ön Protokolün Bağlayıcılığı",
    desc: "Şirket birleşmelerinde imzalanan niyet mektubunun (MOU) bağlayıcı olan ve olmayan maddelerinin hukuki ayrımı.",
    content: "During pre-transaction negotiations for a joint venture between an international port operator and a national railway company, the executive teams drafted a comprehensive Memorandum of Understanding (MOU), often termed a Letter of Intent (LOI). Such preliminary deal documents record commercial consensus on core terms while definitive transaction agreements are drafted. However, ambiguous drafting can trigger severe litigation if one party mistakenly treats the MOU as an irrevocably binding purchase contract.\n\nCorporate Transactional Attorney Arthur was tasked with reviewing the draft to establish clear legal boundaries. In modern commercial jurisprudence, the binding nature of an MOU depends not on its document title, but on the manifested objective intent of the contracting parties and the linguistic certainty of the provisions. Arthur inserted an explicit 'Carve-Out' clause separating binding covenants from non-binding statements of commercial aspiration.\n\nThe MOU expressly declared that sections addressing equity valuation, future dividend policies, and board representation were non-binding statements of intent, subject to the execution of definitive shareholder agreements and satisfactory financial due diligence. Conversely, Arthur designated three critical sections as strictly legally binding: the ninety-day exclusivity (no-shop) commitment, the mutual confidentiality covenant, and the governing law and arbitration clause. When negotiations subsequently stalled over environmental liabilities, the railroad attempted to force execution of the sale. The commercial court upheld Arthur’s drafting, confirming that the business purchase was non-binding while enforcing the confidentiality and exclusivity remedies.",
    target_words: ["preliminary", "ambiguous", "jurisprudence", "exclusivity"],
    target_vocabulary: [
      { word: "preliminary", phonetic: "/prɪˈlɪm.ɪ.nər.i/", turkish_meaning: "öncül, hazırlık mahiyetinde", context_sentence: "An MOU serves as a preliminary framework for complex deals." },
      { word: "ambiguous", phonetic: "/æmˈbɪɡ.ju.əs/", turkish_meaning: "belirsiz, muğlak", context_sentence: "Ambiguous contract drafting invites expensive court litigation." },
      { word: "jurisprudence", phonetic: "/ˌdʒʊə.rɪsˈpruː.dəns/", turkish_meaning: "içtihat, hukuk bilimi", context_sentence: "Commercial jurisprudence examines the objective intent of the parties." },
      { word: "exclusivity", phonetic: "/ˌek.skluːˈsɪv.ə.ti/", turkish_meaning: "münhasırlık (başka alıcıyla görüşmeme taahhüdü)", context_sentence: "The ninety-day exclusivity clause barred talks with other bidders." },
    ],
    comprehension_questions: [
      {
        question: "How do courts determine whether a Memorandum of Understanding (MOU) is legally binding?",
        options: ["By looking only at the word 'MOU' at the top of the page", "By analyzing the objective intent of the parties and the specific language used in the clauses", "By the color of the paper it was printed on", "All MOUs are always 100% non-binding"],
        correct_answer_index: 1,
        explanation: "Courts evaluate the manifested intent of the parties and the express wording of the provisions."
      },
      {
        question: "What specific clauses did Arthur draft as strictly legally binding within the MOU?",
        options: ["The final sale price and board seats", "Exclusivity (no-shop), confidentiality, and the governing law/arbitration clause", "The holiday schedule", "The company name"],
        correct_answer_index: 1,
        explanation: "He carved out exclusivity, confidentiality, and arbitration as legally binding terms."
      },
      {
        question: "What did the commercial court rule when the railroad tried to force the transaction?",
        options: ["It forced the sale immediately", "It ruled the deal terms were non-binding, while upholding exclusivity and confidentiality protections", "It sent everyone to jail", "It tore up the document"],
        correct_answer_index: 1,
        explanation: "The court held that substantive acquisition terms remained non-binding expressions of intent."
      },
    ],
  },

  // ==========================================
  // LEVEL C (C1-C2, ~330-380 kelime, 5-6 dk)
  // ==========================================
  {
    id: "legal-11-icc-jurisdictional-challenge",
    title: "Jurisdictional Challenge in ICC International Arbitration",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    topic: "ICC Tahkiminde Yetki İtirazı",
    desc: "Milletlerarası Ticaret Odası (ICC) nezdinde yetkisizlik itirazı ve Kompetenz-Kompetenz doktrini.",
    content: "In high-stakes international commercial dispute resolution, filing a preliminary jurisdictional plea under Article 6 of the ICC Rules of Arbitration constitutes an aggressive procedural defense. Following the expropriation of an international telecommunications concession in North Africa, Lead Arbitration Counsel Elena represented the respondent state entity against an $800 million claim submitted to the International Chamber of Commerce (ICC) Court of Arbitration in Paris.\n\nElena initiated a bifurcated jurisdictional challenge pursuant to the internationally recognized doctrine of Kompetenz-Kompetenz. Under this cornerstone principle of modern international arbitration, an arbitral tribunal possesses the autonomous jurisdictional power to rule upon its own substantive competence, including any objections concerning the existence, validity, or scope of the arbitration agreement. Elena argued that the claimant’s notice of arbitration was premature and legally defective because the underlying concession contract contained a multi-tiered dispute escalation clause (waterfall clause).\n\nThe waterfall provision explicitly mandated that prior to submitting any dispute to ICC arbitration, the parties must exhaust two mandatory sequential conditions precedent: ninety days of good-faith senior executive negotiations, followed by formal mediation under the ICC Mediation Rules. Contemporaneous documentary evidence demonstrated that the claimant had bypassed the mediation phase entirely, rushing directly to arbitration following a change in ministerial leadership. Elena contended that the arbitration clause was not yet perfected; therefore, the tribunal lacked adjudicative jurisdiction.\n\nAfter comprehensive preliminary hearings, the three-member arbitral tribunal issued a Partial Award on Jurisdiction. The tribunal affirmed Elena’s construction of the waterfall clause, ruling that compliance with pre-arbitral mediation was a mandatory condition precedent to the tribunal's adjudicative authority. The tribunal stayed arbitration proceedings for four months, ordering the claimant to participate in good-faith mediation while bearing all institutional costs of the jurisdictional hearing, establishing the imperative of strict procedural compliance in cross-border dispute pacts.",
    target_words: ["bifurcated", "Kompetenz-Kompetenz", "adjudicative", "precedent"],
    target_vocabulary: [
      { word: "bifurcated", phonetic: "/ˈbaɪ.fə.keɪ.tɪd/", turkish_meaning: "iki aşamaya ayrılmış (önce yetki, sonra esasa bakan)", context_sentence: "The tribunal approved a bifurcated schedule to address jurisdiction first." },
      { word: "Kompetenz-Kompetenz", phonetic: "/kɔm-pə-ˈtɛnts kɔm-pə-ˈtɛnts/", turkish_meaning: "yetki-yetkisi (hakemin kendi yetkisine bizzat karar vermesi)", context_sentence: "Under Kompetenz-Kompetenz, the arbitral panel determined its own jurisdiction." },
      { word: "adjudicative", phonetic: "/əˈdʒuː.dɪ.kə.tɪv/", turkish_meaning: "yargısal, karar verme yetkisiyle ilgili", context_sentence: "The tribunal lacked adjudicative power before mediation was completed." },
      { word: "precedent", phonetic: "/ˈpres.ɪ.dənt/", turkish_meaning: "ön şart, yerine getirilmesi zorunlu aşama (condition precedent)", context_sentence: "Mediation was a mandatory condition precedent to arbitration." },
    ],
    comprehension_questions: [
      {
        question: "What does the international legal doctrine of 'Kompetenz-Kompetenz' grant to an arbitral tribunal?",
        options: ["The power to print money", "The autonomous power to rule upon its own legal jurisdiction and competence", "The ability to appoint government ministers", "Power to arrest witnesses"],
        correct_answer_index: 1,
        explanation: "Kompetenz-Kompetenz authorizes the arbitral tribunal to determine its own jurisdiction and competence."
      },
      {
        question: "Why did Elena argue that the claimant's arbitration filing was legally defective?",
        options: ["The claimant paid with the wrong currency", "The claimant skipped the mandatory mediation step required by the waterfall dispute clause", "The claimant missed the filing deadline by five years", "The lawyers forgot to sign their names"],
        correct_answer_index: 1,
        explanation: "The claimant bypassed the contractual requirement to complete mediation before launching arbitration."
      },
      {
        question: "What ruling did the arbitral tribunal issue in its Partial Award on Jurisdiction?",
        options: ["It dismissed the case forever without discussion", "It confirmed mediation was a mandatory condition precedent and stayed arbitration for four months", "It awarded $800 million to the claimant immediately", "It referred the case to a local criminal court"],
        correct_answer_index: 1,
        explanation: "The tribunal held mediation to be a mandatory prerequisite, pausing arbitration for four months."
      },
    ],
  },
  {
    id: "legal-12-cross-examination-spoliation",
    title: "Cross-Examination and Spoliation of Evidence in Commercial Litigation",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    topic: "Çapraz Sorgu ve Delil Karartma",
    desc: "Yüksek Mahkeme ticari davasında şirket içi e-postaların kasıtlı silinmesinin ortaya çıkarılması ve adverse inference.",
    content: "During a six-week commercial trial before the High Court of Justice in London concerning an alleged $120 million conspiracy to misappropriate algorithmic trading algorithms, Trial Advocate Victoria executed a devastating cross-examination of the defendant's Chief Technology Officer (CTO). The litigation centered upon whether the defendant had reverse-engineered the claimant's proprietary high-frequency code or independently developed the software architecture as claimed under oath.\n\nPrior to trial, during electronic disclosure (e-discovery), the defendant claimed that several backup servers and email archives from the development window had been routinely overwritten pursuant to an automatic thirty-day data retention policy. However, Victoria had retained forensic computer specialists who uncovered metadata fragments indicating that thirty-two laptop hard drives had been intentionally scrubbed with military-grade overwriting software forty-eight hours after receiving the formal Letter of Claim.\n\nStepping to the podium, Victoria commenced cross-examination with forensic restraint. Rather than aggressively accusing the witness, she methodically locked the CTO into specific affirmative declarations: confirming his technical mastery, his detailed knowledge of litigation hold obligations, and his personal control over the engineering repositories. Then, confronting him with server access timestamps and wiped drive logs, she forced the witness to admit that he personally ordered the automated retention deletion window reduced from six months to forty-eight hours immediately after receiving legal notice.\n\nVictoria promptly moved for sanctions based on the spoliation of evidence—the intentional destruction or substantial alteration of evidence relevant to pending litigation. The presiding High Court judge granted Victoria’s motion, ruling that the destruction was deliberate and bad-faith. The court applied the evidentiary doctrine of 'adverse inference'—directing that the destroyed communications were presumed to have contained explicit proof of copyright infringement, shifting the burden of proof entirely and dismantling the defense.",
    target_words: ["misappropriate", "e-discovery", "spoliation", "inference"],
    target_vocabulary: [
      { word: "misappropriate", phonetic: "/ˌmɪs.əˈprəʊ.pri.eɪt/", turkish_meaning: "haksız yere zimmetine geçirmek, çalmak", context_sentence: "The lawsuit alleged a conspiracy to misappropriate trading algorithms." },
      { word: "e-discovery", phonetic: "/iː-dɪˈskʌv.ər.i/", turkish_meaning: "elektronik delil tespiti ve ifşa süreci", context_sentence: "Forensic specialists scrutinized server metadata during e-discovery." },
      { word: "spoliation", phonetic: "/ˌspəʊ.liˈeɪ.ʃən/", turkish_meaning: "delil karartma, delilleri kasten yok etme", context_sentence: "Intentional deletion of emails constituted gross spoliation of evidence." },
      { word: "inference", phonetic: "/ˈɪn.fər.əns/", turkish_meaning: "çıkarım, aleyhe karine (adverse inference)", context_sentence: "The court drew an adverse inference against the party who wiped drives." },
    ],
    comprehension_questions: [
      {
        question: "What evidence did Victoria's forensic computer team discover regarding the deleted emails?",
        options: ["The computer caught fire naturally", "Thirty-two laptop hard drives were intentionally wiped with military-grade software right after receiving legal notice", "A dog chewed the backup tapes", "The emails were stored on the moon"],
        correct_answer_index: 1,
        explanation: "Forensic metadata proved that 32 drives were scrubbed right after receipt of the formal Letter of Claim."
      },
      {
        question: "What legal term defines the intentional destruction or alteration of evidence relevant to litigation?",
        options: ["Habeas corpus", "Spoliation of evidence", "Force majeure", "Quantum meruit"],
        correct_answer_index: 1,
        explanation: "Spoliation is the intentional, reckless, or bad-faith destruction of evidence relevant to pending litigation."
      },
      {
        question: "What judicial sanction did the High Court judge impose for the bad-faith destruction of data?",
        options: ["A five-pound parking ticket", "An adverse inference presuming the destroyed emails contained proof of guilt", "Dismissal of the judge from office", "Ordering a retrial in another country"],
        correct_answer_index: 1,
        explanation: "The court drew an adverse inference, legally presuming the destroyed files proved infringement."
      },
    ],
  },
  {
    id: "legal-13-wrongful-termination-damages",
    title: "Wrongful Termination and Expectation Damages Quantification",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    topic: "Haksız Fesih Tazminatı Hesabı",
    desc: "10 yıllık madencilik imtiyazının haksız feshinde indirgenmiş nakit akımı (DCF) ile yoksun kalınan kâr hesabı.",
    content: "When the host government abruptly revoked a twenty-year lithium extraction concession granted to an international mining consortium, alleging unsubstantiated environmental violations, the investor launched commercial arbitration claiming wrongful termination. Senior Financial and Legal Expert Marcus was engaged to lead the valuation and quantification of expectation damages under public international law standards.\n\nIn international contract law, when a party suffers wrongful termination, the governing compensatory objective is restitutio in integrum—a fundamental legal principle requiring that damages restore the injured party to the financial position it would have occupied had the contract been faithfully performed to full maturity. This encompasses both damnum emergens (actual direct sunk costs incurred) and lucrum cessans (lost prospective profits).\n\nMarcus rejected simplistic historic accounting book value methods, establishing that the mine was a fully operational, income-generating asset with proven mineral reserves certified under the JORC Code. Consequently, he constructed a comprehensive Discounted Cash Flow (DCF) financial model projecting the mine's future net operating cash flows over the remaining fourteen years of the unexpired concession term.\n\nTo withstand rigorous scrutiny from the opposing party’s economic experts, Marcus conducted sensitivity stress-testing. He applied an eight percent Weighted Average Cost of Capital (WACC) and incorporated a 3.5 percent country risk premium to reflect regional macroeconomic volatility. Furthermore, he modeled forward commodity market pricing for battery-grade lithium carbonate, factoring in operational production costs, local royalties, and progressive corporate taxation. Marcus proved that the present value of the concession’s future revenue streams totaled $430 million. The arbitral tribunal adopted Marcus’s DCF quantification in its final award, confirming that expectation damages for wrongful termination must capture discounted future lost earnings rather than merely past capital expenditures.",
    target_words: ["unsubstantiated", "restitutio", "unexpired", "concession"],
    target_vocabulary: [
      { word: "unsubstantiated", phonetic: "/ˌʌn.səbˈstæn.ʃi.eɪ.tɪd/", turkish_meaning: "somut delile dayanmayan, kanıtsız", context_sentence: "The state revoked the license on unsubstantiated environmental grounds." },
      { word: "restitutio", phonetic: "/ˌres.tɪˈtuː.ti.əʊ/", turkish_meaning: "eski hale getirme (restitutio in integrum)", context_sentence: "Damages aimed at restitutio in integrum compensate for all lost profits." },
      { word: "unexpired", phonetic: "/ˌʌn.ɪkˈspaɪəd/", turkish_meaning: "süresi dolmamış, bakiye kalan", context_sentence: "The DCF model quantified cash flows over the unexpired concession term." },
      { word: "concession", phonetic: "/kənˈseʃ.ən/", turkish_meaning: "imtiyaz sözleşmesi", context_sentence: "The wrongful cancellation of the mining concession triggered massive liabilities." },
    ],
    comprehension_questions: [
      {
        question: "What legal principle governs compensatory damages for wrongful termination in international law?",
        options: ["Lex talionis (an eye for an eye)", "Restitutio in integrum (restoring the injured party to the financial state as if the contract were performed)", "Caveat emptor (buyer beware)", "Res ipsa loquitur"],
        correct_answer_index: 1,
        explanation: "Restitutio in integrum requires placing the injured party in the economic position it would have attained."
      },
      {
        question: "Why did Marcus employ the Discounted Cash Flow (DCF) valuation method instead of book value?",
        options: ["Book value is illegal everywhere", "The lithium mine was an active revenue-generating enterprise with certified reserves and predictable future earnings", "DCF is easier to compute on a phone", "The state asked for it"],
        correct_answer_index: 1,
        explanation: "Operating businesses with proven reserves are appropriately valued by discounting anticipated future cash flows."
      },
      {
        question: "What total expectation damages did the arbitral tribunal award based on the financial model?",
        options: ["$5 million", "$430 million", "$10 billion", "Zero dollars"],
        correct_answer_index: 1,
        explanation: "The tribunal adopted the DCF valuation and awarded $430 million in expectation damages."
      },
    ],
  },
  {
    id: "legal-14-performance-bond-injunction",
    title: "Emergency Injunction Against Wrongful Call on an On-Demand Performance Bond",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    topic: "Teminat Mektubuna İhtiyati Tedbir",
    desc: "Banka teminat mektubunun haksız ve kötü niyetli nakde çevrilmesine karşı mahkemeden alınan acil tedbir kararı.",
    content: "Under international banking customs codified in the Uniform Rules for Demand Guarantees (URDG 758), unconditional, on-demand performance bank guarantees are autonomous instruments strictly independent from the underlying commercial construction contract. A guarantor bank is legally bound to pay immediately upon presentation of a complying written demand, without investigating whether the contractor is truly in breach. This autonomy makes performance bonds susceptible to coercive abuse by unscrupulous employers.\n\nDuring a commercial dispute over the commissioning of a $500 million refinery, the Employer issued a formal demand to the guarantor bank demanding immediate liquidation of the contractor’s $50 million performance bond. The call was manufactured as an extortionate tactic to coerce the contractor into waiving $35 million in certified variation claims. Commercial Litigator Sarah immediately filed an ex parte emergency application before the Commercial Court seeking an interim injunction to restrain both the employer from receiving the funds and the guarantor bank from executing payment.\n\nTo overcome the formidable legal barrier protecting bank guarantees, Sarah recognized that common law courts recognize only one narrow exception: established fraud or bad faith. Presenting an emergency affidavit supported by confidential internal emails leaked from the Employer’s project director, Sarah proved that the Employer had privately acknowledged in writing that the refinery was fully operational, achieving all contractual performance criteria two weeks prior.\n\nThe documents proved that the Employer’s certification of contractor default was knowingly false and fraudulent. Satisfied that the claimant had established a clear prima facie case of egregious fraud, the High Court judge granted the emergency interim injunction. The ruling froze the guarantee disbursement, establishing that while bank autonomy is sacred, judicial equity will intervene to prevent banking mechanisms from being weaponized as instruments of fraud.",
    target_words: ["autonomous", "susceptible", "extortionate", "egregious"],
    target_vocabulary: [
      { word: "autonomous", phonetic: "/ɔːˈtɒn.ə.məs/", turkish_meaning: "bağımsız, asli sözleşmeden ayrı", context_sentence: "On-demand bank guarantees are autonomous legal instruments." },
      { word: "susceptible", phonetic: "/səˈsep.tə.bəl/", turkish_meaning: "açık, savunmasız", context_sentence: "Independent bonds are susceptible to coercive abuse without judicial safeguards." },
      { word: "extortionate", phonetic: "/ɪkˈstɔː.ʃən.ət/", turkish_meaning: "şantaj niteliğinde, zorla hak koparan", context_sentence: "The bond demand was an extortionate ploy to force waiver of claims." },
      { word: "egregious", phonetic: "/ɪˈɡriː.dʒəs/", turkish_meaning: "apaçık, fahiş, affedilemez (kötü niyet/sahtekarlık)", context_sentence: "The court found an egregious fraud exception to the autonomy rule." },
    ],
    comprehension_questions: [
      {
        question: "What principle generally governs on-demand bank performance bonds under URDG 758?",
        options: ["The bank must visit the construction site first", "The guarantee is autonomous and independent of underlying contractual disputes", "The bond can only be paid in silver bullion", "The bank decides who built the building"],
        correct_answer_index: 1,
        explanation: "Under the autonomy principle, bank guarantees operate independently of the underlying construction contract."
      },
      {
        question: "What narrow legal exception allows a court to issue an injunction stopping payment on an on-demand guarantee?",
        options: ["Bad weather", "Established fraud or egregious bad faith", "The contractor feeling sad", "A price increase in construction materials"],
        correct_answer_index: 1,
        explanation: "Courts will only pierce the autonomy of a demand guarantee upon clear proof of fraud or bad faith."
      },
      {
        question: "What critical evidence persuaded the judge to grant Sarah's emergency injunction?",
        options: ["A television news broadcast", "Internal employer emails proving the refinery met all performance criteria and the default claim was knowingly false", "A petition signed by refinery workers", "An apology letter from the bank"],
        correct_answer_index: 1,
        explanation: "Confidential employer emails confirmed the plant met performance targets, proving the default claim was fraudulent."
      },
    ],
  },
  {
    id: "legal-15-antitrust-merger-review",
    title: "Cross-Border Merger Antitrust Scrutiny and Clayton Act Defense",
    category: "legal_contracts",
    categoryName: "FIDIC & Hukuk",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    topic: "Sınır Ötesi Şirket Birleşmesi ve Antitröst",
    desc: "45 milyar dolarlık global yarı iletken birleşmesinde FTC ve AB Komisyonu pazar yoğunlaşması soruşturması ve yapısal taahhütler.",
    content: "When two of the world's leading semiconductor equipment manufacturers announced a definitive $45 billion cross-border merger agreement, competition regulators across the globe—including the Federal Trade Commission (FTC) in the United States, the European Commission’s DG COMP, and China’s SAMR—initiated extensive in-depth antitrust scrutiny. The regulatory authorities alleged that the horizontal merger would violate Section 7 of the Clayton Act and Article 2 of the EU Merger Regulation by substantially lessening competition in the global market for extreme ultraviolet photolithography tools.\n\nLead Antitrust Partner Raymond coordinated the multi-jurisdictional merger defense. Regulatory economists argued that the proposed combination would increase the post-merger Herfindahl-Hirschman Index (HHI)—the standard metric for market concentration—by over eight hundred points to an alarming 3,200, creating a presumptively anticompetitive duopoly capable of stifling research innovation and driving up wafer fabrication prices.\n\nRaymond prepared an exhaustive defense supported by dynamic economic modeling. First, he demonstrated that the relevant product market definition used by the agencies was overly narrow, proving that next-generation nanoimprint lithography and advanced packaging technologies exerted formidable competitive discipline on the merging parties. Second, he demonstrated robust pro-competitive efficiencies: merging complementary intellectual property portfolios would generate $1.8 billion in annual research synergies, dramatically accelerating the commercial rollout of sub-two-nanometer chips.\n\nRecognizing persistent agency concerns regarding potential vertical foreclosure in downstream optical component supplies, Raymond structured a structural remedy package: a binding, court-enforceable consent decree mandating the divestiture of the target's legacy laser inspection business to a well-funded third-party competitor, coupled with a ten-year non-exclusive licensing commitment for essential standard patents. The antitrust authorities formally cleared the multi-billion-dollar transaction, showcasing how strategic structural remedies resolve complex antitrust obstacles in high-technology mega-mergers.",
    target_words: ["antitrust", "Herfindahl-Hirschman", "duopoly", "divestiture"],
    target_vocabulary: [
      { word: "antitrust", phonetic: "/ˌæn.tiˈtrʌst/", turkish_meaning: "antitröst, rekabet hukuku", context_sentence: "The cross-border merger underwent intensive antitrust review." },
      { word: "Herfindahl-Hirschman", phonetic: "/ˈhɜː.fɪn.dɑːl ˈhɜːʃ.mən/", turkish_meaning: "HHI (pazar yoğunlaşmasını ölçen ekonomik endeks)", context_sentence: "The post-merger Herfindahl-Hirschman Index triggered regulatory alarm." },
      { word: "duopoly", phonetic: "/duːˈɒp.əl.i/", turkish_meaning: "düopol (iki firmanın hakim olduğu pazar)", context_sentence: "Agencies feared the creation of an anticompetitive duopoly." },
      { word: "divestiture", phonetic: "/daɪˈves.tɪ.tʃər/", turkish_meaning: "elden çıkarma, varlık satışı (yapısal taahhüt)", context_sentence: "The parties agreed to the divestiture of a non-core division to win clearance." },
    ],
    comprehension_questions: [
      {
        question: "What economic metric do antitrust regulatory agencies employ to measure market concentration?",
        options: ["Gross Domestic Product", "The Herfindahl-Hirschman Index (HHI)", "The Consumer Price Index", "Stock market volatility"],
        correct_answer_index: 1,
        explanation: "Antitrust enforcement agencies rely on the Herfindahl-Hirschman Index (HHI) to quantify market concentration."
      },
      {
        question: "What pro-competitive economic argument did Raymond advance to defend the merger?",
        options: ["That all competitors should be fired", "That merging complementary patents would yield $1.8 billion in R&D synergies and accelerate advanced chip technology", "That prices would instantly double", "That semiconductors are unnecessary"],
        correct_answer_index: 1,
        explanation: "Raymond proved that research synergies would lower costs and accelerate the commercial rollout of sub-2nm chips."
      },
      {
        question: "What structural remedy secured regulatory clearance from global competition authorities?",
        options: ["Paying a bribe to the regulators", "A binding consent decree mandating the divestiture of an inspection division and patent licensing commitments", "Closing down all factories in Europe", "Selling the whole company to a single person"],
        correct_answer_index: 1,
        explanation: "The parties agreed to divest a legacy business and grant patent licenses under an enforceable consent decree."
      },
    ],
  },
];

export const LEGAL_STORIES = legalStories;
export const LEGAL_CONTRACTS_STORIES = legalStories;
