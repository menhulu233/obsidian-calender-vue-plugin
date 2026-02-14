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
const yearTitle = computed(() => props.displayedDate?.format?.('YYYY') || '');

const weekdays = computed(() => {
  const moment = window.moment;
  const startOfWeek = moment().startOf('week');
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(startOfWeek.clone().add(i, 'day').format('ddd'));
  }
  return days;
});

const calendarDays = computed(() => {
  if (!props.displayedDate) return [];

  const moment = window.moment;
  const startOfMonth = props.displayedDate.clone().startOf('month');
  const endOfMonth = props.displayedDate.clone().endOf('month');
  const startOfCalendar = startOfMonth.clone().startOf('week');
  const endOfCalendar = endOfMonth.clone().endOf('week');

  const days: {
    date: Moment;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  let current = startOfCalendar.clone();
  while (current.isSameOrBefore(endOfCalendar, 'day')) {
    const isCurrentMonth = current.month() === startOfMonth.month();
    const isToday = today.value ? current.isSame(today.value, 'day') : false;

    days.push({
      date: current.clone(),
      isCurrentMonth,
      isToday,
    });

    current.add(1, 'day');
  }

  return days;
});

const weekRows = computed(() => {
  const rows: typeof calendarDays.value[] = [];
  const days = calendarDays.value;

  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }

  return rows;
});

function handleDayClick(date: Moment) {
  store.openDailyNote(date);
}

function handleYearClick() {
  store.setViewMode('year');
}

function handleMonthlyNoteClick() {
  if (props.displayedDate) {
    store.openMonthlyNote(props.displayedDate);
  }
}
</script>

<template>
  <div class="month-view">
    <div class="month-header">
      <button
        v-if="store.settings.yearlyNote.enabled"
        class="note-btn"
        @click="handleYearClick"
        title="点击查看年度"
      >
        {{ yearTitle }}年
      </button>
      <button
        v-if="store.settings.monthlyNote.enabled"
        class="note-btn primary"
        @click="handleMonthlyNoteClick"
        title="点击打开月度笔记"
      >
        月度笔记
      </button>
    </div>

    <div class="calendar-grid">
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      </div>

      <div class="days">
        <div v-for="(row, rowIndex) in weekRows" :key="rowIndex" class="week-row">
          <div
            v-for="day in row"
            :key="day.date.format('YYYY-MM-DD')"
            class="day"
            :class="{
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
            }"
            @click="handleDayClick(day.date)"
          >
            <span class="day-num">{{ day.date.date() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.month-view {
  display: flex;
  flex-direction: column;
}

.month-header {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  gap: 12px;
  border-bottom: 1px solid var(--background-modifier-border);
}

.note-btn {
  background: var(--background-secondary);
  border: 2px solid transparent;
  color: var(--text-accent);
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.note-btn:hover {
  background-color: var(--background-modifier-hover);
  border-color: var(--interactive-accent);
}

.note-btn.primary {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
}

.note-btn.primary:hover {
  filter: brightness(1.1);
}

.calendar-grid {
  padding: 12px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  padding: 8px 0;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.day {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
  background: var(--background-secondary);
  border: 2px solid transparent;
}

.day:hover {
  background-color: var(--background-modifier-hover);
  border-color: var(--interactive-accent);
  transform: translateY(-1px);
}

.day.other-month {
  opacity: 0.3;
}

.day.today {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
  border-color: var(--interactive-accent);
  transform: scale(1.1);
  font-weight: 600;
}

.day-num {
  font-size: 14px;
  font-weight: 500;
}
</style>
