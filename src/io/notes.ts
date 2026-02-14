import type { Moment } from 'moment';
import { normalizePath, TFile, TFolder, Notice, Modal, App } from 'obsidian';
import type { ISettings, PeriodicNoteSettings } from '../types';

/**
 * Get the file path for a periodic note
 */
export function getNoteFilePath(
  settings: PeriodicNoteSettings,
  date: Moment
): string {
  const filename = date.format(settings.format);
  const folder = settings.folder || '';
  return normalizePath(folder ? `${folder}/${filename}.md` : `${filename}.md`);
}

/**
 * Check if a note exists
 */
export async function noteExists(
  app: App,
  filePath: string
): Promise<TFile | null> {
  const file = app.vault.getAbstractFileByPath(filePath);
  return file instanceof TFile ? file : null;
}

/**
 * Get template content
 */
async function getTemplateContent(
  app: App,
  templatePath: string
): Promise<string> {
  if (!templatePath) return '';

  const file = app.vault.getAbstractFileByPath(normalizePath(templatePath));
  if (file instanceof TFile) {
    return await app.vault.read(file);
  }
  return '';
}

/**
 * Ensure folder exists
 */
async function ensureFolderExists(app: App, folderPath: string): Promise<void> {
  if (!folderPath) return;

  const folder = app.vault.getAbstractFileByPath(normalizePath(folderPath));
  if (!folder) {
    await app.vault.createFolder(folderPath);
  }
}

/**
 * Create a periodic note
 */
export async function createPeriodicNote(
  app: App,
  settings: ISettings,
  noteSettings: PeriodicNoteSettings,
  date: Moment
): Promise<TFile | null> {
  const filePath = getNoteFilePath(noteSettings, date);

  // Check if file already exists
  const existingFile = await noteExists(app, filePath);
  if (existingFile) {
    return existingFile;
  }

  // Ensure folder exists
  await ensureFolderExists(app, noteSettings.folder);

  // Get template content
  let content = '';
  if (noteSettings.template) {
    content = await getTemplateContent(app, noteSettings.template);
  }

  // Create the file
  const newFile = await app.vault.create(filePath, content);
  return newFile;
}

/**
 * Open or create a periodic note
 */
export async function openOrCreatePeriodicNote(
  app: App,
  settings: ISettings,
  noteSettings: PeriodicNoteSettings,
  date: Moment,
  inNewSplit: boolean = false
): Promise<void> {
  const filePath = getNoteFilePath(noteSettings, date);

  // Check if file exists
  let file = await noteExists(app, filePath);

  if (!file) {
    if (settings.shouldConfirmBeforeCreate) {
      const shouldCreate = await showConfirmDialog(
        app,
        'Create Note',
        `File ${filePath} does not exist. Would you like to create it?`
      );
      if (!shouldCreate) return;
    }

    file = await createPeriodicNote(app, settings, noteSettings, date);
    if (!file) {
      new Notice('Failed to create note');
      return;
    }
  }

  // Open the file
  const leaf = inNewSplit
    ? app.workspace.splitActiveLeaf()
    : app.workspace.getUnpinnedLeaf();

  await leaf.openFile(file, { active: true });
  app.workspace.setActiveLeaf(leaf, true, true);
}

/**
 * Show confirmation dialog
 */
function showConfirmDialog(
  app: App,
  title: string,
  message: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = new ConfirmModal(app, title, message, resolve);
    modal.open();
  });
}

/**
 * Confirmation Modal
 */
class ConfirmModal extends Modal {
  private title: string;
  private message: string;
  private callback: (result: boolean) => void;

  constructor(
    app: App,
    title: string,
    message: string,
    callback: (result: boolean) => void
  ) {
    super(app);
    this.title = title;
    this.message = message;
    this.callback = callback;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: this.title });
    contentEl.createEl('p', { text: this.message });

    const buttonContainer = contentEl.createDiv({
      cls: 'modal-button-container',
    });
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '8px';
    buttonContainer.style.marginTop = '16px';

    const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
    cancelBtn.addEventListener('click', () => {
      this.callback(false);
      this.close();
    });

    const confirmBtn = buttonContainer.createEl('button', {
      text: 'Create',
      cls: 'mod-cta',
    });
    confirmBtn.addEventListener('click', () => {
      this.callback(true);
      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

/**
 * Get date range for different periods
 */
export function getQuarterStart(date: Moment): Moment {
  const quarter = Math.floor(date.month() / 3);
  return date.clone().month(quarter * 3).date(1).startOf('day');
}

export function getYearStart(date: Moment): Moment {
  return date.clone().startOf('year');
}

export function getMonthStart(date: Moment): Moment {
  return date.clone().startOf('month');
}

export function getWeekStart(date: Moment): Moment {
  return date.clone().startOf('week');
}
