import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Achievement } from '@anno/achievements-data';

@Component({
  selector: 'anno-achievement-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="achievement-card group" 
         [class.is-unlocked]="data().isUnlocked"
         (click)="toggle.emit(data().id)">
      
      <div class="card-inner">
        <!-- Roman Ornamentation (Tailwind v4 utility) -->
        <div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-anno-gold/40 to-transparent"></div>

        <div class="flex gap-5">
          <div class="icon-container">
            <img [src]="data().icon" 
                 [alt]="data().title" 
                 class="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div class="flex-1">
            <div class="flex justify-between items-start">
              <h3 class="font-display text-xl text-anno-red uppercase tracking-tight">
                {{ data().title }}
              </h3>
              <span class="points">{{ data().points }}</span>
            </div>
            
            <p class="text-sm text-slate-600 mt-1 italic font-medium leading-snug">
              {{ data().description }}
            </p>
          </div>
        </div>

        @if (data().isUnlocked) {
          <div class="unlocked-seal">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .achievement-card {
      @apply relative cursor-pointer grayscale opacity-70 transition-all duration-500;
      
      &.is-unlocked {
        @apply grayscale-0 opacity-100;
      }

      &:hover {
        @apply -translate-y-1 opacity-100;
      }

      .card-inner {
        @apply p-5 bg-white/50 border border-anno-gold/20 rounded-lg backdrop-blur-xs;
      }

      .icon-container {
        @apply w-16 h-16 bg-anno-gold/5 border border-anno-gold/10 p-2 rounded flex-shrink-0;
      }

      .points {
        @apply font-display text-anno-gold font-bold text-lg;
      }

      .unlocked-seal {
        @apply absolute -bottom-2 -right-2 w-8 h-8 bg-anno-gold text-white rounded-full 
               flex items-center justify-center shadow-md border-2 border-white scale-75 group-hover:scale-100 transition-transform;
      }
    }
  `
})
export class AchievementCardComponent {
  data = input.required<Achievement>();
  toggle = output<string>();
}