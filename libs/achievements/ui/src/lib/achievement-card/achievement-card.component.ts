import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Achievement } from '@anno/achievements-data';

@Component({
  selector: 'anno-achievement-card',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="achievement-card-alt">
      <header>
        <h3>{{ data().title }}</h3>
      </header>

      <div class="card-body-row">
        <div class="card-image">
          <img [src]="data().image_url" [alt]="data().title" />
        </div>
        <div class="card-content">
          <p>{{ data().description }}</p>
        </div>
      </div>

      <footer class="card-footer">
        <div class="footer-col">
          <span class="label">Points</span>
          <span class="value">{{ data().points }}</span>
        </div>
        <div class="footer-col">
          <span class="label">Difficulty</span>
          <span class="value">{{ data().difficulty }}</span>
        </div>
      </footer>
    </div>
  `,
  styleUrl: './achievement-card.component.scss',
})
export class AchievementCardComponent {
  data = input.required<Achievement>();
}
