/**
 * Vocaship 4-Mode Dynamic Conversation Engine Types
 * 'casual' | 'problem_solving' | 'interview' | 'story_debate'
 */

export type ConversationMode = "casual" | "problem_solving" | "interview" | "story_debate";

export interface ConversationModeConfig {
  id: ConversationMode;
  icon: string;
  label: string;
  shortLabel: string;
  tagline: string;
  description: string;
  badgeColor: string;
  activeBorderColor: string;
  showScorecard: boolean;
  scorecardTitle: string;
}

export interface ScenarioItem {
  id: string;
  mode: ConversationMode;
  icon: string;
  title: string;
  role_name: string;
  tagline: string;
  context_desc: string;
  target_vocabulary: string[];
  initial_greeting: string;
  persona_id: string;
}

export interface DialogueTurn {
  role: "assistant" | "user";
  message: string;
  timestamp?: string;
  feedback?: {
    grammar_feedback?: string | null;
    better_alternative?: string;
    vocabulary_highlight?: string[];
    jargon_score?: number;
    fluency_score?: number;
  };
}

export interface SpeakingRespondRequestPayload {
  scenario_id: string;
  conversation_mode: ConversationMode;
  history: { role: string; message: string }[];
  user_transcript: string;
  story_context?: string;
  target_level?: string;
}

export interface SpeakingRespondResponsePayload {
  assistant_reply: string;
  grammar_feedback?: string | null;
  better_alternative: string;
  vocabulary_highlight: string[];
  jargon_score: number;
  fluency_score: number;
}

export const CONVERSATION_MODES: Record<ConversationMode, ConversationModeConfig> = {
  casual: {
    id: "casual",
    icon: "☕",
    label: "Günlük Sohbet",
    shortLabel: "Günlük",
    tagline: "Samimi arkadaş sohbeti • Gerilimsiz ve doğal",
    description: "Kahve, seyahat, hobiler ve günlük rutinler üzerine rahatça pratik yap.",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    activeBorderColor: "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    showScorecard: false,
    scorecardTitle: "Sohbet Akıcılığı & İfadeler",
  },
  problem_solving: {
    id: "problem_solving",
    icon: "🚨",
    label: "Problem Çözme",
    shortLabel: "Kriz Çözme",
    tagline: "Anlık kriz & vaka simülasyonu • Çözüm üret",
    description: "Şantiye gecikmesi, kaybolan bagaj veya acil iş durumunda hızlı karar ver.",
    badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    activeBorderColor: "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]",
    showScorecard: true,
    scorecardTitle: "Kriz Yönetimi & Çözüm Yetkinliği",
  },
  interview: {
    id: "interview",
    icon: "💼",
    label: "Mülakat & IELTS",
    shortLabel: "Mülakat",
    tagline: "Resmi iş görüşmesi • C1 EVM / FIDIC / Kurumsal",
    description: "C1 seviyesi teknik mülakatlar, müzakere ve akademik değerlendirme simülasyonu.",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    activeBorderColor: "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    showScorecard: true,
    scorecardTitle: "C1 Değerlendirme Karnesi",
  },
  story_debate: {
    id: "story_debate",
    icon: "📖",
    label: "Hikaye & Münazara",
    shortLabel: "Hikaye",
    tagline: "Okuma odası bağlamı • Fikir tartışması ve analiz",
    description: "Okunan hikayeler, ahlaki ikilemler ve karakter kararları üzerine derinleş.",
    badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    activeBorderColor: "border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]",
    showScorecard: true,
    scorecardTitle: "Münazara & Eleştirel Düşünce",
  },
};
