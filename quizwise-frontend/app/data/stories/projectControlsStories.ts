import { Story } from "./types";

export const projectControlsStories: Story[] = [
  // ==========================================
  // LEVEL A (A1-A2, ~120-150 kelime, 2-3 dk)
  // ==========================================
  {
    id: "proj-01-safety-induction",
    title: "Morning Site Safety Induction",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
    topic: "Şantiye Güvenlik Brifingi",
    desc: "Büyük bir endüstriyel tesis şantiyesinde sabah vardiyası öncesi zorunlu kişisel koruyucu donanım ve güvenlik kuralları.",
    content: "At seven o'clock every morning, fifty construction workers gather outside the main site office for the daily safety briefing. Site Safety Officer David inspects each worker's personal protective equipment before allowing them through the security turnstile. Everyone must wear an approved hard hat, high-visibility vest, steel-toed boots, and safety glasses.\n\nToday, heavy mobile cranes are lifting heavy steel beams near the northern warehouse zone. David reminds the team to maintain a safe distance from rotating machinery and never walk underneath suspended loads. He also explains the yellow barrier tape marking deep excavation trenches. By following these clear safety procedures every single morning, the project has achieved four hundred consecutive days without a lost-time workplace accident.",
    target_words: ["protective", "turnstile", "suspended", "procedures"],
    target_vocabulary: [
      { word: "protective", phonetic: "/prəˈtek.tɪv/", turkish_meaning: "koruyucu", context_sentence: "Workers must wear approved personal protective equipment on site." },
      { word: "turnstile", phonetic: "/ˈtɜːn.staɪl/", turkish_meaning: "turnike, geçiş kapısı", context_sentence: "Employees swiped their access badges at the security turnstile." },
      { word: "suspended", phonetic: "/səˈspen.dɪd/", turkish_meaning: "askıda, havada asılı", context_sentence: "Never walk directly underneath suspended crane loads." },
      { word: "procedures", phonetic: "/prəˈsiː.dʒərz/", turkish_meaning: "prosedürler, güvenlik yönergeleri", context_sentence: "Strict safety procedures prevent dangerous site accidents." },
    ],
    comprehension_questions: [
      {
        question: "What mandatory items must workers wear according to the safety officer?",
        options: ["Casual sneakers and shorts", "Hard hat, high-visibility vest, steel-toed boots, and safety glasses", "Wool coats and heavy scarves", "Only sunglasses and cotton gloves"],
        correct_answer_index: 1,
        explanation: "The text specifies that every worker must wear an approved hard hat, hi-vis vest, steel-toed boots, and safety glasses."
      },
      {
        question: "What critical rule does David emphasize regarding crane operations?",
        options: ["Drive the crane faster", "Never walk underneath suspended loads", "Touch the steel cables while moving", "Stand directly under the hook"],
        correct_answer_index: 1,
        explanation: "David explicitly warns workers never to walk beneath suspended crane loads."
      },
      {
        question: "What safety milestone has the project achieved?",
        options: ["Ten safe hours", "Four hundred consecutive days without a lost-time accident", "Completing all work in one week", "Zero workers arriving on time"],
        correct_answer_index: 1,
        explanation: "The site has achieved 400 consecutive days without any lost-time accident."
      },
    ],
  },
  {
    id: "proj-02-daily-progress-log",
    title: "The Daily Progress Log",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 138,
    coverImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    topic: "Günlük İlerleme Raporu",
    desc: "Şantiye mühendisinin günlük beton döküm miktarlarını, çalışan işçi sayısını ve ekipman saatlerini kaydetmesi.",
    content: "At the end of each workday, Field Engineer Lisa sits in the site trailer to complete the daily construction log. She records the exact quantities of work finished across all active sectors. Today, the concrete subcontractor successfully poured two hundred cubic meters of foundation slab for Building C.\n\nLisa also documents site headcount: forty-two carpenters, twenty-eight steel fixers, and six heavy equipment operators were present. In addition, she logs weather conditions: twenty-four degrees Celsius, clear skies, and light winds. Keeping an accurate daily log is vital because contemporaneous records provide legal proof of job progress and help project schedulers verify whether contractor tasks are tracking according to the master baseline schedule.",
    target_words: ["subcontractor", "headcount", "contemporaneous", "schedulers"],
    target_vocabulary: [
      { word: "subcontractor", phonetic: "/ˌsʌb.kənˈtræk.tər/", turkish_meaning: "alt yüklenici, taşeron", context_sentence: "The concrete subcontractor completed the foundation pour on time." },
      { word: "headcount", phonetic: "/ˈhed.kaʊnt/", turkish_meaning: "mevcut personel sayısı", context_sentence: "The daily log recorded a total site headcount of seventy-six workers." },
      { word: "contemporaneous", phonetic: "/kənˌtem.pəˈreɪ.ni.əs/", turkish_meaning: "olay anında eş zamanlı tutulan", context_sentence: "Contemporaneous daily records prevent future contractual disputes." },
      { word: "schedulers", phonetic: "/ˈʃedʒ.uː.lərz/", turkish_meaning: "planlama mühendisleri", context_sentence: "Project schedulers compare daily output against the baseline plan." },
    ],
    comprehension_questions: [
      {
        question: "How much concrete was poured for Building C today?",
        options: ["Ten liters", "Two hundred cubic meters", "Five tons", "One thousand gallons"],
        correct_answer_index: 1,
        explanation: "The log recorded that the subcontractor poured two hundred cubic meters of foundation concrete."
      },
      {
        question: "Why does Lisa carefully document the daily weather and workforce numbers?",
        options: ["To sell reports to local newspapers", "To maintain contemporaneous legal records of project performance", "Because the local mayor visits daily", "To calculate electric bills"],
        correct_answer_index: 1,
        explanation: "Accurate contemporaneous logs provide legal verification and help track schedule baselines."
      },
      {
        question: "Where does Lisa write the daily report at the end of her shift?",
        options: ["In the site trailer office", "At the airport terminal", "In a local coffee shop", "On top of the crane"],
        correct_answer_index: 0,
        explanation: "Field Engineer Lisa completes the log inside the site trailer office."
      },
    ],
  },
  {
    id: "proj-03-subcontractor-delivery",
    title: "Subcontractor Material Delivery Staging",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
    topic: "Taşeron Malzeme Teslimatı",
    desc: "Şantiye lojistik sahasında prefabrik çelik kolonların teslim alınması, incelenmesi ve depolanması.",
    content: "Three heavy flatbed trucks arrive at Gate 4 carrying prefabricated structural steel columns from the regional manufacturing plant. Logistics Coordinator Sam verifies the shipping manifests against the original purchase orders before approving the delivery. Quality inspectors check each steel beam for serial numbers, weld certificates, and protective anti-corrosion paint coatings.\n\nA designated laydown yard has been cleared to stage the structural elements. Using a thirty-ton all-terrain forklift, the logistics crew unloads the columns onto wooden dunnage blocks to prevent contact with damp ground soil. Sam signs the material receiving report on his digital tablet. By organizing material staging efficiently, installation crews will have direct, rapid access to the steel components tomorrow morning without costly crane delays.",
    target_words: ["manifests", "inspections", "dunnage", "staging"],
    target_vocabulary: [
      { word: "manifests", phonetic: "/ˈmæn.ɪ.fests/", turkish_meaning: "sevkiyat irsaliyeleri, taşıma listeleri", context_sentence: "He compared the delivery manifests against project purchase orders." },
      { word: "inspections", phonetic: "/ɪnˈspek.ʃənz/", turkish_meaning: "kalite denetimleri, muayeneler", context_sentence: "Rigorous inspections verified the steel weld certificates." },
      { word: "dunnage", phonetic: "/ˈdʌn.ɪdʒ/", turkish_meaning: "takoz, ahşap istif desteği", context_sentence: "Beams were placed on wooden dunnage to keep them dry." },
      { word: "staging", phonetic: "/ˈsteɪ.dʒɪŋ/", turkish_meaning: "malzeme depolama ve hazırlama sahası", context_sentence: "Proper staging ensures fast erection without logistical delays." },
    ],
    comprehension_questions: [
      {
        question: "What components were delivered on the three flatbed trucks?",
        options: ["Glass window panels", "Prefabricated structural steel columns", "Bags of dry cement", "Electrical cables"],
        correct_answer_index: 1,
        explanation: "The flatbeds carried prefabricated structural steel columns from the factory."
      },
      {
        question: "Why were the steel columns placed on wooden dunnage blocks?",
        options: ["To paint them red", "To prevent direct contact with damp ground soil", "To make them look taller", "To hide them from the inspectors"],
        correct_answer_index: 1,
        explanation: "Dunnage blocks keep the steel elevated and protected from moisture in the ground."
      },
      {
        question: "What document does Sam inspect before permitting the trucks to unload?",
        options: ["Driver's passport", "Shipping manifests against purchase orders", "Site safety poster", "Local newspaper"],
        correct_answer_index: 1,
        explanation: "Sam cross-checks shipping manifests against the approved purchase order specifications."
      },
    ],
  },
  {
    id: "proj-04-weekly-coordination",
    title: "Weekly Lookahead Coordination Meeting",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 142,
    coverImage: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
    topic: "Haftalık Koordinasyon Toplantısı",
    desc: "Proje kontrol ekibinin alt yüklenicilerle üç haftalık ileriye dönük iş planını ve şantiye çakışmalarını görüşmesi.",
    content: "Every Monday morning, the project controls manager leads a three-week lookahead coordination meeting in the conference room. Representatives from electrical, plumbing, HVAC, and drywall subcontractors bring their weekly schedules. The goal of this meeting is to resolve spatial trade clashes before trades begin work inside the same building corridor.\n\nToday, the plumbing team planned to hang fire sprinkler pipes along Sector 2 on Thursday. However, the electrical contractor had already scheduled cable tray installation in the exact same ceiling space. Looking at the building information model on the big screen, the team easily adjusted the schedule: electricians will finish by Wednesday, allowing pipefitters unhindered access on Thursday. Open communication prevents costly re-work and maintains steady schedule momentum.",
    target_words: ["lookahead", "subcontractors", "clashes", "momentum"],
    target_vocabulary: [
      { word: "lookahead", phonetic: "/ˈlʊk.əˌhed/", turkish_meaning: "ileriye dönük çalışma programı (3 haftalık)", context_sentence: "The team reviewed the three-week lookahead schedule." },
      { word: "subcontractors", phonetic: "/ˌsʌb.kənˈtræk.tərz/", turkish_meaning: "alt yükleniciler, taşeronlar", context_sentence: "Electrical and mechanical subcontractors shared the work area." },
      { word: "clashes", phonetic: "/klæʃ.ɪz/", turkish_meaning: "fiziksel/zamansal çakışmalar", context_sentence: "Early meetings resolve spatial clashes before installation begins." },
      { word: "momentum", phonetic: "/məˈmen.təm/", turkish_meaning: "hız, ilerleme ivmesi", context_sentence: "Resolving trade conflicts maintains steady construction momentum." },
    ],
    comprehension_questions: [
      {
        question: "What is the primary objective of the weekly lookahead meeting?",
        options: ["To celebrate birthdays", "To identify and resolve spatial trade clashes before installation", "To order lunch for workers", "To redesign the whole project"],
        correct_answer_index: 1,
        explanation: "The meeting resolves spatial and scheduling clashes between different trade contractors."
      },
      {
        question: "What physical conflict was discovered between the plumbing and electrical contractors?",
        options: ["They wanted the same parking spot", "Both planned to install equipment in the exact same ceiling space on Thursday", "They ran out of drinking water", "They both needed the company van"],
        correct_answer_index: 1,
        explanation: "Both teams were scheduled to install pipes and cable trays in the same ceiling corridor on Thursday."
      },
      {
        question: "How did the team resolve the scheduling conflict?",
        options: ["They cancelled the building", "Electricians will complete their tasks by Wednesday, freeing the corridor for Thursday", "Both crews worked in the dark", "They sued each other"],
        correct_answer_index: 1,
        explanation: "The schedule was adjusted so electricians finish by Wednesday, giving pipefitters clear access Thursday."
      },
    ],
  },
  {
    id: "proj-05-adverse-weather-delay",
    title: "Adverse Weather Delay and Notice",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 138,
    coverImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    topic: "Hava Muhalefeti Gecikmesi",
    desc: "Şiddetli fırtına nedeniyle durdurulan kule vinç operasyonları ve işverene gönderilen resmi gecikme bildirimi.",
    content: "An unseasonal autumn storm struck the coastal construction site with sixty-knot wind gusts and heavy torrential rain. The digital anemometer on Tower Crane 1 registered gale-force winds exceeding forty-five kilometers per hour, automatically triggering a mandatory crane shutdown protocol. Tower crane operations were immediately suspended for safety, halting all high-elevation steel framing work.\n\nProject Controls Engineer Alex immediately initiated contractual documentation. Under General Conditions Clause 4.2, the contractor must formally notify the client within twenty-four hours of an adverse weather stoppage. Alex printed official meteorological station logs and attached site photos showing waterlogged access roads. Sending this formal delay notice promptly ensures that the contractor preserves its legal right to claim an excusable time extension without incurring financial liquidated damages.",
    target_words: ["anemometer", "protocol", "contractual", "excusable"],
    target_vocabulary: [
      { word: "anemometer", phonetic: "/ˌæn.ɪˈmɒm.ɪ.tər/", turkish_meaning: "rüzgar ölçer, anemometre", context_sentence: "The crane's digital anemometer recorded gale-force gusts." },
      { word: "protocol", phonetic: "/ˈprəʊ.tə.kɒl/", turkish_meaning: "resmi kural, protokol", context_sentence: "High winds triggered an immediate crane shutdown protocol." },
      { word: "contractual", phonetic: "/kənˈtræk.tʃu.əl/", turkish_meaning: "sözleşmesel, mukavele gereği", context_sentence: "The engineer submitted contractual delay notices on time." },
      { word: "excusable", phonetic: "/ɪkˈskjuː.zə.bəl/", turkish_meaning: "haklı/mazur görülebilir (gecikme)", context_sentence: "Severe storms constitute an excusable delay under standard contracts." },
    ],
    comprehension_questions: [
      {
        question: "What instrument triggered the immediate shutdown of Tower Crane 1?",
        options: ["A thermal camera", "A digital anemometer measuring high wind speeds", "A water level sensor", "A noise detector"],
        correct_answer_index: 1,
        explanation: "The crane's digital anemometer detected gale-force winds exceeding safe operating limits."
      },
      {
        question: "Within what timeframe must the contractor notify the client of a weather stoppage?",
        options: ["Within one month", "Within twenty-four hours under Clause 4.2", "After the project finishes", "Only if asked"],
        correct_answer_index: 1,
        explanation: "Contractual Clause 4.2 requires formal written notice within twenty-four hours of stoppage."
      },
      {
        question: "What evidence did Alex attach to the formal delay notification?",
        options: ["Tourist brochures", "Official meteorological station logs and photographic site records", "A handwritten poem", "Fuel receipts"],
        correct_answer_index: 1,
        explanation: "Alex compiled verified meteorological weather station records and photographs of waterlogged roads."
      },
    ],
  },

  // ==========================================
  // LEVEL B (B1-B2, ~230-280 kelime, 4-5 dk)
  // ==========================================
  {
    id: "proj-06-critical-path-slippage",
    title: "Critical Path Slippage on LNG Cryogenic Piping",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 255,
    coverImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
    topic: "Kritik Yol Gecikme Analizi",
    desc: "Doğalgaz terminali projesinde borulama testlerindeki gecikmenin genel bitiş tarihini tehdit etmesi ve kurtarma planı.",
    content: "During the monthly progress review for the $1.2 billion coastal LNG export facility, Lead Planning Engineer Marcus analyzed the updated Primavera P6 schedule. Running the critical path algorithm with a current data date of October 31, he uncovered thirty-four calendar days of negative total float originating in Train 2 cryogenic piping installation. Because cryogenic hydrostatic pressure testing was linked with a rigid finish-to-start relationship to insulation and pre-commissioning nitrogen purging, this slippage directly postponed the contractual Commercial Operation Date.\n\nInvestigating the root causes, Marcus determined that specialized stainless-steel valves had been delayed by six weeks at European customs due to missing metallurgical material certificates. As a consequence, mechanical installation crews were operating at only forty percent efficiency, creating cascading delays across downstream piping spools.\n\nTo recover the critical path without extending the final completion milestone, Marcus presented an aggressive schedule acceleration recovery plan. First, he re-sequenced hydrostatic leak testing from large integrated piping loops into smaller, modular sub-systems, allowing insulation crews to begin cladding pipes concurrently. Second, the project director approved a temporary second shift for certified orbital pipe welders and authorized air-freight logistics for remaining valve shipments. By compressing downstream activity durations by twenty-two days and absorbing remaining negative float, the recovery plan restored the critical path to zero total float, safeguarding the company against crippling liquidated damages.",
    target_words: ["algorithm", "cryogenic", "cascading", "cladding"],
    target_vocabulary: [
      { word: "algorithm", phonetic: "/ˈæl.ɡə.rɪ.ðəm/", turkish_meaning: "algoritma (P6 CPM kritik yol hesaplama formülü)", context_sentence: "The CPM schedule algorithm revealed negative total float." },
      { word: "cryogenic", phonetic: "/ˌkraɪ.əʊˈdʒen.ɪk/", turkish_meaning: "kriyojenik, aşırı düşük sıcaklıkta çalışan", context_sentence: "Cryogenic piping carries liquefied natural gas at sub-zero temperatures." },
      { word: "cascading", phonetic: "/kæsˈkeɪ.dɪŋ/", turkish_meaning: "zincirleme, art arda gelen", context_sentence: "Delayed valve deliveries created cascading schedule delays." },
      { word: "cladding", phonetic: "/ˈklæd.ɪŋ/", turkish_meaning: "izolasyon kaplama, giydirme", context_sentence: "Workers applied thermal insulation cladding to the pipelines." },
    ],
    comprehension_questions: [
      {
        question: "How many days of negative total float were detected on the LNG project's critical path?",
        options: ["Five days", "Thirty-four calendar days", "One hundred days", "Zero days"],
        correct_answer_index: 1,
        explanation: "Schedule analysis revealed 34 calendar days of unrecoverable negative total float."
      },
      {
        question: "What caused the initial delay in the Train 2 cryogenic piping package?",
        options: ["A hurricane destroyed the pier", "Specialized valves were delayed at European customs due to missing metallurgy certificates", "Welders went on strike", "The client ran out of money"],
        correct_answer_index: 1,
        explanation: "Valves were detained for six weeks at customs due to missing metallurgical documentation."
      },
      {
        question: "How did the recovery plan compress the remaining construction schedule?",
        options: ["By canceling all pressure tests", "By dividing testing into smaller modular sub-systems and introducing a second shift of welders", "By reducing the size of the plant", "By extending the completion date by one year"],
        correct_answer_index: 1,
        explanation: "The team re-sequenced testing into modular packages and authorized a second welder shift."
      },
    ],
  },
  {
    id: "proj-07-evm-variance-analysis",
    title: "EVM Cost and Schedule Variance Analysis",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    topic: "EVM Bütçe ve Takvim Sapması",
    desc: "Kazanılmış Değer Yönetimi (EVM) metrikleriyle CPI ve SPI oranlarının incelenmesi ve nihai maliyet tahmini.",
    content: "At the end of the third quarter, Senior Project Controls Manager Elena delivered the Earned Value Management (EVM) dashboard to the executive steering committee for the Metro Transit Expansion. With a total Budget at Completion (BAC) of $450 million, the baseline schedule expected eighty percent progress by Month 18, representing a Planned Value (PV) of $360 million. However, physical progress audits established that the Earned Value (EV) stood at only $315 million, while cumulative Actual Cost (AC) had reached $342 million.\n\nElena calculated the key performance indexes to diagnose the underlying financial and temporal health of the venture. The Schedule Performance Index (SPI = EV / PV) calculated to 0.875, indicating that project activities were progressing at roughly eighty-eight percent of the planned rate, producing an unfavorable Schedule Variance of negative $45 million. Concurrently, the Cost Performance Index (CPI = EV / AC) registered 0.921, reflecting an unfavorable Cost Variance of negative $27 million, meaning the contractor spent roughly $1.09 to deliver every single dollar of earned work.\n\nProjecting future project trajectory, Elena computed an Estimate at Completion (EAC = BAC / CPI) of $488.6 million, warning executives of an impending $38.6 million cost overrun at completion. The primary culprits were unplanned overtime expenditures and low labor productivity in underground tunnel boring. Elena recommended re-negotiating earth-disposal subcontracts and implementing daily production targets to arrest further cost degradation.",
    target_words: ["cumulative", "unfavorable", "trajectory", "overrun"],
    target_vocabulary: [
      { word: "cumulative", phonetic: "/ˈkjuː.mjə.lə.tɪv/", turkish_meaning: "kümülatif, birikimli", context_sentence: "Cumulative actual costs exceeded earned value figures." },
      { word: "unfavorable", phonetic: "/ʌnˈfeɪ.vər.ə.bəl/", turkish_meaning: "olumsuz, aleyhte (sapma)", context_sentence: "A negative cost variance represents an unfavorable financial outcome." },
      { word: "trajectory", phonetic: "/trəˈdʒek.tər.i/", turkish_meaning: "gidişat, eğilim rotası", context_sentence: "EVM formulas accurately project future project budget trajectory." },
      { word: "overrun", phonetic: "/ˈəʊ.və.rʌn/", turkish_meaning: "maliyet aşımı, bütçe aşımı", context_sentence: "Elena warned the committee of an impending multi-million dollar cost overrun." },
    ],
    comprehension_questions: [
      {
        question: "What was the total planned budget at completion (BAC) for the Metro Expansion?",
        options: ["$100 million", "$450 million", "$315 million", "$900 million"],
        correct_answer_index: 1,
        explanation: "The project's baseline Budget at Completion (BAC) was $450 million."
      },
      {
        question: "What does Elena's Cost Performance Index (CPI) of 0.921 signify?",
        options: ["The project is under budget and highly profitable", "The project is over budget, spending approximately $1.09 for every dollar earned", "Work has stopped entirely", "The schedule is ahead of time"],
        correct_answer_index: 1,
        explanation: "A CPI of 0.921 indicates cost inefficiency, spending about $1.09 per dollar of earned physical value."
      },
      {
        question: "What revised final cost (Estimate at Completion - EAC) was projected?",
        options: ["$360 million", "$450 million", "$488.6 million", "$1 billion"],
        correct_answer_index: 2,
        explanation: "Elena calculated an EAC of $488.6 million, projecting a $38.6 million budget overrun."
      },
    ],
  },
  {
    id: "proj-08-resource-leveling-crisis",
    title: "Resource Leveling and Heavy Crane Allocation",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 255,
    coverImage: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
    topic: "Kaynak Dengeleme Krizi",
    desc: "Şantiyedeki 600 tonluk paletli vinç kapasitesinin çakışması ve takvimde kaynak dengeleme tekniklerinin uygulanması.",
    content: "During peak construction on an offshore wind turbine fabrication yard, Schedule Analyst Jason identified a critical resource bottleneck. The project schedule required the deployment of an ultra-heavy six-hundred-ton crawler crane for two separate high-priority tasks during the same three-week window in July: erecting the main gantry framework on Dock 1, and lifting five-hundred-ton transition foundation pieces onto transport barges at Pier 3.\n\nBecause the heavy-lift crane carried a monthly rental rate of over $350,000 and mobilizing an identical second crane would take eight weeks, leasing additional equipment was economically unviable. Running an unconstrained resource profile in Primavera P6 revealed a severe resource overallocation: demand required twelve crane-operating hours per shift across two geographically separated docks, creating an irreconcilable physical impossibility.\n\nJason implemented resource leveling techniques by analyzing total float along non-critical paths. He determined that the gantry framework erection possessed eighteen days of available float before impacting the project baseline, whereas the foundation barge load-out was on the zero-float critical path tied to strict tidal navigation windows. Jason shifted the start date of the gantry erection by fourteen days, smoothing the crane utilization histogram below maximum capacity. By prioritizing critical path tasks and consuming non-critical float, the yard avoided equipment mobilization costs while maintaining operational safety and contractual handover milestones.",
    target_words: ["bottleneck", "unviable", "overallocation", "histogram"],
    target_vocabulary: [
      { word: "bottleneck", phonetic: "/ˈbɒt.əl.nek/", turkish_meaning: "darboğaz, tıkanıklık noktası", context_sentence: "The crawler crane became a severe operational bottleneck on site." },
      { word: "unviable", phonetic: "/ʌnˈvaɪ.ə.bəl/", turkish_meaning: "uygulanamaz, fizibıl olmayan", context_sentence: "Mobilizing a second heavy crane was economically unviable." },
      { word: "overallocation", phonetic: "/ˌəʊ.və.ræl.əˈkeɪ.ʃən/", turkish_meaning: "aşırı kaynak yüklemesi", context_sentence: "Resource leveling resolves equipment overallocation in the schedule." },
      { word: "histogram", phonetic: "/ˈhɪs.tə.ɡræm/", turkish_meaning: "histogram, kaynak dağılım grafiği", context_sentence: "The planner smoothed the peak bars on the labor histogram." },
    ],
    comprehension_questions: [
      {
        question: "What critical equipment suffered from a severe resource overallocation in July?",
        options: ["A small pickup truck", "A six-hundred-ton crawler heavy-lift crane", "A concrete pump", "A wooden rowboat"],
        correct_answer_index: 1,
        explanation: "Two major construction areas demanded the same 600-ton crawler crane concurrently."
      },
      {
        question: "Why was leasing an additional heavy crane rejected by management?",
        options: ["No cranes exist in the world", "It was economically unviable with high rental rates and an eight-week mobilization delay", "The port was closed to all ships", "The site director forgot to sign the check"],
        correct_answer_index: 1,
        explanation: "Rental costs were exorbitant and mobilizing a second crane would take eight weeks."
      },
      {
        question: "How did Jason solve the resource clash without delaying the final project deadline?",
        options: ["He worked through the night without sleep", "He shifted the start of the gantry erection by consuming its non-critical float", "He canceled the foundation load-out", "He reduced the crane's weight limit"],
        correct_answer_index: 1,
        explanation: "Jason utilized 14 days of available float on the gantry task, giving priority to the critical barge load-out."
      },
    ],
  },
  {
    id: "proj-09-interim-payment-certificate",
    title: "Interim Payment Certificate Verification",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    topic: "Hakediş Onay Süreci (IPC)",
    desc: "Ana müteahhidin sunduğu 18 milyon dolarlık aylık hakediş talebinin fiziki metrajlar ve kesintilerle doğrulanması.",
    content: "On the fifth day of the calendar month, Commercial Manager Daniel received Interim Payment Certificate (IPC) Application No. 14 from the general contractor for the New International Airport Terminal. The contractor claimed a gross billing of $18.4 million for civil, structural, and mechanical progress achieved during the preceding month. Under the FIDIC Red Book conditions governing the project, Daniel’s commercial audit team had twenty-eight days to inspect, verify, and certify the valuation before issuing payment.\n\nDaniel mobilized field quantity surveyors to conduct joint physical quantity take-offs across the terminal concourses. Discrepancies quickly emerged. The contractor had claimed one hundred percent completion for the baggage handling mezzanine steel framing; however, physical site inspection revealed that final moment-connection torquing and non-destructive weld testing were only seventy percent complete, warranting an immediate $1.2 million line-item deduction.\n\nFurthermore, Daniel applied mandatory contractual withholdings: a five percent retention deduction ($860,000) held as security against latent defects until final handover, alongside the scheduled monthly amortization installment for the original advance payment ($1.5 million). After deducting previous cumulative disbursements and reconciling approved change orders, Daniel certified a net payable sum of $14.84 million, issuing the verified Interim Payment Certificate to the employer for disbursement, maintaining financial integrity while preventing contractor overbilling.",
    target_words: ["disbursement", "take-offs", "torquing", "amortization"],
    target_vocabulary: [
      { word: "disbursement", phonetic: "/dɪsˈbɜːs.mənt/", turkish_meaning: "ödeme, para çıkışı", context_sentence: "The verified certificate was submitted to the employer for disbursement." },
      { word: "take-offs", phonetic: "/ˈteɪk.ɒfs/", turkish_meaning: "metraj çıkarma, miktar hesaplama", context_sentence: "Quantity surveyors conducted physical field quantity take-offs." },
      { word: "torquing", phonetic: "/ˈtɔːk.ɪŋ/", turkish_meaning: "torklama, cıvata sıkma", context_sentence: "Structural steel bolts required certified torque verification." },
      { word: "amortization", phonetic: "/əˌmɔː.tɪˈzeɪ.ʃən/", turkish_meaning: "avans mahsubu, amortisman", context_sentence: "The engineer deducted the advance payment amortization installment." },
    ],
    comprehension_questions: [
      {
        question: "What gross billing amount did the contractor claim in IPC No. 14?",
        options: ["$5 million", "$18.4 million", "$50 million", "$1.2 million"],
        correct_answer_index: 1,
        explanation: "The contractor submitted a gross payment application of $18.4 million."
      },
      {
        question: "Why did Daniel reduce the claimed amount for the baggage handling steel framing by $1.2 million?",
        options: ["The steel fell down", "Physical inspections proved bolt torquing and weld testing were only 70% complete", "The contractor used the wrong color paint", "The airport was cancelled"],
        correct_answer_index: 1,
        explanation: "Site verification revealed that moment connections and weld inspections were incomplete."
      },
      {
        question: "What standard deductions were applied to reach the final net payable certificate?",
        options: ["Income taxes and parking tickets", "Five percent retention withholding and advance payment amortization", "A bonus for fast delivery", "Lunch expenses"],
        correct_answer_index: 1,
        explanation: "Deductions included 5% retention against defects and the scheduled advance payment recovery installment."
      },
    ],
  },
  {
    id: "proj-10-scope-creep-warning",
    title: "Scope Creep Warning and Change Order Request",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 255,
    coverImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
    topic: "Kapsam Kayması ve Değişiklik Talebi",
    desc: "Yazılım ve veri merkezi inşaatında gayri resmi müşteri isteklerinin yol açtığı kapsam kaymasının resmi Değişiklik Emrine bağlanması.",
    content: "During the fit-out phase of a high-density hyperscale data center, Project Manager Rachel noticed insidious signs of scope creep threatening the venture’s fixed-price budget. The client’s technical operations committee had been routinely making informal verbal requests directly to electrical and cooling subcontractors on site—asking for redundant cooling dampers, supplementary fiber-optic conduit routes, and upgraded seismic equipment racks not contained in the approved tender drawings.\n\nWhile each individual request seemed minor, Rachel’s project controls team compiled a comprehensive impact ledger. The cumulative effect of these unapproved additions totaled over $2.4 million in direct labor and material costs, while introducing a forty-day schedule divergence along critical server commissioning milestones. Under the contract’s strict change management protocol, performing unauthorized work without an executed variation order constituted a non-reimbursable contractor liability.\n\nRachel immediately convened an emergency interface meeting with the client's representative. Presenting clear side-by-side drawing comparisons showing original baseline specifications against the requested field modifications, she formally submitted Change Order Request (COR) No. 08. She explained that further work on the disputed cooling circuits would cease unless the client formally executed the variation order, approving the additional funding and granting a six-week contractual time extension. Confronted with documented evidence, the client signed the change order, establishing financial transparency.",
    target_words: ["insidious", "redundant", "divergence", "executed"],
    target_vocabulary: [
      { word: "insidious", phonetic: "/ɪnˈsɪd.i.əs/", turkish_meaning: "sinsi, gizlice ilerleyen", context_sentence: "Uncontrolled scope creep is an insidious threat to project budgets." },
      { word: "redundant", phonetic: "/rɪˈdʌn.dənt/", turkish_meaning: "yedekli, emniyet için fazladan eklenen", context_sentence: "The client requested redundant cooling damper installations." },
      { word: "divergence", phonetic: "/daɪˈvɜː.dʒəns/", turkish_meaning: "sapma, ayrılma", context_sentence: "Informal variations caused a forty-day schedule divergence." },
      { word: "executed", phonetic: "/ˈek.sɪ.kjuː.tɪd/", turkish_meaning: "imzalanarak yürürlüğe girmiş", context_sentence: "Contractors must not execute unauthorized work without an executed change order." },
    ],
    comprehension_questions: [
      {
        question: "How was scope creep entering the data center project?",
        options: ["Through formal government decrees", "Via informal verbal requests made directly by client staff to field subcontractors", "Through heavy weather storms", "By buying wrong materials online"],
        correct_answer_index: 1,
        explanation: "The client's technical staff was verbally asking subcontractors for changes not included in contract drawings."
      },
      {
        question: "What total cost impact did Rachel's team calculate for the unapproved requests?",
        options: ["Less than $100", "Over $2.4 million in direct costs and forty days of schedule delay", "$50 million", "$10,000"],
        correct_answer_index: 1,
        explanation: "The cumulative cost of the unapproved work exceeded $2.4 million with a 40-day critical path delay."
      },
      {
        question: "What action did Rachel take to protect the contractor against uncompensated liability?",
        options: ["She walked off the job site forever", "She submitted formal Change Order Request No. 08 with drawing comparisons and schedule extension terms", "She absorbed the losses in silence", "She fired all subcontractors"],
        correct_answer_index: 1,
        explanation: "Rachel submitted a formal COR with drawing comparisons, pausing unapproved work until executed."
      },
    ],
  },

  // ==========================================
  // LEVEL C (C1-C2, ~330-380 kelime, 5-6 dk)
  // ==========================================
  {
    id: "proj-11-time-impact-analysis",
    title: "Time Impact Analysis for EPC Extension of Time Claims",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
    topic: "Süre Uzatımı (EoT) & TIA Metodolojisi",
    desc: "Milyar dolarlık EPC petrokimya tesisinde işverenin geç çizim teslimatının Time Impact Analysis ile modellenmesi.",
    content: "In large-scale Engineering, Procurement, and Construction (EPC) mega-projects, establishing entitlement to an Extension of Time (EOT) and associated prolongation overhead costs requires rigorous forensic demonstration of critical path impact. On the $2.4 billion Jurong Aromatics Complex, Senior Delay Analyst Gregory prepared an EOT claim following the Employer's failure to furnish Approved for Construction (AFC) piping isometric drawings for the hydrocracker fractionation unit within the contractually mandated sixty-day technical review cycle.\n\nTo prove causation and quantification under the Society of Construction Law (SCL) Delay and Disruption Protocol, Gregory utilized the prospective Time Impact Analysis (TIA) methodology. Rather than relying on simplistic retrospective comparisons between original baseline and final as-built schedules, TIA models the specific impact of excusable delay events chronologically upon the prevailing updated schedule immediately preceding the disruptive event.\n\nGregory extracted the contemporaneously approved Primavera P6 schedule file corresponding to the data date immediately prior to the employer's drawing default (Update No. 12). He verified schedule health by performing extensive audit diagnostics: confirming logical integrity, eliminating open ends, checking for artificial lead/lag constraints, and verifying actual start and finish dates against verified daily site logs. Next, he constructed a transparent 'fragnet' (fragmentary network)—a mini-network of six logically linked discrete activities representing the sixty-two days of drawing suspension and subsequent engineering revision cycles.\n\nInserting this fragnet into the healthy schedule and recalculating the CPM critical path without altering downstream logic demonstrated a quantifiable critical path slippage of forty-nine calendar days to the downstream mechanical pre-commissioning milestone. The analysis proved that concurrent contractor fabrication inefficiencies occurred on secondary, non-critical flare piping containing forty-five days of positive float. Armed with this forensic analysis, the contractor secured a binding forty-nine-day extension of time from the Dispute Avoidance/Adjudication Board (DAAB), shielding the venture from $14.7 million in potential liquidated damages.",
    target_words: ["prolongation", "prospective", "diagnostics", "fragnet"],
    target_vocabulary: [
      { word: "prolongation", phonetic: "/ˌprəʊ.lɒŋˈɡeɪ.ʃən/", turkish_meaning: "süre uzatımından doğan şantiye genel giderleri", context_sentence: "The contractor claimed prolongation overhead costs for site staff." },
      { word: "prospective", phonetic: "/prəˈspek.tɪv/", turkish_meaning: "ileriye dönük (TIA gecikme analiz yöntemi)", context_sentence: "Time Impact Analysis uses prospective modeling on contemporaneously updated schedules." },
      { word: "diagnostics", phonetic: "/ˌdaɪ.əɡˈnɒs.tɪks/", turkish_meaning: "çizelge sağlık teşhisleri (açık uç, kısıt denetimleri)", context_sentence: "Schedule diagnostics verified the absence of invalid leads and lags." },
      { word: "fragnet", phonetic: "/ˈfræɡ.net/", turkish_meaning: "gecikme aktivite ağı (fragmentary network)", context_sentence: "He inserted a detailed delay fragnet into the updated baseline." },
    ],
    comprehension_questions: [
      {
        question: "What delay analysis methodology did Gregory employ in accordance with the SCL Protocol?",
        options: ["As-Planned vs As-Built retrospective bar chart", "Prospective Time Impact Analysis (TIA) using discrete fragnets", "Collapsed As-Built subtraction", "Random estimation"],
        correct_answer_index: 1,
        explanation: "Gregory utilized prospective Time Impact Analysis (TIA) by inserting a fragnet into the contemporaneous schedule."
      },
      {
        question: "What schedule file served as the point of departure for modeling the delay event?",
        options: ["The original tender schedule created three years earlier", "The contemporaneously approved P6 schedule immediately preceding the event (Update No. 12)", "A theoretical schedule drawn by hand", "The final as-built schedule after commissioning"],
        correct_answer_index: 1,
        explanation: "TIA requires inserting the delay into the updated schedule immediately prior to the disruptive event."
      },
      {
        question: "Why did the Employer's allegation of concurrent contractor delay fail before the board?",
        options: ["The contractor paid a fine", "Contractor fabrication issues were on secondary flare piping with 45 days of available positive float", "The Employer admitted fault immediately", "Piping was eliminated from the project"],
        correct_answer_index: 1,
        explanation: "The contractor's issues occurred on non-critical paths with positive float, meaning they did not drive completion."
      },
    ],
  },
  {
    id: "proj-12-crashing-vs-fast-tracking",
    title: "Arbitration Dispute: Fast-Tracking versus Schedule Crashing",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    topic: "Hızlandırma Maliyetleri Tahkimi",
    desc: "EPC metro projesinde işverenin zorunlu hızlandırma emri sonrası ek işçilik ve çift vardiya maliyetlerinin tahkimde savunulması.",
    content: "In international construction arbitration, few issues generate greater contentious friction than the quantification of acceleration damages arising from constructive acceleration. On the $1.8 billion Cross-Harbor Rail Transit project, the Employer summarily rejected the Contractor’s legitimate requests for time extensions following archaeological discoveries in tunneling shafts, issuing a unilateral directive instructing the joint venture to maintain the original contractual Substantial Completion milestone 'by all necessary commercial means.'\n\nTo achieve compliance, the contractor executed a dual schedule compression strategy: extensive fast-tracking and aggressive schedule crashing. Fast-tracking involved overlapping sequential engineering and construction activities—authorizing structural slab casting before receiving finalized mechanical penetration coordination approvals. Concurrently, crashing entailed flooding the site with supplementary resources: mobilizing two hundred additional certified pipefitters, implementing twenty-four-hour double-shift rotas, and authorizing sixty hours of weekly overtime.\n\nWhile this extreme intervention successfully recovered forty-eight days of critical path delay and achieved on-time commissioning, it resulted in a catastrophic cost blowout of $32 million. When the contractor sought reimbursement under FIDIC Clause 13.3 (Variation Procedure), the Employer refused payment, alleging that the contractor suffered from self-inflicted management gross incompetence and that fast-tracking introduced voluntary design rework liabilities.\n\nBefore the International Chamber of Commerce (ICC) arbitral tribunal in Geneva, the Contractor’s lead delay expert dismantled the Employer’s defense. Utilizing the Measured Mile methodology, the expert compared labor productivity across unimpacted baseline tunnels against the disrupted, congested shifts during the crashed acceleration window. He proved that high trade stacking, fatigue from continuous sixty-hour work weeks, and dilution of skilled supervision caused a scientifically measurable thirty-four percent loss of baseline productivity. The arbitral tribunal ruled decisively for the contractor, awarding $28.4 million in constructive acceleration costs, establishing that an employer cannot demand schedule compliance while simultaneously withholding justified time extensions.",
    target_words: ["contentious", "acceleration", "stacking", "tribunal"],
    target_vocabulary: [
      { word: "contentious", phonetic: "/kənˈten.ʃəs/", turkish_meaning: "ihtilaflı, çekişmeli", context_sentence: "Acceleration claims are notoriously contentious in construction disputes." },
      { word: "acceleration", phonetic: "/əkˌsel.əˈreɪ.ʃən/", turkish_meaning: "iş programını hızlandırma, sıkıştırma", context_sentence: "Constructive acceleration occurs when justified time extensions are refused." },
      { word: "stacking", phonetic: "/ˈstæk.ɪŋ/", turkish_meaning: "işçi/ekip yığılması (alan darlığından verim düşüşü)", context_sentence: "Trade stacking in narrow tunnel shafts caused severe productivity loss." },
      { word: "tribunal", phonetic: "/traɪˈbjuː.nəl/", turkish_meaning: "tahkim mahkemesi, hakem heyeti", context_sentence: "The arbitral tribunal awarded the full acceleration compensation." },
    ],
    comprehension_questions: [
      {
        question: "What distinguishes 'fast-tracking' from 'schedule crashing' in project management?",
        options: ["Fast-tracking fires workers, whereas crashing buys cheaper materials", "Fast-tracking overlaps sequential activities in parallel, while crashing adds resources to shorten durations", "Fast-tracking only applies to software", "There is no difference"],
        correct_answer_index: 1,
        explanation: "Fast-tracking parallelizes sequential tasks (increasing risk), while crashing adds labor/resources (increasing cost)."
      },
      {
        question: "What analytical method did the expert witness use to quantify labor productivity loss before the ICC?",
        options: ["The Measured Mile methodology comparing unimpacted periods to accelerated periods", "A coin toss", "Standard industry guesswork", "Reviewing contractor bank balances"],
        correct_answer_index: 0,
        explanation: "The Measured Mile methodology empirically compares productivity during normal baseline periods against disrupted periods."
      },
      {
        question: "Why did the arbitral tribunal award acceleration costs to the contractor?",
        options: ["The contractor offered a bribe", "The employer constructively forced acceleration by withholding justified time extensions while insisting on the original completion date", "The tunnel was painted blue", "The archaeologists apologized"],
        correct_answer_index: 1,
        explanation: "Constructive acceleration is compensable when the client denies valid extensions but insists on fixed completion dates."
      },
    ],
  },
  {
    id: "proj-13-forensic-schedule-analysis",
    title: "Forensic Schedule Delay Analysis: As-Built Critical Path",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
    topic: "Adli As-Built Kritik Yol Analizi",
    desc: "Tamamlanmış bir kombine çevrim santralinde hakem heyetine sunulan Windows As-Built gecikme metodolojisi.",
    content: "When the 800-megawatt Combined Cycle Power Plant in Northern Europe was finally handed over three hundred and twenty days behind schedule, the owner encashed the contractor's $45 million performance bond and demanded liquidated damages. In response, the EPC consortium initiated international arbitration, retaining forensic delay consultants to execute an exhaustive As-Built Critical Path Windows Analysis (also known as the Contemporaneous Period Analysis).\n\nUnlike theoretical prospective methods, retrospective Windows Analysis reconstructs what actually transpired on site by breaking the four-year execution timeline into monthly or bi-monthly analytical 'windows' bounded by contemporaneously submitted schedule updates. For each analytical window, the forensic scheduler examines contemporaneous evidence: daily inspection logs, QA/QC weld failure reports, heavy equipment mobilization logs, and formal correspondence to determine which activities actually dictated the driving critical path during that precise temporal slice.\n\nAcross Windows 1 through 6 (Months 1–12), the analysis revealed that the contractor held sole culpability for sixty days of critical path slippage due to late foundation piling caused by defective sub-drilling rigs. However, during Windows 7 through 14 (Months 13–24), the driving critical path dynamically flipped to gas turbine delivery delays caused by the Owner’s late finalization of the commercial power purchase agreement and grid interconnection specifications.\n\nCrucially, the analysis debunked the Owner's assertion that contractor piping delays were concurrent during Window 10. By calculating the 'longest path' in the updated as-built database, the expert demonstrated that mechanical piping had ninety-two days of available float at that moment; therefore, it could not have delayed overall project completion. Based on the forensic window evidence, the tribunal ordered the immediate release of the encashed bond and awarded the contractor two hundred and twenty days of compensable delay, illustrating the power of empirical as-built delay forensic modeling.",
    target_words: ["retrospective", "culpability", "contemporaneously", "interconnection"],
    target_vocabulary: [
      { word: "retrospective", phonetic: "/ˌret.rəˈspek.tɪv/", turkish_meaning: "geçmişe dönük, fiili durum sonrası inceleyen", context_sentence: "Windows analysis provides an empirical retrospective delay methodology." },
      { word: "culpability", phonetic: "/ˌkʌl.pəˈbɪl.ə.ti/", turkish_meaning: "kusur, sorumluluk, kabahat", context_sentence: "The contractor admitted culpability for early piling equipment failures." },
      { word: "contemporaneously", phonetic: "/kənˌtem.pəˈreɪ.ni.əs.li/", turkish_meaning: "eş zamanlı olarak, o tarihte tutulan kayıtlarla", context_sentence: "Updates submitted contemporaneously reflect the true historical sequence." },
      { word: "interconnection", phonetic: "/ˌɪn.tə.kəˈnek.ʃən/", turkish_meaning: "şebeke ara bağlantısı", context_sentence: "Grid interconnection delays were caused exclusively by the owner." },
    ],
    comprehension_questions: [
      {
        question: "How does the As-Built Windows Delay Analysis dissect a project's timeline?",
        options: ["By looking only at the very first day and very last day", "By dividing the timeline into chronological monthly or bi-monthly windows based on contemporaneous updates", "By deleting all intermediate schedules", "By asking workers what they remember"],
        correct_answer_index: 1,
        explanation: "The methodology breaks the timeline into successive chronological windows to trace how the driving critical path evolved."
      },
      {
        question: "What did the analysis uncover regarding the causes of delay in Months 13 through 24?",
        options: ["Tornadoes destroyed the turbines", "The owner caused critical delays due to late power purchase agreements and grid specifications", "Workers refused to work", "The contractor abandoned the site"],
        correct_answer_index: 1,
        explanation: "During Windows 7-14, the driving delay shifted entirely to owner defaults regarding grid connection and commercial agreements."
      },
      {
        question: "Why was the owner's claim of concurrent contractor piping delay rejected?",
        options: ["Piping was never installed", "Mechanical piping had 92 days of available float and was not on the driving critical path", "The owner lost the paperwork", "The tribunal ran out of time"],
        correct_answer_index: 1,
        explanation: "Forensic longest-path calculations showed that piping possessed 92 days of float, rendering it non-critical."
      },
    ],
  },
  {
    id: "proj-14-monte-carlo-risk-simulation",
    title: "Integrated Risk Management and Monte Carlo Schedule Simulation",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
    topic: "Entegre Risk ve Monte Carlo Simülasyonu",
    desc: "Açık deniz petrol platformunda deterministik takvim yerine P80 güven aralığını hesaplayan olasılıksal risk analizi.",
    content: "On complex multi-billion-dollar offshore energy mega-ventures, relying solely upon a deterministic Critical Path Method (CPM) schedule creates a dangerous illusion of certainty. Single-point duration estimates consistently underestimate the compounding effect of path convergence, merge bias, and environmental volatility. To establish an executive risk baseline for a deepwater Floating Production Storage and Offloading (FPSO) vessel, Project Risk Director Sophia conducted a Quantitative Schedule Risk Analysis (QSRA) utilizing Monte Carlo simulation.\n\nRather than assuming static activity durations, Sophia collaborated with discipline lead engineers to construct three-point duration distributions (Optimistic, Most Likely, and Pessimistic) modeled through Beta-PERT and Triangular statistical curves for over two thousand discrete schedule activities. Crucially, the risk model integrated a qualitative risk register: mapping probabilistic risk events, such as seasonal typhoon disruptions in the South China Sea, dry-dock crane mechanical breakdowns, and naval architectural weld inspection failure rates directly into the schedule logic.\n\nExecuting ten thousand iterative simulation runs via specialized software, the algorithm recalculated the CPM network during each iteration, randomly sampling activity durations from assigned statistical distributions. The resulting cumulative probability distribution (S-curve) delivered a sobering wake-up call to the board of directors. The deterministic project completion milestone of November 15 possessed a negligible probability of achievement—a mere seven percent confidence level (P7).\n\nTo satisfy institutional financiers demanding an eighty percent statistical confidence level (P80), the completion date had to be adjusted forward by four and a half months to March 31 of the following year. Furthermore, the simulation identified 'criticality index' hot-spots, revealing that turret mooring integration had an eighty-eight percent likelihood of becoming the driving critical path, despite having positive float in the static baseline. By establishing this probabilistic reserve, the project team allocated contingency funding intelligently and protected stakeholder equity against systemic optimism bias.",
    target_words: ["deterministic", "convergence", "probabilistic", "criticality"],
    target_vocabulary: [
      { word: "deterministic", phonetic: "/dɪˌtɜː.mɪˈnɪs.tɪk/", turkish_meaning: "deterministik, tek bir kesin değere dayanan", context_sentence: "Deterministic schedules ignore compounding probabilistic risks." },
      { word: "convergence", phonetic: "/kənˈvɜː.dʒəns/", turkish_meaning: "birleşme, yakınsama (paralel yolların tek noktada toplanması)", context_sentence: "Path convergence increases the likelihood of critical path delays." },
      { word: "probabilistic", phonetic: "/ˌprɒb.ə.bɪˈlɪs.tɪk/", turkish_meaning: "olasılıksal, olasılık temelli", context_sentence: "Monte Carlo delivers a probabilistic schedule distribution curve." },
      { word: "criticality", phonetic: "/ˌkrɪt.ɪˈkæl.ə.ti/", turkish_meaning: "kritiklik endeksi (bir aktivitenin kritik yolda olma yüzdesi)", context_sentence: "The criticality index highlights hidden bottleneck activities." },
    ],
    comprehension_questions: [
      {
        question: "Why does a deterministic CPM schedule often create an illusion of precision?",
        options: ["It uses too many computers", "It relies on single-point estimates and ignores merge bias and path convergence", "It cannot be printed on paper", "It assumes everything will fail"],
        correct_answer_index: 1,
        explanation: "Deterministic models assume single static durations, underestimating compounding risks and merge bias."
      },
      {
        question: "What statistical likelihood of on-time completion did the initial deterministic schedule possess?",
        options: ["99 percent", "Only 7 percent confidence level (P7)", "50 percent", "80 percent"],
        correct_answer_index: 1,
        explanation: "Monte Carlo simulation revealed that the deterministic date had an alarmingly low 7% (P7) probability."
      },
      {
        question: "What target confidence level did international financiers demand for the revised completion date?",
        options: ["P10", "P50", "P80 (80 percent statistical confidence level)", "P100"],
        correct_answer_index: 2,
        explanation: "Financiers required an 80% confidence level (P80), shifting the realistic completion forward to March 31."
      },
    ],
  },
  {
    id: "proj-15-fidic-clause-20-dispute",
    title: "FIDIC Yellow Book Clause 20 Dispute: Challenging the Engineer's Determination",
    category: "project_controls",
    categoryName: "Proje Kontrol & EVM",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
    topic: "FIDIC Madde 20 & Mühendis Kararı",
    desc: "FIDIC Sarı Kitap sözleşmesinde Mühendisin taraflı tespitine karşı 28 günlük itiraz bildirimi ve DAAB süreci.",
    content: "Under the standard FIDIC Conditions of Contract for Plant and Design-Build (Yellow Book), Sub-Clause 3.5 mandates that the Employer's Engineer must act fairly and impartially when determining contractor claims for time and money. However, during the construction of a $650 million hydroelectric dam in South America, Contractor Project Director Marcus discovered that the Engineer was operating under explicit commercial instructions from the state-owned utility owner to reject all incoming claims regardless of contractual merit.\n\nFollowing the unexpected discovery of a geological shear zone during subterranean powerhouse excavation—an unforeseeable physical condition under Sub-Clause 4.12—the contractor submitted a meticulously documented claim for ninety days of EOT and $24 million in rock bolt and shotcrete stabilization costs. Despite unambiguous geological baseline reports proving the condition was unforeseeable to an experienced contractor at tender, the Engineer issued a formal determination under Sub-Clause 3.5 granting zero days of extension and rejecting all financial compensation, falsely asserting the contractor should have foreseen the subterranean fracture.\n\nRecognizing the severe financial peril, Marcus executed strict procedural compliance with Sub-Clause 20.1 and Sub-Clause 20.4. To preserve legal rights, the contractor issued a formal Notice of Dissatisfaction (NOD) within the strict twenty-eight-day statutory guillotine window, stating unequivocally that the Engineer’s determination was partial, flawed, and unacceptable. The dispute was promptly elevated to the three-member standing Dispute Adjudication/Avoidance Board (DAAB).\n\nDuring hearings held on site, the contractor presented core drill samples, microseismic survey data, and contemporaneous correspondence demonstrating that the Engineer had privately conceded the unforeseeability of the shear zone before being overruled by the Employer’s finance ministry. The DAAB ruled unanimously in the contractor's favor, overturning the Engineer's bad-faith determination, awarding the full ninety days of time extension and $21.8 million in direct stabilizing costs, and setting a benchmark for contractual integrity.",
    target_words: ["impartially", "unforeseeable", "guillotine", "unanimously"],
    target_vocabulary: [
      { word: "impartially", phonetic: "/ɪmˈpɑː.ʃəl.i/", turkish_meaning: "tarafsızca, adil bir biçimde", context_sentence: "The Engineer is contractually bound to act impartially under Clause 3.5." },
      { word: "unforeseeable", phonetic: "/ˌʌn.fɔːˈsiː.ə.bəl/", turkish_meaning: "öngörülemez (deneyimli yüklenici tarafından)", context_sentence: "Subterranean geological shear zones represented an unforeseeable physical condition." },
      { word: "guillotine", phonetic: "/ˈɡɪl.ə.tiːn/", turkish_meaning: "kesin hak düşürücü süre (hak kaybına yol açan)", context_sentence: "Failure to issue a notice within 28 days triggers the statutory guillotine bar." },
      { word: "unanimously", phonetic: "/juːˈnæn.ɪ.məs.li/", turkish_meaning: "oybirliğiyle", context_sentence: "The three-member DAAB panel ruled unanimously in the contractor's favor." },
    ],
    comprehension_questions: [
      {
        question: "What contractual standard must the Engineer uphold under FIDIC Sub-Clause 3.5?",
        options: ["Always obey the employer's secret verbal orders", "Act fairly and impartially when making determinations", "Refuse all contractor claims automatically", "Resign if costs exceed budget"],
        correct_answer_index: 1,
        explanation: "FIDIC explicitly mandates that the Engineer must act impartially and make fair determinations."
      },
      {
        question: "What strict procedural notice must a dissatisfied party issue within 28 days to prevent losing legal rights?",
        options: ["A friendly email", "A formal Notice of Dissatisfaction (NOD)", "A lawsuit in criminal court", "A cancellation of insurance"],
        correct_answer_index: 1,
        explanation: "Under Sub-Clause 20.4, a party must serve a formal Notice of Dissatisfaction within 28 days."
      },
      {
        question: "What did the Dispute Adjudication Board (DAAB) decide upon reviewing the geological evidence?",
        options: ["They upheld the Engineer's rejection", "They overturned the Engineer's bad-faith determination and awarded 90 days of EOT and $21.8 million", "They canceled the dam project entirely", "They ordered the contractor to pay a fine"],
        correct_answer_index: 1,
        explanation: "The DAAB unanimously overturned the Engineer's decision, granting the time extension and cost recovery."
      },
    ],
  },
];

export const PROJECT_CONTROLS_STORIES = projectControlsStories;
