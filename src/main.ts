import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, ItemView, TFolder, TFile } from 'obsidian';
import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import Calendar from './components/Calendar.vue';
import { useCalendarStore } from './stores/calendar';
import { DEFAULT_SETTINGS, VIEW_TYPE_CALENDAR, type ISettings } from './types';
import {
  openOrCreatePeriodicNote,
  getQuarterStart,
  getYearStart,
  getMonthStart,
  getWeekStart,
} from './io/notes';

// Create a global Pinia instance
const pinia = createPinia();
setActivePinia(pinia);

export default class CalendarVuePlugin extends Plugin {
  settings: ISettings;
  private view: CalendarView | null = null;

  async onload() {
    await this.loadSettings();

    // Register the calendar view
    this.registerView(VIEW_TYPE_CALENDAR, (leaf) => {
      this.view = new CalendarView(leaf, this);
      return this.view;
    });

    // Add commands
    this.addCommand({
      id: 'show-calendar-view',
      name: 'Open calendar view',
      callback: () => this.initLeaf(),
    });

    this.addCommand({
      id: 'open-daily-note',
      name: 'Open daily note',
      callback: () => this.openDailyNote(),
    });

    this.addCommand({
      id: 'open-weekly-note',
      name: 'Open weekly note',
      callback: () => this.openWeeklyNote(),
    });

    this.addCommand({
      id: 'open-monthly-note',
      name: 'Open monthly note',
      callback: () => this.openMonthlyNote(),
    });

    this.addCommand({
      id: 'open-quarterly-note',
      name: 'Open quarterly note',
      callback: () => this.openQuarterlyNote(),
    });

    this.addCommand({
      id: 'open-yearly-note',
      name: 'Open yearly note',
      callback: () => this.openYearlyNote(),
    });

    // Add settings tab
    this.addSettingTab(new CalendarSettingTab(this.app, this));

    // Initialize the view
    if (this.app.workspace.layoutReady) {
      this.initLeaf();
    } else {
      this.registerEvent(
        this.app.workspace.on('layout-ready', () => this.initLeaf())
      );
    }
  }

  onunload() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR).forEach((leaf) => {
      leaf.detach();
    });
  }

  initLeaf() {
    if (this.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR).length) return;
    this.app.workspace.getRightLeaf(false)?.setViewState({
      type: VIEW_TYPE_CALENDAR,
    });
  }

  async loadSettings() {
    const data = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...(data || {}) };

    const store = useCalendarStore();
    store.setSettings(this.settings);
  }

  async saveSettings() {
    await this.saveData(this.settings);

    const store = useCalendarStore();
    store.setSettings(this.settings);
  }

  // Open note methods
  async openDailyNote(date = window.moment(), inNewSplit = false) {
    if (!this.settings.dailyNote.enabled) {
      return;
    }
    await openOrCreatePeriodicNote(
      this.app,
      this.settings,
      this.settings.dailyNote,
      date,
      inNewSplit
    );
  }

  async openWeeklyNote(date = window.moment(), inNewSplit = false) {
    if (!this.settings.weeklyNote.enabled) {
      return;
    }
    const weekStart = getWeekStart(date);
    await openOrCreatePeriodicNote(
      this.app,
      this.settings,
      this.settings.weeklyNote,
      weekStart,
      inNewSplit
    );
  }

  async openMonthlyNote(date = window.moment(), inNewSplit = false) {
    if (!this.settings.monthlyNote.enabled) {
      return;
    }
    const monthStart = getMonthStart(date);
    await openOrCreatePeriodicNote(
      this.app,
      this.settings,
      this.settings.monthlyNote,
      monthStart,
      inNewSplit
    );
  }

  async openQuarterlyNote(date = window.moment(), inNewSplit = false) {
    if (!this.settings.quarterlyNote.enabled) {
      return;
    }
    const quarterStart = getQuarterStart(date);
    await openOrCreatePeriodicNote(
      this.app,
      this.settings,
      this.settings.quarterlyNote,
      quarterStart,
      inNewSplit
    );
  }

  async openYearlyNote(date = window.moment(), inNewSplit = false) {
    if (!this.settings.yearlyNote.enabled) {
      return;
    }
    const yearStart = getYearStart(date);
    await openOrCreatePeriodicNote(
      this.app,
      this.settings,
      this.settings.yearlyNote,
      yearStart,
      inNewSplit
    );
  }
}

