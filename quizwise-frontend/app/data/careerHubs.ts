export type HubType = "academic" | "professional";

export type AcademicHubKey = "yds_yokdil" | "ielts_toefl";

export type ProfessionalHubKey =
  | "project_management"
  | "project_controls"
  | "engineering_civil"
  | "engineering_process_chem"
  | "engineering_mechanical"
  | "medical_health"
  | "legal_contracts"
  | "finance_accounting"
  | "tech_executive";

export type CareerHubKey = AcademicHubKey | ProfessionalHubKey;

export interface CareerHubVocabularyCard {
  word: string;
  phonetic: string;
  meaning: string;
  exampleEn: string;
  exampleTr: string;
}

export interface CareerHubReadingCase {
  title: string;
  level: string;
  snippet: string;
  fullText: string;
}

export interface CareerHubItem {
  key: CareerHubKey;
  type: HubType;
  icon: string;
  titleKey: string;
  titleDefault: string;
  taglineKey: string;
  taglineDefault: string;
  descKey: string;
  descDefault: string;
  badges: string[];
  targetLevel: string;
  cardCount: number;
  sampleWords: string[];
  cards: CareerHubVocabularyCard[];
  readingCase: CareerHubReadingCase;
  speakingScenarioId: string;
}

export const ACADEMIC_HUBS: CareerHubItem[] = [
  {
    key: "yds_yokdil",
    type: "academic",
    icon: "🎓",
    titleKey: "hub_yds_title",
    titleDefault: "YDS / YÖKDİL Akademik",
    taglineKey: "hub_yds_tagline",
    taglineDefault: "ÖSYM, Akademik Makaleler & İleri Düzey Cümle Tamamlama",
    descKey: "hub_yds_desc",
    descDefault: "ÖSYM ve akademik İngilizce sınavlarında en yüksek frekansta çıkan kritik akademik fiil, sıfat ve edatlar.",
    badges: ["YDS", "YÖKDİL", "ÖSYM", "C1 Akademik"],
    targetLevel: "Advanced (C1)",
    cardCount: 500,
    sampleWords: ["resilient", "detrimental", "mitigate", "coherent", "ubiquitous", "substantiate"],
    cards: [
      {
        word: "resilient",
        phonetic: "/rɪˈzɪl.jənt/",
        meaning: "Dirençli, çabuk toparlanan, esnek",
        exampleEn: "The national economy proved remarkably resilient following the unexpected market shock.",
        exampleTr: "Ulusal ekonomi, beklenmedik piyasa şokunun ardından dikkat çekici derecede dirençli olduğunu kanıtladı.",
      },
      {
        word: "mitigate",
        phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
        meaning: "Hafifletmek, yatıştırmak, azaltmak",
        exampleEn: "Strict protocols were implemented to mitigate systemic vulnerabilities in the supply network.",
        exampleTr: "Tedarik ağındaki sistemsel açıkları hafifletmek için sıkı protokoller uygulandı.",
      },
      {
        word: "substantiate",
        phonetic: "/səbˈstæn.ʃi.eɪt/",
        meaning: "Kanıtlamak, doğrulamak, somutlaştırmak",
        exampleEn: "The research committee required further empirical data to substantiate the hypothesis.",
        exampleTr: "Araştırma komitesi, hipotezi doğrulamak için daha fazla ampirik veri talep etti.",
      },
      {
        word: "ubiquitous",
        phonetic: "/juːˈbɪk.wɪ.təs/",
        meaning: "Her yerde bulunan, yaygın",
        exampleEn: "Digital automated algorithms have become ubiquitous across contemporary research centers.",
        exampleTr: "Dijital otomatik algoritmalar, çağdaş araştırma merkezleri genelinde her yerde bulunur hale geldi.",
      },
      {
        word: "detrimental",
        phonetic: "/ˌdet.rɪˈmen.təl/",
        meaning: "Zararlı, hasar veren, yıpratıcı",
        exampleEn: "Prolonged cognitive overload produces a detrimental effect on long-term memory synthesis.",
        exampleTr: "Uzun süreli bilişsel aşırı yüklenme, uzun süreli hafıza sentezi üzerinde zararlı bir etki üretir.",
      },
    ],
    readingCase: {
      title: "The Neurobiology of Spaced Learning & Cognitive Resilience",
      level: "Advanced (C1)",
      snippet: "Cognitive researchers substantiate that deep neural consolidation requires deliberate friction against cognitive fatigue. Spaced repetition algorithms counteract the inevitable forgetting curve by timing active recall reviews at the exact threshold of synaptic decay.",
      fullText: "In an era characterized by continuous technological disruption, cognitive plasticity has emerged as an indispensable human faculty. Recent empirical investigations in neurobiology substantiate that memory consolidation is not a passive storage event; rather, it demands metabolic energy and deliberate friction against cognitive fatigue. Without scheduled spaced retrieval, synaptic pathways decay at an exponential rate within forty-eight hours. By deploying spaced repetition algorithms, students effectively mitigate this degradation and cultivate durable lexical mastery across sophisticated academic registers."
    },
    speakingScenarioId: "yds_yokdil",
  },
  {
    key: "ielts_toefl",
    type: "academic",
    icon: "🌍",
    titleKey: "hub_ielts_title",
    titleDefault: "IELTS & TOEFL Uluslararası Sınav",
    taglineKey: "hub_ielts_tagline",
    taglineDefault: "Lexical Variety, Grammatical Range & Academic Discourse",
    descKey: "hub_ielts_desc",
    descDefault: "Cambridge IELTS Speaking/Writing ve TOEFL iBT için gerekli yüksek bant puanı getiren akademik kalıplar ve bağlaçlar.",
    badges: ["IELTS Band 7.5+", "TOEFL iBT 100+", "Cambridge", "Part 2/3"],
    targetLevel: "Advanced (C1)",
    cardCount: 450,
    sampleWords: ["furthermore", "on the flip side", "paradigm", "profound", "repercussion", "subsequent"],
    cards: [
      {
        word: "repercussion",
        phonetic: "/ˌriː.pəˈkʌʃ.ən/",
        meaning: "Yankı, dolaylı olumsuz sonuç",
        exampleEn: "Unchecked urban sprawl triggers severe environmental and sociological repercussions.",
        exampleTr: "Kontrolsüz kentleşme, ciddi çevresel ve sosyolojik yankıları tetikler.",
      },
      {
        word: "profound",
        phonetic: "/prəˈfaʊnd/",
        meaning: "Derin, köklü, son derece etkili",
        exampleEn: "The advent of mobile communication generated a profound transformation in human collaboration.",
        exampleTr: "Mobil iletişimin gelişi, insan işbirliğinde derin bir dönüşüm meydana getirdi.",
      },
      {
        word: "inevitable",
        phonetic: "/ɪnˈev.ɪ.tə.bəl/",
        meaning: "Kaçınılmaz, önüne geçilemez",
        exampleEn: "Technological automation is an inevitable milestone in industrial evolution.",
        exampleTr: "Teknolojik otomasyon, endüstriyel evrimde kaçınılmaz bir kilometre taşıdır.",
      },
      {
        word: "coherent",
        phonetic: "/kəʊˈhɪə.rənt/",
        meaning: "Tutarlı, bağlantılı ve mantıklı",
        exampleEn: "High-scoring essays present a coherent argument supported by concrete illustrations.",
        exampleTr: "Yüksek puan alan denemeler, somut örneklerle desteklenen tutarlı bir argüman sunar.",
      },
    ],
    readingCase: {
      title: "Urban Demographics and Sustainable Megacity Infrastructure",
      level: "Advanced (C1)",
      snippet: "Metropolitan expansion in the twenty-first century presents unprecedented infrastructure dilemmas. Sociologists argue that sustainable urban planning must prioritize equitable public transit to prevent systemic socioeconomic fragmentation.",
      fullText: "Contemporary demographic shifts indicate that by 2050, more than two-thirds of the world's population will reside in metropolitan regions. While centralized urbanization facilitates economic synergy and technological innovation, it simultaneously strains potable water reserves and electrical grids. Consequently, civic architects advocate for decentralized polycentric development to alleviate congestion and foster societal cohesion."
    },
    speakingScenarioId: "ielts_toefl",
  },
];

