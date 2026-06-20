import { create } from 'zustand';

interface StreakState {
  streak: number;
  lastActiveDate: string | null;
  todayCompleted: number;
  dailyGoal: number;
  totalBadges: number;
  achievements: string[];
  checkAndUpdateStreak: () => void;
  incrementTodayCompleted: () => void;
  setDailyGoal: (goal: number) => void;
  unlockAchievement: (id: string) => void;
}

const today = () => new Date().toISOString().split('T')[0];

const loadFromStorage = () => {
  try {
    return {
      streak: parseInt(localStorage.getItem('prepai_streak') || '0'),
      lastActiveDate: localStorage.getItem('prepai_lastActive'),
      todayCompleted: parseInt(localStorage.getItem('prepai_todayCompleted') || '0'),
      dailyGoal: parseInt(localStorage.getItem('prepai_dailyGoal') || '3'),
      achievements: JSON.parse(localStorage.getItem('prepai_achievements') || '[]'),
    };
  } catch {
    return { streak: 0, lastActiveDate: null, todayCompleted: 0, dailyGoal: 3, achievements: [] };
  }
};

export const useStreakStore = create<StreakState>((set, get) => {
  const saved = loadFromStorage();
  return {
    streak: saved.streak,
    lastActiveDate: saved.lastActiveDate,
    todayCompleted: saved.todayCompleted,
    dailyGoal: saved.dailyGoal,
    totalBadges: saved.achievements.length,
    achievements: saved.achievements,

    checkAndUpdateStreak: () => {
      const { lastActiveDate, streak } = get();
      const todayStr = today();
      if (lastActiveDate === todayStr) return; // Already counted today

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak: number;
      if (lastActiveDate === yesterdayStr) {
        newStreak = streak + 1; // Continue streak
      } else if (lastActiveDate === null) {
        newStreak = 1; // First day
      } else {
        newStreak = 1; // Reset — missed a day
      }

      // Reset today's completed count if new day
      const todayCompleted = parseInt(localStorage.getItem('prepai_todayCompleted') || '0');
      const isNewDay = lastActiveDate !== todayStr;

      localStorage.setItem('prepai_streak', String(newStreak));
      localStorage.setItem('prepai_lastActive', todayStr);
      if (isNewDay) {
        localStorage.setItem('prepai_todayCompleted', '0');
      }

      set({
        streak: newStreak,
        lastActiveDate: todayStr,
        todayCompleted: isNewDay ? 0 : todayCompleted,
      });

      // Auto-unlock streak achievements
      const { unlockAchievement } = get();
      if (newStreak >= 1) unlockAchievement('first_day');
      if (newStreak >= 3) unlockAchievement('streak_3');
      if (newStreak >= 7) unlockAchievement('streak_7');
      if (newStreak >= 30) unlockAchievement('streak_30');
    },

    incrementTodayCompleted: () => {
      const { todayCompleted, dailyGoal, unlockAchievement } = get();
      const newCount = todayCompleted + 1;
      localStorage.setItem('prepai_todayCompleted', String(newCount));
      set({ todayCompleted: newCount });

      unlockAchievement('first_answer');
      if (newCount >= dailyGoal) unlockAchievement('daily_goal');
      if (newCount >= 10) unlockAchievement('ten_answers');
    },

    setDailyGoal: (goal: number) => {
      localStorage.setItem('prepai_dailyGoal', String(goal));
      set({ dailyGoal: goal });
    },

    unlockAchievement: (id: string) => {
      const { achievements } = get();
      if (achievements.includes(id)) return;
      const next = [...achievements, id];
      localStorage.setItem('prepai_achievements', JSON.stringify(next));
      set({ achievements: next, totalBadges: next.length });
    },
  };
});
