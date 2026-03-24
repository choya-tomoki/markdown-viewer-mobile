export type { ThemeMode } from '../stores/appStore';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontFamily: string;
  fontSize: number;
}
