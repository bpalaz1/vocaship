import type { Language } from "../context/LanguageContext";

export const CHEST_LOCALES_IT_RU: Record<string, Partial<Record<Language, { name: string; badge: string; description: string }>>> = {
  "chest_tier_1": {
    "it": {
      "name": "🌳 Forziere Natura e Scoperta",
      "badge": "Traguardo 20 Parole",
      "description": "Allegri compagni della foresta ed equipaggiamento iniziale da esploratore."
    },
    "ru": {
      "name": "🌳 Сундук Природы и Открытий",
      "badge": "Рубеж 20 слов",
      "description": "Весёлые лесные спутники и стартовое снаряжение исследователя."
    }
  },
  "chest_tier_2": {
    "it": {
      "name": "⚔️ Forziere Eroi e Avventura",
      "badge": "Traguardo 100 Parole",
      "description": "Cavalieri coraggiosi, armi incantate e antiche pergamene."
    },
    "ru": {
      "name": "⚔️ Сундук Героев и Приключений",
      "badge": "Рубеж 100 слов",
      "description": "Отважные рыцари, зачарованное оружие и древние свитки."
    }
  },
  "chest_tier_3": {
    "it": {
      "name": "🚀 Forziere Cosmo e Futuro",
      "badge": "Traguardo 300 Parole",
      "description": "Cyborg, guardiani delle nebulose e gadget quantistici."
    },
    "ru": {
      "name": "🚀 Сундук Космоса и Будущего",
      "badge": "Рубеж 300 слов",
      "description": "Киборги, стражи туманностей и квантовые гаджеты."
    }
  },
  "chest_tier_4": {
    "it": {
      "name": "👑 Forziere Leggende e Antichità",
      "badge": "Traguardo 500-1000 Parole",
      "description": "Antichi draghi di lava, fenici dorate e piume cosmiche."
    },
    "ru": {
      "name": "👑 Сундук Легенд и Древности",
      "badge": "Рубеж 500-1000 слов",
      "description": "Древние лавовые драконы, золотые фениксы и космические перья."
    }
  }
};

export const SALON_LOCALES_IT_RU: Record<string, Partial<Record<Language, { title: string; subtitle: string; badge: string }>>> = {
  "1": {
    "it": {
      "title": "Eroi e Guardiani",
      "subtitle": "Coraggiosi guerrieri e sagge guide dell'universo VocaShip",
      "badge": "Sala 1"
    },
    "ru": {
      "title": "Герои и Стражи",
      "subtitle": "Отважные воины и мудрые наставники вселенной VocaShip",
      "badge": "Зал 1"
    }
  },
  "2": {
    "it": {
      "title": "Draghi e Creature Mitiche",
      "subtitle": "Abitanti mitologici di cieli antichi e regni nascosti",
      "badge": "Sala 2"
    },
    "ru": {
      "title": "Драконы и Мифические Существа",
      "subtitle": "Мифологические обитатели древних небес и тайных миров",
      "badge": "Зал 2"
    }
  },
  "3": {
    "it": {
      "title": "Armi e Armature Antiche",
      "subtitle": "Equipaggiamento sacro forgiato da fabbri leggendari con il potere delle parole",
      "badge": "Sala 3"
    },
    "ru": {
      "title": "Древнее Оружие и Доспехи",
      "subtitle": "Священное снаряжение, выкованное легендарными кузнецами силой слов",
      "badge": "Зал 3"
    }
  },
  "4": {
    "it": {
      "title": "Cittadelle e Monumenti della Saggezza",
      "subtitle": "Eterne fortezze-biblioteca della civiltà della memoria da 1000 parole",
      "badge": "Sala 4"
    },
    "ru": {
      "title": "Цитадели и Памятники Мудрости",
      "subtitle": "Вечные крепости-библиотеки цивилизации памяти на 1000 слов",
      "badge": "Зал 4"
    }
  }
};

