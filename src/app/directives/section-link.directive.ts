import { Directive, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

/** Keep native in-page navigation on the current URL, even with Angular's root base href. */
@Directive({ selector: 'a[appSectionLink]', standalone: true, host: { '[attr.href]': 'href()' } })
export class SectionLinkDirective {
  readonly appSectionLink = input.required<string>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly queryParams = toSignal(this.route.queryParams, {
    initialValue: this.route.snapshot.queryParams,
  });
  readonly href = computed(() =>
    this.router
      .createUrlTree([], {
        relativeTo: this.route,
        queryParams: this.queryParams(),
        fragment: this.appSectionLink(),
      })
      .toString(),
  );
}
