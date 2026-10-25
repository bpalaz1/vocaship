"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Plus,
  FolderPlus,
  FolderTree,
  LayoutGrid,
  List as ListIcon,
  Search,
  Sparkles,
  Share2,
  Trash2,
  Play,
  Coins,
  Languages,
  RotateCw,
  Check,
  AlertCircle,
  Volume2,
  Folder,
  Layers,
  ChevronRight,
  BookOpen,
  Brain,
  GraduationCap,
  Gamepad2,
  ArrowRight,
  Clock,
  CheckCircle2,
  X,
  ChevronLeft,
  Flame,
  Award,
  Zap,
  Bookmark,
  FileText,
  Swords,
  Crown,
  ShoppingBag,
  Trophy
} from "lucide-react";
import ShareModal from "./components/ShareModal";
import WeakSpotRecoveryModal from "./components/WeakSpotRecoveryModal";
import CreateFolderModal from "./components/CreateFolderModal";
import AddWordModal from "./components/AddWordModal";
import { useTranslation } from "./context/LanguageContext";
import { useExperience } from "./context/ExperienceContext";
import { API_BASE } from "./config";

export interface ShowcaseCard {
  word: string;
  phonetic: string;
  meaning: string;
  exampleEn: string;
  exampleTr: string;
}

export interface ShowcaseDeck {
  id: string;
  title: string;
  category: string;
  badge: string;
  level: string;
  icon: string;
  description: string;
  cardCount: number;
  sampleWords: string[];
  cards: ShowcaseCard[];
}