export const CORE_ITEM_LOCALES_IT_RU: Record<string, Partial<Record<Language, { name: string; desc: string; bonus?: string }>>> = {
  "fox_sparky": {
    "it": {
      "name": "Volpe Sparky",
      "desc": "Volpe allegra, curiosa e intelligente con gli occhiali.",
      "bonus": "+5% Bonus Serie Giornaliera"
    },
    "ru": {
      "name": "Лисёнок Спарки",
      "desc": "Весёлый, любознательный и умный лис в очках.",
      "bonus": "+5% к бонусу ежедневной серии"
    }
  },
  "chicken_chuck": {
    "it": {
      "name": "Pollo Chuck",
      "desc": "Esploratore di fattoria energico e divertente.",
      "bonus": "+5 Oro per Partita"
    },
    "ru": {
      "name": "Петушок Чак",
      "desc": "Энергичный и весёлый исследователь фермы.",
      "bonus": "+5 золота за игру"
    }
  },
  "river_beaver": {
    "it": {
      "name": "Castoro di Fiume",
      "desc": "Tenace costruttore di dighe di parole."
    },
    "ru": {
      "name": "Речной бобр",
      "desc": "Упорный мастер словесных плотин."
    }
  },
  "forest_frog": {
    "it": {
      "name": "Rana del Bosco",
      "desc": "Amica agile che salta da una parola all'altra."
    },
    "ru": {
      "name": "Лесная лягушка",
      "desc": "Ловкий друг, прыгающий между словами."
    }
  },
  "night_owl": {
    "it": {
      "name": "Gufo Notturno",
      "desc": "Saggio osservatore delle sessioni di studio serali."
    },
    "ru": {
      "name": "Ночная сова",
      "desc": "Мудрый наблюдатель поздних занятий."
    }
  },
  "baby_panda": {
    "it": {
      "name": "Cucciolo di Panda",
      "desc": "Adorabile studente delle foreste di bambù."
    },
    "ru": {
      "name": "Малыш панда",
      "desc": "Милый ученик бамбуковых рощ."
    }
  },
  "apprentice_cat": {
    "it": {
      "name": "Gatto Apprendista",
      "desc": "Simpatico apprendista con le zampe sul dizionario."
    },
    "ru": {
      "name": "Кот-ученик",
      "desc": "Милый подмастерье с лапками на словаре."
    }
  },
  "cheerful_squirrel": {
    "it": {
      "name": "Scoiattolo Allegro",
      "desc": "Raccoglie vocaboli come ghiande."
    },
    "ru": {
      "name": "Весёлая белка",
      "desc": "Собирает слова, словно жёлуди."
    }
  },
  "wise_turtle": {
    "it": {
      "name": "Tartaruga Saggia",
      "desc": "Filosofa paziente che impara a passo fermo."
    },
    "ru": {
      "name": "Мудрая черепаха",
      "desc": "Терпеливый и глубокий философ природы."
    }
  },
  "mountain_goat": {
    "it": {
      "name": "Capra di Montagna",
      "desc": "Scala senza paura ripide vette di vocaboli."
    },
    "ru": {
      "name": "Горный козёл",
      "desc": "Бесстрашно покоряет крутые вершины словаря."
    }
  },
  "wooden_dict_pen": {
    "it": {
      "name": "Penna Dizionario in Legno",
      "desc": "Primo strumento di scrittura per nuovi esploratori linguistici."
    },
    "ru": {
      "name": "Деревянная ручка-словарь",
      "desc": "Первый инструмент письма для юных исследователей языков."
    }
  },
  "bronze_dagger": {
    "it": {
      "name": "Pugnale di Bronzo",
      "desc": "Forgiato per i primi colpi nell'arena."
    },
    "ru": {
      "name": "Бронзовый кинжал",
      "desc": "Выкован для первых ударов на арене."
    }
  },
  "apprentice_notebook": {
    "it": {
      "name": "Taccuino dell'Apprendista",
      "desc": "Dove vengono annotate con cura le prime 20 parole."
    },
    "ru": {
      "name": "Блокнот ученика",
      "desc": "Сюда бережно записывают первые 20 слов."
    }
  },
  "nature_compass": {
    "it": {
      "name": "Bussola Naturale",
      "desc": "Punta sempre direttamente al significato corretto."
    },
    "ru": {
      "name": "Компас природы",
      "desc": "Всегда указывает прямо на верное значение."
    }
  },
  "leaf_amulet": {
    "it": {
      "name": "Amuleto Foglia",
      "desc": "Protegge la tua serie una volta in caso di errore."
    },
    "ru": {
      "name": "Амулет листа",
      "desc": "Один раз защищает вашу серию при ошибке."
    }
  },
  "knight_leo": {
    "it": {
      "name": "Cavaliere Leo",
      "desc": "Coraggioso guardiano del castello dal cuore di leone."
    },
    "ru": {
      "name": "Рыцарь Лео",
      "desc": "Отважный страж замка с львиным сердцем."
    }
  },
  "village_archer": {
    "it": {
      "name": "Arciere del Villaggio",
      "desc": "Tiratore dall'occhio acuto che centra sempre il bersaglio."
    },
    "ru": {
      "name": "Деревенский лучник",
      "desc": "Меткий стрелок, бьющий точно в яблочко."
    }
  },
  "desert_nomad_alex": {
    "it": {
      "name": "Nomade del Deserto Alex",
      "desc": "Viaggiatore resistente che affronta le tempeste di sabbia."
    },
    "ru": {
      "name": "Пустынный кочевник Алекс",
      "desc": "Выносливый путник оазисов сквозь песчаные бури."
    }
  },
  "stone_golem": {
    "it": {
      "name": "Golem di Pietra",
      "desc": "Gigante incrollabile forgiato in antica roccia montana."
    },
    "ru": {
      "name": "Каменный голем",
      "desc": "Несокрушимый гигант из древней горной породы."
    }
  },
  "shadow_thief": {
    "it": {
      "name": "Ladro d'Ombre",
      "desc": "Cattura in un lampo le parole sussurrate nell'ombra."
    },
    "ru": {
      "name": "Теневой вор",
      "desc": "Молниеносно ловит слова, произнесённые шёпотом."
    }
  },
  "sailor_captain": {
    "it": {
      "name": "Capitano Marinaio",
      "desc": "Capitano esperto nei mari tempestosi delle parole."
    },
    "ru": {
      "name": "Капитан-моряк",
      "desc": "Опытный капитан в бурных морях слов."
    }
  },
  "night_mage": {
    "it": {
      "name": "Mago Notturno",
      "desc": "Illumina antiche pergamene con polvere di stelle."
    },
    "ru": {
      "name": "Ночной маг",
      "desc": "Освещает древние свитки звёздной пылью."
    }
  },
  "winged_pegasus": {
    "it": {
      "name": "Pegaso Alato",
      "desc": "Destriero alato leggendario al di sopra delle nuvole."
    },
    "ru": {
      "name": "Крылатый Пегас",
      "desc": "Легендарный крылатый конь высоко над облаками."
    }
  },
  "armored_bear": {
    "it": {
      "name": "Orso Corazzato",
      "desc": "Possente guerriero in armatura artica."
    },
    "ru": {
      "name": "Бронированный медведь",
      "desc": "Могучий воин в арктических доспехах."
    }
  },
  "cave_troll": {
    "it": {
      "name": "Troll delle Caverne",
      "desc": "Guardiano burbero ma fedele delle grotte profonde."
    },
    "ru": {
      "name": "Пещерный тролль",
      "desc": "Суровый, но верный страж глубоких гротов."
    }
  },
  "silver_quill": {
    "it": {
      "name": "Piuma d'Argento",
      "desc": "Penna d'argento finemente cesellata per scrivere con fluidità."
    },
    "ru": {
      "name": "Серебряное перо",
      "desc": "Изящное серебряное перо для плавного письма."
    }
  },
  "knight_steel_shield": {
    "it": {
      "name": "Scudo d'Acciaio del Cavaliere",
      "desc": "Respinge i contrattacchi del boss in battaglia."
    },
    "ru": {
      "name": "Стальной щит рыцаря",
      "desc": "Отражает контратаки босса в бою."
    }
  },
  "flaming_dict_sword": {
    "it": {
      "name": "Spada Dizionario Fiammeggiante",
      "desc": "Attiva moltiplicatori di colpi critici sulle risposte corrette."
    },
    "ru": {
      "name": "Пылающий меч-словарь",
      "desc": "Активирует множители критического удара."
    }
  },
  "wind_boots": {
    "it": {
      "name": "Stivali del Vento",
      "desc": "Concede secondi bonus nelle modalità a tempo."
    },
    "ru": {
      "name": "Сапоги ветра",
      "desc": "Дают бонусные секунды в режимах на время."
    }
  },
  "ancient_scroll": {
    "it": {
      "name": "Pergamena Antica",
      "desc": "Distintivo d'onore per 100 parole padroneggiate."
    },
    "ru": {
      "name": "Древний свиток",
      "desc": "Почётный знак за 100 освоенных слов."
    }
  },
  "cyber_cat": {
    "it": {
      "name": "Cyber-Gatto",
      "desc": "Scansiona migliaia di lettere al secondo."
    },
    "ru": {
      "name": "Кибер-кот",
      "desc": "Сканирует тысячи букв в секунду."
    }
  },
  "cyborg_robot": {
    "it": {
      "name": "Unità Cyborg",
      "desc": "Unità IA programmata per un'analisi impeccabile delle parole."
    },
    "ru": {
      "name": "Киборг-юнит",
      "desc": "ИИ-модуль для безошибочного анализа слов."
    }
  },
  "nebula_guardian_evelyn": {
    "it": {
      "name": "Guardiana Nebulare Evelyn",
      "desc": "Direttrice della ricerca linguistica interstellare."
    },
    "ru": {
      "name": "Хранительница туманности Эвелин",
      "desc": "Глава межзвёздной лингвистики."
    }
  },
  "galaxy_pilot": {
    "it": {
      "name": "Pilota Galattico",
      "desc": "Asso del volo nella Difesa Gravitazionale."
    },
    "ru": {
      "name": "Галактический пилот",
      "desc": "Пилот-ас в режиме «Гравитационная защита»."
    }
  },
  "plasma_alien": {
    "it": {
      "name": "Alieno al Plasma",
      "desc": "Essere di energia dotato di linguaggio telepatico."
    },
    "ru": {
      "name": "Плазменный пришелец",
      "desc": "Энергетическое существо с телепатической речью."
    }
  },
  "hologram_sage": {
    "it": {
      "name": "Saggio Olografico",
      "desc": "Memoria infinita degli archivi digitali."
    },
    "ru": {
      "name": "Голографический мудрец",
      "desc": "Безграничная память цифровых архивов."
    }
  },
  "quantum_agent_sarah": {
    "it": {
      "name": "Agente Quantistica Sarah",
      "desc": "Decifra più parole attraverso le dimensioni."
    },
    "ru": {
      "name": "Квантовый агент Сара",
      "desc": "Расшифровывает множество слов сквозь измерения."
    }
  },
  "star_angel": {
    "it": {
      "name": "Angelo Stellare",
      "desc": "Luce guida per gli studenti nelle tempeste cosmiche."
    },
    "ru": {
      "name": "Звёздный ангел",
      "desc": "Путеводный свет для учеников в космических бурях."
    }
  },
  "laser_pen": {
    "it": {
      "name": "Penna Laser",
      "desc": "Incide le parole alla velocità della luce."
    },
    "ru": {
      "name": "Лазерная ручка",
      "desc": "Высекает слова со скоростью света."
    }
  },
  "gravity_belt": {
    "it": {
      "name": "Cintura Antigravità",
      "desc": "Rallenta le meteore in caduta nella modalità Gravità."
    },
    "ru": {
      "name": "Антигравитационный пояс",
      "desc": "Замедляет падающие метеоры в режиме гравитации."
    }
  },
  "quantum_visor": {
    "it": {
      "name": "Visore Quantico",
      "desc": "Elimina all'istante le opzioni di risposta errate."
    },
    "ru": {
      "name": "Квантовый визор",
      "desc": "Мгновенно отсеивает неверные варианты ответа."
    }
  },
  "cosmic_compass": {
    "it": {
      "name": "Bussola Cosmica",
      "desc": "Guida galattica per maestri di oltre 300 parole."
    },
    "ru": {
      "name": "Космический компас",
      "desc": "Галактический указатель для мастеров 300+ слов."
    }
  },
  "ancient_lava_dragon_ignis": {
    "it": {
      "name": "Antico Drago di Lava Ignis",
      "desc": "Antico signore delle fiamme nato dal nucleo vulcanico."
    },
    "ru": {
      "name": "Древний лавовый дракон Игнис",
      "desc": "Древний владыка пламени из вулканического ядра."
    }
  },
  "golden_phoenix": {
    "it": {
      "name": "Fenice Dorata",
      "desc": "Uccello divino che protegge la tua serie per sempre."
    },
    "ru": {
      "name": "Золотой феникс",
      "desc": "Божественная птица, вечно хранящая вашу серию."
    }
  },
  "judge_harrison": {
    "it": {
      "name": "Giudice Supremo Harrison",
      "desc": "Massima autorità del linguaggio giuridico a livello C2."
    },
    "ru": {
      "name": "Верховный судья Харрисон",
      "desc": "Высший авторитет в юридическом языке уровня C2."
    }
  },
  "cosmic_dragon_bahamut": {
    "it": {
      "name": "Drago Cosmico Bahamut",
      "desc": "Drago di saggezza infinita tra i sistemi stellari."
    },
    "ru": {
      "name": "Космический дракон Бахамут",
      "desc": "Дракон бесконечной мудрости среди звёздных систем."
    }
  },
  "infinity_lord": {
    "it": {
      "name": "Signore dell'Infinito",
      "desc": "Corona del campione delle 1000 parole."
    },
    "ru": {
      "name": "Повелитель бесконечности",
      "desc": "Корона чемпиона 1000 слов."
    }
  },
  "cosmic_gold_pen": {
    "it": {
      "name": "Penna d'Oro Cosmica",
      "desc": "Scrive le parole con pura polvere d'oro stellare."
    },
    "ru": {
      "name": "Космическое золотое перо",
      "desc": "Пишет слова чистой звёздной золотой пылью."
    }
  },
  "ancient_wisdom_shield": {
    "it": {
      "name": "Scudo dell'Antica Saggezza",
      "desc": "Protegge la mente da ogni distrazione."
    },
    "ru": {
      "name": "Щит древней мудрости",
      "desc": "Защищает разум от любых отвлечений."
    }
  },
  "volcanic_dragon_staff": {
    "it": {
      "name": "Bastone del Drago Vulcanico",
      "desc": "Bastone ornato con minerale dal nucleo di Ignis."
    },
    "ru": {
      "name": "Посох вулканического дракона",
      "desc": "Посох, украшенный рудой из сердца Игниса."
    }
  }
};

