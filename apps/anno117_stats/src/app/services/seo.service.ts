import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  init(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        mergeMap((route) => route.data),
      )
      .subscribe((data) => {
        const title = data['title']
          ? `${data['title']} | Anno 117 Stats`
          : 'Anno 117 Stats';
        const description =
          data['description'] || 'Anno 117 Stats and Encyclopaedia';
        const image =
          data['image'] ||
          'https://kingdarboja.github.io/anno117_stats/favicon/android-chrome-512x512.png';
        const url = `https://kingdarboja.github.io/anno117_stats${this.router.url}`;

        this.titleService.setTitle(title);

        this.metaService.updateTag({ property: 'og:title', content: title });
        this.metaService.updateTag({
          property: 'og:description',
          content: description,
        });
        this.metaService.updateTag({ property: 'og:image', content: image });
        this.metaService.updateTag({ property: 'og:url', content: url });

        this.metaService.updateTag({ name: 'twitter:title', content: title });
        this.metaService.updateTag({
          name: 'twitter:description',
          content: description,
        });
        this.metaService.updateTag({ name: 'twitter:image', content: image });

        // Removed updateCanonicalUrl
      });
  }
}
