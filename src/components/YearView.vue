<script setup lang="ts">
import { computed } from 'vue';
import type { Moment } from 'moment';
import { useCalendarStore } from '../stores/calendar';

const props = defineProps<{
  displayedDate: Moment | null;
}>();

const store = useCalendarStore();

const year = computed(() => props.displayedDate?.year() || new Date().getFullYear());
const today = computed(() => {
  try {
    return window.moment ? window.moment() : null;
  } catch {
    return null;
  }
});

const months = [
  { index: 0, short: '1月' },
  { index: 1, short: '2月' },
  { index: 2, short: '3月' },
  { index: 3, short: '4月' },
  { index: 4, short: '5月' },
  { index: 5, short: '6月' },
  { index: 6, short: '7月' },
  { index: 7, short: '8月' },
  { index: 8, short: '9月' },
  { index: 9, short: '10月' },
  { index: 10, short: '11月' },
  { index: 11, short: '12月' },
];

const quarters = [
  { q: 1, months: [0, 1, 2] },
  { q: 2, months: [3, 4, 5] },
  { q: 3, months: [6, 7, 8] },
  { q: 4, months: [9, 10, 11] },
];

function getMonthDate(monthIndex: number): Moment {
  return window.moment().year(year.value).month(monthIndex).date(1);
}

function isCurrentMonth(monthIndex: number): boolean {
  if (!today.value) return false;
  return today.value.year() === year.value && today.value.month() === monthIndex;
}

function isCurrentQuarter(q: number): boolean {
  if (!today.value) return false;
  const currentQuarter = Math.ceil((today.value.month() + 1) / 3);
  return today.value.year() === year.value && currentQuarter === q;
}

function handleMonthClick(monthIndex: number) {
  const date = getMonthDate(monthIndex);
  store.setDisplayedDate(date);
  store.setViewMode('month');
}

function handleYearlyNoteClick() {
  const yearDate = window.moment().year(year.value).startOf('year');
  store.openYearlyNote(yearDate);
}

function handleQuarterNoteClick(q: number) {
  const quarterDate = window.moment().year(year.value).month((q - 1) * 3).date(1).startOf('day');
  store.openQuarterlyNote(quarterDate);
}
</script>

<template>
  <div class="year-view">
    <div class="year-header">
      <button
        v-if="store.settings.yearlyNote.enabled"
        class="year-note-btn"
        @click="handleYearlyNoteClick"
        title="点击打开年度笔记"
      >
        {{ year }}年度笔记
      </button>
      <span v-else class="year-label">{{ year }}年</span>
    </div>

    <div class="year-content">
      <div
        v-for="qData in quarters"
        :key="qData.q"
        class="quarter-card"
        :class="{ current: isCurrentQuarter(qData.q) }"
      >
        <div class="quarter-header">
          <span class="quarter-badge">Q{{ qData.q }}</span>
          <button
            v-if="store.settings.quarterlyNote.enabled"
            class="quarter-note-btn"
            @click="handleQuarterNoteClick(qData.q)"
            title="点击打开季度笔记"
          >
            笔记
          </button>
        </div>
        <div class="quarter-months">
          <button
            v-for="monthIndex in qData.months"
            :key="monthIndex"
            class="month-btn"
            :class="{ current: isCurrentMonth(monthIndex) }"
            @click="handleMonthClick(monthIndex)"
            title="点击查看月份"
          >
            {{ months[monthIndex].short }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.year-view {
  padding: 12px;
}

.year-header {
  text-align: center;
  padding: 8px 0 16px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--background-modifier-border);
}

.year-label {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-normal);
}

.year-note-btn {
  background: var(--interactive-accent);
  border: none;
  color: var(--text-on-accent);
  cursor: pointer;
  padding: 10px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.year-note-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.year-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.quarter-card {
  background: var(--background-secondary);
  border-radius: 12px;
  padding: 16px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.quarter-card.current {
  border-color: var(--interactive-accent);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quarter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.quarter-badge {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.quarter-card.current .quarter-badge {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.quarter-note-btn {
  background: transparent;
  border: 1px solid var(--interactive-accent);
  color: var(--interactive-accent);
  cursor: pointer;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.quarter-note-btn:hover {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
}

.quarter-months {
  display: flex;
  gap: 6px;
}

.month-btn {
  flex: 1;
  background: var(--background-primary);
  border: 2px solid transparent;
  color: var(--text-normal);
  cursor: pointer;
  padding: 12px 4px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;
}

.month-btn:hover {
  background-color: var(--background-modifier-hover);
  border-color: var(--interactive-accent);
  transform: translateY(-2px);
}

.month-btn.current {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
  border-color: var(--interactive-accent);
  transform: scale(1.05);
}
</style>