class CalendarView extends ItemView {
  private vueApp: ReturnType<typeof createApp> | null = null;
  private plugin: CalendarVuePlugin;

  constructor(leaf: WorkspaceLeaf, plugin: CalendarVuePlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_CALENDAR;
  }

  getDisplayText(): string {
    return 'Calendar';
  }

  getIcon(): string {
    return 'calendar-with-checkmark';
  }

  async onOpen() {
    const store = useCalendarStore();
    store.setPlugin(this.plugin);

    this.vueApp = createApp(Calendar);
    this.vueApp.use(pinia);
    this.vueApp.mount(this.containerEl.children[1]);
  }

  async onClose() {
    if (this.vueApp) {
      this.vueApp.unmount();
      this.vueApp = null;
    }
  }
}

// Helper functions for autocomplete
function getAllFolders(app: App): string[] {
  const folders: string[] = [''];
  const processFolder = (folder: TFolder) => {
    const path = folder.path;
    if (path !== '/') {
      folders.push(path);
    }
    for (const child of folder.children) {
      if (child instanceof TFolder) {
        processFolder(child);
      }
    }
  };
  processFolder(app.vault.getRoot());
  return folders.sort();
}

function getAllMarkdownFiles(app: App): string[] {
  return app.vault.getMarkdownFiles()
    .map(file => file.path)
    .sort();
}

function createAutocompleteInput(
  containerEl: HTMLElement,
  app: App,
  options: () => string[],
  currentValue: string,
  placeholder: string,
  onChange: (value: string) => void
): void {
  const wrapper = containerEl.createDiv({ cls: 'calendar-autocomplete-wrapper' });

  const inputEl = wrapper.createEl('input', {
    cls: 'calendar-autocomplete-input',
    attr: {
      type: 'text',
      placeholder: placeholder,
      value: currentValue,
      autocomplete: 'off'
    }
  });

  const suggestionsEl = wrapper.createDiv({ cls: 'calendar-autocomplete-suggestions' });
  suggestionsEl.style.display = 'none';

  let selectedIndex = -1;
  let filteredOptions: string[] = [];

  function showSuggestions(filter: string) {
    const lowerFilter = filter.toLowerCase();
    filteredOptions = options().filter(opt =>
      opt.toLowerCase().includes(lowerFilter)
    ).slice(0, 10);

    if (filteredOptions.length === 0) {
      suggestionsEl.style.display = 'none';
      return;
    }

    suggestionsEl.empty();
    suggestionsEl.style.display = 'block';
    selectedIndex = -1;

    filteredOptions.forEach((opt, index) => {
      const item = suggestionsEl.createDiv({ cls: 'calendar-suggestion-item' });
      item.setText(opt || '(root)');
      item.addEventListener('click', () => {
        inputEl.value = opt;
        onChange(opt);
        suggestionsEl.style.display = 'none';
      });
      item.addEventListener('mouseenter', () => {
        selectedIndex = index;
        updateSelection();
      });
    });
  }

  function updateSelection() {
    const items = suggestionsEl.querySelectorAll('.calendar-suggestion-item');
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.addClass('selected');
      } else {
        item.removeClass('selected');
      }
    });
  }

  inputEl.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value;
    onChange(value);
    showSuggestions(value);
  });

  inputEl.addEventListener('focus', () => {
    showSuggestions(inputEl.value);
  });

  inputEl.addEventListener('blur', () => {
    setTimeout(() => {
      suggestionsEl.style.display = 'none';
    }, 200);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (suggestionsEl.style.display === 'none') return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filteredOptions.length - 1);
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection();
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = filteredOptions[selectedIndex];
      inputEl.value = selected;
      onChange(selected);
      suggestionsEl.style.display = 'none';
    } else if (e.key === 'Escape') {
      suggestionsEl.style.display = 'none';
    }
  });
}

class CalendarSettingTab extends PluginSettingTab {
  plugin: CalendarVuePlugin;

  constructor(app: App, plugin: CalendarVuePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Add custom styles for autocomplete
    this.addAutocompleteStyles();

    // General Settings
    containerEl.createEl('h3', { text: 'General Settings' });

    new Setting(containerEl)
      .setName('Default view')
      .setDesc('Choose the default view mode for the calendar')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('month', 'Month view')
          .addOption('week', 'Week view')
          .addOption('quarter', 'Quarter view')
          .addOption('year', 'Year view')
          .setValue(this.plugin.settings.defaultView)
          .onChange(async (value) => {
            this.plugin.settings.defaultView = value as any;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Confirm before creating')
      .setDesc('Show confirmation dialog before creating a new note')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.shouldConfirmBeforeCreate)
          .onChange(async (value) => {
            this.plugin.settings.shouldConfirmBeforeCreate = value;
            await this.plugin.saveSettings();
          });
      });