export const PROFESSIONAL_HUBS: CareerHubItem[] = [
  {
    key: "project_management",
    type: "professional",
    icon: "📋",
    titleKey: "hub_pm_title",
    titleDefault: "Proje Yönetimi (Project Management)",
    taglineKey: "hub_pm_tagline",
    taglineDefault: "PMP, Agile / Scrum Sprints, Scope Baseline, Stakeholder Alignment",
    descKey: "hub_pm_desc",
    descDefault: "PMP standartları, çevik yazılım sprintleri, iş kırılım yapısı (WBS) ve paydaş yönetimi terminolojisi.",
    badges: ["PMP", "Agile", "Scope", "WBS", "Risk Register"],
    targetLevel: "Upper-Intermediate (B2-C1)",
    cardCount: 380,
    sampleWords: ["scope creep", "deliverable", "stakeholder", "contingency reserve", "sprint backlog", "milestone"],
    cards: [
      {
        word: "scope creep",
        phonetic: "/skəʊp kriːp/",
        meaning: "Kapsam kayması, kontrolsüz iş genişlemesi",
        exampleEn: "Uncontrolled client requests led to significant scope creep and delayed the project baseline.",
        exampleTr: "Kontrolsüz müşteri talepleri ciddi kapsam kaymasına yol açtı ve proje taban çizgisini geciktirdi.",
      },
      {
        word: "deliverable",
        phonetic: "/dɪˈlɪv.ər.ə.bəl/",
        meaning: "Proje çıktısı, teslim edilecek somut iş",
        exampleEn: "Each agile sprint concludes with an operational deliverable reviewed by key stakeholders.",
        exampleTr: "Her çevik sprint, kilit paydaşlar tarafından incelenen çalışır bir proje çıktısıyla sonuçlanır.",
      },
      {
        word: "stakeholder",
        phonetic: "/ˈsteɪkˌhəʊl.dər/",
        meaning: "Paydaş, projede çıkarı/etkisi bulunan taraf",
        exampleEn: "Maintaining proactive engagement with internal stakeholders mitigates project friction.",
        exampleTr: "İç paydaşlarla proaktif iletişimi sürdürmek, proje sürtünmelerini azaltır.",
      },
      {
        word: "contingency reserve",
        phonetic: "/kənˈtɪn.dʒən.si rɪˈzɜːv/",
        meaning: "Öngörülemeyen riskler için ayrılan yedek bütçe",
        exampleEn: "We allocated an eight percent contingency reserve to absorb potential material price spikes.",
        exampleTr: "Olası malzeme fiyat artışlarını karşılamak için yüzde sekizlik bir risk yedek bütçesi ayırdık.",
      },
    ],
    readingCase: {
      title: "Mitigating Scope Creep in Cross-Functional Enterprise Initiatives",
      level: "Upper-Intermediate (B2-C1)",
      snippet: "Scope baseline drift is the silent killer of mega-projects. When project sponsors introduce ad-hoc functional requirements without formal change order requests, delivery velocity drops precipitously.",
      fullText: "Effective project managers implement strict change control governance from project charter inception. By establishing a well-defined Work Breakdown Structure (WBS) and aligning sprint goals with corporate key performance indicators, project leads protect teams against burnout while maintaining stakeholder confidence."
    },
    speakingScenarioId: "project_management",
  },
  {
    key: "project_controls",
    type: "professional",
    icon: "🏗️",
    titleKey: "hub_pc_title",
    titleDefault: "Proje Kontrol & Sözleşme (Project Controls)",
    taglineKey: "hub_pc_tagline",
    taglineDefault: "AACE EVP/PSP, EVM (Earned Value), Primavera P6, Delay Claims, FIDIC",
    descKey: "hub_pc_desc",
    descDefault: "EPC mega projelerinde kritik yol analizi (CPM), hak talepleri (Claims), SPI/CPI endeksleri ve FIDIC uyuşmazlıkları.",
    badges: ["AACE EVP/PSP", "EVM", "Primavera P6", "Claims", "FIDIC"],
    targetLevel: "Advanced (C1)",
    cardCount: 420,
    sampleWords: ["schedule variance", "critical path", "change order", "liquidated damages", "earned value", "cost overrun"],
    cards: [
      {
        word: "critical path",
        phonetic: "/ˈkrɪt.ɪ.kəl pɑːθ/",
        meaning: "Kritik yol (proje bitişini doğrudan belirleyen aktivite zinciri)",
        exampleEn: "Any slippage along the turbine installation will directly compromise the critical path.",
        exampleTr: "Türbin montajındaki herhangi bir kayma, doğrudan kritik yolu tehlikeye atacaktır.",
      },
      {
        word: "liquidated damages",
        phonetic: "/ˈlɪk.wɪ.deɪ.tɪd ˈdæm.ɪ.dʒɪz/",
        meaning: "Gecikme cezası (sözleşmede önceden belirlenmiş tazminat)",
        exampleEn: "The client issued formal notice invoking liquidated damages due to unauthorized commissioning delay.",
        exampleTr: "İşveren, izinsiz devreye alma gecikmesi nedeniyle gecikme cezası işleten resmi bildirim yayınladı.",
      },
      {
        word: "schedule variance",
        phonetic: "/ˈʃedʒ.uːl ˈveə.ri.əns/",
        meaning: "Takvim sapması (SV = EV - PV)",
        exampleEn: "Negative schedule variance indicated our mechanical subcontractor fell 18 days behind target.",
        exampleTr: "Negatif takvim sapması, mekanik alt yüklenicimizin hedefin 18 gün gerisine düştüğünü gösterdi.",
      },
      {
        word: "change order",
        phonetic: "/tʃeɪndʒ ˈɔː.dər/",
        meaning: "Zeyilname / İş Değişiklik Emri",
        exampleEn: "Contractual amendments must be authorized through a signed change order before execution.",
        exampleTr: "Sözleşmesel tadilatlar, uygulamaya geçmeden önce imzalı bir değişiklik emriyle onaylanmalıdır.",
      },
    ],
    readingCase: {
      title: "Time Impact Analysis (TIA) and Subcontractor Acceleration Claims",
      level: "Advanced (C1)",
      snippet: "According to the latest Primavera P6 schedule baseline update, procurement delays in high-pressure piping assemblies threaten the commercial operation date (COD). A Time Impact Analysis reveals 21 calendar days of excusable non-compensable delay.",
      fullText: "In EPC contract management under FIDIC Silver Book conditions, timely notice is of the essence. Failure to lodge a detailed notice of claim within 28 days of becoming aware of the event bars the contractor from entitlement to extension of time (EOT). Rigorous Earned Value Management (EVM) data provides the substantiating backbone against counter-claims."
    },
    speakingScenarioId: "project_controls",
  },
  {
    key: "engineering_civil",
    type: "professional",
    icon: "🏢",
    titleKey: "hub_civil_title",
    titleDefault: "İnşaat & Yapı Mühendisliği (Civil Engineering)",
    taglineKey: "hub_civil_tagline",
    taglineDefault: "Statik Tasarım, Saha Yönetimi, FIDIC Şartnameleri, Geoteknik & Betonarme",
    descKey: "hub_civil_desc",
    descDefault: "Betonarme, çelik konstrüksiyon, zemin mekaniği, şantiye QA/QC denetimleri ve uluslararası FIDIC şartnameleri.",
    badges: ["İnşaat", "Statik", "Saha", "FIDIC", "Geoteknik"],
    targetLevel: "Upper-Intermediate (B2-C1)",
    cardCount: 350,
    sampleWords: ["structural integrity", "reinforcement", "bearing capacity", "shear stress", "site handover", "settlement"],
    cards: [
      {
        word: "structural integrity",
        phonetic: "/ˈstrʌk.tʃər.əl ɪnˈteɡ.rə.ti/",
        meaning: "Yapısal bütünlük / dayanım",
        exampleEn: "Non-destructive ultrasonic testing confirmed the structural integrity of the bridge piers.",
        exampleTr: "Tahribatsız ultrasonik test, köprü ayaklarının yapısal bütünlüğünü doğruladı.",
      },
      {
        word: "bearing capacity",
        phonetic: "/ˈbeə.rɪŋ kəˈpæs.ə.ti/",
        meaning: "Zemin taşıma gücü / kapasitesi",
        exampleEn: "Geotechnical boreholes demonstrated insufficient bearing capacity for shallow foundations.",
        exampleTr: "Geoteknik sondajlar, sığ temeller için yetersiz zemin taşıma kapasitesi gösterdi.",
      },
      {
        word: "shear stress",
        phonetic: "/ʃɪər stres/",
        meaning: "Kayma gerilmesi",
        exampleEn: "The beam was reinforced with additional stirrups to resist high seismic shear stress.",
        exampleTr: "Kiriş, yüksek sismik kayma gerilmesine direnmek için ek etriyelerle güçlendirildi.",
      },
      {
        word: "reinforcement",
        phonetic: "/ˌriː.ɪnˈfɔːs.mənt/",
        meaning: "Donatı, betonarme demiri",
        exampleEn: "Inspectors checked the rebar reinforcement spacing prior to the foundation concrete pour.",
        exampleTr: "Müfettişler, temel beton dökümünden önce donatı demiri aralıklarını kontrol etti.",
      },
    ],
    readingCase: {
      title: "Non-Conformance Report (NCR) on Foundation Concrete Compressive Strength",
      level: "Upper-Intermediate (B2-C1)",
      snippet: "Core laboratory compression tests for footing F-14 yielded 28-day cylinder strength of 31 MPa against the specified 40 MPa requirement. Site engineering initiated non-destructive rebound hammer tests to assess spatial variability.",
      fullText: "Site quality control teams issued a formal Non-Conformance Report (NCR) halts further structural loading on the southwest superstructure. Structural engineers conducted re-analysis with finite element software to evaluate whether carbon-fiber-reinforced polymers (CFRP) can restore required load safety margins."
    },
    speakingScenarioId: "engineering_civil",
  },
  {
    key: "engineering_process_chem",
    type: "professional",
    icon: "⚗️",
    titleKey: "hub_chem_title",
    titleDefault: "Proses & Kimya Mühendisliği (Process & Chemical)",
    taglineKey: "hub_chem_tagline",
    taglineDefault: "HAZOP Analizi, P&ID Şemaları, Rafineri & Petrokimya, Kütle-Enerji Dengesi",
    descKey: "hub_chem_desc",
    descDefault: "Kimyasal reaktörler, distilasyon kolonları, proses güvenliği (PSM), HAZOP ve borulama/enstrümantasyon şemaları.",
    badges: ["Proses", "Kimya", "HAZOP", "P&ID", "Rafineri"],
    targetLevel: "Advanced (C1)",
    cardCount: 360,
    sampleWords: ["distillation column", "pressure relief", "flow rate", "stoichiometric", "catalyst deactivation", "hazard"],
    cards: [
      {
        word: "distillation column",
        phonetic: "/ˌdɪs.tɪˈleɪ.ʃən ˈkɒl.əm/",
        meaning: "Distilasyon / damıtma kolonu",
        exampleEn: "Refinery engineers optimized tray reflux ratios inside the primary crude distillation column.",
        exampleTr: "Rafineri mühendisleri, ana ham petrol distilasyon kolonu içindeki tepsi geri akış oranlarını optimize etti.",
      },
      {
        word: "pressure relief valve",
        phonetic: "/ˈpreʃ.ər rɪˈliːf vælv/",
        meaning: "Basınç emniyet valfi / tahliye vanası",
        exampleEn: "The spring-loaded pressure relief valve prevented overpressurization of the catalytic vessel.",
        exampleTr: "Yaylı basınç tahliye vanası, katalitik reaktörün aşırı basınçlanmasını önledi.",
      },
      {
        word: "catalyst deactivation",
        phonetic: "/ˈkæt.əl.ɪst diːˌæk.tɪˈveɪ.ʃən/",
        meaning: "Katalizör pasifleşmesi / zehirlenmesi",
        exampleEn: "Heavy metal impurities in the feedstock caused premature catalyst deactivation.",
        exampleTr: "Hammadde içindeki ağır metal safsızlıkları, katalizörün erken pasifleşmesine yol açtı.",
      },
    ],
    readingCase: {
      title: "HAZOP Node 6 Review: High-Pressure Hydrocracker Exotherm Mitigation",
      level: "Advanced (C1)",
      snippet: "During the Process Hazard Analysis (PHA) for Node 6, process safety engineers examined potential runaway reactions caused by quench hydrogen flow interruption. Independent protection layers (IPL) were evaluated to ensure SIL-3 safety compliance.",
      fullText: "The interdisciplinary HAZOP committee concluded that existing high-temperature alarms did not provide adequate operator response time. The engineering team mandated an automated Emergency Depressurization System (EDP) linked directly to the flare knockout drum."
    },
    speakingScenarioId: "engineering_process_chem",
  },
  {
    key: "engineering_mechanical",
    type: "professional",
    icon: "⚙️",
    titleKey: "hub_mech_title",
    titleDefault: "Makina & Tesis Mühendisliği (Mechanical Engineering)",
    taglineKey: "hub_mech_tagline",
    taglineDefault: "HVAC, Borulama (Piping), Dönen Ekipmanlar, Titreşim Analizi, Kestirimci Bakım",
    descKey: "hub_mech_desc",
    descDefault: "Pompalar, kompresörler, türbinler, HVAC, termodinamik çevrimler ve kestirimci titreşim analizleri.",
    badges: ["Makina", "HVAC", "Piping", "Bakım", "Vibrasyon"],
    targetLevel: "Upper-Intermediate (B2-C1)",
    cardCount: 370,
    sampleWords: ["cavitation", "thermal expansion", "predictive maintenance", "vibration analysis", "heat exchanger", "flange"],
    cards: [
      {
        word: "cavitation",
        phonetic: "/ˌkæv.ɪˈteɪ.ʃən/",
        meaning: "Kavitasyon (buhar kabarcığı patlamasıyla metal erozyonu)",
        exampleEn: "Insufficient suction head produced severe cavitation, pitting the stainless steel impeller.",
        exampleTr: "Yetersiz emiş yüksekliği şiddetli kavitasyona yol açarak paslanmaz çelik çarkı aşındırdı.",
      },
      {
        word: "thermal expansion",
        phonetic: "/ˈθɜː.məl ɪkˈspæn.ʃən/",
        meaning: "Isıl genleşme",
        exampleEn: "Expansion loops were integrated into the steam line to absorb thermal expansion stresses.",
        exampleTr: "Buhar hattına ısıl genleşme gerilmelerini sönümlemek için genleşme dirsekleri entegre edildi.",
      },
      {
        word: "predictive maintenance",
        phonetic: "/prɪˈdɪk.tɪv ˈmeɪn.tən.əns/",
        meaning: "Kestirimci / öngörülü bakım",
        exampleEn: "Vibration sensors on turbine bearings facilitate condition-based predictive maintenance.",
        exampleTr: "Türbin yataklarındaki titreşim sensörleri, duruma dayalı kestirimci bakımı kolaylaştırır.",
      },
    ],
    readingCase: {
      title: "Centrifugal Compressor Vibration Anomaly and Bearing Overhaul Report",
      level: "Upper-Intermediate (B2-C1)",
      snippet: "Routine spectral vibration monitoring flagged elevated sub-synchronous vibration on drive-end journal bearings. Phase analysis indicated hydrodynamic oil whirl caused by lubricating oil viscosity degradation.",
      fullText: "Mechanical maintenance technicians isolated compressor K-201 and initiated an emergency inspection. Teardown inspection confirmed micro-scuffing on the babbitt lining, requiring replacement with upgraded five-pad tilt-pad journal bearings."
    },
    speakingScenarioId: "engineering_mechanical",
  },
  {
    key: "medical_health",
    type: "professional",
    icon: "🩺",
    titleKey: "hub_med_title",
    titleDefault: "Tıp & Klinik İletişim (Medical & Healthcare)",
    taglineKey: "hub_med_tagline",
    taglineDefault: "OET, USMLE, Hasta Anamnezi, Ayırıcı Tanı (Differential Diagnosis), Konsültasyon",
    descKey: "hub_med_desc",
    descDefault: "Doktor-hasta iletişimi, klinik vizitler, vaka sunumları, OET konuşma kriterleri ve ayırıcı tanı basamakları.",
    badges: ["OET", "USMLE", "Klinik İletişim", "Tanı", "Konsültasyon"],
    targetLevel: "Advanced (C1)",
    cardCount: 430,
    sampleWords: ["differential diagnosis", "dyspnea", "clinical workup", "exacerbation", "auscultation", "prognosis"],
    cards: [
      {
        word: "differential diagnosis",
        phonetic: "/ˌdɪf.əˈren.ʃəl ˌdaɪ.əɡˈnəʊ.sɪs/",
        meaning: "Ayırıcı tanı",
        exampleEn: "Given the pleuritic chest pain and tachypnea, pulmonary embolism tops our differential diagnosis.",
        exampleTr: "Plöritik göğüs ağrısı ve taşipne göz önüne alındığında, pulmoner emboli ayırıcı tanımızın başında yer alıyor.",
      },
      {
        word: "dyspnea",
        phonetic: "/dɪspˈniː.ə/",
        meaning: "Nefes darlığı, dispne",
        exampleEn: "The patient reported worsening exertional dyspnea unaccompanied by nocturnal cough.",
        exampleTr: "Hasta, gece öksürüğünün eşlik etmediği ve eforla kötüleşen nefes darlığı bildirdi.",
      },
      {
        word: "auscultation",
        phonetic: "/ˌɔː.skəlˈteɪ.ʃən/",
        meaning: "Oskültasyon, stetoskopla dinleme",
        exampleEn: "Chest auscultation revealed bilateral inspiratory crackles at both lung bases.",
        exampleTr: "Göğüs oskültasyonu, her iki akciğer tabanında bilateral inspiratuar raller ortaya çıkardı.",
      },
      {
        word: "prognosis",
        phonetic: "/prɒɡˈnəʊ.sɪs/",
        meaning: "Prognoz, hastalığın gidişatı ve sonucu",
        exampleEn: "Early therapeutic intervention significantly improves overall cardiovascular prognosis.",
        exampleTr: "Erken terapötik müdahale, genel kardiyovasküler prognozu önemli ölçüde iyileştirir.",
      },
    ],
    readingCase: {
      title: "Hospital Morning Ward Rounds: 54-Year-Old Male with Acute Exertional Dyspnea",
      level: "Advanced (C1)",
      snippet: "A 54-year-old male with a history of deep vein thrombosis presents with sudden progressive dyspnea and bilateral lower extremity edema. Initial workup shows sinus tachycardia on ECG and significantly elevated D-dimer titers.",
      fullText: "Attending physicians discuss diagnostic imaging alternatives, weighing intravenous contrast nephrotoxicity against the necessity of CT pulmonary angiography (CTPA). The medical team reaches consensus on immediate low-molecular-weight heparin initiation pending definitive radiological confirmation."
    },
    speakingScenarioId: "medical_health",
  },
  {
    key: "legal_contracts",
    type: "professional",
    icon: "⚖️",
    titleKey: "hub_legal_title",
    titleDefault: "Hukuk & Ticari Sözleşmeler (Legal & Contracts)",
    taglineKey: "hub_legal_tagline",
    taglineDefault: "TOLES, Uluslararası Tahkim, Tazminat & Sorumluluk, Gizlilik (NDA), Şirketler Hukuku",
    descKey: "hub_legal_desc",
    descDefault: "Uluslararası sözleşme müzakereleri, tahkim kuralları, rücu hakları, mücbir sebep ve TOLES hukuk İngilizcesi.",
    badges: ["TOLES", "Ticari Hukuk", "Tahkim", "Indemnity", "Liability"],
    targetLevel: "Advanced (C1)",
    cardCount: 390,
    sampleWords: ["indemnification", "breach of contract", "force majeure", "jurisdiction", "arbitration clause", "liability"],
    cards: [
      {
        word: "indemnification",
        phonetic: "/ɪnˌdem.nɪ.fɪˈkeɪ.ʃən/",
        meaning: "Tazmin etme, zararı karşılama yükümlülüğü",
        exampleEn: "The indemnification clause obligates the vendor to hold the buyer harmless against third-party patent claims.",
        exampleTr: "Tazminat maddesi, tedarikçiyi üçüncü taraf patent iddialarına karşı alıcıyı masun tutmakla yükümlü kılar.",
      },
      {
        word: "breach of contract",
        phonetic: "/briːtʃ əv ˈkɒn.trækt/",
        meaning: "Sözleşme ihlali",
        exampleEn: "Failure to deliver source code on the agreed closing date constituted a material breach of contract.",
        exampleTr: "Kaynak kodun kararlaştırılan kapanış tarihinde teslim edilmemesi, esaslı bir sözleşme ihlali teşkil etti.",
      },
      {
        word: "force majeure",
        phonetic: "/ˌfɔːs mæˈʒɜːr/",
        meaning: "Mücbir sebep",
        exampleEn: "Neither party shall be held liable for performance delays arising from unforeseen force majeure events.",
        exampleTr: "Taraflardan hiçbiri, öngörülemeyen mücbir sebep olaylarından kaynaklanan gecikmelerden sorumlu tutulamaz.",
      },
    ],
    readingCase: {
      title: "ICC Arbitration Brief: Material Adverse Change and Warranty Breach",
      level: "Advanced (C1)",
      snippet: "Claimant filed a Request for Arbitration before the International Chamber of Commerce (ICC), asserting that respondent concealed material environmental liabilities prior to stock purchase agreement closing.",
      fullText: "Counsel for claimant argues that under governing English law, the disclosure letter failed to qualify warranty representations in fair and transparent terms. Respondent contends that the doctrine of caveat emptor applies and moves for an expedited jurisdictional hearing."
    },
    speakingScenarioId: "legal_contracts",
  },
  {
    key: "finance_accounting",
    type: "professional",
    icon: "📊",
    titleKey: "hub_fin_title",
    titleDefault: "Finans & Denetim (Finance & Accounting)",
    taglineKey: "hub_fin_tagline",
    taglineDefault: "ACCA, CPA, IFRS Raporlama, Bilanço & Nakit Akışı, EBITDA, Bağımsız Denetim",
    descKey: "hub_fin_desc",
    descDefault: "Uluslararası finansal raporlama (IFRS), bilanço analizleri, nakit akışı, amortisman, kur riskleri ve denetim terimleri.",
    badges: ["ACCA", "CPA", "IFRS", "Bilanço", "EBITDA"],
    targetLevel: "Upper-Intermediate (B2-C1)",
    cardCount: 410,
    sampleWords: ["depreciation", "cash flow statement", "liquidity ratio", "amortization", "impairment", "revenue"],
    cards: [
      {
        word: "depreciation",
        phonetic: "/dɪˌpriː.ʃiˈeɪ.ʃən/",
        meaning: "Amortisman, yıpranma payı",
        exampleEn: "The company shifted to straight-line depreciation for all manufacturing plant machinery.",
        exampleTr: "Şirket, tüm üretim tesisi makineleri için doğrusal amortisman yöntemine geçti.",
      },
      {
        word: "liquidity ratio",
        phonetic: "/lɪˈkwɪd.ə.ti ˈreɪ.ʃi.əʊ/",
        meaning: "Likidite oranı (kısa vadeli borç ödeme gücü)",
        exampleEn: "Lenders closely monitor the quick liquidity ratio to verify short-term solvency.",
        exampleTr: "Kredi verenler, kısa vadeli borç ödeme gücünü doğrulamak için asit-test likidite oranını yakından izler.",
      },
      {
        word: "impairment",
        phonetic: "/ɪmˈpeə.mənt/",
        meaning: "Değer düşüklüğü karşılığı",
        exampleEn: "Auditors recorded a $12 million goodwill impairment charge following declining retail sales.",
        exampleTr: "Denetçiler, düşen perakende satışların ardından 12 milyon dolarlık bir şerefiye değer düşüklüğü gideri kaydetti.",
      },
    ],
    readingCase: {
      title: "IFRS 16 Lease Accounting Audit Memorandum and Capital Structure Restatement",
      level: "Upper-Intermediate (B2-C1)",
      snippet: "Following mandatory adoption of IFRS 16, operating lease liabilities were recognized on the balance sheet, altering debt-to-equity ratios and elevating reported EBITDA figures across international subsidiaries.",
      fullText: "Financial controllers presented the restated cash flow statements to institutional lenders. By demonstrating that underlying operational cash generation remained robust despite accounting shifts, the company renegotiated covenant ratios without penalty."
    },
    speakingScenarioId: "finance_accounting",
  },
  {
    key: "tech_executive",
    type: "professional",
    icon: "🚀",
    titleKey: "hub_tech_title",
    titleDefault: "Tech & Yazılım Mimarisi (Tech Executive)",
    taglineKey: "hub_tech_tagline",
    taglineDefault: "SaaS Mimarisi, Yüksek Eşzamanlılık (High Concurrency), Bulut SLA, Yönetim Kurulu",
    descKey: "hub_tech_desc",
    descDefault: "Mikroservisler, dağıtık veritabanları, Kafka kuyrukları, gecikme SLA taahhütleri ve Series A/B yatırımcı savunması.",
    badges: ["SaaS", "Yazılım Mimarisi", "Yönetim Kurulu", "Cloud SLA", "Throughput"],
    targetLevel: "Advanced (C1)",
    cardCount: 440,
    sampleWords: ["distributed system", "throughput", "event-driven", "latency SLA", "scalability bottleneck", "failover"],
    cards: [
      {
        word: "distributed system",
        phonetic: "/dɪˈstrɪb.juː.tɪd ˈsɪs.təm/",
        meaning: "Dağıtık sistem mimarisi",
        exampleEn: "Our distributed system leverages partitioned event brokers to process 50,000 requests per second.",
        exampleTr: "Dağıtık sistemimiz, saniyede 50.000 isteği işlemek için bölümlendirilmiş olay aracılarını kullanır.",
      },
      {
        word: "throughput",
        phonetic: "/ˈθruː.pʊt/",
        meaning: "İş çıkarma kapasitesi, birim zamandaki veri akışı",
        exampleEn: "Replacing synchronous REST calls with asynchronous gRPC increased database throughput by 40%.",
        exampleTr: "Senkron REST çağrılarını asenkron gRPC ile değiştirmek, veritabanı iş çıkarma kapasitesini %40 artırdı.",
      },
      {
        word: "failover",
        phonetic: "/ˈfeɪlˌəʊ.vər/",
        meaning: "Otomatik yedek sisteme geçiş",
        exampleEn: "Multi-region replication ensures seamless automated failover with zero data loss.",
        exampleTr: "Çok bölgeli çoğaltma, sıfır veri kaybıyla kesintisiz otomatik yedek sisteme geçişi garanti eder.",
      },
      {
        word: "scalability bottleneck",
        phonetic: "/ˌskeɪ.ləˈbɪl.ə.ti ˈbɒt.əl.nek/",
        meaning: "Ölçeklenebilirlik darboğazı",
        exampleEn: "Connection pooling resolved the primary scalability bottleneck across our transactional microservices.",
        exampleTr: "Bağlantı havuzlama, işlemsel mikroservislerimiz genelindeki birincil ölçeklenebilirlik darboğazını çözdü.",
      },
    ],
    readingCase: {
      title: "Distributed Database Sharding and Multi-Region High Availability Architecture",
      level: "Advanced (C1)",
      snippet: "To defend against cascading timeouts during traffic spikes, lead architects decoupled relational storage using partitioned event streams. Idempotent consumer workers guarantee sub-100 millisecond response times under peak concurrency.",
      fullText: "During technical due diligence for our Series A funding round, venture capital partners scrutinized database replication lag across European and US availability zones. Benchmarking verified that distributed caching combined with eventual consistency patterns satisfies strict 99.99% SLA commitments."
    },
    speakingScenarioId: "tech_executive",
  },
];

export const ALL_CAREER_HUBS: CareerHubItem[] = [
  ...ACADEMIC_HUBS,
  ...PROFESSIONAL_HUBS,
];

export const CAREER_HUBS_BY_KEY: Record<string, CareerHubItem> = ALL_CAREER_HUBS.reduce(
  (acc, hub) => {
    acc[hub.key] = hub;
    return acc;
  },
  {} as Record<string, CareerHubItem>
);
