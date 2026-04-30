import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `
    <main
      class="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center"
    >
      <div class="max-w-3xl hero-container">
        <h1 class="text-5xl md:text-6xl font-bold mb-6">
          Welcome to <span class="">Anno 117 Encyclopaedia</span>
        </h1>
      </div>
    </main>
  `,
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  // You can add logic here later, like "Latest Achievements" or "Player Stats"
}