export const SHOWCASE_DECKS: ShowcaseDeck[] = [
  {
    id: "showcase_yds",
    title: "YDS / YÖKDİL Kritik 500 Kelime",
    category: "Akademik & Sınav",
    badge: "YDS • YÖKDİL • C1",
    level: "Advanced (C1)",
    icon: "🎓",
    description: "ÖSYM ve akademik İngilizce sınavlarında en yüksek frekansta çıkan kritik akademik fiil ve sıfatlar.",
    cardCount: 500,
    sampleWords: ["resilient", "detrimental", "mitigate", "coherent", "ubiquitous"],
    cards: [
      {
        word: "resilient",
        phonetic: "/rɪˈzɪl.jənt/",
        meaning: "Dirençli, çabuk toparlanan, esnek",
        exampleEn: "The economy proved remarkably resilient following the unexpected financial turmoil.",
        exampleTr: "Ekonomi, beklenmedik finansal çalkantının ardından dikkat çekici derecede dirençli olduğunu kanıtladı.",
      },
      {
        word: "detrimental",
        phonetic: "/ˌdet.rɪˈmen.təl/",
        meaning: "Zararlı, hasar veren, yıpratıcı",
        exampleEn: "Chronic lack of sleep has a detrimental impact on cognitive retention and memory.",
        exampleTr: "Kronik uykusuzluğun bilişsel akılda tutma ve hafıza üzerinde zararlı bir etkisi vardır.",
      },
      {
        word: "mitigate",
        phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
        meaning: "Hafifletmek, yatıştırmak, azaltmak",
        exampleEn: "Strict environmental regulations were introduced to mitigate the adverse effects of global warming.",
        exampleTr: "Küresel ısınmanın olumsuz etkilerini hafifletmek için katı çevre düzenlemeleri getirildi.",
      },
      {
        word: "coherent",
        phonetic: "/kəʊˈhɪə.rənt/",
        meaning: "Tutarlı, mantıklı, anlaşılır",
        exampleEn: "The professor delivered a coherent lecture that clarified complex molecular mechanisms.",
        exampleTr: "Profesör, karmaşık moleküler mekanizmaları açıklığa kavuşturan tutarlı bir ders verdi.",
      },
      {
        word: "ubiquitous",
        phonetic: "/juːˈbɪk.wɪ.təs/",
        meaning: "Her yerde bulunan, yaygın, amme",
        exampleEn: "Smartphones and wireless connectivity have become ubiquitous throughout modern society.",
        exampleTr: "Akıllı telefonlar ve kablosuz bağlantı, modern toplum boyunca her yerde bulunur hale geldi.",
      },
      {
        word: "substantiate",
        phonetic: "/səbˈstæn.ʃi.eɪt/",
        meaning: "Kanıtlamak, doğrulamak, somutlaştırmak",
        exampleEn: "The investigative team could not substantiate the allegations without hard scientific evidence.",
        exampleTr: "Soruşturma ekibi, somut bilimsel kanıt olmadan iddiaları doğrulayamadı.",
      },
      {
        word: "arbitrary",
        phonetic: "/ˈɑː.bɪ.trər.i/",
        meaning: "Keyfi, rastgele, gerekçesiz",
        exampleEn: "The committee rejected the guidelines, arguing they were arbitrary and unfair.",
        exampleTr: "Komite, kuralların keyfi ve adaletsiz olduğunu savunarak kılavuzu reddetti.",
      },
      {
        word: "inevitable",
        phonetic: "/ɪnˈev.ɪ.tə.bəl/",
        meaning: "Kaçınılmaz, önüne geçilemez",
        exampleEn: "Given the rapid technological advancements, digital transformation is inevitable for organizations.",
        exampleTr: "Hızlı teknolojik gelişmeler göz önüne alındığında, dijital dönüşüm kuruluşlar için kaçınılmazdır.",
      },
      {
        word: "ambiguous",
        phonetic: "/æmˈbɪɡ.ju.əs/",
        meaning: "Muğlak, belirsiz, iki anlamlı",
        exampleEn: "The contract clause was deemed ambiguous and required legal clarification by the attorney.",
        exampleTr: "Sözleşme maddesi muğlak bulundu ve avukat tarafından yasal açıklama getirilmesini gerektirdi.",
      },
      {
        word: "plausible",
        phonetic: "/ˈplɔː.zə.bəl/",
        meaning: "Akla yatkın, makul, olası",
        exampleEn: "The astrophysicist presented a plausible explanation for the interstellar signal.",
        exampleTr: "Astrofizikçi, yıldızlararası sinyal için akla yatkın bir açıklama sundu.",
      },
      {
        word: "scrutinize",
        phonetic: "/ˈskruː.tɪ.naɪz/",
        meaning: "Ayrıntılı incelemek, denetlemek",
        exampleEn: "Independent regulators thoroughly scrutinize all clinical trials before market authorization.",
        exampleTr: "Bağımsız denetçiler, piyasa izni öncesinde tüm klinik deneyleri ayrıntılı biçimde inceler.",
      },
      {
        word: "adversity",
        phonetic: "/ədˈvɜː.sə.ti/",
        meaning: "Güçlük, felaket, sıkıntılı durum",
        exampleEn: "True resilience is demonstrated when maintaining optimism in the face of intense adversity.",
        exampleTr: "Gerçek direnç, yoğun güçlükler karşısında iyimserliği korurken sergilenir.",
      },
      {
        word: "prevalent",
        phonetic: "/ˈprev.əl.ənt/",
        meaning: "Yaygın, hakim, geçerli",
        exampleEn: "Sedentary lifestyle habits have become increasingly prevalent among remote tech workers.",
        exampleTr: "Hareketsiz yaşam alışkanlıkları, uzaktan çalışan bilişimciler arasında giderek daha yaygın hale geldi.",
      },
      {
        word: "concur",
        phonetic: "/kənˈkɜːr/",
        meaning: "Aynı fikirde olmak, hemfikir olmak",
        exampleEn: "All board members concurred with the strategic decision to expand into global markets.",
        exampleTr: "Tüm yönetim kurulu üyeleri, küresel pazarlara açılma stratejik kararıyla hemfikir oldu.",
      },
      {
        word: "facilitate",
        phonetic: "/fəˈsɪl.ɪ.teɪt/",
        meaning: "Kolaylaştırmak, olanak sağlamak",
        exampleEn: "Interactive digital tools facilitate active recall and enhance long-term memory formation.",
        exampleTr: "Etkileşimli dijital araçlar, aktif hatırlamayı kolaylaştırır ve uzun süreli hafıza oluşumunu artırır.",
      },
      {
        word: "discrepancy",
        phonetic: "/dɪˈskrep.ən.si/",
        meaning: "Uyuşmazlık, çelişki, fark",
        exampleEn: "The financial audit exposed an unexplained discrepancy between reported revenues and cash reserves.",
        exampleTr: "Mali denetim, raporlanan gelirler ile nakit rezervleri arasında açıklanamayan bir uyuşmazlığı ortaya çıkardı.",
      },
      {
        word: "elucidate",
        phonetic: "/iˈluː.sɪ.deɪt/ ",
        meaning: "Aydınlatmak, açıklığa kavuşturmak",
        exampleEn: "Further empirical studies are needed to elucidate how neuroplasticity evolves during language learning.",
        exampleTr: "Dil öğrenimi sırasında nöroplastisitenin nasıl evrildiğini aydınlatmak için daha fazla ampirik çalışmaya ihtiyaç vardır.",
      },
      {
        word: "volatile",
        phonetic: "/ˈvɒl.ə.taɪl/",
        meaning: "Değişken, istikrarsız, dalgalı",
        exampleEn: "Global commodity prices remained volatile amidst unexpected supply chain bottlenecks.",
        exampleTr: "Küresel emtia fiyatları, beklenmedik tedarik zinciri darboğazları arasında istikrarsız kalmaya devam etti.",
      },
      {
        word: "comprehend",
        phonetic: "/ˌkɒm.prɪˈhend/",
        meaning: "Kapsamlı kavramak, anlamak",
        exampleEn: "Advanced students quickly comprehend the nuanced grammatical rules of academic prose.",
        exampleTr: "İleri düzey öğrenciler, akademik metinlerin incelikli dilbilgisi kurallarını hızla kavrar.",
      },
      {
        word: "culminate",
        phonetic: "/ˈkʌl.mɪ.neɪt/",
        meaning: "Doruk noktasına ulaşmak, -ile sonuçlanmak",
        exampleEn: "Decades of dedicated linguistic research culminated in the launch of this intelligent platform.",
        exampleTr: "Onlarca yıllık adanmış dilbilim araştırması, bu akıllı platformun başlatılmasıyla doruk noktasına ulaştı.",
      },
    ],
  },
  {
    id: "showcase_business",
    title: "Business & Tech English",
    category: "Kariyer & İş Dünyası",
    badge: "Tech • Kurumsal • B2-C1",
    level: "Upper-Intermediate (B2-C1)",
    icon: "💼",
    description: "Silikon Vadisi, start-up ekosistemi ve kurumsal uluslararası toplantılarda kullanılan profesyonel terimler.",
    cardCount: 380,
    sampleWords: ["leverage", "bottleneck", "scalable", "agile", "paradigm"],
    cards: [
      {
        word: "leverage",
        phonetic: "/ˈliː.vər.ɪdʒ/",
        meaning: "Avantaj sağlamak, kaldıraç olarak kullanmak",
        exampleEn: "We must leverage our proprietary AI algorithms to gain a decisive competitive advantage.",
        exampleTr: "Pazarda belirleyici bir rekabet avantajı elde etmek için tescilli yapay zeka algoritmalarımızdan faydalanmalıyız.",
      },
      {
        word: "bottleneck",
        phonetic: "/ˈbɒt.əl.nek/",
        meaning: "Darboğaz, tıkanıklık noktası",
        exampleEn: "The legacy database server became the primary bottleneck during peak transaction hours.",
        exampleTr: "Eski veritabanı sunucusu, yoğun işlem saatlerinde birincil darboğaz haline geldi.",
      },
      {
        word: "scalable",
        phonetic: "/ˈskeɪ.lə.bəl/",
        meaning: "Ölçeklenebilir, büyütülebilir altyapı",
        exampleEn: "The founders designed a scalable cloud infrastructure capable of serving millions of concurrent users.",
        exampleTr: "Kurucular, milyonlarca eşzamanlı kullanıcıya hizmet verebilecek ölçeklenebilir bir bulut altyapısı tasarladı.",
      },
      {
        word: "agile",
        phonetic: "/ˈædʒ.aɪl/",
        meaning: "Çevik, hızlı uyum sağlayan metodoloji",
        exampleEn: "The software engineering team adopted agile sprints to rapidly iterate on user feedback.",
        exampleTr: "Yazılım mühendisliği ekibi, kullanıcı geri bildirimlerini hızla yinelemek için çevik sprintler benimsedi.",
      },
      {
        word: "paradigm",
        phonetic: "/ˈpær.ə.daɪm/",
        meaning: "Paradigma, temel model veya anlayış kalıbı",
        exampleEn: "Generative artificial intelligence represents a fundamental paradigm shift in modern computing.",
        exampleTr: "Üretken yapay zeka, modern bilgi işlemde temel bir paradigma değişimini temsil ediyor.",
      },
      {
        word: "synergy",
        phonetic: "/ˈsɪn.ə.dʒi/",
        meaning: "Sinerji, ortak güç, işbirliği",
        exampleEn: "The strategic merger generated immense synergy between the product and engineering teams.",
        exampleTr: "Stratejik birleşme, ürün ve mühendislik ekipleri arasında muazzam bir sinerji oluşturdu.",
      },
      {
        word: "pivot",
        phonetic: "/ˈpɪv.ət/",
        meaning: "Yön / strateji değiştirmek",
        exampleEn: "When consumer adoption stalled, the company decided to pivot toward enterprise solutions.",
        exampleTr: "Tüketici benimsemesi duraksayınca, şirket kurumsal çözümlere doğru yön değiştirmeye karar verdi.",
      },
      {
        word: "disruptive",
        phonetic: "/dɪsˈrʌp.tɪv/",
        meaning: "Ezber bozan, yıkıcı yenilik getiren",
        exampleEn: "Their disruptive subscription model fundamentally changed the economics of SaaS delivery.",
        exampleTr: "Onların ezber bozan abonelik modeli, SaaS dağıtımının ekonomik yapısını kökten değiştirdi.",
      },
      {
        word: "benchmark",
        phonetic: "/ˈbentʃ.mɑːk/",
        meaning: "Kıyaslama standardı, referans ölçütü",
        exampleEn: "Our customer satisfaction rating remains the industry benchmark across Europe.",
        exampleTr: "Müşteri memnuniyeti puanımız, Avrupa genelinde sektör kıyaslama ölçütü olmaya devam ediyor.",
      },
      {
        word: "bandwidth",
        phonetic: "/ˈbænd.wɪtθ/",
        meaning: "İş yükü kapasitesi, zaman/güç yeterliliği",
        exampleEn: "The core engineering team lacks sufficient bandwidth to tackle additional sprint tickets this week.",
        exampleTr: "Çekirdek mühendislik ekibinin bu hafta ek sprint biletlerini ele alacak yeterli kapasitesi bulunmuyor.",
      },
      {
        word: "traction",
        phonetic: "/ˈtræk.ʃən/",
        meaning: "Pazar ivmesi, müşteri ilgisi ve büyüme",
        exampleEn: "The mobile app gained rapid traction, surpassing one hundred thousand active subscribers in sixty days.",
        exampleTr: "Mobil uygulama altmış günde yüz bin aktif aboneyi aşarak hızlı bir pazar ivmesi kazandı.",
      },
      {
        word: "monetize",
        phonetic: "/ˈmʌn.ɪ.taɪz/",
        meaning: "Gelire dönüştürmek, paraya çevirmek",
        exampleEn: "Tech startups often prioritize product engagement before attempting to monetize user interactions.",
        exampleTr: "Teknoloji girişimleri, kullanıcı etkileşimlerini paraya dönüştürmeden önce genellikle ürün bağlılığını önceliklendirir.",
      },
      {
        word: "retention",
        phonetic: "/rɪˈten.ʃən/",
        meaning: "Kullanıcı / müşteri elde tutma oranı",
        exampleEn: "Improving user onboarding resulted in a notable increase in ninety-day retention rates.",
        exampleTr: "Kullanıcı alıştırma sürecini geliştirmek, doksan günlük elde tutma oranlarında kayda değer bir artış sağladı.",
      },
      {
        word: "friction",
        phonetic: "/ˈfrɪk.ʃən/",
        meaning: "Sürtünme, kullanıcı yolculuğundaki pürüz",
        exampleEn: "Streamlining authentication removed unnecessary friction from the customer signup funnel.",
        exampleTr: "Kimlik doğrulamayı kolaylaştırmak, müşteri kayıt hunisindeki gereksiz sürtünmeyi ortadan kaldırdı.",
      },
      {
        word: "stakeholder",
        phonetic: "/ˈsteɪkˌhəʊl.dər/",
        meaning: "Paydaş, hissedar, ilgili taraf",
        exampleEn: "Effective executives maintain transparent communication with both internal and external stakeholders.",
        exampleTr: "Etkili yöneticiler, hem iç hem de dış paydaşlarla şeffaf iletişimi sürdürür.",
      },
      {
        word: "deliverable",
        phonetic: "/dɪˈlɪv.ər.ə.bəl/",
        meaning: "Teslim edilecek iş / proje çıktısı",
        exampleEn: "The project timeline outlines specific deliverables scheduled for completion before Q3.",
        exampleTr: "Proje takvimi, 3. çeyrekten önce tamamlanması planlanan belirli proje çıktılarını ana hatlarıyla belirtir.",
      },
      {
        word: "compliance",
        phonetic: "/kəmˈplaɪ.əns/",
        meaning: "Yasal mevzuata ve regülasyona uyum",
        exampleEn: "Strict data compliance protocols are mandatory to safeguard enterprise customer confidentiality.",
        exampleTr: "Kurumsal müşteri gizliliğini korumak için katı veri uyumluluk protokolleri zorunludur.",
      },
      {
        word: "deprecate",
        phonetic: "/ˈdep.rə.keɪt/",
        meaning: "Kullanımdan kaldırmak, eskimiş saymak",
        exampleEn: "The platform will officially deprecate legacy API endpoints in favor of modern GraphQL queries.",
        exampleTr: "Platform, modern GraphQL sorguları lehine eski API uç noktalarını resmi olarak kullanımdan kaldıracaktır.",
      },
      {
        word: "onboarding",
        phonetic: "/ˈɒnˌbɔː.dɪŋ/",
        meaning: "İşe / sisteme alıştırma süreci",
        exampleEn: "An intuitive onboarding tour reduces cognitive load and accelerates product adoption for new users.",
        exampleTr: "Sezgisel bir alıştırma turu, bilişsel yükü azaltır ve yeni kullanıcılar için ürün benimsenmesini hızlandırır.",
      },
      {
        word: "feasibility",
        phonetic: "/ˌfiː.zəˈbɪl.ə.ti/",
        meaning: "Uygulanabilirlik, yapılabilirlik",
        exampleEn: "The executive committee conducted an exhaustive feasibility analysis before greenlighting the overseas expansion.",
        exampleTr: "Yürütme komitesi, yurtdışı genişlemesine onay vermeden önce kapsamlı bir uygulanabilirlik analizi gerçekleştirdi.",
      },
    ],
  },
  {
    id: "showcase_oxford",
    title: "Global Core 3000 Temel Kelimeler",
    category: "Genel İngilizce & Temel",
    badge: "Global Core 3000 • B1-B2",
    level: "Intermediate (B1)",
    icon: "🚀",
    description: "Her İngilizce öğrencisinin akıcı konuşma ve anlama için bilmesi gereken en temel 3000 kelime seçkisi.",
    cardCount: 650,
    sampleWords: ["accomplish", "crucial", "perspective", "enhance", "indicate"],
    cards: [
      {
        word: "accomplish",
        phonetic: "/əˈkʌm.plɪʃ/",
        meaning: "Başarmak, üstesinden gelmek, tamamlamak",
        exampleEn: "With consistent daily practice, you will accomplish all your vocabulary goals.",
        exampleTr: "Düzenli günlük pratikle tüm kelime hedeflerinizi başaracaksınız.",
      },
      {
        word: "crucial",
        phonetic: "/ˈkruː.ʃəl/",
        meaning: "Çok önemli, hayati, kritik",
        exampleEn: "Regular sleep is crucial for long-term memory consolidation.",
        exampleTr: "Düzenli uyku, uzun süreli hafıza pekişmesi için hayati önem taşır.",
      },
      {
        word: "perspective",
        phonetic: "/pəˈspek.tɪv/",
        meaning: "Bakış açısı, perspektif",
        exampleEn: "Exploring diverse cultures offers a valuable perspective on global challenges.",
        exampleTr: "Farklı kültürleri keşfetmek, küresel zorluklara değerli bir bakış açısı sunar.",
      },
      {
        word: "enhance",
        phonetic: "/ɪnˈhɑːns/",
        meaning: "Geliştirmek, artırmak, zenginleştirmek",
        exampleEn: "The SM-2 spaced repetition algorithm significantly enhances memory retention.",
        exampleTr: "SM-2 aralıklı tekrar algoritması hafıza tutma oranını önemli ölçüde artırır.",
      },
      {
        word: "indicate",
        phonetic: "/ˈɪn.dɪ.keɪt/",
        meaning: "Belirtmek, işaret etmek, göstermek",
        exampleEn: "Recent research studies indicate a direct correlation between active reading and fluency.",
        exampleTr: "Son araştırmalar, aktif okuma ile akıcılık arasında doğrudan bir ilişkiye işaret ediyor.",
      },
      {
        word: "sustainable",
        phonetic: "/səˈsteɪ.nə.bəl/",
        meaning: "Sürdürülebilir, devam ettirilebilir",
        exampleEn: "Developing sustainable daily study habits ensures steady language mastery.",
        exampleTr: "Sürdürülebilir günlük çalışma alışkanlıkları geliştirmek, dilde istikrarlı bir ustalık sağlar.",
      },
      {
        word: "consequence",
        phonetic: "/ˈkɒn.sɪ.kwəns/",
        meaning: "Sonuç, netice, akıbet",
        exampleEn: "Every choice we make carries a direct consequence on our future achievements.",
        exampleTr: "Yaptığımız her seçim, gelecekteki başarılarımız üzerinde doğrudan bir sonuç doğurur.",
      },
      {
        word: "evaluate",
        phonetic: "/ɪˈvæl.ju.eɪt/",
        meaning: "Değerlendirmek, ölçüp tartmak",
        exampleEn: "Spaced repetition flashcards help evaluate your vocabulary recall under pressure.",
        exampleTr: "Aralıklı tekrar kartları, kelime hatırlama gücünüzü baskı altında değerlendirmeye yardımcı olur.",
      },
      {
        word: "establish",
        phonetic: "/ɪˈstæb.lɪʃ/",
        meaning: "Kurmak, tesis etmek, oluşturmak",
        exampleEn: "The academic institute helped establish clear guidelines for modern foreign language instruction.",
        exampleTr: "Akademik enstitü, modern yabancı dil eğitimi için net kılavuz ilkeler oluşturulmasına yardımcı oldu.",
      },
      {
        word: "significant",
        phonetic: "/sɪɡˈnɪf.ɪ.kənt/",
        meaning: "Önemli, kayda değer, manidar",
        exampleEn: "Daily exposure to foreign news brings significant improvements in listening comprehension.",
        exampleTr: "Yabancı haberlere günlük olarak maruz kalmak, dinleme anlama becerisinde önemli gelişmeler sağlar.",
      },
      {
        word: "prioritize",
        phonetic: "/praɪˈɒr.ɪ.taɪz/",
        meaning: "Önceliklendirmek, ilk sıraya almak",
        exampleEn: "Successful learners prioritize high-frequency core vocabulary over obscure slang.",
        exampleTr: "Başarılı dil öğrencileri, nadir argo yerine yüksek frekanslı temel kelimeleri önceliklendirir.",
      },
      {
        word: "efficient",
        phonetic: "/ɪˈfɪʃ.ənt/",
        meaning: "Verimli, etkili, randımanlı",
        exampleEn: "The interactive quiz system provides an efficient way to reinforce active recall.",
        exampleTr: "Etkileşimli test sistemi, aktif hatırlamayı pekiştirmenin verimli bir yolunu sunar.",
      },
      {
        word: "contribute",
        phonetic: "/kənˈtrɪb.juːt/",
        meaning: "Katkıda bulunmak, pay sahibi olmak",
        exampleEn: "A regular reading habit will contribute tremendously to your academic vocabulary.",
        exampleTr: "Düzenli okuma alışkanlığı, akademik kelime dağarcığınıza muazzam katkı sağlayacaktır.",
      },
      {
        word: "acquire",
        phonetic: "/əˈkwaɪər/",
        meaning: "Edinmek, kazanmak, elde etmek",
        exampleEn: "Immersive storytelling enables students to naturally acquire contextual idioms.",
        exampleTr: "Sürükleyici hikaye anlatımı, öğrencilerin bağlamsal deyimleri doğal yolla edinmelerini sağlar.",
      },
      {
        word: "maintain",
        phonetic: "/meɪnˈteɪn/",
        meaning: "Sürdürmek, korumak, devam ettirmek",
        exampleEn: "It takes dedication to maintain a continuous thirty-day study streak.",
        exampleTr: "Otuz günlük kesintisiz bir çalışma serisini sürdürmek adanmışlık gerektirir.",
      },
      {
        word: "innovative",
        phonetic: "/ˈɪn.ə.və.tɪv/",
        meaning: "Yenilikçi, inovatif",
        exampleEn: "The platform utilizes innovative gamification mechanics to keep users motivated.",
        exampleTr: "Platform, kullanıcıların motivasyonunu korumak için yenilikçi oyunlaştırma mekanikleri kullanır.",
      },
      {
        word: "fundamental",
        phonetic: "/ˌfʌn.dəˈmen.təl/",
        meaning: "Temel, esas, köklü",
        exampleEn: "Mastering the most frequent two thousand words is fundamental to conversational ease.",
        exampleTr: "En sık kullanılan iki bin kelimede ustalaşmak, konuşma rahatlığı için temeldir.",
      },
      {
        word: "potential",
        phonetic: "/pəˈten.ʃəl/",
        meaning: "Potansiyel, olası güç",
        exampleEn: "Every daily review session helps unlock your full linguistic potential.",
        exampleTr: "Her günlük tekrar oturumu, tam dilsel potansiyelinizi ortaya çıkarmanıza yardımcı olur.",
      },
      {
        word: "distribute",
        phonetic: "/dɪˈstrɪb.juːt/",
        meaning: "Dağıtmak, paylaştırmak",
        exampleEn: "The algorithm calculates optimal intervals to distribute review sessions evenly.",
        exampleTr: "Algoritma, tekrar oturumlarını dengeli biçimde dağıtmak için en uygun aralıkları hesaplar.",
      },
      {
        word: "comprehensive",
        phonetic: "/ˌkɒm.prɪˈhen.sɪv/",
        meaning: "Kapsamlı, etraflı, eksiksiz",
        exampleEn: "Our curated curriculum provides a comprehensive overview of essential communication patterns.",
        exampleTr: "Özenle hazırlanan müfredatımız, temel iletişim kalıplarına kapsamlı bir genel bakış sunar.",
      },
    ],
  },
];

