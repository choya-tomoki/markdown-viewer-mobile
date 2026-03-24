export const fontFamilies = [
  { label: 'System Default', value: '' },
  { label: 'Noto Sans', value: 'NotoSans' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
  { label: 'Noto Sans JP', value: 'NotoSansJP' },
  { label: 'Roboto Slab', value: 'RobotoSlab' },
] as const;

export const fontSizeRange = {
  min: 10,
  max: 32,
  default: 16,
  step: 1,
} as const;
