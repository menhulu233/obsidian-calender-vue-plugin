<script setup lang="ts">
import { computed } from 'vue';
import type { Moment } from 'moment';
import { useCalendarStore } from '../stores/calendar';

const props = defineProps<{
  displayedDate: Moment | null;
}>();

const store = useCalendarStore();

const today = computed(() => {
  try {
    return window.moment ? window.moment() : null;
  } catch {
    return null;
  }
});
const weekStart = computed(() => props.displayedDate?.clone()?.startOf?.('week') || null);
const weekNumber = computed(() => props.displayedDate?.format?.('w') || '');
const year = computed(() => props.displayedDate?.year() || new Date().getFullYear());

const days = computed(() => {
  if (!weekStart.value) return [];

  const result: { date: Moment; isToday: boolean; weekdayName: string; dayNum: number }[] = [];
  const weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];

  for (let i = 0; i < 7; i++) {
    const date = weekStart.value.clone().add(i, 'day');
    result.push({
      date,
      isToday: today.value ? date.isSame(today.value, 'day') : false,
      weekdayName: weekdayNames[date.day()],
      dayNum: date.date(),
    });
  }

  return result;
});

function handleDayClick(date: Moment) {
  store.openDailyNote(date);
}

function handleWeeklyNoteClick() {
  if (weekStart.value) {
    store.openWeeklyNote(weekStart.value);
  }
}
</script>

<template>
  <div class="week-view">
    <!-- 周度笔记入口 -->
    <div v-if="store.settings.weeklyNote.enabled" class="week-header">
      <button class="weekly-note-btn" @click="handleWeeklyNoteClick" title="点击打开周度笔记">
        {{ year }}年 W{{ weekNumber }} 周度笔记
      </button>
    </div>

    <div class="week-content">
      <div class="week-days">
        <div
          v-for="day in days"
          :key="day.date.format('YYYY-MM-DD')"
          class="week-day"
          :class="{ today: day.isToday }"
          @click="handleDayClick(day.date)"
        >
          <div class="weekday-name">{{ day.weekdayName }}</div>
          <div class="day-num">{{ day.dayNum }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.week-view {
  padding: 12px;
}

.week-header {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--background-modifier-border);
}

.weekly-note-btn {
  background: var(--interactive-accent);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-on-accent);
  font-size: 14px;
  font-weight: 600;
}

.weekly-note-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.week-content {
  display: flex;
  justify-content: center;
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 500px;
}

.week-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--background-secondary);
  border: 2px solid transparent;
}

.week-day:hover {
  background-color: var(--background-modifier-hover);
  border-color: var(--interactive-accent);
  transform: translateY(-2px);
}

.week-day.today {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
  border-color: var(--interactive-accent);
  transform: scale(1.05);
}

.weekday-name {
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 6px;
  font-weight: 500;
}

.day-num {
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
}
</style>
