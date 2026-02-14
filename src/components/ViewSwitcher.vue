<script setup lang="ts">
import type { ViewMode } from '../types';

defineProps<{
  currentView: ViewMode;
  title: string;
}>();

const emit = defineEmits<{
  (e: 'viewChange', mode: ViewMode): void;
  (e: 'previous'): void;
  (e: 'next'): void;
  (e: 'today'): void;
}>();

const viewModes: { mode: ViewMode; label: string; icon: string }[] = [
  { mode: 'year', label: '年', icon: 'Y' },
  { mode: 'quarter', label: '季', icon: 'Q' },
  { mode: 'month', label: '月', icon: 'M' },
  { mode: 'week', label: '周', icon: 'W' },
];

function selectView(mode: ViewMode) {
  emit('viewChange', mode);
}
</script>

<template>
  <div class="view-switcher">
    <div class="nav-section">
      <button class="nav-btn" @click="emit('previous')" title="上一个">
        <span class="arrow">◀</span>
      </button>
      <button class="nav-btn today" @click="emit('today')">今天</button>
      <button class="nav-btn" @click="emit('next')" title="下一个">
        <span class="arrow">▶</span>
      </button>
    </div>

    <div class="title-section">
      <span class="title">{{ title }}</span>
    </div>

    <div class="view-tabs">
      <button
        v-for="vm in viewModes"
        :key="vm.mode"
        class="view-tab"
        :class="{ active: currentView === vm.mode }"
        @click="selectView(vm.mode)"
        :title="vm.label"
      >
        {{ vm.icon }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.view-switcher {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  gap: 8px;
  border-bottom: 1px solid var(--background-modifier-border);
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background-color: var(--background-modifier-hover);
  color: var(--text-normal);
}

.nav-btn .arrow {
  font-size: 10px;
}

.nav-btn.today {
  font-weight: 500;
  padding: 4px 10px;
}

.title-section {
  flex: 1;
  text-align: center;
  min-width: 0;
}

.title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-normal);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-tabs {
  display: flex;
  background: var(--background-modifier-border);
  border-radius: 4px;
  padding: 2px;
  gap: 2px;
}

.view-tab {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.15s ease;
  min-width: 24px;
}

.view-tab:hover {
  color: var(--text-normal);
}

.view-tab.active {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
}
</style>
