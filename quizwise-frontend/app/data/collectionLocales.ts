import type { Language } from "../context/LanguageContext";
import type { MuseumBuffType, MuseumSalonId } from "./museumItems";

export interface LocalizedTextEntry {
  title: string;
  desc?: string;
  lore?: string;
  bonus?: string;
}

export const BUFF_LOCALES: Record<MuseumBuffType, Record<Language, string>> = {
  boss_crit: {
    tr: "⚔️ Ejderha Baskını'nda +%15 Kritik Hasar",
    en: "⚔️ +15% Critical Damage in Dragon Raid",
    de: "⚔️ +15% Kritischer Schaden im Drachenangriff",
    es: "⚔️ +15% de Daño Crítico en Asalto al Dragón",
    fr: "⚔️ +15% de Dégâts Critiques en Raid du Dragon",
  },
  extra_time: {
    tr: "⏳ Süreli oyunlarda +2 Saniye Ek Süre",
    en: "⏳ +2 Bonus Seconds in Timed Games",
    de: "⏳ +2 Bonussekunden in Zeitspielen",
    es: "⏳ +2 Segundos Extra en Juegos Cronometrados",
    fr: "⏳ +2 Secondes Bonus dans les Jeux Chronométrés",
  },
  extra_life: {
    tr: "🛡️ Oyunlara +1 Ekstra Kalkan (Can) ile Başlama",
    en: "🛡️ Start Games with +1 Extra Shield (Life)",
    de: "🛡️ Starte Spiele mit +1 Extraschild (Leben)",
    es: "🛡️ Empieza Juegos con +1 Escudo Extra (Vida)",
    fr: "🛡️ Commencer les Jeux avec +1 Bouclier Extra (Vie)",
  },
  bonus_gold: {
    tr: "🪙 Tüm oyunlarda +%15 Bonus Altın",
    en: "🪙 +15% Bonus Gold in All Games",
    de: "🪙 +15% Bonus-Gold in allen Spielen",
    es: "🪙 +15% de Oro Extra en Todos los Juegos",
    fr: "🪙 +15% d'Or Bonus dans Tous les Jeux",
  },
};

export const CHEST_LOCALES: Record<
  string,
  Partial<Record<Language, { name: string; badge: string; description: string }>>
> = {
  chest_tier_1: {
    tr: { name: "🌳 Doğa & Keşif Sandığı", badge: "20 Kelime Barajı", description: "Ormanın neşeli sakinleri ve temel keşif ekipmanları." },
    en: { name: "🌳 Nature & Discovery Chest", badge: "20 Words Milestone", description: "Cheerful forest companions and starter exploration gear." },
    de: { name: "🌳 Natur- & Entdeckertruhe", badge: "20-Wörter-Meilenstein", description: "Fröhliche Waldbewohner und grundlegende Entdeckerausrüstung." },
    es: { name: "🌳 Cofre de Naturaleza y Descubrimiento", badge: "Meta de 20 Palabras", description: "Alegres habitantes del bosque y equipo básico de exploración." },
    fr: { name: "🌳 Coffre Nature & Découverte", badge: "Palier de 20 Mots", description: "Compagnons joyeux de la forêt et équipement d'exploration." },
  },
  chest_tier_2: {
    tr: { name: "⚔️ Kahramanlar & Macera Sandığı", badge: "100 Kelime Barajı", description: "Cesur şövalyeler, efsunlu silahlar ve kadim parşömenler." },
    en: { name: "⚔️ Heroes & Adventure Chest", badge: "100 Words Milestone", description: "Brave knights, enchanted weapons, and ancient scrolls." },
    de: { name: "⚔️ Helden- & Abenteuertruhe", badge: "100-Wörter-Meilenstein", description: "Tapfere Ritter, verzauberte Waffen und uralte Schriftrollen." },
    es: { name: "⚔️ Cofre de Héroes y Aventura", badge: "Meta de 100 Palabras", description: "Valientes caballeros, armas encantadas y pergaminos antiguos." },
    fr: { name: "⚔️ Coffre Héros & Aventure", badge: "Palier de 100 Mots", description: "Braves chevaliers, armes enchantées et parchemins anciens." },
  },
  chest_tier_3: {
    tr: { name: "🚀 Kozmik & Gelecek Sandığı", badge: "300 Kelime Barajı", description: "Siborglar, nebula muhafızları ve kuantum aygıtları." },
    en: { name: "🚀 Cosmic & Future Chest", badge: "300 Words Milestone", description: "Cyborgs, nebula guardians, and quantum gadgets." },
    de: { name: "🚀 Kosmos- & Zukunftstruhe", badge: "300-Wörter-Meilenstein", description: "Cyborgs, Nebel-Wächter und Quanten-Geräte." },
    es: { name: "🚀 Cofre Cósmico y del Futuro", badge: "Meta de 300 Palabras", description: "Cyborgs, guardianes de nebulosas y dispositivos cuánticos." },
    fr: { name: "🚀 Coffre Cosmique & Futur", badge: "Palier de 300 Mots", description: "Cyborgs, gardiens de nébuleuse et gadgets quantiques." },
  },
  chest_tier_4: {
    tr: { name: "👑 Efsaneler & Kadim Sandık", badge: "500-1000 Kelime Barajı", description: "Antik lav ejderhaları, anka kuşları ve evrensel altın kalem." },
    en: { name: "👑 Legends & Ancient Chest", badge: "500-1000 Words Milestone", description: "Ancient lava dragons, golden phoenixes, and cosmic quills." },
    de: { name: "👑 Legenden- & Uralte Truhe", badge: "500-1000-Wörter-Meilenstein", description: "Uralte Lavadrachen, goldene Phönixe und kosmische Goldstifte." },
    es: { name: "👑 Cofre de Leyendas y Ancestral", badge: "Meta de 500-1000 Palabras", description: "Dragones de lava antiguos, fénix dorados y plumas cósmicas." },
    fr: { name: "👑 Coffre Légendes & Anciens", badge: "Palier de 500-1000 Mots", description: "Dragons de lave anciens, phénix dorés et plumes cosmiques." },
  },
};

export const SALON_LOCALES: Record<
  MuseumSalonId,
  Partial<Record<Language, { title: string; subtitle: string; badge: string }>>
> = {
  1: {
    en: { title: "Heroes & Guardians", subtitle: "Brave warriors and wise guides of the VocaShip universe", badge: "Hall 1" },
    de: { title: "Helden & Wächter", subtitle: "Tapfere Krieger und weise Führer des VocaShip-Universums", badge: "Saal 1" },
    es: { title: "Héroes y Guardianes", subtitle: "Valientes guerreros y sabios guías del universo VocaShip", badge: "Salón 1" },
    fr: { title: "Héros & Gardiens", subtitle: "Braves guerriers et guides sages de l'univers VocaShip", badge: "Salle 1" },
  },
  2: {
    en: { title: "Dragons & Mythic Creatures", subtitle: "Mythological inhabitants of ancient skies and hidden realms", badge: "Hall 2" },
    de: { title: "Drachen & Fabelwesen", subtitle: "Mythologische Wesen uralter Himmel und geheimer Reiche", badge: "Saal 2" },
    es: { title: "Dragones y Criaturas Míticas", subtitle: "Habitantes mitológicos de cielos antiguos y reinos ocultos", badge: "Salón 2" },
    fr: { title: "Dragons & Créatures Mythiques", subtitle: "Habitants mythologiques des cieux anciens et royaumes cachés", badge: "Salle 2" },
  },
  3: {
    en: { title: "Ancient Weapons & Armor", subtitle: "Sacred gear forged by legendary smiths with the power of words", badge: "Hall 3" },
    de: { title: "Uralte Waffen & Rüstungen", subtitle: "Heilige Ausrüstung, geschmiedet von legendären Schmieden", badge: "Saal 3" },
    es: { title: "Armas y Armaduras Antiguas", subtitle: "Equipo sagrado forjado con el poder de las palabras", badge: "Salón 3" },
    fr: { title: "Armes & Armures Anciennes", subtitle: "Équipement sacré forgé par des forgerons légendaires", badge: "Salle 3" },
  },
  4: {
    en: { title: "Citadels & Wisdom Monuments", subtitle: "Eternal library fortresses of the 1000-word memory civilization", badge: "Hall 4" },
    de: { title: "Burgen & Weisheitsdenkmäler", subtitle: "Ewige Bibliotheksfestungen der 1000-Wörter-Zivilisation", badge: "Saal 4" },
    es: { title: "Fortalezas y Monumentos de Sabiduría", subtitle: "Eternas fortalezas de biblioteca de la civilización de 1000 palabras", badge: "Salón 4" },
    fr: { title: "Forteresses & Monuments de Sagesse", subtitle: "Forteresses éternelles de la civilisation des 1000 mots", badge: "Salle 4" },
  },
};

export const CORE_ITEM_LOCALES: Record<
  string,
  Partial<Record<Language, { name: string; desc: string; bonus?: string }>>
