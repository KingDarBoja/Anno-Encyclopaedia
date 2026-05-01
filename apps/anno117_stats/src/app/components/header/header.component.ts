import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  path?: string; // Optional because group parents don't need a path
  children?: NavItem[]; // For the "Gameplay" submenu
}
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  template: `
    <header class="w-full bg-[var(--primary-color)]">
      <div
        class="container mx-auto flex items-center justify-between p-4 font-[var(--font-primary)]"
      >
        <!-- Branding Section -->
        <div
          class="branding flex items-center gap-3 cursor-pointer"
          routerLink="/"
        >
          <!-- <img src="assets/icons/logo.webp" alt="Logo" class="h-8 w-8" /> -->
          <span class="text-white text-xl tracking-widest uppercase"
            >Anno 117 Stats</span
          >
        </div>

        <div class="flex items-center">
          <!-- Mobile Toggle Button -->
          <button class="mobile-toggle md:hidden" (click)="toggleMenu()">
            <span class="hamburger" [class.open]="isMenuOpen()"></span>
          </button>

          <!-- Navigation Bar -->
          <nav [class.open]="isMenuOpen()" class="main-nav">
            @for (item of navItems; track item.label) {
              @if (item.children) {
                <!-- Highlights when any child path is active -->
                <div class="nav-group" routerLinkActive="active">
                  <span class="group-label">{{ item.label }}</span>
                  <div class="submenu">
                    @for (sub of item.children; track sub.path) {
                      <div routerLinkActive="sub-active">
                        <a
                          [routerLink]="sub.path"
                          (click)="isMenuOpen.set(false)"
                        >
                          {{ sub.label }}
                        </a>
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <div
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: item.path === '/' }"
                >
                  <a [routerLink]="item.path" (click)="isMenuOpen.set(false)">
                    {{ item.label }}
                  </a>
                </div>
              }
            }
          </nav>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isMenuOpen = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    {
      label: 'Gameplay',
      children: [
        { label: 'Achievements', path: '/achievements' },
        { label: 'City Status', path: '/city-status' },
      ],
    },
  ];

  toggleMenu() {
    this.isMenuOpen.update((state) => !state);
  }
}
