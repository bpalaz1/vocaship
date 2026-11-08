"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CustomUserAvatarData,
  CUSTOM_AVATAR_STORAGE_KEY,
} from "../components/avatar/CustomAvatarModal";
import {
  Transform3DAvatarMeta,
  VOCASHIP_CUSTOM_AVATAR_KEY,
  VOCASHIP_CUSTOM_3D_AVATAR_KEY,
  VOCASHIP_CUSTOM_3D_META_KEY,
} from "../components/avatar/Transform3DModal";

export type PersonaCategory =
  | "kids"
  | "elementary"
  | "intermediate"
  | "advanced"
  | "project_controls"
  | "legal_contracts";

export type PersonaId =
  | "sparky"
  | "leo"
  | "sarah"
  | "sandy"
  | "alex"
  | "mr_harrison"
  | "chuck"
  | "custom"
  | "my_avatar"
  // Legacy / Subcategory IDs
  | "kids_female"
  | "kids_male"
  | "elementary_female"
  | "elementary_male"
  | "intermediate_female"
  | "intermediate_male"
  | "advanced_female"
  | "advanced_male"
  | "project_controls_female"
  | "project_controls_male"
  | "legal_contracts_female"
  | "legal_contracts_male"
  | "kids"
  | "adult_elementary"
  | "adult_intermediate"
  | "adult_advanced"
  | "corp_project_controls"
  | "corp_legal_contracts";

export interface TTSSettings {
  gender: "female" | "male";
  preferredVoice?: "female" | "male" | "child";
  pitch: number;
  rate: number;
  preferredVoices: string[];
}

export interface PersonaInfo {
  id: PersonaId | string;
  category: PersonaCategory;
  name: string;
  title: string;
  type?: "fox" | "chicken" | "human";
  species?: "fox" | "chicken" | "human";
  level: string;
  gender: "female" | "male";
  theme: "amber" | "yellow" | "blue" | "emerald" | "purple" | "teal" | "indigo";
  character: string;
  greeting: string;
  accentColor: string;
  dicebearSeed: string;
  avatarIcon: string;
  image: string;
  glbUrl?: string;
  desc?: string;
  defaultPrompt?: string;
  ttsSettings: TTSSettings;
}

