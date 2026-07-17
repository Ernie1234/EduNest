import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  STREAK_FREEZE_MONTHLY_ALLOWANCE,
  STREAK_MILESTONES,
} from './streak.constants';
import { UseStreakFreezeDto } from './dto/use-streak-freeze.dto';

/** UTC-based truncation so this always agrees with dateKey()'s
 * `toISOString().slice(0, 10)` regardless of server timezone. */
function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

@Injectable()
export class StreakService {
  constructor(private readonly prisma: PrismaService) {}

  async getStreakSummary(studentId: string) {
    const [activities, freezeUses] = await Promise.all([
      this.prisma.studyActivity.findMany({ where: { studentId } }),
      this.prisma.streakFreezeUse.findMany({ where: { studentId } }),
    ]);

    const activeDates = new Set(
      activities.filter((a) => a.meetsThreshold).map((a) => dateKey(a.activityDate)),
    );
    const frozenDates = new Set(freezeUses.map((f) => dateKey(f.forDate)));
    const countedDates = new Set([...activeDates, ...frozenDates]);

    const today = startOfDay(new Date());
    let cursor = today;
    if (!countedDates.has(dateKey(cursor))) {
      // Today isn't done yet — that shouldn't break the streak, so start counting from yesterday.
      cursor = addDays(cursor, -1);
    }

    let currentStreak = 0;
    while (countedDates.has(dateKey(cursor))) {
      currentStreak++;
      cursor = addDays(cursor, -1);
    }

    const longestStreak = this.longestRun(countedDates);
    const totalStudyDays = activeDates.size;

    const freezesUsedThisMonth = freezeUses.filter((f) => isSameMonth(f.forDate, today)).length;
    const freezesLeftThisMonth = Math.max(
      0,
      STREAK_FREEZE_MONTHLY_ALLOWANCE - freezesUsedThisMonth,
    );

    const thisWeek = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i - 6);
      return { date: dateKey(date), active: countedDates.has(dateKey(date)) };
    });

    const milestones = STREAK_MILESTONES.map((m) => ({
      days: m.days,
      label: m.label,
      achieved: currentStreak >= m.days || longestStreak >= m.days,
      daysToGo: Math.max(0, m.days - currentStreak),
    }));

    return {
      currentStreak,
      longestStreak,
      totalStudyDays,
      freezesLeftThisMonth,
      thisWeek,
      milestones,
    };
  }

  async useFreeze(studentId: string, dto: UseStreakFreezeDto) {
    const today = startOfDay(new Date());
    const forDate = dto.forDate ? startOfDay(new Date(dto.forDate)) : addDays(today, -1);

    if (forDate >= today) {
      throw new BadRequestException('Can only freeze a day that has already passed');
    }

    const [activity, existingFreeze, freezesThisMonth] = await Promise.all([
      this.prisma.studyActivity.findUnique({
        where: { studentId_activityDate: { studentId, activityDate: forDate } },
      }),
      this.prisma.streakFreezeUse.findUnique({
        where: { studentId_forDate: { studentId, forDate } },
      }),
      this.prisma.streakFreezeUse.findMany({ where: { studentId } }),
    ]);

    if (activity?.meetsThreshold) {
      throw new BadRequestException('That day already counts toward your streak');
    }
    if (existingFreeze) {
      throw new BadRequestException('That day is already covered by a freeze');
    }

    const usedThisMonth = freezesThisMonth.filter((f) => isSameMonth(f.forDate, forDate)).length;
    if (usedThisMonth >= STREAK_FREEZE_MONTHLY_ALLOWANCE) {
      throw new BadRequestException('No streak freezes left this month');
    }

    return this.prisma.streakFreezeUse.create({ data: { studentId, forDate } });
  }

  private longestRun(dates: Set<string>): number {
    const sorted = Array.from(dates).sort();
    let longest = 0;
    let current = 0;
    let previous: Date | null = null;

    for (const key of sorted) {
      const date = new Date(key);
      if (previous && dateKey(addDays(previous, 1)) === key) {
        current++;
      } else {
        current = 1;
      }
      longest = Math.max(longest, current);
      previous = date;
    }
    return longest;
  }
}
