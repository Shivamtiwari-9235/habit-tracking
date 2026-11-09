"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  frequency: "daily" | "weekdays" | "3x_week";
  completedDates: string[]; // Set of YYYY-MM-DD local calendar dates
  isArchived: boolean;
}

interface PulseBackup {
  version: number;
  exportedAt: string;
  theme: "light" | "dark";
  habits: Habit[];
}

const STORAGE_KEY = "pulse_habits_v1";
const THEME_STORAGE_KEY = "pulse_theme_v1";
const SOUND_STORAGE_KEY = "pulse_sound_v1";
const MISSED_BANNER_KEY = "pulse_dismissed_missed_banner_date";

const COLOR_OPTIONS = [
  { name: "Forest Sage", value: "#2D6A4F", dark: "#52B788" },
  { name: "Warm Ochre", value: "#D97706", dark: "#F59E0B" },
  { name: "Dusky Rose", value: "#BE123C", dark: "#FB7185" },
  { name: "Nordic Sky", value: "#0284C7", dark: "#38BDF8" },
  { name: "Deep Indigo", value: "#6366F1", dark: "#818CF8" },
  { name: "Fresh Emerald", value: "#059669", dark: "#34D399" },
];

interface EmojiItem {
  emoji: string;
  name: string;
  keywords: string[];
}

interface EmojiCategory {
  id: string;
  label: string;
  icon: string;
  emojis: EmojiItem[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "popular",
    label: "Rhythms & Habits",
    icon: "⚡",
    emojis: [
      { emoji: "🌿", name: "herb", keywords: ["plant", "nature", "calm", "zen", "growth"] },
      { emoji: "🧘", name: "meditation", keywords: ["mindfulness", "zen", "peace", "yoga", "breath"] },
      { emoji: "📖", name: "reading", keywords: ["book", "study", "learning", "pages", "literature"] },
      { emoji: "💧", name: "hydration", keywords: ["water", "drink", "health", "hydrate", "clean"] },
      { emoji: "🏃", name: "running", keywords: ["cardio", "jog", "exercise", "walk", "pace"] },
      { emoji: "✍️", name: "journaling", keywords: ["writing", "notes", "diary", "author", "thoughts"] },
      { emoji: "☕", name: "morning ritual", keywords: ["coffee", "tea", "caffeine", "warm", "ritual"] },
      { emoji: "🌙", name: "rest", keywords: ["sleep", "night", "moon", "evening", "recover"] },
      { emoji: "🎯", name: "focus", keywords: ["target", "goals", "aim", "productivity", "priorities"] },
      { emoji: "🥗", name: "nutrition", keywords: ["salad", "healthy", "food", "greens", "diet"] },
      { emoji: "💤", name: "deep sleep", keywords: ["nap", "bed", "rest", "recovery", "slumber"] },
      { emoji: "🧠", name: "mental clarity", keywords: ["brain", "focus", "memory", "intellect", "learn"] },
      { emoji: "🏋️", name: "strength", keywords: ["weights", "gym", "workout", "fitness", "lift"] },
      { emoji: "🚶", name: "daily walk", keywords: ["steps", "stroll", "fresh air", "outdoors"] },
      { emoji: "🚴", name: "cycling", keywords: ["biking", "commute", "cardio", "wheels"] },
      { emoji: "💊", name: "supplements", keywords: ["vitamins", "medicine", "health", "routine"] },
    ],
  },
  {
    id: "wellness",
    label: "Movement & Body",
    icon: "🏃",
    emojis: [
      { emoji: "🏊", name: "swimming", keywords: ["pool", "cardio", "laps", "water"] },
      { emoji: "🧗", name: "climbing", keywords: ["bouldering", "active", "mountain", "grip"] },
      { emoji: "⚽", name: "soccer", keywords: ["football", "sports", "game", "match"] },
      { emoji: "🎾", name: "tennis", keywords: ["racket", "match", "court", "serve"] },
      { emoji: "🥋", name: "discipline", keywords: ["martial arts", "karate", "judo", "focus"] },
      { emoji: "🛹", name: "skate", keywords: ["board", "outdoors", "cruise"] },
      { emoji: "🥊", name: "boxing", keywords: ["combat", "punch", "training", "gloves"] },
      { emoji: "🏸", name: "badminton", keywords: ["shuttle", "game", "rally"] },
      { emoji: "🏌️", name: "golf", keywords: ["green", "course", "swing"] },
      { emoji: "🤿", name: "diving", keywords: ["snorkeling", "ocean", "explore"] },
      { emoji: "🏆", name: "milestone", keywords: ["trophy", "win", "achievement", "goal"] },
      { emoji: "🥇", name: "consistency", keywords: ["medal", "first", "gold", "streak"] },
    ],
  },
  {
    id: "mind",
    label: "Mind & Spirit",
    icon: "✨",
    emojis: [
      { emoji: "✨", name: "sparkles", keywords: ["magic", "clean", "fresh", "shine", "clarity"] },
      { emoji: "🕊️", name: "peace", keywords: ["dove", "serenity", "calm", "gentle"] },
      { emoji: "☀️", name: "sunlight", keywords: ["sun", "morning", "light", "dawn", "vitality"] },
      { emoji: "🔥", name: "momentum", keywords: ["flame", "streak", "energy", "passion", "drive"] },
      { emoji: "⭐", name: "excellence", keywords: ["star", "favorite", "quality", "shine"] },
      { emoji: "💖", name: "gratitude", keywords: ["heart", "love", "kindness", "care"] },
      { emoji: "🤍", name: "serenity", keywords: ["white heart", "purity", "peace", "calm"] },
      { emoji: "😌", name: "contentment", keywords: ["relieved", "calm", "satisfied", "ease"] },
      { emoji: "🥳", name: "celebration", keywords: ["milestone", "happy", "party", "accomplish"] },
      { emoji: "🙌", name: "praise", keywords: ["hands", "gratitude", "celebrate", "win"] },
      { emoji: "💡", name: "inspiration", keywords: ["idea", "insight", "creative", "bulb"] },
      { emoji: "🕯️", name: "mindful pause", keywords: ["candle", "ritual", "quiet", "meditation"] },
    ],
  },
  {
    id: "nourish",
    label: "Nourish & Fuel",
    icon: "🍎",
    emojis: [
      { emoji: "🍵", name: "green tea", keywords: ["tea", "matcha", "warm", "sip", "antioxidant"] },
      { emoji: "🍏", name: "fresh apple", keywords: ["fruit", "healthy", "snack", "crisp"] },
      { emoji: "🥑", name: "whole foods", keywords: ["avocado", "healthy fats", "nutrition"] },
      { emoji: "🥦", name: "clean greens", keywords: ["broccoli", "vegetable", "greens", "fiber"] },
      { emoji: "🥕", name: "vegetables", keywords: ["carrot", "healthy", "snack", "vitamins"] },
      { emoji: "🍳", name: "home cooked", keywords: ["cooking", "breakfast", "meal", "protein"] },
      { emoji: "🥣", name: "nourish bowl", keywords: ["oatmeal", "breakfast", "cereal", "grains"] },
      { emoji: "🍊", name: "citrus", keywords: ["orange", "vitamin c", "immune", "fresh"] },
      { emoji: "🍌", name: "energy", keywords: ["banana", "potassium", "snack", "fuel"] },
      { emoji: "🫐", name: "berries", keywords: ["blueberries", "antioxidants", "superfood"] },
      { emoji: "🫖", name: "herbal infusion", keywords: ["teapot", "calm", "herbal", "soothe"] },
      { emoji: "🥛", name: "hydration & milk", keywords: ["drink", "calcium", "refuel"] },
    ],
  },
  {
    id: "lifestyle",
    label: "Craft & Order",
    icon: "🎨",
    emojis: [
      { emoji: "🎨", name: "creativity", keywords: ["art", "paint", "create", "draw", "hobby"] },
      { emoji: "🎵", name: "music", keywords: ["listen", "audio", "song", "playlist", "rhythm"] },
      { emoji: "🎸", name: "practice", keywords: ["guitar", "instrument", "rehearse", "chords"] },
      { emoji: "🎹", name: "harmony", keywords: ["piano", "keys", "practice", "music"] },
      { emoji: "💻", name: "deep work", keywords: ["code", "programming", "laptop", "focus", "build"] },
      { emoji: "📷", name: "presence", keywords: ["camera", "photo", "memory", "shot", "capture"] },
      { emoji: "🧹", name: "clean space", keywords: ["tidy", "chores", "declutter", "order"] },
      { emoji: "🚿", name: "refresh", keywords: ["shower", "clean", "hygiene", "morning"] },
      { emoji: "🧺", name: "life admin", keywords: ["laundry", "routine", "chores", "order"] },
      { emoji: "🪴", name: "plant care", keywords: ["houseplant", "water plants", "green", "nurture"] },
      { emoji: "⏰", name: "time discipline", keywords: ["clock", "wake up", "punctual", "routine"] },
      { emoji: "📅", name: "weekly review", keywords: ["calendar", "schedule", "plan", "reflect"] },
    ],
  },
];

