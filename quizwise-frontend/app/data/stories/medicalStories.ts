import { Story } from "./types";

export const medicalStories: Story[] = [
  // ==========================================
  // LEVEL A (A1-A2, ~120-150 kelime, 2-3 dk)
  // ==========================================
  {
    id: "med-01-outpatient-intake",
    title: "Outpatient Clinic Intake and Medical History",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    topic: "Poliklinik Hasta Kabulü",
    desc: "Genel dahiliye polikliniğinde yeni hastanın tıbbi geçmişi, kronik hastalıkları ve alerji kaydının alınması.",
    content: "When sixty-two-year-old Robert arrives for his annual health checkup at the outpatient clinic, Intake Nurse Sarah welcomes him into the examination room. Before the physician conducts the physical examination, Sarah verifies Robert's biographical information and records a thorough medical history in the electronic health record system.\n\nShe asks Robert about his current daily medications, any known drug allergies, and past surgical operations. Robert mentions that he takes a daily pill for mild hypertension and is severely allergic to penicillin antibiotics. Sarah flags his penicillin allergy with a bright red warning banner on the digital chart to prevent adverse medication errors. Taking an accurate medical history ensures patient safety and provides doctors with essential clinical context.",
    target_words: ["outpatient", "hypertension", "banner", "adverse"],
    target_vocabulary: [
      { word: "outpatient", phonetic: "/ˈaʊtˌpeɪ.ʃənt/", turkish_meaning: "ayaktan hasta, poliklinik hastası", context_sentence: "He attended the outpatient clinic for a routine checkup." },
      { word: "hypertension", phonetic: "/ˌhaɪ.pəˈten.ʃən/", turkish_meaning: "hipertansiyon, yüksek tansiyon", context_sentence: "Daily medication controls his mild arterial hypertension." },
      { word: "banner", phonetic: "/ˈbæn.ər/", turkish_meaning: "uyarı bandı, görsel ikaz", context_sentence: "The nurse placed an allergy warning banner on the electronic chart." },
      { word: "adverse", phonetic: "/ˈæd.vɜːs/", turkish_meaning: "yan etki, aleyhte/zararlı", context_sentence: "Accurate records prevent adverse drug reactions in hospital." },
    ],
    comprehension_questions: [
      {
        question: "What serious drug allergy does Robert report during his clinic intake?",
        options: ["Allergic to water", "Severe penicillin allergy", "Allergic to aspirin", "Allergic to bandages"],
        correct_answer_index: 1,
        explanation: "Robert clearly states that he is severely allergic to penicillin antibiotics."
      },
      {
        question: "How does Nurse Sarah highlight the penicillin allergy in the electronic system?",
        options: ["She whispers it to the doctor", "With a bright red warning banner on his digital medical chart", "She writes it on a sticky note", "She leaves it blank"],
        correct_answer_index: 1,
        explanation: "She flags his digital record with a prominent red allergy warning banner."
      },
      {
        question: "Why is taking an accurate medical history essential in healthcare?",
        options: ["To sell products to the patient", "To protect patient safety and prevent adverse medication errors", "To determine bill prices only", "To make the appointment longer"],
        correct_answer_index: 1,
        explanation: "Accurate history prevents dangerous medication errors and ensures clinical safety."
      },
    ],
  },
  {
    id: "med-02-vital-signs",
    title: "Recording Triage Vital Signs and Blood Pressure",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 138,
    coverImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    topic: "Tansiyon ve Vital Bulgular",
    desc: "Hemşirenin hastanın tansiyonunu, nabzını, oksijen satürasyonunu ve vücut ısısını dijital monitörle ölçmesi.",
    content: "In the primary care triage room, Nurse Daniel measures the four core vital signs for fifty-five-year-old patient Maria, who complains of occasional morning headaches. First, Daniel wraps a blood pressure cuff snugly around Maria’s left upper arm. The digital sphygmomanometer inflates smoothly, displaying a reading of one hundred and thirty-eight over eighty-six millimeters of mercury.\n\nNext, Daniel attaches a pulse oximeter clip to Maria's index finger. The small monitor detects an oxygen saturation level of ninety-eight percent and a resting heart rate of seventy-two beats per minute. Finally, an infrared tympanic thermometer records a body temperature of 36.8 degrees Celsius. Daniel documents these baseline parameters in Maria’s clinical chart, noting that her slightly elevated systolic pressure warrants lifestyle counseling and regular monitoring.",
    target_words: ["sphygmomanometer", "oximeter", "saturation", "parameters"],
    target_vocabulary: [
      { word: "sphygmomanometer", phonetic: "/ˌsfɪɡ.məʊ.məˈnɒm.ɪ.tər/", turkish_meaning: "tansiyon aleti (sfigmomanometre)", context_sentence: "The nurse checked blood pressure with an automated sphygmomanometer." },
      { word: "oximeter", phonetic: "/ɒkˈsɪm.ɪ.tər/", turkish_meaning: "oksimetre (kandaki oksijeni ölçen cihaz)", context_sentence: "A pulse oximeter measured peripheral capillary oxygen saturation." },
      { word: "saturation", phonetic: "/ˌsætʃ.ərˈeɪ.ʃən/", turkish_meaning: "doygunluk (oksijen satürasyonu)", context_sentence: "Her arterial blood oxygen saturation registered a healthy 98%." },
      { word: "parameters", phonetic: "/pəˈræm.ɪ.tərz/", turkish_meaning: "parametreler, temel değerler", context_sentence: "Baseline vital parameters provide an objective health overview." },
    ],
    comprehension_questions: [
      {
        question: "What blood pressure reading was recorded for Maria?",
        options: ["80/40 mmHg", "138/86 mmHg", "200/120 mmHg", "110/70 mmHg"],
        correct_answer_index: 1,
        explanation: "The digital monitor displayed a reading of 138/86 mmHg."
      },
      {
        question: "What medical device measured Maria's oxygen saturation on her fingertip?",
        options: ["A pulse oximeter clip", "A stethoscope", "An X-ray machine", "A blood syringe"],
        correct_answer_index: 0,
        explanation: "A fingertip pulse oximeter detected her peripheral oxygen saturation."
      },
      {
        question: "What was Maria's resting heart rate per minute?",
        options: ["Forty beats", "Seventy-two beats per minute", "One hundred and fifty beats", "Twelve beats"],
        correct_answer_index: 1,
        explanation: "The monitor recorded a steady resting heart rate of 72 beats per minute."
      },
    ],
  },
  {
    id: "med-03-pharmacy-consultation",
    title: "Pharmacist Patient Consultation on Antibiotics",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 142,
    coverImage: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
    topic: "Eczane Reçete Bilgilendirmesi",
    desc: "Eczacının diş enfeksiyonu için amoksisilin antibiyotik reçetesi alan hastaya kullanım talimatı ve yan etki uyarısı yapması.",
    content: "Pharmacist David dispenses a course of oral amoxicillin antibiotics to customer James, who was recently treated for a bacterial dental infection. Before handing over the medication bottle, David invites James to the private consultation counter to explain essential dosage instructions.\n\nDavid emphasizes that James must take one five-hundred-milligram capsule every eight hours with a full glass of water. Crucially, David warns that James must complete the entire seven-day prescribed course, even if his tooth pain disappears after three days. Stopping antibiotics prematurely allows surviving bacteria to develop dangerous antimicrobial resistance. He also advises James to take the capsules alongside meals to prevent mild gastrointestinal upset and avoid alcohol consumption during the treatment course.",
    target_words: ["dispenses", "dosage", "antimicrobial", "gastrointestinal"],
    target_vocabulary: [
      { word: "dispenses", phonetic: "/dɪˈspen.sɪz/", turkish_meaning: "ilaç hazırlar ve teslim eder", context_sentence: "The pharmacist dispenses prescribed medications with care." },
      { word: "dosage", phonetic: "/ˈdəʊ.sɪdʒ/", turkish_meaning: "dozaj, ilaç kullanım miktarı", context_sentence: "Follow the precise dosage instructions printed on the label." },
      { word: "antimicrobial", phonetic: "/ˌæn.ti.maɪˈkrəʊ.bi.əl/", turkish_meaning: "antimikrobiyal, mikroplara karşı", context_sentence: "Stopping antibiotics early encourages antimicrobial drug resistance." },
      { word: "gastrointestinal", phonetic: "/ˌɡæs.trəʊ.ɪnˈtes.tɪ.nəl/", turkish_meaning: "mide ve bağırsakla ilgili", context_sentence: "Taking food with medication minimizes gastrointestinal side effects." },
    ],
    comprehension_questions: [
      {
        question: "How often must James take his prescribed antibiotic capsule?",
        options: ["Once every week", "One capsule every eight hours with water", "Five capsules every morning", "Only when he feels pain"],
        correct_answer_index: 1,
        explanation: "The pharmacist directed him to take one 500mg capsule every eight hours."
      },
      {
        question: "Why must patients complete the full antibiotic course even after symptoms improve?",
        options: ["To buy more medicine", "To prevent surviving bacteria from developing antimicrobial resistance", "Because pharmacies require it", "To make teeth whiter"],
        correct_answer_index: 1,
        explanation: "Completing the entire course ensures all bacteria are eradicated, preventing drug resistance."
      },
      {
        question: "What recommendation did David give to prevent mild stomach upset?",
        options: ["Drink coffee with every pill", "Take the capsules alongside meals", "Skip meals entirely", "Take the medicine lying down"],
        correct_answer_index: 1,
        explanation: "David advised taking the medication with meals to avoid gastrointestinal irritation."
      },
    ],
  },
  {
    id: "med-04-cold-symptom-tracking",
    title: "Upper Respiratory Infection Symptom Monitoring",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    topic: "Soğuk Algınlığı Semptom Takibi",
    desc: "Kış mevsiminde viral üst solunum yolu enfeksiyonu geçiren hastanın istirahat, sıvı alımı ve kırmızı bayrak semptomları.",
    content: "During winter, college student Kevin visits the campus health clinic complaining of a scratchy throat, nasal congestion, a mild dry cough, and general fatigue. Physician Assistant Emily conducts a physical examination of his throat and ears, noting erythematous mucosa without purulent tonsillar exudates.\n\nEmily explains that Kevin has a common viral upper respiratory infection, commonly known as a cold. Because colds are viral, antibiotics are completely ineffective and should not be prescribed. Instead, Emily recommends supportive care: drinking plenty of warm fluids, getting eight hours of rest, using saline nasal sprays, and taking acetaminophen for body aches. She advises Kevin to seek immediate medical attention if he develops red flag warning symptoms, such as shortness of breath, a high fever exceeding thirty-nine degrees, or severe chest pain.",
    target_words: ["congestion", "mucosa", "ineffective", "supportive"],
    target_vocabulary: [
      { word: "congestion", phonetic: "/kənˈdʒes.tʃən/", turkish_meaning: "burun tıkanıklığı, konjesyon", context_sentence: "He used a saline spray to relieve nasal congestion." },
      { word: "mucosa", phonetic: "/mjuːˈkəʊ.zə/", turkish_meaning: "mukoza, iç zar dokusu", context_sentence: "Viral infections cause inflammation of the nasal mucosa." },
      { word: "ineffective", phonetic: "/ˌɪn.ɪˈfek.tɪv/", turkish_meaning: "etkisiz, faydasız", context_sentence: "Antibiotics are ineffective against common viral colds." },
      { word: "supportive", phonetic: "/səˈpɔː.tɪv/", turkish_meaning: "destekleyici (semptomatik tedavi)", context_sentence: "Supportive care with fluids and rest promotes natural recovery." },
    ],
    comprehension_questions: [
      {
        question: "Why did Emily decide not to prescribe antibiotics for Kevin's cold?",
        options: ["Because the clinic ran out of pills", "Because colds are viral infections, making antibiotics ineffective", "Because antibiotics only work in summer", "Because Kevin was too young"],
        correct_answer_index: 1,
        explanation: "Antibiotics target bacteria, making them useless against viral upper respiratory infections."
      },
      {
        question: "What supportive care measures were recommended to Kevin?",
        options: ["Running a marathon", "Warm fluids, adequate rest, saline nasal spray, and acetaminophen", "Eating salty potato chips all day", "Cold outdoor swimming"],
        correct_answer_index: 1,
        explanation: "Emily advised hydration, rest, saline nasal rinses, and acetaminophen for aches."
      },
      {
        question: "What 'red flag' symptom should prompt Kevin to seek immediate emergency care?",
        options: ["Sneezing once", "Shortness of breath, severe chest pain, or high fever", "Feeling tired after lunch", "A mild runny nose"],
        correct_answer_index: 1,
        explanation: "Dyspnea (shortness of breath), chest pain, or high fever represent critical warning signs."
      },
    ],
  },
  {
    id: "med-05-vaccine-appointment",
    title: "Routine Immunization Clinic and Post-Vaccination Observation",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
    topic: "Aşı Randevusu ve Gözlem",
    desc: "Mevsimsel grip aşısı olan hastaya intramüsküler enjeksiyon uygulanması ve 15 dakikalık bekleme protokolü.",
    content: "At the community health center, thirty-year-old teacher Anna attends her appointment for the annual influenza vaccine. Public Health Nurse Laura checks Anna's vaccine screening questionnaire to confirm that she has no history of severe Guillain-Barré syndrome or previous anaphylactic reactions to vaccine ingredients. Laura cleans Anna’s deltoid shoulder muscle with an alcohol swab.\n\nUsing a sterile single-use syringe, Laura smoothly administers the inactivated influenza vaccine into Anna's deltoid muscle. Laura applies a small adhesive bandage and instructs Anna to sit comfortably in the clinic waiting area for fifteen minutes. This mandatory post-vaccination observation period ensures that healthcare providers can promptly recognize and treat rare immediate allergic reactions, such as urticaria or dizziness, before patients drive home safely.",
    target_words: ["immunization", "deltoid", "sterile", "observation"],
    target_vocabulary: [
      { word: "immunization", phonetic: "/ˌɪm.jə.naɪˈzeɪ.ʃən/", turkish_meaning: "bağışıklama, aşılama", context_sentence: "Annual influenza immunization protects community health." },
      { word: "deltoid", phonetic: "/ˈdel.tɔɪd/", turkish_meaning: "omuz kası (deltoid)", context_sentence: "The nurse injected the vaccine into her left deltoid muscle." },
      { word: "sterile", phonetic: "/ˈster.aɪl/", turkish_meaning: "steril, mikropsuz", context_sentence: "Vaccines are delivered using single-use sterile syringes." },
      { word: "observation", phonetic: "/ˌɒb.zəˈveɪ.ʃən/", turkish_meaning: "gözlem altında tutma", context_sentence: "A fifteen-minute observation period verifies patient well-being." },
    ],
    comprehension_questions: [
      {
        question: "Which muscle was selected for the influenza intramuscular injection?",
        options: ["The stomach muscle", "The deltoid shoulder muscle", "The foot arch", "The neck muscle"],
        correct_answer_index: 1,
        explanation: "Adult vaccinations are standardly administered into the upper arm's deltoid muscle."
      },
      {
        question: "Why are patients instructed to wait in the clinic for fifteen minutes after vaccination?",
        options: ["To finish reading magazines", "To observe and treat any rare immediate allergic reactions", "To wait for test results from the lab", "To make room for other cars"],
        correct_answer_index: 1,
        explanation: "The observation window allows nurses to manage rare immediate anaphylactic or syncopal reactions."
      },
      {
        question: "What did Nurse Laura review before administering the vaccine?",
        options: ["Anna's high school diploma", "A screening questionnaire for past allergic reactions and medical conditions", "Anna's bank balance", "The weather forecast"],
        correct_answer_index: 1,
        explanation: "Laura verified the screening form to rule out previous adverse reactions to vaccine components."
      },
    ],
  },

  // ==========================================
  // LEVEL B (B1-B2, ~230-280 kelime, 4-5 dk)
  // ==========================================
  {
    id: "med-06-er-triage-sepsis-alert",
    title: "Emergency Department Triage and Sepsis Protocol",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    topic: "Acil Triyaj ve Sepsis Protokolü",
    desc: "Acil servise getirilen yaşlı hastada laktat yüksekliği, hipotansiyon ve bir saatlik sepsis paketi uygulaması.",
    content: "A seventy-one-year-old female was brought to the Emergency Department by paramedics presenting with severe lethargy, confusion, and shivering chills following an untreated urinary tract infection. Triage Nurse Michael rapidly calculated her quick Sequential Organ Failure Assessment (qSOFA) score upon arrival: respiratory rate was twenty-four breaths per minute, systolic blood pressure had dropped to 86/50 mmHg, and her Glasgow Coma Scale was evaluated at 13 due to acute disorientation.\n\nMeeting all three qSOFA criteria, Michael immediately activated the hospital's electronic 'Code Sepsis' alert. Emergency Physician Dr. Katherine Vance commenced the standardized international Surviving Sepsis Campaign 'Hour-1 Bundle'. Clinical priority focused on rapid physiological stabilization before vascular collapse and multiple organ failure ensued. Nursing staff drew peripheral venous blood for point-of-care lactate testing, blood cultures from two distinct anatomical sites, and a complete metabolic panel.\n\nInitial arterial blood gas analysis revealed an elevated serum lactate of 4.2 millimoles per liter, confirming significant cellular hypoperfusion. Within the crucial first hour, the medical team initiated aggressive intravenous fluid resuscitation with balanced crystalloids administered at thirty milliliters per kilogram of body weight. Simultaneously, broad-spectrum intravenous piperacillin-tazobactam antibiotics were infused. After two liters of fluid resuscitation, mean arterial pressure stabilized above sixty-five mmHg, and the patient was safely transferred to the Intensive Care Unit for continuous invasive arterial line hemodynamic monitoring.",
    target_words: ["lethargy", "hypoperfusion", "crystalloids", "hemodynamic"],
    target_vocabulary: [
      { word: "lethargy", phonetic: "/ˈleθ.ə.dʒi/", turkish_meaning: "şiddetli halsizlik, uyuşukluk", context_sentence: "The elderly patient exhibited pronounced lethargy and confusion." },
      { word: "hypoperfusion", phonetic: "/ˌhaɪ.pəʊ.pəˈfjuː.ʒən/", turkish_meaning: "hipoperfüzyon (dokulara yetersiz kan ve oksijen gitmesi)", context_sentence: "Elevated serum lactate confirmed severe systemic hypoperfusion." },
      { word: "crystalloids", phonetic: "/ˈkrɪs.təl.ɔɪdz/", turkish_meaning: "kristaloid serumlar (fizyolojik sıvı solüsyonları)", context_sentence: "Nurses initiated rapid resuscitation with balanced intravenous crystalloids." },
      { word: "hemodynamic", phonetic: "/ˌhiː.məʊ.daɪˈnæm.ɪk/", turkish_meaning: "hemodinamik (kan dolaşımı ve basınç dengesi)", context_sentence: "Intensive care teams provided continuous hemodynamic monitoring." },
    ],
    comprehension_questions: [
      {
        question: "What diagnostic screening tool alerted the triage nurse to imminent septic shock?",
        options: ["An eye chart", "The quick Sequential Organ Failure Assessment (qSOFA) score", "A skin prick test", "A routine height measurement"],
        correct_answer_index: 1,
        explanation: "Nurse Michael identified severe sepsis risk using the validated qSOFA bedside screening criteria."
      },
      {
        question: "What blood biomarker indicated severe tissue hypoperfusion in the emergency department?",
        options: ["Elevated serum lactate of 4.2 mmol/L", "Low cholesterol", "Normal iron levels", "High vitamin C"],
        correct_answer_index: 0,
        explanation: "A serum lactate exceeding 4.0 mmol/L confirmed severe cellular hypoxia and hypoperfusion."
      },
      {
        question: "What treatments constitute the core of the 'Hour-1 Sepsis Bundle'?",
        options: ["Sleeping pills and cold water", "Immediate blood cultures, IV broad-spectrum antibiotics, and 30 mL/kg crystalloid fluid resuscitation", "Immediate surgical amputation", "Discharging the patient home"],
        correct_answer_index: 1,
        explanation: "The bundle mandates blood cultures, prompt IV broad-spectrum antibiotics, and crystalloid fluids."
      },
    ],
  },
  {
    id: "med-07-type2-diabetes-management",
    title: "Type 2 Diabetes Mellitus Glycemic Optimization",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    topic: "Tip-2 Diyabet ve İnsülin Direnci",
    desc: "HbA1c değeri %9.2 olan hastada metformin ve GLP-1 reseptör agonisti tedavisiyle glisemik kontrol.",
    content: "Fifty-two-year-old accountant Marcus attends a follow-up consultation with Endocrinologist Dr. Alan Foster to review three-month laboratory findings for poorly controlled Type 2 Diabetes Mellitus. Marcus’s latest glycosylated hemoglobin (HbA1c) level registered at an alarming 9.2 percent, significantly above the clinical target threshold of seven percent. His fasting plasma glucose averaged one hundred and eighty milligrams per deciliter, accompanied by central visceral adiposity and mild microalbuminuria on morning urine screening.\n\nDr. Foster explains that persistent chronic hyperglycemia places Marcus at grave risk of microvascular complications (diabetic retinopathy and peripheral neuropathy) alongside macrovascular events like myocardial infarction. Marcus had been taking metformin monotherapy at one thousand milligrams daily, but his peripheral insulin resistance and progressive pancreatic beta-cell fatigue demanded pharmacological intensification.\n\nRather than initiating basal insulin injections immediately, Dr. Foster optimizes medical therapy by introducing a glucagon-like peptide-1 (GLP-1) receptor agonist, semaglutide, administered as a weekly subcutaneous injection, alongside continuing his metformin regimen. Dr. Foster explains that GLP-1 analogues enhance glucose-dependent insulin secretion, suppress glucagon release, and delay gastric emptying, fostering substantial weight reduction and offering proven cardiovascular mortality benefits. Together with a certified diabetes educator referral for carbohydrate counting and aerobic exercise guidance, the revised therapeutic regimen charts a clear pathway toward glycemic stabilization.",
    target_words: ["glycosylated", "adiposity", "retinopathy", "subcutaneous"],
    target_vocabulary: [
      { word: "glycosylated", phonetic: "/ɡlaɪˈkɒs.ɪ.leɪ.tɪd/", turkish_meaning: "glikolize (HbA1c, 3 aylık kan şekeri ortalaması)", context_sentence: "Glycosylated hemoglobin (HbA1c) measures long-term glycemic control." },
      { word: "adiposity", phonetic: "/ˌæd.ɪˈpɒs.ə.ti/", turkish_meaning: "yağlanma, şişmanlık", context_sentence: "Central visceral adiposity exacerbates cellular insulin resistance." },
      { word: "retinopathy", phonetic: "/ˌret.ɪˈnɒp.ə.θi/", turkish_meaning: "retinopati (göz arkası damar hasarı)", context_sentence: "Chronic hyperglycemia causes microvascular diabetic retinopathy." },
      { word: "subcutaneous", phonetic: "/ˌsʌb.kjuːˈteɪ.ni.əs/", turkish_meaning: "deri altı (enjeksiyon yolu)", context_sentence: "Semaglutide is administered as a weekly subcutaneous injection." },
    ],
    comprehension_questions: [
      {
        question: "What did Marcus's latest HbA1c test result show?",
        options: ["A normal 5.0 percent", "An elevated 9.2 percent indicating poor glycemic control", "Zero percent", "Twelve percent"],
        correct_answer_index: 1,
        explanation: "His HbA1c was 9.2%, significantly exceeding the recommended target of under 7.0%."
      },
      {
        question: "What class of medication did Dr. Foster add to intensify Marcus's treatment?",
        options: ["Oral pain relievers", "A GLP-1 receptor agonist (semaglutide) subcutaneous injection", "High-dose steroids", "Chemotherapy tablets"],
        correct_answer_index: 1,
        explanation: "Dr. Foster added semaglutide, a GLP-1 receptor agonist that improves glucose regulation and promotes weight loss."
      },
      {
        question: "What microvascular complications can result from chronic unmanaged hyperglycemia?",
        options: ["Broken bones", "Diabetic retinopathy and peripheral neuropathy", "Hair loss", "Seasonal allergies"],
        correct_answer_index: 1,
        explanation: "Sustained high blood sugar damages microvascular beds, causing eye retinopathy and nerve damage."
      },
    ],
  },
  {
    id: "med-08-informed-consent-surgery",
    title: "Preoperative Informed Consent for Laparoscopic Cholecystectomy",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    topic: "Ameliyat Öncesi Aydınlatılmış Onam",
    desc: "Safra kesesi ameliyatı öncesinde cerrahın hastaya riskleri, alternatifleri ve laparoskopi komplikasyonlarını anlatması.",
    content: "In the surgical outpatient consultation suite, General Surgeon Dr. Rebecca Lin meets with forty-four-year-old patient Susan to conduct a formal informed consent discussion prior to scheduled laparoscopic cholecystectomy (gallbladder removal). Susan has suffered from recurrent episodes of acute biliary colic caused by symptomatic cholelithiasis (gallstones) impacting the cystic duct.\n\nDr. Lin emphasizes that legally and ethically valid informed consent requires ensuring the patient possesses decisional capacity, comprehends the surgical indication, and voluntarily agrees without coercion. Utilizing anatomical diagrams, Dr. Lin outlines the minimally invasive procedure: four small abdominal port incisions, insufflation of the peritoneal cavity with carbon dioxide gas, and laparoscopic dissection of the gallbladder from the liver bed.\n\nCrucially, Dr. Lin reviews material procedural risks: postoperative infection, port-site bleeding, deep vein thrombosis, and an estimated 0.3 percent risk of common bile duct thermal or mechanical injury, which would necessitate open exploratory laparotomy. She discusses non-surgical conservative alternatives—such as low-fat dietary modification or watchful waiting—noting that delaying surgery carries high risks of gallstone pancreatitis and acute gangrenous cholecystitis. After Dr. Lin addresses all of Susan’s questions regarding anesthesia recovery and postoperative analgesia, Susan signs the informed consent document, affirming her autonomous surgical authorization.",
    target_words: ["cholecystectomy", "decisional", "insufflation", "analgesia"],
    target_vocabulary: [
      { word: "cholecystectomy", phonetic: "/ˌkɒl.ɪ.sɪsˈtek.tə.mi/", turkish_meaning: "kolesistektomi (safra kesesi ameliyatı)", context_sentence: "Laparoscopic cholecystectomy is the gold standard for symptomatic gallstones." },
      { word: "decisional", phonetic: "/dɪˈsɪʒ.ən.əl/", turkish_meaning: "karar verme yetisine ait", context_sentence: "Valid consent requires verifying the patient's decisional capacity." },
      { word: "insufflation", phonetic: "/ˌɪn.səˈfleɪ.ʃən/", turkish_meaning: "gaz verme, şişirme (periton boşluğunu CO2 ile)", context_sentence: "Carbon dioxide insufflation creates working space for laparoscopic instruments." },
      { word: "analgesia", phonetic: "/ˌæn.əlˈdʒiː.zi.ə/", turkish_meaning: "analjezi, ağrı kesici tedavi", context_sentence: "The surgeon discussed multimodal postoperative analgesia options." },
    ],
    comprehension_questions: [
      {
        question: "What medical condition prompted Susan's scheduled laparoscopic cholecystectomy?",
        options: ["A fractured femur", "Symptomatic gallstones (cholelithiasis) causing acute biliary colic", "Kidney stones", "Pneumonia"],
        correct_answer_index: 1,
        explanation: "Susan had recurrent biliary colic pain caused by symptomatic gallstones blocking the cystic duct."
      },
      {
        question: "What gas is used to insufflate the abdominal cavity during laparoscopic surgery?",
        options: ["Pure oxygen", "Carbon dioxide (CO2)", "Helium", "Nitrous oxide"],
        correct_answer_index: 1,
        explanation: "Carbon dioxide is routinely used to insufflate the peritoneum, creating a clear visual operative field."
      },
      {
        question: "What specific rare surgical risk was disclosed regarding the biliary tract?",
        options: ["Permanent blindness", "A risk of common bile duct injury that might require open laparotomy", "Loss of memory", "Immediate weight gain"],
        correct_answer_index: 1,
        explanation: "Dr. Lin specifically disclosed the risk of common bile duct injury that could necessitate open surgery."
      },
    ],
  },
  {
    id: "med-09-antibiotic-resistance-antibiogram",
    title: "Multidrug-Resistant Bacterial Infection and Antibiogram",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
    topic: "Antibiyotik Direnci ve Antibiyogram",
    desc: "Hastanede gelişen dirençli Klebsiella pnömonisi vakasında antibiyogram sonuçlarına göre hedefe yönelik tedavi.",
    content: "On the surgical step-down ward, Infectious Disease Specialist Dr. Tariq Mansoor reviews microbiology culture reports for a sixty-eight-year-old postoperative patient who developed high swinging fevers, purulent sputum, and productive coughing five days after abdominal surgery. A bedside chest radiograph revealed dense consolidation in the right lower lung lobe, confirming hospital-acquired pneumonia (HAP).\n\nInitial empiric broad-spectrum antibiotic therapy with intravenous ceftriaxone had failed to produce clinical improvement; the patient remained tachypneic with escalating inflammatory markers (C-reactive protein exceeding two hundred milligrams per liter). The clinical microbiology laboratory issued the definitive automated blood and sputum culture analysis, identifying heavy growth of extended-spectrum beta-lactamase (ESBL)-producing Klebsiella pneumoniae.\n\nDr. Mansoor scrutinized the accompanying disk diffusion antibiogram, which details the bacterial isolate's minimum inhibitory concentrations (MIC) across various antimicrobial classes. The isolate demonstrated total resistance to penicillins, all cephalosporin generations, and fluoroquinolones due to plasmid-mediated enzyme hydrolysis. Fortunately, the antibiogram demonstrated sensitive susceptibility to carbapenems and colistin. Dr. Mansoor immediately de-escalated therapy by discontinuing ceftriaxone and initiating intravenous meropenem at one gram every eight hours infused over three hours. Within seventy-two hours of targeted carbapenem therapy, the patient's fever defervesced, leukocytosis resolved, and oxygen saturation normalized on ambient room air.",
    target_words: ["consolidation", "antibiogram", "susceptibility", "defervesced"],
    target_vocabulary: [
      { word: "consolidation", phonetic: "/kənˌsɒl.ɪˈdeɪ.ʃən/", turkish_meaning: "konsolidasyon (akciğerde iltihaplı doku sertleşmesi)", context_sentence: "Chest imaging demonstrated dense consolidation in the lower lung lobe." },
      { word: "antibiogram", phonetic: "/ˌæn.ti.baɪˈɒɡ.ræm/", turkish_meaning: "antibiyogram (bakteri antibiyotik duyarlılık tablosu)", context_sentence: "The laboratory antibiogram identified which antibiotics were effective." },
      { word: "susceptibility", phonetic: "/səˌsep.təˈbɪl.ə.ti/", turkish_meaning: "duyarlılık (antibiyotiğe hassasiyet)", context_sentence: "The bacterial isolate retained sensitive susceptibility to carbapenems." },
      { word: "defervesced", phonetic: "/ˌdiː.fɜːˈvesd/", turkish_meaning: "ateşi düştü, ateşin normale dönmesi", context_sentence: "The patient's high fever defervesced following targeted antibiotic therapy." },
    ],
    comprehension_questions: [
      {
        question: "What multidrug-resistant pathogen was isolated from the patient's sputum culture?",
        options: ["Streptococcus pneumoniae", "Extended-spectrum beta-lactamase (ESBL)-producing Klebsiella pneumoniae", "Influenza B virus", "Common yeast"],
        correct_answer_index: 1,
        explanation: "Microbiology confirmed the presence of an ESBL-producing strain of Klebsiella pneumoniae."
      },
      {
        question: "Why was the initial ceftriaxone antibiotic therapy ineffective?",
        options: ["The patient threw the pills away", "The ESBL enzyme produced by the bacteria hydrolyzes and destroys cephalosporin antibiotics", "The dose was given only once a year", "Ceftriaxone is a vitamin"],
        correct_answer_index: 1,
        explanation: "ESBL enzymes inactivate penicillins and cephalosporins, conferring drug resistance."
      },
      {
        question: "What targeted antibiotic did Dr. Mansoor prescribe based on the antibiogram susceptibility results?",
        options: ["Aspirin", "Intravenous meropenem (a carbapenem)", "Oral penicillin", "Cough syrup"],
        correct_answer_index: 1,
        explanation: "Meropenem demonstrated clear sensitivity on the antibiogram and successfully cleared the infection."
      },
    ],
  },
  {
    id: "med-10-cardiac-arrhythmia-workup",
    title: "Diagnostic Workup of Paroxysmal Atrial Fibrillation",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    topic: "Kardiyak Aritmi Teşhis Süreci",
    desc: "Çarpıntı ve baş dönmesi şikayetiyle başvuran hastada Holter monitörizasyonuyla atriyal fibrilasyon ve inme risk skoru.",
    content: "Sixty-six-year-old retired civil engineer George presents to the cardiology clinic describing episodic sensations of fluttering palpitations in his chest, accompanied by lightheadedness and mild exertional dyspnea over the past four weeks. A standard twelve-lead resting electrocardiogram (ECG) performed in the clinic demonstrates normal sinus rhythm with a heart rate of sixty-eight beats per minute and no acute ischemic ST-segment changes.\n\nSuspecting paroxysmal (intermittent) cardiac arrhythmia, Cardiologist Dr. Helena Ward fits George with an ambulatory twenty-four-hour continuous Holter monitor and schedules a transthoracic echocardiogram. Two days later, analysis of the Holter telemetry tracing reveals three discrete episodes of paroxysmal atrial fibrillation (AFib), the longest lasting forty-two minutes. The ECG strip confirms the hallmark characteristics of atrial fibrillation: complete absence of coordinated P waves, replaced by fibrillatory baseline waves with an 'irregularly irregular' ventricular response rate peaking at one hundred and forty beats per minute.\n\nDr. Ward evaluates George's systemic thromboembolism risk utilizing the validated CHA2DS2-VASc scoring algorithm. With points awarded for age sixty-six and underlying hypertension, George calculates a score of 2, indicating an elevated annual risk of ischemic stroke caused by cardiogenic thrombi forming within the fibrillating left atrial appendage. Dr. Ward initiates direct oral anticoagulant (DOAC) therapy with apixaban to prevent stroke, combined with a low-dose cardioselective beta-blocker (metoprolol) for ventricular rate control, comprehensively addressing the arrhythmia.",
    target_words: ["palpitations", "ambulatory", "paroxysmal", "thrombi"],
    target_vocabulary: [
      { word: "palpitations", phonetic: "/ˌpæl.pɪˈteɪ.ʃənz/", turkish_meaning: "çarpıntı (kalbin hızlı veya düzensiz atması hissi)", context_sentence: "He experienced episodic palpitations and exertional shortness of breath." },
      { word: "ambulatory", phonetic: "/ˈæm.bjə.lə.tər.i/", turkish_meaning: "ayaktan, taşınabilir (Holter cihazı)", context_sentence: "An ambulatory Holter monitor tracked electrical activity during daily routines." },
      { word: "paroxysmal", phonetic: "/ˌpær.əkˈsɪz.məl/", turkish_meaning: "paroksismal, nöbetler halinde gelip geçen", context_sentence: "Paroxysmal atrial fibrillation begins and terminates spontaneously." },
      { word: "thrombi", phonetic: "/ˈθrɒm.baɪ/", turkish_meaning: "kan pıhtıları (trombozlar)", context_sentence: "Stagnant blood in the left atrium promotes the formation of mural thrombi." },
    ],
    comprehension_questions: [
      {
        question: "Why was George's initial 12-lead ECG in the clinic normal despite his symptoms?",
        options: ["He made up his symptoms", "The arrhythmia is paroxysmal, meaning it occurs intermittently rather than continuously", "The ECG machine was broken", "Only older patients have abnormal ECGs"],
        correct_answer_index: 1,
        explanation: "Paroxysmal atrial fibrillation comes in episodes, leaving the resting ECG normal between events."
      },
      {
        question: "What characteristic ECG pattern confirms a diagnosis of atrial fibrillation?",
        options: ["Perfect tall spikes every second", "Complete absence of P waves with an 'irregularly irregular' ventricular rhythm", "A completely flat line", "Slow regular heartbeat"],
        correct_answer_index: 1,
        explanation: "AFib is characterized on ECG by missing P waves and an irregularly irregular QRS rhythm."
      },
      {
        question: "Why did Dr. Ward prescribe an oral anticoagulant (DOAC) like apixaban?",
        options: ["To cure stomach ulcers", "To prevent stroke caused by blood clots forming in the fibrillating left atrium", "To lower body temperature", "To improve eyesight"],
        correct_answer_index: 1,
        explanation: "Anticoagulants prevent left atrial appendage thrombi from traveling to the brain and causing strokes."
      },
    ],
  },

  // ==========================================
  // LEVEL C (C1-C2, ~330-380 kelime, 5-6 dk)
  // ==========================================
  {
    id: "med-11-systemic-lupus-differential",
    title: "Systemic Lupus Erythematosus: A Complex Diagnostic Dilemma",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    topic: "Sistemik Lupus ve Ayırıcı Tanı",
    desc: "Genç kadında eklem ağrısı, malar döküntü ve nefrit ile seyreden sistemik lupus eritematozus (SLE) ayırıcı tanısı.",
    content: "In autoimmune rheumatology, Systemic Lupus Erythematosus (SLE) represents the quintessential diagnostic chameleon, capable of mimicking infectious, hematologic, and neoplastic pathologies across diverse organ systems. A twenty-nine-year-old female software developer was admitted to the tertiary referral hospital with a three-month history of debilitating fatigue, migratory polyarthralgia affecting bilateral metacarpophalangeal joints, pleuritic chest pain, and an erythematous maculopapular rash distributed across the nasal bridge and malar eminences, conspicuously sparing the nasolabial folds.\n\nRheumatologist Dr. Catherine Vance led the comprehensive diagnostic workup to establish an unequivocal differential diagnosis, systematically ruling out adult-onset Still's disease, acute viral parvo-B19 infection, subacute bacterial endocarditis, and mixed connective tissue disease. Initial laboratory profiling uncovered severe leukopenia (white blood cell count of 2.4 x 10^9/L), normocytic normochromic anemia, and an elevated erythrocyte sedimentation rate (ESR of 88 mm/hr) alongside an incongruously normal serum procalcitonin, pointing away from bacterial sepsis.\n\nImmunological serology revealed a homogeneous antinuclear antibody (ANA) titer exceeding 1:1,280 on HEp-2 immunofluorescence. Crucially, high-specificity autoimmune panels confirmed markedly elevated anti-double-stranded DNA (anti-dsDNA) antibodies at four hundred and fifty International Units alongside severe hypocomplementemia—with serum C3 and C4 levels consumed down to less than half of normal physiological reference intervals. Concurrently, a twenty-four-hour urine protein quantification demonstrated 1.8 grams of proteinuria, accompanied by dysmorphic red blood cells on microscopic sediment analysis.\n\nA percutaneous ultrasound-guided renal core biopsy was immediately performed, revealing Class IV diffuse proliferative lupus nephritis under the International Society of Nephrology criteria, characterized by subendothelial immune complex 'wire-loop' lesions on light microscopy. Applying the validated 2019 EULAR/ACR Classification Criteria, the patient scored twenty-six points (vastly exceeding the ten-point diagnostic threshold). Dr. Vance immediately initiated induction immunosuppressive therapy consisting of high-dose intravenous methylprednisolone pulse therapy followed by oral mycophenolate mofetil and hydroxychloroquine, arresting renal microvascular damage and averting catastrophic end-stage renal failure.",
    target_words: ["polyarthralgia", "hypocomplementemia", "proteinuria", "immunosuppressive"],
    target_vocabulary: [
      { word: "polyarthralgia", phonetic: "/ˌpɒl.i.ɑːˈθræl.dʒi.ə/", turkish_meaning: "poliartralji (birden çok eklemde ağrı)", context_sentence: "She presented with migratory polyarthralgia in bilateral finger joints." },
      { word: "hypocomplementemia", phonetic: "/ˌhaɪ.pəʊˌkɒm.plɪ.menˈtiː.mi.ə/", turkish_meaning: "hipokomplemantemi (kanda C3 ve C4 kompleman proteinlerinin düşmesi)", context_sentence: "Active lupus nephritis consumes complements, causing hypocomplementemia." },
      { word: "proteinuria", phonetic: "/ˌprəʊ.tɪˈnjuː.ri.ə/", turkish_meaning: "proteinüri (idrarda aşırı protein kaçağı)", context_sentence: "Significant proteinuria indicated glomerular capillary membrane breakdown." },
      { word: "immunosuppressive", phonetic: "/ˌɪm.jə.nəʊ.səˈpres.ɪv/", turkish_meaning: "immünsüpresif, bağışıklık baskılayıcı", context_sentence: "Induction with immunosuppressive agents prevented irreversible renal damage." },
    ],
    comprehension_questions: [
      {
        question: "What distinct facial rash distribution is characteristic of Systemic Lupus Erythematosus?",
        options: ["A rash covering only the chin", "A malar 'butterfly' rash across the nasal bridge and cheeks, sparing the nasolabial folds", "Tiny blisters behind the ears", "Yellow spots on the forehead"],
        correct_answer_index: 1,
        explanation: "The classic malar butterfly rash spans the cheeks and nose while sparing the nasolabial folds."
      },
      {
        question: "What specific laboratory finding indicated profound consumption of complement proteins during active lupus?",
        options: ["High blood sugar", "Severe hypocomplementemia with critically reduced C3 and C4 levels", "Low sodium", "Elevated vitamin D"],
        correct_answer_index: 1,
        explanation: "Active immune complex deposition consumes complement components, driving C3 and C4 levels downward."
      },
      {
        question: "What histological diagnosis was confirmed by the percutaneous renal core biopsy?",
        options: ["Normal kidney tissue", "Class IV diffuse proliferative lupus nephritis", "Acute bacterial pyelonephritis", "Benign kidney cysts"],
        correct_answer_index: 1,
        explanation: "Renal biopsy confirmed Class IV diffuse proliferative lupus nephritis with wire-loop immune complexes."
      },
    ],
  },
  {
    id: "med-12-icu-septic-shock-protocol",
    title: "Hemodynamic Optimization in Refractory Septic Shock",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    topic: "Yoğun Bakımda Septik Şok Protokolü",
    desc: "Kritik bakımda vazopressör infüzyonu, invaziv arteriyel monitörizasyon ve laktat klirensi yönetimi.",
    content: "In the multidisciplinary Intensive Care Unit (ICU), Intensivist Dr. Julian Rivera managed a fifty-eight-year-old male admitted with refractory septic shock secondary to acute perforated diverticulitis with diffuse fecal peritonitis. Despite urgent exploratory laparotomy, Hartmann’s resection, and four liters of balanced crystalloid resuscitation administered within six hours, the patient exhibited profound distributive vasodilation with unyielding arterial hypotension.\n\nHis clinical parameters reflected acute circulatory collapse: mean arterial pressure (MAP) hovered at fifty-two mmHg, cardiac index was hyperdynamic at 4.5 L/min/m^2, systemic vascular resistance (SVR) had plummeted to four hundred and eighty dynes·sec/cm^5, and arterial blood gas analysis demonstrated uncompensated lactic acidosis with a serum lactate surging to 6.8 mmol/L and an arterial pH of 7.18. Central venous oxygen saturation (ScvO2) stood at 62%, and urine output fell below ten milliliters per hour, signaling severe acute tubular necrosis.\n\nDr. Rivera immediately instituted advanced hemodynamic resuscitation. Through a triple-lumen internal jugular central venous catheter, norepinephrine was titrated aggressively up to 0.4 mcg/kg/min as the first-line vasopressor to restore vascular tone via alpha-1 adrenergic stimulation. Because hypotension persisted despite high-dose catecholamines, Dr. Rivera initiated a secondary, non-adrenergic vasopressor: continuous fixed-dose vasopressin at 0.03 units/min via V1a receptor stimulation, mitigating catecholamine tachyphylaxis and blunting adrenergic desensitization.\n\nTo guide fluid responsiveness and prevent iatrogenic pulmonary edema, Dr. Rivera eschewed static central venous pressure (CVP) metrics in favor of functional dynamic parameters: stroke volume variation (SVV) and pulse pressure variation (PPV) monitored continuously via pulse contour cardiac output telemetry. Bedside echocardiography revealed hyperkinetic left ventricular systolic function with an underfilled end-diastolic volume. Over the subsequent twelve hours of multimodal vasopressor therapy, hydrocortisone stress-dose steroid coverage, and targeted continuous renal replacement therapy (CRRT), the patient achieved a steady lactate clearance exceeding twenty percent every two hours, restoring microvascular perfusion and averting multiple organ dysfunction syndrome.",
    target_words: ["refractory", "distributive", "tachyphylaxis", "iatrogenic"],
    target_vocabulary: [
      { word: "refractory", phonetic: "/rɪˈfræk.tər.i/", turkish_meaning: "dirençli, tedaviye yanıt vermeyen", context_sentence: "Refractory septic shock persisted despite extensive fluid loading." },
      { word: "distributive", phonetic: "/dɪˈstrɪb.jə.tɪv/", turkish_meaning: "dağıtımsal (vazodilatasyona bağlı şok türü)", context_sentence: "Sepsis induces severe distributive shock with low vascular tone." },
      { word: "tachyphylaxis", phonetic: "/ˌtæk.ɪ.fɪˈlæk.sɪs/", turkish_meaning: "taşifilaksi (ilaca karşı hızla gelişen duyarsızlık)", context_sentence: "Adding vasopressin prevents catecholamine tachyphylaxis." },
      { word: "iatrogenic", phonetic: "/aɪˌæt.rəˈdʒen.ɪk/", turkish_meaning: "iyatrojenik (tıbbi müdahalenin yol açtığı)", context_sentence: "Dynamic stroke volume metrics prevent iatrogenic volume overload." },
    ],
    comprehension_questions: [
      {
        question: "What is the primary hemodynamic hallmark of septic distributive shock observed in this patient?",
        options: ["Extreme vasoconstriction with high blood pressure", "Profound vasodilation with severely reduced systemic vascular resistance (SVR)", "Complete freezing of the heart muscle", "Excessive red blood cell counts"],
        correct_answer_index: 1,
        explanation: "Septic shock features widespread vasodilation with drastically lowered systemic vascular resistance (SVR)."
      },
      {
        question: "What first-line vasopressor medication was titrated to restore vascular tone via alpha-1 receptors?",
        options: ["Insulin", "Norepinephrine", "Aspirin", "Heparin"],
        correct_answer_index: 1,
        explanation: "Norepinephrine is the international first-line vasopressor of choice for septic shock."
      },
      {
        question: "Why did Dr. Rivera add fixed-dose vasopressin to the high-dose norepinephrine infusion?",
        options: ["To lower body temperature", "To stimulate V1a receptors and reduce catecholamine tachyphylaxis", "To put the patient to sleep", "Because norepinephrine expired"],
        correct_answer_index: 1,
        explanation: "Vasopressin acts through non-adrenergic V1a pathways to restore arterial tone without overusing catecholamines."
      },
    ],
  },
  {
    id: "med-13-alzheimers-monoclonal-trial",
    title: "Neurodegenerative Biomarkers and Phase 3 Clinical Trial Ethics",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    topic: "Alzheimer Biyobelirteçleri ve Klinik Deney Etiği",
    desc: "Erken evre Alzheimer tedavisinde amiloid hedefli monoklonal antikorlar, ARIA yan etkileri ve klinik araştırma etiği.",
    content: "At the University Memory and Aging Center, Principal Investigator Dr. Sophia Chen directed a randomized, double-blind, placebo-controlled Phase 3 clinical trial evaluating a novel humanized IgG1 monoclonal antibody designed to clear neurotoxic amyloid-beta plaques in individuals with prodromal and mild Alzheimer’s disease. In neurodegenerative translational medicine, rigorous participant stratification requires relying on fluid and neuroimaging biomarkers rather than subjective cognitive scoring alone.\n\nCandidate screening utilized amyloid positron emission tomography (PET) using the tracer Pittsburgh Compound B (PiB), coupled with lumbar puncture cerebrospinal fluid (CSF) analysis demonstrating pathognomonic biomarkers: depressed beta-amyloid 42/40 ratios and elevated phosphorylated tau-181 (p-tau181). Furthermore, baseline apolipoprotein E (APOE) genotyping was conducted. Patients carrying the homozygous APOE-epsilon-4 allele face substantially elevated baseline risks of developing amyloid-related imaging abnormalities (ARIA), a potentially devastating drug-related adverse effect.\n\nDuring routine month-six safety surveillance utilizing 3-Tesla magnetic resonance imaging (MRI), the neuroradiology panel detected asymptomatic ARIA-E (sulcal cerebral vasogenic edema) alongside microscopic focal petechial hemorrhages (ARIA-H) in eleven percent of the active treatment cohort. This safety signal immediately activated complex research bioethics dilemmas. The trial's independent Data Safety Monitoring Board (DSMB) convened to deliberate whether patient safety demanded trial termination or protocol modification.\n\nDr. Chen advocated for an ethical protocol amendment: rather than abandoning a drug showing a twenty-seven percent reduction in clinical cognitive decline on the CDR-Sum of Boxes scale, the protocol mandated monthly MRI screening for APOE-epsilon-4 carriers, temporarily suspending infusions whenever ARIA lesions emerged until radiographic resolution occurred. Furthermore, an updated informed consent addendum was issued to all active trial participants, clearly elucidating the newly quantified hemorrhagic risks, balancing therapeutic scientific innovation against non-maleficence and absolute respect for participant autonomy.",
    target_words: ["monoclonal", "pathognomonic", "genotyping", "non-maleficence"],
    target_vocabulary: [
      { word: "monoclonal", phonetic: "/ˌmɒn.əˈkləʊ.nəl/", turkish_meaning: "monoklonal (tek bir klondan türeyen antikor)", context_sentence: "Monoclonal antibodies target specific amyloid-beta protein epitopes." },
      { word: "pathognomonic", phonetic: "/pəˌθɒɡ.nəˈmɒn.ɪk/", turkish_meaning: "patognomonik (bir hastalığa özgü, teşhis koydurucu)", context_sentence: "Low CSF beta-amyloid ratios are pathognomonic for early Alzheimer's." },
      { word: "genotyping", phonetic: "/ˈdʒiː.nəʊˌtaɪ.pɪŋ/", turkish_meaning: "genotiplendirme (genetik allellerin analizi)", context_sentence: "APOE genotyping stratified patient susceptibility to vascular edema." },
      { word: "non-maleficence", phonetic: "/ˌnɒn.məˈlef.ɪ.səns/", turkish_meaning: "zarar vermeme ilkesi (tıp etiğinde pratik)", context_sentence: "The DSMB upheld non-maleficence by pausing infusions upon adverse imaging." },
    ],
    comprehension_questions: [
      {
        question: "What specific neuroimaging and fluid biomarkers confirmed patient eligibility for the Alzheimer's trial?",
        options: ["A simple vision test", "Amyloid PET imaging, depressed CSF beta-amyloid 42/40 ratios, and elevated p-tau181", "Blood cholesterol levels", "Normal body temperature"],
        correct_answer_index: 1,
        explanation: "Inclusion required amyloid PET confirmation and CSF biomarkers (depressed A-beta 42/40 and elevated p-tau)."
      },
      {
        question: "What adverse drug effect detected on 3T MRI triggered the clinical safety review?",
        options: ["Loss of dental enamel", "Amyloid-related imaging abnormalities (ARIA) involving vasogenic edema and petechial hemorrhages", "Broken finger bones", "Severe stomach ulcers"],
        correct_answer_index: 1,
        explanation: "Surveillance MRI detected ARIA-E (brain edema) and ARIA-H (microhemorrhages) associated with plaque clearance."
      },
      {
        question: "How did Dr. Chen and the DSMB ethically resolve the trial safety signal?",
        options: ["They concealed the MRI findings from participants", "They instituted monthly safety MRI monitoring, temporary dosing pauses, and an updated informed consent addendum", "They stopped the trial permanently and threw away the data", "They doubled the drug dose"],
        correct_answer_index: 1,
        explanation: "The protocol was ethically amended with mandatory surveillance MRIs, dose holds, and re-consenting."
      },
    ],
  },
  {
    id: "med-14-renal-allograft-rejection",
    title: "Acute Allograft Rejection in Renal Transplantation",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    topic: "Böbrek Nakli ve Doku Reddi",
    desc: "Böbrek nakli sonrasında donör spesifik antikorlar ve C4d pozitif antikor aracılı akut allogreft reddi (ABMR).",
    content: "Four months following a living-donor kidney transplantation for end-stage renal disease, a thirty-eight-year-old male recipient presented to the transplant nephrology clinic with painless graft swelling, new-onset hypertension (165/100 mmHg), and oliguria. Routine biochemical monitoring revealed an acute deterioration in renal allograft function: serum creatinine had spiked precipitously from a stable baseline of 1.1 mg/dL to 3.4 mg/dL over a twelve-day period, accompanied by new-onset nephrotic-range proteinuria.\n\nTransplant Nephrologist Dr. Robert Sterling reviewed the patient's therapeutic drug monitoring logs. Trough whole-blood levels of tacrolimus (a calcineurin inhibitor) had dropped to a subtherapeutic 3.2 ng/mL (target: 8–10 ng/mL) because the patient had inadvertently omitted evening doses following a dental procedure. Dr. Sterling immediately ordered donor-specific anti-HLA antibody (DSA) testing via Luminex single-antigen bead assay, which detected de novo high-titer IgG antibodies directed against the donor’s HLA-DQ7 antigen, registering mean fluorescence intensity (MFI) values exceeding twelve thousand.\n\nAn urgent percutaneous ultrasound-guided needle core biopsy of the renal allograft was executed. Histopathological examination using the international Banff classification criteria revealed acute antibody-mediated rejection (ABMR): severe microvascular inflammation with extensive peritubular capillaritis, glomerulitis, and diffuse circumferential C4d complement split-product deposition along peritubular capillary basements demonstrated by immunofluorescence microscopy.\n\nDr. Sterling initiated an aggressive multimodal desensitization protocol to rescue the allograft. The patient underwent six daily sessions of therapeutic plasma exchange (plasmapheresis) to mechanically remove circulating donor-specific antibodies, followed by high-dose intravenous immunoglobulin (IVIG, 2 g/kg) to neutralize residual antibodies and downregulate complement activation. Concurrently, a single dose of rituximab (an anti-CD20 monoclonal antibody) was infused to deplete memory B-cell clones in lymphoid germinal centers. Within two weeks, serum creatinine stabilized at 1.4 mg/dL, preserving the precious allograft.",
    target_words: ["allograft", "subtherapeutic", "capillaritis", "plasmapheresis"],
    target_vocabulary: [
      { word: "allograft", phonetic: "/ˈæl.ə.ɡrɑːft/", turkish_meaning: "allogreft (aynı türden başka bir bireyden alınan nakil organı)", context_sentence: "The renal allograft exhibited acute cellular and humoral rejection." },
      { word: "subtherapeutic", phonetic: "/ˌsʌb.θer.əˈpjuː.tɪk/", turkish_meaning: "subterapötik (tedavi edici dozun altında kalan)", context_sentence: "Subtherapeutic immunosuppressant levels enabled donor antibody formation." },
      { word: "capillaritis", phonetic: "/ˌkæp.ɪ.ləˈraɪ.tɪs/", turkish_meaning: "kapillarit (kılcal damar içi iltihabı)", context_sentence: "Peritubular capillaritis is a hallmark histological feature of ABMR." },
      { word: "plasmapheresis", phonetic: "/ˌplæz.mə.fəˈriː.sɪs/", turkish_meaning: "plazmaferez (antikorları kandan temizleyen plazma değişimi)", context_sentence: "Therapeutic plasmapheresis cleared high-titer donor antibodies from circulation." },
    ],
    comprehension_questions: [
      {
        question: "What medication error triggered the development of acute rejection in the transplant recipient?",
        options: ["Taking ten times the prescribed dose", "Omitting evening doses of tacrolimus, causing drug levels to drop to subtherapeutic levels", "Drinking too much orange juice", "Taking vitamins with breakfast"],
        correct_answer_index: 1,
        explanation: "Missed tacrolimus doses led to subtherapeutic immunosuppression, permitting anti-HLA antibody development."
      },
      {
        question: "What histopathological marker demonstrated by immunofluorescence confirmed antibody-mediated rejection (ABMR)?",
        options: ["Diffuse circumferential C4d complement deposition along peritubular capillaries", "Normal smooth muscle fibers", "High calcium deposits", "Absence of white blood cells"],
        correct_answer_index: 0,
        explanation: "C4d complement deposition along peritubular capillaries is the pathognomonic marker for ABMR under Banff criteria."
      },
      {
        question: "What medical interventions were executed to rescue the failing renal allograft?",
        options: ["Drinking tap water and bed rest", "Plasmapheresis (plasma exchange), high-dose IVIG, and rituximab B-cell depletion", "Immediate surgical removal of the kidney", "Chemotherapy radiation"],
        correct_answer_index: 1,
        explanation: "The desensitization rescue protocol utilized plasmapheresis, IVIG, and rituximab to eliminate antibodies."
      },
    ],
  },
  {
    id: "med-15-bioethics-autonomy-end-of-life",
    title: "Bioethics: Patient Autonomy and the Withdrawal of Life-Sustaining Treatment",
    category: "medical_clinical",
    categoryName: "Tıp & Sağlık (OET)",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    topic: "Tıp Etiği: Özerklik ve Hayat Desteği",
    desc: "Ağır hipoksik beyin hasarı olan hastada önceden hazırlanmış yaşam vasiyeti (living will) ve hayat desteğinin sonlandırılması.",
    content: "In modern intensive care medicine, few clinical encounters present as agonizing an ethical challenge as reconciling the bioethical principle of non-maleficence against the sanctity of life when managing surrogate decisions to withdraw mechanical ventilation. A seventy-six-year-old retired judge was admitted to the neuro-intensive care unit following a catastrophic out-of-hospital cardiac arrest with a prolonged forty-minute downtime before return of spontaneous circulation (ROSC).\n\nAfter five days of targeted temperature management, neuro-prognostication confirmed devastating, irreversible global hypoxic-ischemic encephalopathy. Continuous electroencephalography (EEG) demonstrated persistent generalized suppression with periodic epileptiform discharges unresponsive to antiepileptic infusions. Somatosensory evoked potentials (SSEP) showed bilateral absence of cortical N20 responses, and diffusion-weighted MRI revealed diffuse laminar cortical necrosis across both cerebral hemispheres. The clinical consensus established that neurological recovery was zero.\n\nThe patient had previously executed a legally valid Advance Healthcare Directive (Living Will) alongside a Durable Power of Attorney for Healthcare designating his daughter as surrogate decision-maker. The directive explicitly stated: 'If I develop an incurable or irreversible brain injury with no reasonable hope of regaining cognitive capacity, I direct that life-sustaining procedures—including mechanical ventilation, artificial enteral hydration, and vasopressors—be withheld or withdrawn.'\n\nHowever, the patient's estranged son arrived from overseas, threatening litigation and demanding that mechanical ventilation continue indefinitely. Hospital Clinical Ethicist Dr. Alistair Finch convened a multidisciplinary ethics consultation. Dr. Finch explained that in medical jurisprudence and clinical ethics, surrogate decision-makers are bound by the 'substituted judgment' standard—meaning they must articulate what the patient would decide for himself, rather than their own emotional preferences.\n\nBecause the written directive provided clear, convincing evidence of the patient's autonomous prior values, respecting patient self-determination legally and ethically superseded family dissension. Under Dr. Finch's compassionate guidance, the care team transitioned goals of care from curative intervention to comprehensive palliative comfort care: administering continuous intravenous morphine and midazolam infusions to preempt terminal dyspnea, respectfully extubating the patient in the presence of his family, ensuring a dignified peaceful passage.",
    target_words: ["prognostication", "somatosensory", "surrogate", "palliative"],
    target_vocabulary: [
      { word: "prognostication", phonetic: "/prɒɡˌnɒs.tɪˈkeɪ.ʃən/", turkish_meaning: "prognoz tahmini, hastalığın seyrini öngörme", context_sentence: "Multimodal neuro-prognostication established irreversible brain damage." },
      { word: "somatosensory", phonetic: "/səʊˌmæt.əʊˈsen.sər.i/", turkish_meaning: "somatosensöriyel (duyusal uyarılmış potansiyeller)", context_sentence: "Bilateral loss of cortical N20 somatosensory waves indicated cortical death." },
      { word: "surrogate", phonetic: "/ˈsʌr.ə.ɡət/", turkish_meaning: "vekil karar verici (hasta adına karar veren vasi)", context_sentence: "The daughter acted as the designated surrogate healthcare decision-maker." },
      { word: "palliative", phonetic: "/ˈpæl.i.ə.tɪv/", turkish_meaning: "palyatif, rahatlatıcı bakım", context_sentence: "The clinical team transitioned to palliative comfort care with morphine." },
    ],
    comprehension_questions: [
      {
        question: "What neurophysiological test result confirmed irreversible cerebral cortical devastation?",
        options: ["A normal vision exam", "Bilateral absence of cortical N20 somatosensory evoked potentials and diffuse cortical necrosis on MRI", "A mild headache", "A slight sneeze"],
        correct_answer_index: 1,
        explanation: "Bilateral absent N20 SSEP responses and MRI cortical necrosis prove irreversible hypoxic brain death."
      },
      {
        question: "What legal standard must healthcare surrogate decision-makers uphold when interpreting directives?",
        options: ["Their own personal religious beliefs", "The substituted judgment standard (deciding what the patient would have chosen for himself)", "Whatever is cheapest for the insurance company", "A public family vote"],
        correct_answer_index: 1,
        explanation: "Substituted judgment requires the surrogate to faithfully reflect the patient's autonomous prior wishes."
      },
      {
        question: "How did the medical team manage the final transition to end-of-life care?",
        options: ["By abruptly leaving the room", "By transitioning to palliative comfort care with intravenous morphine infusions to ensure a dignified, peaceful passage", "By transferring the patient to a prison", "By restarting electric shocks"],
        correct_answer_index: 1,
        explanation: "The team provided palliative comfort measures and analgesia to ensure a peaceful, pain-free extubation."
      },
    ],
  },
];

export const MEDICAL_STORIES = medicalStories;
export const MEDICAL_CLINICAL_STORIES = medicalStories;