> = {
  fox_sparky: {
    de: { name: "Fuchs Sparky", desc: "Fröhlicher, neugieriger und kluger Fuchs mit Brille.", bonus: "+5% Tages-Serien-Bonus" },
    es: { name: "Zorro Sparky", desc: "Zorro inteligente, curioso y alegre con gafas.", bonus: "+5% Bono de Racha Diaria" },
    fr: { name: "Renard Sparky", desc: "Renard malin, curieux et joyeux à lunettes.", bonus: "+5% Bonus de Série Quotidienne" },
  },
  chicken_chuck: {
    de: { name: "Huhn Chuck", desc: "Energiegeladener, lustiger Bauernhof-Entdecker.", bonus: "+5 Gold pro Spiel" },
    es: { name: "Pollo Chuck", desc: "Explorador de granja enérgico y divertido.", bonus: "+5 de Oro por Juego" },
    fr: { name: "Poulet Chuck", desc: "Explorateur de ferme énergique et amusant.", bonus: "+5 Or par Jeu" },
  },
  river_beaver: {
    de: { name: "Flussbiber", desc: "Ausdauernder Meister der Wortdämme." },
    es: { name: "Castor de Río", desc: "Constructor tenaz de presas de palabras." },
    fr: { name: "Castor de Rivière", desc: "Bâtisseur tenace de barrages de mots." },
  },
  forest_frog: {
    de: { name: "Waldfrosch", desc: "Flinker Freund, der zwischen Wörtern springt." },
    es: { name: "Rana del Bosque", desc: "Amigo ágil que salta entre palabras." },
    fr: { name: "Grenouille des Bois", desc: "Amie agile qui saute d'un mot à l'autre." },
  },
  night_owl: {
    de: { name: "Nachteule", desc: "Weiser Beobachter später Lernsitzungen." },
    es: { name: "Búho Nocturno", desc: "Sabio observador de sesiones nocturnas." },
    fr: { name: "Hibou Nocturne", desc: "Sage observateur des sessions tardives." },
  },
  baby_panda: {
    de: { name: "Baby-Panda", desc: "Niedlicher Schüler der Bambushaine." },
    es: { name: "Panda Bebé", desc: "Adorable estudiante de los bosques de bambú." },
    fr: { name: "Bébé Panda", desc: "Adorable élève des forêts de bambous." },
  },
  apprentice_cat: {
    de: { name: "Lehrlingskatze", desc: "Süßer Lehrling mit Pfoten auf dem Wörterbuch." },
    es: { name: "Gato Aprendiz", desc: "Tierno aprendiz con las patas en el diccionario." },
    fr: { name: "Chat Apprenti", desc: "Mignon apprenti les pattes sur le dictionnaire." },
  },
  cheerful_squirrel: {
    de: { name: "Fröhliches Eichhörnchen", desc: "Sammelt Vokabeln wie Eicheln." },
    es: { name: "Ardilla Alegre", desc: "Recoge vocabulario como bellotas." },
    fr: { name: "Écureuil Joyeux", desc: "Récolte les mots comme des noisettes." },
  },
  wise_turtle: {
    de: { name: "Weise Schildkröte", desc: "Beständiger und tiefer Naturphilosoph." },
    es: { name: "Tortuga Sabia", desc: "Antigua filósofa que aprende con paso firme." },
    fr: { name: "Tortue Sage", desc: "Philosophe patiente qui apprend durablement." },
  },
  mountain_goat: {
    de: { name: "Bergziege", desc: "Erklimmt furchtlos steile Vokabelgipfel." },
    es: { name: "Cabra Montesa", desc: "Escala sin miedo picos de vocabulario difíciles." },
    fr: { name: "Chèvre des Montagnes", desc: "Gravit sans peur les sommets du vocabulaire." },
  },
  wooden_dict_pen: {
    de: { name: "Holz-Wörterbuchstift", desc: "Erstes Schreibwerkzeug für neue Sprachforscher." },
    es: { name: "Pluma de Madera", desc: "Primera herramienta de notas para exploradores." },
    fr: { name: "Stylo Dictionnaire en Bois", desc: "Premier outil de notes des jeunes explorateurs." },
  },
  bronze_dagger: {
    de: { name: "Bronzedolch", desc: "Geschmiedet für die ersten Treffer in der Arena." },
    es: { name: "Daga de Bronce", desc: "Forjada para los primeros golpes en la arena." },
    fr: { name: "Dague de Bronze", desc: "Forgée pour porter les premiers coups en arène." },
  },
  apprentice_notebook: {
    de: { name: "Lehrlingsnotizbuch", desc: "Wo die ersten 20 Wörter sorgfältig notiert werden." },
    es: { name: "Cuaderno de Aprendiz", desc: "Donde se anotan con cuidado las primeras 20 palabras." },
    fr: { name: "Carnet d'Apprenti", desc: "Où les 20 premiers mots sont soigneusement notés." },
  },
  nature_compass: {
    de: { name: "Naturkompass", desc: "Zeigt immer direkt auf die richtige Bedeutung." },
    es: { name: "Brújula Natural", desc: "Señala siempre hacia el significado correcto." },
    fr: { name: "Boussole Naturelle", desc: "Pointe toujours vers la bonne définition." },
  },
  leaf_amulet: {
    de: { name: "Blatt-Amulett", desc: "Schützt deine Serie einmalig bei einem Fehler." },
    es: { name: "Amuleto de Hoja", desc: "Protege tu racha una vez ante un error." },
    fr: { name: "Amulette Feuille", desc: "Protège votre série une fois en cas d'erreur." },
  },
  knight_leo: {
    de: { name: "Ritter Leo", desc: "Mutiger Burgenwächter mit Löwenherz." },
    es: { name: "Caballero Leo", desc: "Valiente defensor del castillo con corazón de león." },
    fr: { name: "Chevalier Leo", desc: "Brave gardien du château au cœur de lion." },
  },
  village_archer: {
    de: { name: "Dorfbogenschütze", desc: "Scharfäugiger Schütze, der mitten ins Schwarze trifft." },
    es: { name: "Arquero de la Aldea", desc: "Tirador certero que siempre da en el blanco." },
    fr: { name: "Archer du Village", desc: "Tireur d'élite à l'œil vif visant juste." },
  },
  desert_nomad_alex: {
    de: { name: "Wüstennomade Alex", desc: "Ausdauernder Oasenreisender durch Sandstürme." },
    es: { name: "Nómada del Desierto Alex", desc: "Resistente viajero de oasis ante tormentas." },
    fr: { name: "Nomade du Désert Alex", desc: "Voyageur résistant affrontant les tempêtes." },
  },
  stone_golem: {
    de: { name: "Steingolem", desc: "Unerschütterlicher Riese aus altem Berggestein." },
    es: { name: "Gólem de Piedra", desc: "Gigante inquebrantable nacido de piedra antigua." },
    fr: { name: "Golem de Pierre", desc: "Géant inébranlable forgé dans la roche ancienne." },
  },
  shadow_thief: {
    de: { name: "Schattendieb", desc: "Fängt flüsternd gesprochene Wörter blitzschnell ein." },
    es: { name: "Ladrón de Sombras", desc: "Captura al instante palabras susurradas en la sombra." },
    fr: { name: "Voleur d'Ombres", desc: "Capture furtivement les mots murmurés dans l'ombre." },
  },
  sailor_captain: {
    de: { name: "Seemanns-Kapitän", desc: "Meisterkapitän auf stürmischen Wortmeeren." },
    es: { name: "Capitán Marinero", desc: "Maestro capitán que traza rumbos en mares bravos." },
    fr: { name: "Capitaine Marin", desc: "Maître capitaine traçant la route sur mers agitées." },
  },
  night_mage: {
    de: { name: "Nachtmagier", desc: "Erleuchtet uralte Schriftrollen mit Sternenstaub." },
    es: { name: "Mago Nocturno", desc: "Ilumina pergaminos antiguos con polvo estelar." },
    fr: { name: "Mage Nocturne", desc: "Illumine les parchemins anciens de poussière d'étoiles." },
  },
  winged_pegasus: {
    de: { name: "Geflügelter Pegasus", desc: "Legendäres Flügelross hoch über den Wolken." },
    es: { name: "Pegaso Alado", desc: "Corcel alado legendario sobre las nubes." },
    fr: { name: "Pégase Ailé", desc: "Destrier ailé légendaire au-dessus des nuages." },
  },
  armored_bear: {
    de: { name: "Gepanzerter Bär", desc: "Mächtiger Krieger in arktischer Rüstung." },
    es: { name: "Oso Acorazado", desc: "Poderoso guerrero con armadura ártica." },
    fr: { name: "Ours Blindé", desc: "Puissant guerrier revêtu d'une armure arctique." },
  },
  cave_troll: {
    de: { name: "Höhlentroll", desc: "Rauer, aber treuer Wächter tiefer Grotten." },
    es: { name: "Trol de Caverna", desc: "Guardián rudo pero leal de cavernas profundas." },
    fr: { name: "Troll des Cavernes", desc: "Gardien bourru mais fidèle des grottes profondes." },
  },
  silver_quill: {
    de: { name: "Silberne Schreibfeder", desc: "Fein gearbeitete Silberfeder für flüssiges Schreiben." },
    es: { name: "Pluma de Plata", desc: "Pluma plateada fina para una escritura fluida." },
    fr: { name: "Plume d'Argent", desc: "Plume finement ciselée pour écrire avec aisance." },
  },
  knight_steel_shield: {
    de: { name: "Stahlschild des Ritters", desc: "Wehrt Gegenangriffe des Bosses im Kampf ab." },
    es: { name: "Escudo de Acero", desc: "Bloquea los contraataques del jefe en batalla." },
    fr: { name: "Bouclier d'Acier", desc: "Dévie les contre-attaques du boss au combat." },
  },
  flaming_dict_sword: {
    de: { name: "Flammendes Wörterbuchschwert", desc: "Löst kritische Treffermultiplikatoren aus." },
    es: { name: "Espada Flamígera", desc: "Activa multiplicadores críticos al acertar." },
    fr: { name: "Épée Flamboyante", desc: "Déclenche des coups critiques sur les bonnes réponses." },
  },
  wind_boots: {
    de: { name: "Stiefel des Windes", desc: "Gewährt Bonussekunden in Zeit-Spielmodi." },
    es: { name: "Botas del Viento", desc: "Otorga segundos extra en modos contrarreloj." },
    fr: { name: "Bottes du Vent", desc: "Accorde des secondes bonus dans les modes chronos." },
  },
  ancient_scroll: {
    de: { name: "Uralte Schriftrolle", desc: "Ehrenabzeichen für 100 gemeisterte Wörter." },
    es: { name: "Pergamino Antiguo", desc: "Insignia de honor por completar 100 palabras." },
    fr: { name: "Parchemin Ancien", desc: "Insigne d'honneur pour 100 mots maîtrisés." },
  },
  cyber_cat: {
    de: { name: "Cyber-Katze", desc: "Scannt Tausende Buchstaben pro Sekunde." },
    es: { name: "Cibergato", desc: "Escanea miles de letras por segundo." },
    fr: { name: "Cyber-Chat", desc: "Analyse des milliers de lettres par seconde." },
  },
  cyborg_robot: {
    de: { name: "Cyborg-Einheit", desc: "KI-Einheit für fehlerfreie Wortanalyse." },
    es: { name: "Unidad Cyborg", desc: "Unidad IA programada para análisis sin errores." },
    fr: { name: "Unité Cyborg", desc: "Unité IA programmée pour une analyse parfaite." },
  },
  nebula_guardian_evelyn: {
    de: { name: "Nebula-Wächterin Evelyn", desc: "Leiterin für interstellare Sprachforschung." },
    es: { name: "Guardiana Nebular Evelyn", desc: "Líder de lingüística interestelar." },
    fr: { name: "Gardienne Nébulaire Evelyn", desc: "Directrice de linguistique interstellaire." },
  },
  galaxy_pilot: {
    de: { name: "Galaxie-Pilot", desc: "Spitzenpilot in der Gravitations-Abwehr." },
    es: { name: "Piloto Galáctico", desc: "Piloto as destruyendo meteoros en Gravedad." },
    fr: { name: "Pilote Galactique", desc: "Pilote d'as abattant les météores." },
  },
  plasma_alien: {
    de: { name: "Plasma-Alien", desc: "Energiewesen mit telepathischer Sprache." },
    es: { name: "Alienígena de Plasma", desc: "Ser de energía con comunicación telepática." },
    fr: { name: "Alien Plasma", desc: "Être d'énergie à langage télépathique." },
  },
  hologram_sage: {
    de: { name: "Hologramm-Weiser", desc: "Grenzenloses Gedächtnis digitaler Archive." },
    es: { name: "Sabio Holográfico", desc: "Memoria infinita de los archivos digitales." },
    fr: { name: "Sage Holographique", desc: "Mémoire infinie des archives numériques." },
  },
  quantum_agent_sarah: {
    de: { name: "Quanten-Agentin Sarah", desc: "Entschlüsselt mehrere Wörter über Dimensionen hinweg." },
    es: { name: "Agente Cuántica Sarah", desc: "Descifra múltiples palabras entre dimensiones." },
    fr: { name: "Agent Quantique Sarah", desc: "Décode plusieurs mots à travers les dimensions." },
  },
  star_angel: {
    de: { name: "Sternenengel", desc: "Leitlicht für Lernende in kosmischen Stürmen." },
    es: { name: "Ángel Estelar", desc: "Luz guía en tormentas cósmicas." },
    fr: { name: "Ange Stellaire", desc: "Lumière guide dans les tempêtes cosmiques." },
  },
  laser_pen: {
    de: { name: "Laser-Stift", desc: "Graviert Wörter mit Lichtgeschwindigkeit." },
    es: { name: "Pluma Láser", desc: "Graba palabras a la velocidad de la luz." },
    fr: { name: "Stylo Laser", desc: "Grave les mots à la vitesse de la lumière." },
  },
  gravity_belt: {
    de: { name: "Anti-Schwerkraft-Gürtel", desc: "Verlangsamt fallende Meteore im Gravitationsmodus." },
    es: { name: "Cinturón Antigravedad", desc: "Ralentiza meteoros en Defensa Gravitacional." },
    fr: { name: "Ceinture Antigravité", desc: "Ralentit les météores dans le mode Gravité." },
  },
  quantum_visor: {
    de: { name: "Quanten-Visier", desc: "Filtert falsche Antwortoptionen sofort heraus." },
    es: { name: "Visor Cuántico", desc: "Escanea y elimina opciones falsas." },
    fr: { name: "Visière Quantique", desc: "Élimine instantanément les faux choix." },
  },
  cosmic_compass: {
    de: { name: "Kosmischer Kompass", desc: "Galaktischer Wegweiser für 300+-Wörter-Meister." },
    es: { name: "Brújula Cósmica", desc: "Guía galáctica para maestros de 300+ palabras." },
    fr: { name: "Boussole Cosmique", desc: "Guide galactique des maîtres de 300+ mots." },
  },
  ancient_lava_dragon_ignis: {
    de: { name: "Uralter Lavadrache Ignis", desc: "Uralter Herr der Flammen aus dem Vulkankern." },
    es: { name: "Dragón de Lava Ignis", desc: "Antiguo señor de las llamas del núcleo volcánico." },
    fr: { name: "Dragon de Lave Ignis", desc: "Seigneur ancestral des flammes volcaniques." },
  },
  golden_phoenix: {
    de: { name: "Goldener Phönix", desc: "Göttlicher Vogel, der deine Serie ewig bewahrt." },
    es: { name: "Fénix Dorado", desc: "Ave divina que protege tu racha para siempre." },
    fr: { name: "Phénix Doré", desc: "Oiseau divin qui préserve votre série." },
  },
  judge_harrison: {
    de: { name: "Oberrichter Harrison", desc: "Höchste Autorität für Rechtssprache auf C2-Niveau." },
    es: { name: "Juez Supremo Harrison", desc: "Máxima autoridad de lenguaje legal C2." },
    fr: { name: "Juge Suprême Harrison", desc: "Autorité suprême du langage juridique C2." },
  },
  cosmic_dragon_bahamut: {
    de: { name: "Kosmischer Drache Bahamut", desc: "Drache unendlicher Weisheit zwischen Sternsystemen." },
    es: { name: "Dragón Cósmico Bahamut", desc: "Dragón de sabiduría infinita entre galaxias." },
    fr: { name: "Dragon Cosmique Bahamut", desc: "Dragon de sagesse infinie des systèmes stellaires." },
  },
  infinity_lord: {
    de: { name: "Unendlichkeits-Lord", desc: "Krone des Champions von 1000 Wörtern." },
    es: { name: "Señor del Infinito", desc: "Corona del campeón de las 1000 palabras." },
    fr: { name: "Seigneur de l'Infini", desc: "Couronne du champion des 1000 mots." },
  },
  cosmic_gold_pen: {
    de: { name: "Kosmischer Goldstift", desc: "Schreibt Wörter mit reinem Sternengoldstaub." },
    es: { name: "Pluma de Oro Cósmica", desc: "Escribe palabras con polvo de oro estelar." },
    fr: { name: "Plume d'Or Cosmique", desc: "Écrit les mots avec de la poussière d'or." },
  },
  ancient_wisdom_shield: {
    de: { name: "Schild der uralten Weisheit", desc: "Schützt den Geist vor jeder Ablenkung." },
    es: { name: "Escudo de Sabiduría Antigua", desc: "Escudo legendario contra toda distracción." },
    fr: { name: "Bouclier de Sagesse Ancienne", desc: "Protège l'esprit de toute distraction." },
  },
  volcanic_dragon_staff: {
    de: { name: "Vulkanischer Drachenstab", desc: "Stab verziert mit Erz aus Ignis' Kern." },
    es: { name: "Báculo de Dragón Volcánico", desc: "Báculo adornado con mineral del núcleo de Ignis." },
    fr: { name: "Bâton de Dragon Volcanique", desc: "Bâton orné de minerai du cœur d'Ignis." },
  },
};