export const PERSONAS: Record<string, PersonaInfo> = {
  // =========================================================================
  // ÇOCUK KATEGORİSİ MASKOTLARI (Sparky & Chuck) + ÇEKİRDEK KARAKTER KADROSU
  // =========================================================================

  // 1a. Sparky - Neşeli Tilki
  sparky: {
    id: "sparky",
    category: "kids",
    name: "Sparky",
    title: "Neşeli Tilki",
    type: "fox",
    species: "fox",
    level: "A1-A2",
    gender: "male",
    image: "/avatars/sparky.png",
    desc: "Cheerful 3D fox mascot with smart glasses for kids",
    defaultPrompt: "Talk about daily fun topics, school, animals, and games with simple, cheerful words.",
    theme: "amber",
    character: "🦊 Neşeli Tilki",
    greeting: "Hello friend! I am Sparky the cheerful fox! Are you ready to play fun games and learn cool English words today?",
    accentColor: "from-amber-500 to-orange-400",
    dicebearSeed: "SparkyFox",
    avatarIcon: "🦊",
    ttsSettings: {
      gender: "male",
      pitch: 1.24,
      rate: 0.78,
      preferredVoices: ["Microsoft Guy Online (Natural)", "Microsoft David Desktop", "Google UK English Male", "Guy", "Alex", "David", "male"],
    },
  },

  // 1b. Chuck - Komik Tavuk
  chuck: {
    id: "chuck",
    category: "kids",
    name: "Chuck",
    title: "Komik Tavuk",
    type: "chicken",
    species: "chicken",
    level: "A1-A2 Fun",
    gender: "male",
    image: "/avatars/chuck.png",
    desc: "Funny wide-eyed chicken mascot who loves silly jokes and friendly chats",
    defaultPrompt: "You are Chuck, a hilarious and sympathetic English tutor who happens to be a cheerful cartoon chicken! Keep responses funny, joyful, encouraging, and easy to understand for young learners. Bawk with enthusiasm!",
    theme: "yellow",
    character: "🐔 Komik Tavuk",
    greeting: "Bawk bawk! Hello buddy! I am Chuck the funny chicken! Ready to flap our wings and speak awesome English together?",
    accentColor: "from-yellow-400 to-amber-500",
    dicebearSeed: "ChuckChicken",
    avatarIcon: "🐔",
    ttsSettings: {
      gender: "male",
      pitch: 1.14,
      rate: 0.78,
      preferredVoices: ["Microsoft Guy Online (Natural)", "Microsoft David Desktop", "Google UK English Male", "Guy", "Alex", "David", "male"],
    },
  },

  // 2. Leo - Günlük Pratik Koçu
  leo: {
    id: "leo",
    category: "elementary",
    name: "Leo",
    title: "Günlük Pratik Koçu",
    level: "A2-B1",
    gender: "male",
    image: "/avatars/leo.png",
    desc: "Tutor in late 20s",
    defaultPrompt: "Help with daily conversation, travel, cafes, and friendly routines.",
    theme: "blue",
    character: "🧑‍🏫 Genç Eğitmen",
    greeting: "Hi there! I am Leo, your daily conversation coach. Let's practice simple everyday English phrases together.",
    accentColor: "from-blue-500 to-cyan-400",
    dicebearSeed: "LeoCoach",
    avatarIcon: "🧑‍🏫",
    ttsSettings: {
      gender: "male",
      pitch: 0.98,
      rate: 0.86,
      preferredVoices: ["Microsoft Guy Online (Natural)", "Microsoft David Desktop", "Google UK English Male", "Guy", "Alex", "David", "Christopher", "male"],
    },
  },

  // 3. Sarah - Senior Project Controls Director
  sarah: {
    id: "sarah",
    category: "project_controls",
    name: "Sarah",
    title: "Senior Project Controls Director",
    level: "C1 EVM",
    gender: "female",
    image: "/avatars/sarah.png",
    desc: "An executive female corporate director",
    defaultPrompt: "Conduct executive interview on EVM, schedule variance, CPI/SPI, and mitigation plans.",
    theme: "teal",
    character: "👩‍💼 Proje Direktörü",
    greeting: "Good morning. In our latest Earned Value review, our project's Schedule Performance Index dropped to 0.86. What is our schedule variance exposure, and what mitigation plan do you propose?",
    accentColor: "from-teal-500 to-emerald-400",
    dicebearSeed: "SarahDirector",
    avatarIcon: "👩‍💼",
    ttsSettings: {
      gender: "female",
      pitch: 1.0,
      rate: 0.86,
      preferredVoices: ["Microsoft Jenny Online (Natural)", "Microsoft Aria Online (Natural)", "Google US English", "Samantha", "Jenny", "Aria"],
    },
  },

  // 3b. Sandy - Yetişkin Mentor (Doğal & Akıcı Konuşma Partneri)
  sandy: {
    id: "sandy",
    category: "intermediate",
    name: "Sandy",
    title: "Yetişkin Mentor",
    type: "human",
    species: "human",
    level: "B1-C1",
    gender: "female",
    image: "/avatars/sarah.png",
    desc: "Warm and articulate adult mentor for clear, natural English conversation",
    defaultPrompt: "Engage in warm, clear, and natural adult conversation across daily life, career, and culture.",
    theme: "teal",
    character: "👩‍🏫 Yetişkin Mentor",
    greeting: "Hi there! I am Sandy, your personal English mentor. Let's have a relaxed, clear, and engaging conversation today. How is your day going so far?",
    accentColor: "from-teal-400 to-cyan-500",
    dicebearSeed: "SandyMentor",
    avatarIcon: "👩‍🏫",
    ttsSettings: {
      gender: "female",
      pitch: 1.02,
      rate: 0.86,
      preferredVoices: ["Microsoft Jenny Online (Natural)", "Microsoft Aria Online (Natural)", "Google US English", "Samantha", "Jenny", "Aria"],
    },
  },

  // 4. Alex - Kültür & Macera Koçu
  alex: {
    id: "alex",
    category: "intermediate",
    name: "Alex",
    title: "Kültür & Macera Koçu",
    level: "B1-B2",
    gender: "male",
    image: "/avatars/alex.png",
    desc: "Athletic male adventure and travel coach (30s)",
    defaultPrompt: "Debate interesting stories, cultural mysteries, and outdoor problem-solving.",
    theme: "emerald",
    character: "🧔 Doğa & Kültür Koçu",
    greeting: "Welcome aboard! I'm Alex. Let's debate interesting stories, cultural mysteries, and outdoor problem-solving together.",
    accentColor: "from-emerald-500 to-teal-400",
    dicebearSeed: "AlexExplorer",
    avatarIcon: "🧔",
    ttsSettings: {
      gender: "male",
      pitch: 0.98,
      rate: 0.86,
      preferredVoices: ["Microsoft Guy Online (Natural)", "Microsoft David Desktop", "Google UK English Male", "Guy", "Alex", "David", "male"],
    },
  },

  // 5. Mr. Harrison - Senior Legal & Claims Arbitrator
  mr_harrison: {
    id: "mr_harrison",
    category: "legal_contracts",
    name: "Mr. Harrison",
    title: "Senior Legal & Claims Arbitrator",
    level: "C1/C2 FIDIC",
    gender: "male",
    image: "/avatars/mr_harrison.png",
    desc: "Senior legal and contract arbitrator in late 50s",
    defaultPrompt: "Negotiate FIDIC contract claims, delay damages, Extension of Time (EOT), and arbitration.",
    theme: "indigo",
    character: "👨‍⚖️ Kıdemli Hakem & Hukukçu",
    greeting: "Welcome, Counsel. I am Mr. Harrison. The contractor has formally submitted a dispute claim citing unforeseeable conditions under FIDIC Clause 20.1. How do you assess their delay claim narrative and liquidated damages exposure?",
    accentColor: "from-indigo-600 to-violet-500",
    dicebearSeed: "HarrisonArbitrator",
    avatarIcon: "👨‍⚖️",
    ttsSettings: {
      gender: "male",
      pitch: 0.88,
      rate: 0.82,
      preferredVoices: ["Microsoft Christopher Online (Natural)", "Microsoft Ryan Online (Natural)", "Daniel", "Christopher", "Ryan"],
    },
  },

  // =========================================================================
  // EK ROLLER (Geriye Dönük Uyumluluk)
  // =========================================================================
  kids_female: {
    id: "kids_female",
    category: "kids",
    name: "Ruby",
    title: "Neşeli Tilki",
    level: "A1-A2",
    gender: "female",
    image: "/avatars/sparky.png",
    theme: "amber",
    character: "🦊 Kızıl Tilki",
    greeting: "Hi there! I am Ruby! Let's explore playful English words, animals, and fun rhymes together!",
    accentColor: "from-amber-400 to-rose-400",
    dicebearSeed: "RubyFox",
    avatarIcon: "🦊",
    ttsSettings: {
      gender: "female",
      pitch: 1.15,
      rate: 0.95,
      preferredVoices: ["female", "zira", "jenny", "aria", "samantha", "victoria"],
    },
  },

  elementary_female: {
    id: "elementary_female",
    category: "elementary",
    name: "Mia",
    title: "Günlük Pratik Koçu",
    level: "A2",
    gender: "female",
    image: "/avatars/leo.png",
    theme: "blue",
    character: "👩‍🏫 Genç Eğitmen",
    greeting: "Hello! I am Mia. We will practice simple, daily conversation topics at a comfortable pace.",
    accentColor: "from-sky-400 to-blue-500",
    dicebearSeed: "MiaCoach",
    avatarIcon: "👩‍🏫",
    ttsSettings: {
      gender: "female",
      pitch: 1.05,
      rate: 0.95,
      preferredVoices: ["female", "zira", "jenny", "aria", "samantha", "victoria"],
    },
  },

  intermediate_female: {
    id: "intermediate_female",
    category: "intermediate",
    name: "Elena",
    title: "Kültür & Seyahat Rehberi",
    level: "B1-B2",
    gender: "female",
    image: "/avatars/alex.png",
    theme: "emerald",
    character: "👩‍🌾 Seyyah & Kültür Koçu",
    greeting: "Welcome! I'm Elena. Today we will explore travel stories, cultural perspectives, and idiomatic expressions.",
    accentColor: "from-emerald-400 to-teal-500",
    dicebearSeed: "ElenaExplorer",
    avatarIcon: "👩‍🌾",
    ttsSettings: {
      gender: "female",
      pitch: 1.05,
      rate: 0.95,
      preferredVoices: ["female", "zira", "jenny", "aria", "samantha", "victoria"],
    },
  },

  advanced_female: {
    id: "advanced_female",
    category: "advanced",
    name: "Dr. Evelyn",
    title: "Akademik & IELTS Danışmanı",
    level: "C1",
    gender: "female",
    image: "/avatars/sarah.png",
    theme: "purple",
    character: "👩‍💼 Akademik Danışman",
    greeting: "Good day. I am Dr. Evelyn. Today we will refine your academic argumentation and sophisticated lexical structures.",
    accentColor: "from-purple-500 to-indigo-500",
    dicebearSeed: "DrEvelynAcademic",
    avatarIcon: "👩‍💼",
    ttsSettings: {
      gender: "female",
      pitch: 1.05,
      rate: 0.95,
      preferredVoices: ["female", "zira", "jenny", "aria", "samantha", "victoria"],
    },
  },

  advanced_male: {
    id: "advanced_male",
    category: "advanced",
    name: "Prof. Julian",
    title: "Kıdemli IELTS Değerlendiricisi",
    level: "C1",
    gender: "male",
    image: "/avatars/mr_harrison.png",
    theme: "purple",
    character: "👨‍🏫 Kıdemli Mentor",
    greeting: "Greetings. I am Professor Julian. We will analyze analytical structure, discourse coherence, and academic precision in formal spoken English.",
    accentColor: "from-purple-600 to-indigo-600",
    dicebearSeed: "ProfJulianAcademic",
    avatarIcon: "👨‍🏫",
    ttsSettings: {
      gender: "male",
      pitch: 0.90,
      rate: 0.95,
      preferredVoices: ["male", "david", "guy", "christopher", "daniel", "alex"],
    },
  },

  project_controls_male: {
    id: "project_controls_male",
    category: "project_controls",
    name: "Marcus",
    title: "VP of Project Delivery",
    level: "C1 EVM/P6",
    gender: "male",
    image: "/avatars/sarah.png",
    theme: "teal",
    character: "👨‍💼 Proje Başkan Yardımcısı",
    greeting: "Good morning. I'm Marcus. We need to evaluate the critical path delays across our EPC packages and review the earned value recovery schedule.",
    accentColor: "from-teal-600 to-cyan-500",
    dicebearSeed: "MarcusVP",
    avatarIcon: "👨‍💼",
    ttsSettings: {
      gender: "male",
      pitch: 0.90,
      rate: 0.95,
      preferredVoices: ["male", "david", "guy", "christopher", "daniel", "alex"],
    },
  },

  legal_contracts_female: {
    id: "legal_contracts_female",
    category: "legal_contracts",
    name: "Ms. Claire",
    title: "Senior Dispute Arbitrator",
    level: "C1/C2 FIDIC",
    gender: "female",
    image: "/avatars/mr_harrison.png",
    theme: "indigo",
    character: "👩‍⚖️ Baş Hukuk Danışmanı",
    greeting: "Welcome. I am Claire. Let us examine the contractor's claim submission and verify whether the condition precedents under FIDIC Clause 20.1 have been strictly fulfilled.",
    accentColor: "from-indigo-500 to-violet-500",
    dicebearSeed: "ClaireArbitrator",
    avatarIcon: "👩‍⚖️",
    ttsSettings: {
      gender: "female",
      pitch: 1.05,
      rate: 0.95,
      preferredVoices: ["female", "zira", "jenny", "aria", "samantha", "victoria"],
    },
  },
};

