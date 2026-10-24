import { Component } from '@angular/core';

@Component({
  selector: 'app-route-illustration',
  standalone: true,
  template: `
    <svg
      viewBox="0 0 600 320"
      fill="none"
      role="img"
      aria-label="Ilustração de uma rota entre São Paulo, Jundiaí e Campinas"
    >
      <rect width="600" height="320" fill="#edf2f0" />
      <path
        d="m0 25 85 12 49 74-30 89-104 8ZM383 0l-18 53 70 37 51-29L477 0ZM425 205l77-33 98 36v112H425Z"
        fill="#dce8dc"
      />
      <path
        d="M310-30c-24 73 75 110 53 165s-110 49-104 99 29 67 5 114"
        stroke="#c9dfe9"
        stroke-width="20"
      />
      <g stroke="#fff" stroke-width="10">
        <path
          d="m-30 100 140 31 135-65L384 89l244-39M-20 250l147-41 135 47 177-120 180 51M105-20l75 127-55 120 26 112M461-20l-30 113 60 135-9 112M-20 171l180-7 92-35 109 52 239 84"
        />
        <path d="m238-20-35 88 47 124-30 150M-20 297l164-8 148 13L579 98" stroke-width="5" />
      </g>
      <path
        d="m136 245 46-41 25-68 63-13 35-45 111-9"
        stroke="#fff"
        stroke-width="12"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="m136 245 46-41 25-68 63-13 35-45 111-9"
        stroke="#ed641d"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <g fill="#16344c" font-family="Manrope, sans-serif" font-size="13" font-weight="650">
        <text x="81" y="282">São Paulo</text>
        <text x="225" y="162">Jundiaí</text>
        <text x="429" y="76">Campinas</text>
      </g>
      <circle cx="136" cy="245" r="9" fill="#16344c" stroke="#fff" stroke-width="4" />
      <circle cx="416" cy="69" r="9" fill="#18775b" stroke="#fff" stroke-width="4" />
      <circle cx="270" cy="123" r="21" fill="#ed641d" fill-opacity=".15" />
      <rect
        x="255"
        y="108"
        width="30"
        height="30"
        rx="10"
        fill="#ed641d"
        stroke="#fff"
        stroke-width="3"
      />
      <path
        d="M261 117h10v9h-10zm10 3h5l3 3v3h-8"
        stroke="#fff"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path d="M265 126v2m10-2v2" stroke="#fff" stroke-width="3" stroke-linecap="round" />
    </svg>
  `,
  styles: [
    ':host{display:block;min-width:0}svg{display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit}',
  ],
})
export class RouteIllustrationComponent {}