export const MUSEUM_ITEM_LOCALES: Record<
  string,
  Partial<Record<Language, LocalizedTextEntry>>
> = {
  // SALON 1: HEROES
  hero_01: {
    en: { title: "Sparky the Fox", desc: "Cute and curious fox taking the first step into adventure.", lore: "Faithful scout planting the first seeds of vocabulary." },
    de: { title: "Fuchs Sparky", desc: "Süßer, neugieriger Fuchs auf dem ersten Abenteuer.", lore: "Treuer Späher, der die ersten Vokabelsamen sät." },
    es: { title: "Zorro Sparky", desc: "Zorro curioso dando el primer paso de la aventura.", lore: "Fiel explorador que siembra las primeras palabras." },
    fr: { title: "Renard Sparky", desc: "Renard curieux faisant le premier pas de l'aventure.", lore: "Fidèle éclaireur semant les premiers mots." },
  },
  hero_02: {
    en: { title: "Stone Fortress Warden", desc: "Granite-armored sentry guarding the word citadel.", lore: "Protects core grammar rules like solid granite." },
    de: { title: "Steinfestungswächter", desc: "Wächter in Granitrüstung für die Wortzitadelle.", lore: "Schützt die Grundgrammatik wie massiven Granit." },
    es: { title: "Guardián de Piedra", desc: "Centinela de granito protegiendo la ciudadela.", lore: "Protege la gramática básica como granito sólido." },
    fr: { title: "Gardien de Granit", desc: "Sentinelle protégeant la citadelle des mots.", lore: "Protège la grammaire de base comme du granit." },
  },
  hero_03: {
    en: { title: "Shadow Archer", desc: "Silent forest marksman hitting the bullseye.", lore: "Every arrow captures complex synonyms with precision." },
    de: { title: "Schattenbogenschütze", desc: "Lautloser Waldschütze mit perfekter Treffsicherheit.", lore: "Jeder Pfeil trifft komplexe Synonyme mitten ins Ziel." },
    es: { title: "Arquero de las Sombras", desc: "Tirador silencioso que acierta siempre.", lore: "Cada flecha atrapa sinónimos complejos con precisión." },
    fr: { title: "Archer de l'Ombre", desc: "Tireur silencieux atteignant toujours la cible.", lore: "Chaque flèche saisit les synonymes complexes." },
  },
  hero_04: {
    en: { title: "Glacier Knight", desc: "Calm defender of the northern glaciers.", lore: "Freezes exam stress and preserves focus." },
    de: { title: "Gletscherritter", desc: "Kaltblütiger Verteidiger der Nordgletscher.", lore: "Friert Prüfungsstress ein und bewahrt Ruhe." },
    es: { title: "Caballero Glacial", desc: "Defensor sereno de los glaciares del norte.", lore: "Congela el estrés de los exámenes con calma." },
    fr: { title: "Chevalier des Glaciers", desc: "Défenseur calme des glaciers du nord.", lore: "Gèle le stress des examens et garde le calme." },
  },
  hero_05: {
    en: { title: "Cyber Samurai", desc: "Futuristic warrior hunting words with a neon blade.", lore: "Supreme master of timed Speed Recall duels." },
    de: { title: "Cyber-Samurai", desc: "Futuristischer Krieger mit Neonklinge.", lore: "Meister der schnellen Speed-Recall-Spiele." },
    es: { title: "Samurái Cibernético", desc: "Guerrero futurista con espada de neón.", lore: "Maestro absoluto de los duelos de velocidad." },
    fr: { title: "Samouraï Cybernétique", desc: "Guerrier futuriste à lame néon.", lore: "Maître absolu des duels rapides." },
  },
  hero_06: {
    en: { title: "Cosmic Astronaut", desc: "Explorer chasing unknown terms across star dictionaries.", lore: "Charts galactic memory maps in zero gravity." },
    de: { title: "Kosmischer Astronaut", desc: "Erforscher unbekannter Begriffe im All.", lore: "Zeichnet galaktische Gedächtniskarten." },
    es: { title: "Astronauta Cósmico", desc: "Explorador de términos desconocidos entre estrellas.", lore: "Traza mapas de memoria galáctica sin gravedad." },
    fr: { title: "Astronaute Cosmique", desc: "Explorateur de termes inconnus dans les étoiles.", lore: "Trace des cartes mémoire galactiques." },
  },
  hero_07: {
    en: { title: "Chronos, Time Lord", desc: "Ancient master bending SM-2 forgetting curves.", lore: "Recalls fading words right before they vanish." },
    de: { title: "Zeitlord Chronos", desc: "Meister, der die SM-2-Vergessenskurven beugt.", lore: "Ruft verblassende Wörter rechtzeitig zurück." },
    es: { title: "Chronos, Señor del Tiempo", desc: "Maestro antiguo que domina las curvas SM-2.", lore: "Recupera palabras olvidadas justo a tiempo." },
    fr: { title: "Chronos, Maître du Temps", desc: "Maître ancien courbant les courbes SM-2.", lore: "Rappelle les mots avant qu'ils ne s'effacent." },
  },
  hero_08: {
    en: { title: "Golden Gladiator", desc: "Undefeated champion of the arena sands.", lore: "Thrills crowds with sharp 1v1 vocabulary combos." },
    de: { title: "Goldener Gladiator", desc: "Unbesiegter Champion der Arena.", lore: "Begeistert mit scharfen 1v1-Wortkombos." },
    es: { title: "Gladiador Dorado", desc: "Campeón invicto de la arena.", lore: "Brilla con combos veloces en duelos 1v1." },
    fr: { title: "Gladiateur Doré", desc: "Champion invaincu des sables de l'arène.", lore: "Brille avec des combos fulgurants en 1v1." },
  },
  hero_09: {
    en: { title: "Forest Ranger", desc: "Tracker translating nature's whispers into English.", lore: "Follows hidden etymological roots deep in the woods." },
    de: { title: "Waldläufer", desc: "Spurenleser, der Naturflüstern übersetzt.", lore: "Folgt verborgenen Wortwurzeln im Wald." },
    es: { title: "Guardabosques", desc: "Rastreador que traduce susurros del bosque.", lore: "Sigue raíces etimológicas ocultas." },
    fr: { title: "Rôdeur des Bois", desc: "Pisteur traduisant les murmures de la forêt.", lore: "Suit les racines étymologiques cachées." },
  },
  hero_10: {
    en: { title: "Desert Sorcerer", desc: "Mystic alchemist decoding texts beyond sandstorms.", lore: "Turns mirage words into golden ink scrolls." },
    de: { title: "Wüstenmagier", desc: "Geheimnisvoller Alchemist alter Wüstentexte.", lore: "Verwandelt Fata-Morgana-Wörter in Goldtinte." },
    es: { title: "Hechicero del Desierto", desc: "Alquimista místico de textos tras tormentas.", lore: "Convierte espejismos en pergaminos dorados." },
    fr: { title: "Sorcier du Désert", desc: "Alchimiste décodant les textes des sables.", lore: "Transforme les mirages en encre dorée." },
  },
  hero_11: {
    en: { title: "Storm Paladin", desc: "Virtuous warrior wielding thunder in his hammer.", lore: "Spreads accurate pronunciation at lightning speed." },
    de: { title: "Sturm-Paladin", desc: "Tugendhafter Krieger mit Donnerhammer.", lore: "Verbreitet saubere Aussprache blitzschnell." },
    es: { title: "Paladín de la Tormenta", desc: "Guerrero virtuoso con martillo de trueno.", lore: "Impulsa la pronunciación precisa como un rayo." },
    fr: { title: "Paladin des Tempêtes", desc: "Guerrier vertueux maniant la foudre.", lore: "Propage une prononciation juste à la vitesse de l'éclair." },
  },
  hero_12: {
    en: { title: "Lava Warrior", desc: "Bearer of fiery armor forged inside a volcano.", lore: "Speaks with fiery passion that melts hesitation." },
    de: { title: "Lavakrieger", desc: "Träger flammender Vulkanrüstung.", lore: "Spricht mit Leidenschaft, die Zögern schmilzt." },
    es: { title: "Guerrero de Lava", desc: "Portador de armadura ardiente volcánica.", lore: "Habla con pasión que derrite toda duda." },
    fr: { title: "Guerrier de Lave", desc: "Porteur d'une armure forgée dans le volcan.", lore: "Parle avec une passion qui fait fondre l'hésitation." },
  },
  hero_13: {
    en: { title: "Captain Nautilus", desc: "Veteran mariner retrieving deep-sea treasures.", lore: "Locates treasure chests with an unerring compass." },
    de: { title: "Kapitän Nautilus", desc: "Erfahrener Seefahrer für Tiefseeschätze.", lore: "Findet Schatztruhen mit unfehlbarem Kompass." },
    es: { title: "Capitán Nautilus", desc: "Marino veterano de tesoros abisales.", lore: "Localiza cofres piratas con brújula infalible." },
    fr: { title: "Capitaine Nautilus", desc: "Marin chevronné des trésors abyssaux.", lore: "Localise les coffres grâce à une boussole infaillible." },
  },
  hero_14: {
    en: { title: "Sky Warrior Zephyr", desc: "Swift aerial guardian gliding on wind wings.", lore: "Glides effortlessly across Match Game cards." },
    de: { title: "Himmelskrieger Zephyr", desc: "Flinker Luftwächter auf Windflügeln.", lore: "Gleitet wie Wind durch die Kartenpaare." },
    es: { title: "Guerrero del Cielo Céfiro", desc: "Guardián aéreo ágil sobre alas de viento.", lore: "Se desliza entre tarjetas emparejadas." },
    fr: { title: "Guerrier du Ciel Zéphyr", desc: "Gardien aérien glissant sur le vent.", lore: "Glisse parmi les cartes comme une brise." },
  },
  hero_15: {
    en: { title: "Night Watchman", desc: "Lantern keeper accompanying late-night reviews.", lore: "Locks your final 5 bedtime words into memory." },
    de: { title: "Nachtwächter", desc: "Laternenwächter für abendliche Lernsitzungen.", lore: "Versiegelt die letzten 5 Wörter vor dem Schlafen." },
    es: { title: "Vigilante Nocturno", desc: "Guardián con farol en tus repasos nocturnos.", lore: "Fija en memoria las últimas 5 palabras." },
    fr: { title: "Veilleur de Nuit", desc: "Gardien à lanterne de vos révisions tardives.", lore: "Scelle vos 5 derniers mots avant de dormir." },
  },
  hero_16: {
    en: { title: "Ancient Sage Albus", desc: "White-bearded master holding thousand-year archives.", lore: "Explains C1-C2 academic concepts with crystal clarity." },
    de: { title: "Uralter Weiser Albus", desc: "Meister jahrtausendealter Bibliotheken.", lore: "Erklärt C1/C2-Konzepte glasklar." },
    es: { title: "Sabio Antiguo Albus", desc: "Maestro de bibliotecas milenarias.", lore: "Explica conceptos C1 y C2 con claridad total." },
    fr: { title: "Sage Ancien Albus", desc: "Maître des bibliothèques millénaires.", lore: "Explique les concepts C1-C2 avec limpidité." },
  },
  hero_17: {
    en: { title: "Steel-Clad Knight", desc: "Loyal training knight of flawless discipline.", lore: "Awards honor badges for consistent daily goals." },
    de: { title: "Stahlgepanzerter Ritter", desc: "Treuer Trainingsritter makelloser Disziplin.", lore: "Verleiht Abzeichen für tägliche Ziele." },
    es: { title: "Caballero de Acero", desc: "Caballero leal de disciplina impecable.", lore: "Premia con medallas tu constancia diaria." },
    fr: { title: "Chevalier d'Acier", desc: "Chevalier fidèle à la discipline sans faille.", lore: "Décerne des insignes pour vos objectifs quotidiens." },
  },
  hero_18: {
    en: { title: "Magnetic Engineer", desc: "Inventor linking antonyms with magnetic poles.", lore: "Interlocks complex sentence structures smoothly." },
    de: { title: "Magnet-Ingenieur", desc: "Erfinder, der Gegensätze magnetisch verbindet.", lore: "Verzahnt komplexe Sätze wie Zahnräder." },
    es: { title: "Ingeniero Magnético", desc: "Inventor que une antónimos con imanes.", lore: "Encaja oraciones complejas con precisión." },
    fr: { title: "Ingénieur Magnétique", desc: "Inventeur reliant antonymes par magnétisme.", lore: "Assemble les phrases complexes sans effort." },
  },
  hero_19: {
    en: { title: "Crystal Guardian", desc: "Sentry refracting nuances of words like light.", lore: "Illuminates phonetic symbols in rainbow hues." },
    de: { title: "Kristallwächter", desc: "Bricht Wortnuancen wie Licht im Prisma.", lore: "Lässt Lautschrift in Regenbogenfarben leuchten." },
    es: { title: "Guardián de Cristal", desc: "Refracta los matices verbales como un prisma.", lore: "Ilumina la fonética con colores arcoíris." },
    fr: { title: "Gardien de Cristal", desc: "Réfracte les nuances des mots comme la lumière.", lore: "Illumine la phonétique aux couleurs d'arc-en-ciel." },
  },
  hero_20: {
    en: { title: "Solar Priest", desc: "Blesses diligent minds rising with the sun.", lore: "Grants fresh energy for morning speaking drills." },
    de: { title: "Sonnenpriester", desc: "Segnet frühe, fleißige Lerngeister.", lore: "Schenkt frische Energie am Morgen." },
    es: { title: "Sacerdote Solar", desc: "Bendice a las mentes madrugadoras.", lore: "Aporta vitalidad extra en tus prácticas matinales." },
    fr: { title: "Prêtre Solaire", desc: "Bénit les esprits diligents dès l'aube.", lore: "Insuffle une vitalité matinale aux exercices." },
  },
  hero_21: {
    en: { title: "Moon Huntress Selina", desc: "Captures tricky grammar patterns with silver arrows.", lore: "Brings inverted sentences into perfect order." },
    de: { title: "Mondjägerin Selina", desc: "Fängt schwierige Grammatik im Mondlicht.", lore: "Ordnet komplexe Satzstrukturen mühelos." },
    es: { title: "Cazadora Lunar Selina", desc: "Atrapa gramática difícil con flechas de plata.", lore: "Ordena frases invertidas a la perfección." },
    fr: { title: "Chasseresse Lunaire Selina", desc: "Capture la grammaire difficile de ses flèches d'argent.", lore: "Met en ordre les phrases complexes." },
  },
  hero_22: {
    en: { title: "Runic Glyph Master", desc: "Carves ancient symbols inside word roots.", lore: "Engraves each term in mind like fine art." },
    de: { title: "Runen-Glyphenmeister", desc: "Meißelt uralte Symbole in Wortwurzeln.", lore: "Graviert Wörter wie Kunstwerke ins Gedächtnis." },
    es: { title: "Maestro de Glifos Rúnicos", desc: "Talla símbolos antiguos en raíces verbales.", lore: "Graba cada término como obra de arte." },
    fr: { title: "Maître des Glyphes Runiques", desc: "Grave les symboles anciens dans les racines.", lore: "Sculpte chaque mot en mémoire." },
  },
  hero_23: {
    en: { title: "Volcanic Berserker", desc: "Indomitable vanguard in dragon raids.", lore: "Turns every wrong answer into fierce resolve." },
    de: { title: "Vulkan-Berserker", desc: "Unbezwingbarer Vorkämpfer in Drachenraids.", lore: "Verwandelt Fehler in doppelten Kampfgeist." },
    es: { title: "Berserker Volcánico", desc: "Vanguardia indomable en asaltos al dragón.", lore: "Convierte cada fallo en un acierto más fuerte." },
    fr: { title: "Berserker Volcanique", desc: "Avant-garde indomptable des raids dragon.", lore: "Transforme chaque erreur en réussite plus forte." },
  },
  hero_24: {
    en: { title: "Infinity Traveler", desc: "Voyager traversing all world languages through portals.", lore: "Decodes accents so foreign words feel like home." },
    de: { title: "Unendlichkeitsreisender", desc: "Reist durch Portale zu allen Sprachen der Welt.", lore: "Entschlüsselt Akzente aller Kulturen." },
    es: { title: "Viajero del Infinito", desc: "Recorre todos los idiomas por portales.", lore: "Descifra acentos para hacer cercano todo idioma." },
    fr: { title: "Voyageur de l'Infini", desc: "Traverse toutes les langues par portails.", lore: "Décode les accents du monde entier." },
  },
  hero_25: {
    en: { title: "Grandmaster Champion", desc: "Golden emblem of students reaching 1000 words.", lore: "Crown honor of Hall 1 unlocking every door." },
    de: { title: "Großmeister-Champion", desc: "Goldenes Abzeichen für 1000 Wörter.", lore: "Krönung von Saal 1, öffnet alle Türen." },
    es: { title: "Campeón Gran Maestro", desc: "Emblema dorado al alcanzar las 1000 palabras.", lore: "Corona de honor del Salón 1." },
    fr: { title: "Champion Grand Maître", desc: "Emblème doré des 1000 mots atteints.", lore: "Couronne d'honneur ouvrant toutes les portes." },
  },

  // SALON 2: CREATURES
  creature_01: {
    en: { title: "Wise Forest Owl", desc: "Ancient owl scanning book pages with glowing eyes.", lore: "Captures the main idea of every sentence at a glance." },
    de: { title: "Weise Waldeule", desc: "Eule, die nachts Buchseiten durchleuchtet.", lore: "Erfasst den Kern jedes Satzes auf einen Blick." },
    es: { title: "Búho Sabio del Bosque", desc: "Búho antiguo de ojos brillantes sobre libros.", lore: "Capta la idea principal de un vistazo." },
    fr: { title: "Hibou Sage de la Forêt", desc: "Hibou ancien scrutant les pages de nuit.", lore: "Saisit l'idée clé de chaque phrase." },
  },
  creature_02: {
    en: { title: "Winged Pegasus", desc: "Noble mythological steed gliding in snow-white wings.", lore: "Carries readers smoothly across tough passages." },
    de: { title: "Geflügelter Pegasus", desc: "Edles Flügelross hoch am Himmel.", lore: "Trägt Leser sicher durch schwere Texte." },
    es: { title: "Pegaso Alado", desc: "Noble corcel mítico de alas blancas.", lore: "Lleva al lector a la cima de textos difíciles." },
    fr: { title: "Pégase Ailé", desc: "Noble destrier mythique aux ailes blanches.", lore: "Porte le lecteur au sommet des textes complexes." },
  },
  creature_03: {
    en: { title: "Ancient Stone Golem", desc: "Giant guardian awakened by ancient earth energy.", lore: "Symbol of long-term memory that never forgets." },
    de: { title: "Uralter Steingolem", desc: "Riese, belebt von uralter Erdenergie.", lore: "Symbol für unvergängliches Langzeitgedächtnis." },
    es: { title: "Gólem de Piedra Antiguo", desc: "Protector gigante animado por energía terrestre.", lore: "Símbolo de memoria eterna e imborrable." },
    fr: { title: "Golem de Pierre Ancien", desc: "Protecteur géant animé par la terre ancienne.", lore: "Symbole d'une mémoire qui n'oublie jamais." },
  },
  creature_04: {
    en: { title: "Crimson Lava Dragon Ignis", desc: "Great volcanic dragon testing words with fire.", lore: "Respects brave challengers in Dragon Raid." },
    de: { title: "Roter Lavadrache Ignis", desc: "Großer Vulkandrache, der Wörter prüft.", lore: "Schätzt mutige Herausforderer im Drachenkampf." },
    es: { title: "Dragón de Lava Carmesí Ignis", desc: "Gran dragón volcánico que prueba con fuego.", lore: "Admira a quienes desafían la arena." },
    fr: { title: "Dragon de Lave Pourpre Ignis", desc: "Grand dragon volcanique testant par le feu.", lore: "Honore le courage dans le Raid du Dragon." },
  },
  creature_05: {
    en: { title: "Golden Phoenix", desc: "Eternal symbol of grace rising from its ashes.", lore: "Breathes new life and hope in zero-elimination moments." },
    de: { title: "Goldener Phönix", desc: "Ewiges Symbol aus eigener Asche geboren.", lore: "Schenkt neue Hoffnung beim Respawn." },
    es: { title: "Fénix Dorado", desc: "Símbolo eterno que renace de sus cenizas.", lore: "Infunde nueva vida en momentos críticos." },
    fr: { title: "Phénix Doré", desc: "Symbole éternel renaissant de ses cendres.", lore: "Insuffle une nouvelle vie aux instants décisifs." },
  },
  creature_06: {
    en: { title: "Cosmic Nebula Dragon", desc: "Space dragon shimmering with stardust scales.", lore: "Guards unknown word galaxies beyond the Milky Way." },
    de: { title: "Kosmischer Nebeldrache", desc: "Weltraumdrache aus glitzerndem Sternenstaub.", lore: "Schützt Galaxien unbekannter Wörter." },
    es: { title: "Dragón Nebular Cósmico", desc: "Dragón espacial que brilla con polvo estelar.", lore: "Custodia galaxias de palabras desconocidas." },
    fr: { title: "Dragon Nébuleuse Cosmique", desc: "Dragon spatial scintillant de poussière d'étoiles.", lore: "Veille sur les galaxies de mots inconnus." },
  },
  creature_07: {
    en: { title: "Frostbreath Wyrm", desc: "Azure dragon slumbering amid arctic icicles.", lore: "Calms exam nerves with crystal-clear focus." },
    de: { title: "Eisatem-Wyrm", desc: "Blauer Drache zwischen arktischen Eiszapfen.", lore: "Beruhigt Nerven für glasklaren Fokus." },
    es: { title: "Wyrm Aliento Helado", desc: "Dragón azul dormido entre hielos polares.", lore: "Calma los nervios con enfoque helado." },
    fr: { title: "Wyrm Souffle de Givre", desc: "Dragon bleu dormant dans les glaces polaires.", lore: "Apaise le trac et apporte une concentration pure." },
  },
  creature_08: {
    en: { title: "Ocean Leviathan", desc: "Ancient sea giant resting in deep ocean currents.", lore: "Teaches how to navigate deep academic texts effortlessly." },
    de: { title: "Ozean-Leviathan", desc: "Uralter Meeresgigant in tiefen Strömungen.", lore: "Lehrt sicheres Schwimmen in tiefen Texten." },
    es: { title: "Leviatán del Océano", desc: "Gigante marino en corrientes profundas.", lore: "Enseña a navegar textos académicos complejos." },
    fr: { title: "Léviathan des Océans", desc: "Géant marin des courants profonds.", lore: "Apprend à naviguer les textes académiques denses." },
  },
  creature_09: {
    en: { title: "Storm Eagle Aquila", desc: "Golden-eyed raptor nesting above storm clouds.", lore: "Spots keywords inside texts at lightning speed." },
    de: { title: "Sturmadler Aquila", desc: "Raubvogel mit goldenen Augen über Gewitterwolken.", lore: "Erkennt Schlüsselwörter blitzschnell." },
    es: { title: "Águila de Tormenta Aquila", desc: "Rapaz de ojos dorados sobre nubes de rayo.", lore: "Detecta palabras clave a velocidad de relámpago." },
    fr: { title: "Aigle Tempête Aquila", desc: "Rapace aux yeux d'or sur les nuages d'orage.", lore: "Repère les mots-clés à la vitesse de l'éclair." },
  },
  creature_10: {
    en: { title: "Crystal Turtle", desc: "Paragon of patience with emerald and diamond shell.", lore: "Whispers victory through steady 20-word daily steps." },
    de: { title: "Kristallschildkröte", desc: "Sinnbild der Geduld mit Smaragdpanzer.", lore: "Feiert den Sieg durch stetige 20 Wörter pro Tag." },
    es: { title: "Tortuga de Cristal", desc: "Ejemplo de paciencia con caparazón esmeralda.", lore: "Alcanza el triunfo paso a paso cada día." },
    fr: { title: "Tortue de Cristal", desc: "Parangon de patience à carapace d'émeraude.", lore: "Célèbre la victoire par de constants progrès." },
  },
  creature_11: {
    en: { title: "Emerald Chameleon", desc: "Color-shifting companion adapting to any speech setting.", lore: "Adapts tone and vocabulary naturally in conversation." },
    de: { title: "Smaragd-Chamäleon", desc: "Passt sich jeder Gesprächsumgebung nahtlos an.", lore: "Wählt Tonfall und Wortschatz sicher." },
    es: { title: "Camaleón Esmeralda", desc: "Amigo que se adapta al instante a cada contexto.", lore: "Domina el tono y el vocabulario adecuado." },
    fr: { title: "Caméléon Émeraude", desc: "Compagnon s'adaptant instantanément au contexte.", lore: "Adopte le ton juste en toute discussion." },
  },
  creature_12: {
    en: { title: "Night Wolf Fenrir", desc: "Silver-furred pack hunter under the full moon.", lore: "Represents unbreakable teamwork in Co-op raids." },
    de: { title: "Nachtwolf Fenrir", desc: "Silberner Rudeljäger bei Vollmond.", lore: "Steht für starken Zusammenhalt in Koop-Raids." },
    es: { title: "Lobo Nocturno Fenrir", desc: "Lobo plateado cazando en manada bajo la luna.", lore: "Simboliza unión en asaltos cooperativos." },
    fr: { title: "Loup Nocturne Fenrir", desc: "Loup argenté chassant en meute sous la lune.", lore: "Incarne l'esprit d'équipe en raid coopératif." },
  },
  creature_13: {
    en: { title: "Solar Lion Solarius", desc: "Majestic king with a mane woven of sunlight.", lore: "Instills speaking confidence and scatters shyness." },
    de: { title: "Sonnenlöwe Solarius", desc: "König mit einer Mähne aus reinem Sonnenlicht.", lore: "Schenkt Selbstvertrauen beim Sprechen." },
    es: { title: "León Solar Solarius", desc: "Majestuoso rey con melena de luz solar.", lore: "Inspira confianza al hablar y disipa la timidez." },
    fr: { title: "Lion Solaire Solarius", desc: "Roi majestueux à crinière de soleil.", lore: "Donne assurance à l'oral et chasse la timidité." },
  },
  creature_14: {
    en: { title: "Venomous Basilisk", desc: "Mythical reptile petrifying misleading choices.", lore: "Neutralizes distractors in multiple-choice tests." },
    de: { title: "Giftiger Basilisk", desc: "Fabelwesen, das falsche Antworten versteinert.", lore: "Entkräftet Ablenker in Tests sofort." },
    es: { title: "Basilisco Venenoso", desc: "Reptil mítico que petrifica distractores.", lore: "Neutraliza opciones engañosas al instante." },
    fr: { title: "Basilic Venimeux", desc: "Reptile mythique pétrifiant les leurres.", lore: "Neutralise les mauvais choix en QCM." },
  },
  creature_15: {
    en: { title: "Ancient Glacier Mammoth", desc: "Walking monument braving ice-age storms.", lore: "Carries whole libraries, building rock-solid memory." },
    de: { title: "Uraltes Gletschermammut", desc: "Trotzte den Stürmen der Eiszeit.", lore: "Baut ein schweres, unerschütterliches Gedächtnis." },
    es: { title: "Mamut Glacial Antiguo", desc: "Monumento viviente de las tormentas glaciales.", lore: "Construye una memoria sólida e imborrable." },
    fr: { title: "Mammouth Glaciaire Ancien", desc: "Colosse ayant bravé les tempêtes glaciaires.", lore: "Bâtit une mémoire lente mais inébranlable." },
  },
  creature_16: {
    en: { title: "Fire Salamander", desc: "Joyful tiny lava creature dancing among embers.", lore: "Keeps the spark of learning alive and fun." },
    de: { title: "Feuersalamander", desc: "Fröhliches Lavawesen, tanzt in der Glut.", lore: "Hält den Lernfunken immer lebendig." },
    es: { title: "Salamandra de Fuego", desc: "Alegre criatura que baila entre brasas.", lore: "Mantiene viva la chispa de aprender." },
    fr: { title: "Salamandre de Feu", desc: "Petite créature joyeuse dansant dans la braise.", lore: "Garde toujours vive la flamme d'apprendre." },
  },
  creature_17: {
    en: { title: "Thunder Dragon", desc: "Electric-blue dragon unleashing storms with its wings.", lore: "Appears in the sky on 10-combo Speed Recall streaks." },
    de: { title: "Donnerdrache", desc: "Elektrisch blauer Sturm-Drache.", lore: "Erscheint bei 10er-Serien im Speed Recall." },
    es: { title: "Dragón del Trueno", desc: "Dragón azul eléctrico que desata tormentas.", lore: "Aparece en rachas de 10 combos seguidos." },
    fr: { title: "Dragon Tonnerre", desc: "Dragon bleu électrique déchaînant l'orage.", lore: "Apparaît lors de séries de 10 combos." },
  },
  creature_18: {
    en: { title: "Shadow Panther", desc: "Dazzling hunter prowling silently under night cover.", lore: "Catches even faintest audio nuances in listening drills." },
    de: { title: "Schattenpanther", desc: "Lautloser Jäger im Schutz der Nacht.", lore: "Erfasst feinste Hördetails." },
    es: { title: "Pantera de las Sombras", desc: "Cazadora sigilosa bajo el manto nocturno.", lore: "Capta hasta el menor detalle al escuchar." },
    fr: { title: "Panthère des Ombres", desc: "Chasseresse silencieuse sous le voile nocturne.", lore: "Saisit chaque nuance lors de l'écoute." },
  },
  creature_19: {
    en: { title: "Sapphire Sky Whale", desc: "Colossal azure sky leviathan swimming through clouds.", lore: "Spreads thousands of words like a melody." },
    de: { title: "Saphir-Himmelswal", desc: "Riesiger blauer Himmelswal in den Wolken.", lore: "Verbreitet tausende Wörter wie eine Melodie." },
    es: { title: "Ballena Celeste Zafiro", desc: "Colosal ballena azul nadando entre nubes.", lore: "Esparce miles de palabras como una melodía." },
    fr: { title: "Baleine Céleste Saphir", desc: "Immense baleine azur nageant dans les nuages.", lore: "Diffuse des milliers de mots en mélodie." },
  },
  creature_20: {
    en: { title: "Magma Bull", desc: "Unstoppable subterranean giant dripping molten lava.", lore: "Never retreats—smashes through every obstacle." },
    de: { title: "Magmastier", desc: "Unaufhaltsamer Riese mit glühenden Hörnern.", lore: "Weicht niemals zurück und bricht alle Hürden." },
    es: { title: "Toro de Magma", desc: "Gigante imparable con cuernos de lava.", lore: "Nunca retrocede ante ningún obstáculo." },
    fr: { title: "Taureau de Magma", desc: "Géant souterrain indomptable aux cornes de lave.", lore: "Ne recule jamais et brise tout obstacle." },
  },
  creature_21: {
    en: { title: "Wind Griffin", desc: "Noble guardian of mountain passes with eagle head.", lore: "Symbolizes courage united with sharp intellect." },
    de: { title: "Windgreif", desc: "Edler Wächter der Bergpässe.", lore: "Vereint Mut mit scharfem Verstand." },
    es: { title: "Grifo del Viento", desc: "Noble guardián de pasos montañosos.", lore: "Une valor y mente aguda." },
    fr: { title: "Griffon du Vent", desc: "Noble gardien des cols montagneux.", lore: "Symbolise l'union du courage et de l'esprit." },
  },
  creature_22: {
    en: { title: "Dark Hydra", desc: "Multi-headed ancient legend growing stronger each strike.", lore: "Doubles mental capacity after every solved challenge." },
    de: { title: "Dunkle Hydra", desc: "Mehrköpfige Legende mit wachsender Kraft.", lore: "Verdoppelt die Geisteskraft mit jedem Rätsel." },
    es: { title: "Hidra Oscura", desc: "Leyenda multicéfala que duplica su poder.", lore: "Multiplica la memoria tras cada reto resuelto." },
    fr: { title: "Hydre Sombre", desc: "Légende polycéphale toujours plus forte.", lore: "Double la mémoire après chaque défi résolu." },
  },
  creature_23: {
    en: { title: "Moon Moth Selene", desc: "Fairy moth adorning night dreams with words.", lore: "Guardian angel of memory consolidation during sleep." },
    de: { title: "Mondmotte Selene", desc: "Schmückt Träume mit leuchtenden Wörtern.", lore: "Schutzengel der Gedächtnisfestigung im Schlaf." },
    es: { title: "Polilla Lunar Selene", desc: "Polilla feérica que adorna sueños con palabras.", lore: "Ángel guardián de la memoria al dormir." },
    fr: { title: "Papillon Lunaire Séléné", desc: "Papillon féerique ornant les rêves de mots.", lore: "Ange gardien de la mémoire nocturne." },
  },
  creature_24: {
    en: { title: "Astral Mushroom Spirit", desc: "Psychic forest spirit glowing deep in enchanted woods.", lore: "Forages unexpected intuitive links between words." },
    de: { title: "Astraler Pilzgeist", desc: "Leuchtender Geist des Zauberwaldes.", lore: "Knüpft intuitive Verbindungen zwischen Wörtern." },
    es: { title: "Espíritu Astral del Bosque", desc: "Espíritu psíquico brillante en bosques mágicos.", lore: "Crea lazos intuitivos entre palabras." },
    fr: { title: "Esprit Astral Sylvestre", desc: "Esprit lumineux des sous-bois enchantés.", lore: "Tisse des liens intuitifs entre les mots." },
  },
  creature_25: {
    en: { title: "Ancient Titan Dragon", desc: "Supreme creature slumbering in the skies since dawn of time.", lore: "Crown jewel of Hall 2 awakening for 100-word explorers." },
    de: { title: "Uralter Titandrache", desc: "Höchstes Wesen seit Beginn der Zeit.", lore: "Kronjuwel von Saal 2 ab 100 Wörtern." },
    es: { title: "Dragón Titán Antiguo", desc: "Criatura suprema dormida desde el origen.", lore: "Joya del Salón 2 para exploradores de 100 palabras." },
    fr: { title: "Dragon Titan Ancien", desc: "Créature suprême veillant depuis l'aube des temps.", lore: "Joyau de la Salle 2 dès 100 mots appris." },
  },

  // SALON 3: RELICS
  relic_01: {
    en: { title: "Bronze Explorer Sword", desc: "Trusted blade of recruits entering early word battles.", lore: "Light and balanced—helps craft first A1 sentences." },
    de: { title: "Bronzeschwert der Entdecker", desc: "Verlässliche Klinge für erste Wortkämpfe.", lore: "Hilft mutig bei den ersten A1-Sätzen." },
    es: { title: "Espada de Bronce", desc: "Hoja fiel para las primeras batallas verbales.", lore: "Equilibrada para formar tus primeras frases A1." },
    fr: { title: "Épée d'Explorateur en Bronze", desc: "Lame fiable des premiers combats de mots.", lore: "Équilibrée pour vos premières phrases A1." },
  },
  relic_02: {
    en: { title: "Flaming Dictionary Sword", desc: "Enchanted blade burning false letters with bright flames.", lore: "Great companion to order scrambled letters." },
    de: { title: "Flammendes Wörterbuchschwert", desc: "Verbrennt falsche Buchstaben mit Magie.", lore: "Perfekt für Word-Scramble-Spiele." },
    es: { title: "Espada Diccionario Flamígera", desc: "Hoja mágica que quema letras erróneas.", lore: "Guía ideal para ordenar letras." },
    fr: { title: "Épée Dictionnaire Flamboyante", desc: "Lame enchantée brûlant les lettres erronées.", lore: "Idéale pour ordonner les lettres." },
  },
  relic_03: {
    en: { title: "Crystal Shield", desc: "Translucent shield deflecting exam anxiety and confusion.", lore: "Guards the mind like armor against tricky distractors." },
    de: { title: "Kristallschild", desc: "Weist Prüfungsangst und Verwirrung ab.", lore: "Schützt vor irreführenden Testoptionen." },
    es: { title: "Escudo de Cristal", desc: "Escudo transparente contra la ansiedad de examen.", lore: "Protege la mente de opciones engañosas." },
    fr: { title: "Bouclier de Cristal", desc: "Bouclier repoussant le trac et la confusion.", lore: "Protège contre les leurres d'examen." },
  },
  relic_04: {
    en: { title: "Laser Plasma Blade", desc: "High-energy sword gleaming with future tech.", lore: "Splits complex compound words into roots cleanly." },
    de: { title: "Laser-Plasmaklinge", desc: "Hochenergie-Klinge aus Zukunftstechnologie.", lore: "Teilt komplexe Wörter sauber in ihre Wurzeln." },
    es: { title: "Espada Láser de Plasma", desc: "Espada de alta energía futurista.", lore: "Divide palabras compuestas en sus raíces." },
    fr: { title: "Lame Plasma Laser", desc: "Épée haute énergie de technologie future.", lore: "Découpe les mots composés jusqu'à la racine." },
  },
  relic_05: {
    en: { title: "Excalibur Golden Sword", desc: "Ancient word sword set in stone for true victors.", lore: "Radiates golden beams on every accurate pronunciation." },
    de: { title: "Goldschwert Excalibur", desc: "Uraltes Schwert im Stein für wahre Sieger.", lore: "Strahlt Goldlicht bei jeder klaren Aussprache." },
    es: { title: "Espada Dorada Excalibur", desc: "Espada antigua en la piedra para vencedores.", lore: "Emite haces dorados al pronunciar bien." },
    fr: { title: "Épée d'Or Excalibur", desc: "Épée ancienne des véritables vainqueurs.", lore: "Rayonne d'or à chaque prononciation juste." },
  },
  relic_06: {
    en: { title: "Grandmaster Golden Crown", desc: "Crown of leaders mastering 300+ words in Hall 3.", lore: "Glows in pure gold on the wearer's profile." },
    de: { title: "Großmeister-Goldkrone", desc: "Krone der Meister ab 300+ Wörtern.", lore: "Glänzt in reinem Gold auf dem Profil." },
    es: { title: "Corona Dorada Gran Maestro", desc: "Corona de líderes con más de 300 palabras.", lore: "Brilla con oro puro en tu perfil." },
    fr: { title: "Couronne d'Or Grand Maître", desc: "Couronne des maîtres à 300+ mots.", lore: "Resplendit d'or pur sur le profil." },
  },
  relic_07: {
    en: { title: "Runic Titanium Armor", desc: "Unbreakable chestplate etched with grammar runes.", lore: "Keeps focus unwavering during tough reading passages." },
    de: { title: "Runen-Titanrüstung", desc: "Unzerstörbare Brustplatte mit Grammatik-Runen.", lore: "Hält die Konzentration in schweren Lesetexten." },
    es: { title: "Armadura Rúnica de Titanio", desc: "Coraza irrompible con runas gramaticales.", lore: "Mantiene intacto el enfoque en lecturas." },
    fr: { title: "Armure Runique en Titane", desc: "Plastron incassable gravé de runes.", lore: "Préserve votre concentration en lecture." },
  },
  relic_08: {
    en: { title: "Glacial Lance", desc: "Frozen spear honed by sharp arctic gales.", lore: "Catches subtle nuances across distant contexts." },
    de: { title: "Gletscherlanze", desc: "Gefrorener Speer aus Polarstürmen.", lore: "Erfasst feinste Bedeutungsnuancen." },
    es: { title: "Lanza Glacial", desc: "Lanza helada afilada por vientos polares.", lore: "Atrapa matices sutiles al instante." },
    fr: { title: "Lance Glaciaire", desc: "Lance glacée aiguisée par les vents polaires.", lore: "Saisit les nuances subtiles d'un seul coup." },
  },
  relic_09: {
    en: { title: "Helm of Infinity", desc: "Luminous helmet shielding mind from outside noise.", lore: "Delivers audio pronunciation in studio clarity." },
    de: { title: "Helm der Unendlichkeit", desc: "Schirmt den Geist vor Störgeräuschen ab.", lore: "Überträgt Aussprache in Studioqualität." },
    es: { title: "Yelmo del Infinito", desc: "Yelmo brillante que aísla del ruido externo.", lore: "Transmite la pronunciación con nitidez." },
    fr: { title: "Heaume de l'Infini", desc: "Heaume isolant l'esprit des bruits extérieurs.", lore: "Transmet la prononciation avec clarté." },
  },
  relic_10: {
    en: { title: "Meteorite Hammer", desc: "Heavy warhammer forged from a fallen asteroid core.", lore: "Ideal for shattering asteroids in Gravity Defense." },
    de: { title: "Meteoritenhammer", desc: "Geschmiedet aus dem Kern eines Asteroiden.", lore: "Perfekt für die Gravitations-Abwehr." },
    es: { title: "Martillo de Meteorito", desc: "Martillo forjado del núcleo de un meteorito.", lore: "Ideal para destruir asteroides en Gravedad." },
    fr: { title: "Marteau Météorite", desc: "Marteau forgé au cœur d'une météorite.", lore: "Parfait pour briser les astéroïdes." },
  },
  relic_11: {
    en: { title: "Lightning Bow", desc: "Charged combo bow crackling with sparks when drawn.", lore: "Grants bonus score on consecutive combo streaks." },
    de: { title: "Blitzbogen", desc: "Elektrisch geladener Kombo-Bogen.", lore: "Erzeugt +50% Bonuspunkte in Kombo-Serien." },
    es: { title: "Arco Relámpago", desc: "Arco eléctrico que chispea al tensarse.", lore: "Genera +50% puntos en rachas de combos." },
    fr: { title: "Arc Éclair", desc: "Arc électrique crépitant d'étincelles.", lore: "Génère +50% de score en série de combos." },
  },
  relic_12: {
    en: { title: "Shadow Dagger", desc: "Quick-reflex dagger moving in complete silence.", lore: "Clears Card Match pairs in mere seconds." },
    de: { title: "Schattendolch", desc: "Schneller Reflexdolch für lautlose Präzision.", lore: "Löst Kartenpaare in Sekundenschnelle." },
    es: { title: "Daga de Sombra", desc: "Daga de reflejos rápidos y silenciosos.", lore: "Despeja parejas de cartas en segundos." },
    fr: { title: "Dague d'Ombre", desc: "Dague vive aux réflexes silencieux.", lore: "Élimine les paires de cartes en quelques secondes." },
  },
  relic_13: {
    en: { title: "Dragonscale Cloak", desc: "Fireproof mantle stitched from Ignis's shed scales.", lore: "Shields from critical blows with noble poise." },
    de: { title: "Drachenschuppen-Umhang", desc: "Feuerfester Mantel aus Ignis' Schuppen.", lore: "Bewahrt vor kritischem Schaden." },
    es: { title: "Capa de Escamas de Dragón", desc: "Manto ignífugo tejido con escamas de Ignis.", lore: "Evita daños críticos con porte noble." },
    fr: { title: "Cape d'Écailles de Dragon", desc: "Manteau ignifugé cousu d'écailles d'Ignis.", lore: "Protège des coups critiques avec noblesse." },
  },
  relic_14: {
    en: { title: "Ancient Battle Axe", desc: "Heavy double-edged steel war axe.", lore: "Splits long complex sentences into logical parts." },
    de: { title: "Uralte Streitaxt", desc: "Schwere zweischneidige Stahlaxt.", lore: "Zerlegt lange Sätze logisch in Teile." },
    es: { title: "Hacha de Batalla Antigua", desc: "Pesada hacha de acero de doble filo.", lore: "Divide oraciones largas en bloques lógicos." },
    fr: { title: "Hache de Guerre Ancienne", desc: "Lourde hache d'acier à double tranchant.", lore: "Découpe les phrases longues avec logique." },
  },
  relic_15: {
    en: { title: "Soul Ward Amulet", desc: "Silver pendant wrapped around a blue sapphire.", lore: "Flags at-risk words straight to Revenge Arena." },
    de: { title: "Seelenschutz-Amulett", desc: "Silberanhänger mit blauem Saphir.", lore: "Markiert vergessene Wörter für die Revanche." },
    es: { title: "Amuleto Guardián", desc: "Colgante de plata con zafiro azul.", lore: "Envía palabras en riesgo a la Arena de Revancha." },
    fr: { title: "Amulette Garde-Âme", desc: "Pendentif d'argent orné d'un saphir bleu.", lore: "Signale les mots fragiles pour la Revanche." },
  },
  relic_16: {
    en: { title: "Magnetic Gauntlet", desc: "Draws words from thin air right to your fingertips.", lore: "Pulls the correct option intuitively toward you." },
    de: { title: "Magnetischer Handschuh", desc: "Zieht Wörter direkt an die Fingerspitzen.", lore: "Lenkt intuitiv zur richtigen Antwort." },
    es: { title: "Guantelete Magnético", desc: "Atrae palabras del aire a tus dedos.", lore: "Atrae intuitivamente la opción correcta." },
    fr: { title: "Gantelet Magnétique", desc: "Attire les mots jusqu'au bout des doigts.", lore: "Attire intuitivement la bonne réponse." },
  },
  relic_17: {
    en: { title: "Cosmic Ring", desc: "Gleaming golden ring holding a swirling galaxy.", lore: "Radiates cosmic light across your vocabulary honeycomb." },
    de: { title: "Kosmischer Ring", desc: "Goldring mit einer wirbelnden Galaxie.", lore: "Erhellt jede Wabe deines Wortschatzes." },
    es: { title: "Anillo Cósmico", desc: "Anillo de oro con una galaxia giratoria.", lore: "Ilumina cada celda de tu panal léxico." },
    fr: { title: "Anneau Cosmique", desc: "Anneau d'or renfermant une galaxie.", lore: "Illumine toutes les alvéoles de votre lexique." },
  },
  relic_18: {
    en: { title: "Emerald Aegis Shield", desc: "Legendary defense disk coated in forest emeralds.", lore: "Gently corrects mispronounced words with gold bonuses." },
    de: { title: "Smaragd-Ägisschild", desc: "Verteidigungsscheibe mit Waldschmaragden.", lore: "Korrigiert Aussprache mit Bonusgold." },
    es: { title: "Escudo Égida Esmeralda", desc: "Disco legendario cubierto de esmeraldas.", lore: "Corrige pronunciación con oro extra." },
    fr: { title: "Bouclier Égide Émeraude", desc: "Disque légendaire serti d'émeraudes.", lore: "Corrige la prononciation avec bonus d'or." },
  },
  relic_19: {
    en: { title: "Solar Spear", desc: "Illuminating spear tipped with pure daylight.", lore: "Lights up dense academic paragraphs like midday." },
    de: { title: "Sonnenspeer", desc: "Speer mit einer Spitze aus reinem Tageslicht.", lore: "Erhellt schwere akademische Absätze." },
    es: { title: "Lanza Solar", desc: "Lanza iluminadora con punta de luz diurna.", lore: "Aclara párrafos académicos oscuros." },
    fr: { title: "Lance Solaire", desc: "Lance à pointe de pure lumière du jour.", lore: "Éclaire les paragraphes académiques denses." },
  },
  relic_20: {
    en: { title: "Moonlight Scimitar", desc: "Graceful curved blade shimmering in silver light.", lore: "Makes late-night forgetting-curve reviews seamless." },
    de: { title: "Mondlicht-Säbel", desc: "Gebogene Klinge in silbernem Licht.", lore: "Glättet abendliche Gedächtnis-Reviews." },
    es: { title: "Cimitarra de Luz Lunar", desc: "Sable curvo elegante con brillo plateado.", lore: "Suaviza los repasos nocturnos de memoria." },
    fr: { title: "Cimeterre Clair de Lune", desc: "Lame courbée aux reflets d'argent.", lore: "Fluidifie vos révisions nocturnes." },
  },
  relic_21: {
    en: { title: "Bone Armor", desc: "Light armor crafted from prehistoric fossils.", lore: "Ancient heritage preserving etymology and roots." },
    de: { title: "Knochenrüstung", desc: "Leichte Rüstung aus prähistorischen Fossilien.", lore: "Bewahrt uralte Wortursprünge und Etymologie." },
    es: { title: "Armadura de Hueso", desc: "Armadura ligera de fósiles prehistóricos.", lore: "Preserva raíces antiguas y etimología." },
    fr: { title: "Armure d'Os", desc: "Armure légère faite de fossiles anciens.", lore: "Préserve l'étymologie et les racines anciennes." },
  },
  relic_22: {
    en: { title: "Plasma Energy Shield", desc: "Energy dome crackling with blue sparks on contact.", lore: "Shield generator erasing the fear of mistakes." },
    de: { title: "Plasma-Energieschild", desc: "Energiekuppel mit blauen Funken.", lore: "Beseitigt jede Angst vor Fehlern." },
    es: { title: "Escudo de Energía Plasma", desc: "Cúpula de energía con chispas azules.", lore: "Elimina el miedo a cometer errores." },
    fr: { title: "Bouclier d'Énergie Plasma", desc: "Dôme d'énergie aux étincelles bleues.", lore: "Efface la peur de faire des erreurs." },
  },
  relic_23: {
    en: { title: "Time-Bender Hourglass", desc: "Legendary hourglass whose sand flows upward.", lore: "Expands Speed Recall timers for calm thinking." },
    de: { title: "Zeitbeuger-Sanduhr", desc: "Sanduhr, deren Sand nach oben fließt.", lore: "Verlängert Denkzeit im Speed Recall." },
    es: { title: "Reloj de Arena Temporal", desc: "Reloj legendario cuya arena fluye hacia arriba.", lore: "Amplía el tiempo para pensar con calma." },
    fr: { title: "Sablier Temporel", desc: "Sablier légendaire au sable ascendant.", lore: "Étend le temps de réflexion en Speed Recall." },
  },
  relic_24: {
    en: { title: "Subterranean Gold Scythe", desc: "Gleaming scythe reaping gold veins in treasure mines.", lore: "Yields +10 extra gold from chests in Treasure Hunt." },
    de: { title: "Unterirdische Goldsense", desc: "Erntet Goldadern in Schatzminen.", lore: "Liefert +10 Bonusgold aus Truhen." },
    es: { title: "Guadaña de Oro Subterránea", desc: "Guadaña brillante para vetas de oro.", lore: "Aporta +10 de oro extra en cofres." },
    fr: { title: "Faux d'Or Souterraine", desc: "Faux étincelante des mines au trésor.", lore: "Rapporte +10 or extra par coffre." },
  },
  relic_25: {
    en: { title: "Sovereign Scepter", desc: "Imperial staff commanding all rules of language.", lore: "Hall 3 pinnacle artifact symbolizing mastery." },
    de: { title: "Zepter des Herrschers", desc: "Imperiales Zepter über alle Sprachregeln.", lore: "Gipfelartefakt von Saal 3." },
    es: { title: "Cetro del Soberano", desc: "Cetro imperial de todas las reglas del idioma.", lore: "Reliquia cumbre del Salón 3." },
    fr: { title: "Sceptre du Souverain", desc: "Sceptre impérial régissant le langage.", lore: "Artefact suprême de la Salle 3." },
  },

  // SALON 4: MONUMENTS
  monument_01: {
    en: { title: "Ancient Stone Watchtower", desc: "Lookout tower rising from stacked core word stones.", lore: "Represents the solid foundation of your first 50 words." },
    de: { title: "Uralter Steinwachturm", desc: "Aussichtsturm aus Grundwort-Steinen.", lore: "Fundament deiner ersten 50 Wörter." },
    es: { title: "Torre de Piedra Antigua", desc: "Torre vigía construida con tus primeras palabras.", lore: "Base sólida de tus primeras 50 palabras." },
    fr: { title: "Tour de Garde en Pierre", desc: "Tour érigée avec vos pierres de base.", lore: "Fondation solide de vos 50 premiers mots." },
  },
  monument_02: {
    en: { title: "Glacier Crystal Citadel", desc: "Translucent azure castle rising atop polar peaks.", lore: "Symbolizes clear grammar built on cold logic." },
    de: { title: "Gletscher-Kristallburg", desc: "Blaue Burg auf polaren Berggipfeln.", lore: "Steht für kristallklare Grammatik." },
    es: { title: "Ciudadela de Cristal Glacial", desc: "Castillo azul transparente en picos polares.", lore: "Simboliza gramática clara y lógica." },
    fr: { title: "Citadelle de Cristal Glaciaire", desc: "Château azur dressé sur les cimes polaires.", lore: "Incarne une grammaire claire et logique." },
  },
  monument_03: {
    en: { title: "Sky Star Citadel", desc: "Zero-gravity enchanted castle floating above clouds.", lore: "Sanctuary where hundreds of learned words shine like stars." },
    de: { title: "Himmels-Sternenburg", desc: "Schwebende Burg über den Wolken.", lore: "Wo hunderte gelernte Wörter wie Sterne leuchten." },
    es: { title: "Ciudadela Estelar del Cielo", desc: "Castillo encantado flotando sobre las nubes.", lore: "Santuario donde tus palabras brillan como estrellas." },
    fr: { title: "Citadelle Stellaire Céleste", desc: "Château flottant au-dessus des nuages.", lore: "Sanctuaire où vos mots brillent tels des étoiles." },
  },
  monument_04: {
    en: { title: "Dragon Sky Fortress", desc: "Legendary gold-and-lava citadel guarded by dragons.", lore: "Masterpiece inscribing 600+ word masters in gold." },
    de: { title: "Drachen-Himmelsfestung", desc: "Festung unter dem Schutz von Drachen.", lore: "Meisterwerk für Lerner ab 600+ Wörtern." },
    es: { title: "Fortaleza Dragón del Cielo", desc: "Fortaleza legendaria custodiada por dragones.", lore: "Obra maestra de quienes superan 600 palabras." },
    fr: { title: "Forteresse Dragon des Cieux", desc: "Citadelle d'or gardée par les dragons.", lore: "Chef-d'œuvre des maîtres à 600+ mots." },
  },
  monument_05: {
    en: { title: "Eternal Golden Pen", desc: "Monument pen writing words in gold leaf without running dry.", lore: "Creative wellspring of Reading Room AI stories." },
    de: { title: "Ewige Goldfeder", desc: "Denkmal-Feder, deren Goldtinte nie versiegt.", lore: "Schöpferische Quelle aller Lesezimmer-Geschichten." },
    es: { title: "Pluma Dorada Eterna", desc: "Pluma monumental de tinta áurea inagotable.", lore: "Fuente creativa de las historias del aula." },
    fr: { title: "Plume d'Or Éternelle", desc: "Plume monumentale à l'encre d'or inépuisable.", lore: "Source créative des histoires de lecture." },
  },
  monument_06: {
    en: { title: "Ancient Captain's Compass", desc: "Compass pointing not north, but to your next word.", lore: "Truest route guide at the heart of SM-2." },
    de: { title: "Uralter Kapitänskompass", desc: "Zeigt zum nächsten Wort, das du lernen solltest.", lore: "Herzstück der SM-2-Algorithmus-Route." },
    es: { title: "Brújula del Capitán Antiguo", desc: "Señala no al norte, sino a tu siguiente palabra.", lore: "Guía fiel en el corazón del algoritmo SM-2." },
    fr: { title: "Boussole du Capitaine Ancien", desc: "Indique non le nord, mais le prochain mot à apprendre.", lore: "Guide fidèle au cœur de l'algorithme SM-2." },
  },
  monument_07: {
    en: { title: "Endless Knowledge Tome", desc: "Sacred book whose infinite pages reveal new terms.", lore: "Heart of VocaShip feeding every library." },
    de: { title: "Magisches Wörterbuch des Wissens", desc: "Heiliges Buch mit endlosen Seiten.", lore: "Das Herz der VocaShip-Bibliotheken." },
    es: { title: "Grimorio del Saber Infinito", desc: "Libro sagrado con páginas interminables.", lore: "El corazón de todas las bibliotecas VocaShip." },
    fr: { title: "Tome du Savoir Infini", desc: "Livre sacré aux pages infinies.", lore: "Cœur de VocaShip nourrissant chaque bibliothèque." },
  },
  monument_08: {
    en: { title: "Lighthouse of Alexandria", desc: "Giant beacon shining word light over dark seas.", lore: "Clears away fog of unfamiliar concepts in one beam." },
    de: { title: "Leuchtturm von Alexandria", desc: "Riesenleuchtturm auf dunkler See.", lore: "Vertreibt den Nebel unbekannter Begriffe." },
    es: { title: "Faro de Alejandría", desc: "Faro gigante iluminando mares oscuros.", lore: "Disipa la niebla de conceptos desconocidos." },
    fr: { title: "Phare d'Alexandrie", desc: "Phare géant éclairant les mers sombres.", lore: "Dissipe le brouillard des notions inconnues." },
  },
  monument_09: {
    en: { title: "Sun Temple Pyramid", desc: "Colossal pyramid whose tiers mark A1 through C2.", lore: "Those reaching the apex speak with effortless artistry." },
    de: { title: "Sonnentempel-Pyramide", desc: "Jede Stufe markiert A1 bis C2.", lore: "Wer den Gipfel erreicht, spricht fließend." },
    es: { title: "Pirámide del Templo Solar", desc: "Pirámide cuyos niveles van de A1 a C2.", lore: "Quien alcanza la cima domina el idioma." },
    fr: { title: "Pyramide du Temple Solaire", desc: "Pyramide dont chaque degré mène de A1 à C2.", lore: "Ceux au sommet parlent avec art." },
  },
  monument_10: {
    en: { title: "Cosmic Observatory Tower", desc: "Telescopic monument studying idioms across galaxies.", lore: "Reminds us language horizons are boundless." },
    de: { title: "Kosmisches Observatorium", desc: "Untersucht Redewendungen ferner Galaxien.", lore: "Sprachlernen kennt keine Grenzen." },
    es: { title: "Torre Observatorio Cósmica", desc: "Monumento telescópico para modismos lejanos.", lore: "Recuerda que aprender es infinito como el cosmos." },
    fr: { title: "Tour Observatoire Cosmique", desc: "Observatoire étudiant les idiomes stellaires.", lore: "Rappelle que l'apprentissage est infini." },
  },
  monument_11: {
    en: { title: "Emerald City Gate", desc: "Grand gateway to the English-speaking civilization.", lore: "Hails every learner crossing as a global citizen." },
    de: { title: "Tor der Smaragdstadt", desc: "Großes Tor zur Welt der englischen Sprache.", lore: "Macht jeden Lernenden zum Weltbürger." },
    es: { title: "Puerta de la Ciudad Esmeralda", desc: "Gran portal hacia la lengua inglesa.", lore: "Saluda a cada estudiante como ciudadano global." },
    fr: { title: "Porte de la Cité Émeraude", desc: "Grand portail vers le monde anglophone.", lore: "Sacre chaque apprenant citoyen du monde." },
  },
  monument_12: {
    en: { title: "Storm Cliff Lighthouse", desc: "Granite lighthouse standing firm against raging waves.", lore: "Beacon of unshakable calm on exam days." },
    de: { title: "Sturm-Leuchtturm", desc: "Trotzt den wildesten Wellen auf Granit.", lore: "Leuchtfeuer der Ruhe am Prüfungstag." },
    es: { title: "Faro de la Tormenta", desc: "Faro de granito firme ante olas furiosas.", lore: "Guía de serenidad en días de examen." },
    fr: { title: "Phare des Tempêtes", desc: "Phare de granit défiant les vagues furieuses.", lore: "Phare de sérénité les jours d'examen." },
  },
  monument_13: {
    en: { title: "Desert Oasis Fountain", desc: "Magical spring offering fresh knowledge in scorching sands.", lore: "Renews weary learners' motivation in one sip." },
    de: { title: "Oasenbrunnen der Wüste", desc: "Spendet Wissenstrank im heißen Sand.", lore: "Erneuert Motivation mit einem Schluck." },
    es: { title: "Fuente del Oasis", desc: "Manantial mágico de saber en arenas cálidas.", lore: "Renueva la motivación al instante." },
    fr: { title: "Fontaine de l'Oasis", desc: "Source magique de savoir au cœur des sables.", lore: "Renouvelle la motivation en une gorgée." },
  },
  monument_14: {
    en: { title: "Lava Foundry Monument", desc: "Great forge casting golden medals and victory cups.", lore: "Turns every Game Arena victory into an eternal trophy." },
    de: { title: "Lavagießerei-Denkmal", desc: "Schmiedet Goldmedaillen und Siegerpokale.", lore: "Verwandelt Arena-Siege in ewige Trophäen." },
    es: { title: "Monumento Fundición de Lava", desc: "Fragua gigante donde se funden medallas.", lore: "Convierte victorias de Arena en trofeos." },
    fr: { title: "Monument Fonderie de Lave", desc: "Forge géante fondant médailles et trophées.", lore: "Transforme chaque victoire en trophée éternel." },
  },
  monument_15: {
    en: { title: "Runic Stonehenge Circle", desc: "Monoliths focusing sunlight onto word honeycombs.", lore: "Syncs natural cycles with biological memory rhythm." },
    de: { title: "Runen-Stonehenge-Kreis", desc: "Monolithen bündeln Sonnenlicht auf Wortwaben.", lore: "Synchronisiert Natur- und Gedächtnisrhythmus." },
    es: { title: "Círculo Rúnico Stonehenge", desc: "Monolitos que enfocan sol sobre panales.", lore: "Sincroniza ciclos naturales con tu memoria." },
    fr: { title: "Cercle Runique Stonehenge", desc: "Monolithes concentrant le soleil sur les alvéoles.", lore: "Synchronise le rythme biologique de mémoire." },
  },
  monument_16: {
    en: { title: "Sunken Temple of Atlantis", desc: "Ancient wisdom shrine glowing deep beneath the sea.", lore: "Guards the rarest words etched in underwater pillars." },
    de: { title: "Versunkener Atlantis-Tempel", desc: "Strahlender Weisheitsschrein auf dem Meeresgrund.", lore: "Bewahrt die tiefsten und seltensten Wörter." },
    es: { title: "Templo Sumergido de Atlántida", desc: "Santuario antiguo brillante bajo el océano.", lore: "Guarda las palabras más raras en sus pilares." },
    fr: { title: "Temple Englouti d'Atlantide", desc: "Sanctuaire lumineux au fond de l'océan.", lore: "Renferme les mots les plus rares." },
  },
  monument_17: {
    en: { title: "Floating Island Laputa", desc: "Ancient sky city hovering on magnetic minerals.", lore: "Seen only by explorers free of prejudice." },
    de: { title: "Schwebende Insel Laputa", desc: "Antike Stadt über magnetischen Wolken.", lore: "Nur für geistig freie Entdecker sichtbar." },
    es: { title: "Isla Flotante Laputa", desc: "Ciudad antigua suspendida por minerales magnéticos.", lore: "Visible solo para exploradores de mente libre." },
    fr: { title: "Île Flottante Laputa", desc: "Cité antique flottant par magnétisme.", lore: "Visible des seuls explorateurs sans préjugés." },
  },
  monument_18: {
    en: { title: "Plane Tree of Wisdom", desc: "Millennial sycamore rooted beneath grand libraries.", lore: "Sprouts a golden leaf for every 10 words learned." },
    de: { title: "Platane der Weisheit", desc: "Tausendjähriger Baum unter den Bibliotheken.", lore: "Treibt ein goldenes Blatt pro 10 Wörter." },
    es: { title: "Árbol de la Sabiduría", desc: "Árbol milenario con raíces bajo bibliotecas.", lore: "Brota una hoja dorada cada 10 palabras." },
    fr: { title: "Platane de la Sagesse", desc: "Arbre millénaire sous les bibliothèques.", lore: "Fait pousser une feuille d'or tous les 10 mots." },
  },
  monument_19: {
    en: { title: "Clocktower Chime Bell", desc: "Bronze bell chiming clear English tones every hour.", lore: "Timeless reminder of steady study discipline." },
    de: { title: "Uhrturm-Glocke", desc: "Bronzeglocke mit stündlichem Sprachklang.", lore: "Erinnert elegant an regelmäßiges Lernen." },
    es: { title: "Campana del Reloj", desc: "Campana de bronce que suena cada hora.", lore: "Recuerda con elegancia la disciplina diaria." },
    fr: { title: "Cloche du Beffroi", desc: "Cloche de bronze sonnant chaque heure.", lore: "Rappelle avec grâce la régularité." },
  },
  monument_20: {
    en: { title: "Crystal Cavern Shrine", desc: "Amethyst and emerald shrine formed over millions of years.", lore: "Echo chamber perfecting Speaking Lounge acoustics." },
    de: { title: "Kristallhöhlen-Schrein", desc: "Amethyst- und Smaragdtempel unter der Erde.", lore: "Perfektioniert die Akustik der Speaking Lounge." },
    es: { title: "Santuario Cueva de Cristal", desc: "Templo subterráneo de amatista y esmeralda.", lore: "Perfecciona la acústica de Speaking Lounge." },
    fr: { title: "Sanctuaire Grotte de Cristal", desc: "Temple souterrain d'améthyste et d'émeraude.", lore: "Parfait l'acoustique du Speaking Lounge." },
  },
  monument_21: {
    en: { title: "Iron Citadel Bastion", desc: "Steel fortress repelling armies of forgetfulness.", lore: "Turns unwavering persistence into a monument of steel." },
    de: { title: "Eisenfestung-Bastion", desc: "Stahlfestung gegen Heere des Vergessens.", lore: "Verwandelt Ausdauer in ein Stahlmonument." },
    es: { title: "Bastión Ciudadela de Hierro", desc: "Fortaleza de acero contra el olvido.", lore: "Convierte tu perseverancia en monumento." },
    fr: { title: "Bastion Citadelle de Fer", desc: "Forteresse d'acier repoussant l'oubli.", lore: "Transforme votre ténacité en monument d'acier." },
  },
  monument_22: {
    en: { title: "Magnetic Dimension Portal", desc: "Portal beaming travelers directly into new cultures.", lore: "Lets you live the language beyond textbooks." },
    de: { title: "Magnetisches Dimensionsportal", desc: "Beam-Portal in fremde Sprachkulturen.", lore: "Erlebe Sprache mitten im echten Leben." },
    es: { title: "Portal Dimensional Magnético", desc: "Portal directo al corazón de otra cultura.", lore: "Permite vivir el idioma más allá de libros." },
    fr: { title: "Portail Dimensionnel Magnétique", desc: "Portail vers le cœur d'une autre culture.", lore: "Permet de vivre la langue hors des livres." },
  },
  monument_23: {
    en: { title: "Rainbow Bridge Bifrost", desc: "Bridge of light uniting learners across every level.", lore: "Luminous bridge of classroom teamwork." },
    de: { title: "Regenbogenbrücke Bifröst", desc: "Lichtbrücke, die Lernende aller Stufen verbindet.", lore: "Symbol für Zusammenhalt in der Klasse." },
    es: { title: "Puente Arcoíris Bifrost", desc: "Puente de luz que une todos los niveles.", lore: "Puente luminoso de aprendizaje en equipo." },
    fr: { title: "Pont Arc-en-Ciel Bifrost", desc: "Pont de lumière unissant tous les niveaux.", lore: "Symbole d'entraide et de solidarité." },
  },
  monument_24: {
    en: { title: "Orb of Ancient Wisdom", desc: "Plasma sphere holding soundwaves of every world tongue.", lore: "Bestows effortless phonetic intuition at a touch." },
    de: { title: "Kugel uralter Weisheit", desc: "Plasmasphäre voller Lautwellen aller Sprachen.", lore: "Verleiht makelloses Phonetik-Gespür." },
    es: { title: "Orbe de Sabiduría Antigua", desc: "Esfera de plasma con ondas de todo idioma.", lore: "Otorga intuición fonética perfecta al tocarlo." },
    fr: { title: "Orbe de Sagesse Ancienne", desc: "Sphère contenant les ondes de toutes langues.", lore: "Confère une intuition phonétique parfaite." },
  },
  monument_25: {
    en: { title: "VocaShip Grand Pantheon", desc: "Eternal victory temple for explorers collecting all 100 relics.", lore: "Highest dome of the museum—architect of your own mastery." },
    de: { title: "VocaShip Großes Pantheon", desc: "Ewiger Siegestempel für alle 100 Relikte.", lore: "Höchste Kuppel des Museums." },
    es: { title: "Gran Panteón VocaShip", desc: "Templo eterno para quienes reúnen las 100 piezas.", lore: "La cúpula suprema de tu triunfo lingüístico." },
    fr: { title: "Grand Panthéon VocaShip", desc: "Temple éternel des 100 artefacts réunis.", lore: "Plus haute coupole de votre triomphe." },
  },
};