export const MUSEUM_ITEM_LOCALES_IT_RU: Record<string, Partial<Record<Language, { title: string; desc: string; lore?: string }>>> = {
  "hero_01": {
    "it": {
      "title": "Sparky la Volpe",
      "desc": "Volpe simpatica e curiosa che muove il primo passo verso l'avventura.",
      "lore": "Fedele esploratore che pianta i primi semi del vocabolario."
    },
    "ru": {
      "title": "Лис Спарки",
      "desc": "Милый и любознательный лисёнок, делающий первый шаг навстречу приключениям.",
      "lore": "Верный разведчик, сажающий первые семена словарного запаса."
    }
  },
  "hero_02": {
    "it": {
      "title": "Custode della Fortezza di Pietra",
      "desc": "Sentinella in armatura di granito a guardia della cittadella delle parole.",
      "lore": "Protegge le regole fondamentali della grammatica come solido granito."
    },
    "ru": {
      "title": "Страж Каменной Крепости",
      "desc": "Часовой в гранитных доспехах, охраняющий цитадель слов.",
      "lore": "Защищает базовые правила грамматики крепче гранита."
    }
  },
  "hero_03": {
    "it": {
      "title": "Arciere dell'Ombra",
      "desc": "Tiratore silenzioso della foresta che centra sempre il bersaglio.",
      "lore": "Ogni freccia cattura sinonimi complessi con precisione."
    },
    "ru": {
      "title": "Теневой Лучник",
      "desc": "Бесшумный лесной стрелок, бьющий точно в яблочко.",
      "lore": "Каждая его стрела безошибочно поражает сложные синонимы."
    }
  },
  "hero_04": {
    "it": {
      "title": "Cavaliere del Ghiacciaio",
      "desc": "Pacato difensore dei ghiacciai del nord.",
      "lore": "Congela lo stress degli esami e preserva la concentrazione."
    },
    "ru": {
      "title": "Ледниковый Рыцарь",
      "desc": "Хладнокровный защитник северных ледников.",
      "lore": "Замораживает экзаменационный стресс и сохраняет ясность ума."
    }
  },
  "hero_05": {
    "it": {
      "title": "Cyber Samurai",
      "desc": "Guerriero futuristico che dà la caccia alle parole con una lama al neon.",
      "lore": "Maestro supremo dei duelli a tempo di Speed Recall."
    },
    "ru": {
      "title": "Киберсамурай",
      "desc": "Воин будущего, охотящийся за словами с неоновым клинком.",
      "lore": "Непревзойдённый мастер скоростных дуэлей Speed Recall на время."
    }
  },
  "hero_06": {
    "it": {
      "title": "Astronauta Cosmico",
      "desc": "Esploratore a caccia di termini sconosciuti nei dizionari stellari.",
      "lore": "Traccia mappe galattiche della memoria a gravità zero."
    },
    "ru": {
      "title": "Космический Астронавт",
      "desc": "Исследователь, разыскивающий неизвестные термины в звёздных словарях.",
      "lore": "Составляет галактические карты памяти в невесомости."
    }
  },
  "hero_07": {
    "it": {
      "title": "Chronos, Signore del Tempo",
      "desc": "Antico maestro che piega le curve dell'oblio SM-2.",
      "lore": "Richiama le parole sbiadite un attimo prima che svaniscano."
    },
    "ru": {
      "title": "Хронос, Повелитель Времени",
      "desc": "Древний мастер, подчиняющий себе кривые забывания SM-2.",
      "lore": "Возвращает ускользающие слова за мгновение до того, как они исчезнут."
    }
  },
  "hero_08": {
    "it": {
      "title": "Gladiatore d'Oro",
      "desc": "Campione imbattuto sulle sabbie dell'arena.",
      "lore": "Entusiasma le folle con fulminee combo lessicali 1v1."
    },
    "ru": {
      "title": "Золотой Гладиатор",
      "desc": "Непобедимый чемпион песков арены.",
      "lore": "Приводит зрителей в восторг стремительными словарными комбо 1v1."
    }
  },
  "hero_09": {
    "it": {
      "title": "Ranger della Foresta",
      "desc": "Esploratore che traduce i sussurri della natura in inglese.",
      "lore": "Segue radici etimologiche nascoste nel profondo dei boschi."
    },
    "ru": {
      "title": "Лесной Рейнджер",
      "desc": "Следопыт, переводящий шёпот природы на английский язык.",
      "lore": "Идёт по следу скрытых этимологических корней в глубине леса."
    }
  },
  "hero_10": {
    "it": {
      "title": "Stregone del Deserto",
      "desc": "Alchimista mistico che decifra testi oltre le tempeste di sabbia.",
      "lore": "Trasforma parole miraggio in pergamene d'inchiostro dorato."
    },
    "ru": {
      "title": "Чародей Пустыни",
      "desc": "Мистический алхимик, расшифровывающий тексты сквозь песчаные бури.",
      "lore": "Превращает призрачные слова в свитки с золотыми чернилами."
    }
  },
  "hero_11": {
    "it": {
      "title": "Paladino della Tempesta",
      "desc": "Guerriero virtuoso che brandisce il tuono nel suo martello.",
      "lore": "Diffonde una pronuncia impeccabile alla velocità del fulmine."
    },
    "ru": {
      "title": "Паладин Бури",
      "desc": "Доблестный воин, укротивший гром в своём молоте.",
      "lore": "Разносит безупречное произношение со скоростью молнии."
    }
  },
  "hero_12": {
    "it": {
      "title": "Guerriero della Lava",
      "desc": "Portatore di un'armatura infuocata forgiata dentro un vulcano.",
      "lore": "Parla con ardente passione che scioglie ogni esitazione."
    },
    "ru": {
      "title": "Лавовый Воин",
      "desc": "Обладатель пылающих доспехов, выкованных в жерле вулкана.",
      "lore": "Говорит с огненной страстью, растапливающей любые сомнения."
    }
  },
  "hero_13": {
    "it": {
      "title": "Capitano Nautilus",
      "desc": "Marinaio veterano che recupera tesori dagli abissi marini.",
      "lore": "Individua forzieri del tesoro con una bussola infallibile."
    },
    "ru": {
      "title": "Капитан Наутилус",
      "desc": "Опытный мореплаватель, поднимающий сокровища со дна океана.",
      "lore": "Находит сундуки с сокровищами с помощью безошибочного компаса."
    }
  },
  "hero_14": {
    "it": {
      "title": "Zephyr, Guerriero dei Cieli",
      "desc": "Agile guardiano celeste che plana su ali di vento.",
      "lore": "Scivola senza sforzo tra le carte di Match Game."
    },
    "ru": {
      "title": "Небесный Воин Зефир",
      "desc": "Стремительный воздушный страж, парящий на крыльях ветра.",
      "lore": "Легко скользит по карточкам Match Game."
    }
  },
  "hero_15": {
    "it": {
      "title": "Guardiano della Notte",
      "desc": "Custode della lanterna che accompagna i ripassi a tarda notte.",
      "lore": "Fissa nella memoria le ultime 5 parole prima di dormire."
    },
    "ru": {
      "title": "Ночной Дозорный",
      "desc": "Хранитель фонаря, сопровождающий тебя на поздних повторениях.",
      "lore": "Надёжно закрепляет в памяти последние 5 слов перед сном."
    }
  },
  "hero_16": {
    "it": {
      "title": "Antico Saggio Albus",
      "desc": "Maestro dalla barba bianca custode di archivi millenari.",
      "lore": "Spiega concetti accademici C1-C2 con chiarezza cristallina."
    },
    "ru": {
      "title": "Древний Мудрец Альбус",
      "desc": "Седобородый наставник, хранящий тысячелетние архивы.",
      "lore": "Объясняет академические понятия уровней C1-C2 с кристальной ясностью."
    }
  },
  "hero_17": {
    "it": {
      "title": "Cavaliere d'Acciaio",
      "desc": "Fedele cavaliere dell'addestramento dalla disciplina impeccabile.",
      "lore": "Conferisce medaglie d'onore per gli obiettivi giornalieri costanti."
    },
    "ru": {
      "title": "Стальной Рыцарь",
      "desc": "Верный рыцарь-наставник безупречной дисциплины.",
      "lore": "Вручает почётные знаки за постоянство в ежедневных целях."
    }
  },
  "hero_18": {
    "it": {
      "title": "Ingegnere Magnetico",
      "desc": "Inventore che collega i contrari con poli magnetici.",
      "lore": "Incastra con fluidità strutture di frase complesse."
    },
    "ru": {
      "title": "Магнитный Инженер",
      "desc": "Изобретатель, связывающий антонимы магнитными полюсами.",
      "lore": "Плавно соединяет сложные синтаксические конструкции."
    }
  },
  "hero_19": {
    "it": {
      "title": "Guardiano di Cristallo",
      "desc": "Sentinella che rifrange le sfumature delle parole come la luce.",
      "lore": "Illumina i simboli fonetici con i colori dell'arcobaleno."
    },
    "ru": {
      "title": "Кристальный Страж",
      "desc": "Часовой, преломляющий оттенки слов словно лучи света.",
      "lore": "Озаряет фонетические символы радужным сиянием."
    }
  },
  "hero_20": {
    "it": {
      "title": "Sacerdote Solare",
      "desc": "Benedice le menti diligenti che si svegliano con il sole.",
      "lore": "Dona energia fresca per gli esercizi di conversazione mattutini."
    },
    "ru": {
      "title": "Солнечный Жрец",
      "desc": "Благословляет усердные умы, просыпающиеся с рассветом.",
      "lore": "Дарит свежий заряд энергии для утренних речевых тренировок."
    }
  },
  "hero_21": {
    "it": {
      "title": "Selina, Cacciatrice Lunare",
      "desc": "Cattura schemi grammaticali insidiosi con frecce d'argento.",
      "lore": "Rimette in perfetto ordine le frasi con inversione."
    },
    "ru": {
      "title": "Лунная Охотница Селина",
      "desc": "Ловит коварные грамматические конструкции серебряными стрелами.",
      "lore": "Выстраивает предложения с инверсией в идеальный порядок."
    }
  },
  "hero_22": {
    "it": {
      "title": "Maestro dei Glifi Runici",
      "desc": "Incide antichi simboli all'interno delle radici delle parole.",
      "lore": "Scolpisce ogni termine nella mente come un'opera d'arte."
    },
    "ru": {
      "title": "Мастер Рунических Глифов",
      "desc": "Высекает древние символы в самих корнях слов.",
      "lore": "Впечатывает каждый термин в память словно произведение искусства."
    }
  },
  "hero_23": {
    "it": {
      "title": "Berserker Vulcanico",
      "desc": "Avanguardia indomabile nei raid dei draghi.",
      "lore": "Trasforma ogni risposta sbagliata in feroce determinazione."
    },
    "ru": {
      "title": "Вулканический Берсерк",
      "desc": "Неукротимый авангард в рейдах на драконов.",
      "lore": "Превращает каждый неверный ответ в яростную решимость."
    }
  },
  "hero_24": {
    "it": {
      "title": "Viaggiatore dell'Infinito",
      "desc": "Esploratore che attraversa tutte le lingue del mondo tramite portali.",
      "lore": "Decifra gli accenti facendo sentire ogni parola straniera come a casa."
    },
    "ru": {
      "title": "Странник Бесконечности",
      "desc": "Путешественник, проходящий сквозь порталы через все языки мира.",
      "lore": "Расшифровывает акценты, делая иностранные слова родными."
    }
  },
  "hero_25": {
    "it": {
      "title": "Campione Gran Maestro",
      "desc": "Emblema dorato degli studenti che raggiungono 1000 parole.",
      "lore": "Corona d'onore della Sala 1 che apre ogni porta."
    },
    "ru": {
      "title": "Чемпион Гроссмейстер",
      "desc": "Золотая эмблема учеников, достигших 1000 слов.",
      "lore": "Высшая награда Зала 1, открывающая все двери."
    }
  },
  "creature_01": {
    "it": {
      "title": "Saggio Gufo della Foresta",
      "desc": "Antico gufo che scruta le pagine dei libri con occhi luminosi.",
      "lore": "Coglie l'idea principale di ogni frase a colpo d'occhio."
    },
    "ru": {
      "title": "Мудрая Лесная Сова",
      "desc": "Древняя сова, изучающая книжные страницы сияющими глазами.",
      "lore": "С первого взгляда улавливает главную мысль каждого предложения."
    }
  },
  "creature_02": {
    "it": {
      "title": "Pegaso Alato",
      "desc": "Nobile destriero mitologico che plana con ali candide come la neve.",
      "lore": "Trasporta i lettori con leggerezza attraverso brani difficili."
    },
    "ru": {
      "title": "Крылатый Пегас",
      "desc": "Благородный мифический скакун, парящий на белоснежных крыльях.",
      "lore": "Легко проносит читателей сквозь самые сложные тексты."
    }
  },
  "creature_03": {
    "it": {
      "title": "Antico Golem di Pietra",
      "desc": "Gigantesco guardiano risvegliato dall'antica energia della terra.",
      "lore": "Simbolo della memoria a lungo termine che non dimentica mai."
    },
    "ru": {
      "title": "Древний Каменный Голем",
      "desc": "Гигантский страж, пробуждённый древней силой земли.",
      "lore": "Символ долговременной памяти, которая ничего не забывает."
    }
  },
  "creature_04": {
    "it": {
      "title": "Ignis, Drago di Lava Cremisi",
      "desc": "Grande drago vulcanico che mette alla prova le parole col fuoco.",
      "lore": "Rispetta gli sfidanti coraggiosi nel Raid del Drago."
    },
    "ru": {
      "title": "Алый Лавовый Дракон Игнис",
      "desc": "Великий вулканический дракон, испытывающий слова огнём.",
      "lore": "Уважает отважных претендентов в Рейде Дракона."
    }
  },
  "creature_05": {
    "it": {
      "title": "Fenice Dorata",
      "desc": "Simbolo eterno di grazia che risorge dalle proprie ceneri.",
      "lore": "Infonde nuova vita e speranza nei momenti senza eliminazione."
    },
    "ru": {
      "title": "Золотой Феникс",
      "desc": "Вечный символ изящества, возрождающийся из пепла.",
      "lore": "Вдыхает новую жизнь и надежду в моменты на грани выбывания."
    }
  },
  "creature_06": {
    "it": {
      "title": "Drago della Nebulosa Cosmica",
      "desc": "Drago spaziale splendente di scaglie di polvere di stelle.",
      "lore": "Custodisce galassie di parole sconosciute oltre la Via Lattea."
    },
    "ru": {
      "title": "Дракон Космической Туманности",
      "desc": "Космический дракон с чешуёй, мерцающей звёздной пылью.",
      "lore": "Охраняет галактики неведомых слов за пределами Млечного Пути."
    }
  },
  "creature_07": {
    "it": {
      "title": "Dragone Alito di Gelo",
      "desc": "Drago azzurro assopito tra i ghiaccioli artici.",
      "lore": "Placa i nervi da esame con una concentrazione cristallina."
    },
    "ru": {
      "title": "Ледодышащий Змей",
      "desc": "Лазурный дракон, дремлющий среди арктических льдов.",
      "lore": "Успокаивает волнение перед экзаменом кристальной сосредоточенностью."
    }
  },
  "creature_08": {
    "it": {
      "title": "Leviatano dell'Oceano",
      "desc": "Antico gigante marino che riposa nelle correnti oceaniche profonde.",
      "lore": "Insegna a navigare senza sforzo nei testi accademici complessi."
    },
    "ru": {
      "title": "Океанский Левиафан",
      "desc": "Древний морской исполин, покоящийся в глубоких океанских течениях.",
      "lore": "Учит без труда ориентироваться в глубоких академических текстах."
    }
  },
  "creature_09": {
    "it": {
      "title": "Aquila, Rapace della Tempesta",
      "desc": "Rapace dagli occhi dorati che nidifica sopra le nubi temporalesche.",
      "lore": "Individua le parole chiave nei testi alla velocità del fulmine."
    },
    "ru": {
      "title": "Грозовой Орёл Аквила",
      "desc": "Золотоглазый хищник, вьющий гнездо над грозовыми тучами.",
      "lore": "Молниеносно находит ключевые слова в тексте."
    }
  },
  "creature_10": {
    "it": {
      "title": "Tartaruga di Cristallo",
      "desc": "Modello di pazienza con guscio di smeraldo e diamante.",
      "lore": "Sussurra la vittoria attraverso passi costanti di 20 parole al giorno."
    },
    "ru": {
      "title": "Хрустальная Черепаха",
      "desc": "Образец терпения с панцирем из изумрудов и алмазов.",
      "lore": "Предвещает победу через уверенные шаги по 20 слов каждый день."
    }
  },
  "creature_11": {
    "it": {
      "title": "Camaleonte Smeraldo",
      "desc": "Compagno cangiante che si adatta a ogni contesto comunicativo.",
      "lore": "Adatta con naturalezza tono e lessico nella conversazione."
    },
    "ru": {
      "title": "Изумрудный Хамелеон",
      "desc": "Меняющий цвета спутник, подстраивающийся под любую речевую ситуацию.",
      "lore": "Естественно подбирает нужный тон и лексику в беседе."
    }
  },
  "creature_12": {
    "it": {
      "title": "Fenrir, Lupo della Notte",
      "desc": "Cacciatore del branco dal manto argentato sotto la luna piena.",
      "lore": "Rappresenta il gioco di squadra indissolubile nei raid cooperativi."
    },
    "ru": {
      "title": "Ночной Волк Фенрир",
      "desc": "Серебристый стайный охотник под светом полной луны.",
      "lore": "Олицетворяет нерушимую командную работу в кооперативных рейдах."
    }
  },
  "creature_13": {
    "it": {
      "title": "Solarius, Leone Solare",
      "desc": "Re maestoso dalla criniera intessuta di luce solare.",
      "lore": "Infonde sicurezza nel parlare e dissolve la timidezza."
    },
    "ru": {
      "title": "Солнечный Лев Солариус",
      "desc": "Величественный царь с гривой, сотканной из солнечного света.",
      "lore": "Вселяет уверенность в речи и рассеивает стеснительность."
    }
  },
  "creature_14": {
    "it": {
      "title": "Basilisco Velenoso",
      "desc": "Rettile mitico che pietrifica le opzioni ingannevoli.",
      "lore": "Neutralizza i distrattori nei test a scelta multipla."
    },
    "ru": {
      "title": "Ядовитый Василиск",
      "desc": "Мифическая рептилия, обращающая в камень обманчивые варианты.",
      "lore": "Обезвреживает ловушки в тестах с выбором ответа."
    }
  },
  "creature_15": {
    "it": {
      "title": "Antico Mammut dei Ghiacciai",
      "desc": "Monumento vivente che sfida le tempeste dell'era glaciale.",
      "lore": "Trasporta intere biblioteche, forgiando una memoria incrollabile."
    },
    "ru": {
      "title": "Древний Ледниковый Мамонт",
      "desc": "Живой монумент, идущий сквозь бури ледникового периода.",
      "lore": "Несёт на себе целые библиотеки, выстраивая несокрушимую память."
    }
  },
  "creature_16": {
    "it": {
      "title": "Salamandra di Fuoco",
      "desc": "Piccola e allegra creatura di lava che danza tra le braci.",
      "lore": "Mantiene viva e divertente la scintilla dell'apprendimento."
    },
    "ru": {
      "title": "Огненная Саламандра",
      "desc": "Весёлое крошечное лавовое существо, танцующее среди углей.",
      "lore": "Поддерживает живую и радостную искру познания."
    }
  },
  "creature_17": {
    "it": {
      "title": "Drago del Tuono",
      "desc": "Drago blu elettrico che scatena tempeste con le sue ali.",
      "lore": "Appare nel cielo con serie da 10 combo in Speed Recall."
    },
    "ru": {
      "title": "Громовой Дракон",
      "desc": "Электрически-синий дракон, обрушивающий бури взмахом крыльев.",
      "lore": "Появляется в небе при серии из 10 комбо в Speed Recall."
    }
  },
  "creature_18": {
    "it": {
      "title": "Pantera dell'Ombra",
      "desc": "Cacciatrice magnetica che si aggira silenziosa col favore della notte.",
      "lore": "Coglie anche le più lievi sfumature sonore negli esercizi di ascolto."
    },
    "ru": {
      "title": "Теневая Пантера",
      "desc": "Завораживающая охотница, бесшумно крадущаяся под покровом ночи.",
      "lore": "Улавливает даже тончайшие звуковые оттенки в заданиях на аудирование."
    }
  },
  "creature_19": {
    "it": {
      "title": "Balena Celeste di Zaffiro",
      "desc": "Colossale leviatano celeste azzurro che nuota tra le nuvole.",
      "lore": "Diffonde migliaia di parole come una melodia."
    },
    "ru": {
      "title": "Сапфировый Небесный Кит",
      "desc": "Колоссальный лазурный небесный левиафан, плывущий среди облаков.",
      "lore": "Разносит тысячи слов словно прекрасную мелодию."
    }
  },
  "creature_20": {
    "it": {
      "title": "Toro di Magma",
      "desc": "Inarrestabile gigante sotterraneo che gronda lava fusa.",
      "lore": "Non arretra mai: abbatte ogni ostacolo sul suo cammino."
    },
    "ru": {
      "title": "Магмовый Бык",
      "desc": "Неудержимый подземный великан, с которого стекает расплавленная лава.",
      "lore": "Никогда не отступает — сокрушает любую преграду."
    }
  },
  "creature_21": {
    "it": {
      "title": "Grifone del Vento",
      "desc": "Nobile guardiano dei passi montani con testa d'aquila.",
      "lore": "Simboleggia il coraggio unito a un intelletto acuto."
    },
    "ru": {
      "title": "Грифон Ветра",
      "desc": "Благородный орлиноголовый страж горных перевалов.",
      "lore": "Символизирует отвагу в союзе с острым умом."
    }
  },
  "creature_22": {
    "it": {
      "title": "Idra Oscura",
      "desc": "Antica leggenda policefala che diventa più forte a ogni colpo.",
      "lore": "Raddoppia la capacità mentale dopo ogni sfida risolta."
    },
    "ru": {
      "title": "Тёмная Гидра",
      "desc": "Многоглавая древняя легенда, становящаяся сильнее с каждым ударом.",
      "lore": "Удваивает силу ума после каждого решённого испытания."
    }
  },
  "creature_23": {
    "it": {
      "title": "Selene, Falena Lunare",
      "desc": "Falena fatata che adorna di parole i sogni notturni.",
      "lore": "Angelo custode del consolidamento della memoria durante il sonno."
    },
    "ru": {
      "title": "Лунный Мотылёк Селена",
      "desc": "Волшебный мотылёк, украшающий ночные сны словами.",
      "lore": "Ангел-хранитель закрепления памяти во время сна."
    }
  },
  "creature_24": {
    "it": {
      "title": "Spirito Fungo Astrale",
      "desc": "Spirito psichico della foresta che brilla nel cuore dei boschi incantati.",
      "lore": "Scova collegamenti intuitivi inaspettati tra le parole."
    },
    "ru": {
      "title": "Астральный Грибной Дух",
      "desc": "Психический дух леса, светящийся в глубине зачарованной чащи.",
      "lore": "Отыскивает неожиданные интуитивные связи между словами."
    }
  },
  "creature_25": {
    "it": {
      "title": "Antico Drago Titano",
      "desc": "Creatura suprema che sonnecchia nei cieli dall'alba dei tempi.",
      "lore": "Gioiello della corona della Sala 2 che si risveglia per gli esploratori da 100 parole."
    },
    "ru": {
      "title": "Древний Дракон-Титан",
      "desc": "Верховное создание, дремлющее в небесах с начала времён.",
      "lore": "Главное сокровище Зала 2, пробуждающееся для исследователей со 100 словами."
    }
  },
  "relic_01": {
    "it": {
      "title": "Spada di Bronzo dell'Esploratore",
      "desc": "Lama fidata delle reclute che affrontano le prime battaglie di parole.",
      "lore": "Leggera e bilanciata: aiuta a forgiare le prime frasi di livello A1."
    },
    "ru": {
      "title": "Бронзовый меч исследователя",
      "desc": "Верный клинок новобранцев, вступающих в первые словесные битвы.",
      "lore": "Лёгкий и сбалансированный — помогает составлять первые фразы уровня A1."
    }
  },
  "relic_02": {
    "it": {
      "title": "Spada Dizionario Fiammeggiante",
      "desc": "Lama incantata che incenerisce le lettere sbagliate con fiamme vivide.",
      "lore": "Ottima alleata per rimettere in ordine le lettere mescolate."
    },
    "ru": {
      "title": "Пылающий меч-словарь",
      "desc": "Зачарованный клинок, сжигающий ложные буквы ярким пламенем.",
      "lore": "Отличный спутник для расстановки перепутанных букв по порядку."
    }
  },
  "relic_03": {
    "it": {
      "title": "Scudo di Cristallo",
      "desc": "Scudo traslucido che respinge l'ansia da esame e la confusione.",
      "lore": "Protegge la mente come un'armatura contro i distrattori insidiosi."
    },
    "ru": {
      "title": "Хрустальный щит",
      "desc": "Полупрозрачный щит, отражающий экзаменационную тревогу и растерянность.",
      "lore": "Словно броня, оберегает разум от коварных ложных вариантов."
    }
  },
  "relic_04": {
    "it": {
      "title": "Lama Laser al Plasma",
      "desc": "Spada ad alta energia splendente di tecnologia futuristica.",
      "lore": "Separa con precisione le parole composte complesse nelle loro radici."
    },
    "ru": {
      "title": "Лазерно-плазменный клинок",
      "desc": "Высокоэнергетический меч, сияющий технологиями будущего.",
      "lore": "Безупречно расщепляет сложные составные слова на корни."
    }
  },
  "relic_05": {
    "it": {
      "title": "Spada d'Oro Excalibur",
      "desc": "Antica spada delle parole incastonata nella roccia per i veri vincitori.",
      "lore": "Irradia fasci dorati a ogni pronuncia impeccabile."
    },
    "ru": {
      "title": "Золотой меч Экскалибур",
      "desc": "Древний меч слов, вмурованный в камень для истинных победителей.",
      "lore": "Испускает золотые лучи при каждом точном произношении."
    }
  },
  "relic_06": {
    "it": {
      "title": "Corona d'Oro del Gran Maestro",
      "desc": "Corona dei leader che padroneggiano oltre 300+ parole nella Sala 3.",
      "lore": "Brilla di oro puro sul profilo di chi la indossa."
    },
    "ru": {
      "title": "Золотая корона гроссмейстера",
      "desc": "Корона лидеров, освоивших 300+ слов в Зале 3.",
      "lore": "Сияет чистым золотом в профиле своего обладателя."
    }
  },
  "relic_07": {
    "it": {
      "title": "Armatura Runica in Titanio",
      "desc": "Corazza indistruttibile incisa con rune grammaticali.",
      "lore": "Mantiene salda la concentrazione nei brani di lettura più impegnativi."
    },
    "ru": {
      "title": "Руническая титановая броня",
      "desc": "Несокрушимый нагрудник, покрытый грамматическими рунами.",
      "lore": "Сохраняет непоколебимую концентрацию при чтении сложных текстов."
    }
  },
  "relic_08": {
    "it": {
      "title": "Lancia Glaciale",
      "desc": "Lancia di ghiaccio affilata dai gelidi venti artici.",
      "lore": "Coglie sfumature sottili anche in contesti lontani."
    },
    "ru": {
      "title": "Ледяное копьё",
      "desc": "Замёрзшее копьё, отточенное резкими арктическими ветрами.",
      "lore": "Улавливает тонкие оттенки смысла в самых разных контекстах."
    }
  },
  "relic_09": {
    "it": {
      "title": "Elmo dell'Infinito",
      "desc": "Elmo luminoso che isola la mente dai rumori esterni.",
      "lore": "Restituisce la pronuncia audio con nitidezza da studio."
    },
    "ru": {
      "title": "Шлем бесконечности",
      "desc": "Сияющий шлем, защищающий разум от внешнего шума.",
      "lore": "Передаёт аудиопроизношение со студийной чистотой."
    }
  },
  "relic_10": {
    "it": {
      "title": "Martello di Meteorite",
      "desc": "Pesante martello da guerra forgiato dal nucleo di un asteroide caduto.",
      "lore": "Ideale per frantumare gli asteroidi in Difesa Gravitazionale."
    },
    "ru": {
      "title": "Метеоритный молот",
      "desc": "Тяжёлый боевой молот, выкованный из ядра упавшего астероида.",
      "lore": "Идеален для сокрушения астероидов в Гравитационной защите."
    }
  },
  "relic_11": {
    "it": {
      "title": "Arco del Fulmine",
      "desc": "Arco da combo carico che crepita di scintille quando viene teso.",
      "lore": "Conferisce punti bonus sulle serie di combo consecutive."
    },
    "ru": {
      "title": "Лук молний",
      "desc": "Заряженный комбо-лук, потрескивающий искрами при натяжении.",
      "lore": "Даёт бонусные очки за непрерывные серии комбо."
    }
  },
  "relic_12": {
    "it": {
      "title": "Pugnale dell'Ombra",
      "desc": "Pugnale dai riflessi fulminei che si muove nel silenzio assoluto.",
      "lore": "Completa le coppie di Abbinamento Carte in pochissimi secondi."
    },
    "ru": {
      "title": "Кинжал тени",
      "desc": "Стремительный кинжал, действующий в полной тишине.",
      "lore": "Расчищает пары в Совпадении карт за считаные секунды."
    }
  },
  "relic_13": {
    "it": {
      "title": "Mantello di Scaglie di Drago",
      "desc": "Mantello ignifugo cucito con le scaglie mutate di Ignis.",
      "lore": "Protegge dai colpi critici con nobile compostezza."
    },
    "ru": {
      "title": "Плащ из драконьей чешуи",
      "desc": "Огнеупорная мантия, сшитая из сброшенной чешуи Игниса.",
      "lore": "Защищает от критических ударов с благородным достоинством."
    }
  },
  "relic_14": {
    "it": {
      "title": "Antica Ascia da Battaglia",
      "desc": "Pesante ascia da guerra in acciaio a doppio taglio.",
      "lore": "Suddivide frasi lunghe e complesse in parti logiche."
    },
    "ru": {
      "title": "Древний боевой топор",
      "desc": "Тяжёлая обоюдоострая стальная секира.",
      "lore": "Разрубает длинные сложные предложения на логические части."
    }
  },
  "relic_15": {
    "it": {
      "title": "Amuleto Custode dell'Anima",
      "desc": "Ciondolo d'argento avvolto attorno a uno zaffiro blu.",
      "lore": "Segnala le parole a rischio inviandole subito all'Arena della Rivincita."
    },
    "ru": {
      "title": "Амулет стража души",
      "desc": "Серебряный кулон, обвивающий синий сапфир.",
      "lore": "Отправляет уязвимые слова прямиком на Арену реванша."
    }
  },
  "relic_16": {
    "it": {
      "title": "Guanto Magnetico",
      "desc": "Attira le parole dal nulla direttamente sulla punta delle dita.",
      "lore": "Avvicina intuitivamente verso di te l'opzione corretta."
    },
    "ru": {
      "title": "Магнитная рукавица",
      "desc": "Притягивает слова прямо из воздуха к кончикам ваших пальцев.",
      "lore": "Интуитивно притягивает к вам правильный вариант ответа."
    }
  },
  "relic_17": {
    "it": {
      "title": "Anello Cosmico",
      "desc": "Splendente anello d'oro che racchiude una galassia vorticosa.",
      "lore": "Diffonde luce cosmica su tutto il tuo alveare lessicale."
    },
    "ru": {
      "title": "Космическое кольцо",
      "desc": "Сияющее золотое кольцо, хранящее кружащуюся галактику.",
      "lore": "Озаряет космическим светом все соты вашего словарного запаса."
    }
  },
  "relic_18": {
    "it": {
      "title": "Scudo Egida di Smeraldo",
      "desc": "Leggendario disco difensivo rivestito di smeraldi della foresta.",
      "lore": "Corregge con garbo le parole pronunciate male offrendo bonus in oro."
    },
    "ru": {
      "title": "Изумрудный щит Эгиды",
      "desc": "Легендарный защитный диск, инкрустированный лесными изумрудами.",
      "lore": "Бережно исправляет ошибки произношения с золотыми бонусами."
    }
  },
  "relic_19": {
    "it": {
      "title": "Lancia Solare",
      "desc": "Lancia illuminante dalla punta di pura luce diurna.",
      "lore": "Schiara i densi paragrafi accademici come il sole di mezzogiorno."
    },
    "ru": {
      "title": "Солнечное копьё",
      "desc": "Озаряющее копьё с наконечником из чистого дневного света.",
      "lore": "Освещает сложные академические абзацы, словно полуденное солнце."
    }
  },
  "relic_20": {
    "it": {
      "title": "Scimitarra del Chiaro di Luna",
      "desc": "Graziosa lama ricurva che brilla di luce argentea.",
      "lore": "Rende fluidi i ripassi notturni sulla curva dell'oblio."
    },
    "ru": {
      "title": "Скимитар лунного света",
      "desc": "Изящный изогнутый клинок, мерцающий серебристым светом.",
      "lore": "Делает поздние ночные повторения по кривой забывания лёгкими и плавными."
    }
  },
  "relic_21": {
    "it": {
      "title": "Armatura d'Ossa",
      "desc": "Armatura leggera forgiata da fossili preistorici.",
      "lore": "Antica eredità che custodisce etimologia e radici."
    },
    "ru": {
      "title": "Костяная броня",
      "desc": "Лёгкие доспехи, созданные из доисторических окаменелостей.",
      "lore": "Древнее наследие, хранящее этимологию и корни слов."
    }
  },
  "relic_22": {
    "it": {
      "title": "Scudo Energetico al Plasma",
      "desc": "Cupola energetica che sprigiona scintille blu al contatto.",
      "lore": "Generatore di scudo che cancella la paura di sbagliare."
    },
    "ru": {
      "title": "Плазменный энергощит",
      "desc": "Энергетический купол, искрящийся синими разрядами при касании.",
      "lore": "Генератор щита, стирающий страх перед ошибками."
    }
  },
  "relic_23": {
    "it": {
      "title": "Clessidra Piega-Tempo",
      "desc": "Leggendaria clessidra la cui sabbia scorre verso l'alto.",
      "lore": "Estende i timer di Richiamo Rapido per pensare con calma."
    },
    "ru": {
      "title": "Песочные часы повелителя времени",
      "desc": "Легендарные песочные часы, песок в которых течёт вверх.",
      "lore": "Расширяет таймеры в Скоростном запоминании для спокойных размышлений."
    }
  },
  "relic_24": {
    "it": {
      "title": "Falce d'Oro Sotterranea",
      "desc": "Falce scintillante che miete filoni d'oro nelle miniere del tesoro.",
      "lore": "Frutta +10 oro extra dai forzieri in Caccia al Tesoro."
    },
    "ru": {
      "title": "Подземная золотая коса",
      "desc": "Сверкающая коса, срезающая золотые жилы в сокровищницах под землёй.",
      "lore": "Приносит +10 дополнительного золота из сундуков в Охоте за сокровищами."
    }
  },
  "relic_25": {
    "it": {
      "title": "Scettro del Sovrano",
      "desc": "Bastone imperiale che governa tutte le regole del linguaggio.",
      "lore": "Manufatto supremo della Sala 3, simbolo di piena padronanza."
    },
    "ru": {
      "title": "Скипетр владыки",
      "desc": "Императорский жезл, повелевающий всеми законами языка.",
      "lore": "Высший артефакт Зала 3, символизирующий совершенное мастерство."
    }
  },
  "monument_01": {
    "it": {
      "title": "Antica Torre di Guardia in Pietra",
      "desc": "Torre di vedetta eretta con pietre di parole fondamentali sovrapposte.",
      "lore": "Rappresenta le solide fondamenta delle tue prime 50 parole."
    },
    "ru": {
      "title": "Древняя каменная сторожевая башня",
      "desc": "Дозорная башня, сложенная из камней базовых слов.",
      "lore": "Олицетворяет прочный фундамент ваших первых 50 слов."
    }
  },
  "monument_02": {
    "it": {
      "title": "Cittadella di Cristallo del Ghiacciaio",
      "desc": "Castello azzurro traslucido che si erge sulle vette polari.",
      "lore": "Simboleggia una grammatica cristallina costruita su fredda logica."
    },
    "ru": {
      "title": "Ледниковая хрустальная цитадель",
      "desc": "Полупрозрачный лазурный замок, возвышающийся на полярных вершинах.",
      "lore": "Символизирует ясную грамматику, построенную на холодной логике."
    }
  },
  "monument_03": {
    "it": {
      "title": "Cittadella Stellare del Cielo",
      "desc": "Castello incantato a gravità zero che fluttua sopra le nuvole.",
      "lore": "Santuario dove centinaia di parole apprese splendono come stelle."
    },
    "ru": {
      "title": "Небесная звёздная цитадель",
      "desc": "Зачарованный замок в невесомости, парящий над облаками.",
      "lore": "Святилище, где сотни выученных слов сияют подобно звёздам."
    }
  },
  "monument_04": {
    "it": {
      "title": "Fortezza Celeste dei Draghi",
      "desc": "Leggendaria cittadella d'oro e lava custodita dai draghi.",
      "lore": "Capolavoro che incide nell'oro i maestri con oltre 600+ parole."
    },
    "ru": {
      "title": "Небесная крепость драконов",
      "desc": "Легендарная цитадель из золота и лавы, охраняемая драконами.",
      "lore": "Шедевр, золотом увековечивающий мастеров с 600+ словами."
    }
  },
  "monument_05": {
    "it": {
      "title": "Penna d'Oro Eterna",
      "desc": "Penna monumentale che scrive parole in foglia d'oro senza mai esaurirsi.",
      "lore": "Sorgente creativa delle storie IA nella Sala di Lettura."
    },
    "ru": {
      "title": "Вечное золотое перо",
      "desc": "Монументальное перо, бесконечно выводящее слова сусальным золотом.",
      "lore": "Творческий источник ИИ-историй в Читальном зале."
    }
  },
  "monument_06": {
    "it": {
      "title": "Antica Bussola del Capitano",
      "desc": "Bussola che non indica il nord, ma la tua prossima parola.",
      "lore": "La guida di rotta più fedele nel cuore dell'algoritmo SM-2."
    },
    "ru": {
      "title": "Древний капитанский компас",
      "desc": "Компас, указывающий не на север, а к вашему следующему слову.",
      "lore": "Вернейший путеводитель в самом сердце алгоритма SM-2."
    }
  },
  "monument_07": {
    "it": {
      "title": "Tomo della Conoscenza Infinita",
      "desc": "Libro sacro le cui pagine infinite svelano sempre nuovi termini.",
      "lore": "Cuore pulsante di VocaShip che alimenta ogni biblioteca."
    },
    "ru": {
      "title": "Фолиант бесконечных знаний",
      "desc": "Священная книга, на бесконечных страницах которой открываются новые слова.",
      "lore": "Сердце VocaShip, питающее каждую библиотеку."
    }
  },
  "monument_08": {
    "it": {
      "title": "Faro di Alessandria",
      "desc": "Gigantesco faro che proietta luce di parole sui mari oscuri.",
      "lore": "Dirada la nebbia dei concetti sconosciuti con un solo raggio."
    },
    "ru": {
      "title": "Александрийский маяк",
      "desc": "Исполинский маяк, проливающий свет слов над тёмными морями.",
      "lore": "Одним лучом рассеивает туман незнакомых понятий."
    }
  },
  "monument_09": {
    "it": {
      "title": "Piramide del Tempio del Sole",
      "desc": "Colossale piramide i cui gradoni segnano il percorso da A1 a C2.",
      "lore": "Chi raggiunge la cima parla con naturale maestria."
    },
    "ru": {
      "title": "Пирамида Храма Солнца",
      "desc": "Колоссальная пирамида, ступени которой ведут от A1 до C2.",
      "lore": "Достигшие вершины говорят с непринуждённым искусством."
    }
  },
  "monument_10": {
    "it": {
      "title": "Torre Osservatorio Cosmico",
      "desc": "Monumento telescopico che studia modi di dire attraverso le galassie.",
      "lore": "Ci ricorda che gli orizzonti della lingua non conoscono confini."
    },
    "ru": {
      "title": "Башня космической обсерватории",
      "desc": "Телескопический монумент, изучающий идиомы сквозь галактики.",
      "lore": "Напоминает, что горизонты языка безграничны."
    }
  },
  "monument_11": {
    "it": {
      "title": "Porta della Città di Smeraldo",
      "desc": "Maestoso portale verso la civiltà anglofona.",
      "lore": "Accoglie ogni studente che la varca come cittadino del mondo."
    },
    "ru": {
      "title": "Врата Изумрудного города",
      "desc": "Величественные врата в англоязычную цивилизацию.",
      "lore": "Приветствуют каждого ученика, переступающего порог, как гражданина мира."
    }
  },
  "monument_12": {
    "it": {
      "title": "Faro della Scogliera della Tempesta",
      "desc": "Faro di granito che resiste saldo contro le onde furiose.",
      "lore": "Faro di calma incrollabile nei giorni d'esame."
    },
    "ru": {
      "title": "Маяк на Штормовом утёсе",
      "desc": "Гранитный маяк, незыблемо стоящий перед яростными волнами.",
      "lore": "Путеводный огонь невозмутимого спокойствия в дни экзаменов."
    }
  },
  "monument_13": {
    "it": {
      "title": "Fontana dell'Oasi nel Deserto",
      "desc": "Sorgente magica che offre fresca conoscenza tra le sabbie roventi.",
      "lore": "Rinnova la motivazione degli studenti stanchi in un solo sorso."
    },
    "ru": {
      "title": "Фонтан пустынного оазиса",
      "desc": "Волшебный родник, дарящий свежие знания среди раскалённых песков.",
      "lore": "Одним глотком возвращает вдохновение уставшим ученикам."
    }
  },
  "monument_14": {
    "it": {
      "title": "Monumento Fonderia di Lava",
      "desc": "Grande fucina che plasma medaglie d'oro e coppe della vittoria.",
      "lore": "Trasforma ogni vittoria nell'Arena di Gioco in un trofeo eterno."
    },
    "ru": {
      "title": "Монумент лавовой кузницы",
      "desc": "Великая литейная, отливающая золотые медали и кубки победы.",
      "lore": "Превращает каждую победу на Игровой арене в вечный трофей."
    }
  },
  "monument_15": {
    "it": {
      "title": "Cerchio Runico di Stonehenge",
      "desc": "Monoliti che concentrano la luce solare sugli alveari di parole.",
      "lore": "Sincronizza i cicli naturali con il ritmo biologico della memoria."
    },
    "ru": {
      "title": "Рунический круг Стоунхенджа",
      "desc": "Монолиты, фокусирующие солнечный свет на словесных сотах.",
      "lore": "Синхронизирует природные циклы с биологическим ритмом памяти."
    }
  },
  "monument_16": {
    "it": {
      "title": "Tempio Sommerso di Atlantide",
      "desc": "Antico santuario di saggezza che risplende negli abissi marini.",
      "lore": "Custodisce le parole più rare incise su colonne sottomarine."
    },
    "ru": {
      "title": "Затонувший храм Атлантиды",
      "desc": "Древнее святилище мудрости, сияющее в морских глубинах.",
      "lore": "Хранит редчайшие слова, высеченные на подводных колоннах."
    }
  },
  "monument_17": {
    "it": {
      "title": "Isola Fluttuante di Laputa",
      "desc": "Antica città celeste sospesa grazie a minerali magnetici.",
      "lore": "Visibile solo agli esploratori liberi da pregiudizi."
    },
    "ru": {
      "title": "Парящий остров Лапута",
      "desc": "Древний небесный город, парящий благодаря магнитным минералам.",
      "lore": "Его способны увидеть лишь исследователи, свободные от предрассудков."
    }
  },
  "monument_18": {
    "it": {
      "title": "Platano della Saggezza",
      "desc": "Platano millenario radicato sotto le grandi biblioteche.",
      "lore": "Fa germogliare una foglia d'oro ogni 10 parole apprese."
    },
    "ru": {
      "title": "Платан мудрости",
      "desc": "Тысячелетний платан, пустивший корни под великими библиотеками.",
      "lore": "Выпускает золотой лист за каждые 10 выученных слов."
    }
  },
  "monument_19": {
    "it": {
      "title": "Campana della Torre dell'Orologio",
      "desc": "Campana di bronzo che rintocca limpidi suoni inglesi ogni ora.",
      "lore": "Richiamo senza tempo alla disciplina dello studio costante."
    },
    "ru": {
      "title": "Колокол часовой башни",
      "desc": "Бронзовый колокол, каждый час отбивающий чистые английские звуки.",
      "lore": "Вневременное напоминание о постоянной учебной дисциплине."
    }
  },
  "monument_20": {
    "it": {
      "title": "Santuario della Caverna di Cristallo",
      "desc": "Santuario di ametista e smeraldo formatosi in milioni di anni.",
      "lore": "Camera d'eco che perfeziona l'acustica del Salotto di Conversazione."
    },
    "ru": {
      "title": "Святилище хрустальной пещеры",
      "desc": "Аметистово-изумрудное святилище, формировавшееся миллионы лет.",
      "lore": "Эхо-камера, доводящая акустику Зала разговорной практики до совершенства."
    }
  },
  "monument_21": {
    "it": {
      "title": "Bastione della Cittadella di Ferro",
      "desc": "Fortezza d'acciaio che respinge gli eserciti dell'oblio.",
      "lore": "Trasforma la perseveranza incrollabile in un monumento d'acciaio."
    },
    "ru": {
      "title": "Бастион Железной цитадели",
      "desc": "Стальная крепость, отражающая полчища забвения.",
      "lore": "Превращает непоколебимое упорство в монумент из стали."
    }
  },
  "monument_22": {
    "it": {
      "title": "Portale Dimensionale Magnetico",
      "desc": "Portale che teletrasporta i viaggiatori direttamente in nuove culture.",
      "lore": "Ti permette di vivere la lingua oltre i libri di testo."
    },
    "ru": {
      "title": "Магнитный пространственный портал",
      "desc": "Портал, мгновенно переносящий путешественников в новые культуры.",
      "lore": "Позволяет жить языком за пределами учебников."
    }
  },
  "monument_23": {
    "it": {
      "title": "Ponte Arcobaleno Bifrost",
      "desc": "Ponte di luce che unisce studenti di ogni livello.",
      "lore": "Ponte luminoso del lavoro di squadra in classe."
    },
    "ru": {
      "title": "Радужный мост Биврёст",
      "desc": "Мост света, объединяющий учеников всех уровней.",
      "lore": "Сияющий мост командной работы в классе."
    }
  },
  "monument_24": {
    "it": {
      "title": "Sfera dell'Antica Saggezza",
      "desc": "Sfera al plasma che custodisce le onde sonore di ogni lingua del mondo.",
      "lore": "Dona un'intuizione fonetica naturale al solo tocco."
    },
    "ru": {
      "title": "Сфера древней мудрости",
      "desc": "Плазменная сфера, хранящая звуковые волны всех языков мира.",
      "lore": "Одним прикосновением дарует лёгкую фонетическую интуицию."
    }
  },
  "monument_25": {
    "it": {
      "title": "Grande Pantheon di VocaShip",
      "desc": "Tempio eterno della vittoria per gli esploratori che raccolgono tutte le 100 reliquie.",
      "lore": "La cupola più alta del museo: architetto della tua stessa maestria."
    },
    "ru": {
      "title": "Великий Пантеон VocaShip",
      "desc": "Вечный храм победы для исследователей, собравших все 100 реликвий.",
      "lore": "Высочайший купол музея — зодчий вашего собственного мастерства."
    }
  }
};
