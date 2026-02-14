<script setup lang="ts">
import { computed } from 'vue';
import type { Moment } from 'moment';
import { useCalendarStore } from '../stores/calendar';

const props = defineProps<{
  displayedDate: Moment | null;
}>();

const store = useCalendarStore();

const year = computed(() => props.displayedDate?.year() || new Date().getFullYear());
const quarter = computed(() => Math.ceil(((props.displayedDate?.month() || 0) + 1) / 3));
const today = computed(() => {
  try {
    return window.moment ? window.moment() : null;
  } catch {
    return null;
  }
});

const quarterMonths = [
  { q: 1, months: [0, 1, 2] },
  { q: 2, months: [3, 4, 5] },
  { q: 3, months: [6, 7, 8] },
  { q: 4, months: [9, 10, 11] },
];

const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function getMonthDate(monthIndex: number): Moment {
  return window.moment().year(year.value).month(monthIndex).date(1);
}

function isCurrentMonth(monthIndex: number): boolean {
  if (!today.value) return false;
  return today.value.year() === year.value && today.value.month() === monthIndex;
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
  <div class="quarter-view">
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

    <div class="quarters-container">
      <div
        v-for="qData in quarterMonths"
        :key="qData.q"
        class="quarter-row"
        :class="{ active: qData.q === quarter }"
      >
        <div class="quarter-info">
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
            {{ monthNames[monthIndex] }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quarter-view {
  padding: 12px;
}

.year-header {
  text-align: center;
  padding: 8px 0 16px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--background-modifier-border);
}

.year-label {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-normal);
}

.year-note-btn {
  background: var(--interactive-accent);
  border: none;
  color: var(--text-on-accent);
  cursor: pointer;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.year-note-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.quarters-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quarter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: var(--background-secondary);
  transition: all 0.2s ease;
}

.quarter-row.active {
  background: var(--background-modifier-hover);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quarter-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 56px;
}

.quarter-badge {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.quarter-note-btn {
  background: transparent;
  border: 1px solid var(--interactive-accent);
  color: var(--interactive-accent);
  cursor: pointer;
  padding: 4px 10px;
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
  gap: 8px;
  flex: 1;
}

.month-btn {
  flex: 1;
  background: var(--background-primary);
  border: 2px solid transparent;
  color: var(--text-normal);
  cursor: pointer;
  padding: 14px 8px;
  border-radius: 10px;
  font-size: 14px;
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