export function getLocalizedChestInfo(
  chestId: string,
  fallback: { name: string; badge: string; description: string },
  lang: Language
) {
  const map = CHEST_LOCALES[chestId];
  const loc = map?.[lang] || map?.en || map?.tr;
  return {
    name: loc?.name || fallback.name,
    badge: loc?.badge || fallback.badge,
    description: loc?.description || fallback.description,
  };
}

export function getLocalizedItemText(
  id: string,
  fallbackName: string,
  fallbackDesc: string,
  lang: Language
): { name: string; description: string } {
  if (lang === "tr") {
    return { name: fallbackName, description: fallbackDesc };
  }
  const core = CORE_ITEM_LOCALES[id];
  if (core) {
    const loc = core[lang] || core.en;
    if (loc) return { name: loc.name, description: loc.desc };
  }
  const cleanId = id.replace(/^museum_/, "");
  const mus = MUSEUM_ITEM_LOCALES[cleanId];
  if (mus) {
    const loc = mus[lang] || mus.en;
    if (loc) return { name: loc.title, description: loc.lore || loc.desc || fallbackDesc };
  }
  return { name: fallbackName, description: fallbackDesc };
}

export function getLocalizedMuseumEntry(
  id: string,
  fallback: { title: string; description: string; storyLore: string },
  lang: Language
) {
  if (lang === "tr") return fallback;
  const mus = MUSEUM_ITEM_LOCALES[id];
  const loc = mus?.[lang] || mus?.en;
  if (!loc) return fallback;
  return {
    title: loc.title || fallback.title,
    description: loc.desc || fallback.description,
    storyLore: loc.lore || fallback.storyLore,
  };
}

export function getLocalizedBuffLabel(
  buffType: MuseumBuffType | undefined,
  fallbackLabel: string,
  lang: Language
): string {
  if (!buffType) return fallbackLabel;
  return BUFF_LOCALES[buffType]?.[lang] || BUFF_LOCALES[buffType]?.en || fallbackLabel;
}
