import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SeoService } from './services/seo.service';

@Component({
  imports: [RouterModule, HeaderComponent],
  selector: 'anno-117-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = 'Anno 117 Stats';
  private seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.init();
  }
}