export function buildCustomPersona(data?: CustomUserAvatarData | null): PersonaInfo {
  const voiceGender = data?.gender || "female";
  const isFemale = voiceGender === "female";
  const isChild = voiceGender === "child";

  const avatarIcon = isChild ? "🧒" : isFemale ? "👩" : "👨";
  const customName = data?.name?.trim() || "Benim Mentorüm";
  const customImage = data?.imageDataUrl || "/avatars/sarah.png";

  // Cinsiyete göre ses ataması:
  // Kadın -> preferredVoice: female, pitch: 1.05
  // Erkek -> preferredVoice: male, pitch: 0.92
  // Çocuk -> preferredVoice: child/female, pitch: 1.20
  const ttsSettings: TTSSettings = isFemale
    ? {
        gender: "female",
        preferredVoice: "female",
        pitch: 1.05,
        rate: 0.9,
        preferredVoices: [
          "Microsoft Jenny Online (Natural)",
          "Microsoft Aria Online (Natural)",
          "Google US English",
          "Samantha",
          "Jenny",
          "Aria",
          "female",
        ],
      }
    : isChild
    ? {
        gender: "female",
        preferredVoice: "child",
        pitch: 1.2,
        rate: 0.95,
        preferredVoices: [
          "Microsoft Jenny Online (Natural)",
          "Google US English",
          "Samantha",
          "Jenny",
          "Guy",
        ],
      }
    : {
        gender: "male",
        preferredVoice: "male",
        pitch: 0.92,
        rate: 0.88,
        preferredVoices: [
          "Microsoft Guy Online (Natural)",
          "Microsoft Christopher Online (Natural)",
          "Google US English",
          "Guy",
          "Daniel",
          "Alex",
          "David",
          "male",
        ],
      };

  return {
    id: "custom",
    category: isChild ? "kids" : "intermediate",
    name: customName,
    title: "Kişisel AI Mentor",
    type: "human",
    species: "human",
    level: isChild ? "A1-B1" : "B2-C1",
    gender: isFemale || isChild ? "female" : "male",
    theme: "emerald",
    character: `${avatarIcon} ${customName}`,
    greeting: `Hello! I am ${customName}, your personal speaking partner! What would you like to talk about today?`,
    accentColor: "from-emerald-500 to-teal-400",
    dicebearSeed: customName,
    avatarIcon,
    image: customImage,
    desc: "Custom user-uploaded mentor avatar",
    defaultPrompt: "Talk naturally and warmly as the user's personal mentor on any topic.",
    ttsSettings,
  };
}

