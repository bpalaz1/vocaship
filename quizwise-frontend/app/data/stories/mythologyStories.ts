import { Story } from "./types";

export const mythologyStories: Story[] = [
  // ==========================================
  // LEVEL A (A1-A2, ~120-150 kelime, 2-3 dk)
  // ==========================================
  {
    id: "myth-01-sun-chariot",
    title: "The Legend of the Sun Chariot",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 145,
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    topic: "Güneş Arabası",
    desc: "Her sabah gökyüzünü altın ışıklarla boyayan ve ateşten atlarıyla güneşi taşıyan Helios'un efsanesi.",
    content: "Long ago in ancient Greece, people believed that day began with a magical journey across the sky. High in an eastern palace, the sun titan Helios woke up before dawn. He walked toward his shining golden chariot, pulled by four swift horses with fiery manes. As the dawn goddess opened the sky gates, Helios took the reins and flew upward.\n\nHis fiery chariot brought warm light to mountains, green valleys, and coastal towns. Children played outside, and farmers tended their crops under his gentle glow. In the evening, the tired horses descended into the western sea, where a golden boat carried them back through underground waterways to start again tomorrow.",
    target_words: ["chariot", "dawn", "reins", "descended"],
    target_vocabulary: [
      { word: "chariot", phonetic: "/ˈtʃær.i.ət/", turkish_meaning: "atlı savaş/güneş arabası", context_sentence: "Helios guided his shining chariot across the sky." },
      { word: "dawn", phonetic: "/dɔːn/", turkish_meaning: "şafak vakti, tan", context_sentence: "He woke up each morning before dawn." },
      { word: "reins", phonetic: "/reɪnz/", turkish_meaning: "dizginler", context_sentence: "The rider held the leather reins firmly." },
      { word: "descended", phonetic: "/dɪˈsen.dɪd/", turkish_meaning: "alçaldı, indi", context_sentence: "The sun slowly descended toward the western ocean." },
    ],
    comprehension_questions: [
      {
        question: "What pulled Helios's golden chariot across the sky?",
        options: ["Two giant eagles", "Four fiery horses", "Winged white bulls", "Sea serpents"],
        correct_answer_index: 1,
        explanation: "The story mentions that the chariot was pulled by four swift horses with fiery manes."
      },
      {
        question: "What happened when the chariot flew across the land?",
        options: ["Snow fell on the cities", "It brought warm light to mountains and towns", "A storm flooded the rivers", "The world became completely dark"],
        correct_answer_index: 1,
        explanation: "The chariot brought warm light to mountains, green valleys, and coastal towns."
      },
      {
        question: "How did Helios return to the east every night?",
        options: ["Through an underground tunnel on foot", "In a golden boat across underground waterways", "By jumping over the stars", "He slept in the western mountains"],
        correct_answer_index: 1,
        explanation: "A golden boat carried Helios and his horses back through underground waterways."
      },
    ],
  },
  {
    id: "myth-02-trojan-horse",
    title: "The Trick of the Trojan Horse",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    topic: "Truva Atı Hilesi",
    desc: "Yıllar süren kuşatmayı tek bir zekice tahta at hilesiyle sona erdiren Yunan savaşçılarının hikayesi.",
    content: "The brave warriors of Greece had surrounded the city of Troy for ten long years. High stone walls protected the city, and neither side could win. One morning, clever Odysseus proposed a cunning plan. The Greeks gathered pine wood and built a colossal hollow wooden horse.\n\nInside the dark belly of the wooden horse, thirty brave soldiers hid quietly. The rest of the Greek army sailed their ships behind a nearby island, pretending to give up. The Trojans thought the statue was a sacred gift for peace and rolled it inside their gates. That midnight, the soldiers climbed down with ropes and opened the city doors.",
    target_words: ["warriors", "cunning", "colossal", "hollow"],
    target_vocabulary: [
      { word: "warriors", phonetic: "/ˈwɒr.i.ərz/", turkish_meaning: "savaşçılar", context_sentence: "Brave warriors protected the ancient castle." },
      { word: "cunning", phonetic: "/ˈkʌn.ɪŋ/", turkish_meaning: "kurnaz, zekice", context_sentence: "Odysseus invented a cunning plan to end the war." },
      { word: "colossal", phonetic: "/kəˈlɒs.əl/", turkish_meaning: "devasa, çok büyük", context_sentence: "They constructed a colossal wooden sculpture." },
      { word: "hollow", phonetic: "/ˈhɒl.əʊ/", turkish_meaning: "içi boş", context_sentence: "Soldiers hid inside the hollow horse." },
    ],
    comprehension_questions: [
      {
        question: "Why couldn't the Greeks defeat Troy for ten years?",
        options: ["They had no ships", "High stone walls protected the city", "The weather was too rainy", "They lost their weapons"],
        correct_answer_index: 1,
        explanation: "The story states that high stone walls protected the city of Troy."
      },
      {
        question: "Who hid inside the giant wooden horse?",
        options: ["Trojan farmers", "Thirty Greek soldiers", "Friendly merchants", "Wild animals"],
        correct_answer_index: 1,
        explanation: "Thirty brave Greek soldiers hid quietly inside the hollow wooden horse."
      },
      {
        question: "What did the Trojans believe the horse was?",
        options: ["A gift of peace", "A piece of firewood", "A merchant cart", "A trap"],
        correct_answer_index: 0,
        explanation: "The Trojans thought the statue was a sacred gift for peace."
      },
    ],
  },
  {
    id: "myth-03-mermaid-song",
    title: "The Mermaid's Whispering Song",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 135,
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    topic: "Deniz Kızı Şarkısı",
    desc: "Masmavi okyanus sularında fırtınalı gecelerde kaybolan denizcilere yol gösteren yardımsever deniz kızının ezgisi.",
    content: "Fishermen along the rocky coast told tales of Marina, a gentle mermaid who lived in a coral grotto. She possessed emerald scales and long shimmering hair like sea kelp. Whenever violent fog rolled across the water, lighthouse lanterns could not pierce the mist. Lost ships risked hitting jagged rocks.\n\nMarina would swim near the shore and sing a melodious song with clear crystal notes. Her enchanting voice guided the captains away from the reefs and toward the calm harbor. Sailors never saw her face clearly, but they left gifts of silver coins and seashell necklaces on the rocks to say thank you.",
    target_words: ["grotto", "shimmering", "melodious", "enchanting"],
    target_vocabulary: [
      { word: "grotto", phonetic: "/ˈɡrɒt.əʊ/", turkish_meaning: "küçük mağara, oyuk", context_sentence: "The mermaid slept in a quiet sea grotto." },
      { word: "shimmering", phonetic: "/ˈʃɪm.ər.ɪŋ/", turkish_meaning: "parıldayan, ışıldayan", context_sentence: "Her hair was shimmering like moonlit waves." },
      { word: "melodious", phonetic: "/məˈləʊ.di.əs/", turkish_meaning: "ezgili, ahenkli", context_sentence: "She sang a sweet melodious tune." },
      { word: "enchanting", phonetic: "/ɪnˈtʃɑːn.tɪŋ/", turkish_meaning: "büyüleyici, mest edici", context_sentence: "Her voice possessed an enchanting quality." },
    ],
    comprehension_questions: [
      {
        question: "What made it difficult for sailors to navigate near the coast?",
        options: ["Extreme heat", "Heavy fog and jagged rocks", "Strong wind blowing inland", "Pirate fleets"],
        correct_answer_index: 1,
        explanation: "Violent fog rolled across the water and lost ships risked hitting jagged rocks."
      },
      {
        question: "How did Marina help lost ships in the mist?",
        options: ["She pushed them with sea turtles", "She lit bonfires on the beach", "She sang a clear song that guided them to safety", "She climbed aboard to steer"],
        correct_answer_index: 2,
        explanation: "Marina sang a melodious song that guided the captains away from reefs toward the harbor."
      },
      {
        question: "What did sailors leave on the rocks as gratitude?",
        options: ["Loaves of fresh bread", "Silver coins and seashell necklaces", "Old compasses", "Fishing nets"],
        correct_answer_index: 1,
        explanation: "They left gifts of silver coins and seashell necklaces on the coastal rocks."
      },
    ],
  },
  {
    id: "myth-04-winged-pegasus",
    title: "Pegasus the Winged Steed",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 138,
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    topic: "Kanatlı At Pegasus",
    desc: "Gökyüzünde bulutlar arasında kanat çırpan ve toynağıyla sihirli ilham pınarları yaratan bembeyaz efsanevi at.",
    content: "Among the highest mountain peaks of Greece lived Pegasus, a magnificent stallion with wide swan-like wings. His coat was as white as fresh mountain snow, and his hooves sparkled like polished silver. Whenever Pegasus touched the hard stone of Mount Helicon with his foot, fresh springs of crystal water burst forth, giving poetic inspiration to anyone who drank.\n\nThe young hero Bellerophon searched for this mythical creature. With the help of a golden bridle from the goddess Athena, he tamed Pegasus. Together, they soared above the clouds faster than the wind, defending peaceful villages from fearsome monsters before Pegasus flew up to live among the stars.",
    target_words: ["magnificent", "stallion", "bridle", "soared"],
    target_vocabulary: [
      { word: "magnificent", phonetic: "/mæɡˈnɪf.ɪ.sənt/", turkish_meaning: "muhteşem, görkemli", context_sentence: "Pegasus was a magnificent winged creature." },
      { word: "stallion", phonetic: "/ˈstæl.jən/", turkish_meaning: "aygır, erkek at", context_sentence: "The white stallion galloped through the clouds." },
      { word: "bridle", phonetic: "/ˈbraɪ.dəl/", turkish_meaning: "at yuları, gem", context_sentence: "The hero held a magical golden bridle." },
      { word: "soared", phonetic: "/sɔːd/", turkish_meaning: "gökyüzünde süzüldü, yükseldi", context_sentence: "They soared high into the cloudless blue sky." },
    ],
    comprehension_questions: [
      {
        question: "What happened when Pegasus struck Mount Helicon with his hoof?",
        options: ["Gold coins rained down", "A fresh spring of inspiring water burst forth", "The mountain collapsed", "A rainbow appeared in the lake"],
        correct_answer_index: 1,
        explanation: "Fresh springs of crystal water burst forth, giving poetic inspiration to all who drank."
      },
      {
        question: "Who helped the hero Bellerophon tame Pegasus?",
        options: ["Goddess Athena with a golden bridle", "Zeus with a lightning bolt", "Poseidon with a trident", "Apollo with a golden bow"],
        correct_answer_index: 0,
        explanation: "The goddess Athena gave Bellerophon a golden bridle to tame Pegasus."
      },
      {
        question: "Where did Pegasus eventually go to live?",
        options: ["In an underwater cavern", "Among the stars in the night sky", "In a farmer's stable", "In a dense pine forest"],
        correct_answer_index: 1,
        explanation: "The story concludes with Pegasus flying up to live among the stars."
      },
    ],
  },
  {
    id: "myth-05-irish-leprechaun",
    title: "The Leprechaun's Golden Rainbow",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 142,
    coverImage: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80",
    topic: "İrlanda Gökkuşağı Cini",
    desc: "Zümrüt yeşili çayırlarda minik çekiç sesiyle ayakkabı tamir eden ve altın dolu çömleğini saklayan neşeli peri.",
    content: "In the rolling green hills of Ireland, folklore tells of the leprechauns, solitary fairy cobblers dressed in emerald coats and polished leather buckles. If you walk quietly through the morning clover, you might hear a tiny tapping sound: 'tap-tap-tap'. That is the fairy mending tiny leather shoes with his silver hammer.\n\nLegend says each leprechaun hides an iron pot brimming with sparkling gold coins at the end of a rainbow. Catching one is nearly impossible, for they are clever tricksters. If you blink your eyes for half a second, the tiny cobbler vanishes into the ferns with a merry laugh, leaving behind only sweet clover blossom scent.",
    target_words: ["folklore", "cobblers", "brimming", "tricksters"],
    target_vocabulary: [
      { word: "folklore", phonetic: "/ˈfəʊk.lɔːr/", turkish_meaning: "halk bilimi, efsaneler", context_sentence: "Irish folklore is rich with fairy tales." },
      { word: "cobblers", phonetic: "/ˈkɒb.lərz/", turkish_meaning: "ayakkabı tamircileri", context_sentence: "Fairy cobblers make tiny shoes for forest elves." },
      { word: "brimming", phonetic: "/ˈbrɪm.ɪŋ/", turkish_meaning: "ağzına kadar dolu", context_sentence: "The clay pot was brimming with gold coins." },
      { word: "tricksters", phonetic: "/ˈtrɪk.stərz/", turkish_meaning: "hilebazlar, muzip şakacılar", context_sentence: "The forest sprites were famous tricksters." },
    ],
    comprehension_questions: [
      {
        question: "What trade do Irish leprechauns practice according to the tale?",
        options: ["Blacksmiths", "Shoe cobblers", "Bakers", "Fishermen"],
        correct_answer_index: 1,
        explanation: "The story describes them as solitary fairy cobblers mending tiny leather shoes."
      },
      {
        question: "Where do leprechauns hide their pot of gold?",
        options: ["Under church towers", "At the end of a rainbow", "Inside wooden wells", "Beneath river waterfalls"],
        correct_answer_index: 1,
        explanation: "Legend says each leprechaun hides an iron pot brimming with gold coins at the end of a rainbow."
      },
      {
        question: "What happens if you blink while watching a leprechaun?",
        options: ["He turns into a toad", "He instantly vanishes into the ferns", "He gives you three wishes", "He asks for bread"],
        correct_answer_index: 1,
        explanation: "If you blink for half a second, the leprechaun vanishes with a merry laugh."
      },
    ],
  },

  // ==========================================
  // LEVEL B (B1-B2, ~230-280 kelime, 4-5 dk)
  // ==========================================
  {
    id: "myth-06-atlantis-mystery",
    title: "The Underwater Enigma of Atlantis",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 255,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    topic: "Kayıp Kıta Atlantis",
    desc: "Platon'un anlattığı, eşmerkezli su halkaları ve orikalkum kaplı saraylarıyla okyanusun derinliklerine batan efsanevi ada.",
    content: "More than two millennia ago, the Athenian philosopher Plato documented the captivating tale of Atlantis in his dialogues Timaeus and Critias. He recounted how this island empire, situated beyond the Pillars of Hercules, was founded by the sea god Poseidon for his mortal love Cleito. The city was constructed in brilliant concentric rings of navigable waterways and fertile land bridges, joined together by grand stone aqueducts and fortified harbors.\n\nWithin this prosperous maritime realm, palaces were clad in red, black, and white quarried stone, crowned with roofs of gleaming orichalcum—a legendary metal reflecting warm bronze hues. Ships from distant corners of the Mediterranean docked at its bustling quays, laden with rare timber, precious gems, and aromatic resins. For generations, Atlantean rulers governed with temperance, virtue, and profound scientific intellect.\n\nYet, as generations passed, divine virtue was overshadowed by human vanity and imperial hubris. The citizens built mighty fleets to conquer neighboring lands, abandoning their sacred reverence for harmony. Provoked by this boundless ambition, Zeus summoned violent earthquakes and massive ocean surges. In a single terrifying day and night, the monumental citadel collapsed and disappeared forever into the unfathomable depths of the Atlantic Ocean.",
    target_words: ["concentric", "orichalcum", "temperance", "hubris"],
    target_vocabulary: [
      { word: "concentric", phonetic: "/kənˈsen.trɪk/", turkish_meaning: "iç içe geçmiş, eşmerkezli", context_sentence: "Canals were arranged in concentric circles around the central hill." },
      { word: "orichalcum", phonetic: "/ˌɔː.rɪˈkæl.kəm/", turkish_meaning: "orikalkum (efsanevi kırmızımsı bronz alaşım)", context_sentence: "Temple towers flashed with sheets of polished orichalcum." },
      { word: "temperance", phonetic: "/ˈtem.pər.əns/", turkish_meaning: "ölçülülük, itidal", context_sentence: "Early kings ruled their kingdom with wisdom and temperance." },
      { word: "hubris", phonetic: "/ˈhjuː.brɪs/", turkish_meaning: "aşırı kibir, haddini aşma", context_sentence: "Their imperial hubris provoked inevitable devastation." },
    ],
    comprehension_questions: [
      {
        question: "How was the architectural layout of Atlantis arranged?",
        options: ["In a square grid pattern", "In concentric rings of waterways and land bridges", "Inside a hollow volcanic cone", "Along a single straight coastline"],
        correct_answer_index: 1,
        explanation: "Plato described the city as built in concentric rings of navigable waterways and land bridges."
      },
      {
        question: "What legendary metal was used to adorn the royal palaces?",
        options: ["Mithril", "Electrum", "Orichalcum", "Platinum"],
        correct_answer_index: 2,
        explanation: "Palace roofs were crowned with gleaming orichalcum, reflecting warm bronze hues."
      },
      {
        question: "What moral flaw brought about the destruction of Atlantis?",
        options: ["Poverty and famine", "Vanity and imperial hubris", "Ignorance of navigation", "Fierce civil war between farmers"],
        correct_answer_index: 1,
        explanation: "Human vanity and imperial hubris led the Atlanteans to conquer others, invoking cataclysmic punishment."
      },
    ],
  },
  {
    id: "myth-07-shahmaran-serpents",
    title: "The Legend of Shahmaran, Queen of Serpents",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80",
    topic: "Şahmeran Efsanesi",
    desc: "Anadolu ve Mezopotamya masallarında bilgeliğin, şifanın ve fedakarlığın simgesi yarı kadın yarı yılan Şahmeran.",
    content: "Deep beneath the rugged limestone plateaus of southeastern Anatolia lay a wondrous subterranean garden filled with crystalline streams and eternal blossoms. Here reigned Shahmaran, a mythical queen whose upper body was that of a graceful, compassionate woman, while her lower half was a shimmering serpent. She was the guardian of botanical wisdom and the secret cures for all earthly ailments.\n\nOne day, a poor young woodcutter named Camsab accidentally fell into a deep well while harvesting honey. Discovering the enchanted garden, he lived alongside Shahmaran for years, learning ancient philosophy and herbal medicine from her gentle lips. Though she treated him like family, Camsab grew homesick and pleaded to return to his village. Shahmaran granted his freedom on one condition: he must never reveal her secret dwelling nor enter a public bathhouse, as exposure to water would turn his skin into serpent scales.\n\nYears later, the kingdom's sultan fell mortally ill. The wicked grand vizier knew that only the broth of Shahmaran could save him. Recognizing the serpent scales on Camsab's body during an interrogation, soldiers forced him to lead them to the cavern. Understanding her fate with selfless grace, Shahmaran willingly sacrificed herself, leaving herbal wisdom that cured the sick and punished the greedy.",
    target_words: ["subterranean", "compassionate", "ailments", "selfless"],
    target_vocabulary: [
      { word: "subterranean", phonetic: "/ˌsʌb.təˈreɪ.ni.ən/", turkish_meaning: "yer altı, yer altındaki", context_sentence: "They discovered a subterranean cavern of radiant crystals." },
      { word: "compassionate", phonetic: "/kəmˈpæʃ.ən.ət/", turkish_meaning: "merhametli, şefkatli", context_sentence: "Shahmaran was a compassionate queen to all creatures." },
      { word: "ailments", phonetic: "/ˈeɪl.mənts/", turkish_meaning: "hastalıklar, dertler", context_sentence: "Her medicinal herbs cured serious physical ailments." },
      { word: "selfless", phonetic: "/ˈself.ləs/", turkish_meaning: "özverili, bencil olmayan", context_sentence: "Her selfless sacrifice protected the village and the youth." },
    ],
    comprehension_questions: [
      {
        question: "What physical form did the mythical queen Shahmaran possess?",
        options: ["Half woman and half bird", "Half woman and half serpent", "A golden winged lion", "A giant talking wolf"],
        correct_answer_index: 1,
        explanation: "Her upper body was that of a graceful woman, while her lower half was a shimmering serpent."
      },
      {
        question: "What would happen to Camsab if his skin came into contact with water?",
        options: ["He would turn into stone", "His skin would display serpent scales", "He would lose his memory", "He would become invisible"],
        correct_answer_index: 1,
        explanation: "Shahmaran warned him that contact with water would reveal serpent scales on his skin."
      },
      {
        question: "Why was the grand vizier desperately seeking Shahmaran?",
        options: ["To steal her gold treasures", "To brew a healing broth for the dying sultan", "To build an underground castle", "To capture her serpent army"],
        correct_answer_index: 1,
        explanation: "The vizier knew that only the broth of Shahmaran could cure the sultan's mortal illness."
      },
    ],
  },
  {
    id: "myth-08-thors-hammer-mjolnir",
    title: "Mjolnir: The Forge of Thor's Hammer",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 265,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    topic: "Thor'un Çekici Mjolnir",
    desc: "Cüce ustalar Brokk ve Sindri'nin yeraltı ocağında dövdüğü, yıldırımları çağıran yıkılmaz çekiç Mjolnir'in doğuşu.",
    content: "In the fiery cavern smithies of Svartalfheim, the skilled dwarven craftsmen Brokk and Sindri accepted a daring wager against Loki, the trickster god of Asgard. Loki claimed the brothers could never forge treasures to rival the golden creations of other elven artisans. Determined to defend their blacksmithing pride, Sindri placed celestial iron and glowing coals into their roaring furnace, instructing Brokk to pump the bellows without pausing for a single heartbeat.\n\nJealous and desperate to win his wager, Loki transformed himself into a stinging black gadfly. He buzzed into the sweltering forge and bit Brokk on his hand, then on his neck. Despite the stinging agony, the stalwart dwarf continued pumping relentlessly. Finally, Loki stung Brokk squarely above his eyelid, causing blood to stream down into his eye. Brokk paused for a fraction of a second to wipe the blood away.\n\nWhen Sindri pulled the glowing metal from the hearth, the masterpiece was complete: Mjolnir, the mighty war hammer. Because of the brief interruption, its handle was slightly short. Yet the weapon held immense enchantments. When wielded by Thor, god of thunder, it could smash through granite mountains, summon blinding lightning storms, and always boomerang back faithfully to his iron gauntlet. The gods of Asgard proclaimed it the supreme protector against the frost giants.",
    target_words: ["craftsmen", "bellows", "stalwart", "enchantments"],
    target_vocabulary: [
      { word: "craftsmen", phonetic: "/ˈkrɑːfts.mən/", turkish_meaning: "zanaatkârlar, ustalar", context_sentence: "Dwarven craftsmen were renowned for their unmatched metalwork." },
      { word: "bellows", phonetic: "/ˈbel.əʊz/", turkish_meaning: "körük (ateşi harlamak için)", context_sentence: "He pumped the leather bellows to raise the furnace heat." },
      { word: "stalwart", phonetic: "/ˈstɔːl.wət/", turkish_meaning: "sağlam, boyun eğmez, vefakar", context_sentence: "The stalwart smith refused to drop his tools." },
      { word: "enchantments", phonetic: "/ɪnˈtʃɑːnt.mənts/", turkish_meaning: "büyüler, tılsımlar", context_sentence: "Powerful enchantments made the war hammer invincible." },
    ],
    comprehension_questions: [
      {
        question: "Who forged the magical war hammer Mjolnir?",
        options: ["Odin and Thor", "Brokk and Sindri", "Loki and Heimdall", "The giants of Jotunheim"],
        correct_answer_index: 1,
        explanation: "The dwarven brothers Brokk and Sindri forged the hammer in their underground workshop."
      },
      {
        question: "Why was the handle of Mjolnir slightly shorter than intended?",
        options: ["They ran out of celestial iron", "Loki stung Brokk above his eyelid, causing a brief pause", "Sindri dropped it in the water", "Thor requested a smaller grip"],
        correct_answer_index: 1,
        explanation: "Loki stung Brokk's eyelid as a gadfly, forcing him to pause the bellows for half a second."
      },
      {
        question: "What unique property did Mjolnir possess when thrown?",
        options: ["It vanished into mist", "It turned into gold", "It always returned to Thor's gauntlet", "It grew roots into the earth"],
        correct_answer_index: 2,
        explanation: "Whenever thrown, Mjolnir always boomeranged back faithfully to Thor's iron gauntlet."
      },
    ],
  },
  {
    id: "myth-09-anubis-temple",
    title: "The Temple of Anubis and the Weighing of Hearts",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 250,
    coverImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    topic: "Mısır Anubis Tapınağı",
    desc: "Nil kıyısındaki antik tapınaklarda ruhun kaderini belirleyen altın terazi ve Ma'at tüyü töreni.",
    content: "In the shadow of the colossal limestone pyramids along the Nile River, ancient Egyptian priests conducted solemn ceremonies in honor of Anubis, the jackal-headed guardian of the necropolis and patron of embalming. According to sacred hieroglyphic texts, Anubis served as the divine guide escorting souls across the threshold of mortal life into the Hall of Two Truths.\n\nWithin this shadowy judgment hall stood a balance scale of gilded bronze. The deceased stood before the divine court as Anubis carefully extracted their heart and placed it upon one pan of the scale. On the opposing pan, he rested the pristine white ostrich feather of Ma'at, representing cosmic truth, harmony, and righteousness. Thoth, the ibis-headed scribe, stood nearby holding a reed pen to record the verdict.\n\nIf the departed had lived an honorable life free of cruelty and deceit, the heart balanced as light as the feather. Anubis would then usher the joyous soul into the paradisiacal Reed Fields of Osiris. However, if the heart was weighed down by misdeeds and wickedness, it plummeted heavily, where the monstrous chimera Ammit swallowed it, extinguishing the unworthy soul from eternity.",
    target_words: ["necropolis", "embalming", "pristine", "verdict"],
    target_vocabulary: [
      { word: "necropolis", phonetic: "/nəˈkrɒp.əl.ɪs/", turkish_meaning: "antik mezarlık, nekropol", context_sentence: "Priests guarded the tombs of the desert necropolis." },
      { word: "embalming", phonetic: "/ɪmˈbɑː.mɪŋ/", turkish_meaning: "mumyalama", context_sentence: "Anubis was the divine patron of embalming rituals." },
      { word: "pristine", phonetic: "/ˈprɪs.tiːn/", turkish_meaning: "kusursuz, lekesiz, el değmemiş", context_sentence: "The feather of Ma'at was pristine and weightless." },
      { word: "verdict", phonetic: "/ˈvɜː.dɪkt/", turkish_meaning: "hüküm, nihai karar", context_sentence: "Thoth inscribed the divine verdict on a scroll." },
    ],
    comprehension_questions: [
      {
        question: "What animal head did the Egyptian deity Anubis have?",
        options: ["Falcon", "Jackal", "Lion", "Crocodile"],
        correct_answer_index: 1,
        explanation: "Sacred texts describe Anubis as the jackal-headed guardian."
      },
      {
        question: "What was placed on the opposite side of the balance scale against the heart?",
        options: ["A silver scarab beetle", "A gold coin", "The ostrich feather of Ma'at", "A cup of Nile water"],
        correct_answer_index: 2,
        explanation: "Anubis placed the pristine white ostrich feather of Ma'at to test the soul's purity."
      },
      {
        question: "Where did souls go if their heart proved as light as the feather?",
        options: ["Into eternal sleep", "To the Reed Fields of Osiris", "Back to the mortal world", "Into the desert sands"],
        correct_answer_index: 1,
        explanation: "Pure souls were ushered into the paradisiacal Reed Fields of Osiris."
      },
    ],
  },
  {
    id: "myth-10-arthur-excalibur",
    title: "King Arthur and the Sword of Excalibur",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    topic: "Kral Arthur ve Excalibur",
    desc: "Gölün Hanımı'ndan alınan, adalet ve şövalyelik yeminiyle Britanya'yı birleştiren efsanevi kılıç Excalibur.",
    content: "When darkness and civil discord threatened ancient Britain, young Arthur showed his divine right to rule by pulling a mysterious broadsword from a granite anvil in London. Yet, during an arduous duel with a rebellious knight, that original steel shattered into fragments. Guiding the grieving monarch across the misty moors, the wizard Merlin led him to an enchanted glassy lake hidden within the whispering woods of Avalon.\n\nAs Arthur gazed out over the silent water, a breathtaking vision manifested: a slender arm draped in shimmering white samite rose from the lake, brandishing a magnificent broadsword. Its hilt was encrusted with sapphires and rubies, while two serpents of woven gold curled around the pommel. Merlin explained that this was Excalibur, forged in the fairy realms by the Lady of the Lake.\n\nArthur rowed across in a small skiff and received the blade with solemn reverence. Merlin reminded him that the magical scabbard was even more precious than the blade, for whoever wore it would never bleed from battle wounds. Armed with Excalibur, Arthur rallied the Knights of the Round Table, establishing the chivalric realm of Camelot where strength served justice rather than tyranny.",
    target_words: ["discord", "arduous", "samite", "scabbard"],
    target_vocabulary: [
      { word: "discord", phonetic: "/ˈdɪs.kɔːd/", turkish_meaning: "anlaşmazlık, nifak", context_sentence: "Civil discord divided the warring tribes of Britain." },
      { word: "arduous", phonetic: "/ˈɑː.dʒu.əs/", turkish_meaning: "çetin, çok zahmetli", context_sentence: "They survived an arduous battle in the misty valley." },
      { word: "samite", phonetic: "/ˈsæm.aɪt/", turkish_meaning: "samit (ipek ve altın işlemeli ağır kumaş)", context_sentence: "The mystic arm was clothed in white samite." },
      { word: "scabbard", phonetic: "/ˈskæb.əd/", turkish_meaning: "kılıç kını", context_sentence: "The enchanted scabbard prevented loss of blood." },
    ],
    comprehension_questions: [
      {
        question: "Where did Arthur receive the legendary sword Excalibur?",
        options: ["From a stone in a London courtyard", "From the Lady of the Lake in an enchanted lake", "From a dragon's cave", "From the high altar of Camelot"],
        correct_answer_index: 1,
        explanation: "Arthur received Excalibur from the mystic arm of the Lady of the Lake rising from the water."
      },
      {
        question: "Why was Excalibur's scabbard considered more valuable than the blade itself?",
        options: ["It could shoot golden arrows", "It prevented the wearer from bleeding from battle wounds", "It made the knight invisible", "It could talk and predict the future"],
        correct_answer_index: 1,
        explanation: "Merlin explained that whoever wore the scabbard would never bleed from battle wounds."
      },
      {
        question: "What core ideal did King Arthur establish with the Knights of the Round Table?",
        options: ["Accumulating great personal wealth", "Ruling through tyrannical force", "Using strength to uphold justice and chivalry", "Conquering all overseas lands"],
        correct_answer_index: 2,
        explanation: "Arthur established Camelot so that strength would serve justice and honor rather than tyranny."
      },
    ],
  },

  // ==========================================
  // LEVEL C (C1-C2, ~330-380 kelime, 5-6 dk)
  // ==========================================
  {
    id: "myth-11-yggdrasil-nine-realms",
    title: "Yggdrasil: Cosmic Axis and the Nine Realms",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
    topic: "İskandinav Kozmolojisi & Yggdrasil",
    desc: "Dokuz diyarı birbirine bağlayan kadim dünya ağacı Yggdrasil, kaderin iplikleri ve evrensel denge.",
    content: "In the profound metaphysical architecture of Norse cosmology, the universe is conceptualized not as a detached mechanical void, but as an organic, living totality centered upon Yggdrasil—the monumental World Ash Tree. Towering across the primordial expanse of Ginnungagap, its branches sustain the canopy of the heavens, while three gargantuan subterranean roots anchor into fundamentally distinct metaphysical realms of reality.\n\nThe first root penetrates Asgard, the celestial citadel of the Aesir deities, where the radiant rainbow bridge Bifrost connects divine halls to mortal Midgard. The second root plunges into the frosty waste of Jotunheim, terminating beside Mimir's Well—the sacred reservoir of cosmic comprehension where Odin sacrificed his right eye to obtain transcendent illumination. The third root descends into the freezing abyss of Niflheim, hovering directly above Hvergelmir, the churning primordial spring. Here, the serpentine wyrm Nidhogg relentlessly gnaws at the living wood, personifying the inexorable thermodynamic entropy that slowly erodes every cosmic structure.\n\nBeside the sacred Well of Urd beneath the ash tree's canopy reside the three Norns: Urd (Fate), Verdandi (Present Being), and Skuld (Future Necessity). These enigmatic weavers do not merely observe the passage of temporal events; they actively carve irrevocable destinies into the fibrous bark. Daily, they draw loam-infused water from the crystalline spring to nourish the colossal limbs, defending the tree against rot.\n\nYggdrasil stands as a contemplative monument to ecological interdependence and cosmic fragility. It depicts an existence continuously besieged by entropic dissolution yet maintained through reciprocal vigilance and conscious sacrifice. Even as ancient prophecies presage the catastrophic twilight of Ragnarok—when the sky will fracture and the cosmic ash tree will shudder in agony—Yggdrasil endures the inferno, safeguarding within its trunk the seeds of human rebirth to regenerate a verdant, tranquil tomorrow.",
    target_words: ["totality", "illumination", "inexorable", "irrevocable"],
    target_vocabulary: [
      { word: "totality", phonetic: "/təʊˈtæl.ə.ti/", turkish_meaning: "bütünlük, tümlük", context_sentence: "The cosmic tree represents the organic totality of the universe." },
      { word: "illumination", phonetic: "/ɪˌluː.mɪˈneɪ.ʃən/", turkish_meaning: "aydınlanma, irfan", context_sentence: "Odin traded his eye to achieve transcendent spiritual illumination." },
      { word: "inexorable", phonetic: "/ɪnˈek.sər.ə.bəl/", turkish_meaning: "durdurulamaz, amansız", context_sentence: "The serpent symbolizes the inexorable passage of entropy." },
      { word: "irrevocable", phonetic: "/ɪˈrev.ə.kə.bəl/", turkish_meaning: "geri dönülemez, değiştirilemez", context_sentence: "The Norns carve irrevocable destinies into the tree." },
    ],
    comprehension_questions: [
      {
        question: "What physical sacrifice did Odin make at Mimir's Well?",
        options: ["His golden spear", "His right eye", "His winged helmet", "His memory of childhood"],
        correct_answer_index: 1,
        explanation: "Odin surrendered his right eye at Mimir's Well to obtain transcendent cosmic comprehension."
      },
      {
        question: "What metaphysical concept does the gnawing serpent Nidhogg embody?",
        options: ["Fertility and renewal", "Thermodynamic entropy and inevitable decay", "Cold oceanic currents", "The seasonal rhythm of winter"],
        correct_answer_index: 1,
        explanation: "Nidhogg embodies the inexorable thermodynamic entropy that gradually erodes all worldly order."
      },
      {
        question: "What is the primary role of the three Norns residing at the Well of Urd?",
        options: ["Guarding the gates against giants", "Weaving and carving the irrevocable destinies of existence", "Brewing mead for fallen warriors", "Polishing Thor's armor"],
        correct_answer_index: 1,
        explanation: "The Norns actively weave and carve the irrevocable destinies of gods and mortals alike into the tree bark."
      },
    ],
  },
  {
    id: "myth-12-gilgamesh-immortality",
    title: "Gilgamesh and the Epic Quest for Immortality",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    topic: "Gılgamış'ın Ölümsüzlük Arayışı",
    desc: "Uruk kralı Gılgamış'ın Enkidu'nun ölümünün ardından fani varoluşun sınırlarını zorladığı antik Mezopotamya destanı.",
    content: "Inscribed upon twelve clay tablets excavated from the scorched ruins of Nineveh, the Epic of Gilgamesh constitutes humanity's earliest surviving literary masterpiece. Gilgamesh, the formidable sovereign of Uruk—two-thirds divine and one-third mortal—ruled with absolute martial dominance. Yet his life transformed when the gods fashioned Enkidu, a primal wild man whose companionship softened the monarch's tyrannical arrogance into brotherhood.\n\nWhen Enkidu succumbed to a lingering, agonized illness sent by vengeful deities, Gilgamesh confronted the unbearable existential abyss of mortality. Paralyzed by grief and terror, he abandoned his royal robes and embarked upon a harrowing pilgrimage across the Waters of Death to consult Utnapishtim, the sole human survivor granted eternal life after surviving the primordial deluge. After traversing pitch-black mountain caverns and navigating treacherous currents with punt-poles, Gilgamesh arrived at the world's edge.\n\nUtnapishtim challenged the weary king to conquer sleep for six days and seven nights as proof of his readiness for immortality; Gilgamesh immediately collapsed into exhaustion. Sympathetic to his tragic yearning, Utnapishtim disclosed a secret: a spiny underwater plant growing on the ocean floor that could rejuvenate the elderly. Gilgamesh tied heavy basalt stones to his feet, sank to the ocean bed, and plucked the wondrous botanical prize.\n\nHowever, while bathing in a cool desert spring during his homeward journey, a water serpent smelled the fragrant plant, slithered from the reeds, and consumed it, instantly sloughing off its aged skin in renewed youth. Weeping beside the water, Gilgamesh realized that physical immortality is denied to mankind. Returning to Uruk, he looked upon its monumental baked-brick walls and realized that true immortality resides in the enduring cultural achievements and memories left for posterity.",
    target_words: ["formidable", "deluge", "rejuvenate", "posterity"],
    target_vocabulary: [
      { word: "formidable", phonetic: "/fɔːˈmɪd.ə.bəl/", turkish_meaning: "korkutucu, yenilmez, heybetli", context_sentence: "Gilgamesh was a formidable king of ancient Mesopotamia." },
      { word: "deluge", phonetic: "/ˈdel.juːdʒ/", turkish_meaning: "büyük tufan, sel", context_sentence: "Utnapishtim survived the catastrophic primordial deluge." },
      { word: "rejuvenate", phonetic: "/rɪˈdʒuː.vən.eɪt/", turkish_meaning: "gençleştirmek, canlandırmak", context_sentence: "The underwater plant could rejuvenate old age into youth." },
      { word: "posterity", phonetic: "/pɒsˈter.ə.ti/", turkish_meaning: "gelecek nesiller, ahali", context_sentence: "He built monumental walls to preserve his legacy for posterity." },
    ],
    comprehension_questions: [
      {
        question: "What emotional crisis propelled Gilgamesh to embark on his quest?",
        options: ["The loss of his royal crown", "The tragic death of his companion Enkidu", "A famine striking the fields of Uruk", "An invasion by rival Babylonian kings"],
        correct_answer_index: 1,
        explanation: "The death of his beloved friend Enkidu forced Gilgamesh to confront his own mortality and fear of death."
      },
      {
        question: "What test did Utnapishtim give Gilgamesh to assess his readiness for immortality?",
        options: ["Slaving a seven-headed dragon", "Staying awake for six days and seven nights", "Swimming across the Persian Gulf", "Carving an epic poem on stone"],
        correct_answer_index: 1,
        explanation: "Utnapishtim tested him by challenging him to stay awake for six days and seven nights, which he failed."
      },
      {
        question: "How did Gilgamesh ultimately redefine the concept of immortality?",
        options: ["By drinking liquid mercury", "By accepting that human legacy lives through cultural works and achievements", "By becoming a god in the underworld", "By establishing a dynasty of long-lived descendants"],
        correct_answer_index: 1,
        explanation: "Gilgamesh recognized that true human immortality exists in the enduring creations and cultural monuments left for posterity."
      },
    ],
  },
  {
    id: "myth-13-prometheus-stolen-fire",
    title: "Prometheus and the Stolen Spark of Fire",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    topic: "Prometheus ve Çalınan Ateş",
    desc: "İnsanlığa aklı, teknolojiyi ve ateşi hediye eden Titan Prometheus'un Kafkas dağlarındaki trajik fedakarlığı.",
    content: "In classical Hellenic mythology, Prometheus, whose very name denotes 'forethought', belonged to the archaic race of Titans who preceded Olympian hegemony. When Zeus ascended the throne of Mount Olympus after the Titanomachy, he regarded embryonic humanity as feeble, crude beings unworthy of divine empathy. Zeus deliberately withheld fire, leaving mortals shivering in subterranean caves, vulnerable to predatory beasts and incapable of advancing beyond primeval ignorance.\n\nMoved by profound benevolence for mortal suffering, Prometheus committed the ultimate transgression against Olympian orthodoxy. Ascending Olympus under cover of twilight, he touched the glowing axle of the sun chariot with a dried fennel stalk, trapping a smoldering ember within the pith. Descending covertly to earth, he bestowed this celestial spark upon mankind. Fire was not merely a thermal source; it served as the catalytic catalyst for civilization—enabling metallurgy, agriculture, cookery, and abstract scientific philosophy.\n\nZeus's retribution was swift and merciless. He commanded Hephaestus to forge unbreakable adamantine chains and bind Prometheus to the precipitous cliffs of Mount Caucasus. Each dawn, a colossal eagle plummeted from the clouds to tear into the Titan's liver. Because Prometheus was immortal, the organ regenerated entirely throughout the freezing night, condemning him to an unending cycle of biological torment.\n\nPrometheus remained unyielding throughout centuries of agony, refusing to beg for royal clemency or disclose his prophetic knowledge regarding Zeus's eventual downfall. His enduring defiance transformed him into the archetypal martyr of enlightenment—a testament to intellect, rebel altruism, and the perilous cost of elevating human consciousness above primitive subjugation.",
    target_words: ["hegemony", "transgression", "adamantine", "clemency"],
    target_vocabulary: [
      { word: "hegemony", phonetic: "/hɪˈɡem.ə.ni/", turkish_meaning: "hegemonya, mutlak hakimiyet", context_sentence: "Zeus established unchallenged hegemony over gods and men." },
      { word: "transgression", phonetic: "/trænzˈɡreʃ.ən/", turkish_meaning: "haddi aşma, yasayı çiğneme", context_sentence: "Stealing sacred fire was deemed an unforgivable transgression." },
      { word: "adamantine", phonetic: "/ˌæd.əˈmæn.tiːn/", turkish_meaning: "elmas sertliğinde, kırılmaz", context_sentence: "He was bound to the rocks with adamantine chains." },
      { word: "clemency", phonetic: "/ˈklem.ən.si/", turkish_meaning: "af, merhamet", context_sentence: "The defiant Titan refused to beg the tyrant for clemency." },
    ],
    comprehension_questions: [
      {
        question: "How did Prometheus transport the divine ember to humanity?",
        options: ["Inside a bronze lamp", "Concealed within the pith of a dry fennel stalk", "Inside an iron helmet", "Wrapped in wet olive leaves"],
        correct_answer_index: 1,
        explanation: "He trapped the smoldering celestial spark within the hollow pith of a dried fennel stalk."
      },
      {
        question: "What deeper symbolic meaning did the gift of fire represent?",
        options: ["Only physical warmth during winter", "A divine curse on agriculture", "The catalytic foundation for technology, arts, and human intellect", "A weapon to overthrow Olympus"],
        correct_answer_index: 2,
        explanation: "Fire was the catalyst for human civilization, enabling metallurgy, cookery, science, and intellect."
      },
      {
        question: "Why did Prometheus's punishment repeat continuously every day?",
        options: ["He was reborn as a mortal every morning", "His immortal liver regenerated every night after the eagle ate it", "The chains broke and were reforged each sunset", "Zeus forgot what happened the day before"],
        correct_answer_index: 1,
        explanation: "Because he was an immortal Titan, his liver regenerated completely overnight, renewing the torment daily."
      },
    ],
  },
  {
    id: "myth-14-quetzalcoatl-cosmology",
    title: "Quetzalcoatl: The Feathered Serpent of Aztec Cosmology",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    topic: "Aztek Tüylü Yılanı Quetzalcoatl",
    desc: "Mesoamerika mitolojisinde gökyüzü ile yerin birliğini, rüzgarı, mısırı ve bilgiyi simgeleyen Tüylü Yılan.",
    content: "In the complex theological framework of pre-Columbian Mesoamerica, few deities commanded as vast an ontological presence as Quetzalcoatl, the 'Feathered Serpent'. Representing a synthesis of terrestrial reptilian power and ethereal avian transcendence, Quetzalcoatl embodied the harmonious union of matter and spirit, dirt and celestial cosmos. Unlike darker deities who demanded human blood sacrifices to maintain solar momentum, Quetzalcoatl was revered as a patron of literature, calendar calculation, metallurgy, and peaceful priesthood.\n\nAccording to the Aztec creation cycle known as the Legend of the Five Suns, humanity had been repeatedly obliterated in four previous cosmic epochs due to cosmic cataclysms. To initiate the Fifth Sun, Quetzalcoatl descended into the grim subterranean underworld of Mictlan. Confronting Mictlantecuhtli, the skeletal lord of the dead, he retrieved the fossilized bones of ancestors, outwitted infernal pitfalls, and escaped back to the surface world.\n\nAt the sacred city of Tamoanchan, the goddess Cihuacoatl ground the ancient bones into fine flour, upon which Quetzalcoatl spilled his own divine blood. From this sacred dough, modern mankind was shaped, instilling a spark of celestial divinity within mortal clay. Furthermore, Quetzalcoatl transformed into a humble black ant to penetrate a granite mountain and retrieve kernels of sacred maize, gifting agriculture to the newly birthed race.\n\nWhen treacherous political rivalries orchestrated by Tezcatlipoca forced Quetzalcoatl into exile from the sacred city of Tula, he set sail into the Gulf of Mexico upon a raft of woven serpents. As he departed toward the dawn, his spirit transformed into the morning star, Venus, leaving behind a solemn prophecy that he would return across the eastern ocean to restore cosmological balance and ethical harmony.",
    target_words: ["ontological", "transcendence", "cataclysms", "instilling"],
    target_vocabulary: [
      { word: "ontological", phonetic: "/ˌɒn.təˈlɒdʒ.ɪ.kəl/", turkish_meaning: "ontolojik, varoluşsal", context_sentence: "The deity represented a profound ontological mystery." },
      { word: "transcendence", phonetic: "/trænˈsen.dəns/", turkish_meaning: "aşkınlık, yücelik", context_sentence: "Avian feathers symbolized spiritual transcendence over earthly soil." },
      { word: "cataclysms", phonetic: "/ˈkæt.ə.klɪz.əmz/", turkish_meaning: "büyük felaketler, tufanlar", context_sentence: "Four past cosmic epochs ended in destructive cataclysms." },
      { word: "instilling", phonetic: "/ɪnˈstɪl.ɪŋ/", turkish_meaning: "aşılamak, yerleştirmek", context_sentence: "Divine sacrifice was responsible for instilling humanity with spirit." },
    ],
    comprehension_questions: [
      {
        question: "What two opposing concepts are symbolically united in the Feathered Serpent?",
        options: ["Fire and ice", "Terrestrial earth (reptile) and spiritual celestial sky (bird)", "Day and eternal night", "Youth and decrepit old age"],
        correct_answer_index: 1,
        explanation: "Quetzalcoatl unites the terrestrial snake of the earth with the transcendence of bird feathers."
      },
      {
        question: "How did Quetzalcoatl and Cihuacoatl create the people of the Fifth Sun?",
        options: ["From carved volcanic basalt", "By mixing ground ancestral bones from the underworld with divine blood", "From river mud and gold dust", "By weaving maize stalks"],
        correct_answer_index: 1,
        explanation: "They ground ancient ancestral bones retrieved from Mictlan and mixed them with Quetzalcoatl's divine blood."
      },
      {
        question: "Into what celestial body did Quetzalcoatl transform upon his departure into the eastern sea?",
        options: ["The North Star", "The Moon", "The morning star, Venus", "The constellation Orion"],
        correct_answer_index: 2,
        explanation: "According to myth, his spirit ignited into the morning star, Venus, as he sailed toward the dawn."
      },
    ],
  },
  {
    id: "myth-15-enuma-elish-babylon",
    title: "Enuma Elish: The Babylonian Genesis of Order and Chaos",
    category: "mythology",
    categoryName: "Mitoloji & Efsaneler",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    topic: "Babil Enuma Eliş Destanı",
    desc: "Kozmik kaos ejderhası Tiamat ile Marduk arasındaki savaşın ardından evrenin ve gökkubbenin inşası.",
    content: "Recited annually during the Babylonian New Year festival of Akitu, the Enuma Elish ('When on high') recounts the cosmic drama through which unformed primordial chaos was conquered and structured into mathematical order. Before heaven had been named or the firm earth below existed, only primeval waters mingled together in absolute stillness: Apsu, the sweet freshwater abyss, and Tiamat, the tumultuous saltwater ocean of chaos.\n\nFrom their cosmic mingling emerged generations of younger deities. However, the energetic commotion of these youthful gods disturbed the ancient repose of Apsu and Tiamat. When Apsu plotted to exterminate the pantheon, he was outsmarted and slain by Ea, the god of incantations and wisdom. Enraged by the murder of her consort, Tiamat transformed into a gargantuan multi-headed dragon of wrath, birthing a horrifying brood of horned vipers, roaring sphinxes, and scorpion-men to annihilate the young gods.\n\nTerrified, the younger deities turned to Marduk, the champion of Babylon. Marduk agreed to confront the primordial leviathan on one condition: he must be granted sovereign supremacy over all celestial and earthly decrees. Astride his storm chariot, armed with a bow of thunder and a net of winds, Marduk rode into battle against Tiamat. When she opened her colossal jaws to swallow him, he drove a raging gale down her throat, immobilizing her lungs, and pierced her heart with an arrow.\n\nMarduk then split Tiamat's monumental carcass in two, like a dried shellfish. From one half, he arched the firmament of the sky, affixing the constellations to regulate days and months; from the other half, he established the terrestrial mountains and fertile basins of the Tigris and Euphrates rivers. Thus, civilization emerged not from peace, but as an ongoing victory of conscious geometric order over howling primordial entropy.",
    target_words: ["commotion", "repose", "annihilate", "firmament"],
    target_vocabulary: [
      { word: "commotion", phonetic: "/kəˈməʊ.ʃən/", turkish_meaning: "kargaşa, telaş, gürültü", context_sentence: "The commotion of the young gods disturbed their elders." },
      { word: "repose", phonetic: "/rɪˈpəʊz/", turkish_meaning: "dinginlik, sükunet, istirahat", context_sentence: "Tiamat desired to return to her ancient primordial repose." },
      { word: "annihilate", phonetic: "/əˈnaɪ.ə.leɪt/", turkish_meaning: "tamamen yok etmek, imha etmek", context_sentence: "Monstrous serpents were summoned to annihilate the pantheon." },
      { word: "firmament", phonetic: "/ˈfɜː.mə.mənt/", turkish_meaning: "gökkubbe, sema", context_sentence: "He crafted the starry firmament from the split body of the dragon." },
    ],
    comprehension_questions: [
      {
        question: "What two primordial waters existed before the creation of the universe in Enuma Elish?",
        options: ["Rain and glacial frost", "Apsu (freshwater) and Tiamat (saltwater chaos)", "River Nile and the Red Sea", "Mercury and sulfur"],
        correct_answer_index: 1,
        explanation: "Before creation, only Apsu (sweet freshwater) and Tiamat (saltwater chaos) mingled together."
      },
      {
        question: "How did Marduk incapacitate Tiamat before delivering the fatal arrow strike?",
        options: ["He turned her into stone with a mirror", "He drove an overpowering gale into her open jaws", "He poisoned her water with hemlock", "He sang a lullaby to put her to sleep"],
        correct_answer_index: 1,
        explanation: "Marduk drove a raging gale down her open throat, immobilizing her lungs before piercing her heart."
      },
      {
        question: "What did Marduk construct from the two halves of Tiamat's body?",
        options: ["Two giant bronze gates for Babylon", "The heavenly firmament above and the earth with its rivers below", "A subterranean labyrinth for prisoners", "Two golden war chariots"],
        correct_answer_index: 1,
        explanation: "He fashioned the sky's firmament from one half and the terrestrial earth and rivers from the other."
      },
    ],
  },
];

export const MYTHOLOGY_STORIES = mythologyStories;
