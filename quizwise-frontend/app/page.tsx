"use client";
import Link from "next/link";

import React, { useState, useEffect, useRef } from "react";
import {
  RotateCw,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  ArrowLeft,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Gamepad2,
  Timer,
  Trophy,
  Flame,
  Heart,
  Zap,
  Check,
  AlertCircle,
  HelpCircle,
  Puzzle,
  Undo2,
  KeyRound,
  Folder,
  FolderPlus,
  GripVertical,
  AlertTriangle,
  LayoutGrid,
  List as ListIcon,
  FolderTree,
  Search,
  BookOpen,
  Edit3,
  Volume2,
  Languages
} from "lucide-react";
import ReadingRoom from "./components/reading/ReadingRoom";

const API_BASE = "http://localhost:8000/api/v1";

// Desteklenen Diller
const SUPPORTED_LANGUAGES = [
  { code: "en", label: "İNGİLİZCE", ttsLocale: "en-US" },
  { code: "tr", label: "TÜRKÇE", ttsLocale: "tr-TR" },
  { code: "de", label: "ALMANCA", ttsLocale: "de-DE" },
  { code: "es", label: "İSPANYOLCA", ttsLocale: "es-ES" },
  { code: "fr", label: "FRANSIZCA", ttsLocale: "fr-FR" },
  { code: "it", label: "İTALYANCA", ttsLocale: "it-IT" },
  { code: "ru", label: "RUSÇA", ttsLocale: "ru-RU" }
];

interface FolderType {
  id: string;
  name: string;
  color?: string;
  deck_count?: number;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  card_count: number;
  folder_id?: string | null;
  target_lang?: string;
  native_lang?: string;
}

interface Flashcard {
  id: string;
  word: string;
  phonetic?: string;
  meanings: Array<{ definition: string; translation: string; part_of_speech?: string }>;
  example_sentences: Array<{ en?: string; tr?: string; target?: string; source?: string; native?: string }>;
  collocations?: string[];
}