PERSONAS.custom = buildCustomPersona(null);

export function buildUser3DPersona(
  avatarUrl?: string | null,
  meta?: Transform3DAvatarMeta | null
): PersonaInfo {
  const voiceGender = meta?.gender || "male";
  const isFemale = voiceGender === "female";
  const isChild = voiceGender === "child";
  const customName = meta?.name?.trim() || "3D Avatarım";
  const resolvedImg =
    avatarUrl ||
    meta?.url ||
    (isFemale ? "/avatars/sarah.png" : "/avatars/alex.png");

  const ttsSettings: TTSSettings = isFemale
    ? {
        gender: "female",
        preferredVoice: "female",
        pitch: 1.05,
        rate: 0.9,
        preferredVoices: [
          "Microsoft Jenny Online (Natural)",
          "Microsoft Aria Online (Natural)",
          "Google US English",
          "Samantha",
          "Jenny",
          "Aria",
          "female",
        ],
      }
    : isChild
    ? {
        gender: "female",
        preferredVoice: "child",
        pitch: 1.2,
        rate: 0.95,
        preferredVoices: [
          "Microsoft Jenny Online (Natural)",
          "Google US English",
          "Samantha",
          "Jenny",
          "Guy",
        ],
      }
    : {
        gender: "male",
        preferredVoice: "male",
        pitch: 0.92,
        rate: 0.88,
        preferredVoices: [
          "Microsoft Guy Online (Natural)",
          "Microsoft Christopher Online (Natural)",
          "Google US English",
          "Guy",
          "Daniel",
          "Alex",
          "David",
          "male",
        ],
      };

  return {
    id: "my_avatar",
    category: isChild ? "kids" : "intermediate",
    name: customName,
    title: "3D Poligon Avatar",
    type: "human",
    species: "human",
    level: isChild ? "A1-B1" : "B2-C1",
    gender: isFemale || isChild ? "female" : "male",
    theme: "emerald",
    character: `🧊 ${customName}`,
    greeting: `Hello! My 3D Low-Poly avatar is live and ready in the studio! What would you like to talk about today?`,
    accentColor: "from-cyan-500 to-emerald-400",
    dicebearSeed: customName,
    avatarIcon: "🧊",
    image: resolvedImg,
    desc: "Vocaship 3D Low-Poly Faceted user avatar",
    defaultPrompt: "Talk naturally and warmly as the user's personal 3D mentor.",
    ttsSettings,
  };
}

