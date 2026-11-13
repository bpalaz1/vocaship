"use client";

import React from "react";
import GameOverSummary, { GameMistakeItem } from "./GameOverSummary";

export interface GameOverScreenProps {
  gameTitle: string;
  deckTitle?: string;
  score: number;
  timeSeconds?: number;
  accuracyPercent?: number;
  awardedXP: number;
  awardedGold?: number;
  streakCount?: number;
  mistakes?: GameMistakeItem[];
  onPlayAgain: () => void;
  onBackToArena: () => void;
  onViewPodium?: () => void;
}

export default function GameOverScreen(props: GameOverScreenProps) {
  return <GameOverSummary {...props} />;
}
export { type GameMistakeItem };
