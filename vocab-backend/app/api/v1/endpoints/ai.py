import urllib.parse
import httpx
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.core.database import get_db
from app.services.dictionary_service import fetch_from_free_dictionary
from app.services.ai_service import async_generate_single_card, generate_single_card

router = APIRouter(tags=["Yapay Zeka & Sözlük"])

class EnrichRequest(BaseModel):
    word: str
    target_lang: Optional[str] = "en"
    native_lang: Optional[str] = "tr"
    context_hint: Optional[str] = None

# Sık kullanılan kelimeler için anında (0ms) çok dilli hızlı sözlük havuzu
# İngilizce -> Türkçe (tr), Almanca (de), İspanyolca (es), Fransızca (fr), İtalyanca (it), Rusça (ru)
MULTI_LANG_VOCAB: Dict[str, Dict[str, Any]] = {
    "good": {
        "phonetic": "/ɡʊd/",
        "translations": {
            "tr": "iyi, güzel",
            "de": "gut, schön",
            "es": "bueno, bien",
            "fr": "bon, bien",
            "it": "buono, bene",
            "ru": "хороший, добрый",
        },
        "example_en": "The soup is good and hot.",
        "example_translations": {
            "tr": "Çorba güzel ve sıcak.",
            "de": "Die Suppe ist gut und heiß.",
            "es": "La sopa está buena y caliente.",
            "fr": "La soupe est bonne et chaude.",
            "it": "La zuppa è buona e calda.",
            "ru": "Суп вкусный и горячий.",
        }
    },
    "apple": {
        "phonetic": "/ˈæp.əl/",
        "translations": {
            "tr": "elma",
            "de": "Apfel",
            "es": "manzana",
            "fr": "pomme",
            "it": "mela",
            "ru": "яблоко",
        },
        "example_en": "I eat a fresh green apple every morning.",
        "example_translations": {
            "tr": "Her sabah taze bir yeşil elma yerim.",
            "de": "Ich esse jeden Morgen einen frischen grünen Apfel.",
            "es": "Como una manzana verde fresca todas las mañanas.",
            "fr": "Je mange une pomme verte fraîche chaque matin.",
            "it": "Mangio una mela verde fresca ogni mattina.",
            "ru": "Каждое утро я ем свежее зеленое яблоко.",
        }
    },
    "book": {
        "phonetic": "/bʊk/",
        "translations": {
            "tr": "kitap",
            "de": "Buch",
            "es": "libro",
            "fr": "livre",
            "it": "libro",
            "ru": "книга",
        },
        "example_en": "She spent the afternoon reading an interesting book.",
        "example_translations": {
            "tr": "Bütün öğleden sonrayı ilginç bir kitap okuyarak geçirdi.",
            "de": "Sie verbrachte den Nachmittag damit, ein interessantes Buch zu lesen.",
            "es": "Pasó la tarde leyendo un libro interesante.",
            "fr": "Elle a passé l'après-midi à lire un livre intéressant.",
            "it": "Ha trascorso il pomeriggio leggendo un libro interessante.",
            "ru": "Она провела день за чтением интересной книги.",
        }
    },
    "water": {
        "phonetic": "/ˈwɔː.tər/",
        "translations": {
            "tr": "su",
            "de": "Wasser",
            "es": "agua",
            "fr": "eau",
            "it": "acqua",
            "ru": "вода",
        },
        "example_en": "Drinking enough water is essential for your health.",
        "example_translations": {
            "tr": "Yeterince su içmek sağlığınız için gereklidir.",
            "de": "Genug Wasser zu trinken ist wichtig für Ihre Gesundheit.",
            "es": "Beber suficiente agua es fundamental para la salud.",
            "fr": "Boire suffisamment d'eau est essentiel pour la santé.",
            "it": "Bere abbastanza acqua è essenziale per la salute.",
            "ru": "Пить достаточное количество воды необходимо для здоровья.",
        }
    },
    "house": {
        "phonetic": "/haʊs/",
        "translations": {
            "tr": "ev",
            "de": "Haus",
            "es": "casa",
            "fr": "maison",
            "it": "casa",
            "ru": "дом",
        },
        "example_en": "They bought a small house with a lovely garden.",
        "example_translations": {
            "tr": "Güzel bir bahçesi olan küçük bir ev satın aldılar.",
            "de": "Sie kauften ein kleines Haus mit einem schönen Garten.",
            "es": "Compraron una casa pequeña con un hermoso jardín.",
            "fr": "Ils ont acheté une petite maison avec un joli jardin.",
            "it": "Hanno comprato una piccola casa con un bel giardino.",
            "ru": "Они купили небольшой дом с прекрасным садом.",
        }
    },
    "dog": {
        "phonetic": "/dɒɡ/",
        "translations": {
            "tr": "köpek",
            "de": "Hund",
            "es": "perro",
            "fr": "chien",
            "it": "cane",
            "ru": "собака",
        },
        "example_en": "The dog barked happily when its owner came home.",
        "example_translations": {
            "tr": "Sahibi eve geldiğinde köpek sevinçle havladı.",
            "de": "Der Hund bellte vor Freude, als sein Besitzer nach Hause kam.",
            "es": "El perro ladró alegremente cuando su dueño llegó a casa.",
            "fr": "Le chien a aboyé joyeusement quand son maître est rentré.",
            "it": "Il cane ha abbaiato allegramente quando il padrone è tornato a casa.",
            "ru": "Собака радостно залаяла, когда хозяин вернулся домой.",
        }
    },
    "cat": {
        "phonetic": "/kæt/",
        "translations": {
            "tr": "kedi",
            "de": "Katze",
            "es": "gato",
            "fr": "chat",
            "it": "gatto",
            "ru": "кот, кошка",
        },
        "example_en": "The cat was sleeping quietly on the sofa.",
        "example_translations": {
            "tr": "Kedi kanepenin üzerinde sessizce uyuyordu.",
            "de": "Die Katze schlief friedlich auf dem Sofa.",
            "es": "El gato dormía tranquilamente en el sofá.",
            "fr": "Le chat dormait paisiblement sur le canapé.",
            "it": "Il gatto dormiva tranquillamente sul divano.",
            "ru": "Кошка спокойно спала на диване.",
        }
    },
    "orange": {
        "phonetic": "/ˈɒr.ɪndʒ/",
        "translations": {
            "tr": "portakal, turuncu",
            "de": "Orange, Apfelsine",
            "es": "naranja",
            "fr": "orange",
            "it": "arancia",
            "ru": "апельсин, оранжевый",
        },
        "example_en": "She peeled an orange and ate it slice by slice.",
        "example_translations": {
            "tr": "Bir portakal soydu ve dilim dilim yedi.",
            "de": "Sie schälte eine Orange und aß sie Stück für Stück.",
            "es": "Peló una naranja y se la comió gajo a gajo.",
            "fr": "Elle a épluché une orange et l'a mangée quartier par quartier.",
            "it": "Ha sbucciato un'arancia e l'ha mangiata spicchio per spicchio.",
            "ru": "Она очистила апельсин и съела его долька за долькой.",
        }
    },
    "animal": {
        "phonetic": "/ˈæn.ɪ.məl/",
        "translations": {
            "tr": "hayvan",
            "de": "Tier",
            "es": "animal",
            "fr": "animal",
            "it": "animale",
            "ru": "животное",
        },
        "example_en": "The lion is a wild animal that lives in Africa.",
        "example_translations": {
            "tr": "Aslan, Afrika'da yaşayan vahşi bir hayvandır.",
            "de": "Der Löwe ist ein wildes Tier, das in Afrika lebt.",
            "es": "El león es un animal salvaje que vive en África.",
            "fr": "Le lion est un animal sauvage qui vit en Afrique.",
            "it": "Il leone è un animale selvatico che vive in Africa.",
            "ru": "Лев — дикое животное, обитающее в Африке.",
        }
    },
    "interest": {
        "phonetic": "/ˈɪn.trəst/",
        "translations": {
            "tr": "faiz / ilgi, çıkar",
            "de": "Zins, Interesse",
            "es": "interés",
            "fr": "intérêt",
            "it": "interesse",
            "ru": "процент, интерес",
        },
        "definition_en": "The fee charged for borrowing money, or a feeling of wanting to know about something.",
        "example_en": "High interest rates make borrowing more expensive.",
        "example_translations": {
            "tr": "Yüksek faiz oranları borçlanmayı daha pahalı hale getirir.",
            "de": "Hohe Zinsen machen die Kreditaufnahme teurer.",
            "es": "Las altas tasas de interés encarecen los préstamos.",
            "fr": "Des taux d'intérêt élevés rendent les emprunts plus chers.",
            "it": "I tassi di interesse elevati rendono i prestiti più costosi.",
            "ru": "Высокие процентные ставки делают заимствования дороже.",
        }
    },
    "bucket": {
        "phonetic": "/ˈbʌk.ɪt/",
        "translations": {
            "tr": "kova",
            "de": "Eimer",
            "es": "cubo, balde",
            "fr": "seau",
            "it": "secchio",
            "ru": "ведро",
        },
        "example_en": "He filled the bucket with warm soapy water.",
        "example_translations": {
            "tr": "Kovayı ılık sabunlu suyla doldurdu.",
            "de": "Er füllte den Eimer mit warmem Seifenwasser.",
            "es": "Llenó el cubo con agua tibia y jabonosa.",
            "fr": "Il a rempli le seau d'eau tiède savonneuse.",
            "it": "Ha riempito il secchio con acqua calda e sapone.",
            "ru": "Он наполнил ведро теплой мыльной водой.",
        }
    },
    "bullet": {
        "phonetic": "/ˈbʊl.ɪt/",
        "translations": {
            "tr": "mermi, kurşun",
            "de": "Kugel, Geschoss",
            "es": "bala",
            "fr": "balle",
            "it": "proiettile",
            "ru": "пуля",
        },
        "example_en": "The vest is designed to stop bullets.",
        "example_translations": {
            "tr": "Yelek, mermileri durdurmak için tasarlanmıştır.",
            "de": "Die Weste wurde entwickelt, um Kugeln aufzuhalten.",
            "es": "El chaleco está diseñado para detener balas.",
            "fr": "Le gilet est conçu pour arrêter les balles.",
            "it": "Il giubbotto è progettato per fermare i proiettili.",
            "ru": "Жилет разработан для защиты от пуль.",
        }
    },
    "car": {
        "phonetic": "/kɑːr/",
        "translations": {
            "tr": "araba, otomobil",
            "de": "Auto, Wagen",
            "es": "coche, auto",
            "fr": "voiture",
            "it": "auto, macchina",
            "ru": "машина, автомобиль",
        },
        "example_en": "He parked his new car in front of the house.",
        "example_translations": {
            "tr": "Yeni arabasını evin önüne park etti.",
            "de": "Er parkte sein neues Auto vor dem Haus.",
            "es": "Aparcó su coche nuevo delante de la casa.",
            "fr": "Il a garé sa nouvelle voiture devant la maison.",
            "it": "Ha parcheggiato la sua nuova auto davanti a casa.",
            "ru": "Он припарковал свою новую машину перед домом.",
        }
    },
    "time": {
        "phonetic": "/taɪm/",
        "translations": {
            "tr": "zaman, vakit",
            "de": "Zeit",
            "es": "tiempo, hora",
            "fr": "temps, heure",
            "it": "tempo, ora",
            "ru": "время",
        },
        "example_en": "We had a wonderful time at the concert.",
        "example_translations": {
            "tr": "Konserde harika vakit geçirdik.",
            "de": "Wir hatten eine wundervolle Zeit beim Konzert.",
            "es": "Nos lo pasamos genial en el concierto.",
            "fr": "Nous avons passé un merveilleux moment au concert.",
            "it": "Ci siamo divertiti molto al concerto.",
            "ru": "Мы прекрасно провели время на концерте.",
        }
    },
    "friend": {
        "phonetic": "/frend/",
        "translations": {
            "tr": "arkadaş, dost",
            "de": "Freund, Freundin",
            "es": "amigo, amiga",
            "fr": "ami, amie",
            "it": "amico, amica",
            "ru": "друг, подруга",
        },
        "example_en": "A true friend is always there when you need help.",
        "example_translations": {
            "tr": "Gerçek bir arkadaş yardıma ihtiyacın olduğunda her zaman yanındadır.",
            "de": "Ein wahrer Freund ist immer da, wenn man Hilfe braucht.",
            "es": "Un verdadero amigo siempre está ahí cuando necesitas ayuda.",
            "fr": "Un véritable ami est toujours là quand on a besoin d'aide.",
            "it": "Un vero amico è sempre presente quando hai bisogno di aiuto.",
            "ru": "Настоящий друг всегда рядом, когда нужна помощь.",
        }
    },
    "city": {
        "phonetic": "/ˈsɪt.i/",
        "translations": {
            "tr": "şehir, kent",
            "de": "Stadt",
            "es": "ciudad",
            "fr": "ville",
            "it": "città",
            "ru": "город",
        },
        "example_en": "Istanbul is a beautiful city with rich history.",
        "example_translations": {
            "tr": "İstanbul zengin bir tarihe sahip güzel bir şehirdir.",
            "de": "Istanbul ist eine wunderschöne Stadt mit einer reichen Geschichte.",
            "es": "Estambul es una hermosa ciudad con una rica historia.",
            "fr": "Istanbul est une belle ville avec une histoire riche.",
            "it": "Istanbul è una bellissima città ricca di storia.",
            "ru": "Стамбул — красивый город с богатой историей.",
        }
    },
    "treasure": {
        "phonetic": "/ˈtreʒ.ər/",
        "translations": {
            "tr": "hazine, define",
            "de": "Schatz",
            "es": "tesoro",
            "fr": "trésor",
            "it": "tesoro",
            "ru": "сокровище, клад",
        },
        "example_en": "The pirates hid their gold treasure on the island.",
        "example_translations": {
            "tr": "Korsanlar altın hazinelerini adaya sakladılar.",
            "de": "Die Piraten versteckten ihren Goldschatz auf der Insel.",
            "es": "Los piratas escondieron su tesoro de oro en la isla.",
            "fr": "Les pirates ont caché leur trésor d'or sur l'île.",
            "it": "I pirati nascosero il loro tesoro d'oro sull'isola.",
            "ru": "Пираты спрятали свое золотое сокровище на острове.",
        }
    },
    "sunny": {
        "phonetic": "/ˈsʌn.i/",
        "translations": {
            "tr": "güneşli",
            "de": "sonnig",
            "es": "soleado",
            "fr": "ensoleillé",
            "it": "soleggiato",
            "ru": "солнечный",
        },
        "example_en": "It was a warm and sunny morning in the city.",
        "example_translations": {
            "tr": "Şehirde ılık ve güneşli bir sabahtı.",
            "de": "Es war ein warmer und sonniger Morgen in der Stadt.",
            "es": "Era una mañana cálida y soleada en la ciudad.",
            "fr": "C'était un matin chaud et ensoleillé dans la ville.",
            "it": "Era una mattina calda e soleggiata in città.",
            "ru": "В городе было теплое и солнечное утро.",
        }
    },
    "bench": {
        "phonetic": "/bentʃ/",
        "translations": {
            "tr": "bank, oturak",
            "de": "Bank, Sitzbank",
            "es": "banco",
            "fr": "banc",
            "it": "panchina, banco",
            "ru": "скамейка, лавка",
        },
        "example_en": "Leo sat on a wooden bench and opened his favorite book.",
        "example_translations": {
            "tr": "Leo ahşap bir banka oturdu ve en sevdiği kitabı açtı.",
            "de": "Leo setzte sich auf eine Holzbank und öffnete sein Lieblingsbuch.",
            "es": "Leo se sentó en un banco de madera y abrió su libro favorito.",
            "fr": "Leo s'est assis sur un banc en bois et a ouvert son livre préféré.",
            "it": "Leo si sedette su una panchina di legno e aprì il suo libro preferito.",
            "ru": "Лео сел на деревянную скамейку и открыл свою любимую книгу.",
        }
    },
    "squirrel": {
        "phonetic": "/ˈskwɪr.əl/",
        "translations": {
            "tr": "sincap",
            "de": "Eichhörnchen",
            "es": "ardilla",
            "fr": "écureuil",
            "it": "scoiattolo",
            "ru": "белка",
        },
        "example_en": "The dog began to bark happily at a tiny squirrel.",
        "example_translations": {
            "tr": "Köpek küçük bir sincaba neşeyle havlamaya başladı.",
            "de": "Der Hund begann fröhlich ein kleines Eichhörnchen anzubellen.",
            "es": "El perro comenzó a ladrar alegremente a una pequeña ardilla.",
            "fr": "Le chien s'est mis à aboyer joyeusement après un petit écureuil.",
            "it": "Il cane iniziò ad abbaiare allegramente a un piccolo scoiattolo.",
            "ru": "Собака начала радостно лаять на крошечную белку.",
        }
    },
    "pocket": {
        "phonetic": "/ˈpɒk.ɪt/",
        "translations": {
            "tr": "cep",
            "de": "Tasche, Hosentasche",
            "es": "bolsillo",
            "fr": "poche",
            "it": "tasca",
            "ru": "карман",
        },
        "example_en": "Leo smiled and took an orange from his pocket to eat.",
        "example_translations": {
            "tr": "Leo gülümsedi ve yemek için cebinden bir portakal çıkardı.",
            "de": "Leo lächelte und nahm eine Orange aus seiner Tasche zum Essen.",
            "es": "Leo sonrió y sacó una naranja de su bolsillo para comer.",
            "fr": "Leo a souri et a sorti une orange de sa poche pour la manger.",
            "it": "Leo sorrise e prese un'arancia dalla tasca per mangiarla.",
            "ru": "Лео улыбнулся и достал из кармана апельсин, чтобы съесть.",
        }
    },
    "bakery": {
        "phonetic": "/ˈbeɪ.kər.i/",
        "translations": {
            "tr": "fırın, pastane",
            "de": "Bäckerei",
            "es": "panadería",
            "fr": "boulangerie",
            "it": "panetteria",
            "ru": "пекарня, булочная",
        },
        "example_en": "Thomas starts baking fresh bread in his quiet bakery.",
        "example_translations": {
            "tr": "Thomas sessiz fırınında taze ekmek pişirmeye başlar.",
            "de": "Thomas fängt in seiner ruhigen Bäckerei an, frisches Brot zu backen.",
            "es": "Thomas empieza a hornear pan fresco en su tranquila panadería.",
            "fr": "Thomas commence à cuire du pain frais dans sa boulangerie calme.",
            "it": "Thomas inizia a cuocere il pane fresco nella sua tranquilla panetteria.",
            "ru": "Томас начинает печь свежий хлеб в своей тихой пекарне.",
        }
    },
    "flour": {
        "phonetic": "/flaʊər/",
        "translations": {
            "tr": "un",
            "de": "Mehl",
            "es": "harina",
            "fr": "farine",
            "it": "farina",
            "ru": "мука",
        },
        "example_en": "The warm smell of flour and butter fills the street.",
        "example_translations": {
            "tr": "Un ve tereyağının sıcak kokusu sokağı doldurur.",
            "de": "Der warme Duft von Mehl und Butter erfüllt die Straße.",
            "es": "El cálido aroma a harina y mantequilla llena la calle.",
            "fr": "La chaude odeur de farine et de beurre emplit la rue.",
            "it": "Il caldo profumo di farina e burro riempie la strada.",
            "ru": "Теплый запах муки и масла наполняет улицу.",
        }
    },
    "honey": {
        "phonetic": "/ˈhʌn.i/",
        "translations": {
            "tr": "bal",
            "de": "Honig",
            "es": "miel",
            "fr": "miel",
            "it": "miele",
            "ru": "мёд",
        },
        "example_en": "His secret ingredient is a tiny spoon of organic honey.",
        "example_translations": {
            "tr": "Onun gizli malzemesi küçük bir kaşık organik baldır.",
            "de": "Seine Geheimzutat ist ein kleiner Löffel Bio-Honig.",
            "es": "Su ingrediente secreto es una cucharadita de miel orgánica.",
            "fr": "Son ingrédient secret est une petite cuillère de miel biologique.",
            "it": "Il suo ingrediente segreto è un cucchiaino di miele biologico.",
            "ru": "Его секретный ингредиент — маленькая ложка органического мёда.",
        }
    },
    "crispy": {
        "phonetic": "/ˈkrɪs.pi/",
        "translations": {
            "tr": "çıtır, gevrek",
            "de": "knusprig",
            "es": "crujiente",
            "fr": "croustillant",
            "it": "croccante",
            "ru": "хрустящий",
        },
        "example_en": "Maya visits to buy a warm crispy loaf of bread.",
        "example_translations": {
            "tr": "Maya sıcak ve çıtır bir somun ekmek almak için ziyaret eder.",
            "de": "Maya kommt vorbei, um einen warmen, knusprigen Laib Brot zu kaufen.",
            "es": "Maya va a comprar una barra de pan caliente y crujiente.",
            "fr": "Maya vient acheter une miche de pain chaude et croustillante.",
            "it": "Maya va a comprare una pagnotta di pane calda e croccante.",
            "ru": "Майя заходит купить буханку теплого хрустящего хлеба.",
        }
    },
    "school": {
        "phonetic": "/skuːl/",
        "translations": {
            "tr": "okul",
            "de": "Schule",
            "es": "escuela",
            "fr": "école",
            "it": "scuola",
            "ru": "школа",
        },
        "example_en": "The children walk to school together every morning.",
        "example_translations": {
            "tr": "Çocuklar her sabah birlikte okula yürürler.",
            "de": "Die Kinder gehen jeden Morgen zusammen zur Schule.",
            "es": "Los niños caminan juntos a la escuela todas las mañanas.",
            "fr": "Les enfants vont ensemble à l'école tous les matins.",
            "it": "I bambini vanno a scuola insieme ogni mattina.",
            "ru": "Дети каждое утро вместе идут в школу.",
        }
    },
    "money": {
        "phonetic": "/ˈmʌn.i/",
        "translations": {
            "tr": "para",
            "de": "Geld",
            "es": "dinero",
            "fr": "argent",
            "it": "denaro, soldi",
            "ru": "деньги",
        },
        "example_en": "He saved money to buy a new bicycle.",
        "example_translations": {
            "tr": "Yeni bir bisiklet almak için para biriktirdi.",
            "de": "Er sparte Geld, um ein neues Fahrrad zu kaufen.",
            "es": "Ahorró dinero para comprar una bicicleta nueva.",
            "fr": "Il a économisé de l'argent pour acheter un nouveau vélo.",
            "it": "Ha risparmiato denaro per comprare una nuova bicicletta.",
            "ru": "Он копил деньги, чтобы купить новый велосипед.",
        }
    },
    "computer": {
        "phonetic": "/kəmˈpjuː.tər/",
        "translations": {
            "tr": "bilgisayar",
            "de": "Computer",
            "es": "computadora",
            "fr": "ordinateur",
            "it": "computer",
            "ru": "компьютер",
        },
        "example_en": "She works on her computer from morning until evening.",
        "example_translations": {
            "tr": "Sabahtan akşama kadar bilgisayarında çalışıyor.",
            "de": "Sie arbeitet von morgens bis abends an ihrem Computer.",
            "es": "Ella trabaja en su computadora desde la mañana hasta la noche.",
            "fr": "Elle travaille sur son ordinateur du matin au soir.",
            "it": "Lavora al computer da mattina a sera.",
            "ru": "Она работает за компьютером с утра до вечера.",
        }
    },
    "family": {
        "phonetic": "/ˈfæm.əl.i/",
        "translations": {
            "tr": "aile",
            "de": "Familie",
            "es": "familia",
            "fr": "famille",
            "it": "famiglia",
            "ru": "семья",
        },
        "example_en": "Her family gathers every Sunday for a big dinner.",
        "example_translations": {
            "tr": "Ailesi her pazar büyük bir akşam yemeği için toplanır.",
            "de": "Ihre Familie versammelt sich jeden Sonntag zu einem großen Abendessen.",
            "es": "Su familia se reúne todos los domingos para una gran cena.",
            "fr": "Sa famille se réunit chaque dimanche pour un grand dîner.",
            "it": "La sua famiglia si riunisce ogni domenica per una grande cena.",
            "ru": "Её семья собирается каждое воскресенье за большим ужином.",
        }
    },
    "world": {
        "phonetic": "/wɜːld/",
        "translations": {
            "tr": "dünya",
            "de": "Welt",
            "es": "mundo",
            "fr": "monde",
            "it": "mondo",
            "ru": "мир",
        },
        "example_en": "They traveled around the world to discover new cultures.",
        "example_translations": {
            "tr": "Yeni kültürler keşfetmek için dünyayı dolaştılar.",
            "de": "Sie reisten um die Welt, um neue Kulturen zu entdecken.",
            "es": "Viajaron por todo el mundo para descubrir nuevas culturas.",
            "fr": "Ils ont voyagé à travers le monde pour découvrir de nouvelles cultures.",
            "it": "Hanno viaggiato in tutto il mondo per scoprire nuove culture.",
            "ru": "Они путешествовали по всему миру, чтобы открыть для себя новые культуры.",
        }
    }
}

