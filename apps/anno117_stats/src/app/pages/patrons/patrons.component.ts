import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  effect,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTabsModule } from '@angular/material/tabs';

import { DeityCardComponent } from './deity-card/deity-card.component';
import { PatronsService } from '../../services/patron.service';

@Component({
  selector: 'anno-patrons-page',
  standalone: true,
  imports: [DeityCardComponent, MatTabsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './patrons.component.html',
  styleUrl: './patrons.component.scss',
})
export class PatronsPageComponent implements OnInit {
  readonly service = inject(PatronsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  activeTabIndex = signal<number>(0);
  fragment = toSignal(this.route.fragment);

  constructor() {
    effect(() => {
      const fragment = this.fragment();
      if (fragment) {
        const index = this.service
          .patrons()
          .findIndex((p) => this.slugify(p.title) === fragment);
        if (index !== -1) this.activeTabIndex.set(index);
      }
    });
  }
  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.fetchPatrons();
  }

  /** Sync the URL fragment with the tab index if needed */
  onTabChange(index: number) {
    const patron = this.service.patrons()[index];
    if (patron) {
      this.router.navigate([], {
        fragment: this.slugify(patron.title),
        replaceUrl: true,
      });
    }
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}
