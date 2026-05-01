import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  template: `
    <header>
      <nav>
        @for (item of navItems; track item.path) {
          <!-- routerLinkActive applies the 'active' class when the route matches -->
          <!-- [routerLinkActiveOptions]="{exact: true}" prevents Home from being active on every subpage -->
          <div
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
          >
            <a [routerLink]="item.path">{{ item.label }}</a>
          </div>
        }
      </nav>
    </header>
  `,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Achievements', path: '/achievements' },
    { label: 'City Status', path: '/city-status' },
  ];
}
