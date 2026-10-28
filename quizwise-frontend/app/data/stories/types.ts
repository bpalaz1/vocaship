export interface TargetVocabularyItem {
  word: string;
  phonetic: string;
  turkish_meaning: string;
  context_sentence: string;
}

export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correct_index: number;
  correct_answer_index: number;
}

export interface CuratedStory {
  id: string;
  title: string;
  category:
    | "kids"
    | "adult_basic"
    | "adult_intermediate"
    | "adult_advanced"
    | "project_controls"
    | "legal_contracts"
    | "medical_clinical"
    | "finance_accounting"
    | string;
  categoryName: string;
  level: string;
  cefr: string;
  coverImage: string;
  readTime: string;
  wordCount: number;
  topic: string;
  desc: string;
  content: string;
  target_words: string[];
  target_vocabulary: TargetVocabularyItem[];
  comprehension_questions: ComprehensionQuestion[];
  isCareerCase?: boolean;
  isUserStory?: boolean;
}

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
