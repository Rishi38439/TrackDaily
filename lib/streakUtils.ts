import { Activity } from '@/types/activity';

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function getLocalDayKey(timestamp: number): number {
  const date = new Date(timestamp);
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

function getUniqueDayKeys(activities: Activity[]): number[] {
  const todayKey = getLocalDayKey(Date.now());

  return Array.from(
    new Set(
      activities
        .filter((activity) => Number.isFinite(activity.timestamp) && activity.timestamp <= Date.now())
        .map((activity) => getLocalDayKey(activity.timestamp))
        .filter((dayKey) => dayKey <= todayKey),
    ),
  ).sort((left, right) => left - right);
}

export function calculateStreakStats(activities: Activity[]): StreakStats {
  const uniqueDayKeys = getUniqueDayKeys(activities);

  if (uniqueDayKeys.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let currentChain = 1;

  for (let index = 1; index < uniqueDayKeys.length; index += 1) {
    if (uniqueDayKeys[index] === uniqueDayKeys[index - 1] + 1) {
      currentChain += 1;
      longestStreak = Math.max(longestStreak, currentChain);
    } else {
      currentChain = 1;
    }
  }

  const todayKey = getLocalDayKey(Date.now());
  let currentStreak = 0;

  if (uniqueDayKeys[uniqueDayKeys.length - 1] === todayKey) {
    currentStreak = 1;

    for (let index = uniqueDayKeys.length - 2; index >= 0; index -= 1) {
      if (uniqueDayKeys[index] === uniqueDayKeys[index + 1] - 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
  };
}
