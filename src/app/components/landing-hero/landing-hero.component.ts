import { SectionLinkDirective } from '../../directives/section-link.directive';
import { Component } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [SectionLinkDirective, IconComponent],
  templateUrl: './landing-hero.component.html',
  styleUrl: './landing-hero.component.css',
})
export class LandingHeroComponent {}
