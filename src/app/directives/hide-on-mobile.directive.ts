import { Directive, ElementRef, OnInit, OnDestroy, Input } from '@angular/core';
import { BreakpointService } from '../services/breakpoint.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHideOnMobile]'
})
export class HideOnMobileDirective implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(
    private elementRef: ElementRef,
    private breakpointService: BreakpointService
  ) {}

  ngOnInit() {
    this.subscription = this.breakpointService.isMdOrLarger$.subscribe(isMdOrLarger => {
      if (isMdOrLarger) {
        this.elementRef.nativeElement.style.display = '';
      } else {
        this.elementRef.nativeElement.style.display = 'none';
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
