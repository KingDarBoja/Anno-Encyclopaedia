import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DeityCardComponent } from './deity-card/deity-card.component';
import { PatronsService } from '../../services/patron.service';
import { Router } from '@angular/router';

@Component({
  selector: 'anno-patrons-page',
  standalone: true,
  imports: [DeityCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './patrons.component.html',
  styleUrl: './patrons.component.scss',
})
export class PatronsPageComponent implements OnInit {
  readonly service = inject(PatronsService);
  private readonly router = inject(Router);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.fetchPatrons();
  }

  /**
   * Programmatic, smooth scrolling to classical deity monuments.
   * Prevents router fragmentation in SPA environments.
   */
  scrollToPatron(uid: number, event: Event) {
    event.preventDefault();
    
    // Update the URL fragment without reloading the page
    this.router.navigate([], {
      fragment: `patron-${uid}`,
      replaceUrl: true
    });

    // Scroll to the element
    const targetElement = document.getElementById(`patron-${uid}`);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
}
