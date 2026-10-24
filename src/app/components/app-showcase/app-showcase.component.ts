import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { RouteIllustrationComponent } from '../route-illustration/route-illustration.component';

@Component({
  selector: 'app-app-showcase',
  standalone: true,
  imports: [RouterLink, IconComponent, RouteIllustrationComponent],
  templateUrl: './app-showcase.component.html',
  styleUrl: './app-showcase.component.css',
})
export class AppShowcaseComponent {}