interface ShowcaseDeckCardProps {
  deck: ShowcaseDeck;
  onStartDeck: (deck: ShowcaseDeck) => void;
  speakText: (text: string, langCode?: string, e?: React.MouseEvent) => void;
  t: (key: string, fallback?: string, params?: Record<string, any>) => string;
}

export function getShowcaseDeckTitle(deck: ShowcaseDeck, t: (key: string, fallback?: string, params?: Record<string, any>) => string): string {
  if (deck.id === "showcase_yds") {
    return t("deck_yds_title", deck.title);
  }
  if (deck.id === "showcase_oxford" || deck.id === "showcase_core") {
    return t("deck_core_title", deck.title);
  }
  return deck.title;
}

export function getShowcaseDeckDesc(deck: ShowcaseDeck, t: (key: string, fallback?: string, params?: Record<string, any>) => string): string {
  if (deck.id === "showcase_yds") {
    return t("deck_yds_desc", deck.description);
  }
  if (deck.id === "showcase_business") {
    return t("deck_biz_desc", deck.description);
  }
  if (deck.id === "showcase_oxford" || deck.id === "showcase_core") {
    return t("deck_core_desc", deck.description);
  }
  return deck.description;
}

export function getShowcaseDeckBadge(deck: ShowcaseDeck, t: (key: string, fallback?: string, params?: Record<string, any>) => string): string {
  if (deck.badge.includes("Kurumsal") || deck.badge.includes("KURUMSAL")) {
    return deck.badge.replace(/Kurumsal|KURUMSAL/g, t("tag_corporate", "KURUMSAL"));
  }
  return deck.badge;
}

