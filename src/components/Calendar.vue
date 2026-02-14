<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { Moment } from 'moment';
import { useCalendarStore } from '../stores/calendar';
import ViewSwitcher from './ViewSwitcher.vue';
import YearView from './YearView.vue';
import QuarterView from './QuarterView.vue';
import WeekView from './WeekView.vue';
import MonthView from './MonthView.vue';

const store = useCalendarStore();
const containerRef = ref<HTMLElement | null>(null);

// Initialize
onMounted(() => {
  store.setViewMode(store.settings.defaultView || 'month');
  updateToday();

  // Heartbeat
  heartbeat = setInterval(() => {
    updateToday();
  }, 60000);
});

let heartbeat: ReturnType<typeof setInterval>;

onUnmounted(() => {
  if (heartbeat) {
    clearInterval(heartbeat);
  }
});

function updateToday() {
  if (!window.moment) return;

  const moment = window.moment;
  store.setToday(moment());

  if (!store.displayedDate) {
    store.setDisplayedDate(moment());
  }
}

// Navigation
function handlePrevious() {
  store.navigatePrevious();
}

function handleNext() {
  store.navigateNext();
}

function handleToday() {
  store.navigateToday();
}

function handleViewChange(mode: string) {
  store.setViewMode(mode as any);
}
</script>

<template>
  <div ref="containerRef" class="calendar-container">
    <ViewSwitcher
      :current-view="store.viewMode"
      :title="store.viewTitle"
      @view-change="handleViewChange"
      @previous="handlePrevious"
      @next="handleNext"
      @today="handleToday"
    />

    <div class="calendar-body">
      <YearView v-if="store.viewMode === 'year'" :displayed-date="store.displayedDate" />
      <QuarterView v-else-if="store.viewMode === 'quarter'" :displayed-date="store.displayedDate" />
      <WeekView v-else-if="store.viewMode === 'week'" :displayed-date="store.displayedDate" />
      <MonthView v-else :displayed-date="store.displayedDate" />
    </div>
  </div>
</template>

<style scoped>
.calendar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.calendar-body {
  flex: 1;
  overflow-y: auto;
}
</style>
