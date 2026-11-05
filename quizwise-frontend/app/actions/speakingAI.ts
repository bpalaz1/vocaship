/**
 * Speaking AI Actions & Prompt Köprüsü
 * Okuma odası hikayeleri, dinamik tartışma soruları ve takip motoru isteklerini yönetir.
 */

import { API_BASE } from "../config";

export interface ActiveStoryContext {
  storyId?: string;
  id?: string;
  title: string;
  snippet?: string;
  content?: string;
  targetWords?: string[];
  target_vocabulary?: string[];
  level?: string;
  topic?: string;
}

export interface StoryDebateQuestionItem {
  question: string;
  theme_hint?: string;
}

export interface StoryDebateQuestionsResult {
  opening_question: string;
  questions: StoryDebateQuestionItem[];
}

/**
 * Okunan hikaye bağlamına göre açılış sorusu ve 3-4 dinamik analitik tartışma sorusu üretir.
 */
export async function generateStoryDebateQuestions(
  story: ActiveStoryContext
): Promise<StoryDebateQuestionsResult> {
  const cleanTitle = story.title || "Hikaye";
  const targetWords = story.targetWords || story.target_vocabulary || [];

  const defaultResult: StoryDebateQuestionsResult = {
    opening_question: `In '${cleanTitle}', the characters face a decisive turning point. Looking at the core dilemma, do you believe the protagonist made the right choice, or was there a better alternative?`,
    questions: [
      {
        question: `What was the most critical decision in '${cleanTitle}', and how did it shape the outcome?`,
        theme_hint: "Dönüm Noktası & Karar",
      },
      {
        question: `If you were placed in the protagonist's shoes during this conflict, what would you have done differently?`,
        theme_hint: "Empati & Ahlaki İkilem",
      },
      {
        question: `Which character's actions surprised you the most, and why do you think they reacted that way?`,
        theme_hint: "Karakter Motivasyonu",
      },
      {
        question: `How does the central theme of '${cleanTitle}' reflect challenges or ethical decisions in modern life?`,
        theme_hint: "Tematik Bağlantı",
      },
    ],
  };

  try {
    const res = await fetch(`${API_BASE}/api/v1/speaking/generate-story-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        story_id: story.storyId || story.id,
        title: cleanTitle,
        snippet: story.snippet || (story.content ? story.content.slice(0, 350) : ""),
        content: story.content,
        target_words: targetWords,
        target_level: story.level || "B1",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        return {
          opening_question: data.opening_question || defaultResult.opening_question,
          questions: data.questions,
        };
      }
    }
  } catch (err) {
    console.warn("generateStoryDebateQuestions fetch failed, using fallbacks:", err);
  }

  return defaultResult;
}