# COMMON_VOCAB takma adı
COMMON_VOCAB = MULTI_LANG_VOCAB

@router.post("/enrich")
@router.post("/lookup")
async def enrich_word(payload: EnrichRequest, db: Any = Depends(get_db)):
    word = payload.word.strip().lower()
    if not word:
        raise HTTPException(status_code=400, detail="Kelime boş olamaz.")

    target_lang = payload.target_lang or "en"
    native_lang = payload.native_lang or "tr"

    # 1. KADEME: Yerel Çok Dilli Hızlı Sözlük Havuzu (COMMON_VOCAB / MULTI_LANG_VOCAB - 0ms)
    if word in COMMON_VOCAB:
        entry = COMMON_VOCAB[word]
        translation = entry["translations"].get(native_lang) or entry["translations"].get("tr", "")
        example_en = entry.get("example_en", "")
        example_native = entry["example_translations"].get(native_lang) or entry["example_translations"].get("tr", "")
        en_definition = entry.get("definition_en", "")

        return {
            "word": word,
            "phonetic": entry.get("phonetic", f"/{word}/"),
            "translation": translation,
            "meanings": [{"translation": translation, "definition": en_definition or (translation if native_lang == "en" else ""), "part_of_speech": ""}],
            "example_sentences": [{
                "en": example_en,
                "tr": example_native,
                "target": example_en,
                "native": example_native
            }],
            "collocations": [],
            "notes": "",
            "source": "common_vocab",
            "was_corrected": False
        }

    # 2. KADEME: Veritabanındaki Flashcards Tablosu (Önceden eklenmiş veya çalışılan kartlar - 0ms)
    try:
        db_res = db.table("flashcards").select("*").eq("word", word).execute()
        if not db_res.data:
            db_res = db.table("flashcards").select("*").eq("word", word.capitalize()).execute()

        if db_res.data:
            card = db_res.data[0]
            card_phonetic = card.get("phonetic") or f"/{word}/"
            card_meanings = card.get("meanings") or []
            card_sentences = card.get("example_sentences") or []

            card_trans = ""
            if card_meanings and isinstance(card_meanings, list) and isinstance(card_meanings[0], dict):
                card_trans = card_meanings[0].get("translation") or card_meanings[0].get("definition") or ""

            card_ex_target = ""
            card_ex_native = ""
            if card_sentences and isinstance(card_sentences, list) and isinstance(card_sentences[0], dict):
                cs = card_sentences[0]
                card_ex_target = cs.get("target") or cs.get("en") or ""
                card_ex_native = cs.get("native") or cs.get("tr") or ""

            if card_trans:
                # Veritabanında eşleşen geçerli bir kart bulundu!
                return {
                    "word": word,
                    "phonetic": card_phonetic,
                    "translation": card_trans,
                    "meanings": [{"translation": card_trans, "definition": card_trans, "part_of_speech": ""}],
                    "example_sentences": [{
                        "en": card_ex_target,
                        "tr": card_ex_native,
                        "target": card_ex_target,
                        "native": card_ex_native
                    }] if card_ex_target else [],
                    "collocations": card.get("collocations") or [],
                    "notes": card.get("grammar_notes") or "",
                    "source": "database",
                    "was_corrected": False
                }
    except Exception as e:
        print(f"[DB Flashcards Lookup]: {e}")

    # 3. KADEME: Free Dictionary API ile Fonetik ve Tanım Çek (İngilizce ise)
    dict_data = fetch_from_free_dictionary(word) if target_lang == "en" else None
    phonetic = dict_data.get("phonetic", "") if dict_data else ""
    dict_definition = dict_data["meanings"][0]["definition"] if dict_data and dict_data.get("meanings") else word
    dict_example_en = dict_data["example_sentences"][0]["en"] if dict_data and dict_data.get("example_sentences") else ""

    if target_lang == "en" and native_lang == "en" and dict_data:
        return {
            "word": word,
            "phonetic": phonetic or f"/{word}/",
            "translation": dict_definition,
            "meanings": [{"translation": dict_definition, "definition": dict_definition, "part_of_speech": ""}],
            "example_sentences": [{
                "en": dict_example_en,
                "tr": "",
                "target": dict_example_en,
                "native": ""
            }] if dict_example_en else [],
            "collocations": [],
            "notes": "",
            "source": "free_dictionary",
            "was_corrected": False
        }

    # 4. KADEME: Sadece hafıza ve yerel sözlükte bulunamayanlar için Gemini AI Yedek Olarak Devrede
    translation = ""
    example_target = ""
    example_native = ""

    try:
        gemini_res = await async_generate_single_card(word=word, target_lang=target_lang, native_lang=native_lang, level="B2")
        if isinstance(gemini_res, dict):
            meanings = gemini_res.get("meanings") or []
            if meanings and isinstance(meanings[0], dict):
                translation = meanings[0].get("translation") or meanings[0].get("definition") or ""

            if not phonetic:
                phonetic = gemini_res.get("phonetic", "")

            sentences = gemini_res.get("example_sentences") or []
            if sentences and isinstance(sentences[0], dict):
                s = sentences[0]
                gemini_target = s.get("target") or s.get("en") or ""
                gemini_native = s.get("native") or s.get("source") or s.get("tr") or ""
                # Cümle ve çevirisinin BİREBİR birleşik çift olduğundan emin oluyoruz:
                if gemini_target and gemini_native:
                    example_target = gemini_target
                    example_native = gemini_native
                elif gemini_target:
                    example_target = gemini_target
                    example_native = ""

            # Dinamik hafıza havuzu: Gemini'nin ürettiği sonucu belleğe al ki bir sonraki sefer 0ms olsun!
            if translation:
                COMMON_VOCAB[word] = {
                    "phonetic": phonetic or f"/{word}/",
                    "translations": {native_lang: translation},
                    "example_en": example_target,
                    "example_translations": {native_lang: example_native}
                }
    except Exception as e:
        print(f"[Gemini Fallback Devrede]: {e}")

    # Eğer Gemini başarısız olduysa veya cümle üretmediyse:
    if not example_target and dict_example_en:
        example_target = dict_example_en
        example_native = ""

    # Eğer translation hala boşsa ve native_lang != target_lang ise, MyMemory yedek çeviri servisini çağır
    if not translation and native_lang != target_lang:
        try:
            async with httpx.AsyncClient(timeout=2.5) as client:
                trans_url = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(word)}&langpair={target_lang}|{native_lang}"
                t_resp = await client.get(trans_url)
                if t_resp.status_code == 200:
                    t_data = t_resp.json()
                    candidate = t_data.get("responseData", {}).get("translatedText", "").strip()
                    if candidate and candidate.lower() != word:
                        translation = candidate
        except Exception as e:
            print(f"[MyMemory Fallback]: {e}")

    final_translation = translation or (dict_definition if native_lang == "en" else "")
    final_definition = dict_definition if dict_definition and dict_definition != word else (final_translation if native_lang == "en" else "")

    return {
        "word": word,
        "phonetic": phonetic or f"/{word}/",
        "translation": final_translation,
        "meanings": [{
            "translation": final_translation,
            "definition": final_definition,
            "part_of_speech": ""
        }],
        "example_sentences": [{
            "en": example_target,
            "tr": example_native,
            "target": example_target,
            "native": example_native
        }] if example_target else [],
        "collocations": [],
        "notes": "",
        "source": "gemini" if translation else "free_dictionary",
        "was_corrected": False
    }