import type { Moment } from 'moment';

export type ViewMode = 'year' | 'quarter' | 'month' | 'week';

export interface PeriodicNoteSettings {
  enabled: boolean;
  folder: string;
  format: string;
  template: string;
}

export interface ISettings {
  // General
  wordsPerDot: number;
  weekStart: 'sunday' | 'monday' | 'locale';
  shouldConfirmBeforeCreate: boolean;
  defaultView: ViewMode;
  localeOverride: string;

  // Daily notes
  dailyNote: PeriodicNoteSettings;

  // Weekly notes
  weeklyNote: PeriodicNoteSettings;

  // Monthly notes
  monthlyNote: PeriodicNoteSettings;

  // Quarterly notes
  quarterlyNote: PeriodicNoteSettings;

  // Yearly notes
  yearlyNote: PeriodicNoteSettings;
}

export const DEFAULT_SETTINGS: ISettings = {
  // General
  wordsPerDot: 250,
  weekStart: 'locale',
  shouldConfirmBeforeCreate: true,
  defaultView: 'month',
  localeOverride: 'system-default',

  // Daily notes
  dailyNote: {
    enabled: true,
    folder: '',
    format: 'YYYY-MM-DD',
    template: '',
  },

  // Weekly notes
  weeklyNote: {
    enabled: false,
    folder: 'weeks',
    format: 'YYYY-[W]ww',
    template: '',
  },

  // Monthly notes
  monthlyNote: {
    enabled: false,
    folder: 'months',
    format: 'YYYY-MM',
    template: '',
  },

  // Quarterly notes
  quarterlyNote: {
    enabled: false,
    folder: 'quarters',
    format: 'YYYY-[Q]Q',
    template: '',
  },

  // Yearly notes
  yearlyNote: {
    enabled: false,
    folder: 'years',
    format: 'YYYY',
    template: '',
  },
};

export const VIEW_TYPE_CALENDAR = 'calendar-view';