PERSONAS.my_avatar = buildUser3DPersona(null, null);

// Aliases
PERSONAS.kids_male = PERSONAS.sparky;
PERSONAS.elementary_male = PERSONAS.leo;
PERSONAS.project_controls_female = PERSONAS.sarah;
PERSONAS.intermediate_male = PERSONAS.alex;
PERSONAS.legal_contracts_male = PERSONAS.mr_harrison;

PERSONAS.kids = PERSONAS.sparky;
PERSONAS.adult_elementary = PERSONAS.leo;
PERSONAS.adult_intermediate = PERSONAS.alex;
PERSONAS.adult_advanced = PERSONAS.advanced_female;
PERSONAS.corp_project_controls = PERSONAS.sarah;
PERSONAS.corp_legal_contracts = PERSONAS.mr_harrison;

// Çocuk Kategorisi Maskotları (Sparky & Chuck)
export const KIDS_PERSONAS: PersonaInfo[] = [
  PERSONAS.sparky,
  PERSONAS.chuck,
];

// Çekirdek Karakter Koleksiyonu
export const CORE_PERSONAS: PersonaInfo[] = [
  PERSONAS.sparky,
  PERSONAS.chuck,
  PERSONAS.leo,
  PERSONAS.sarah,
  PERSONAS.alex,
  PERSONAS.mr_harrison,
];

