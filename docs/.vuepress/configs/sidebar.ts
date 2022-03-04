import type { SidebarConfig } from '@vuepress/theme-default';

export const sidebar: SidebarConfig = {
  '/': [
    {
      text: 'Introduction',
      children: ['/'],
    },
    {
      text: 'Setup',
      children: ['/setup'],
    },
    {
      text: 'Developers',
      children: ['/self-hosting'],
    },
    {
      text: 'Commands',
      children: ['/commands/README.md'],
    },
  ],
};