// --- Local Calendar Day Utilities ---
function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPreviousDateString(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

function getNextDateString(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + 1);
  return getLocalDateString(d);
}

// Calculate current streak and all-time best streak
function calculateStreaks(completedDates: string[]): {
  currentStreak: number;
  bestStreak: number;
} {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const dateSet = new Set(completedDates);
  const today = getLocalDateString();
  const yesterday = getPreviousDateString(today);

  // 1. Current Consecutive Streak Calculation
  let currentStreak = 0;
  let checkDate: string | null = null;

  if (dateSet.has(today)) {
    checkDate = today;
  } else if (dateSet.has(yesterday)) {
    checkDate = yesterday;
  }

  if (checkDate) {
    while (dateSet.has(checkDate)) {
      currentStreak++;
      checkDate = getPreviousDateString(checkDate);
    }
  }

  // 2. Best Streak Calculation
  const sortedDates = Array.from(dateSet).sort();
  let maxRun = 0;
  let currentRun = 0;
  let prevDate: string | null = null;

  for (const d of sortedDates) {
    if (!prevDate) {
      currentRun = 1;
    } else {
      const expectedNext = getNextDateString(prevDate);
      if (d === expectedNext) {
        currentRun++;
      } else {
        currentRun = 1;
      }
    }
    if (currentRun > maxRun) {
      maxRun = currentRun;
    }
    prevDate = d;
  }

  const bestStreak = Math.max(maxRun, currentStreak);

  return { currentStreak, bestStreak };
}

interface HeatmapDay {
  date: string;
  formattedDate: string;
  isToday: boolean;
}

// Returns 12 columns (weeks), each containing 7 days (total 84 days ending on today)
function getHeatmapWeeks(): HeatmapDay[][] {
  const weeks: HeatmapDay[][] = [];
  const today = new Date();
  const todayStr = getLocalDateString(today);

  for (let w = 0; w < 12; w++) {
    const weekDays: HeatmapDay[] = [];
    for (let d = 0; d < 7; d++) {
      const offset = 83 - (w * 7 + d);
      const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      const dateStr = getLocalDateString(target);
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(target);

      weekDays.push({
        date: dateStr,
        formattedDate,
        isToday: dateStr === todayStr,
      });
    }
    weeks.push(weekDays);
  }

  return weeks;
}

// Play pleasant synthetic micro-chime via Web Audio API (Zero external assets)
function playGentleChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Peaceful harmonic chord frequencies (F# -> A#)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Audio context not allowed or blocked; silently ignore
  }
}

// Validate imported JSON backup structure safely
function validateBackup(json: unknown): {
  valid: boolean;
  error?: string;
  data?: PulseBackup;
} {
  if (!json || typeof json !== "object") {
    return { valid: false, error: "The file is not a valid JSON object." };
  }

  const record = json as Record<string, unknown>;
  let habitsRaw = record.habits;

  if (!habitsRaw && Array.isArray(json)) {
    habitsRaw = json;
  }

  if (!Array.isArray(habitsRaw)) {
    return { valid: false, error: 'Backup file must contain a "habits" array.' };
  }

  const validatedHabits: Habit[] = [];

  for (let i = 0; i < habitsRaw.length; i++) {
    const h = habitsRaw[i];
    if (!h || typeof h !== "object") {
      return { valid: false, error: `Habit item #${i + 1} is corrupted or empty.` };
    }

    const hObj = h as Record<string, unknown>;

    if (typeof hObj.name !== "string" || !hObj.name.trim()) {
      return { valid: false, error: `Habit #${i + 1} is missing a valid name.` };
    }
    if (typeof hObj.color !== "string" || !hObj.color.trim()) {
      return { valid: false, error: `Habit "${hObj.name}" is missing a valid color.` };
    }

    const id = typeof hObj.id === "string" ? hObj.id : String(Date.now() + i);
    const emoji = typeof hObj.emoji === "string" ? hObj.emoji : "🌿";
    const frequency =
      hObj.frequency === "weekdays" || hObj.frequency === "3x_week"
        ? hObj.frequency
        : "daily";
    const isArchived = Boolean(hObj.isArchived);
    const completedDates = Array.isArray(hObj.completedDates)
      ? hObj.completedDates.filter((d): d is string => typeof d === "string")
      : [];

    validatedHabits.push({
      id,
      name: hObj.name.trim(),
      emoji,
      color: hObj.color,
      frequency,
      completedDates,
      isArchived,
    });
  }

  const themeCandidate = record.theme;
  const validTheme: "light" | "dark" =
    themeCandidate === "light" || themeCandidate === "dark" ? themeCandidate : "dark";

  return {
    valid: true,
    data: {
      version: typeof record.version === "number" ? record.version : 1,
      exportedAt: typeof record.exportedAt === "string" ? record.exportedAt : new Date().toISOString(),
      theme: validTheme,
      habits: validatedHabits,
    },
  };
}

