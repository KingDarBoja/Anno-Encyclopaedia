import { Component, effect, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
interface NavItem {
  label: string;
  path?: string; // Optional because group parents don't need a path
  children?: NavItem[]; // For the "Gameplay" submenu
}
@Component({
  selector: 'anno-header',
  standalone: true,
  imports: [MatIcon, RouterModule],
  template: `
    <header class="header-container">
      <div
        class="container mx-auto h-full flex items-center justify-between p-4 font-(--font-primary)"
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

        <div class="flex items-center gap-2">
          
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

          <!-- Theme Switcher Button -->
          <button 
            class="theme-toggle-btn" 
            (click)="toggleTheme()" 
            [attr.aria-label]="isLightMode() ? 'Switch to Dark Mode' : 'Switch to Light Mode'"
          >
            <mat-icon>{{ isLightMode() ? 'dark_mode' : 'light_mode' }}</mat-icon>
          </button>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isMenuOpen = signal(false);
  isLightMode = signal<boolean>(localStorage.getItem('theme') === 'light');

constructor() {
    effect(() => {
      const lightModeActive = this.isLightMode();
      
      if (lightModeActive) {
        document.documentElement.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  readonly navItems: NavItem[] = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    {
      label: 'Miscellaneous',
      children: [
        { label: 'Achievements', path: '/achievements' },
        { label: 'Ornaments', path: '/ornaments' },
      ],
    },
    {
      label: 'Gameplay',
      children: [
        { label: 'Production Chains', path: '/production-chains' },
        { label: 'City Status', path: '/city-status' },
        { label: 'Patrons', path: '/patrons' },
      ],
    },
  ];

  toggleMenu() {
    this.isMenuOpen.update((state) => !state);
  }

  toggleTheme() {
    this.isLightMode.update((mode) => !mode);
  }
}