export const CATEGORY_PERSONA_PAIRS: Record<
  PersonaCategory,
  { female: PersonaInfo; male: PersonaInfo }
> = {
  kids: {
    female: PERSONAS.kids_female,
    male: PERSONAS.sparky,
  },
  elementary: {
    female: PERSONAS.elementary_female,
    male: PERSONAS.leo,
  },
  intermediate: {
    female: PERSONAS.intermediate_female,
    male: PERSONAS.alex,
  },
  advanced: {
    female: PERSONAS.advanced_female,
    male: PERSONAS.advanced_male,
  },
  project_controls: {
    female: PERSONAS.sarah,
    male: PERSONAS.project_controls_male,
  },
  legal_contracts: {
    female: PERSONAS.legal_contracts_female,
    male: PERSONAS.mr_harrison,
  },
};

export type KidsCharacterId = "sparky" | "chuck";

interface PersonaContextType {
  activePersona: PersonaId;
  persona: PersonaInfo;
  setPersona: (id: PersonaId | string) => void;
  selectedKidsCharacter: KidsCharacterId;
  setSelectedKidsCharacter: (id: KidsCharacterId) => void;
  customAvatar: CustomUserAvatarData | null;
  saveCustomAvatar: (data: CustomUserAvatarData) => PersonaInfo;
  user3DAvatarUrl: string | null;
  user3DAvatarMeta: Transform3DAvatarMeta | null;
  saveUser3DAvatar: (url: string, meta?: Transform3DAvatarMeta) => PersonaInfo;
  kidsPersonas: PersonaInfo[];
  getPersonaByCategoryAndGender: (
    category: PersonaCategory,
    gender: "female" | "male"
  ) => PersonaInfo;
  corePersonas: PersonaInfo[];
  allPersonas: PersonaInfo[];
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [activePersona, setActivePersonaState] = useState<PersonaId>("sarah");
  const [selectedKidsCharacter, setSelectedKidsCharacterState] = useState<KidsCharacterId>("sparky");
  const [customAvatar, setCustomAvatar] = useState<CustomUserAvatarData | null>(null);
  const [user3DAvatarUrl, setUser3DAvatarUrl] = useState<string | null>(null);
  const [user3DAvatarMeta, setUser3DAvatarMeta] = useState<Transform3DAvatarMeta | null>(null);

