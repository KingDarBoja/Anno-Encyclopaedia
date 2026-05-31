import {
  Component,
  input,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { Achievement, AchievementService } from '@anno/achievements-data';

@Component({
  selector: 'anno-achievement-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block; width: 100%;',
  },
  template: `
    <div class="generic-card">
      @let cheevo = achievement();
      @let title = cheevo.title.english;
      @let desc = cheevo.description.english;
      @let points = cheevo.points;
      @let diff = cheevo.difficulty;

      <header>
        <h3>{{ title }}</h3>
      </header>

      <div class="card-body-row">
        <div [class]="'difficulty-spacer ' + difficultyClass()"></div>
        <div class="card-image">
          <img
            [src]="cheevo.image_url"
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

  readonly achievement = input.required<Achievement>();

  readonly difficultyClass = computed<string>(() => {
    const diff = this.achievement().difficulty;
    return diff ? `difficulty-${diff.toLowerCase()}` : 'difficulty-bronze';
  });

  handleImgError(event: ErrorEvent) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.achievementService.placeholderImage;
  }
}
