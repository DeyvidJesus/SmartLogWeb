import { Component, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-assistant-demo',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './assistant-demo.component.html',
  styleUrl: './assistant-demo.component.css',
})
export class AssistantDemoComponent {
  readonly sampleQuestion = signal<'status' | 'rotas'>('status');
}
