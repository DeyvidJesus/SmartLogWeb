import { Component, Input } from '@angular/core';

const paths: Record<string, string[]> = {
  'arrow-right': ['M4 12h16', 'm14 6 6 6-6 6'],
  'arrow-up-right': ['M6 18 18 6', 'M6 6h12v12'],
  'arrow-down': ['M12 4v16', 'm6 14 6 6 6-6'],
  'shield-check': ['M12 3 3 7v5c0 5 9 10 9 10s9-5 9-10V7Z', 'm8 12 3 3 5-6'],
  'circle-check': ['M12 2a10 10 0 1 0 .01 0', 'm7 12 3 3 7-7'],
  check: ['m5 12 4 4L19 6'],
  plus: ['M12 5v14M5 12h14'],
  close: ['m6 6 12 12M6 18 18 6'],
  menu: ['M4 6h16M4 12h16M4 18h16'],
  play: ['m9 5 11 7-11 7Z'],
  smartphone: [
    'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z',
    'M10 5h4M11 18h2',
  ],
  'map-pin': [
    'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z',
    'M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  ],
  calendar: ['M4 5h16v16H4Z', 'M4 10h16M8 3v4m8-4v4M8 14h2m4 0h2'],
  info: ['M12 2a10 10 0 1 0 .01 0', 'M12 11v6m0-10v.1'],
  more: ['M5 12h.1M12 12h.1M19 12h.1'],
  settings: [
    'M12 8a4 4 0 1 0 .01 0',
    'm9 3 1-1h4l1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3L1 9l2-4 3 1 3-1Z',
  ],
  home: ['M3 10 12 3l9 7v10H3Z', 'M9 20v-7h6v7'],
  chart: ['M4 3v17h17', 'M8 16v-5m5 5V7m5 9V4'],
  truck: ['M2 6h12v12H2Z', 'M14 10h4l4 4v4h-8', 'M6 18a2 2 0 1 0 .01 0', 'M18 18a2 2 0 1 0 .01 0'],
  map: ['m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z', 'M9 3v16m6-14v16'],
  user: ['M12 3a4 4 0 1 0 .01 0', 'M4 21v-2a8 8 0 0 1 16 0v2'],
  users: [
    'M9 3a4 4 0 1 0 .01 0',
    'M2 21v-2a7 7 0 0 1 14 0v2',
    'M17 4a4 4 0 0 1 0 8m1 3a5 5 0 0 1 4 5v1',
  ],
  building: ['M5 21V3h14v18Z', 'M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3'],
  package: ['m3 7 9-4 9 4-9 4Z', 'M3 7v10l9 4 9-4V7M12 11v10M7.5 5l9 4'],
  target: ['M12 2a10 10 0 1 0 .01 0', 'M12 6a6 6 0 1 0 .01 0', 'M12 10a2 2 0 1 0 .01 0'],
  refresh: ['M20 7a9 9 0 0 0-15-2L2 8m0-5v5h5', 'M4 17a9 9 0 0 0 15 2l3-3m0 5v-5h-5'],
  alert: ['m12 3 10 18H2Z', 'M12 9v5m0 3v1'],
  spark: ['m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z'],
};
@Component({
  selector: 'app-icon',
  standalone: true,
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">@for (path of iconPaths; track $index) {<path [attr.d]="path" />}</svg>',
  styles: [
    ':host{display:inline-flex;width:1em;height:1em;vertical-align:-.12em;flex-shrink:0}svg{display:block;width:100%;height:100%}',
  ],
})
export class IconComponent {
  @Input() name = 'package';
  get iconPaths(): string[] {
    return paths[this.name] ?? paths['package'];
  }
}