export default function PulseDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Tab Filtering: "all" | "remaining" | "completed" | "archived"
  const [activeTab, setActiveTab] = useState<"all" | "remaining" | "completed" | "archived">("all");

  // Summary Gauge View Mode: "today" | "weekly"
  const [summaryMode, setSummaryMode] = useState<"today" | "weekly">("today");

  // Satisfying Click Animation / Particle State (< 400ms)
  const [animatingCheckHabitId, setAnimatingCheckHabitId] = useState<string | null>(null);

  // Gentle Missed-Yesterday Banner State
  const [showMissedBanner, setShowMissedBanner] = useState(false);

  // React State for Habits & Hydration Gate
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // Modal Form State
  const [habitName, setHabitName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🌿");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [selectedFrequency, setSelectedFrequency] = useState<"daily" | "weekdays" | "3x_week">("daily");

  // WhatsApp-style Emoji Picker State
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiSearchQuery, setEmojiSearchQuery] = useState("");
  const [activeEmojiCategory, setActiveEmojiCategory] = useState("popular");

  // Tooltip Hover State for Heatmap Cells
  const [hoveredCell, setHoveredCell] = useState<{
    habitId: string;
    text: string;
  } | null>(null);

  // Import / Export State
  const [importStatusMessage, setImportStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [pendingImportData, setPendingImportData] = useState<PulseBackup | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-calculate 12-week heatmap grid structure (84 days)
  const heatmapWeeks = useMemo(() => getHeatmapWeeks(), []);

  // 1. Initial Load: Read habits, sound preference and theme from localStorage or fallback to system preference
  useEffect(() => {
    try {
      // System Theme Default Detection
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "light") {
        setIsDarkMode(false);
      } else if (savedTheme === "dark") {
        setIsDarkMode(true);
      } else if (typeof window !== "undefined" && window.matchMedia) {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setIsDarkMode(systemPrefersDark);
      }

      // Restore Sound preference
      const savedSound = localStorage.getItem(SOUND_STORAGE_KEY);
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true");
      }

      // Check if missed banner was already dismissed today
      const todayStr = getLocalDateString();
      const dismissedDate = localStorage.getItem(MISSED_BANNER_KEY);
      if (dismissedDate !== todayStr) {
        setShowMissedBanner(true);
      }

      // Restore Habits data
      const savedHabits = localStorage.getItem(STORAGE_KEY);
      if (savedHabits) {
        const parsed = JSON.parse(savedHabits);
        const validation = validateBackup({ habits: parsed });
        if (validation.valid && validation.data) {
          setHabits(validation.data.habits);
        }
      }
    } catch (err) {
      console.error("Pulse: Error restoring data from localStorage:", err);
    } finally {
      setIsStorageLoaded(true);
    }
  }, []);

  // 2. Persistence: Save habits to localStorage whenever habits state changes
  useEffect(() => {
    if (!isStorageLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch (err) {
      console.error("Pulse: Error saving habits to localStorage:", err);
    }
  }, [habits, isStorageLoaded]);

  // 3. Theme Synchronization: Update root DOM element and persist theme choice
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem(THEME_STORAGE_KEY, "dark");
      } catch {}
    } else {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem(THEME_STORAGE_KEY, "light");
      } catch {}
    }
  }, [isDarkMode]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [isModalOpen]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setIsEmojiPickerOpen(false);
      }
    };
    if (isEmojiPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEmojiPickerOpen]);

  // Handle Escape key to close modals or popovers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEmojiPickerOpen) {
          setIsEmojiPickerOpen(false);
        } else if (pendingImportData) {
          setPendingImportData(null);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isModalOpen) {
          closeHabitModal();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEmojiPickerOpen, isModalOpen, isSettingsOpen, pendingImportData]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Formatted date string for clean editorial header
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const todayStr = getLocalDateString();
  const yesterdayStr = getPreviousDateString(todayStr);

  // One-tap check-in toggle with satisfying <400ms micro-animation & tactile audio
  const toggleHabitCompletion = (habitId: string) => {
    const isCurrentlyDone = habits.find((h) => h.id === habitId)?.completedDates.includes(todayStr);

    if (!isCurrentlyDone) {
      setAnimatingCheckHabitId(habitId);
      if (soundEnabled) playGentleChime();
      setTimeout(() => setAnimatingCheckHabitId(null), 380);
    }

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const isDoneToday = habit.completedDates.includes(todayStr);
        const updatedDates = isDoneToday
          ? habit.completedDates.filter((d) => d !== todayStr)
          : [...habit.completedDates, todayStr];

        return {
          ...habit,
          completedDates: updatedDates,
        };
      })
    );
  };

  // Archive / Unarchive toggle
  const toggleArchiveHabit = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, isArchived: !h.isArchived } : h
      )
    );
  };

  // Open modal in Create mode
  const openCreateModal = () => {
    setEditingHabitId(null);
    setHabitName("");
    setSelectedEmoji("🌿");
    setSelectedColor(COLOR_OPTIONS[0].value);
    setSelectedFrequency("daily");
    setIsModalOpen(true);
  };

  // Open modal in Edit mode
  const openEditModal = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setHabitName(habit.name);
    setSelectedEmoji(habit.emoji);
    setSelectedColor(habit.color);
    setSelectedFrequency(habit.frequency || "daily");
    setIsModalOpen(true);
  };

  const closeHabitModal = () => {
    setIsModalOpen(false);
    setEditingHabitId(null);
    setHabitName("");
    setSelectedEmoji("🌿");
    setSelectedColor(COLOR_OPTIONS[0].value);
    setSelectedFrequency("daily");
    setIsEmojiPickerOpen(false);
    setEmojiSearchQuery("");
  };

  // Delete habit handler
  const handleDeleteHabit = (habitId: string, habitName: string) => {
    if (window.confirm(`Delete habit "${habitName}"? This cannot be undone.`)) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
    }
  };

  // Dismiss gentle missed banner
  const dismissMissedBanner = () => {
    setShowMissedBanner(false);
    try {
      localStorage.setItem(MISSED_BANNER_KEY, todayStr);
    } catch {}
  };

  // Export Backup Handler
  const handleExportBackup = () => {
    try {
      const backupData: PulseBackup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        theme: isDarkMode ? "dark" : "light",
        habits,
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json;charset=utf-8;" });
      const downloadUrl = URL.createObjectURL(blob);
      const fileName = `pulse-backup-${getLocalDateString()}.json`;

      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = downloadUrl;
      downloadAnchor.download = fileName;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(downloadUrl);

      setImportStatusMessage({
        type: "success",
        text: `Exported ${habits.length} habits to ${fileName}`,
      });
    } catch (err) {
      console.error("Export failed:", err);
      setImportStatusMessage({
        type: "error",
        text: "Failed to generate export file.",
      });
    }
  };

  // Import Backup File Select Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatusMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const validation = validateBackup(parsed);

        if (!validation.valid || !validation.data) {
          setImportStatusMessage({
            type: "error",
            text: validation.error || "Corrupted or invalid JSON backup file.",
          });
          return;
        }

        setPendingImportData(validation.data);
      } catch (parseErr) {
        setImportStatusMessage({
          type: "error",
          text: "Invalid file format. Please select a valid JSON backup file.",
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      setImportStatusMessage({
        type: "error",
        text: "Could not read the selected file.",
      });
    };

    reader.readAsText(file);
  };

  // Confirm & Apply Import
  const handleConfirmImport = () => {
    if (!pendingImportData) return;

    try {
      const { habits: restoredHabits, theme: restoredTheme } = pendingImportData;

      setHabits(restoredHabits);
      if (restoredTheme === "light") {
        setIsDarkMode(false);
      } else if (restoredTheme === "dark") {
        setIsDarkMode(true);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredHabits));
      if (restoredTheme) {
        localStorage.setItem(THEME_STORAGE_KEY, restoredTheme);
      }

      setPendingImportData(null);
      setImportStatusMessage({
        type: "success",
        text: `Successfully restored ${restoredHabits.length} habits and history!`,
      });
    } catch (err) {
      console.error("Error applying import:", err);
      setImportStatusMessage({
        type: "error",
        text: "Failed to save restored data to storage.",
      });
    }
  };

  // Filtered emojis based on search query
  const filteredEmojis = useMemo(() => {
    const q = emojiSearchQuery.trim().toLowerCase();
    if (!q) {
      const activeCat = EMOJI_CATEGORIES.find((c) => c.id === activeEmojiCategory);
      return activeCat ? activeCat.emojis : EMOJI_CATEGORIES[0].emojis;
    }

    const matches: EmojiItem[] = [];
    const seen = new Set<string>();

    for (const cat of EMOJI_CATEGORIES) {
      for (const item of cat.emojis) {
        if (seen.has(item.emoji)) continue;
        const nameMatch = item.name.toLowerCase().includes(q);
        const keywordMatch = item.keywords.some((k) => k.toLowerCase().includes(q));
        if (nameMatch || keywordMatch) {
          seen.add(item.emoji);
          matches.push(item);
        }
      }
    }
    return matches;
  }, [emojiSearchQuery, activeEmojiCategory]);

  // Active (non-archived) vs Archived habits
  const activeHabits = useMemo(() => habits.filter((h) => !h.isArchived), [habits]);
  const archivedHabits = useMemo(() => habits.filter((h) => h.isArchived), [habits]);

  // Today's Progress Statistics
  const completedTodayCount = activeHabits.filter((h) => h.completedDates.includes(todayStr)).length;
  const activeCount = activeHabits.length;
  const todayCompletionPercentage =
    activeCount > 0 ? Math.round((completedTodayCount / activeCount) * 100) : 0;
  const isAllCompleted = activeCount > 0 && completedTodayCount === activeCount;

  // Best Overall Streak across all active habits
  const bestOverallStreak = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    return Math.max(...activeHabits.map((h) => calculateStreaks(h.completedDates).bestStreak), 0);
  }, [activeHabits]);

  // Weekly Summary Ring: Past 7 days completion percentage
  const past7Days = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      days.push(getLocalDateString(d));
    }
    return days;
  }, []);

  const weeklyStats = useMemo(() => {
    if (activeHabits.length === 0) return { percentage: 0, completed: 0, total: 0 };
    const totalPossible = activeHabits.length * 7;
    let completedTotal = 0;

    for (const habit of activeHabits) {
      for (const d of past7Days) {
        if (habit.completedDates.includes(d)) {
          completedTotal++;
        }
      }
    }

    const percentage = Math.round((completedTotal / totalPossible) * 100);
    return { percentage, completed: completedTotal, total: totalPossible };
  }, [activeHabits, past7Days]);

  // Did the user miss habits yesterday?
  const hadMissedYesterday = useMemo(() => {
    if (activeHabits.length === 0) return false;
    const completedYesterday = activeHabits.filter((h) => h.completedDates.includes(yesterdayStr)).length;
    return completedYesterday < activeHabits.length && completedTodayCount === 0;
  }, [activeHabits, yesterdayStr, completedTodayCount]);

  // Filtered habits for active tab
  const displayedHabits = useMemo(() => {
    if (activeTab === "archived") {
      return archivedHabits;
    }
    if (activeTab === "completed") {
      return activeHabits.filter((h) => h.completedDates.includes(todayStr));
    }
    if (activeTab === "remaining") {
      return activeHabits.filter((h) => !h.completedDates.includes(todayStr));
    }
    return activeHabits;
  }, [activeHabits, archivedHabits, activeTab, todayStr]);

  // Handle Habit Save (Create or Edit)
  const handleSaveHabit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = habitName.trim();
    if (!trimmedName) return;

    if (editingHabitId) {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === editingHabitId
            ? {
                ...h,
                name: trimmedName,
                emoji: selectedEmoji || "🌿",
                color: selectedColor,
                frequency: selectedFrequency,
              }
            : h
        )
      );
    } else {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: trimmedName,
        emoji: selectedEmoji || "🌿",
        color: selectedColor,
        frequency: selectedFrequency,
        completedDates: [],
        isArchived: false,
      };
      setHabits((prev) => [...prev, newHabit]);
    }

    closeHabitModal();
  };

  const handleOpenModalWithRitual = (ritualName: string, defaultEmoji?: string) => {
    setEditingHabitId(null);
    setHabitName(ritualName);
    if (defaultEmoji) setSelectedEmoji(defaultEmoji);
    setSelectedFrequency("daily");
    setIsModalOpen(true);
  };

  // Progress Circle Geometry for Today vs Weekly
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const activeGaugePercentage =
    summaryMode === "today" ? todayCompletionPercentage : weeklyStats.percentage;
  const strokeDashoffset =
    circumference - (activeGaugePercentage / 100) * circumference;

  return (
    <main className="min-h-screen bg-[#F8F9FA] text-[#111827] transition-colors duration-300 dark:bg-[#0C0E0D] dark:text-[#F4F5F4] antialiased selection:bg-[#2D6A4F]/20 selection:text-[#2D6A4F] dark:selection:bg-[#52B788]/20 dark:selection:text-[#52B788]">
      {/* Top Global Command Bar: Full Width Luxury Nav */}
      <nav className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/80 backdrop-blur-md dark:border-[#222824] dark:bg-[#0C0E0D]/80 transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2D6A4F] opacity-60 duration-1000 dark:bg-[#52B788] motion-reduce:animate-none" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2D6A4F] shadow-xs dark:bg-[#52B788]" />
            </div>
            <span className="text-body font-bold tracking-tight text-[#111827] dark:text-[#F4F5F4]">
              Pulse
            </span>
            <span className="hidden sm:inline-block rounded-full bg-stone-200/80 px-2 py-0.5 font-mono text-[10px] font-medium text-stone-600 dark:bg-[#1E2320] dark:text-stone-400">
              v1.4 Luxury Edition
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Progress Pill in Nav */}
            {activeCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 font-mono text-xs dark:border-[#2A2F2C] dark:bg-[#141715]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2D6A4F] dark:bg-[#52B788]" />
                <span className="text-stone-600 dark:text-stone-300">
                  {completedTodayCount} of {activeCount} checked
                </span>
              </div>
            )}

            {/* Audio Feedback Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              aria-label={soundEnabled ? "Mute completion chime" : "Enable completion chime"}
              title={soundEnabled ? "Sound enabled (click to mute)" : "Sound muted (click to enable)"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-2xs transition-all hover:border-stone-300 hover:text-stone-900 active:scale-95 dark:border-[#2A2F2C] dark:bg-[#141715] dark:text-stone-300 dark:hover:border-stone-600 dark:hover:text-white"
            >
              {soundEnabled ? (
                <span className="text-xs">🔔</span>
              ) : (
                <span className="text-xs opacity-50">🔕</span>
              )}
            </button>

            {/* Backup & Settings Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setImportStatusMessage(null);
                setPendingImportData(null);
                setIsSettingsOpen(true);
              }}
              aria-label="Backup and data settings"
              title="Backup & Restore Data (JSON)"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-2xs transition-all hover:border-stone-300 hover:text-stone-900 active:scale-95 dark:border-[#2A2F2C] dark:bg-[#141715] dark:text-stone-300 dark:hover:border-stone-600 dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 2v20" />
                <path d="m17 5-5-3-5 3" />
                <path d="m17 19-5 3-5-3" />
                <path d="M2 12h20" />
                <path d="m5 7-3 5 3 5" />
                <path d="m19 7 3 5-3 5" />
              </svg>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-2xs transition-all hover:border-stone-300 hover:text-stone-900 active:scale-95 dark:border-[#2A2F2C] dark:bg-[#141715] dark:text-stone-300 dark:hover:border-stone-600 dark:hover:text-white"
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-amber-400"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-stone-700"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Adaptive Workspace: Mobile Single Column & Desktop Dual Column Command Center */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Adaptive 2-Column Responsive Grid on Desktop / Tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN (Desktop: 5 cols): Executive Summary & Analytics Overview */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* Editorial Greeting Header */}
            <section className="space-y-1.5">
              <p className="font-mono text-caption uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {todayFormatted}
              </p>
              <h1 className="text-display font-semibold tracking-tight text-[#111827] dark:text-[#F4F5F4]">
                Good morning.
              </h1>
              <p className="text-body text-stone-600 dark:text-stone-300 leading-relaxed">
                {activeCount === 0
                  ? "Your slate is quiet today. Steady momentum begins with a single intention."
                  : isAllCompleted
                  ? "All habits checked for today. Take a mindful breath and enjoy your rhythm."
                  : `${completedTodayCount} of ${activeCount} completed. Keep a gentle, sustainable pace.`}
              </p>
            </section>

            {/* Gentle "Missed Yesterday" Guilt-Free Banner */}
            {hadMissedYesterday && showMissedBanner && (
              <aside className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-[#2A2F2C] dark:bg-[#141715]">
                <div className="flex items-start gap-3">
                  <span className="text-base leading-none mt-0.5">🌱</span>
                  <div>
                    <h4 className="text-body-sm font-semibold text-[#111827] dark:text-[#F4F5F4]">
                      A gentle reset for today
                    </h4>
                    <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      Real consistency isn&apos;t unbroken perfection; it&apos;s simply returning to your rhythm without guilt.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={dismissMissedBanner}
                  aria-label="Dismiss banner"
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1"
                >
                  ✕
                </button>
              </aside>
            )}

            {/* Today's & Weekly Summary Card with Concentric Radial Gauge */}
            <section
              className={`relative overflow-hidden rounded-2xl border bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 dark:bg-[#141715] ${
                isAllCompleted && summaryMode === "today"
                  ? "border-[#2D6A4F]/40 shadow-md ring-1 ring-[#2D6A4F]/20 dark:border-[#52B788]/40 dark:ring-[#52B788]/20"
                  : "border-stone-200/90 dark:border-[#2A2F2C]"
              }`}
            >
              {/* Header with Mode Toggle */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 dark:border-[#222824]">
                <div>
                  <h2 className="text-title-md font-semibold text-[#111827] dark:text-[#F4F5F4]">
                    {summaryMode === "today" ? "Today's Rhythm" : "Weekly Summary"}
                  </h2>
                  <p className="text-body-sm text-stone-500 dark:text-stone-400">
                    {summaryMode === "today" ? "Daily completion overview" : "Past 7 days completion rate"}
                  </p>
                </div>

                {/* View Toggle Pill */}
                <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-0.5 dark:border-[#2A2F2C] dark:bg-[#1C201D]">
                  <button
                    type="button"
                    onClick={() => setSummaryMode("today")}
                    className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold transition-all ${
                      summaryMode === "today"
                        ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-white"
                        : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setSummaryMode("weekly")}
                    className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold transition-all ${
                      summaryMode === "weekly"
                        ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-white"
                        : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                    }`}
                  >
                    Weekly
                  </button>
                </div>
              </div>

              {/* Progress Content */}
              {activeCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#2D6A4F]/30 bg-[#2D6A4F]/10 dark:border-[#52B788]/30 dark:bg-[#52B788]/10">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <h3 className="text-body font-semibold text-[#111827] dark:text-[#F4F5F4]">
                    No habits created yet
                  </h3>
                  <p className="mt-1 text-xs text-stone-600 dark:text-stone-300 max-w-[240px]">
                    Create your first ritual or pick a starter habit below.
                  </p>
                </div>
              ) : (
                <div className="pt-5 space-y-4">
                  <div className="flex items-center gap-4">
                    {/* Concentric Progress Ring */}
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                      <svg className="h-20 w-20 -rotate-90 transform" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r={radius}
                          strokeWidth="5"
                          className="text-stone-200 dark:text-[#222824]"
                          stroke="currentColor"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r={radius}
                          strokeWidth="5"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="text-[#2D6A4F] transition-all duration-700 ease-out dark:text-[#52B788] motion-reduce:transition-none"
                          stroke="currentColor"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute font-mono text-sm font-bold text-[#111827] dark:text-[#F4F5F4]">
                        {activeGaugePercentage}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-body font-semibold text-[#111827] dark:text-[#F4F5F4]">
                        {summaryMode === "today"
                          ? isAllCompleted
                            ? "All daily rituals completed!"
                            : `${activeCount - completedTodayCount} habit${
                                activeCount - completedTodayCount === 1 ? "" : "s"
                              } remaining`
                          : `${weeklyStats.completed} of ${weeklyStats.total} check-ins`}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {summaryMode === "today"
                          ? `${completedTodayCount} of ${activeCount} completed today`
                          : "Calculated across trailing 7 calendar days"}
                      </p>
                    </div>
                  </div>

                  {/* Linear Progress Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-[#202522]">
                    <div
                      className="h-full bg-[#2D6A4F] transition-all duration-700 ease-out dark:bg-[#52B788] motion-reduce:transition-none"
                      style={{ width: `${activeGaugePercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Quick Executive Stats Grid */}
            {activeCount > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs dark:border-[#2A2F2C] dark:bg-[#141715]">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Active Rituals
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-[#111827] dark:text-[#F4F5F4]">
                    {activeCount}
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs dark:border-[#2A2F2C] dark:bg-[#141715]">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Best Streak
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-[#D97706] dark:text-[#F59E0B]">
                    🔥 {bestOverallStreak}d
                  </p>
                </div>
              </div>
            )}

            {/* Starter Rituals Inspiration Panel */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-[#2A2F2C] dark:bg-[#141715]">
              <p className="font-mono text-caption uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Starter Rituals
              </p>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                Tap to quickly begin building a calm habit.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { name: "10m Morning Walk", emoji: "🏃" },
                  { name: "Read 15 Pages", emoji: "📖" },
                  { name: "Hydrate (2L)", emoji: "💧" },
                  { name: "Evening Journal", emoji: "✍️" },
                ].map((ritual) => (
                  <button
                    type="button"
                    key={ritual.name}
                    onClick={() => handleOpenModalWithRitual(ritual.name, ritual.emoji)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-2xs transition-all hover:border-[#2D6A4F] hover:bg-white hover:text-stone-900 active:scale-95 cursor-pointer dark:border-[#333C36] dark:bg-[#1C201D] dark:text-stone-300 dark:hover:border-[#52B788] dark:hover:text-white"
                  >
                    <span>{ritual.emoji}</span>
                    <span>{ritual.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop: 7 cols): Habit Cards, Heatmaps & Feed */}
          <div className="lg:col-span-7 space-y-4">
            {/* Action Bar: Filter Tabs & Primary "+ New Habit" CTA */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-stone-200/80 dark:border-[#222824]">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 sm:gap-2">
                {[
                  { key: "all", label: "All", count: activeCount },
                  { key: "remaining", label: "Pending", count: activeCount - completedTodayCount },
                  { key: "completed", label: "Done", count: completedTodayCount },
                  ...(archivedHabits.length > 0
                    ? [{ key: "archived", label: "Archived", count: archivedHabits.length }]
                    : []),
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key as typeof activeTab)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-stone-900 text-white shadow-2xs dark:bg-white dark:text-stone-900"
                          : "text-stone-600 hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-[#1E2320] dark:hover:text-stone-200"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                          isActive
                            ? "bg-stone-700 text-white dark:bg-stone-200 dark:text-stone-900"
                            : "bg-stone-200 text-stone-700 dark:bg-[#2A2F2C] dark:text-stone-300"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Primary "+ New Habit" Action Button */}
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2D6A4F] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#22523D] hover:shadow-md active:scale-95 cursor-pointer dark:bg-[#52B788] dark:text-[#0C0E0D] dark:hover:bg-[#40916C]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                <span>New Ritual</span>
              </button>
            </div>

            {/* Habit Cards Feed */}
            <div className="space-y-4">
              {displayedHabits.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-200 bg-white/60 p-10 text-center dark:border-[#2A2F2C] dark:bg-[#141715]/60">
                  <p className="text-body-sm text-stone-500 dark:text-stone-400">
                    {habits.length === 0
                      ? "No habits created yet. Tap 'New Ritual' above to begin."
                      : `No habits matching the "${activeTab}" filter.`}
                  </p>
                </div>
              ) : (
                displayedHabits.map((habit) => {
                  const isDone = habit.completedDates.includes(todayStr);
                  const isAnimating = animatingCheckHabitId === habit.id;
                  const { currentStreak, bestStreak } = calculateStreaks(habit.completedDates);

                  // Count completed days in the 84-day window
                  const allHeatmapDays = heatmapWeeks.flat();
                  const completedInWindow = allHeatmapDays.filter((d) =>
                    habit.completedDates.includes(d.date)
                  ).length;

                  return (
                    <article
                      key={habit.id}
                      className={`group relative flex flex-col rounded-2xl border p-5 transition-all duration-200 ${
                        isDone
                          ? "border-[#2D6A4F]/30 bg-[#F2F8F5] shadow-2xs dark:border-[#52B788]/25 dark:bg-[#14291E]/50"
                          : "border-stone-200/90 bg-white shadow-xs hover:border-stone-300 hover:shadow-md dark:border-[#2A2F2C] dark:bg-[#141715] dark:hover:border-stone-700 dark:hover:shadow-dark-elevated"
                      }`}
                    >
                      {/* Top Row: Habit Meta, Streak, & Action Button */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {/* Selected Emoji Badge in Accent Swatch */}
                          <div
                            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl transition-transform duration-200 ${
                              isDone ? "opacity-75" : "group-hover:scale-105"
                            }`}
                            style={{
                              backgroundColor: `${habit.color}15`,
                              borderColor: `${habit.color}40`,
                            }}
                          >
                            <span className="leading-none">{habit.emoji}</span>
                            <span
                              className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-white dark:border-[#141715] shadow-xs"
                              style={{ backgroundColor: habit.color }}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`text-body font-semibold truncate transition-all ${
                                  isDone
                                    ? "text-stone-500 line-through opacity-75 dark:text-stone-400"
                                    : "text-[#111827] dark:text-[#F4F5F4]"
                                }`}
                              >
                                {habit.name}
                              </h3>

                              {/* Habit Action Buttons: Edit, Archive, Delete */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(habit)}
                                  title="Edit habit"
                                  aria-label={`Edit ${habit.name}`}
                                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-1 rounded-md"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-3.5 w-3.5"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                  </svg>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleArchiveHabit(habit.id)}
                                  title={habit.isArchived ? "Unarchive habit" : "Archive habit"}
                                  aria-label={habit.isArchived ? "Unarchive habit" : "Archive habit"}
                                  className="text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors p-1 rounded-md"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-3.5 w-3.5"
                                  >
                                    <polyline points="21 8 21 21 3 21 3 8" />
                                    <rect width="22" height="5" x="1" y="3" />
                                    <line x1="10" x2="14" y1="12" y2="12" />
                                  </svg>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteHabit(habit.id, habit.name)}
                                  title="Delete habit"
                                  aria-label={`Delete ${habit.name}`}
                                  className="text-stone-400 hover:text-red-500 transition-colors p-1 rounded-md"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-3.5 w-3.5"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-caption font-mono">
                              <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{ backgroundColor: habit.color }}
                              />
                              <span
                                className={`transition-colors ${
                                  isDone
                                    ? "text-[#2D6A4F] font-semibold dark:text-[#52B788]"
                                    : "text-stone-500 dark:text-stone-400"
                                }`}
                              >
                                {isDone
                                  ? "Completed today"
                                  : habit.frequency === "weekdays"
                                  ? "Weekdays only"
                                  : habit.frequency === "3x_week"
                                  ? "3x / week"
                                  : "Daily rhythm"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Group: Streaks Display & Animated Check Button */}
                        <div className="flex items-center gap-3 shrink-0">
                          {/* Streak Badge */}
                          <div className="flex flex-col items-end">
                            <div
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-caption transition-all ${
                                currentStreak > 0
                                  ? "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] shadow-2xs dark:bg-[#2A1D0B] dark:text-[#FBBF24] dark:border-[#78350F]/40"
                                  : "bg-stone-100 text-stone-500 border border-stone-200 dark:bg-[#1E2320] dark:text-stone-400 dark:border-[#2E3530]"
                              }`}
                              title={`Current streak: ${currentStreak} day${currentStreak === 1 ? "" : "s"}`}
                            >
                              <span className="text-xs leading-none">🔥</span>
                              <span className="font-semibold">{currentStreak}</span>
                              <span className="text-[10px] text-stone-600 dark:text-stone-400">
                                {currentStreak === 1 ? "day" : "days"}
                              </span>
                            </div>

                            <span
                              className="mt-0.5 font-mono text-[10px] text-stone-500 dark:text-stone-400"
                              title={`All-time best streak: ${bestStreak} days`}
                            >
                              best:{" "}
                              <span className="font-semibold text-stone-700 dark:text-stone-200">
                                {bestStreak}d
                              </span>
                            </span>
                          </div>

                          {/* Minimal Circular Check Button with Satisfying Micro-Animation */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => toggleHabitCompletion(habit.id)}
                              aria-label={`Mark ${habit.name} as ${
                                isDone ? "incomplete" : "complete"
                              }`}
                              className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] dark:focus-visible:ring-[#52B788] ${
                                isDone
                                  ? "border-transparent bg-[#2D6A4F] text-white shadow-sm dark:bg-[#52B788] dark:text-[#0C0E0D]"
                                  : "border-stone-300 bg-white hover:border-[#2D6A4F] hover:scale-105 dark:border-stone-600 dark:bg-transparent dark:hover:border-[#52B788]"
                              } ${isAnimating ? "scale-115" : ""}`}
                            >
                              {isDone ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4 animate-in zoom-in-50 duration-150 motion-reduce:animate-none"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                <div
                                  className="h-2 w-2 rounded-full opacity-30 transition-opacity group-hover:opacity-80"
                                  style={{ backgroundColor: habit.color }}
                                />
                              )}
                            </button>

                            {/* Micro Confetti Particle Burst (<400ms) */}
                            {isAnimating && (
                              <div className="pointer-events-none absolute inset-0 -m-2 flex items-center justify-center motion-reduce:hidden">
                                {[0, 60, 120, 180, 240, 300].map((deg) => (
                                  <span
                                    key={deg}
                                    className="absolute h-1.5 w-1.5 rounded-full animate-ping opacity-90 duration-300"
                                    style={{
                                      backgroundColor: habit.color,
                                      transform: `rotate(${deg}deg) translate(18px)`,
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 12-Week Activity Heatmap (GitHub Style) */}
                      <div className="mt-4 pt-3.5 border-t border-stone-200/80 dark:border-[#222824]">
                        <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-stone-500 dark:text-stone-400">
                          <span className="flex items-center gap-1.5 font-medium">
                            <span
                              className="inline-block h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: habit.color }}
                            />
                            12-Week History
                          </span>
                          <span>{completedInWindow} / 84 days</span>
                        </div>

                        {/* Grid of 12 Weeks (Columns) x 7 Days (Rows) with safe scrolling */}
                        <div className="flex items-center justify-between gap-[3px] overflow-x-auto py-1 scrollbar-none">
                          {heatmapWeeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-[3px]">
                              {week.map((day) => {
                                const isDayDone = habit.completedDates.includes(day.date);
                                const statusLabel = isDayDone ? "Completed" : "No activity";
                                const tooltipText = `${day.formattedDate} • ${statusLabel}`;

                                return (
                                  <div
                                    key={day.date}
                                    tabIndex={0}
                                    role="gridcell"
                                    aria-label={tooltipText}
                                    title={tooltipText}
                                    onMouseEnter={() =>
                                      setHoveredCell({
                                        habitId: habit.id,
                                        text: tooltipText,
                                      })
                                    }
                                    onMouseLeave={() => setHoveredCell(null)}
                                    onFocus={() =>
                                      setHoveredCell({
                                        habitId: habit.id,
                                        text: tooltipText,
                                      })
                                    }
                                    onBlur={() => setHoveredCell(null)}
                                    className={`h-2.5 w-2.5 rounded-[2px] transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] ${
                                      isDayDone
                                        ? "scale-[1.05]"
                                        : "bg-stone-200 hover:bg-stone-300 dark:bg-[#1E2320] dark:hover:bg-[#2A312C]"
                                    } ${
                                      day.isToday
                                        ? "ring-1 ring-stone-500 dark:ring-stone-400"
                                        : ""
                                    }`}
                                    style={
                                      isDayDone
                                        ? {
                                            backgroundColor: habit.color,
                                            boxShadow: `0 0 4px ${habit.color}40`,
                                          }
                                        : undefined
                                    }
                                  />
                                );
                              })}
                            </div>
                          ))}
                        </div>

                        {/* Interactive Tooltip & Status Readout */}
                        <div className="mt-1.5 flex h-4 items-center justify-between text-[10px] font-mono text-stone-500 dark:text-stone-400">
                          <span className="truncate">
                            {hoveredCell?.habitId === habit.id
                              ? hoveredCell.text
                              : "Hover or focus day for details"}
                          </span>
                          <span className="shrink-0 text-stone-400 dark:text-stone-500">
                            Today →
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <footer className="mt-16 pt-8 border-t border-stone-200/80 text-center space-y-2 dark:border-[#222824]">
          <p className="font-mono text-caption text-stone-600 dark:text-stone-400">
            Pulse • Built with calm intention for sustainable daily rhythms
          </p>
          <div className="flex items-center justify-center gap-4 font-mono text-xs text-stone-500 dark:text-stone-400">
            <button
              type="button"
              onClick={() => {
                setImportStatusMessage(null);
                setPendingImportData(null);
                setIsSettingsOpen(true);
              }}
              className="hover:text-[#2D6A4F] dark:hover:text-[#52B788] underline transition-colors cursor-pointer"
            >
              Backup & Restore Data (JSON)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={toggleSound}
              className="hover:text-[#2D6A4F] dark:hover:text-[#52B788] transition-colors cursor-pointer"
            >
              Sound: {soundEnabled ? "On" : "Muted"}
            </button>
          </div>
        </footer>
      </div>

      {/* Hidden File Input for JSON Backup Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Backup & Settings Modal */}
      {isSettingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            onClick={() => {
              if (!pendingImportData) {
                setIsSettingsOpen(false);
              }
            }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 dark:bg-black/75"
          />

          {/* Settings Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl transition-all dark:border-[#333C36] dark:bg-[#141715] dark:shadow-dark-floating"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-[#222824]">
              <div>
                <h2
                  id="settings-title"
                  className="text-title-md font-semibold tracking-tight text-[#111827] dark:text-[#F4F5F4]"
                >
                  Data Backup & Restore
                </h2>
                <p className="mt-1 text-body-sm text-stone-600 dark:text-stone-300">
                  Export or restore your habits, streaks, and completion history.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPendingImportData(null);
                  setIsSettingsOpen(false);
                }}
                aria-label="Close settings"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-[#1C201D] dark:hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Status Messages */}
            {importStatusMessage && (
              <div
                className={`mt-4 rounded-xl p-3.5 text-body-sm flex items-start gap-2.5 transition-all ${
                  importStatusMessage.type === "success"
                    ? "bg-[#E8F3ED] text-[#2D6A4F] border border-[#2D6A4F]/30 dark:bg-[#14291E] dark:text-[#52B788]"
                    : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60"
                }`}
              >
                <span className="text-base leading-none">
                  {importStatusMessage.type === "success" ? "✓" : "⚠️"}
                </span>
                <span className="flex-1">{importStatusMessage.text}</span>
              </div>
            )}

            {/* Confirmation Dialog Stage before Replacing Existing Data */}
            {pendingImportData ? (
              <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700/60 dark:bg-amber-950/30">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h3 className="text-body font-semibold text-amber-900 dark:text-amber-200">
                      Confirm Data Replacement
                    </h3>
                    <p className="mt-1 text-body-sm text-amber-800 dark:text-amber-300/90 leading-relaxed">
                      This will replace your current{" "}
                      <strong className="font-semibold">{habits.length}</strong> habit(s) with{" "}
                      <strong className="font-semibold">
                        {pendingImportData.habits.length}
                      </strong>{" "}
                      habit(s) from the backup file. Current data cannot be undone unless exported
                      first.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2.5 pt-3 border-t border-amber-200 dark:border-amber-800/40">
                  <button
                    type="button"
                    onClick={() => setPendingImportData(null)}
                    className="rounded-lg px-3.5 py-1.5 text-body-sm font-medium text-stone-600 transition-colors hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    className="rounded-lg bg-amber-600 px-4 py-1.5 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-700 active:scale-[0.98] cursor-pointer"
                  >
                    Confirm & Replace
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {/* Export Card */}
                <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 transition-colors dark:border-[#2A2F2C] dark:bg-[#1C201D]/70">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-body font-semibold text-[#111827] dark:text-[#F4F5F4]">
                        Export Backup
                      </h4>
                      <p className="mt-0.5 text-body-sm text-stone-500 dark:text-stone-400">
                        Download a JSON snapshot of your habits, completion dates, streaks, and
                        theme.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-4 py-2.5 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-[#22523D] hover:shadow-md active:scale-[0.98] cursor-pointer dark:bg-[#52B788] dark:text-[#0C0E0D] dark:hover:bg-[#40916C]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download pulse-backup-{todayStr}.json</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 transition-colors dark:border-[#2A2F2C] dark:bg-[#1C201D]/70">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-body font-semibold text-[#111827] dark:text-[#F4F5F4]">
                        Import Backup
                      </h4>
                      <p className="mt-0.5 text-body-sm text-stone-500 dark:text-stone-400">
                        Restore from a verified Pulse JSON backup. Validates format before updating.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-stone-300 bg-white px-4 py-2.5 text-body-sm font-semibold text-stone-700 shadow-2xs transition-all hover:border-[#2D6A4F] hover:bg-stone-50 hover:text-stone-900 cursor-pointer dark:border-[#333C36] dark:bg-[#141715] dark:text-stone-200 dark:hover:border-[#52B788] dark:hover:bg-[#1A1D1B]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-[#2D6A4F] dark:text-[#52B788]"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Select JSON Backup File</span>
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-4 flex items-center justify-end pt-3 border-t border-stone-200 dark:border-[#222824]">
              <button
                type="button"
                onClick={() => {
                  setPendingImportData(null);
                  setIsSettingsOpen(false);
                }}
                className="rounded-lg px-4 py-2 text-body-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-[#1C201D] dark:hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Habit Creation & Editing Modal (Bottom sheet on mobile, centered on desktop) */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 max-sm:items-end max-sm:p-0"
        >
          {/* Backdrop */}
          <div
            onClick={closeHabitModal}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 dark:bg-black/75"
          />

          {/* Modal Container */}
          <form
            onSubmit={handleSaveHabit}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-visible rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl transition-all max-sm:rounded-b-none max-sm:border-b-0 dark:border-[#333C36] dark:bg-[#141715] dark:shadow-dark-floating"
          >
            {/* Header: Title & Close Button */}
            <div className="flex items-start justify-between pb-4">
              <div>
                <h2
                  id="modal-title"
                  className="text-title-md font-semibold tracking-tight text-[#111827] dark:text-[#F4F5F4]"
                >
                  {editingHabitId ? "Edit Habit" : "Create a New Habit"}
                </h2>
                <p className="mt-1 text-body-sm text-stone-600 dark:text-stone-300">
                  {editingHabitId
                    ? "Update your intention, cadence, or accent color."
                    : "Define a simple intention to build steady momentum."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeHabitModal}
                aria-label="Close dialog"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-[#1C201D] dark:hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Live Clean Preview Card */}
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-[#333C36] dark:bg-[#1C201D]">
              <div
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs text-base"
                style={{
                  backgroundColor: `${selectedColor}18`,
                  borderColor: `${selectedColor}40`,
                }}
              >
                <span>{selectedEmoji}</span>
                <span
                  className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-white dark:border-[#1C201D] shadow-xs"
                  style={{ backgroundColor: selectedColor }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-caption uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Preview
                </p>
                <p className="truncate text-body font-semibold text-[#111827] dark:text-[#F4F5F4]">
                  {habitName.trim() || (
                    <span className="italic font-normal text-stone-400 dark:text-stone-500">
                      Habit title will appear here...
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 py-1">
              {/* WhatsApp-Style Combined Habit Name & Emoji Trigger */}
              <div className="relative">
                <label
                  htmlFor="habit-name"
                  className="block font-mono text-caption uppercase tracking-wider text-stone-600 dark:text-stone-400"
                >
                  Habit Name & Emoji
                </label>

                <div className="mt-1.5 flex items-center gap-2">
                  {/* WhatsApp-style Smiley Trigger Button */}
                  <div className="relative" ref={emojiPickerRef}>
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                      aria-label="Pick an emoji"
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 text-xl transition-all ${
                        isEmojiPickerOpen
                          ? "border-[#2D6A4F] bg-[#E8F3ED] ring-2 ring-[#2D6A4F]/20 dark:border-[#52B788] dark:bg-[#14291E]"
                          : "border-stone-300 bg-stone-100 hover:border-[#2D6A4F] hover:bg-white dark:border-[#333C36] dark:bg-[#1C201D] dark:hover:border-[#52B788] dark:hover:bg-[#101311]"
                      }`}
                    >
                      <span className="leading-none">{selectedEmoji}</span>
                    </button>

                    {/* WhatsApp-Style Searchable Popover Panel */}
                    {isEmojiPickerOpen && (
                      <div className="absolute left-0 bottom-full sm:bottom-auto sm:top-13 mb-2 sm:mb-0 z-50 w-72 sm:w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:bg-[#1A1D1B] dark:border-[#333C36] dark:shadow-dark-floating animate-in fade-in-50 zoom-in-95 duration-150">
                        {/* Search Input Bar */}
                        <div className="p-2.5 border-b border-stone-200 dark:border-[#2A2F2C]">
                          <div className="relative flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="absolute left-2.5 h-3.5 w-3.5 text-stone-400"
                            >
                              <circle cx="11" cy="11" r="8" />
                              <path d="m21 21-4.3-4.3" />
                            </svg>
                            <input
                              type="text"
                              value={emojiSearchQuery}
                              onChange={(e) => setEmojiSearchQuery(e.target.value)}
                              placeholder="Search emoji (e.g. walk, read, water)..."
                              className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-7 text-body-sm text-[#111827] placeholder:text-stone-400 focus:border-[#2D6A4F] focus:outline-none dark:bg-[#141715] dark:border-[#333C36] dark:text-[#F4F5F4]"
                              autoFocus
                            />
                            {emojiSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setEmojiSearchQuery("")}
                                className="absolute right-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Category Navigation Bar */}
                        {!emojiSearchQuery && (
                          <div className="flex items-center justify-between px-2 py-1.5 border-b border-stone-200 bg-stone-50/70 dark:border-[#2A2F2C] dark:bg-[#141715]">
                            {EMOJI_CATEGORIES.map((cat) => {
                              const isActive = activeEmojiCategory === cat.id;
                              return (
                                <button
                                  type="button"
                                  key={cat.id}
                                  onClick={() => setActiveEmojiCategory(cat.id)}
                                  title={cat.label}
                                  className={`flex h-7 w-7 items-center justify-center rounded-md text-sm transition-all ${
                                    isActive
                                      ? "bg-[#E8F3ED] text-[#2D6A4F] border border-[#2D6A4F]/40 font-bold dark:bg-[#14291E] dark:text-[#52B788]"
                                      : "text-stone-600 hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-[#242A26] dark:hover:text-white"
                                  }`}
                                >
                                  <span>{cat.icon}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Emoji Grid */}
                        <div className="max-h-52 overflow-y-auto p-2.5 scrollbar-thin">
                          {filteredEmojis.length === 0 ? (
                            <div className="py-6 text-center">
                              <p className="text-body-sm text-stone-400">
                                No emojis found for &quot;{emojiSearchQuery}&quot;
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-6 sm:grid-cols-7 gap-1">
                              {filteredEmojis.map((item) => {
                                const isSelected = selectedEmoji === item.emoji;
                                return (
                                  <button
                                    type="button"
                                    key={item.name + item.emoji}
                                    onClick={() => {
                                      setSelectedEmoji(item.emoji);
                                      setIsEmojiPickerOpen(false);
                                      setEmojiSearchQuery("");
                                    }}
                                    title={item.name}
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                                      isSelected
                                        ? "bg-[#E8F3ED] border border-[#2D6A4F] scale-105 dark:bg-[#14291E] dark:border-[#52B788]"
                                        : "hover:bg-stone-100 hover:scale-110 active:scale-95 dark:hover:bg-[#242A26]"
                                    }`}
                                  >
                                    <span className="leading-none">{item.emoji}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Footer Tip */}
                        <div className="flex items-center justify-between px-3 py-1.5 border-t border-stone-200 bg-stone-50 dark:border-[#2A2F2C] dark:bg-[#141715]">
                          <span className="font-mono text-[10px] text-stone-500 dark:text-stone-400">
                            {emojiSearchQuery
                              ? `${filteredEmojis.length} results`
                              : EMOJI_CATEGORIES.find((c) => c.id === activeEmojiCategory)?.label}
                          </span>
                          <span className="font-mono text-[10px] text-stone-400">
                            Click to select
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* High-Contrast Habit Name Input */}
                  <input
                    ref={nameInputRef}
                    id="habit-name"
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    placeholder="e.g. 15-Minute Morning Reading"
                    className="h-11 flex-1 rounded-xl border-2 border-stone-300 bg-[#F3F4F3] px-3.5 text-body font-medium text-[#111827] placeholder:text-stone-500 transition-colors focus:border-[#2D6A4F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/25 dark:border-[#333C36] dark:bg-[#1C201D] dark:text-[#F4F5F4] dark:placeholder:text-[#8E9992] dark:focus:border-[#52B788] dark:focus:bg-[#101311]"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Target Cadence / Frequency Selector */}
              <div>
                <label className="block font-mono text-caption uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Target Cadence
                </label>
                <div className="mt-1.5 flex gap-2">
                  {[
                    { key: "daily", label: "Every Day" },
                    { key: "weekdays", label: "Weekdays" },
                    { key: "3x_week", label: "3x / week" },
                  ].map((freq) => {
                    const isSelected = selectedFrequency === freq.key;
                    return (
                      <button
                        type="button"
                        key={freq.key}
                        onClick={() => setSelectedFrequency(freq.key as typeof selectedFrequency)}
                        className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all ${
                          isSelected
                            ? "border-[#2D6A4F] bg-[#E8F3ED] text-[#2D6A4F] dark:border-[#52B788] dark:bg-[#14291E] dark:text-[#52B788]"
                            : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300 dark:border-[#2A2F2C] dark:bg-[#1C201D] dark:text-stone-300"
                        }`}
                      >
                        {freq.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette Selector */}
              <div>
                <label className="block font-mono text-caption uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Accent Color
                </label>
                <div className="mt-2 flex items-center gap-3">
                  {COLOR_OPTIONS.map((color) => {
                    const isSelected = selectedColor === color.value;
                    return (
                      <button
                        type="button"
                        key={color.name}
                        onClick={() => setSelectedColor(color.value)}
                        aria-label={`Select ${color.name} color`}
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-transform ${
                          isSelected ? "scale-110" : "hover:scale-105"
                        }`}
                      >
                        <span
                          className="h-6 w-6 rounded-full shadow-xs"
                          style={{ backgroundColor: color.value }}
                        />
                        {isSelected && (
                          <span
                            className="absolute inset-0 rounded-full border-2 border-stone-900 ring-2 ring-offset-2 ring-offset-white dark:border-white dark:ring-offset-[#141715]"
                            style={{ borderColor: color.value }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-[#222824]">
              <button
                type="button"
                onClick={closeHabitModal}
                className="rounded-xl px-4 py-2 text-body-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-[#1C201D] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!habitName.trim()}
                className="rounded-xl bg-[#2D6A4F] px-5 py-2 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-[#22523D] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer dark:bg-[#52B788] dark:text-[#0C0E0D] dark:hover:bg-[#40916C]"
              >
                {editingHabitId ? "Update Habit" : "Create Habit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