export function ShowcaseDeckCard({
  deck,
  onStartDeck,
  speakText,
  t,
}: ShowcaseDeckCardProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isCycling, setIsCycling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeWord, setActiveWord] = useState<ShowcaseCard | null>(null);

  const totalCards = deck.cards.length;

  // 8 saniyede bir otomatik kelime döngüsü (kartın üzerine gelindiğinde veya önizleme açıkken duraklar)
  useEffect(() => {
    if (isHovered || activeWord !== null || totalCards <= 5) return;

    const timer = setInterval(() => {
      cycleWords(false);
    }, 8000);

    return () => clearInterval(timer);
  }, [isHovered, activeWord, totalCards, startIndex]);

  // Kelimeleri 5'erli gruplar halinde bir sonraki döngüye geçir
  const cycleWords = (manual: boolean = false) => {
    setIsFading(true);
    if (manual) setIsCycling(true);

    setTimeout(() => {
      setStartIndex((prev) => (prev + 5) % totalCards);
      setActiveWord(null);
      setTimeout(() => {
        setIsFading(false);
        setIsCycling(false);
      }, 150);
    }, 180);
  };

  // Şu an gösterilen 5 kelime
  const currentBatch = React.useMemo(() => {
    if (!deck.cards || totalCards === 0) return [];
    const count = Math.min(5, totalCards);
    const batch: ShowcaseCard[] = [];
    for (let i = 0; i < count; i++) {
      batch.push(deck.cards[(startIndex + i) % totalCards]);
    }
    return batch;
  }, [deck.cards, startIndex, totalCards]);

  // Kelime hapına tıklandığında: TTS ile ses çal + Açılır kutuyu (tooltip) göster
  const handleWordClick = (card: ShowcaseCard, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeWord?.word === card.word) {
      setActiveWord(null);
    } else {
      setActiveWord(card);
      speakText(card.word, "en", e);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 hover:scale-[1.01]"
    >
      <div>
        {/* Üst Rozet & Kart Sayısı */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            {getShowcaseDeckBadge(deck, t)}
          </span>
          <span className="text-xs font-mono text-slate-400">
            {t("card_count_badge", "{count} Kart", { count: deck.cardCount })}
          </span>
        </div>

        {/* Başlık ve İkon (Mükerrer ikon olmadan sade ve şık) */}
        <div className="flex items-start space-x-2.5 mb-2">
          <span className="text-2xl select-none">{deck.icon}</span>
          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
            {getShowcaseDeckTitle(deck, t)}
          </h3>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {getShowcaseDeckDesc(deck, t)}
        </p>

        {/* CANLI HEDEF KELİMELER BÖLÜMÜ */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t("target_words", "Hedef Kelimeler")}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
                {Math.min(startIndex + 1, totalCards)}-{Math.min(startIndex + 5, totalCards)} / {totalCards}
              </span>
            </div>

            {/* Yenileme (Cycle) Butonu */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cycleWords(true);
              }}
              title="Yeni 5 kelime göster (8 saniyede bir otomatik döner)"
              className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-indigo-300 text-[10px] font-medium transition cursor-pointer border border-slate-700/60 active:scale-95"
            >
              <RotateCw className={`w-2.5 h-2.5 ${isCycling ? "animate-spin text-indigo-400" : ""}`} />
              <span>{t("btn_refresh_words", "Yenile")}</span>
            </button>
          </div>

          {/* Kelime Hapları (Word Pills) */}
          <div
            className={`flex flex-wrap gap-1.5 min-h-[58px] items-center transition-all duration-200 ${
              isFading ? "opacity-20 scale-95" : "opacity-100 scale-100"
            }`}
          >
            {currentBatch.map((card) => {
              const isSelected = activeWord?.word === card.word;
              return (
                <button
                  key={card.word}
                  type="button"
                  onClick={(e) => handleWordClick(card, e)}
                  title="Telaffuzu dinle ve anlamı gör"
                  className={`group/pill relative flex items-center space-x-1 text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30 scale-105"
                      : "bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/60 hover:bg-slate-850"
                  }`}
                >
                  <span>{card.word}</span>
                  <Volume2 className="w-2.5 h-2.5 text-indigo-400 opacity-60 group-hover/pill:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>

          {/* İNTERAKTİF KELİME ÖNİZLEME POPUP / TOOLTIP */}
          {activeWord && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="p-3 rounded-2xl bg-slate-950/95 border border-indigo-500/40 shadow-2xl shadow-black/80 space-y-2 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-white">{activeWord.word}</span>
                  <span className="text-[11px] font-mono text-indigo-400">{activeWord.phonetic}</span>
                  <button
                    type="button"
                    onClick={(e) => speakText(activeWord.word, "en", e)}
                    className="p-1 rounded-md bg-indigo-500/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition cursor-pointer"
                    title="Telaffuzu Tekrar Çal"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveWord(null);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  title="Kapat"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <span>🇹🇷</span>
                <span>{activeWord.meaning}</span>
              </div>

              <div className="text-[11px] text-slate-300 italic border-l-2 border-indigo-500/50 pl-2.5 py-0.5 bg-slate-900/60 rounded-r leading-relaxed">
                "{activeWord.exampleEn}"
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deste Başlat Eylem Butonu */}
      <button
        type="button"
        onClick={() => onStartDeck(deck)}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white font-bold text-xs transition-all shadow-sm hover:shadow-indigo-600/25 active:scale-95 cursor-pointer mt-2"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>{t("study_sm2", "Kartları İncele & SM-2 Başlat")}</span>
      </button>
    </div>
  );
}


interface Deck {
  id: string;
  title: string;
  description: string;
  folder_id?: string | null;
  card_count?: number;
  target_lang?: string;
  native_lang?: string;
}

interface FolderItem {
  id: string;
  name: string;
}

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "İngilizce", flag: "🇬🇧" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "de", label: "Almanca", flag: "🇩🇪" },
  { code: "es", label: "İspanyolca", flag: "🇪🇸" },
  { code: "fr", label: "Fransızca", flag: "🇫🇷" },
  { code: "it", label: "İtalyanca", flag: "🇮🇹" },
  { code: "ru", label: "Rusça", flag: "🇷🇺" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { mode } = useExperience();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Vitrin Deste SM-2 Önizleme Modalı State
  const [activeShowcaseDeck, setActiveShowcaseDeck] = useState<ShowcaseDeck | null>(null);
  const [showcaseCardIndex, setShowcaseCardIndex] = useState(0);
  const [showcaseIsFlipped, setShowcaseIsFlipped] = useState(false);
  const [isSavingShowcase, setIsSavingShowcase] = useState(false);

  // Filtreler & Görünüm
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"folder" | "grid" | "list">("grid");

  // Modallar
  const [isCreateDeckModalOpen, setIsCreateDeckModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDeckFolderId, setNewDeckFolderId] = useState<string>("");

  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // KELİME EKLE MODALI (INSTANT AUTO-LOOKUP İLE)
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  const [selectedDeckForWord, setSelectedDeckForWord] = useState<string>("");
  const [wordInput, setWordInput] = useState("");
  const [contextHint, setContextHint] = useState("");
  const [termLang, setTermLang] = useState("en");
  const [defLang, setDefLang] = useState("tr");
  const [isEnriching, setIsEnriching] = useState(false);
  const [isAutoLookingUp, setIsAutoLookingUp] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const autoLookupAbortRef = useRef<AbortController | null>(null);
  const lastAutoWordRef = useRef<string>("");

  const [correctionNotice, setCorrectionNotice] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [enrichedData, setEnrichedData] = useState<{
    word: string;
    phonetic: string;
    translation: string;
    exampleEn: string;
    exampleTr: string;
    source?: string;
  } | null>(null);

  // PAYLAŞIM MODALI
  const [shareModalConfig, setShareModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    itemType: "deck" | "story";
    itemId: string;
    deck?: any;
    cards?: any[];
  } | null>(null);

  // 1. Verileri Çek
  const fetchDecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/decks`);
      if (res.ok) {
        const data = await res.json();
        setDecks(data || []);
      }
    } catch (e) {
      console.error("Desteler alınamadı:", e);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetch(`${API_BASE}/folders`);
      if (res.ok) {
        const data = await res.json();
        setFolders(data || []);
      }
    } catch (e) {
      console.error("Klasörler alınamadı:", e);
    }
  };

  // ZAYIF NOKTA AVCISI (WEAK-SPOT HUNTER)
  const [weakSpotCount, setWeakSpotCount] = useState<number>(0);
  const [isWeakSpotModalOpen, setIsWeakSpotModalOpen] = useState<boolean>(false);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!celebrationBanner) return;
    const timer = setTimeout(() => {
      setCelebrationBanner(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [celebrationBanner]);

  const fetchWeakSpotsCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/cards/weak-spots?limit=100`);
      if (res.ok) {
        const data = await res.json();
        const count = data.total !== undefined ? data.total : (data.cards ? data.cards.length : 0);
        setWeakSpotCount(count);
      }
    } catch (e) {
      console.error("Zayıf noktalar alınamadı:", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDecks(), fetchFolders(), fetchWeakSpotsCount()]);
      setLoading(false);
    };
    init();
  }, []);

  // 2. Yeni Deste Oluşturma
  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/decks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          folder_id: newDeckFolderId || null,
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        setNewDeckFolderId("");
        setIsCreateDeckModalOpen(false);
        await fetchDecks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Yeni Klasör Oluşturma
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      if (res.ok) {
        setNewFolderName("");
        setIsCreateFolderModalOpen(false);
        await fetchFolders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Deste Silme
  const handleDeleteDeck = async (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bu desteyi ve içindeki tüm kelime kartlarını silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`${API_BASE}/decks/${deckId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchDecks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5. KELİME EKLEME: INSTANT AUTO-LOOKUP (350ms Debounce & onBlur)
  const triggerAutoLookup = async (searchWord: string) => {
    const targetDeck = selectedDeckForWord || (decks.length > 0 ? decks[0].id : "");
    const cleanWord = searchWord.trim().toLowerCase();
    if (!targetDeck || cleanWord.length < 2) return;

    if (autoLookupAbortRef.current) {
      autoLookupAbortRef.current.abort();
    }
    const controller = new AbortController();
    autoLookupAbortRef.current = controller;

    setIsAutoLookingUp(true);
    try {
      const res = await fetch(`${API_BASE}/dictionary/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: cleanWord,
          target_lang: termLang,
          native_lang: defLang,
          context_hint: contextHint.trim() || undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok) return;
      const data = await res.json();

      if (data.was_corrected) {
        setCorrectionNotice(`'${data.original_word}' yerine '${data.word}' olarak düzeltildi.`);
      }
      setSuggestions(data.suggestions || []);

      const translation = data.translation || data.meanings?.[0]?.translation || data.meanings?.[0]?.definition || "";
      if (translation) {
        lastAutoWordRef.current = cleanWord;
        setEnrichedData({
          word: data.word || cleanWord,
          phonetic: data.phonetic || "",
          translation: translation,
          exampleEn: data.example_sentences?.[0]?.target || data.example_sentences?.[0]?.en || "",
          exampleTr: data.example_sentences?.[0]?.native || data.example_sentences?.[0]?.tr || data.example_sentences?.[0]?.source || "",
          source: data.source || "instant",
        });
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("[AutoLookup error]:", err);
      }
    } finally {
      setIsAutoLookingUp(false);
    }
  };

  useEffect(() => {
    if (!isAddWordModalOpen || enrichedData) return;
    const cleanWord = wordInput.trim().toLowerCase();
    if (cleanWord.length < 2) return;
    if (cleanWord === lastAutoWordRef.current) return;

    const timer = setTimeout(() => {
      triggerAutoLookup(cleanWord);
    }, 350);

    return () => clearTimeout(timer);
  }, [wordInput, termLang, defLang, isAddWordModalOpen, enrichedData]);

  // Manuel AI Çağrısı
  const runFetchAi = async (searchWord: string) => {
    const targetDeck = selectedDeckForWord || (decks.length > 0 ? decks[0].id : "");
    const cleanWord = searchWord.trim();
    if (!targetDeck || !cleanWord) return;

    setIsEnriching(true);
    setCorrectionNotice(null);
    setSuggestions([]);

    try {
      const aiRes = await fetch(`${API_BASE}/ai/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: cleanWord,
          target_lang: termLang,
          native_lang: defLang,
          context_hint: contextHint.trim() || undefined,
        }),
      });

      if (!aiRes.ok) {
        const err = await aiRes.json().catch(() => null);
        alert(err?.detail || "Kelime doğrulanamadı.");
        return;
      }

      const data = await aiRes.json();
      if (data.was_corrected) {
        setCorrectionNotice(`'${data.original_word}' yerine '${data.word}' olarak düzeltildi.`);
      }
      setSuggestions(data.suggestions || []);

      lastAutoWordRef.current = cleanWord.toLowerCase();
      setEnrichedData({
        word: data.word || cleanWord,
        phonetic: data.phonetic || "",
        translation: data.translation || data.meanings?.[0]?.translation || data.meanings?.[0]?.definition || "",
        exampleEn: data.example_sentences?.[0]?.target || data.example_sentences?.[0]?.en || "",
        exampleTr: data.example_sentences?.[0]?.native || data.example_sentences?.[0]?.tr || data.example_sentences?.[0]?.source || "",
        source: data.source || "gemini",
      });
    } finally {
      setIsEnriching(false);
    }
  };

  // Manuel Kendim Yazacağım Modu
  const handleManualInputMode = () => {
    const targetDeck = selectedDeckForWord || (decks.length > 0 ? decks[0].id : "");
    if (!targetDeck) {
      alert("Lütfen önce bir hedef deste seçin!");
      return;
    }
    if (!wordInput.trim()) {
      alert("Lütfen bir kelime yazın!");
      return;
    }

    setCorrectionNotice(null);
    setSuggestions([]);
    setEnrichedData({
      word: wordInput.trim(),
      phonetic: "",
      translation: contextHint.trim() || "",
      exampleEn: "",
      exampleTr: "",
      source: "manual",
    });
  };

  // Kartı Desteye Kaydetme
  const handleSaveCard = async () => {
    const targetDeck = selectedDeckForWord || (decks.length > 0 ? decks[0].id : "");
    if (!enrichedData || !targetDeck) return;

    setIsSavingCard(true);
    try {
      const payload = {
        deck_id: targetDeck,
        word: enrichedData.word.trim(),
        phonetic: enrichedData.phonetic.trim() || null,
        meanings: [
          {
            part_of_speech: "",
            translation: enrichedData.translation.trim(),
            definition: enrichedData.translation.trim(),
          },
        ],
        example_sentences: enrichedData.exampleEn
          ? [
              {
                en: enrichedData.exampleEn.trim(),
                tr: enrichedData.exampleTr.trim(),
                target: enrichedData.exampleEn.trim(),
                native: enrichedData.exampleTr.trim(),
              },
            ]
          : [],
        collocations: [],
        notes: "",
      };

      const res = await fetch(`${API_BASE}/decks/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEnrichedData(null);
        setWordInput("");
        setContextHint("");
        lastAutoWordRef.current = "";
        setIsAddWordModalOpen(false);
        await fetchDecks();
      }
    } catch (e) {
      console.error("Kart kaydedilemedi:", e);
    } finally {
      setIsSavingCard(false);
    }
  };

  // Vitrin Desteyi Kullanıcının Kütüphanesine Kaydetme
  const handleSaveShowcaseToLibrary = async (showcase: ShowcaseDeck) => {
    setIsSavingShowcase(true);
    try {
      const deckRes = await fetch(`${API_BASE}/decks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: showcase.title,
          description: showcase.description,
          target_lang: "en",
          native_lang: "tr",
        }),
      });

      if (!deckRes.ok) throw new Error("Deste oluşturulamadı");
      const createdDeck = await deckRes.json();

      for (const card of showcase.cards) {
        await fetch(`${API_BASE}/decks/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deck_id: createdDeck.id,
            word: card.word,
            phonetic: card.phonetic,
            meanings: [
              {
                part_of_speech: "",
                translation: card.meaning,
                definition: card.meaning,
              },
            ],
            example_sentences: [
              {
                en: card.exampleEn,
                tr: card.exampleTr,
                target: card.exampleEn,
                native: card.exampleTr,
              },
            ],
          }),
        });
      }

      await fetchDecks();
      setActiveShowcaseDeck(null);
    } catch (e) {
      console.error("Vitrin destesi kaydedilemedi:", e);
      alert("Deste kaydedilirken bir hata oluştu.");
    } finally {
      setIsSavingShowcase(false);
    }
  };

  // TTS
  const speakText = (text: string, langCode: string = "en", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      en: "en-US",
      tr: "tr-TR",
      de: "de-DE",
      es: "es-ES",
      fr: "fr-FR",
      it: "it-IT",
      ru: "ru-RU",
    };
    utterance.lang = langMap[langCode] || "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // Filtreleme
  const filteredDecks = decks.filter((d) => {
    const matchesFolder = selectedFolderId
      ? d.folder_id && String(d.folder_id).trim().toLowerCase() === String(selectedFolderId).trim().toLowerCase()
      : true;
    const matchesSearch = searchQuery
      ? d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesFolder && matchesSearch;
  });

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      {/* SEANS BİTİMİ KUTLAMASI BİLDİRİMİ */}
      {celebrationBanner && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center justify-between gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-teal-950/95 border-2 border-emerald-500/70 shadow-2xl shadow-emerald-950/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{celebrationBanner}</span>
                </h4>
                <p className="text-[11px] text-emerald-300/90 font-medium">
                  Harika iş! Tüm zayıf kelimeleri başarıyla temizledin.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCelebrationBanner(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {mode === "academic" ? (
        /* ========================================================================= */
        /* A) AKADEMİK & SINAV MODU: BİLİMSEL EBBINGHAUS SM-2 & AKADEMİK PAKETLER    */
        /* ========================================================================= */
        <>
          {/* 1. ÜST KISIM: EBBINGHAUS UNUTMA EĞRİSİ BİLİMSEL WIDGET */}
          <section className="relative overflow-hidden rounded-3xl bg-slate-900/75 border border-indigo-500/30 p-6 sm:p-7 backdrop-blur-xl shadow-xl">
            <div className="absolute -top-12 -right-12 w-56 h-56 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              {/* Sol Alan: Başlık & Entegre Arama Çubuğu */}
              <div className="space-y-3 flex-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/15 text-indigo-300 text-[11px] font-black uppercase tracking-wider border border-indigo-500/30">
                    🧠 {t("widget_badge", "BİLİŞSEL BELLEK WİDGET'I")}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">SM-2 Aralıklı Tekrar</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  🧠 {t("widget_title", "Ebbinghaus Unutma Eğrisi: 12 Kelime Tekrar Bekliyor", { count: 12 })}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t("widget_desc", "Beynimiz yeni öğrenilen kelimeleri hızla budar. SuperMemo-2 algoritması, kelimeleri tam unutma eşiğindeyken karşınıza çıkararak kalıcı hafızaya kodlar.")}
                </p>

                {/* Arama Çubuğu (Deste veya kelime ara...) */}
                <div className="relative pt-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder={t("search_placeholder", "Deste veya kelime ara...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 transition shadow-inner"
                  />
                </div>
              </div>

              {/* Sağ Alan: Kompakt Bellek Durumu & Tekrara Başla Butonu */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between gap-4 shrink-0 lg:w-80 shadow-inner">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      {t("memory_retention", "Bellek Koruma Durumu")}
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">%92 Optimum</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 rounded-full"
                      style={{ width: "92%" }}
                    />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    🧠 {t("words_due_today", "Bugün tekrar edilecek {count} kelimeniz var (Önerilen süre: {min} dk)", { count: 12, min: 3 })}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Zayıf Nokta Avcısı Mini Rozeti (Sadece weakSpotCount > 0 olduğunda görünür) */}
                  {weakSpotCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsWeakSpotModalOpen(true)}
                      className="group relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-slate-900 border border-rose-500/50 hover:border-rose-400 text-rose-200 hover:text-white transition-all shadow-md shadow-rose-950/40 active:scale-95 cursor-pointer animate-in fade-in zoom-in-95"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                        </span>
                        <span className="font-extrabold text-xs tracking-tight">
                          {t("weak_spots_badge", `🎯 Zayıf Noktaların (${weakSpotCount} Kelime) — [2 Dk'da Erit]`, { count: weakSpotCount })}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-400/40 group-hover:bg-rose-500 group-hover:text-white transition">
                        Erit ➔
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (decks.length > 0) {
                        router.push(`/study/${decks[0].id}`);
                      } else {
                        setActiveShowcaseDeck(SHOWCASE_DECKS[0]);
                        setShowcaseCardIndex(0);
                        setShowcaseIsFlipped(false);
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/30 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                  >
                    <Brain className="w-4 h-4" />
                    <span>{t("study_sm2", "Tekrara Başla")} (12 Kart • SM-2)</span>
                  </button>
                  <Link
                    href="/reading/custom"
                    className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white font-semibold text-xs transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t("tab_custom_article", "Serbest Makale Çözümle")} ➔</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 2. ORTA KISIM: ÖNE ÇIKAN 3 HAZIR AKADEMİK PAKET */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {t("tab_presets", "Öne Çıkan Hazır Paketler")}
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  {t("preset_showcase_sub", "Akademik sınavlar ve profesyonel kariyer için optimize edilmiş hazır kelime vitrini.")}
                </p>
              </div>
              <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1 self-start sm:self-auto">
                <span>{t("no_signup_needed", "Kayıt Gerektirmez")}</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SHOWCASE_DECKS.map((showcase) => (
                <ShowcaseDeckCard
                  key={showcase.id}
                  deck={showcase}
                  speakText={speakText}
                  t={t}
                  onStartDeck={(deck) => {
                    setActiveShowcaseDeck(deck);
                    setShowcaseCardIndex(0);
                    setShowcaseIsFlipped(false);
                  }}
                />
              ))}
            </div>
          </section>
        </>
      ) : (
        /* ========================================================================= */
        /* B) ARCADE & SINIF MODU: HAZİNE AVI, BOSS FIGHT, PODYUM & SANDIKLAR         */
        /* ========================================================================= */
        <>
          {/* 1. ÜST KISIM: OYUN ARENASI & SINIF REKABETİ SPOTLIGHT BANNER */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 p-6 sm:p-7 backdrop-blur-xl shadow-xl">
            <div className="absolute -top-12 -right-12 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 flex-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-500/40 flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t("hero_game_badge", "SINIF OYUN ARENASI")}</span>
                  </span>
                  <span className="text-xs text-amber-400/90 font-mono font-bold">
                    {t("hero_game_subtitle", "Canlı Rekabet & Turnuva")}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  🎮 {t("hero_game_title", "Vocaship Oyun Arenası: Altın Yarışı & Canavar Savaşları")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t("hero_game_desc", "Öğrendiğin kelimelerle hazine sandıklarını yağmala, 25.000 HP sınıf Boss'una kritik hasar ver ve gizemli sandıklardan efsanevi karakter koleksiyonunu tamamla!")}
                </p>

                {/* Arama Çubuğu */}
                <div className="relative pt-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder={t("search_placeholder", "Deste veya oyun ara...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70 transition shadow-inner"
                  />
                </div>
              </div>

              {/* Hızlı Eylem Butonları */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 lg:w-72">
                {weakSpotCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsWeakSpotModalOpen(true)}
                    className="group relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-rose-900/60 to-slate-900 border border-rose-500/60 hover:border-rose-400 text-rose-200 hover:text-white transition-all shadow-md shadow-rose-950/40 active:scale-95 cursor-pointer animate-in fade-in zoom-in-95"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                      </span>
                      <span className="font-extrabold text-xs tracking-tight">
                        {t("weak_spots_badge", `🎯 Zayıf Noktaların (${weakSpotCount} Kelime) — [2 Dk'da Erit]`, { count: weakSpotCount })}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-400/40 group-hover:bg-rose-500 group-hover:text-white transition">
                      Erit ➔
                    </span>
                  </button>
                )}
                <Link
                  href="/games/boss-fight"
                  className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/30 hover:scale-[1.02] active:scale-95 transition-all text-center"
                >
                  <Swords className="w-4 h-4" />
                  <span>🐲 {t("hero_btn_boss", "Boss Savaşına Katıl!")}</span>
                </Link>
                <Link
                  href="/games/gold-quest"
                  className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all text-center"
                >
                  <Coins className="w-4 h-4" />
                  <span>🏴‍☠️ {t("hero_btn_treasure", "Hazine Avını Başlat")}</span>
                </Link>
              </div>
            </div>
          </section>

          {/* 2. ORTA KISIM: 4 EĞLENCE & OYUN ODAKLI MOD KARTI */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  <span>{t("games_presets_heading", "Öne Çıkan Oyun Modları & Koleksiyon")}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {t("game_cards_intro", "Kelimeleri oyunla pekiştir, sınıf podyumunda zirveye yerleş ve gizemli sandıkları aç.")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* 1. Hazine Avı */}
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-amber-500/30 hover:border-amber-400 transition-all flex flex-col justify-between shadow-lg group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {t("card_treasure_badge", "BASKIN MODU")}
                    </span>
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> {t("card_treasure_sub", "+Altın")}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mb-1.5 group-hover:text-amber-300 transition-colors">
                    🏴‍☠️ {t("card_treasure_title", "Hazine Avı")}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {t("card_treasure_desc", "Gizemli altın sandıklarını aç, rakiplerinden altın çal (Swap & Steal), 2x çarpanları yakala ve podyumda zirveye yerleş!")}
                  </p>
                </div>
                <Link
                  href="/games/gold-quest"
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t("card_treasure_btn", "Hemen Oyna")}</span>
                </Link>
              </div>

              {/* 2. Canavar Savaşı (Boss Fight) */}
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-rose-500/30 hover:border-rose-400 transition-all flex flex-col justify-between shadow-lg group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {t("card_boss_badge", "ORTAK SAVAŞ")}
                    </span>
                    <span className="text-xs text-rose-400 font-bold flex items-center gap-1">
                      <Swords className="w-3.5 h-3.5" /> {t("card_boss_sub", "25.000 HP")}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mb-1.5 group-hover:text-rose-300 transition-colors">
                    🐉 {t("card_boss_title", "Canavar Savaşı (Boss)")}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {t("card_boss_desc", "Tüm sınıf tek bir dev canavara karşı! Doğru cevaplarla kombolu hasar vur, karşı saldırılara diren ve +100 XP ödülünü kap!")}
                  </p>
                </div>
                <Link
                  href="/games/boss-fight"
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs transition shadow-md"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>{t("card_boss_btn", "Savaşa Katıl")}</span>
                </Link>
              </div>

              {/* 3. Sınıf Liderlik Podyumu */}
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-yellow-500/30 hover:border-yellow-400 transition-all flex flex-col justify-between shadow-lg group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                      {t("card_podium_badge", "PODYUM")}
                    </span>
                    <span className="text-xs text-yellow-400 font-bold flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" /> {t("card_podium_sub", "Haftalık")}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mb-1.5 group-hover:text-yellow-300 transition-colors">
                    🏆 {t("card_podium_title", "Sınıf Liderlik Podyumu")}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {t("card_podium_desc", "Haftalık ve tüm zamanlar podyumunda en çok XP toplayan sınıf arkadaşlarınla rekabet et ve unvanını yükselt!")}
                  </p>
                </div>
                <Link
                  href="/leaderboard"
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 font-bold text-xs transition"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{t("card_podium_btn", "Podyumu Gör")}</span>
                </Link>
              </div>

              {/* 4. Sandık Koleksiyonu & Mağaza */}
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-indigo-500/30 hover:border-indigo-400 transition-all flex flex-col justify-between shadow-lg group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {t("card_gacha_badge", "GACHA MAĞAZA")}
                    </span>
                    <span className="text-xs text-indigo-400 font-bold flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5" /> {t("card_gacha_sub", "Sandıklar")}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
                    ✨ {t("card_gacha_title", "Sandık Koleksiyonu")}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {t("card_gacha_desc", "Biriktirdiğin altınlarla gizemli sandıkları aç, efsanevi karakterleri topla ve avatarını kişiselleştir!")}
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 font-bold text-xs transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{t("card_gacha_btn", "Sandıkları Aç")}</span>
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. ALT KISIM: KİŞİSEL DESTELERİM & KLASÖRLERİM */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-3xl backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                {t("library", "Kişisel Destelerim & Klasörlerim")}
              </h2>
              <span className="text-xs text-slate-400">
                Toplam {decks.length} Deste • {folders.length} Klasör
              </span>
            </div>
          </div>

          {/* Butonlar: Klasör Aç, Kelime Ekle, Yeni Deste */}
          <div className="flex items-center space-x-2 self-end sm:self-auto flex-wrap gap-y-2">
            <button
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("btn_open_folder")}</span>
            </button>

            <button
              onClick={() => {
                if (decks.length > 0 && !selectedDeckForWord) setSelectedDeckForWord(decks[0].id);
                setEnrichedData(null);
                setWordInput("");
                setContextHint("");
                lastAutoWordRef.current = "";
                setIsAddWordModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 font-semibold text-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("btn_add_word")}</span>
            </button>

            <button
              onClick={() => setIsCreateDeckModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("btn_new_deck")}</span>
            </button>
          </div>
        </div>

        {/* Klasör Sekmeleri */}
        {folders.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedFolderId === null
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>{t("all_decks")} ({decks.length})</span>
            </button>
            {folders.map((f) => {
              const count = decks.filter(
                (d) => d.folder_id && String(d.folder_id).toLowerCase() === String(f.id).toLowerCase()
              ).length;
              const isSelected = selectedFolderId === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Folder className="w-3 h-3" />
                  <span>{f.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Deste Listesi / Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">Desteler yükleniyor...</div>
        ) : filteredDecks.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Henüz Kişisel Bir Deste Oluşturmadınız
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Yukarıdaki hazır vitrin paketlerinden birini inceleyip kütüphanenize kaydedebilir veya yeni bir deste oluşturabilirsiniz.
              </p>
            </div>
            <button
              onClick={() => setIsCreateDeckModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              + İlk Desteni Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDecks.map((deck) => {
              const folderObj = folders.find(
                (f) => String(f.id).toLowerCase() === String(deck.folder_id).toLowerCase()
              );

              return (
                <div
                  key={deck.id}
                  className="group relative bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 rounded-3xl p-5 transition-all duration-150 shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between hover:scale-[1.01]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                        {deck.card_count || 0} {t("word_cards_count")}
                      </span>
                      {folderObj && (
                        <span className="text-[11px] font-semibold text-amber-400/90 flex items-center gap-1">
                          <Folder className="w-3 h-3" />
                          <span>{folderObj.name}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors mb-1.5">
                      {deck.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-5">
                      {deck.description || "Açıklama belirtilmedi."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    {mode === "academic" ? (
                      <button
                        onClick={() => router.push(`/study/${deck.id}`)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>{t("study_sm2", "Hafıza Tekrarı (SM-2 Çalış)")}</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => router.push(`/games/gold-quest?deckId=${deck.id}`)}
                          className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition cursor-pointer"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>{t("btn_gold_quest", "Hazine Avı")}</span>
                        </button>
                        <button
                          onClick={() => router.push(`/games/boss-fight?deckId=${deck.id}`)}
                          className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition cursor-pointer"
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>{t("btn_join_boss_fight", "Boss Savaşı")}</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          setSelectedDeckForWord(deck.id);
                          setEnrichedData(null);
                          setWordInput("");
                          setContextHint("");
                          lastAutoWordRef.current = "";
                          setIsAddWordModalOpen(true);
                        }}
                        className="text-xs font-semibold text-slate-400 hover:text-indigo-300 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{t("btn_add_word")}</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() =>
                            setShareModalConfig({
                              isOpen: true,
                              title: deck.title,
                              itemType: "deck",
                              itemId: deck.id,
                              deck: deck,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                          title={t("btn_share")}
                        >
                          <Share2 className="w-4 h-4 text-indigo-400" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteDeck(deck.id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                          title={t("btn_delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* MODALLAR */}
      {/* ========================================================================= */}

      {/* 1. YENİ DESTE OLUŞTURMA MODALI */}
      {isCreateDeckModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {t("modal_create_deck_title", "Yeni Deste Oluştur")}
            </h3>
            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t("label_deck_title_input", "Deste Başlığı *")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("placeholder_deck_title", "Örn: B2 Akademik Kelimeler")}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t("label_deck_desc_input", "Açıklama")}
                </label>
                <textarea
                  rows={2}
                  placeholder={t("placeholder_deck_desc", "Destenin içeriği hakkında kısa bilgi...")}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-indigo-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t("label_folder_optional", "Klasör (İsteğe Bağlı)")}
                </label>
                <select
                  value={newDeckFolderId}
                  onChange={(e) => setNewDeckFolderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                >
                  <option value="">{t("option_no_folder", "Klasörsüz (Genel)")}</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateDeckModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t("btn_cancel", "İptal")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs shadow-md shadow-indigo-600/30"
                >
                  {t("btn_create_submit", "Oluştur")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. YENİ KLASÖR OLUŞTURMA MODALI */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        onSubmit={handleCreateFolder}
      />

      {/* 3. KELİME EKLE MODALI (INSTANT AUTO-LOOKUP & PREVIEW) */}
      <AddWordModal
        isOpen={isAddWordModalOpen}
        onClose={() => setIsAddWordModalOpen(false)}
        decks={decks}
        selectedDeckForWord={selectedDeckForWord}
        setSelectedDeckForWord={setSelectedDeckForWord}
        termLang={termLang}
        setTermLang={setTermLang}
        defLang={defLang}
        setDefLang={setDefLang}
        supportedLanguages={SUPPORTED_LANGUAGES}
        wordInput={wordInput}
        setWordInput={setWordInput}
        isAutoLookingUp={isAutoLookingUp}
        triggerAutoLookup={triggerAutoLookup}
        isEnriching={isEnriching}
        contextHint={contextHint}
        setContextHint={setContextHint}
        handleManualInputMode={handleManualInputMode}
        runFetchAi={runFetchAi}
        enrichedData={enrichedData}
        setEnrichedData={setEnrichedData}
        speakText={speakText}
        handleSaveCard={handleSaveCard}
        isSavingCard={isSavingCard}
        lastAutoWordRef={lastAutoWordRef}
      />

      {/* 4. PAYLAŞIM MODALI */}
      {shareModalConfig && (
        <ShareModal
          isOpen={shareModalConfig.isOpen}
          onClose={() => setShareModalConfig(null)}
          title={shareModalConfig.title}
          itemType={shareModalConfig.itemType}
          itemId={shareModalConfig.itemId}
          deck={shareModalConfig.deck}
        />
      )}

      {/* 5. VİTRİN DESTE SM-2 İNTERAKTİF ÖNİZLEME MODALI */}
      {activeShowcaseDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 overflow-hidden">
            {/* Üst Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{activeShowcaseDeck.icon}</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {getShowcaseDeckTitle(activeShowcaseDeck, t)}
                  </h3>
                  <span className="text-[11px] text-indigo-400 font-mono">
                    Kart {showcaseCardIndex + 1} / {activeShowcaseDeck.cards.length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveShowcaseDeck(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* İNTERAKTİF FLIP KART GÖVDESİ */}
            {(() => {
              const currentCard = activeShowcaseDeck.cards[showcaseCardIndex];
              if (!currentCard) return null;

              return (
                <div className="space-y-4">
                  <div
                    onClick={() => setShowcaseIsFlipped(!showcaseIsFlipped)}
                    className={`relative min-h-[220px] p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                      showcaseIsFlipped
                        ? "bg-slate-950 border-emerald-500/40 shadow-emerald-500/10 shadow-lg"
                        : "bg-gradient-to-b from-slate-850 to-slate-950 border-indigo-500/40 shadow-indigo-500/10 shadow-lg"
                    }`}
                  >
                    {/* Kart Üst Rozet */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {showcaseIsFlipped ? "Arka Yüz (Anlam & Örnek)" : t("front_side_label", "ÖN YÜZ (İNGİLİZCE TERİM)")}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => speakText(currentCard.word, "en", e)}
                        className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition cursor-pointer"
                        title="Telaffuzu Dinle"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Kart İçeriği */}
                    {!showcaseIsFlipped ? (
                      <div className="text-center py-4 space-y-2">
                        <h4 className="text-3xl font-black text-white tracking-tight">
                          {currentCard.word}
                        </h4>
                        <p className="text-sm font-mono text-indigo-400">
                          {currentCard.phonetic}
                        </p>
                        <p className="text-xs text-slate-400 italic pt-2 max-w-md mx-auto">
                          "{currentCard.exampleEn}"
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4 space-y-2">
                        <h4 className="text-2xl font-black text-emerald-300">
                          {currentCard.meaning}
                        </h4>
                        <p className="text-xs text-slate-300 italic pt-2 max-w-md mx-auto">
                          "{currentCard.exampleTr}"
                        </p>
                      </div>
                    )}

                    {/* Çevir İpucu */}
                    <div className="text-center text-[11px] text-slate-500 font-medium">
                      {showcaseIsFlipped ? "Ön yüze dönmek için tıklayın" : t("flip_for_meaning", "Anlamı görmek için karta tıklayın")}
                    </div>
                  </div>

                  {/* SM-2 HIZLI DEĞERLENDİRME BUTONLARI */}
                  {showcaseIsFlipped && (
                    <div className="space-y-1.5 animate-in fade-in duration-150">
                      <span className="text-[11px] text-slate-400 block text-center font-medium">
                        Bu kelimeyi ne kadar iyi hatırladınız? (SM-2 Puanı)
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowcaseIsFlipped(false);
                            if (showcaseCardIndex < activeShowcaseDeck.cards.length - 1) {
                              setShowcaseCardIndex((prev) => prev + 1);
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition cursor-pointer"
                        >
                          🔴 Tekrar Et
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowcaseIsFlipped(false);
                            if (showcaseCardIndex < activeShowcaseDeck.cards.length - 1) {
                              setShowcaseCardIndex((prev) => prev + 1);
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer"
                        >
                          🟡 Zor Hatırladım
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowcaseIsFlipped(false);
                            if (showcaseCardIndex < activeShowcaseDeck.cards.length - 1) {
                              setShowcaseCardIndex((prev) => prev + 1);
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition cursor-pointer"
                        >
                          🟢 Kolay / Biliyorum
                        </button>
                      </div>
                    </div>
                  )}

                  {/* KART GEÇİŞ KONTROLLERİ */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={showcaseCardIndex === 0}
                      onClick={() => {
                        setShowcaseIsFlipped(false);
                        setShowcaseCardIndex((prev) => Math.max(0, prev - 1));
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 text-xs font-semibold cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Önceki Kart</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      {activeShowcaseDeck.cards.map((_, idx) => (
                        <span
                          key={idx}
                          onClick={() => {
                            setShowcaseCardIndex(idx);
                            setShowcaseIsFlipped(false);
                          }}
                          className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                            idx === showcaseCardIndex ? "w-5 bg-indigo-500" : "bg-slate-700 hover:bg-slate-500"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={showcaseCardIndex === activeShowcaseDeck.cards.length - 1}
                      onClick={() => {
                        setShowcaseIsFlipped(false);
                        setShowcaseCardIndex((prev) => Math.min(activeShowcaseDeck.cards.length - 1, prev + 1));
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 text-xs font-semibold cursor-pointer"
                    >
                      <span>Sonraki Kart</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* ALT AKSİYON: KÜTÜPHANEYE KAYDET */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {t("save_deck_lib_notice", "Tüm desteyi kütüphanenize kalıcı kaydedin:")}
                    </span>
                    <button
                      type="button"
                      disabled={isSavingShowcase}
                      onClick={() => handleSaveShowcaseToLibrary(activeShowcaseDeck)}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      {isSavingShowcase ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>{t("btn_save_deck_lib", "Desteyi Kütüphaneme Kaydet")}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ZAYIF NOKTA KURTARMA SEANSI DİNAMİK MODALI */}
      <WeakSpotRecoveryModal
        isOpen={isWeakSpotModalOpen}
        onClose={() => setIsWeakSpotModalOpen(false)}
        onRefreshNeeded={() => fetchWeakSpotsCount()}
        onMasteredWord={() => setWeakSpotCount((prev) => Math.max(0, prev - 1))}
        onAllWeakSpotsCleared={() => {
          setWeakSpotCount(0);
          setCelebrationBanner("🎉 Tüm zayıf noktalarını temizledin!");
          try {
            confetti({
              particleCount: 100,
              spread: 75,
              origin: { y: 0.35 },
            });
          } catch {}
        }}
      />
    </main>
  );
}