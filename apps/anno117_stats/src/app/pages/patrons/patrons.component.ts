import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DeityCardComponent } from './deity-card/deity-card.component';
import { PatronsService } from '../../services/patron.service';

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
    const targetElement = document.getElementById(`patron-${uid}`);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
}
