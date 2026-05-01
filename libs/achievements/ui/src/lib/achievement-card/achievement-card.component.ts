import {
  Component,
  input,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { Achievement, AchievementService } from '@anno/achievements-data';

@Component({
  selector: 'anno-achievement-card',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="achievement-card-alt">
      @let title = data().title.english;
      @let desc = data().description.english;
      @let points = data().points;
      @let diff = data().difficulty;

      <header>
        <h3>{{ title }}</h3>
      </header>

      <div class="card-body-row">
        <div class="card-image">
          <img
            [src]="data().image_url"
            (error)="handleImgError($event)"
            [alt]="title"
          />
        </div>
        <div class="card-content">
          <p>{{ desc }}</p>
        </div>
      </div>

      <footer class="card-footer">
        <div class="footer-col">
          <span class="label">Points</span>
          <span class="value">{{ points }}</span>
        </div>
        <div class="footer-col">
          <span class="label">Difficulty</span>
          <span class="value">{{ diff }}</span>
        </div>
      </footer>
    </div>
  `,
  styleUrl: './achievement-card.component.scss',
})
export class AchievementCardComponent {
  private readonly achievementService = inject(AchievementService);

  data = input.required<Achievement>();

  handleImgError(event: ErrorEvent) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.achievementService.placeholderImage;
  }
}
