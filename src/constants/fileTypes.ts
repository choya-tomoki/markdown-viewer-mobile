export const MARKDOWN_EXTENSIONS = ['.md', '.markdown', '.mdown', '.mkd', '.mkdn'] as const;

export const IGNORED_DIRECTORIES = [
  '.git',
  'node_modules',
  '.vscode',
  '.idea',
  '__pycache__',
  '.expo',
  'dist',
  'build',
] as const;

export function isMarkdownFile(filename: string): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return MARKDOWN_EXTENSIONS.includes(ext as typeof MARKDOWN_EXTENSIONS[number]);
}