    // Daily Notes Settings
    this.addPeriodicNoteSettings(
      containerEl,
      'Daily Notes',
      'dailyNote',
      this.plugin.settings.dailyNote
    );

    // Weekly Notes Settings
    this.addPeriodicNoteSettings(
      containerEl,
      'Weekly Notes',
      'weeklyNote',
      this.plugin.settings.weeklyNote
    );

    // Monthly Notes Settings
    this.addPeriodicNoteSettings(
      containerEl,
      'Monthly Notes',
      'monthlyNote',
      this.plugin.settings.monthlyNote
    );

    // Quarterly Notes Settings
    this.addPeriodicNoteSettings(
      containerEl,
      'Quarterly Notes',
      'quarterlyNote',
      this.plugin.settings.quarterlyNote
    );

    // Yearly Notes Settings
    this.addPeriodicNoteSettings(
      containerEl,
      'Yearly Notes',
      'yearlyNote',
      this.plugin.settings.yearlyNote
    );
  }

  addAutocompleteStyles() {
    const styleId = 'calendar-autocomplete-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .calendar-autocomplete-wrapper {
        position: relative;
        width: 100%;
      }
      .calendar-autocomplete-input {
        width: 100%;
        padding: 6px 12px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        background: var(--background-primary);
        color: var(--text-normal);
        font-size: 14px;
        outline: none;
        transition: border-color 0.15s ease;
      }
      .calendar-autocomplete-input:focus {
        border-color: var(--interactive-accent);
      }
      .calendar-autocomplete-input::placeholder {
        color: var(--text-faint);
      }
      .calendar-autocomplete-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--background-primary);
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        margin-top: 4px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .calendar-suggestion-item {
        padding: 8px 12px;
        cursor: pointer;
        font-size: 13px;
        color: var(--text-normal);
        transition: background-color 0.1s ease;
      }
      .calendar-suggestion-item:hover,
      .calendar-suggestion-item.selected {
        background-color: var(--background-modifier-hover);
        color: var(--interactive-accent);
      }
    `;
    document.head.appendChild(style);
  }

  addPeriodicNoteSettings(
    containerEl: HTMLElement,
    title: string,
    key: 'dailyNote' | 'weeklyNote' | 'monthlyNote' | 'quarterlyNote' | 'yearlyNote',
    settings: typeof DEFAULT_SETTINGS.dailyNote
  ) {
    containerEl.createEl('h3', { text: title });

    new Setting(containerEl)
      .setName(`Enable ${title.toLowerCase()}`)
      .setDesc(`Enable creation and tracking of ${title.toLowerCase()}`)
      .addToggle((toggle) => {
        toggle.setValue(settings.enabled).onChange(async (value) => {
          settings.enabled = value;
          await this.plugin.saveSettings();
          this.display();
        });
      });

    if (settings.enabled) {
      // Folder setting with autocomplete
      const folderSetting = new Setting(containerEl)
        .setName('Folder')
        .setDesc('Folder where notes will be created (leave empty for root)');

      folderSetting.controlEl.empty();
      createAutocompleteInput(
        folderSetting.controlEl,
        this.app,
        () => getAllFolders(this.app),
        settings.folder,
        'e.g., notes/daily',
        async (value) => {
          settings.folder = value;
          await this.plugin.saveSettings();
        }
      );

      new Setting(containerEl)
        .setName('Format')
        .setDesc('Date format for the note filename')
        .addText((text) => {
          text
            .setPlaceholder(settings.format)
            .setValue(settings.format)
            .onChange(async (value) => {
              settings.format = value || DEFAULT_SETTINGS[key].format;
              await this.plugin.saveSettings();
            });
        });

      // Template setting with autocomplete
      const templateSetting = new Setting(containerEl)
        .setName('Template')
        .setDesc('Path to template file (optional)');

      templateSetting.controlEl.empty();
      createAutocompleteInput(
        templateSetting.controlEl,
        this.app,
        () => getAllMarkdownFiles(this.app),
        settings.template,
        'e.g., templates/daily.md',
        async (value) => {
          settings.template = value;
          await this.plugin.saveSettings();
        }
      );
    }
  }
}