interface MatchTile {
  id: string;
  tileId: string;
  text: string;
  type: "word" | "meaning";
}

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface ScrambleLetter {
  charId: string;
  char: string;
  isUsed: boolean;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Home() {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"folder" | "grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Dil Seçimleri
  const [termLang, setTermLang] = useState<string>("en");
  const [defLang, setDefLang] = useState<string>("tr");

  // Sürükle-Bırak
  const [draggedDeckId, setDraggedDeckId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null | "all">(null);

  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [allDeckCards, setAllDeckCards] = useState<Flashcard[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Oturum puan takibi
  const [cardRatings, setCardRatings] = useState<Record<string, number>>({});

  // Mod Seçimi
  const [currentMode, setCurrentMode] = useState<"study" | "match" | "gravity" | "quiz" | "scramble" | "hangman" | "reading">("study");

  // MATCH
  const [tiles, setTiles] = useState<MatchTile[]>([]);
  const [selectedTile, setSelectedTile] = useState<MatchTile | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongTileIds, setWrongTileIds] = useState<string[]>([]);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);

  // GRAVITY
  const [gravityScore, setGravityScore] = useState(0);
  const [gravityLives, setGravityLives] = useState(3);
  const [gravityInput, setGravityInput] = useState("");
  const [currentGravityCard, setCurrentGravityCard] = useState<Flashcard | null>(null);
  const [asteroidTop, setAsteroidTop] = useState(0);
  const [isGravityOver, setIsGravityOver] = useState(false);
  const gravityInputRef = useRef<HTMLInputElement>(null);

  // QUIZ
  const [quizScore, setQuizScore] = useState(0);
  const [quizCombo, setQuizCombo] = useState(1);
  const [quizCardIndex, setQuizCardIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>([]);
  const [quizTimeLeft, setQuizTimeLeft] = useState(5000);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isQuizOver, setIsQuizOver] = useState(false);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);

  // SCRAMBLE
  const [scrambleIndex, setScrambleIndex] = useState(0);
  const [scrambleLetters, setScrambleLetters] = useState<ScrambleLetter[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<ScrambleLetter[]>([]);
  const [scrambleScore, setScrambleScore] = useState(0);
  const [isScrambleSuccess, setIsScrambleSuccess] = useState(false);
  const [isScrambleWrong, setIsScrambleWrong] = useState(false);
  const [isScrambleOver, setIsScrambleOver] = useState(false);

  // HANGMAN
  const [hangmanIndex, setHangmanIndex] = useState(0);
  const [hangmanGuessed, setHangmanGuessed] = useState<string[]>([]);
  const [hangmanLives, setHangmanLives] = useState(5);
  const [hangmanScore, setHangmanScore] = useState(0);
  const [isHangmanOver, setIsHangmanOver] = useState(false);
  const [isHangmanSuccess, setIsHangmanSuccess] = useState(false);

  // MODALLAR
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDeckFolderId, setNewDeckFolderId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  const [selectedDeckForWord, setSelectedDeckForWord] = useState<string>("");
  const [wordInput, setWordInput] = useState("");
  const [contextHint, setContextHint] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);

  const [correctionNotice, setCorrectionNotice] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [enrichedData, setEnrichedData] = useState<{
    word: string;
    phonetic: string;
    translation: string;
    exampleEn: string;
    exampleTr: string;
  } | null>(null);

  // KART DÜZENLEME (EDIT)
  const [isEditingCardModalOpen, setIsEditingCardModalOpen] = useState(false);
  const [editingCardData, setEditingCardData] = useState<{
    id: string;
    word: string;
    phonetic: string;
    translation: string;
    exampleEn: string;
    exampleTr: string;
  } | null>(null);
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);

  // İleri / Geri Navigasyon
  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNextCard = () => {
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Klavye Kontrolleri
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (!activeDeck || currentMode !== "study" || sessionCompleted) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDeck, currentMode, currentIndex, cards.length, sessionCompleted]);

  // Manuel Giriş Modu
  const handleManualInputMode = () => {
    const targetDeck = selectedDeckForWord || (activeDeck ? activeDeck.id : (decks.length > 0 ? decks[0].id : ""));
    if (!targetDeck) {
      alert("Lütfen önce bir hedef deste seçin!");
      return;
    }
    if (!wordInput.trim()) {
      alert("Lütfen bir kelime yazın!");
      return;
    }

    setCorrectionNotice(null);
    setSuggestions([]);
    setEnrichedData({
      word: wordInput.trim(),
      phonetic: "",
      translation: contextHint.trim() || "",
      exampleEn: "",
      exampleTr: "",
    });
  };

  // Sesli Telaffuz (TTS)
  const speakText = (text: string, langCode: string = "en", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Tarayıcınız sesli telaffuzu desteklemiyor.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    utterance.lang = langObj ? langObj.ttsLocale : "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const fetchFolders = async () => {
    try {
      const res = await fetch(`${API_BASE}/folders`);
      if (res.ok) {
        const data = await res.json();
        setFolders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/decks`);
      if (res.ok) {
        const data: Deck[] = await res.json();
        const deckArr = Array.isArray(data) ? data : [];
        setDecks(deckArr);
        if (deckArr.length > 0) {
          setSelectedDeckForWord((prev) => prev || deckArr[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchDecks();
  }, []);

  // MATCH Sayacı
  useEffect(() => {
    let interval: any;
    if (currentMode === "match" && gameStartTime && !isGameFinished) {
      interval = setInterval(() => setElapsedTime(Date.now() - gameStartTime), 100);
    }
    return () => clearInterval(interval);
  }, [currentMode, gameStartTime, isGameFinished]);

  // GRAVITY Döngüsü
  useEffect(() => {
    let animationFrame: any;
    if (currentMode === "gravity" && !isGravityOver && currentGravityCard) {
      animationFrame = setInterval(() => {
        setAsteroidTop((prev) => {
          if (prev >= 82) {
            setGravityLives((l) => {
              if (l <= 1) {
                setIsGravityOver(true);
                return 0;
              }
              return l - 1;
            });
            pickNextGravityCard();
            return 0;
          }
          const speed = 0.5 + Math.min(gravityScore * 0.05, 1.8);
          return prev + speed;
        });
      }, 50);
    }
    return () => clearInterval(animationFrame);
  }, [currentMode, isGravityOver, currentGravityCard, gravityScore]);

  // QUIZ Geri Sayım
  useEffect(() => {
    let timer: any;
    if (currentMode === "quiz" && !isQuizOver && selectedAnswer === null) {
      timer = setInterval(() => {
        setQuizTimeLeft((prev) => {
          if (prev <= 100) {
            handleQuizAnswer(-1);
            return 5000;
          }
          return prev - 100;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [currentMode, isQuizOver, selectedAnswer, quizCardIndex]);

  // SÜRÜKLE-BIRAK
  const handleDragStart = (e: React.DragEvent, deckId: string) => {
    setDraggedDeckId(deckId);
    e.dataTransfer.setData("text/plain", deckId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, folderTarget: string | null | "all") => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverFolderId !== folderTarget) {
      setDragOverFolderId(folderTarget);
    }
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDropOnFolder = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    const deckId = e.dataTransfer.getData("text/plain") || draggedDeckId;
    setDragOverFolderId(null);
    setDraggedDeckId(null);

    if (!deckId) return;

    try {
      const res = await fetch(`${API_BASE}/decks/${deckId}/folder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: targetFolderId }),
      });

      if (res.ok) {
        await fetchDecks();
        await fetchFolders();
      }
    } catch (err) {
      console.error("Deste klasöre taşınamadı:", err);
    }
  };

  // KLASÖR OLUŞTURMA & SİLME
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      if (res.ok) {
        setNewFolderName("");
        setIsCreateFolderModalOpen(false);
        await fetchFolders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!window.confirm(`"${folderName}" klasörünü silmek istiyor musunuz? (İçindeki desteler silinmez).`)) return;
    try {
      const res = await fetch(`${API_BASE}/folders/${folderId}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedFolderId === folderId) setSelectedFolderId(null);
        await fetchFolders();
        await fetchDecks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // HANGMAN
  const setupHangmanGame = (deckCards: Flashcard[]) => {
    if (deckCards.length === 0) return;
    setHangmanScore(0);
    setHangmanIndex(0);
    setHangmanLives(5);
    setHangmanGuessed([]);
    setIsHangmanOver(false);
    setIsHangmanSuccess(false);
    setCurrentMode("hangman");
  };

  const handleHangmanGuess = (letter: string) => {
    if (hangmanGuessed.includes(letter) || isHangmanOver || isHangmanSuccess) return;
    const newGuessed = [...hangmanGuessed, letter];
    setHangmanGuessed(newGuessed);

    const currentWord = (cards[hangmanIndex]?.word || "").toUpperCase();
    if (!currentWord.includes(letter)) {
      setHangmanLives((l) => {
        if (l <= 1) {
          setIsHangmanOver(true);
          return 0;
        }
        return l - 1;
      });
    } else {
      const isWon = currentWord.split("").every((ch) => ch === " " || ch === "-" || newGuessed.includes(ch));
      if (isWon) {
        setIsHangmanSuccess(true);
        setHangmanScore((s) => s + 20);
        setTimeout(() => {
          if (hangmanIndex + 1 < cards.length) {
            setHangmanIndex((p) => p + 1);
            setHangmanGuessed([]);
            setHangmanLives(5);
            setIsHangmanSuccess(false);
          } else {
            setIsHangmanOver(true);
          }
        }, 1000);
      }
    }
  };

  // SCRAMBLE
  const setupScrambleGame = (deckCards: Flashcard[]) => {
    if (deckCards.length === 0) return;
    setScrambleScore(0);
    setScrambleIndex(0);
    setIsScrambleOver(false);
    setCurrentMode("scramble");
    loadScrambleWord(0, deckCards);
  };

  const loadScrambleWord = (idx: number, deckCards: Flashcard[]) => {
    const card = deckCards[idx];
    if (!card) {
      setIsScrambleOver(true);
      return;
    }
    const cleanWord = card.word.trim().toUpperCase();
    const lettersArr: ScrambleLetter[] = cleanWord.split("").map((ch, i) => ({
      charId: `${ch}-${i}-${Math.random()}`,
      char: ch,
      isUsed: false,
    }));
    setScrambleLetters(lettersArr.sort(() => 0.5 - Math.random()));
    setSelectedLetters([]);
    setIsScrambleSuccess(false);
    setIsScrambleWrong(false);
  };

  const handlePickLetter = (item: ScrambleLetter) => {
    if (item.isUsed || isScrambleSuccess || isScrambleWrong) return;
    const nextIndex = selectedLetters.length;
    const targetWord = cards[scrambleIndex]?.word.trim().toUpperCase();

    if (targetWord[nextIndex] !== item.char) {
      setIsScrambleWrong(true);
      setTimeout(() => setIsScrambleWrong(false), 600);
      return;
    }

    const updatedSelected = [...selectedLetters, item];
    setSelectedLetters(updatedSelected);
    setScrambleLetters((prev) => prev.map((l) => (l.charId === item.charId ? { ...l, isUsed: true } : l)));

    if (updatedSelected.length === targetWord.length) {
      setIsScrambleSuccess(true);
      setScrambleScore((s) => s + 15);
      setTimeout(() => {
        if (scrambleIndex + 1 < cards.length) {
          setScrambleIndex((p) => p + 1);
          loadScrambleWord(scrambleIndex + 1, cards);
        } else {
          setIsScrambleOver(true);
        }
      }, 700);
    }
  };

  const handleRemoveLetter = (item: ScrambleLetter) => {
    if (isScrambleSuccess || isScrambleWrong) return;
    setSelectedLetters((prev) => prev.filter((l) => l.charId !== item.charId));
    setScrambleLetters((prev) => prev.map((l) => (l.charId === item.charId ? { ...l, isUsed: false } : l)));
  };

  // SPEED QUIZ
  const setupSpeedQuiz = (deckCards: Flashcard[]) => {
    if (deckCards.length < 4) {
      alert("Test modu için destede en az 4 kelime bulunmalıdır.");
      return;
    }
    setQuizScore(0);
    setQuizCombo(1);
    setQuizCorrectCount(0);
    setQuizCardIndex(0);
    setSelectedAnswer(null);
    setIsQuizOver(false);
    setCurrentMode("quiz");
    buildQuizQuestion(0, deckCards);
  };

  const buildQuizQuestion = (index: number, deckCards: Flashcard[]) => {
    const current = deckCards[index];
    if (!current) {
      setIsQuizOver(true);
      return;
    }
    const correctMeaning = current.meanings?.[0]?.translation || current.meanings?.[0]?.definition || current.word;
    const otherCards = deckCards.filter((c) => c.id !== current.id);
    const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random()).slice(0, 3);

    const options: QuizOption[] = [
      { text: correctMeaning, isCorrect: true },
      ...shuffledOthers.map((c) => ({
        text: c.meanings?.[0]?.translation || c.meanings?.[0]?.definition || c.word,
        isCorrect: false,
      })),
    ].sort(() => 0.5 - Math.random());

    setQuizOptions(options);
    setSelectedAnswer(null);
    setQuizTimeLeft(5000);
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);

    const isCorrect = optionIdx >= 0 && quizOptions[optionIdx]?.isCorrect;
    if (isCorrect) {
      setQuizScore((prev) => prev + 10 * quizCombo);
      setQuizCombo((prev) => Math.min(prev + 1, 4));
      setQuizCorrectCount((prev) => prev + 1);
    } else {
      setQuizCombo(1);
    }

    setTimeout(() => {
      if (quizCardIndex + 1 < cards.length) {
        setQuizCardIndex((prev) => prev + 1);
        buildQuizQuestion(quizCardIndex + 1, cards);
      } else {
        setIsQuizOver(true);
      }
    }, 900);
  };

  // GRAVITY
  const setupGravityGame = (deckCards: Flashcard[]) => {
    if (deckCards.length < 2) {
      alert("Yerçekimi oyunu için destede en az 2 kelime olmalıdır.");
      return;
    }
    setGravityScore(0);
    setGravityLives(3);
    setAsteroidTop(0);
    setGravityInput("");
    setIsGravityOver(false);
    setCurrentMode("gravity");

    const randomCard = deckCards[Math.floor(Math.random() * deckCards.length)];
    setCurrentGravityCard(randomCard);
    setTimeout(() => gravityInputRef.current?.focus(), 150);
  };

  const pickNextGravityCard = () => {
    setAsteroidTop(0);
    setGravityInput("");
    const remaining = cards.filter((c) => c.id !== currentGravityCard?.id);
    const nextCard = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : cards[0];
    setCurrentGravityCard(nextCard);
  };

  const handleGravitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGravityCard || isGravityOver) return;

    const userInput = gravityInput.trim().toLowerCase();
    const correctTr = (currentGravityCard.meanings?.[0]?.translation || currentGravityCard.meanings?.[0]?.definition || "").toLowerCase();
    const correctEn = currentGravityCard.word.toLowerCase();

    if (userInput === correctTr || correctTr.includes(userInput) || userInput === correctEn) {
      setGravityScore((s) => s + 10);
      pickNextGravityCard();
    } else {
      setGravityInput("");
    }
  };

  // MATCH
  const setupMatchGame = (deckCards: Flashcard[]) => {
    if (deckCards.length < 2) {
      alert("Eşleştirme oyunu için destede en az 2 kelime olmalıdır.");
      return;
    }
    const shuffled = [...deckCards].sort(() => 0.5 - Math.random()).slice(0, 6);
    const gameTiles: MatchTile[] = [];

    shuffled.forEach((c) => {
      gameTiles.push({ id: c.id, tileId: `${c.id}-w`, text: c.word, type: "word" });
      gameTiles.push({
        id: c.id,
        tileId: `${c.id}-m`,
        text: c.meanings?.[0]?.translation || c.meanings?.[0]?.definition || c.word,
        type: "meaning"
      });
    });

    setTiles(gameTiles.sort(() => 0.5 - Math.random()));
    setSelectedTile(null);
    setMatchedIds([]);
    setWrongTileIds([]);
    setIsGameFinished(false);
    setElapsedTime(0);
    setGameStartTime(Date.now());
    setCurrentMode("match");
  };

  const handleTileClick = (tile: MatchTile) => {
    if (matchedIds.includes(tile.id) || wrongTileIds.length > 0) return;
    if (!selectedTile) {
      setSelectedTile(tile);
      return;
    }
    if (selectedTile.tileId === tile.tileId) {
      setSelectedTile(null);
      return;
    }

    if (selectedTile.id === tile.id && selectedTile.type !== tile.type) {
      const newMatched = [...matchedIds, tile.id];
      setMatchedIds(newMatched);
      setSelectedTile(null);
      if (newMatched.length === tiles.length / 2) setIsGameFinished(true);
    } else {
      setWrongTileIds([selectedTile.tileId, tile.tileId]);
      setTimeout(() => {
        setWrongTileIds([]);
        setSelectedTile(null);
      }, 700);
    }
  };

  // DESTE & KART SİLME
  const handleDeleteDeck = async (e: React.MouseEvent, deckId: string, deckTitle: string) => {
    e.stopPropagation();
    if (!window.confirm(`"${deckTitle}" destesini silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`${API_BASE}/decks/${deckId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchDecks();
        await fetchFolders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCurrentCard = async (e: React.MouseEvent, cardId: string, word: string) => {
    e.stopPropagation();
    if (!window.confirm(`"${word}" kartını desteden silmek istiyor musunuz?`)) return;
    try {
      const res = await fetch(`${API_BASE}/decks/cards/${cardId}`, { method: "DELETE" });
      if (res.ok) {
        const updated = cards.filter((c) => c.id !== cardId);
        setCards(updated);
        setAllDeckCards((prev) => prev.filter((c) => c.id !== cardId));
        setIsFlipped(false);
        if (currentIndex >= updated.length) setCurrentIndex(Math.max(0, updated.length - 1));
        if (updated.length === 0) setSessionCompleted(true);
        await fetchDecks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/decks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          folder_id: newDeckFolderId || null
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        setNewDeckFolderId("");
        setIsCreateModalOpen(false);
        await fetchDecks();
        await fetchFolders();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // AI İLE KELİME ÇEKME
  const runFetchAi = async (searchWord: string) => {
    const targetDeck = selectedDeckForWord || (activeDeck ? activeDeck.id : (decks.length > 0 ? decks[0].id : ""));
    if (!targetDeck || !searchWord.trim()) return;

    setIsEnriching(true);
    setCorrectionNotice(null);
    setSuggestions([]);

    try {
      const aiRes = await fetch(`${API_BASE}/ai/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: searchWord.trim(),
          target_lang: termLang,
          native_lang: defLang,
          context_hint: contextHint.trim() || undefined
        }),
      });

      if (!aiRes.ok) {
        const err = await aiRes.json().catch(() => null);
        alert(err?.detail || "Kelime doğrulanamadı.");
        return;
      }

      const data = await aiRes.json();
      if (data.was_corrected) {
        setCorrectionNotice(`'${data.original_word}' yerine '${data.word}' olarak düzeltildi.`);
      }
      setSuggestions(data.suggestions || []);

      setEnrichedData({
        word: data.word,
        phonetic: data.phonetic || "",
        translation: data.meanings?.[0]?.translation || data.meanings?.[0]?.definition || "",
        exampleEn: data.example_sentences?.[0]?.en || data.example_sentences?.[0]?.target || "",
        exampleTr: data.example_sentences?.[0]?.tr || data.example_sentences?.[0]?.source || "",
      });
    } finally {
      setIsEnriching(false);
    }
  };

  const handleFetchAiData = async (e: React.FormEvent) => {
    e.preventDefault();
    runFetchAi(wordInput);
  };

  const handleSaveEditedCard = async () => {
    const targetDeck = selectedDeckForWord || (activeDeck ? activeDeck.id : (decks.length > 0 ? decks[0].id : ""));
    if (!enrichedData || !targetDeck) return;
    setIsSavingCard(true);
    try {
      const res = await fetch(`${API_BASE}/decks/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deck_id: targetDeck,
          word: enrichedData.word.trim(),
          phonetic: enrichedData.phonetic.trim() || null,
          meanings: [{ part_of_speech: "", translation: enrichedData.translation.trim(), definition: enrichedData.translation.trim() }],
          example_sentences: enrichedData.exampleEn ? [{ en: enrichedData.exampleEn.trim(), tr: enrichedData.exampleTr.trim() }] : [],
          collocations: [],
        }),
      });
      if (res.ok) {
        const newCard = await res.json();
        setWordInput("");
        setContextHint("");
        setEnrichedData(null);
        setCorrectionNotice(null);
        setSuggestions([]);
        setIsAddWordModalOpen(false);
        await fetchDecks();

        if (activeDeck && activeDeck.id === targetDeck) {
          setCards((prev) => [...prev, newCard]);
          setAllDeckCards((prev) => [...prev, newCard]);
          if (sessionCompleted) setSessionCompleted(false);
        }
      }
    } finally {
      setIsSavingCard(false);
    }
  };

  // KART DÜZENLEME (EDIT)
  const openEditModalForCurrentCard = (card: Flashcard) => {
    setEditingCardData({
      id: card.id,
      word: card.word,
      phonetic: card.phonetic || "",
      translation: card.meanings?.[0]?.translation || card.meanings?.[0]?.definition || "",
      exampleEn: card.example_sentences?.[0]?.en || card.example_sentences?.[0]?.target || "",
      exampleTr: card.example_sentences?.[0]?.tr || card.example_sentences?.[0]?.source || "",
    });
    setIsEditingCardModalOpen(true);
  };

  const handleUpdateCurrentCard = async () => {
    if (!editingCardData) return;
    setIsUpdatingCard(true);
    try {
      const res = await fetch(`${API_BASE}/decks/cards/${editingCardData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: editingCardData.word.trim(),
          phonetic: editingCardData.phonetic.trim() || null,
          meanings: [{ part_of_speech: "", translation: editingCardData.translation.trim(), definition: editingCardData.translation.trim() }],
          example_sentences: editingCardData.exampleEn ? [{ en: editingCardData.exampleEn.trim(), tr: editingCardData.exampleTr.trim() }] : [],
        }),
      });

      if (res.ok) {
        const updated = (c: Flashcard) =>
          c.id === editingCardData.id
            ? {
              ...c,
              word: editingCardData.word.trim(),
              phonetic: editingCardData.phonetic.trim() || undefined,
              meanings: [{ part_of_speech: "", translation: editingCardData.translation.trim(), definition: editingCardData.translation.trim() }],
              example_sentences: editingCardData.exampleEn ? [{ en: editingCardData.exampleEn.trim(), tr: editingCardData.exampleTr.trim() }] : [],
            }
            : c;

        setCards((prev) => prev.map(updated));
        setAllDeckCards((prev) => prev.map(updated));
        setIsEditingCardModalOpen(false);
        setEditingCardData(null);
      } else {
        alert("Kart güncellenemedi.");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucuya ulaşılamadı.");
    } finally {
      setIsUpdatingCard(false);
    }
  };

  // ÇALIŞMA BAŞLATMA
  const startStudy = async (deck: Deck) => {
    setActiveDeck(deck);
    setSelectedDeckForWord(deck.id);
    setLoading(true);
    setSessionCompleted(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCardRatings({});
    setCurrentMode("study");
    try {
      const res = await fetch(`${API_BASE}/decks/${deck.id}/cards`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllDeckCards(data);
          setCards(data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // SEÇENEKLİ TEKRAR ÇALIŞTIRMA
  const restartStudyFiltered = (filterType: "all" | "forgotten" | "difficult") => {
    let filteredList: Flashcard[] = [];

    if (filterType === "all") {
      filteredList = allDeckCards;
    } else if (filterType === "forgotten") {
      filteredList = allDeckCards.filter((c) => cardRatings[c.id] === 1);
    } else if (filterType === "difficult") {
      filteredList = allDeckCards.filter((c) => cardRatings[c.id] === 1 || cardRatings[c.id] === 3);
    }

    if (filteredList.length === 0) {
      alert("Bu grupta tekrar edilecek kelime bulunmuyor.");
      return;
    }

    setCards(filteredList);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setCardRatings({});
  };

  // SM-2 PUANLAMA
  const handleRating = async (rating: number) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    setCardRatings((prev) => ({ ...prev, [currentCard.id]: rating }));

    try {
      await fetch(`${API_BASE}/study/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: currentCard.id, rating }),
      });
    } catch (e) {
      console.error(e);
    }
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((p) => p + 1), 150);
    } else {
      setSessionCompleted(true);
    }
  };

  const currentCard = cards[currentIndex];
  const currentQuizCard = cards[quizCardIndex];
  const currentScrambleCard = cards[scrambleIndex];
  const currentHangmanCard = cards[hangmanIndex];

  const forgottenCardsCount = allDeckCards.filter((c) => cardRatings[c.id] === 1).length;
  const hardCardsCount = allDeckCards.filter((c) => cardRatings[c.id] === 1 || cardRatings[c.id] === 3).length;

  const filteredDecks = decks.filter((d) => {
    const matchesFolder = selectedFolderId
      ? d.folder_id && String(d.folder_id).trim().toLowerCase() === String(selectedFolderId).trim().toLowerCase()
      : true;
    const matchesSearch = searchQuery
      ? d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesFolder && matchesSearch;
  });

  const activeFolderName = folders.find((f) => String(f.id).toLowerCase() === String(selectedFolderId).toLowerCase())?.name;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-4 md:p-10 font-sans relative selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-wrap gap-4 items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>Quizwise</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO</span>
            </h1>
            <p className="text-xs text-slate-500">Çok Dilli Kelime Arenası & İnteraktif Okuma Odası</p>
          </div>
        </div>

        {activeDeck ? (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setSelectedDeckForWord(activeDeck.id);
                setEnrichedData(null);
                setCorrectionNotice(null);
                setSuggestions([]);
                setIsAddWordModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/50 hover:bg-indigo-600/30 font-medium text-xs sm:text-sm text-indigo-300 transition"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Desteye Kelime Ekle</span>
            </button>
            <button
              onClick={() => {
                setActiveDeck(null);
                setCurrentMode("study");
              }}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-xs sm:text-sm font-semibold transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>Destelere Dön</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 font-medium text-xs sm:text-sm text-slate-300 transition"
            >
              <FolderPlus className="w-4 h-4 text-amber-400" />
              <span>Klasör Aç</span>
            </button>
            <button
              onClick={() => {
                if (decks.length > 0 && !selectedDeckForWord) setSelectedDeckForWord(decks[0].id);
                setEnrichedData(null);
                setCorrectionNotice(null);
                setSuggestions([]);
                setIsAddWordModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 font-medium text-xs sm:text-sm text-indigo-300 transition"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Kelime Ekle</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Deste</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="w-full max-w-5xl mt-6 flex-1 flex flex-col items-center">
        {!activeDeck ? (
          <div className="w-full">
            {/* Üst Kontrol Barı */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Deste ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-end sm:self-auto">
                <button
                  onClick={() => setViewMode("folder")}
                  title="Klasör Görünümü"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === "folder" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
                    }`}
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Klasörler</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  title="Kart Izgara Görünümü"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === "grid" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
                    }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Kartlar</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  title="Kompakt Liste Görünümü"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === "list" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
                    }`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Liste</span>
                </button>
              </div>
            </div>

            {/* Seçili Klasör Uyarısı */}
            {selectedFolderId && (
              <div className="flex items-center justify-between px-3 py-2.5 mb-5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                <div className="flex items-center space-x-2 text-xs">
                  <button onClick={() => setSelectedFolderId(null)} className="text-slate-400 hover:text-white underline">
                    Tüm Klasörler
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5" />
                    {activeFolderName || "Seçili Klasör"}
                  </span>
                </div>
                <button onClick={() => setSelectedFolderId(null)} className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold">
                  Geri Dön (Tümü)
                </button>
              </div>
            )}

            {/* 1. KLASÖR GÖRÜNÜMÜ */}
            {viewMode === "folder" && !selectedFolderId && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                    <FolderTree className="w-4 h-4 text-amber-400" />
                    <span>Klasörler</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {folders.map((f) => {
                      const isHovered = dragOverFolderId === f.id;
                      return (
                        <div
                          key={f.id}
                          onClick={() => setSelectedFolderId(f.id)}
                          onDragOver={(e) => handleDragOver(e, f.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDropOnFolder(e, f.id)}
                          className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between select-none ${isHovered
                              ? "bg-indigo-600/30 border-dashed border-indigo-400 scale-105 shadow-xl shadow-indigo-600/20"
                              : "bg-slate-900/70 border-slate-800 hover:border-amber-400/50 hover:bg-slate-900 shadow-md"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition">
                              <Folder className="w-5 h-5" />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(f.id, f.name);
                              }}
                              title="Klasörü Sil"
                              className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition truncate">{f.name}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">{f.deck_count || 0} Deste Bağlı</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Genel & Bağımsız Desteler</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {decks
                      .filter((d) => !d.folder_id)
                      .map((deck) => (
                        <div
                          key={deck.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deck.id)}
                          onClick={() => startStudy(deck)}
                          className="group cursor-grab active:cursor-grabbing bg-slate-900/70 border border-slate-800 hover:border-indigo-500/60 p-5 rounded-2xl transition flex flex-col justify-between shadow-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                              <GripVertical className="w-3.5 h-3.5" />
                              <span>Sürükleyip Klasöre Bırak</span>
                            </div>
                            <button onClick={(e) => handleDeleteDeck(e, deck.id, deck.title)} className="p-1 rounded-lg text-slate-500 hover:text-rose-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <h4 className="text-base font-bold group-hover:text-indigo-400 transition">{deck.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">{deck.description || "Açıklama yok."}</p>
                          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                            <span>{deck.card_count} Kart</span>
                            <span className="flex items-center space-x-1 text-indigo-400 font-semibold">
                              <span>Çalış</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. KART IZGARA GÖRÜNÜMÜ */}
            {(viewMode === "grid" || selectedFolderId) && (
              <div>
                {filteredDecks.length === 0 ? (
                  <div className="text-center p-12 bg-slate-900/40 border border-slate-800/60 rounded-3xl">
                    <Folder className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <h4 className="text-base font-bold text-slate-300">Bu bölümde deste bulunamadı</h4>
                    <p className="text-xs text-slate-500 mt-1">"Yeni Deste" butonuna tıklayarak ilk destenizi ekleyin.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDecks.map((deck) => {
                      const parentFolder = folders.find((f) => String(f.id).toLowerCase() === String(deck.folder_id).toLowerCase());
                      const isBeingDragged = draggedDeckId === deck.id;

                      return (
                        <div
                          key={deck.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deck.id)}
                          onClick={() => startStudy(deck)}
                          className={`group cursor-grab active:cursor-grabbing bg-slate-900/70 border p-6 rounded-2xl transition-all duration-200 flex flex-col justify-between relative select-none ${isBeingDragged
                              ? "opacity-40 border-indigo-500 border-dashed scale-95"
                              : "border-slate-800 hover:border-indigo-500/60 hover:scale-[1.01] shadow-lg"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-1.5 text-slate-500 group-hover:text-slate-400">
                              <GripVertical className="w-4 h-4" />
                              <span className="text-[11px]">Sürükle</span>
                            </div>
                            <button
                              onClick={(e) => handleDeleteDeck(e, deck.id, deck.title)}
                              title="Desteyi Sil"
                              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            {parentFolder && (
                              <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-400/90 bg-amber-400/10 px-2.5 py-0.5 rounded-lg mb-2">
                                <Folder className="w-3 h-3" />
                                <span>{parentFolder.name}</span>
                              </span>
                            )}
                            <h3 className="text-lg font-bold group-hover:text-indigo-400 transition">{deck.title}</h3>
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{deck.description || "Açıklama yok."}</p>
                          </div>
                          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                            <span>{deck.card_count} Kart Kayıtlı</span>
                            <span className="flex items-center space-x-1 text-indigo-400 font-medium">
                              <span>Çalış & Oyna</span>
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. KOMPAKT LİSTE GÖRÜNÜMÜ */}
            {viewMode === "list" && !selectedFolderId && (
              <div className="space-y-2">
                {filteredDecks.length === 0 ? (
                  <div className="text-center p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                    Aradığınız kriterde deste bulunamadı.
                  </div>
                ) : (
                  filteredDecks.map((deck) => {
                    const parentFolder = folders.find((f) => String(f.id).toLowerCase() === String(deck.folder_id).toLowerCase());
                    return (
                      <div
                        key={deck.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deck.id)}
                        onClick={() => startStudy(deck)}
                        className="group cursor-pointer bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 px-4 py-3 rounded-xl transition flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0 cursor-grab" />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 truncate">{deck.title}</h4>
                            <p className="text-xs text-slate-400 truncate">{deck.description || "Açıklama yok"}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 shrink-0">
                          {parentFolder ? (
                            <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-md">
                              <Folder className="w-3 h-3" />
                              <span>{parentFolder.name}</span>
                            </span>
                          ) : (
                            <span className="hidden sm:inline text-[11px] text-slate-500">(Genel)</span>
                          )}

                          <span className="text-xs text-slate-400 font-mono">{deck.card_count} Kart</span>

                          <button
                            onClick={(e) => handleDeleteDeck(e, deck.id, deck.title)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center my-auto space-y-3">
            <RotateCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Yükleniyor...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="my-auto text-center p-10 bg-slate-900/60 border border-slate-800 rounded-3xl max-w-md">
            <h3 className="text-xl font-bold">Deste Boş</h3>
            <p className="text-sm text-slate-400 mt-2">Bu destede henüz hiç kelime kartı yok.</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedDeckForWord(activeDeck.id);
                  setEnrichedData(null);
                  setIsAddWordModalOpen(true);
                }}
                className="px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-500 transition"
              >
                Hemen Kelime Ekle
              </button>
              <button onClick={() => setActiveDeck(null)} className="px-5 py-2.5 bg-slate-800 rounded-xl text-sm font-medium">Destelere Dön</button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Üst Mod Çubuğu (Sadeleştirilmiş Temel Pedagojik Araçlar) */}
            <div className="flex items-center justify-between w-full max-w-xl bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 mb-8 shadow-sm">
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentMode("study")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    currentMode === "study"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Kart Çalış (SM-2)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentMode("reading")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    currentMode === "reading"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Okuma Odası</span>
                </button>
              </div>

              {/* Sağ: Zarif ve Minimalist Oyun Arenası Bağlantısı */}
              <Link
                href="/games"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 transition group"
                title="Oyun Arenası ve Alıştırmalar"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Oyun Arenası'na Git</span>
                <span className="text-slate-500 group-hover:text-amber-300 transition-colors">→</span>
              </Link>
            </div>

            {/* MOD: OKUMA ODASI */}
            {currentMode === "reading" && (
              <div className="w-full">
                <ReadingRoom decks={decks} selectedDeckId={activeDeck.id} />
              </div>
            )}

            {/* MOD: HANGMAN */}
            {currentMode === "hangman" && (
              <div className="w-full max-w-xl flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-sm bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <Zap className="w-4 h-4" />
                      <span>{hangmanScore} Puan</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Heart key={i} className={`w-5 h-5 ${i < hangmanLives ? "text-rose-500 fill-rose-500" : "text-slate-800"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">Kelime: {hangmanIndex + 1} / {cards.length}</div>
                </div>

                {isHangmanOver && hangmanLives === 0 ? (
                  <div className="text-center p-10 bg-slate-900/90 border border-rose-500/40 rounded-3xl w-full shadow-2xl">
                    <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                      <KeyRound className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Canlar Tükendi!</h3>
                    <p className="text-slate-400 text-sm mt-1">Doğru kelime: <span className="text-indigo-400 font-bold">{currentHangmanCard?.word}</span></p>
                    <div className="text-4xl font-extrabold text-amber-400 my-4 font-mono">{hangmanScore} Puan</div>
                    <div className="flex justify-center gap-3 mt-6">
                      <button onClick={() => setupHangmanGame(allDeckCards)} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-semibold">Tekrar Dene</button>
                      <button onClick={() => setCurrentMode("study")} className="px-5 py-2.5 bg-slate-800 rounded-xl text-sm font-medium">Kartlara Dön</button>
                    </div>
                  </div>
                ) : isHangmanOver && hangmanLives > 0 ? (
                  <div className="text-center p-10 bg-slate-900/90 border border-emerald-500/40 rounded-3xl w-full shadow-2xl">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Tüm Şifreleri Çözdünüz!</h3>
                    <div className="text-4xl font-extrabold text-amber-400 my-4 font-mono">{hangmanScore} Puan</div>
                    <div className="flex justify-center gap-3 mt-6">
                      <button onClick={() => setupHangmanGame(allDeckCards)} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-semibold">Tekrar Oyna</button>
                      <button onClick={() => setCurrentMode("study")} className="px-5 py-2.5 bg-slate-800 rounded-xl text-sm font-medium">Kartlara Dön</button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="w-full py-6 px-6 bg-slate-900 border border-slate-800 rounded-3xl text-center mb-6 shadow-xl relative">
                      <button
                        onClick={(e) => speakText(currentHangmanCard?.word || "", termLang, e)}
                        title="Telaffuzu Dinle"
                        className="absolute right-5 top-5 p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 text-indigo-400 hover:text-white transition"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <span className="text-xs uppercase text-indigo-400 font-semibold tracking-wider">TÜRKÇE ANLAMI</span>
                      <h2 className="text-2xl font-bold text-white mt-1">{currentHangmanCard?.meanings?.[0]?.translation || currentHangmanCard?.meanings?.[0]?.definition}</h2>
                      {currentHangmanCard?.phonetic && <p className="text-xs font-mono text-slate-400 mt-1">{currentHangmanCard.phonetic}</p>}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 mb-8 min-h-[56px] w-full px-2">
                      {currentHangmanCard?.word.split("").map((ch, i) => {
                        const upper = ch.toUpperCase();
                        const isRevealed = upper === " " || upper === "-" || hangmanGuessed.includes(upper);
                        return (
                          <div key={i} className={`w-11 h-14 rounded-2xl flex items-center justify-center text-xl font-black border ${isRevealed ? "bg-slate-900 border-indigo-500 text-white" : "bg-slate-900/60 border-slate-800 text-transparent"}`}>
                            {isRevealed ? upper : ""}
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 w-full max-w-md">
                      {ALPHABET.map((letter) => {
                        const isGuessed = hangmanGuessed.includes(letter);
                        const isCorrect = (currentHangmanCard?.word || "").toUpperCase().includes(letter);
                        let btnStyle = "bg-slate-900 border-slate-800 hover:border-indigo-500 text-white";
                        if (isGuessed) {
                          btnStyle = isCorrect ? "bg-emerald-600/30 border-emerald-500 text-emerald-200 opacity-60 pointer-events-none" : "bg-rose-500/20 border-rose-500/60 text-rose-400 opacity-30 pointer-events-none";
                        }
                        return (
                          <button key={letter} disabled={isGuessed || isHangmanSuccess} onClick={() => handleHangmanGuess(letter)} className={`h-11 rounded-xl text-sm font-bold border flex items-center justify-center shadow-md ${btnStyle}`}>
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MOD: SCRAMBLE */}
            {currentMode === "scramble" && (
              <div className="w-full max-w-xl flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-sm bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    <Zap className="w-4 h-4" />
                    <span>{scrambleScore} Puan</span>
                  </div>
                  <div className="text-xs text-slate-400">Kelime: {scrambleIndex + 1} / {cards.length}</div>
                </div>

                {isScrambleOver ? (
                  <div className="text-center p-10 bg-slate-900/90 border border-cyan-500/40 rounded-3xl w-full shadow-2xl">
                    <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Harika Kelime Avcısı!</h3>
                    <p className="text-slate-400 text-sm mt-1">Destedeki tüm karışık kelimeleri çözdünüz.</p>
                    <div className="text-4xl font-extrabold text-cyan-400 my-4 font-mono">{scrambleScore} Puan</div>
                    <div className="flex justify-center gap-3 mt-6">
                      <button onClick={() => setupScrambleGame(allDeckCards)} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-semibold">Tekrar Oyna</button>
                      <button onClick={() => setCurrentMode("study")} className="px-5 py-2.5 bg-slate-800 rounded-xl text-sm font-medium">Kartlara Dön</button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="w-full py-6 px-6 bg-slate-900 border border-slate-800 rounded-3xl text-center mb-6 shadow-xl">
                      <span className="text-xs uppercase text-indigo-400 font-semibold tracking-wider">TÜRKÇE ANLAMI</span>
                      <h2 className="text-2xl font-bold text-white mt-1">{currentScrambleCard?.meanings?.[0]?.translation || currentScrambleCard?.meanings?.[0]?.definition}</h2>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 mb-8 min-h-[56px] w-full px-4">
                      {currentScrambleCard?.word.split("").map((_, i) => {
                        const sel = selectedLetters[i];
                        return (
                          <button key={i} disabled={!sel || isScrambleSuccess || isScrambleWrong} onClick={() => sel && handleRemoveLetter(sel)} className={`w-12 h-14 rounded-2xl flex items-center justify-center text-xl font-black border ${isScrambleWrong ? "bg-rose-500/30 border-rose-500 text-rose-300 ring-2 ring-rose-500 scale-95 animate-pulse" : isScrambleSuccess ? "bg-emerald-600/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500 scale-105" : sel ? "bg-indigo-600/30 border-indigo-400 text-white" : "bg-slate-900 border-slate-800 text-slate-600"}`}>
                            {sel ? sel.char : ""}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-md">
                      {scrambleLetters.map((l) => (
                        <button key={l.charId} disabled={l.isUsed || isScrambleSuccess || isScrambleWrong} onClick={() => handlePickLetter(l)} className={`w-12 h-12 rounded-xl text-lg font-bold border transition-all ${isScrambleWrong && !l.isUsed ? "border-rose-500/60 bg-rose-500/10 text-rose-300" : l.isUsed ? "opacity-20 pointer-events-none border-transparent bg-slate-900" : "bg-slate-900 border-slate-700 hover:border-indigo-500 text-white shadow-md"}`}>
                          {l.char}
                        </button>
                      ))}
                    </div>

                    <button onClick={() => { setSelectedLetters([]); setScrambleLetters((prev) => prev.map((l) => ({ ...l, isUsed: false }))); setIsScrambleWrong(false); }} className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Harfleri Sıfırla</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MOD: QUIZ */}
            {currentMode === "quiz" && (
              <div className="w-full max-w-xl flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-sm bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <Zap className="w-4 h-4" />
                      <span>{quizScore} Puan</span>
                    </div>
                    {quizCombo > 1 && <div className="text-xs px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-extrabold">{quizCombo}x KOMBO!</div>}
                  </div>
                  <div className="text-xs text-slate-400">Soru: {quizCardIndex + 1} / {cards.length}</div>
                </div>

                {isQuizOver ? (
                  <div className="text-center p-10 bg-slate-900/90 border border-emerald-500/40 rounded-3xl w-full shadow-2xl">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Test Tamamlandı!</h3>
                    <p className="text-slate-400 text-sm mt-1">{cards.length} soruda {quizCorrectCount} doğru bildiniz.</p>
                    <div className="text-4xl font-extrabold text-amber-400 my-4 font-mono">{quizScore} Puan</div>
                    <div className="flex justify-center gap-3 mt-6">
                      <button onClick={() => setupSpeedQuiz(allDeckCards)} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-semibold">Tekrar Test Et</button>
                      <button onClick={() => setCurrentMode("study")} className="px-5 py-2.5 bg-slate-800 rounded-xl text-sm font-medium">Kartlara Dön</button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-6 border border-slate-800">
                      <div className={`h-full transition-all duration-100 ${quizTimeLeft > 2500 ? "bg-emerald-500" : quizTimeLeft > 1000 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${(quizTimeLeft / 5000) * 100}%` }} />
                    </div>

                    <div className="w-full py-8 px-6 bg-slate-900 border border-slate-800 rounded-3xl text-center mb-6 shadow-xl relative">
                      <button
                        onClick={(e) => speakText(currentQuizCard?.word || "", termLang, e)}
                        title="Telaffuzu Dinle"
                        className="absolute right-5 top-5 p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 text-indigo-400 hover:text-white transition"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <span className="text-xs uppercase text-indigo-400 font-semibold tracking-wider">DOĞRU ANLAMI SEÇİN</span>
                      <h2 className="text-4xl font-black text-white mt-2 mb-1">{currentQuizCard?.word}</h2>
                      {currentQuizCard?.phonetic && <p className="text-xs font-mono text-slate-400">{currentQuizCard.phonetic}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      {quizOptions.map((opt, idx) => {
                        let btnStyle = "bg-slate-900 border-slate-800 hover:border-indigo-500/60 text-slate-200";
                        if (selectedAnswer !== null) {
                          if (opt.isCorrect) btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500";
                          else if (selectedAnswer === idx) btnStyle = "bg-rose-600/30 border-rose-500 text-rose-200";
                        }
                        return (
                          <button key={idx} disabled={selectedAnswer !== null} onClick={() => handleQuizAnswer(idx)} className={`p-4 rounded-2xl border text-sm font-semibold transition-all duration-200 text-left flex items-center justify-between shadow-lg ${btnStyle}`}>
                            <span>{opt.text}</span>
                            {selectedAnswer !== null && opt.isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MOD: GRAVITY */}
            {currentMode === "gravity" && (
              <div className="w-full max-w-xl flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-sm bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <Zap className="w-4 h-4" />
                      <span>{gravityScore} Puan</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <Heart key={i} className={`w-5 h-5 ${i < gravityLives ? "text-rose-500 fill-rose-500" : "text-slate-700"}`} />
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setupGravityGame(allDeckCards)} className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Yeniden</span>
                  </button>
                </div>

                {isGravityOver ? (
                  <div className="text-center p-10 bg-slate-900/90 border border-rose-500/40 rounded-3xl w-full shadow-2xl">
                    <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                      <Flame className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Gezegen Düştü!</h3>
                    <p className="text-slate-400 text-sm mt-1">Canlarınız tükendi.</p>
                    <div className="text-4xl font-extrabold text-amber-400 my-4 font-mono">{gravityScore} Puan</div>
                    <div className="flex justify-center gap-3 mt-6">
                      <button onClick={() => setupGravityGame(allDeckCards)} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-semibold">Tekrar Dene</button>
                      <button onClick={() => setCurrentMode("study")} className="px-5 py-2.5 bg-slate-800 rounded-xl text-sm font-medium">Kartlara Dön</button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="w-full h-[380px] bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl">
                      {currentGravityCard && (
                        <div style={{ top: `${asteroidTop}%` }} className="absolute left-1/2 -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-xl border border-indigo-400/40 text-white font-bold text-lg whitespace-nowrap flex items-center space-x-2">
                          <button onClick={(e) => speakText(currentGravityCard.word, termLang, e)} title="Telaffuz" className="text-amber-300 hover:text-white transition">
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <span>{currentGravityCard.word}</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-rose-500/60" />
                    </div>

                    <form onSubmit={handleGravitySubmit} className="w-full mt-4 flex gap-2">
                      <input ref={gravityInputRef} type="text" placeholder="Karşılığını yazıp Enter'a basın..." value={gravityInput} onChange={(e) => setGravityInput(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                      <button type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold shadow-lg">Yok Et</button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* MOD: MATCH */}
            {currentMode === "match" && (
              <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-6 px-2">
                  <div className="flex items-center space-x-2 text-indigo-400 font-mono text-lg font-bold bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                    <Timer className="w-5 h-5" />
                    <span>{(elapsedTime / 1000).toFixed(1)} sn</span>
                  </div>
                  <button onClick={() => setupMatchGame(allDeckCards)} className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Yeniden Başlat</span>
                  </button>
                </div>

                {isGameFinished ? (
                  <div className="text-center p-10 bg-slate-900/80 border border-indigo-500/40 rounded-3xl w-full max-w-md shadow-2xl">
                    <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Harika Zamanlama!</h3>
                    <div className="text-4xl font-extrabold text-indigo-400 my-4 font-mono">{elapsedTime / 1000} sn</div>
                    <div className="flex justify-center gap-3 mt-6">
                      <button onClick={() => setupMatchGame(allDeckCards)} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-semibold">Tekrar Oyna</button>
                      <button onClick={() => setCurrentMode("study")} className="px-5 py-2.5 bg-slate-800 rounded-xl text-sm font-medium">Kartlara Dön</button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
                    {tiles.map((tile) => {
                      const isMatched = matchedIds.includes(tile.id);
                      const isSelected = selectedTile?.tileId === tile.tileId;
                      const isWrong = wrongTileIds.includes(tile.tileId);
                      if (isMatched) return <div key={tile.tileId} className="h-28 rounded-2xl opacity-0 pointer-events-none" />;

                      return (
                        <div key={tile.tileId} onClick={() => handleTileClick(tile)} className={`h-28 rounded-2xl p-4 flex items-center justify-center text-center cursor-pointer transition-all duration-200 select-none shadow-lg text-sm font-semibold border ${isWrong ? "bg-rose-500/20 border-rose-500 text-rose-300 scale-95" : isSelected ? "bg-indigo-600/30 border-indigo-400 text-white scale-105 ring-2 ring-indigo-500" : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200"}`}>
                          <span className="line-clamp-3">{tile.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MOD: STUDY */}
            {currentMode === "study" && (
              <div className="w-full max-w-xl flex flex-col items-center">
                {sessionCompleted ? (
                  <div className="my-auto text-center p-8 bg-slate-900/80 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-white">Tebrikler! Oturum Tamamlandı</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-6">
                      Hangi kelimeleri tekrar gözden geçirmek istersiniz?
                    </p>

                    <div className="space-y-2.5 text-left mb-6">
                      <button
                        onClick={() => restartStudyFiltered("forgotten")}
                        disabled={forgottenCardsCount === 0}
                        className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition ${forgottenCardsCount > 0
                            ? "bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 text-rose-300 cursor-pointer"
                            : "bg-slate-950/40 border-slate-800/40 text-slate-600 cursor-not-allowed opacity-50"
                          }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">Hatırlamadıklarımı Çalış</div>
                            <div className="text-[11px] text-slate-400">Yalnızca bilmediğiniz kelimeler</div>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-rose-500/20 font-bold text-rose-300">
                          {forgottenCardsCount} Kart
                        </span>
                      </button>

                      <button
                        onClick={() => restartStudyFiltered("difficult")}
                        disabled={hardCardsCount === 0}
                        className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition ${hardCardsCount > 0
                            ? "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-300 cursor-pointer"
                            : "bg-slate-950/40 border-slate-800/40 text-slate-600 cursor-not-allowed opacity-50"
                          }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <RotateCw className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">Zorlandıklarımı Tekrar Et</div>
                            <div className="text-[11px] text-slate-400">Zorlandım + Hatırlamadım</div>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-500/20 font-bold text-amber-300">
                          {hardCardsCount} Kart
                        </span>
                      </button>

                      <button
                        onClick={() => restartStudyFiltered("all")}
                        className="w-full p-3.5 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 hover:bg-indigo-600/25 text-indigo-200 flex items-center justify-between transition cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5">
                          <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">Tüm Desteyi Baştan Çalış</div>
                            <div className="text-[11px] text-slate-400">Destedeki bütün kelimeler</div>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-indigo-500/20 font-bold text-indigo-300">
                          {allDeckCards.length} Kart
                        </span>
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => setupSpeedQuiz(allDeckCards)}
                        className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Hızlı Test Çöz</span>
                      </button>
                      <button onClick={() => setActiveDeck(null)} className="text-xs text-slate-400 hover:text-white transition">
                        Destelere Dön
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Üst Bilgi ve Aksiyon Çubuğu */}
                    <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
                      <span className="font-semibold text-slate-300">{activeDeck.title}</span>
                      <div className="flex items-center space-x-4">
                        <span>{currentIndex + 1} / {cards.length} Kart</span>

                        <button
                          onClick={() => openEditModalForCurrentCard(currentCard)}
                          className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 transition"
                          title="Bu kartı düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Düzenle</span>
                        </button>

                        <button
                          onClick={(e) => handleDeleteCurrentCard(e, currentCard.id, currentCard.word)}
                          title="Bu kartı desteden sil"
                          className="flex items-center space-x-1 text-rose-400 hover:text-rose-300 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Kartı Çıkar</span>
                        </button>
                      </div>
                    </div>

                    {/* Flashcard Kartı - 3D CSS Flip & Güvenli Veri Bağlaması */}
                    {(() => {
                      const cardWord = currentCard?.word || (currentCard as any)?.front || "";
                      const cardPhonetic = currentCard?.phonetic || "";
                      const cardMeaning =
                        (currentCard as any)?.meaning ||
                        (currentCard as any)?.translation ||
                        (currentCard as any)?.definition ||
                        (currentCard as any)?.back ||
                        currentCard?.meanings?.[0]?.translation ||
                        currentCard?.meanings?.[0]?.definition ||
                        (currentCard as any)?.turkish_meaning ||
                        "Tanım bulunamadı";

                      const cardExEn =
                        currentCard?.example_sentences?.[0]?.en ||
                        currentCard?.example_sentences?.[0]?.target ||
                        (currentCard as any)?.example_sentence ||
                        (currentCard as any)?.example ||
                        (currentCard as any)?.context_sentence ||
                        "";

                      const cardExTr =
                        currentCard?.example_sentences?.[0]?.tr ||
                        currentCard?.example_sentences?.[0]?.native ||
                        currentCard?.example_sentences?.[0]?.source ||
                        (currentCard as any)?.example_sentence_tr ||
                        (currentCard as any)?.example_translation ||
                        "";

                      return (
                        <div
                          onClick={() => setIsFlipped(!isFlipped)}
                          className="w-full min-h-[340px] sm:min-h-[380px] cursor-pointer select-none [perspective:1000px] group"
                          style={{ perspective: "1000px" }}
                        >
                          <div
                            className="relative w-full h-full min-h-[340px] sm:min-h-[380px] rounded-3xl shadow-2xl transition-transform"
                            style={{
                              transformStyle: "preserve-3d",
                              transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                            }}
                          >
                            {/* ÖN YÜZ (card-front) */}
                            <div
                              className={`absolute inset-0 w-full h-full bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-colors ${
                                isFlipped ? "pointer-events-none z-0 opacity-0" : "z-10 opacity-100"
                              }`}
                              style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                              }}
                            >
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="font-bold tracking-wider uppercase text-indigo-400">TERİM</span>
                                <span className="flex items-center space-x-1 text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                                  <RotateCw className="w-3.5 h-3.5" />
                                  <span>Çevir (Boşluk / Space)</span>
                                </span>
                              </div>

                              <div className="my-auto text-center py-6 flex flex-col items-center">
                                <div className="flex items-center justify-center space-x-3 mb-2">
                                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">{cardWord}</h2>
                                  <button
                                    type="button"
                                    onClick={(e) => speakText(cardWord, termLang, e)}
                                    title="Telaffuzu Dinle"
                                    className="p-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-white transition shadow-sm border border-indigo-500/30"
                                  >
                                    <Volume2 className="w-5 h-5" />
                                  </button>
                                </div>
                                {cardPhonetic && <p className="text-base font-mono text-indigo-400 mt-1">{cardPhonetic}</p>}
                              </div>

                              <div className="text-center text-xs text-slate-500">Çevirmek için karta tıklayın veya Boşluk / Space tuşuna basın</div>
                            </div>

                            {/* ARKA YÜZ (card-back with transform: rotateY(180deg)) */}
                            <div
                              className={`absolute inset-0 w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-colors ${
                                isFlipped ? "z-20 opacity-100 ring-1 ring-indigo-500/30" : "pointer-events-none z-0 opacity-0"
                              }`}
                              style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                              }}
                            >
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="font-bold tracking-wider uppercase text-emerald-400">TANIM / ÇEVİRİ</span>
                                <span className="flex items-center space-x-1 text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                                  <RotateCw className="w-3.5 h-3.5" />
                                  <span>Ön Yüze Dön</span>
                                </span>
                              </div>

                              <div className="my-auto py-4 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-xs uppercase font-semibold text-indigo-400 mb-1">Karşılığı / Anlamı</h4>
                                    <p className="text-2xl sm:text-3xl font-extrabold text-white break-words">{cardMeaning}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => speakText(cardMeaning, defLang, e)}
                                    title="Tanımı Dinle"
                                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white transition shrink-0"
                                  >
                                    <Volume2 className="w-5 h-5" />
                                  </button>
                                </div>

                                {cardExEn && (
                                  <div className="pt-3 border-t border-slate-800 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-xs sm:text-sm text-slate-200 italic">&quot;{cardExEn}&quot;</p>
                                      <button
                                        type="button"
                                        onClick={(e) => speakText(cardExEn, termLang, e)}
                                        title="Cümleyi Dinle"
                                        className="p-1 text-slate-400 hover:text-indigo-300 shrink-0"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    {cardExTr && <p className="text-xs text-slate-400 mt-1">{cardExTr}</p>}
                                  </div>
                                )}
                              </div>

                              <div className="text-center text-xs text-slate-500">Kelimeni değerlendirerek ilerleyebilirsin ↓</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* İleri / Geri Navigasyon Kontrolleri */}
                    <div className="flex items-center justify-between w-full mt-4 px-1">
                      <button
                        onClick={handlePrevCard}
                        disabled={currentIndex === 0}
                        className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-300 disabled:opacity-35 disabled:cursor-not-allowed transition shadow-sm"
                        title="Önceki Kart (Sol Ok Tuşu: ←)"
                      >
                        <ChevronLeft className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-semibold">Önceki Kart</span>
                      </button>

                      <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
                        <span className="text-indigo-400 font-bold">{currentIndex + 1}</span>
                        <span>/</span>
                        <span>{cards.length}</span>
                      </div>

                      <button
                        onClick={handleNextCard}
                        disabled={currentIndex + 1 >= cards.length}
                        className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-300 disabled:opacity-35 disabled:cursor-not-allowed transition shadow-sm"
                        title="Sonraki Kart (Sağ Ok Tuşu: →)"
                      >
                        <span className="text-xs font-semibold">Sonraki Kart</span>
                        <ChevronRight className="w-4 h-4 text-indigo-400" />
                      </button>
                    </div>

                    {/* SM-2 Butonları */}
                    {isFlipped && (
                      <div className="w-full grid grid-cols-4 gap-3 mt-4">
                        <button onClick={() => handleRating(1)} className="py-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/20 transition">Hatırlamadım</button>
                        <button onClick={() => handleRating(3)} className="py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20 transition">Zorlandım</button>
                        <button onClick={() => handleRating(4)} className="py-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-500/20 transition">İyi</button>
                        <button onClick={() => handleRating(5)} className="py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 transition">Çok Kolay</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* KART DÜZENLEME (EDIT) MODALI */}
      {isEditingCardModalOpen && editingCardData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Kartı Düzenle</h3>
              </div>
              <button onClick={() => setIsEditingCardModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Kelime / Terim</label>
                    <button type="button" onClick={() => speakText(editingCardData.word, termLang)} className="text-indigo-400 hover:text-white">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingCardData.word}
                    onChange={(e) => setEditingCardData({ ...editingCardData, word: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fonetik</label>
                  <input
                    type="text"
                    value={editingCardData.phonetic}
                    onChange={(e) => setEditingCardData({ ...editingCardData, phonetic: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-indigo-400 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Anlamı / Tanımı *</label>
                <input
                  type="text"
                  required
                  value={editingCardData.translation}
                  onChange={(e) => setEditingCardData({ ...editingCardData, translation: e.target.value })}
                  className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">Örnek Cümle</label>
                  <button type="button" onClick={() => speakText(editingCardData.exampleEn, termLang)} className="text-indigo-400 hover:text-white">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={editingCardData.exampleEn}
                  onChange={(e) => setEditingCardData({ ...editingCardData, exampleEn: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cümlenin Çevirisi</label>
                <textarea
                  rows={2}
                  value={editingCardData.exampleTr}
                  onChange={(e) => setEditingCardData({ ...editingCardData, exampleTr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingCardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="button"
                  disabled={isUpdatingCard || !editingCardData.translation.trim()}
                  onClick={handleUpdateCurrentCard}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm shadow-lg shadow-emerald-600/20"
                >
                  {isUpdatingCard ? <RotateCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KLASÖR OLUŞTURMA MODALI */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <FolderPlus className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Yeni Klasör</h3>
            </div>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Örn: Kuzey, Animals, B2 Sınavı"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
              />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsCreateFolderModalOpen(false)} className="px-4 py-2 text-sm text-slate-400">İptal</button>
                <button type="submit" disabled={!newFolderName.trim()} className="px-5 py-2 bg-indigo-600 rounded-xl text-white text-sm font-semibold">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YENİ DESTE MODALI */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Yeni Deste</h3>
            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Klasör (İsteğe Bağlı)</label>
                <select
                  value={newDeckFolderId}
                  onChange={(e) => setNewDeckFolderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                >
                  <option value="">(Klasörsüz / Genel)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <input type="text" required placeholder="Deste Başlığı" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none" />
              <textarea placeholder="Açıklama" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white resize-none focus:border-indigo-500 outline-none" />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm text-slate-400">İptal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-indigo-600 rounded-xl text-white text-sm font-semibold">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KELİME EKLEME MODALI */}
      {isAddWordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">
                  {enrichedData ? "Kelimeyi Onayla & Kaydet" : "Kelime Ekle"}
                </h3>
              </div>
              <button onClick={() => setIsAddWordModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!enrichedData ? (
              <form onSubmit={handleFetchAiData} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Hedef Deste *</label>
                  <select
                    value={selectedDeckForWord}
                    onChange={(e) => setSelectedDeckForWord(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                  >
                    {decks.length === 0 ? (
                      <option value="">(Önce bir deste oluşturun)</option>
                    ) : (
                      decks.map((d) => {
                        const parentFolder = folders.find((f) => String(f.id).toLowerCase() === String(d.folder_id).toLowerCase());
                        return (
                          <option key={d.id} value={d.id}>
                            {d.title} {activeDeck && activeDeck.id === d.id ? "(Şu an açık)" : parentFolder ? `(📁 ${parentFolder.name})` : "(Genel)"}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>

                {/* DİL SEÇİCİ */}
                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl">
                  <div className="flex items-center space-x-1.5 text-xs text-indigo-400 font-semibold mb-2">
                    <Languages className="w-4 h-4" />
                    <span>DİL SEÇENEKLERİ</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">TERİM DİLİ</label>
                      <select
                        value={termLang}
                        onChange={(e) => setTermLang(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-bold focus:border-indigo-500 outline-none"
                      >
                        {SUPPORTED_LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code}>{l.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">TANIM DİLİ</label>
                      <select
                        value={defLang}
                        onChange={(e) => setDefLang(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-bold focus:border-indigo-500 outline-none"
                      >
                        {SUPPORTED_LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kelime / Terim ({SUPPORTED_LANGUAGES.find((l) => l.code === termLang)?.label}) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={termLang === "de" ? "Örn: die Herausforderung, schön" : termLang === "es" ? "Örn: desarrollar, biblioteca" : "Örn: bullet, resilient, deliberate"}
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">İpucu / Tanım (İsteğe bağlı)</label>
                  <input
                    type="text"
                    placeholder="Kendiniz yazacaksanız buraya doğrudan anlamı da yazabilirsiniz"
                    value={contextHint}
                    onChange={(e) => setContextHint(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* İKİLİ BUTON ÇUBUĞU */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setIsAddWordModalOpen(false)} className="text-xs text-slate-400 hover:text-white order-2 sm:order-1">
                    İptal
                  </button>
                  <div className="flex items-center space-x-2 w-full sm:w-auto order-1 sm:order-2">
                    <button
                      type="button"
                      onClick={handleManualInputMode}
                      disabled={!wordInput.trim() || !selectedDeckForWord}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition disabled:opacity-40"
                    >
                      Kendim Yazacağım ✍️
                    </button>
                    <button
                      type="submit"
                      disabled={isEnriching || !wordInput.trim() || !selectedDeckForWord}
                      className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-xs transition disabled:opacity-40 shadow-lg shadow-indigo-600/30"
                    >
                      {isEnriching ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-white" />}
                      <span>AI ile Anlam Getir</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {correctionNotice && (
                  <div className="flex items-center space-x-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{correctionNotice}</span>
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div>
                    <span className="text-xs text-slate-400 block mb-1.5">Alternatifler:</span>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            setWordInput(sug);
                            runFetchAi(sug);
                          }}
                          className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 rounded-lg text-slate-300 hover:text-white transition"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-slate-400">Terim</label>
                      <button type="button" onClick={() => speakText(enrichedData.word, termLang)} className="text-indigo-400 hover:text-white">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={enrichedData.word}
                      onChange={(e) => setEnrichedData({ ...enrichedData, word: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Fonetik (İsteğe Bağlı)</label>
                    <input
                      type="text"
                      placeholder="/ˈbʊl.ɪt/"
                      value={enrichedData.phonetic}
                      onChange={(e) => setEnrichedData({ ...enrichedData, phonetic: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-indigo-400 focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400">Tanım / Çeviri *</label>
                    <button type="button" onClick={() => speakText(enrichedData.translation, defLang)} className="text-emerald-400 hover:text-white">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Örn: mermi, kurşun"
                    value={enrichedData.translation}
                    onChange={(e) => setEnrichedData({ ...enrichedData, translation: e.target.value })}
                    className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Örnek Cümle (İsteğe Bağlı)</label>
                  <textarea
                    rows={2}
                    placeholder="Örn: The vest is designed to stop bullets."
                    value={enrichedData.exampleEn}
                    onChange={(e) => setEnrichedData({ ...enrichedData, exampleEn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 resize-none focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Cümlenin Çevirisi (İsteğe Bağlı)</label>
                  <textarea
                    rows={2}
                    placeholder="Örn: Yelek, kurşunları durdurmak için tasarlanmıştır."
                    value={enrichedData.exampleTr}
                    onChange={(e) => setEnrichedData({ ...enrichedData, exampleTr: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-400 resize-none focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button onClick={() => setEnrichedData(null)} className="text-xs text-slate-400 hover:text-white">
                    ← Geri Dön
                  </button>
                  <button
                    onClick={handleSaveEditedCard}
                    disabled={isSavingCard || !enrichedData.translation.trim()}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-medium text-sm disabled:opacity-40"
                  >
                    {isSavingCard ? <RotateCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Desteye Kaydet</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}