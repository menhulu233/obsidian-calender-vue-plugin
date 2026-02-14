import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Moment } from 'moment';
import type { ISettings, ViewMode } from '../types';
import { DEFAULT_SETTINGS } from '../types';

export const useCalendarStore = defineStore('calendar', () => {
  // Settings
  const settings = ref<ISettings>(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));

  // View mode
  const viewMode = ref<ViewMode>('month');

  // Displayed date
  const displayedDate = ref<Moment | null>(null);

  // Today
  const today = ref<Moment | null>(null);

  // Plugin reference for opening notes
  let plugin: any = null;

  function setPlugin(pluginInstance: any) {
    plugin = pluginInstance;
  }

  // Actions
  function updateSettings(newSettings: Partial<ISettings>) {
    settings.value = { ...settings.value, ...newSettings };
  }

  function setSettings(newSettings: ISettings) {
    settings.value = { ...newSettings };
  }

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode;
  }

  function setDisplayedDate(date: Moment) {
    displayedDate.value = date.clone();
  }

  function setToday(date: Moment) {
    today.value = date;
  }

  // Navigation
  function navigatePrevious() {
    if (!displayedDate.value) return;

    const date = displayedDate.value.clone();
    switch (viewMode.value) {
      case 'year':
        setDisplayedDate(date.subtract(1, 'year'));
        break;
      case 'quarter':
        setDisplayedDate(date.subtract(3, 'months'));
        break;
      case 'week':
        setDisplayedDate(date.subtract(1, 'week'));
        break;
      case 'month':
      default:
        setDisplayedDate(date.subtract(1, 'month'));
        break;
    }
  }

  function navigateNext() {
    if (!displayedDate.value) return;

    const date = displayedDate.value.clone();
    switch (viewMode.value) {
      case 'year':
        setDisplayedDate(date.add(1, 'year'));
        break;
      case 'quarter':
        setDisplayedDate(date.add(3, 'months'));
        break;
      case 'week':
        setDisplayedDate(date.add(1, 'week'));
        break;
      case 'month':
      default:
        setDisplayedDate(date.add(1, 'month'));
        break;
    }
  }

  function navigateToday() {
    setDisplayedDate(window.moment());
  }

  // Note opening functions
  async function openDailyNote(date: Moment, inNewSplit = false) {
    if (plugin && settings.value.dailyNote.enabled) {
      await plugin.openDailyNote(date, inNewSplit);
    }
  }

  async function openWeeklyNote(date: Moment, inNewSplit = false) {
    if (plugin && settings.value.weeklyNote.enabled) {
      await plugin.openWeeklyNote(date, inNewSplit);
    }
  }

  async function openMonthlyNote(date: Moment, inNewSplit = false) {
    if (plugin && settings.value.monthlyNote.enabled) {
      await plugin.openMonthlyNote(date, inNewSplit);
    }
  }

  async function openQuarterlyNote(date: Moment, inNewSplit = false) {
    if (plugin && settings.value.quarterlyNote.enabled) {
      await plugin.openQuarterlyNote(date, inNewSplit);
    }
  }

  async function openYearlyNote(date: Moment, inNewSplit = false) {
    if (plugin && settings.value.yearlyNote.enabled) {
      await plugin.openYearlyNote(date, inNewSplit);
    }
  }

  // Computed
  const yearTitle = computed(() => {
    return displayedDate.value?.format('YYYY') || '';
  });

  const viewTitle = computed(() => {
    if (!displayedDate.value) return '';

    switch (viewMode.value) {
      case 'year':
        return `${displayedDate.value.year()}年`;
      case 'quarter': {
        const q = Math.ceil((displayedDate.value.month() + 1) / 3);
        return `${displayedDate.value.year()}年 Q${q}`;
      }
      case 'week': {
        const start = displayedDate.value.clone().startOf('week');
        const end = displayedDate.value.clone().endOf('week');
        return `${start.format('M月D日')} - ${end.format('M月D日')}`;
      }
      case 'month':
      default:
        return displayedDate.value.format('YYYY年M月');
    }
  });

  return {
    // State
    settings,
    viewMode,
    displayedDate,
    today,

    // Computed
    yearTitle,
    viewTitle,

    // Actions
    setPlugin,
    updateSettings,
    setSettings,
    setViewMode,
    setDisplayedDate,
    setToday,
    navigatePrevious,
    navigateNext,
    navigateToday,

    // Note actions
    openDailyNote,
    openWeeklyNote,
    openMonthlyNote,
    openQuarterlyNote,
    openYearlyNote,
  };
});