  // LocalStorage senkronizasyonu
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rawCustom = localStorage.getItem(CUSTOM_AVATAR_STORAGE_KEY);
        if (rawCustom) {
          const parsedCustom = JSON.parse(rawCustom) as CustomUserAvatarData;
          if (parsedCustom && parsedCustom.imageDataUrl) {
            setCustomAvatar(parsedCustom);
            PERSONAS.custom = buildCustomPersona(parsedCustom);
          }
        }
      } catch (e) {
        console.warn("Failed to parse custom avatar from localStorage:", e);
      }

      try {
        const saved3D =
          localStorage.getItem(VOCASHIP_CUSTOM_AVATAR_KEY) ||
          localStorage.getItem(VOCASHIP_CUSTOM_3D_AVATAR_KEY);
        const rawMeta = localStorage.getItem(VOCASHIP_CUSTOM_3D_META_KEY);
        const parsedMeta = rawMeta ? (JSON.parse(rawMeta) as Transform3DAvatarMeta) : null;
        if (saved3D) {
          setUser3DAvatarUrl(saved3D);
          setUser3DAvatarMeta(parsedMeta);
          PERSONAS.my_avatar = buildUser3DPersona(saved3D, parsedMeta);
        }
      } catch (e) {
        console.warn("Failed to parse 3D avatar from localStorage:", e);
      }

      const savedKids = localStorage.getItem("vocaship_kids_character") as KidsCharacterId | null;
      if (savedKids === "sparky" || savedKids === "chuck") {
        setSelectedKidsCharacterState(savedKids);
      }

      const saved = localStorage.getItem("vocaship_active_persona") as PersonaId | null;
      if (saved && PERSONAS[saved]) {
        setActivePersonaState(saved);
        if (saved === "sparky" || saved === "chuck") {
          setSelectedKidsCharacterState(saved);
        }
      }
    }
  }, []);

  const saveCustomAvatar = (data: CustomUserAvatarData): PersonaInfo => {
    setCustomAvatar(data);
    const updatedPersona = buildCustomPersona(data);
    PERSONAS.custom = updatedPersona;
    setActivePersonaState("custom");
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CUSTOM_AVATAR_STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem("vocaship_active_persona", "custom");
      } catch {}
    }
    return updatedPersona;
  };

  const saveUser3DAvatar = (url: string, meta?: Transform3DAvatarMeta): PersonaInfo => {
    const resolvedMeta: Transform3DAvatarMeta = meta || {
      url,
      name: "3D Avatarım",
      gender: "male",
      createdAt: new Date().toISOString(),
    };
    setUser3DAvatarUrl(url);
    setUser3DAvatarMeta(resolvedMeta);
    const updatedPersona = buildUser3DPersona(url, resolvedMeta);
    PERSONAS.my_avatar = updatedPersona;
    setActivePersonaState("my_avatar");
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(VOCASHIP_CUSTOM_AVATAR_KEY, url);
        localStorage.setItem(VOCASHIP_CUSTOM_3D_AVATAR_KEY, url);
        localStorage.setItem(VOCASHIP_CUSTOM_3D_META_KEY, JSON.stringify(resolvedMeta));
        localStorage.setItem("vocaship_active_persona", "my_avatar");
      } catch {}
    }
    return updatedPersona;
  };

  const setPersona = (id: PersonaId | string) => {
    const resolvedId = id === "kids" ? selectedKidsCharacter : id;
    if (PERSONAS[resolvedId]) {
      setActivePersonaState(resolvedId as PersonaId);
      if (resolvedId === "sparky" || resolvedId === "chuck") {
        setSelectedKidsCharacterState(resolvedId);
        if (typeof window !== "undefined") {
          localStorage.setItem("vocaship_kids_character", resolvedId);
        }
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("vocaship_active_persona", resolvedId);
      }
    }
  };

  const setSelectedKidsCharacter = (id: KidsCharacterId) => {
    setSelectedKidsCharacterState(id);
    setActivePersonaState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("vocaship_kids_character", id);
      localStorage.setItem("vocaship_active_persona", id);
    }
  };

  const getPersonaByCategoryAndGender = (
    category: PersonaCategory,
    gender: "female" | "male"
  ): PersonaInfo => {
    if (category === "kids") {
      return PERSONAS[selectedKidsCharacter] || PERSONAS.sparky;
    }
    const pair = CATEGORY_PERSONA_PAIRS[category];
    return pair ? pair[gender] : PERSONAS.sarah;
  };

  const persona =
    activePersona === "custom"
      ? buildCustomPersona(customAvatar)
      : activePersona === "my_avatar"
      ? buildUser3DPersona(user3DAvatarUrl, user3DAvatarMeta)
      : PERSONAS[activePersona] || PERSONAS.sarah;

  return (
    <PersonaContext.Provider
      value={{
        activePersona,
        persona,
        setPersona,
        selectedKidsCharacter,
        setSelectedKidsCharacter,
        customAvatar,
        saveCustomAvatar,
        user3DAvatarUrl,
        user3DAvatarMeta,
        saveUser3DAvatar,
        kidsPersonas: KIDS_PERSONAS,
        getPersonaByCategoryAndGender,
        corePersonas: CORE_PERSONAS,
        allPersonas: Object.values(PERSONAS),
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) {
    return {
      activePersona: "sarah" as PersonaId,
      persona: PERSONAS.sarah,
      setPersona: () => {},
      selectedKidsCharacter: "sparky" as KidsCharacterId,
      setSelectedKidsCharacter: () => {},
      customAvatar: null,
      saveCustomAvatar: (d: CustomUserAvatarData) => buildCustomPersona(d),
      user3DAvatarUrl: null,
      user3DAvatarMeta: null,
      saveUser3DAvatar: (url: string, meta?: Transform3DAvatarMeta) =>
        buildUser3DPersona(url, meta),
      kidsPersonas: KIDS_PERSONAS,
      getPersonaByCategoryAndGender: () => PERSONAS.sarah,
      corePersonas: CORE_PERSONAS,
      allPersonas: CORE_PERSONAS,
    };
  }
  return context;
}
