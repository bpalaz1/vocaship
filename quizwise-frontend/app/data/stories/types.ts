/**
 * Vocaship Okuma Odası (/reading) Hikaye Veri Tipleri
 */

export type ReadingLevel = "A" | "B" | "C" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | string;

export interface TargetVocabularyItem {
  word: string;
  phonetic?: string;
  meaning?: string;
  turkish_meaning?: string;
  context_sentence?: string;
  example?: string;
  translation?: string;
  part_of_speech?: string;
}

export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  correct_index?: number;
  explanation?: string;
  distractor_reasons?: Record<number, string>;
}

export interface Story {
  id: string;
  title: string;
  category: string;
  categoryName?: string;
  level: ReadingLevel;
  cefr?: string;
  readTime: string;
  wordCount: number;
  coverImage?: string;
  desc: string;
  topic?: string;
  target_words: string[];
  content: string;
  target_vocabulary: TargetVocabularyItem[];
  comprehension_questions: ComprehensionQuestion[];
  isCareerCase?: boolean;
  isUserStory?: boolean;
}

// Geriye dönük uyumluluk için CuratedStory takma adı
export type CuratedStory = Story;

export interface StoryCategoryMeta {
  id: string;
  title: string;
  titleKey: string;
  description: string;
  icon: string;
  levelBadge: string;
  colorScheme: {
    badgeBg: string;
    badgeText: string;
    border: string;
    gradientFallback: string;
  };
}
