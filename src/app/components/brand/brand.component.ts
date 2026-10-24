import { Component } from '@angular/core';

@Component({
  selector: 'app-brand',
  standalone: true,
  template: `
    <svg viewBox="0 0 52 40" fill="none" aria-hidden="true" focusable="false">
      <path d="M8 7h25l-4 18H5l3-18Z" fill="#ed641d" />
      <path d="M34 13h8l7 10-2 9H27l2-8 5-11Z" fill="currentColor" />
      <path d="M36 16h5l4 7H34l2-7Z" fill="#fff" />
      <path
        d="M2 13h12M1 20h9M10 31h18"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <circle cx="16" cy="32" r="5" fill="currentColor" stroke="#fff" stroke-width="2" />
      <circle cx="39" cy="32" r="5" fill="currentColor" stroke="#fff" stroke-width="2" />
    </svg>
    <span class="brand-name" translate="no"
      >SmartLog<span class="brand-tagline">Logística inteligente</span></span
    >
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: inherit;
        white-space: nowrap;
      }
      svg {
        width: 47px;
        height: 38px;
        flex-shrink: 0;
      }
      .brand-name {
        font-size: 25px;
        line-height: 1.05;
        font-weight: 800;
        letter-spacing: -1.1px;
      }
      .brand-tagline {
        display: block;
        margin-top: 6px;
        font-size: 9px;
        font-weight: 600;
        letter-spacing: 1.25px;
      }
    `,
  ],
})
export class BrandComponent {}
